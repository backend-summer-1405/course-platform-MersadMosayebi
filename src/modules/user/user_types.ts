import type { Request } from "express"


export type adminRequest = Request & {
    body:{
        phoneNumber:string,password:string
    }
}