import JWT from "../util/token.util.ts";
import {custom_Error} from "./response_hanlder.ts"
import type { NextFunction,Request,Response } from "express";

import type { AuthRequest,tokenType} from "../types/model_type.ts";


const authenticate_access = (req:AuthRequest,res:Response,next:NextFunction)=>{
    
     let token = req.headers['authorization'];
     token = token?.split(" ")[1];
   
    if(!token) {
      custom_Error("authentication failed,no token provided",401);
      return
    }

    const checkToken = JWT.verify_accessToken(token) as tokenType;
    if(!checkToken) custom_Error("the token is expired or invalid",401);

    req.user = {
         personId:checkToken.personId,
         role:checkToken.role 
    }


    next();

}

const authenticate_temp = (req:AuthRequest,res:Response,next:NextFunction)=>{
    
     let token = req.headers['authorization'];
     token = token?.split(" ")[1];
   
    if(!token) {
      custom_Error("authentication failed,no token provided",401);
      return
    }

    const checkToken = JWT.verify_tempToken(token) as tokenType;
    if(!checkToken) {
       custom_Error("the token is expired or invalid",401);
       return
    };

    req.user = {
         personId:checkToken.personId
    }


    next();

}



export {
    authenticate_access,
    authenticate_temp
};