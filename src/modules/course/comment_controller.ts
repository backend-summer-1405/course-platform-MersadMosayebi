import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";

import "dotenv/config";

const getCourseComment = async(req:Request,res:Response)=>{

  const courseId = req.params.id as string;

  const comments = await prisma.commentCourse.findMany({
    where:{courseId},
    include:{
      replies:true,
      person:{select:{displayName:true,profileImage:true}}
    }
  })

  response_Handler({
    statusCode:200,
    message:"course comments:",
    data:{comments},
    res
  })

}

const commentCourse = async(req:Request,res:Response)=>{
    const courseId = req.params.id as string;
    const personId = req.user?.personId;
    const {comment} = req.body;

    if(typeof personId !== "string"){
      return;
    }

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


//likeDislikeLogic
const toBooleanReaction=(type: "Like" | "DisLike" | null)=> {
  return {
    isLiked: type === "Like",
    isDisliked: type === "DisLike",
  };
}

 const setReactionComment =async(commentId:number,personId:string,type:"Like" | "DisLike")=>{
 
  return prisma.$transaction(async (pr) => {
    const existing = await pr.likeCommentCourse.findUnique({
      where: { commentId_personId: { commentId, personId } },
    });

    let finalType : "Like" | "DisLike" | null;

    if (existing && existing.type === type) {
     
      await pr.likeCommentCourse.delete({ where: { id: existing.id } });
      finalType = null;
    } else {
      await pr.likeCommentCourse.upsert({
        where: { commentId_personId: { commentId, personId } },
        update: { type },
        create: { commentId, personId, type },
      });

       finalType = type;
    }

    const [like, disLike] = await Promise.all([
      pr.likeCommentCourse.count({ where: { commentId, type: "Like" } }),
      pr.likeCommentCourse.count({ where: { commentId, type: "DisLike" } }),
    ]);

    await pr.commentCourse.update({
      where: { id: commentId },
      data: { like, disLike },
    });

    return { like, disLike, ...toBooleanReaction(finalType) };
  });
 }

  const setReactionReply =async(replyId:number,personId:string,type:"Like" | "DisLike")=>{
 
  return prisma.$transaction(async (pr) => {
    const existing = await pr.likeReplyCommentCourse.findUnique({
      where: { replyId_personId: { replyId, personId } },
    });

    let finalType : "Like" | "DisLike" | null;

    if (existing && existing.type === type) {
     
      await pr.likeReplyCommentCourse.delete({ where: { id: existing.id } });
      finalType = null;
    } else {
      await pr.likeReplyCommentCourse.upsert({
        where: { replyId_personId: { replyId, personId } },
        update: { type },
        create: { replyId, personId, type },
      });

       finalType = type;
    }

    const [like, disLike] = await Promise.all([
      pr.likeReplyCommentCourse.count({ where: { replyId, type: "Like" } }),
      pr.likeReplyCommentCourse.count({ where: { replyId, type: "DisLike" } }),
    ]);

    await pr.replyCourseComment.update({
      where: { id: replyId },
      data: { like, disLike },
    });

    return { like, disLike, ...toBooleanReaction(finalType) };
  });
 }

/////////////////////////////// 

const likeCommentCourse = async(req:Request,res:Response)=>{
    const commentID = req.params.id as string;
  const personId = req.user?.personId
    
  if(typeof personId !== "string"){
    return;
  }

  const commentId = Number(commentID);

  const result = await setReactionComment(commentId, personId, "Like");

  response_Handler({
    statusCode:200,
    message:result.isLiked ? "comment liked" : "comment like removed",
    data:{result},
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
  
  const result = await setReactionComment(commentId, personId, "DisLike");

  response_Handler({
    statusCode:200,
    message: result.isDisliked ? "comment disliked" : "comment dislike removed",
    data:{result},
    res
  })
} 


const replyCommentCourse = async(req:Request,res:Response)=>{
    const commentId = Number(req.params.id) as number;
    const personId = req.user?.personId;
    const {comment} = req.body;

    if(typeof personId !== "string"){
      return;
    }

    // if(typeof comment !== "string" || typeof personId !== "string"){
    //     return;
    // }

    const theReply = await prisma.replyCourseComment.create({
         data:{
            content:comment,
            commentId,
            personId:personId
         }        
    })

    response_Handler({
        statusCode:201,
        message:"the comment is replied",
        data:{theReply},
        res
    })

} 

const likeReplyCommentCourse = async(req:Request,res:Response)=>{
      
      const replyID = req.params.id as string;
      const personId = req.user?.personId
    
  if(typeof personId !== "string"){
    return;
  }

  const replyId = Number(replyID);

  const result = await setReactionReply(replyId, personId, "Like");

  response_Handler({
    statusCode:200,
    message:result.isLiked ? "reply liked" : "reply like removed",
    data:{result},
    res
  })
} 

const disLikeReplyCommentCourse = async(req:Request,res:Response)=>{

  const replyID = req.params.id as string;
      const personId = req.user?.personId
    
  if(typeof personId !== "string"){
    return;
  }

  const replyId = Number(replyID);

  const result = await setReactionReply(replyId, personId, "DisLike");

  response_Handler({
    statusCode:200,
    message:result.isLiked ? "reply disliked" : "reply dislike removed",
    data:{result},
    res
  })
    
} 



export default {
  getCourseComment,
    commentCourse,
    likeCommentCourse,
    disLikeCommentCourse,

  replyCommentCourse,
  likeReplyCommentCourse,
  disLikeReplyCommentCourse  
}