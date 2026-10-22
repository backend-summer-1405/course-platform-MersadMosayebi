import express from "express";
const course_route = express.Router();
 import course_Controller from "./course_controller.ts";
 import category_controller from "./category_controller.ts";
 import comment_controller from "./comment_controller.ts";
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

//favorite
course_route.get("/favorite/:id",authenticate_access,course_Controller.getFavoriteById);
course_route.post("/favorite/:id",authenticate_access,course_Controller.favoriteCourse);
course_route.delete("/favorite/:id",authenticate_access,course_Controller.deleteFavoriteCourse);

//comment
course_route.get("/:id/comment",comment_controller.getCourseComment);
course_route.post("/:id/comment",authenticate_access,comment_controller.commentCourse);
course_route.post("/likecomment/:id",authenticate_access,comment_controller.likeCommentCourse);
course_route.post("/dislikecomment/:id",authenticate_access,comment_controller.disLikeCommentCourse);

//reply
course_route.post("/comment/:id/reply",authenticate_access,comment_controller.replyCommentCourse);
course_route.post("/likereply/:id",authenticate_access,comment_controller.likeReplyCommentCourse);
course_route.post("/dislikereply/:id",authenticate_access,comment_controller.disLikeReplyCommentCourse);


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
