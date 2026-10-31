import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import Hash from "../../util/bcrypt.util.ts";

import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";

import * as jalaali from "jalaali-js";

import "dotenv/config";


import type{
     adminRequest,
     teacherFormRequest
} from "./user_types.ts"

import { AccountType} from "../../types/model_type.ts"

//user

const user_Count = async(req:Request,res:Response)=>{
   
  const [totalUser ,user, teacher, author] = await Promise.all([
    prisma.person.count({}),
    prisma.person.count({ where: { role: AccountType.User } }),
    prisma.person.count({ where: { role: AccountType.Teacher } }),
    prisma.person.count({ where: { role: AccountType.Author } }),
  ]);

  response_Handler({
    statusCode: 200,
    message: 'roles count result',
    data: { totalUser:totalUser,user:user, teacher:teacher, author:author},
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
        },omit:{
            password:true
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

const createteacherFormRequest = async(req:teacherFormRequest,res:Response)=>{
     const {
        personId,
        fullName,
        ID_Card,
        birthDate,
        fieldOfwork,
        experienceYears,
        degree,
        AcceptRulesOfWebSite
    } = req.body 

    const resume = req.file;
   
    const person = await prisma.person.findFirst({
        where:{id:personId}
    })

    if(!person){
        custom_Error("user not found",404);
        return;
    }

    if(person.role === AccountType.Teacher){
        custom_Error("user is already Teacher",409);
        return;
     }

    const experienceYear:number = Number(experienceYears);
    const  AcceptRulesOfWebsite:boolean = Boolean(AcceptRulesOfWebSite);

    const [jy, jm, jd] = birthDate.split("/").map(Number);
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);

    

     if(!resume) {
        custom_Error("no resume uploaded",400);
        return;
    }

    const baseUrl = process.env.BASE_URL;

    const resumeUrl = `${baseUrl}/uploads/user/resume/${resume.filename}`;


    const theForm = await prisma.teacherFormRequest.create({
        data:{
            personId,
            fullName,
            ID_Card,
            birthDate:new Date(gy, gm - 1, gd),
            fieldOfwork,
            experienceYears:experienceYear,
            degree,
            AcceptRulesOfWebSite:AcceptRulesOfWebsite,
            resumeUrl : resumeUrl
        }
    })

    response_Handler({
        statusCode:201,
        message:"form created",
        data:{},
        res
    })

}


const getAllTeacherFormRequest = async(req:Request,res:Response)=>{
   
    const Forms = await prisma.teacherFormRequest.findMany({
       
    })

    if(!Forms || Forms.length === 0){
         response_Handler({
        statusCode:200,
        message:"result",
        data:{
           Forms
        },
        res
    })
    }
    
    const PendingForm = Forms.filter(el => el.status === "Pending");
    const ApprovedForm = Forms.filter(el => el.status === "Approved");
    const RejectedForm = Forms.filter(el => el.status === "Rejected");

    response_Handler({
        statusCode:200,
        message:"result",
        data:{
            PendingForm : PendingForm,
            ApprovedForm:ApprovedForm,
            RejectedForm:RejectedForm
        },
        res
    })


    
}

const getTeacherFormRequest_ById = async(req:Request,res:Response)=>{
   const id = req.params.id as string;

    const person = await prisma.person.findFirst({
        where:{id}
    })

    if(!person){
        custom_Error("user not found",404)
        return;
    }

    const Forms = await prisma.teacherFormRequest.findMany({
        where:{personId:id}
    })

    if(!Forms || Forms.length === 0){
        custom_Error("no form found",404);
        return;
    }
    
    const PendingForm = Forms.filter(el => el.status === "Pending");
    const ApprovedForm = Forms.filter(el => el.status === "Approved");
    const RejectedForm = Forms.filter(el => el.status === "Rejected");

    response_Handler({
        statusCode:200,
        message:"result",
        data:{
            PendingForm : PendingForm,
            ApprovedForm:ApprovedForm,
            RejectedForm:RejectedForm
        },
        res
    })


}

const role_TeacherProfile = async(req:Request,res:Response)=>{
     const id = req.params.id as string;
     const status = req.body.status as "Approved" | "Rejected";
     const rejectionReason = req.body as string;

     const person = await prisma.person.findUnique({
        where:{
         id,
        }
    })

    if (!status){
        custom_Error("bad request",409);
        return;
    }

    const personForm = await prisma.teacherFormRequest.findFirst({
        where:{personId:id,status:"Pending"},
    })

    if (!person || !personForm) {
         custom_Error("person not found or person wasn't request for become teacher", 403);
         return;
     }

     if(person.role === AccountType.Teacher){
        custom_Error("user is already Teacher",409);
        return;
     }

   
     if(status === "Rejected"){
        
       const theForm = await prisma.teacherFormRequest.updateMany({
          where:{personId:id,status:"Pending"},
        data:{
            status:"Rejected",
            rejectionReason:rejectionReason
        }
      })
       
      response_Handler({
        statusCode:200,
        message:"the form Rejected",
        data:{theForm},
        res
      })

      return;
     }


 
   const result = await prisma.$transaction(async(pr):Promise<object>=>{
    
    await Promise.all([
          pr.adminProfile.updateMany({
            where: { personId:person.id},
            data: { isActive: false },
          }),
          pr.authorProfile.updateMany({
            where: { personId:person.id},
            data: { isActive: false },
          }),
      ]);

      const theForm = await pr.teacherFormRequest.updateMany({
          where:{personId:id},
        data:{
            status:"Approved"
        }
      })

      const teacherProfile = await pr.teacherProfile.upsert({
        where:{personId:person.id},
        update:{isActive:true},
        create:{
            personId:person.id,
            degree:personForm.degree,
            experienceYears:personForm.experienceYears,
            fieldOfwork:personForm.fieldOfwork
        }
      })

       const updatePerson = await pr.person.update({
        where:{id},
        data:{
            role:AccountType.Teacher,
            displayName:personForm.fullName
        },omit:{
            password:true
        },include:{
            teacherProfile:true
        }
      })
     
      return {updatePerson}
     
   }) 
   

    response_Handler({
        statusCode:200,
        message:"user is now Teacher!",
        data:{user:result},
        res
    })
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
            where: { personId:person.id},
            data: { isActive: false },
          }),
          pr.authorProfile.updateMany({
            where: { personId:person.id},
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

const checkedAdminFinance = async(req:Request,res:Response)=>{
    const {adminId} = req.body;
    
    const admin = await prisma.adminProfile.findFirst({
        where:{personId:adminId}
    })


    if(!admin){
        custom_Error("user with adminRole not found",404);
        return;
    }
    console.log(admin);
    if(admin.isFinance === true){
        custom_Error("you are already financeAdmin",409);
        return;
    }

    const financeAdmin = await prisma.adminProfile.findMany({
        where:{isFinance:true}
    })

    console.log(financeAdmin);

    if(financeAdmin.length = 0){
        custom_Error("there is a financeAdmin",403);
        return;
    }

    const checked = await prisma.adminProfile.update({
         where:{id:admin.id},
         data:{
            isFinance:true
         }
    })

    response_Handler({
        statusCode:200,
        message:"admin upgrated to financeAdmin",
        data:{message:"admin upgrated to financeAdmin"},
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
            where: { personId:person.id},
            data: { isActive: false },
          }),
          pr.adminProfile.updateMany({
            where: { personId:person.id},
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
    checkedAdminFinance,
    role_AuthorProfile,
   getAllAdminFormRequest,

   createteacherFormRequest,
   getTeacherFormRequest_ById,
   getAllTeacherFormRequest,
   role_TeacherProfile
    
};
