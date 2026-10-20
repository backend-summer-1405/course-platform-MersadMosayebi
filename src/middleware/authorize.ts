import {custom_Error} from "./response_hanlder.ts"
import type { NextFunction,Request,Response } from "express";

import type { AuthRequest,tokenType} from "../types/model_type.ts";

import { AccountType } from "../types/model_type.ts";

const authorize = (roles:AccountType[])=> {
   return (req:Request,res:Response,next:NextFunction)=>{
    
    const user = req.user as tokenType;
    const Role = user.role as AccountType;

    if (!user) {
      custom_Error("Unauthorized", 401);
      return;
    }

    if(roles.length &&  !roles.includes(Role)){
       custom_Error("you dont have premission",401);
    }

    next();

}
}

export {
    authorize
}
   


