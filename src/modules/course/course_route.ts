import express from "express";
const course_route = express.Router();
 import course_Controller from "./course_controller.ts";
 import category_controller from "./category_controller.ts";
import { validate } from "../../middleware/error_middleware.ts";
 import course_validation from "./course_validation.ts";

import { authenticate_access,authenticate_temp } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";
import { courseImage_Uploader,courseLessonVideo_Uploader } from "../../util/file.util.ts";


//createCourse
course_route.post("/",authenticate_access,courseImage_Uploader.single("course"),authorize(["Admin","Teacher"]),validate(course_validation.course_Validation)
,course_Controller.createCourse);

//rating

course_route.post("/:id/rate",authenticate_access,course_Controller.rateCourse);

//comment


//lesson and topic part
course_route.get("/:id/topics",course_Controller.getCourseTopics);
course_route.post("/lesson/:id",authenticate_access,authorize(["Admin","Teacher"]),courseLessonVideo_Uploader.single("video"),course_Controller.createLesson);



//category
course_route.get("/getAllcategories",category_controller.getAllCourseCategory);
course_route.post("/category",authenticate_access,authorize(["Admin"]),category_controller.createCategory);


//course
course_route.get("/getAllCourseWithPagination",course_Controller.getAllCourses);
course_route.get("/:id",course_Controller.getcourseDBbyId);
course_route.delete("/:id",authenticate_access,authorize(["Admin","Teacher"]),course_Controller.deleteCourse);








export {
    course_route
}
