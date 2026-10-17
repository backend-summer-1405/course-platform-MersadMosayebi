import type {Request} from "express";

import { AccountType } from "../../types/model_type.ts";
export type courseFilterRequest = Request & {
    query:{
     search?:string,
       page?:string,
       limit?:string,
       sort?:string,
       order?:"asc" | "desc",
       minPrice?:string,
       maxPrice?:string,
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


export type courseCreateRequest = Request & {
      body:{
        title:string,
        description:string ,
        price:number,
        categoryId:string,
        courseTopics:string[]
      };
      file:{
        filename:string
      }
     
}


export type createLessonRequest = Request & {
     body:{
       topicId:string,
       lessonName:string
     };
     file:{
      filename:string
     }
}