import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";


import "dotenv/config";

const ZARINPAL_BASE = process.env.ZARINPAL_BASE;
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;

type ItemType = "Course" | "Podcast"


//zarinpal gateway

 const buyWithGateway = async (req: Request, res: Response) => {
  const { itemId, itemType } = req.body;
  const personId = req.user?.personId;

  if(typeof personId !== "string"){
    return;
  }

  const thePurchase = await prisma.purchase.findFirst({
    where:{buyerId:personId,OR:[{courseId:itemId},{podcastId:itemId}]}
  })
  if(thePurchase){
    custom_Error("product bought by this user",409);
    return;
  }

  let amount: number = 0;
  let courseTitle:string | undefined;
  let podcastTitle:string | undefined;
  let courseId: string | undefined;
  let podcastId: string | undefined;

  if (itemType === "Course") {
    const course = await prisma.course.findUnique({ where: { id: itemId,isPublished:true } });
    if (!course) return custom_Error("course not found or course not published yet", 404);
    courseTitle = course.title;
    amount = course.price;
    courseId = course.id;
  } else if (itemType === "Podcast") {
    // const podcast = await prisma.podcast.findUnique({ where: { id: itemId } });
    // if (!podcast) return custom_Error("podcast not found", 404);
    // podcastTitle = podcast.title;
    // amount = podcast.price;
    // podcastId = podcast.id;
  } else {
     custom_Error("invalid itemType", 400);
     return;
  }


  // ۱. payment Pending
  const payment = await prisma.payment.create({
    data: {
      personId: personId,
      amount,
      purpose: "Course", // or Podcast
      status: "Pending",
      courseId,
      podcastId
      // metadata: { itemId, itemType }, // verify zarinPal
    },
  });

  // ۲. Request to zarinpal
  const response = await fetch(
  `${ZARINPAL_BASE}/pg/v4/payment/request.json`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      merchant_id:ZARINPAL_MERCHANT_ID,
      amount,
      callback_url: `${process.env.BASE_URL}/wallet/payment/verify`,
      description: `خرید ${itemType}: ${itemType === "Course" ? courseTitle : podcastTitle}`,
       metadata: { personId}
    }),
  }
);

const data = await response.json();

console.log("response zarinpal",response);

if (!response.ok || data.data?.code !== 100) {
  custom_Error(data.errors?.message || "connecting to gateway failed", 500);
  return;
}

const authority = data.data.authority;

  // ۳. saving authority
  await prisma.payment.update({
    where: { id: payment.id },
    data: { authority: authority},
  });

  response_Handler({
    statusCode:200,
    message:"payment pending",
    data:{
        paymentUrl: `${ZARINPAL_BASE}/pg/StartPay/${data.data.authority}`
    },
    res
  });
};

//
 const settlePayment = async (paymentId:string) => {

  return await prisma.$transaction(async (tx) => {
    
    //get payment
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment){
      custom_Error("payment not found",404)
      return;
    };

    if (payment.status !== "Success") {
      custom_Error("payment is not successful yet",400);
      return;
    }



    // teacher
    let teacherId: string | undefined;

    if (payment.purpose === "Course" && payment.courseId) {

      const course = await tx.course.findUnique({
        where: { id: payment.courseId },
      });
      if (!course) throw new Error("course not found");
      teacherId = course.teacherId ? course.teacherId : undefined ;

    } else if (payment.purpose === "Podcast" && payment.podcastId) {

      // const podcast = await tx.podcast.findUnique({
      //   where: { id: payment.podcastId },
      // });
      // if (!podcast) throw new Error("podcast not found");
      // teacherId = podcast.teacherId;
      
    } else {
     custom_Error("invalid payment purpose",400);
     return;
    }

   
    const financialAdmin = await tx.person.findFirst({
      where: { adminProfile:{isFinance:true} },
    });

    if (!financialAdmin) {
      custom_Error("financial admin not found",404);
      return;
    }

    // calculating teacher and platform share
    const amount = payment.amount;
    const platformShare = amount * 0.2;
    const teacherShare = amount - platformShare;

    // create purchase
    const purchase = await tx.purchase.create({
      data: {
        buyerId: payment.personId,
        courseId: payment.courseId,
        podcastId: payment.podcastId,
        price: amount,
        teacherShare,
        platformShare,
      },
    });

    // deposit to the teacherWallet
    const teacherWallet = await tx.wallet.update({
      where: { personId: teacherId },
      data: { balance: { increment: Number(teacherShare) } },
    });

    if(!teacherWallet){
       custom_Error("teacherProfile doesnt exist, no teacherWallet",404);
       return;
    }
         await tx.walletTransaction.create({
           data: {
             walletId: teacherWallet.id,
             amount: teacherShare,
             type: "Deposit",
             balanceAfter: teacherWallet.balance + Number(teacherShare) ,
             description: `سهم فروش ${payment.purpose === "Course" ? "دوره" : "پادکست"} - خرید #${purchase.id}`,
           },
         });
     
         // deposit to the finance adminWallet
         const adminWallet = await tx.wallet.update({
           where: { personId: financialAdmin.id },
           data: { balance: { increment: Number(platformShare) } },
           
         });
       
     
         await tx.walletTransaction.create({
           data: {
             walletId: adminWallet.id,
             amount: platformShare,
             type: "Deposit",
              balanceAfter: adminWallet.balance + Number(platformShare) ,
             description: `سهم پلتفرم از خرید #${purchase.id}`,
           },
          });
        

    return purchase;
  });
};
//

const verifyPayment = async (req: Request, res: Response) => {
  const { Authority, Status } = req.query;

  const payment = await prisma.payment.findUnique({
    where: { authority: Authority as string },
  });

  if (!payment) {
    custom_Error("payment not found",404);
    return;
  }

  if (Status !== "OK") {
    
   const thePay = await prisma.payment.update({
      where: { authority: Authority as string },
      data: { status: "Failed" },
    });
    // return res.redirect("http://localhost:3001/payment/failed"); 

  
     response_Handler({
    statusCode:500,
    message:"payment failed",
    data:{thePay},
    res
  })

  }

  const response = await fetch(`${ZARINPAL_BASE}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: Number(payment.amount),
      authority: Authority,
    }),
  });

  const data = await response.json();

  console.log("data",data);

  //success payment
  if (data.data?.code === 100 || data.data?.code === 101) {
  
    const paymentProcess = await prisma.$transaction(async (tx) => {

      const pay = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "Success",
          refId: String(data.data.ref_id),
          cardPan: data.data.card_pan,
          // courseId:payment.courseId,
          // podcastId:payment.podcastId
        },
      });

      return pay;
    });

    await settlePayment(payment.id);

    // return res.redirect("http://localhost:3001/payment/success");

    response_Handler({
      statusCode:200,
      message:"payment done successfully",
      data:{payment:paymentProcess},
      res
    })
  }

  // verify failed
  const thepayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "Failed" },
  });

  response_Handler({
    statusCode:500,
    message:"payment failed",
    data:{thepayment},
    res
  })
};






const getAllPayment = async(req:Request,res:Response)=>{

   const payments = await prisma.payment.findMany({})

   const serialized = payments.map((p) => ({
    ...p,
    amount: p.amount.toString(),
  }));

   response_Handler({
    statusCode:200,
    message:"payment list",
    data:{serialized},
    res
   })
}

export default {
  getAllPayment ,
    buyWithGateway,
    verifyPayment
}