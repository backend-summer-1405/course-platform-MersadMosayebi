import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";


import "dotenv/config";
import type{ courseCreateRequest, courseFilterRequest, courseInfo, createLessonRequest } from "./course_types.ts";



//user/admin

const getcourseDBbyId = async(req:Request,res:Response)=>{
    const id = req.params.id as string;

    const course = await prisma.course.findFirst({
      where:{
        id
      },
      include:{
        category:true,
        courseImage:true
      }
    })

    if(!course) {
        custom_Error("course not found",404);
        return;
    }

   response_Handler({
    statusCode:200,
    message:"search Result",
    data:{
        course:course
    },
    res
   })
}

const getAllCourses = async (req:courseFilterRequest, res:Response) => {

     const{
       search,
       page=1,
       limit=10,
       sort="price",
       order = "asc",
       minPrice,
       maxPrice,
     } =req.query;
   
     let where:courseInfo = {};
    
     
     if (search) {
      where.title = {
        contains: search,
      };
    }

     if(minPrice || maxPrice){
        
      where.price = {};

      if (minPrice) {
        where.price.gte = Number(minPrice);
      }

      if (maxPrice) {
        where.price.lte = Number(maxPrice);
      }
     }

     let Page = Number(page);
     let Limit = Number(limit);
     const skip = (Page - 1) * Limit;

     const courses = await prisma.course.findMany({
      where,
      skip,
      take:Limit,
      orderBy:{
        [sort]:order === "desc" ? "desc" : "asc"
      },
      include:{
        category:true,
        courseImage:true,
        courseTopic:{
          include:{
            courseLesson:true
          }
        },
      }
     })


     const totalcourse = await prisma.course.count({})
    const totalPage = Math.ceil(totalcourse/Limit);

    response_Handler({
      statusCode:200,
      message:"all course result:",
      data:{
       pagination: {
       currentPage: Page,
       limit:Limit,
       totalcourses : totalcourse,
       totalPage:totalPage,
       },
      count:courses.length,
      data: courses
      },
      res
    });

};


// ///admin

const createCourse = async(req:courseCreateRequest,res:Response)=>{
  
  const {
     title,
     description,
     price,
     categoryId,
     courseTopics
  } =req.body

  const courseCover = req.file;


  if (!req.file) {
       custom_Error("no image uploaded", 400);
       return;
    }
  const personId = req.user?.personId;

  if(!personId){
    custom_Error("not authorized",401);
    return;
  }

  // if(!courseCover){
  //    custom_Error("no courseCover uploaded",400);
  //    return
  // }

  const category = await prisma.categoryCourse.findUnique({
    where: { id: Number(categoryId) },
  });
  if (!category) {
    custom_Error("category not found", 404);
    return;
  }

    const person = await prisma.person.findUnique({
     where: { id: personId,role:"Teacher",teacherProfile:{isActive:true} },
     select: {
        displayName: true,
        teacherProfile:{
            select:{
                id:true
            }
        }
        },
      });

    
  const topics = JSON.parse(courseTopics); 
   
  if (topics.length === 0) {
    custom_Error("courseTopics is required", 400);
    return;
  }

  const baseUrl = process.env.BASE_URL;

  const theCourseCoverUrl = `${baseUrl}/uploads/course/${courseCover.filename}`;

  const newCourse = await prisma.course.create({
    data: {
      title,
      description,
      price: Number(price),
      courseCoverUrl: theCourseCoverUrl,
      
      teacherName:person?.displayName ?? null,
      
      teacherId:   person?.teacherProfile?.id   ?? null,
      
      category: {
        connect: { id: Number(categoryId) },
      },

      courseTopic: {
        create: topics.map((topicName:string) => ({ topicName })),
      },
    },
    include: {
      courseTopic: true,
      category:    true,
    },
  });

response_Handler({
    statusCode:201,
    message:"course created successfully",
    data:{
        course:newCourse
    },
    res
})
    
}



const deleteCourse = async(req:Request,res:Response)=>{
    const id = req.params.id as string;

    const theCourse = await prisma.course.delete({
      where:{id}
    })

    if(!theCourse){
      custom_Error("no course found",404);
      return;
    }

    response_Handler({
      statusCode:200,
      message:"course removed",
      data:{theCourse},
      res
    })
}  


//lesson


const addCourseTopics = async(req:Request,res:Response)=>{

}

const getCourseTopics =async(req:Request,res:Response)=>{
     
  const id = req.params.id as string;

   const topics = await prisma.courseTopic.findMany({
    where:{courseId:id},
    include:{
       courseLesson:true, 
    }
   })

   response_Handler({
    statusCode:200,
    message:"topics result",
    data:{topics},
    res
   })

}

const deleteCourseTopics = async(req:Request,res:Response)=>{

}

const createLesson = async(req:createLessonRequest,res:Response)=>{

  const {
     topicId,
     lessonName,
  }= req.body

  const videoName = req.file;

   if (!req.file) {
       custom_Error("no image uploaded", 400);
       return;
    }

   const id = req.params.id as string ;

   const topicID = Number(topicId);

   if(!Number(topicID)){
    custom_Error("bad requset,topicId must be Intiger",400);
    return;
   }

   const courseTopics = await prisma.courseTopic.findFirst({
      where:{id:topicID,courseId:id}
   })

   if(!courseTopics){
      custom_Error("courseTopics not found",404);
      return;
   }

   const baseUrl = process.env.BASE_URL;

  const videoUrl = `${baseUrl}/uploads/course/lesson/${videoName.filename}`;

   const courseLesson = await prisma.courseLesson.create({
       data:{
          courseTopicId:courseTopics.id,
          lessonName:lessonName,
          videoUrl:videoUrl
       }
      
   })


   response_Handler({
     statusCode:200,
     message:"lesson created successfully",
     data:{courseLesson},
     res
   })



   

}

const deleteLesson = async(req:Request,res:Response)=>{
  
}



export default{
     createCourse,
     createLesson,
     getCourseTopics,

//   addProduct_Category,
//   deleteProduct_Category,
//   editProduct,
//   deleteProduct,
     getAllCourses,
    getcourseDBbyId,
    deleteCourse,

//   getUser_Favorite,
//   deleteProduct_favorite,
//   addProduct_favorite
  
}