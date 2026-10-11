import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import Hash from "../../util/bcrypt.util.ts";

import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts"

import type{
     adminRequest
} from "./user_types.ts"

import { AccountType} from "../../types/model_type.ts"

//user

const user_Count = async(req:Request,res:Response)=>{
   
  const [user, teacher, author] = await Promise.all([
    prisma.person.count({ where: { role: AccountType.User } }),
    prisma.person.count({ where: { role: AccountType.Teacher } }),
    prisma.person.count({ where: { role: AccountType.Author } }),
  ]);

  response_Handler({
    statusCode: 200,
    message: 'roles count result',
    data: { user:user, teacher:teacher, author:author},
    res,
  });

}


const editProfile = async(req:Request,res:Response)=>{
    //
}

const getProfileById = async(req:Request,res:Response)=>{
    
}




//admin

const getAllUser = async(req:Request,res:Response)=>{
 
    const users = await prisma.person.findMany({
        omit:{
            password:true
        }
    });

    if(users.length == 0)  response_Handler({statusCode:200,message:"no user exist in database",data:{user:users},res});

   response_Handler({
    statusCode:200,
     message:"all user found",
     data:users,
     res
    });
  
}

const getUserById = async(req:Request,res:Response)=>{
    
    const id = req.params.id as string;
   
    const person = await prisma.person.findFirst({
        where:{id},
        omit:{
            password:true
        },include:{
           teacherProfile :true,
           authorProfile  : true,
           adminProfile  : true,
           wallet  : true,
           otpCode   : true,
           deviceSessions :true,
           ownedLinks     :true, 
           linkedFrom     :true,
        }
    })

    if(!person) custom_Error("user not found",404);

    response_Handler({
        statusCode:200,
        message:"user found",
        data:{person},
        res
    })
}


const delete_user = async(req:Request,res:Response)=>{
      const id = req.params.id as string;

      const person = await prisma.person.delete({
        where:{
            id
        }
      })

      response_Handler({
        statusCode:200,
        message:"user removed",
        data:{person},
        res
    })
}


// teacher_Form and teacherAccount

const teacherFormRequest = async(req:Request,res:Response)=>{
     
}


const getTeacherFormRequest = async(req:Request,res:Response)=>{

}

const getTeacherFormRequest_ById = async(req:Request,res:Response)=>{

}

const Step1_TeacherFormRequest_confirm = async(req:Request,res:Response)=>{

}

const Step2_activeTeacherAccount = async(req:Request,res:Response)=>{

}

//author
//by admin.

const create_authorAccount = async(req:Request,res:Response)=>{

}

//admin

//  const AdminAccount = async(req:adminRequest,res:Response)=>{

//     const {phoneNumber,password} = req.body
//     const id = req.params.id as string;

//     const person = await prisma.person.findUnique({
//         where:{
//          id,
//          phoneNumber 
//         }
//     })

//    if (!person || !(await Hash.compare_Password(password, person.password))) {
//         return custom_Error("invalid credentials", 401);
//     }

//     const account = await prisma.account.findFirst({
//         where:{
//           AND : [{personId:id},{type:"Admin"}]
//         }
//     })

//     if(account) custom_Error("your admin Account is Active",403);

//     const adminAccount = await prisma.account.create({
//         data:{
//            type:"Admin",
//            personId:id,
//            wallet: {
//               create: {}
//              }
//         }
//     })

//     response_Handler({
//         statusCode:200,
//         message:"your admin account created",
//         data:{adminAccount},
//         res
//     })

    

// }
 


export default {
    user_Count,
   

    getAllUser,
    getUserById,
    delete_user,

    // AdminAccount 
    
};
