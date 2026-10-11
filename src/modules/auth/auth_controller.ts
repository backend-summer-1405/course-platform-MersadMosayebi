import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts"

import Hash from "../../util/bcrypt.util.ts";
import OtpCode from "../../util/code.util.ts"
import Token from "../../util/token.util.ts"

import type {
    registerRequest,
    loginRequest,
    step1_ForgetPassword,
    step2_ResetPassword,
  
} from "./auth_types.ts";

import { AccountType, type tokenType, type AuthRequest} from "../../types/model_type.ts"


//authentication

const user_Register = async(req:registerRequest,res:Response)=>{
    const {email,phoneNumber,password} = req.body;


    const existingPerson = await prisma.person.findFirst({
        where: { OR: [{ email }, { phoneNumber }] },
        select: { id: true },
    });

    if (existingPerson) custom_Error("email or phoneNumber is already registered", 409);

    const hashedPassword = await Hash.hash_Password(password);

     const person = await prisma.person.create({
         data: {
             ...(email && { email }),
             ...(phoneNumber && { phoneNumber }),
             password: hashedPassword,
             accounts: {
                 create: {
                     type: "User",
                     userProfile: { create: {} },
                     wallet: { create: {} },
                 },
             },
         },
         omit: { password: true },
         include: { accounts: { include: { userProfile: true, wallet: true } } },
     });

     const account = person.accounts[0];

    const accessRecord = { 
      personId: person.id,
      accountId: account.id,
      role : account.type
     }

    const accessToken = Token.create_accessToken(accessRecord);
     
   response_Handler({statusCode:201,message:"user registered successfully",data:{user:person,accessToken:accessToken},res});

}

const user_Login = async(req:loginRequest,res:Response)=>{
    const {email,phoneNumber,password} = req.body;
    
    const person = await prisma.person.findUnique({
        where: email !== null ? { email } : { phoneNumber: phoneNumber! },
        include: { accounts: { where: {isActive:true} } },
    });

    if (!person || !(await Hash.compare_Password(password, person.password))) {
        return custom_Error("invalid credentials", 401);
    }

    if (person.accounts.length === 0) {
     custom_Error("no active account found", 403);
     return
    }

    if (person.accounts.length === 1) {
    const account = person.accounts[0];

    const accessRecord = { 
      personId: person.id,
      accountId: account.id,
      role : account.type
     }

    const accessToken = Token.create_accessToken(accessRecord);

    response_Handler({ statusCode: 200, message: "login successful", data: {user:accessRecord,accessToken: accessToken }, res });
  }



    const tempRecord = { 
      personId: person.id,
     }

    const token = Token.create_tempToken(tempRecord);
    
      response_Handler({
      statusCode:200,
      message:"login successful",
      data:{
        accounts: person.accounts.map((e) => ({ id: e.id, type: e.type })),
        tempToken:token
      }
      ,res
    });
}

const selectAccount = async(req:AuthRequest,res:Response)=>{
    interface userAccountType{
    accountId:string
    }

    const {accountId} = req.body as userAccountType;
    const user = req.user as tokenType;
    
    const theAccount = await prisma.account.findFirst({
       where: { 
          id: accountId,
          personId: user.personId,
          isActive: true 
        },
    })

    if(!theAccount) {
        custom_Error("no account found ",403);
        return;
    };

     const accessRecord = { 
       personId: user.personId,
       accountId: accountId,
       role: theAccount.type,
     }
    

    const token = Token.create_accessToken(accessRecord);

     response_Handler({
      statusCode: 200,
      message: "Login account successfully",
      data: { 
        account: accessRecord,
        accessToken: token }
     ,res
     });


}

//token

const refreshToken = async(req:AuthRequest,res:Response)=>{

     const user = req.user as tokenType;

     if(!user) custom_Error("token is Expire or inValid",401);

     const accessToken = Token.create_accessToken(user);

     response_Handler({
        statusCode:200,
        message:"login successfully",
        data:{refreshToken:accessToken},
        res
     })

}


//forgetPassword

const step1_forgetPassword = async(req:step1_ForgetPassword,res:Response)=>{

    const {email,phoneNumber} = req.body;

    

    const person = await prisma.person.findFirst({
        where:{
            OR:[{email},{phoneNumber}]
        }
    })

    if(!person) {
        custom_Error("user not found",404);
        return
    }

    const OTPCode = OtpCode.generateCode();

    const Hash_OTPCode = OtpCode.hashCode(OTPCode);

    const code = await prisma.otpCode.create({
        data:{
            personId : person.id,
            otpCode : Hash_OTPCode,
            expiresAt : new Date(Date.now() + 60*20*1000)
        }
    })

    response_Handler({
        statusCode:200,
        message:"code sent",
        data:{
           code:OTPCode
        },
        res
    })

}


const step2_resetPassword = async(req:step2_ResetPassword,res:Response)=>{
     
    const {email,phoneNumber,otpCode,password} = req.body;

   

     const person = await prisma.person.findFirst({
        where:{
            OR:[{email},{phoneNumber}]
        }
    })

    if(!person) {
        custom_Error("user not found",404);
        return
    }

    const Hash_OTPCode = OtpCode.hashCode(otpCode); 
    
    
    const code = await prisma.otpCode.findFirst({
        where:{
            personId:person.id,
            otpCode:Hash_OTPCode
        }
    })

    if(!code) {
        custom_Error("code isnt correct",403);
        return;
    }



    if(code.used == true) custom_Error("code used",403);
    if(code.expiresAt  < new Date()) custom_Error("code is expired",403);

    const new_Password  = await Hash.hash_Password(password);

    const thePerson = await prisma.person.update({
        where:{
            id:person.id
        },
        data:{
            password:new_Password
        },omit:{
            password:true
        }
    })

    const theOTPcode = await prisma.otpCode.delete({
        where:{
            id:code.id
        }
    })

   
   
    response_Handler({
        statusCode:200,
        message:"password reset successfully",
        data:{thePerson},
        res
    })

}




//admin










export default {
    user_Register,
    user_Login,
    selectAccount,
    refreshToken,

    step1_forgetPassword,
    step2_resetPassword,
    
};
