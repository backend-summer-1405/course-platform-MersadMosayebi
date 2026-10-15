import type {request} from "express";


export type courseFilterRequest = Request & {
    query:{
     search:string,
       page:string,
       limit:string,
       sort:string,
       order:"asc" | "desc",
       minPrice:string,
       maxPrice:string,
    }
}

export interface courseInfo {
   
    title?:{
        contains: string;
    },
    price?:{
        gte?:number,
        lte?:number
    },
   
}