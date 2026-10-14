import type { Request } from "express"


export type adminRequest = Request & {
    body:{
        phoneNumber:string,password:string
    }
}

export type teacherFormRequest = Request & {
     body:{
        personId:string,
        fullName:string,
        ID_Card:string,
        birthDate:string,
        fieldOfwork : string,
        experienceYears :number,
        degree:string,
        AcceptRulesOfWebSite:boolean
     },
     
}