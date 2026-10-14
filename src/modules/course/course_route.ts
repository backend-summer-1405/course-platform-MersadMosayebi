import express from "express";
// import user_Controller from "./course_controller.ts";
import { validate } from "../../middleware/error_middleware.ts";
// import user_validation from "./course_validation.ts";

import { authenticate_access,authenticate_temp } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";


const course_route = express.Router();


export {
    course_route
}
