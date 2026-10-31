import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";


import "dotenv/config";

const ZARINPAL_BASE = process.env.ZARINPAL_BASE;
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;

type ItemType = "Course" | "Podcast"

const MIN_CHARGE = 10000;
const MAX_CHARGE = 500000000;

const chargeWallet = async (req: Request, res: Response) => {
  const personId = req.user?.personId;
  const amount = Number(req.body.amount);

  if (typeof personId !== "string") {
    custom_Error("unauthorized", 401);
    return;
  }

  if (!Number.isInteger(amount) || amount < MIN_CHARGE || amount > MAX_CHARGE) {
    custom_Error(`amount must be an integer between ${MIN_CHARGE} and ${MAX_CHARGE}`, 400);
    return;
  }

  const theWallet = await prisma.wallet.findFirst({ where: { personId } });
  if (!theWallet) {
    custom_Error("user wallet not found", 404);
    return;
  }

  
  const payment = await prisma.payment.create({
    data: {
      personId,
      amount,
      status: "Pending",
      purpose : "Charge"
    },
  });

  const response = await fetch(`${ZARINPAL_BASE}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount,
      callback_url: `${process.env.BASE_URL}/wallet/charge/verify`,
      description: "chargin wallet",
      metadata: { personId },
    }),
  });

  const data = await response.json();

  if (!response.ok || data.data?.code !== 100) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "Failed" },
    });
    custom_Error(data.errors?.message || "connecting to gateway failed", 500);
    return;
  }

  const authority = data.data.authority;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { authority },
  });

  response_Handler({
    statusCode: 200,
    message: "payment pending",
    data: { paymentUrl: `${ZARINPAL_BASE}/pg/StartPay/${authority}` },
    res,
  });
};


const verifyChargeWallet = async (req: Request, res: Response) => {
  const { Authority, Status } = req.query;

  const payment = await prisma.payment.findUnique({
    where: { authority: Authority as string },
  });

  if (!payment) {
    custom_Error("payment not found", 404);
    return;
  }

  if (payment.purpose !== "Charge") {
    custom_Error("this payment is not a wallet charge", 400);
    return;
  }

  if (payment.status === "Success") {
    response_Handler({
      statusCode: 200,
      message: "payment already verified",
      data: { payment: { ...payment, amount: payment.amount.toString() } },
      res,
    });
    return;
  }

  if (Status !== "OK") {
    const thePay = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "Failed" },
    });
    response_Handler({
      statusCode: 400,
      message: "payment failed",
      data: { thePay: { ...thePay, amount: thePay.amount.toString() } },
      res,
    });
    return;
  }

  const response = await fetch(`${ZARINPAL_BASE}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: Number(payment.amount),
      authority: Authority,
    }),
  });

  const data = await response.json();

  if (data.data?.code === 100 || data.data?.code === 101) {
    const result = await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "Success",
          refId: String(data.data.ref_id),
          cardPan: data.data.card_pan,
        },
      });

      const amount = Number(payment.amount);

      const wallet = await tx.wallet.update({
        where: { personId: payment.personId },
        data: { balance: { increment: amount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: "Deposit",
          balanceAfter: wallet.balance, 
          description: `شارژ کیف پول - پرداخت #${pay.id}`,
        },
      });

      return { pay, wallet };
    });

    response_Handler({
      statusCode: 200,
      message: "wallet charged successfully",
      data: {
        payment: { ...result.pay, amount: result.pay.amount.toString() },
        balance: result.wallet.balance,
      },
      res,
    });
    return;
  }

  const failed = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "Failed" },
  });

  response_Handler({
    statusCode: 400,
    message: "payment failed",
    data: { thepayment: { ...failed, amount: failed.amount.toString() } },
    res,
  });
};


const getUserWallet = async(req:Request,res:Response)=>{
    
    const id = req.params.id as string;

    const theWallet = await prisma.wallet.findFirst({
        where:{personId:id}
    })

    response_Handler({
        statusCode:200,
        message:"user wallet result",
        data:{theWallet},
        res
    })
}


const buyWithWallet = async(req:Request,res:Response)=>{
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

  const theWallet = await prisma.wallet.findFirst({
    where:{personId:personId}
  })

  if(!theWallet){
    custom_Error("user wallet not found",404);
    return;
  }

  let amount: number = 0;
  let teacherId:string | undefined;
  let courseTitle:string | undefined;
  let podcastTitle:string | undefined;
  let courseId: string | undefined;
  let podcastId: string | undefined;

  if (itemType === "Course") {
    const course = await prisma.course.findUnique({ where: { id: itemId,isPublished:true } });
    if (!course) return custom_Error("course not found or course not published yet", 404);
    courseTitle = course.title;
    teacherId = course.teacherId as string;
    amount = course.price;
    courseId = course.id;
  } else if (itemType === "Podcast") {
    // const podcast = await prisma.podcast.findUnique({ where: { id: itemId } });
    // if (!podcast) return custom_Error("podcast not found", 404);
    // podcastTitle = podcast.title;
    //teacherId = course.teacherId;
    // amount = podcast.price;
    // podcastId = podcast.id;
  } else {
     custom_Error("invalid itemType", 400);
     return;
  }

  if(amount >= theWallet.balance){
    custom_Error("Insufficient funds",403);
    return;
  }

  const transaction = await prisma.$transaction(async (tx) => {

    

  const financialAdmin = await tx.person.findFirst({
      where: { adminProfile:{isFinance:true} },
    });

    if (!financialAdmin) {
      custom_Error("financial admin not found",404);
      return;
    }

    // calculating teacher and platform share
    const platformShare = amount * 0.2;
    const teacherShare = amount - platformShare;

    // create purchase
    const purchase = await tx.purchase.create({
      data: {
        buyerId: personId,
        courseId: courseId,
        podcastId: podcastId,
        price: amount,
        teacherShare,
        platformShare,
      },
    });

    const theUserWallet = await tx.wallet.update({
      where:{personId : personId},
      data : {balance: {decrement : Number(amount)}}
    })
    
     if(!theUserWallet){
       custom_Error("user wallet not found",404);
       return;
    }
    
    await tx.walletTransaction.create({
           data: {
             walletId: theUserWallet.id,
             amount: amount,
             type: "Purchase",
             balanceAfter: theUserWallet.balance,
             description: `خردید ${itemType === "Course" ? `خرید دوره ${courseId}` : `خرید پادکست ${podcastId}`}`,
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
             description: `سهم فروش ${itemType === "Course" ? "دوره" : "پادکست"} - خرید #${purchase.id}`,
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


  response_Handler({
    statusCode:200,
    message:"purchased done successfully",
    data:{transaction},
    res
  })
}






export default {
    getUserWallet,
    buyWithWallet,
    chargeWallet,
    verifyChargeWallet
  
}