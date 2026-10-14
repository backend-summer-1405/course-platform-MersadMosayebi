import type { Request } from "express"
import type { AuthRequest } from "../../types/model_type";


export type registerRequest = Request & {
  body:
    | { password: string; email: string; phoneNumber?: never }
    | { password: string; email?: never; phoneNumber: string };
};


export type loginRequest = Request & {
  body:
    | { password: string; email: string; phoneNumber?: never }
    | { password: string; email?: never; phoneNumber: string };
};

export type step1_ForgetPassword = Request & {
    body:
     | {phoneNumber:string,email:never}
     | {phoneNumber:never,email:string}

}

export type step2_ResetPassword = Request & {
    body:
     | {phoneNumber:string,email:never,otpCode:string,newPassword:string}
     | {phoneNumber:never,email:string,otpCode:string,newPassword:string}

}

export type refreshTokenRequest = Request & {
   body:{
    refreshToken:string
   },
  
}

export type linkAccountRequest = AuthRequest & {
    body:{
      targetPersonId:string
    }
}

export type switchAccountRequest = AuthRequest & {
    body:{
      targetPersonId:string,
       switchToken:string
    }
}




