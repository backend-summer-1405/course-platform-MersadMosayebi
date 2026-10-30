import type {NextFunction, Request, Response} from "express";

type statusCode = 200|201|203|204|400|401|403|404|409|500|-51;

interface response_Handler {
    statusCode: statusCode,
    message: string,
    data : object | Array<object>
    res : Response
}

const response_Handler = ({statusCode,message,data,res}:response_Handler)=>{

   return res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: data
  });
}


const custom_Error = (message:string = "internal error",statusCode:number = 500) => {
  
  const newError:any = new Error(message);
  newError.statusCode = statusCode;
  throw newError;
};

export {
    custom_Error,
    response_Handler
};