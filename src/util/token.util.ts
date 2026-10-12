import jwt from "jsonwebtoken";
import "dotenv/config.js";
import { custom_Error } from "../middleware/response_hanlder.ts";
import crypto from "crypto";


const create_accessToken = (data:object)=>{

 const  JWTsecret = process.env.JWT_ACCESS_SECRET;
 
 if(!JWTsecret) return custom_Error("jwtSecret undefined",500);

 const token = jwt.sign(data,JWTsecret,{expiresIn: "15m"});
  
 return token;
}

const create_tempToken = (data:object)=>{

 const  JWTsecret = process.env.JWT_TEMP_SECRET;
 
 if(!JWTsecret) return custom_Error("jwtSecret undefined",500);

 const token = jwt.sign(data,JWTsecret,{expiresIn: "5m"});
  
 return token;
}

const verify_accessToken = (token:string)=>{

   const  JWTsecret = process.env.JWT_ACCESS_SECRET;
   
   if(!JWTsecret) return custom_Error("jwtSecret undefined",500);

   try{
   const verifyedToken = jwt.verify(token,JWTsecret);

   return verifyedToken

   }catch(error){
      if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return null;
      }
      if (error.name === 'JsonWebTokenError') {
        return null;
      }
    }
      throw error;
   }
 
}

const verify_tempToken = (token:string)=>{

   const  JWTsecret = process.env.JWT_TEMP_SECRET;
   
   if(!JWTsecret) return custom_Error("jwtSecret undefined",500);

   try{
   const verifyedToken = jwt.verify(token,JWTsecret);

   return verifyedToken

   }catch(error){
      if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return null;
      }
      if (error.name === 'JsonWebTokenError') {
        return null;
      }
    }
    throw error; 
   }
 
}

////////

const create_refreshToken = ():string=>{
  return crypto.randomBytes(40).toString('hex')
}

const create_switchToken = ():string=>{
  return crypto.randomBytes(32).toString('hex')
}

const hash_refreshToken =(token: string): string=>{
  return crypto.createHash('sha256').update(token).digest('hex')
}

const tokenExpiry=(): Date=> {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}


export default {
    create_accessToken,
    create_tempToken,
   verify_accessToken,
   verify_tempToken,

   create_refreshToken,
   create_switchToken,
   hash_refreshToken,
   tokenExpiry
}

