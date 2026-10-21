import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";

import "dotenv/config";

const commentCourse = async(req:Request,res:Response)=>{
    const courseId = req.params.id as string;
    
    const {comment,personId} = req.body;

    // if(typeof comment !== "string" || typeof personId !== "string"){
    //     return;
    // }

    const theComment = await prisma.commentCourse.create({
         data:{
            content:comment,
            courseId:courseId,
            personId:personId
         }        
    })

    response_Handler({
        statusCode:201,
        message:"comment created",
        data:{theComment},
        res
    })

   
} 

const likeCommentCourse = async(req:Request,res:Response)=>{
    const commentID = req.params.id as string;
  const personId = req.user?.personId
  

   
  if(typeof personId !== "string"){
    return;
  }

  const commentId = Number(commentID);

  await prisma.$transaction(async (pr) => {

    
    const undoLike = await pr.likeCommentCourse.delete({
        where:{commentId_personId:{commentId,personId},type:"Like"},
    })
    
    const likeComment = await pr.likeCommentCourse.upsert({
        where:{commentId_personId:{commentId,personId},type : "DisLike"},
        update:{type:"Like"},
        create:{commentId,personId,type:"Like"}
    })

    
     const [Like,disLike] = await Promise.all([
         pr.likeCommentCourse.count({where:{type:"Like"}}),
         pr.likeCommentCourse.count({where:{type:"DisLike"}})
    ])

    await pr.commentCourse.update({
        where:{id:commentId},
        data:{
            like:Like,
            disLike:disLike
        }
    })
     
    
  });

  response_Handler({
    statusCode:200,
    message:"course Liked",
    data:{},
    res
  })
} 

const disLikeCommentCourse = async(req:Request,res:Response)=>{
    const commentID = req.params.id as string;
  const personId = req.user?.personId
  

   
  if(typeof personId !== "string"){
    return;
  }

  const commentId = Number(commentID);

  await prisma.$transaction(async (pr) => {

    const undoLike = await pr.likeCommentCourse.delete({
        where:{commentId_personId:{commentId,personId},type:"DisLike"},
    })
    
    const likeComment = await pr.likeCommentCourse.upsert({
        where:{commentId_personId:{commentId,personId},type : "Like"},
        update:{type:"DisLike"},
        create:{commentId,personId,type:"DisLike"}
    })
    
     const [Like,disLike] = await Promise.all([
         pr.likeCommentCourse.count({where:{type:"Like"}}),
         pr.likeCommentCourse.count({where:{type:"DisLike"}})
    ])

    await pr.commentCourse.update({
        where:{id:commentId},
        data:{
            like:Like,
            disLike:disLike
        }
    })
     
    
  });

  response_Handler({
    statusCode:200,
    message:"course disLiked",
    data:{},
    res
  })
} 


const replyComment = async(req:Request,res:Response)=>{
    
} 

const likeReplyComment = async(req:Request,res:Response)=>{
    const courseId = req.params.id as string;
  const personId = req.user?.personId
 
  const {rating} = req.body;

  if(typeof personId !== "string"){
    return;
  }

  if(!Number(rating) || Number(rating) <= 0 || Number(rating) > 5){
    return;
  }

  await prisma.$transaction(async (pr) => {
    
    await pr.courseRating.upsert({
      where: { courseId_personId: { personId, courseId } },
      update: { score:rating },
      create: { personId, courseId, score:rating },
    });

    const result = await pr.courseRating.aggregate({
      where: { courseId },
      _avg: { score: true },
      _count: { score: true },
    });

    await pr.course.update({
      where: { id: courseId },
      data: {
         rateAvg: result._avg.score ?? 0,
         rateCount: result._count.score,
      },
    });
  });

  response_Handler({
    statusCode:200,
    message:"",
    data:{},
    res
  })
} 



export default {
    commentCourse,
    likeCommentCourse,
    disLikeCommentCourse
}