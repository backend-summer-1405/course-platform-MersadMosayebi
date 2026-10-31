import express from "express";
import user_Controller from "./user_controller.ts";
import { validate } from "../../middleware/error_middleware.ts";
import user_validation from "./user_validation.ts";

import { authenticate_access,authenticate_temp } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";

import { AccountType } from "../../types/model_type.ts";
import { userResume_Uploader } from "../../util/file.util.ts";

const user_route = express.Router();
//user
user_route.get("/",user_Controller.getAllUser);
user_route.get("/userBoard",user_Controller.user_Count);

//get FormRequest
user_route.get("/getAllAdminFormRequest",authenticate_access,authorize(["Admin"]),user_Controller.getAllAdminFormRequest);
user_route.get("/getAllTeacherFormRequest",authenticate_access,authorize(["Admin"]),user_Controller.getAllTeacherFormRequest);

user_route.get("/teacherFormRequest/:id",authenticate_access,validate(user_validation.Id_Validate),user_Controller.getTeacherFormRequest_ById);

//user
user_route.get("/profile/:id",user_Controller.getUserProfile);
user_route.get("/:id",...validate(user_validation.Id_Validate),user_Controller.getUserById);
user_route.delete("/delete/:id",...validate(user_validation.Id_Validate),user_Controller.delete_user);

//admin role
user_route.post("/adminFormRequest/:id",authenticate_access,authorize(["User","Author"]),validate(user_validation.Id_Validate),user_Controller.adminForm_Request);
user_route.post("/roleAdmin/:id",authenticate_access,authorize(["Admin"]),validate(user_validation.adminRole_Validation),user_Controller.role_AdminProfile);
user_route.post("/Admin/checkedFinance",authenticate_access,authorize(["Admin"]),user_Controller.checkedAdminFinance);
//teacher role
user_route.post("/teacherFormRequest",authenticate_access,authorize(["User","Admin"]),
userResume_Uploader.single("resume"),validate(user_validation.teacherForm_Validation),user_Controller.createteacherFormRequest);
user_route.post("/roleTeacher/:id",authenticate_access,authorize(["Admin"]),validate(user_validation.Id_Validate),user_Controller.role_TeacherProfile);

//author role
user_route.post("/roleAuthor/:id",authenticate_access,authorize(["Admin"]),...validate(user_validation.Id_Validate),user_Controller.role_AuthorProfile);

export {
    user_route
}
