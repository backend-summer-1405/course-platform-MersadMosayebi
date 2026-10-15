import {body,param} from "express-validator"


const course_Validation = [
     body("title").notEmpty().isString().withMessage("title required"),
     body("description").notEmpty().isString().withMessage("description required"),
     body("categoryId").notEmpty().isString().withMessage("category required"),
     body("courseTopics").notEmpty().toArray().isArray().withMessage("the field is required"),
     body("price").notEmpty().toInt().isInt().withMessage("the field is required").withMessage("price must be integer"),
     
]


export default{
    course_Validation
}