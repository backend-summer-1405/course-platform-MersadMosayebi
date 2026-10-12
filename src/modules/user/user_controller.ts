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

const getUserProfile = async(req:Request,res:Response)=>{
    const id = req.params.id as string;

    const userProfile = await prisma.person.findFirst({
        where:{id},
        include:{
            teacherProfile:{where:{isActive:true}},
            adminProfile:{where:{isActive:true}},
            authorProfile:{where:{isActive:true}}
        }
    })
    
     response_Handler({
        statusCode:200,
        message:"Form result",
        data:{userProfile},
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


//admin

const adminForm_Request = async(req:Request,res:Response)=>{

    const id = req.params.id as string;
    const {phoneNumber,email} = req.body;

     const person = await prisma.person.findFirst({
        where:{
         AND:[{id},{OR:[{email},{phoneNumber}]}]
        }
    })

    if (!person) {
         custom_Error("person not found", 404);
         return;
     }

     if(person.role === AccountType.Admin){
        custom_Error("you are already admin",409);
        return;
     }

     const existing = await prisma.adminFormRequest.findUnique({
       where: { personId: person.id},
     });
     
     if (existing) {
       custom_Error("you already have request", 409);
       return;
     }
     
     const Form = await prisma.adminFormRequest.create({
        data:{
            personId:person.id,
           ...(phoneNumber && { phoneNumber }),
            ...(email && { email }),
        }
     })


    response_Handler({
        statusCode:200,
        message:"your Request is created",
        data:{message:"after confirmation, you will be admin",Form:Form},
        res
    })
}

const getAllAdminFormRequest = async(req:Request,res:Response)=>{
    
    const form = await prisma.adminFormRequest.findMany({});

    response_Handler({
        statusCode:200,
        message:"Form result",
        data:{form},
        res
    })
}


 const role_AdminProfile = async(req:adminRequest,res:Response)=>{

    const id = req.params.id as string;

     const person = await prisma.person.findUnique({
        where:{
         id,
        }
    })

    const personForm = await prisma.adminFormRequest.findFirst({
        where:{personId:id}
    })

    if (!person || !personForm) {
         custom_Error("person not found or person wasn't request for become admin", 403);
         return;
     }

     if(person.role === AccountType.Admin){
        custom_Error("user is already admin",409);
        return;
     }

   const result = await prisma.$transaction(async(pr):Promise<object>=>{
    
    await Promise.all([
          pr.teacherProfile.updateMany({
            where: { personId:person.id, isActive: true },
            data: { isActive: false },
          }),
          pr.authorProfile.updateMany({
            where: { personId:person.id, isActive: true },
            data: { isActive: false },
          }),
      ]);

      const adminProfile = await pr.adminProfile.upsert({
        where:{personId:person.id},
        update:{isActive:true},
        create:{personId:person.id}
      })

      const Form = await pr.adminFormRequest.delete({
        where:{personId:person.id}
      })

       const updatePerson = await pr.person.update({
        where:{id},
        data:{
            role:AccountType.Admin
        },omit:{
            password:true
        },include:{
            adminProfile:true
        }
      })
     
      return {updatePerson}
     
   }) 
   

    response_Handler({
        statusCode:200,
        message:"your are admin now!",
        data:{user:result},
        res
    })
}

//author

 const role_AuthorProfile = async(req:adminRequest,res:Response)=>{

    const id = req.params.id as string;

     const person = await prisma.person.findUnique({
        where:{
         id,
        }
    })

    if (!person) {
         custom_Error("invalid credentials", 401);
         return;
     }

     if(person.role === AccountType.Author){
        custom_Error("user is already Author",409);
        return;
     }

   const result = await prisma.$transaction(async(pr):Promise<object>=>{
    
    await Promise.all([
          pr.teacherProfile.updateMany({
            where: { personId:person.id, isActive: true },
            data: { isActive: false },
          }),
          pr.adminProfile.updateMany({
            where: { personId:person.id, isActive: true },
            data: { isActive: false },
          }),
      ]);

      const authorProfile = await pr.authorProfile.upsert({
        where:{personId:person.id},
        update:{isActive:true},
        create:{personId:person.id}
      })

       const updatePerson = await pr.person.update({
        where:{id},
        data:{
            role:AccountType.Author
        },omit:{
            password:true
        },include:{
            authorProfile:true
        }
      })
     
      return {updatePerson}
     
   }) 
   

    response_Handler({
        statusCode:200,
        message:"user is author from now!",
        data:{user:result},
        res
    })
}
 




export default {
    user_Count,
   
    getAllUser,
    getUserById,
    getUserProfile,
    delete_user,

    adminForm_Request,
    role_AdminProfile,
    role_AuthorProfile,
   getAllAdminFormRequest
    
};
