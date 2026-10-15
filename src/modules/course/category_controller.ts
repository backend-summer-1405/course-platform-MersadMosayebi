import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";


import "dotenv/config";
import type{ courseCreateRequest, courseFilterRequest, courseInfo } from "./course_types.ts";




const createCategory = async(req:Request,res:Response)=>{
    
    const name = req.body.name as string;

    if(typeof name !== "string"){
         custom_Error("bad request,name isn't valid",400);
         return;
    }

    const cat = await prisma.categoryCourse.findFirst({
        where:{
            name
        },
        
    })

    if(cat){
         custom_Error("conflict,category exist with this name",409);
         return;
    }

    const data = await prisma.categoryCourse.create({
        data:{name},
        include:{
            courses:true
        }
    })

   response_Handler({
    statusCode:201,
    message:"category created successfully",
    data:{category:data},
    res
   })


}

const getAllCourseCategory = async(req:Request,res:Response)=>{

     const data = await prisma.categoryCourse.findMany({
       
    })

   response_Handler({
    statusCode:200,
    message:"categories result:",
    data:{data},
    res
   })

}


export default {
    createCategory,
    getAllCourseCategory
   
}