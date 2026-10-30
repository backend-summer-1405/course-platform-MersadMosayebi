import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";


import "dotenv/config";

const ZARINPAL_BASE = process.env.ZARINPAL_BASE;
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;

type ItemType = "Course" | "Podcast"

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
    buyWithWallet
  
}