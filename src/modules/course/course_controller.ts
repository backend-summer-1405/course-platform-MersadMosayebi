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
        courseImage:true,
        courseTopic:{
          include:{
            courseLesson:true
          }
        },
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

const createCourse = async(req:Request,res:Response)=>{
  
  const {
     title,
     description,
     price,
     categoryId,
     courseTopics
  } =req.body

  const courseCover = req.file as {filename:string};


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

const createLesson = async(req:Request,res:Response)=>{

  const {
     topicId,
     lessonName,
  }= req.body

  const videoName = req.file as {filename:string};

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


//favorite

const favoriteCourse = async(req:Request,res:Response)=>{

  const id = req.params.id as string;

  const courseId = req.body;
  
  // if(!product_id || !user_id) custom_Error("bad request,product or user id isn't valid",400);

  const user = await prisma.person.findFirst({
      where:{
        id
      }
    })

    if(!user) custom_Error("user not found",404);

    const product = await prisma.course.findFirst({
      where:{
        id:courseId
      }
    })
    if(!product) custom_Error("product not found",404);

    const theFavorite = await prisma.favoriteCourse.findFirst({
      where:{
        personId:id,
        courseId:courseId
      }
    })

    if(theFavorite) custom_Error("this product added to favorited",409);

  const favorite = await prisma.favoriteCourse.create({
    data:{
      personId:id,
      courseId:courseId
    },include:{
      course:true
    }
  })

  response_Handler({
    statusCode:200,
    message:"course is favorited",
    data:{favorite},
    res
  });

}

const getFavoriteById =async(req:Request,res:Response)=>{
   
    const id = req.params.id as string;
   
    // if(!id) custom_Error("bad request,id isn't valid",400);

    const user = await prisma.person.findFirst({
      where:{
        id
      }
    })

    if(!user) custom_Error("user not found",404);

    const favorite = await prisma.favoriteCourse.findMany({
      where:{
        personId:id
      },include:{
        course:true
      }
    })

   response_Handler({
    statusCode:200,
    message:"result",
    data:{favorite},
    res
  });
  
}

const deleteFavoriteCourse = async(req:Request,res:Response)=>{

  
     const id = req.params.id as string;
     const courseId = req.body;
  
  // if(!product_id || !user_id) custom_Error("bad request,product or user id isn't valid",400);

  const favorite = await prisma.favoriteCourse.findFirst({
    where:{
      personId:id,
      courseId:courseId
    }
  })

  if(!favorite) {
    custom_Error("the product not in favorite list",409);
    return;
  }

  const theFavorite = await prisma.favoriteCourse.delete({
    where:{
      id:favorite.id
    }
  })

   response_Handler({
    statusCode:200,
    message:"favorite removed",
    data:{theFavorite},
    res
  });

}


//rating

 const rateCourse = async(req:Request,res:Response)=>{

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

  getFavoriteById,
  deleteFavoriteCourse,
  favoriteCourse,

  rateCourse
  
}