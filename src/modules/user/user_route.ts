import express from "express";
import user_Controller from "./user_controller.ts";
import { validate } from "../../middleware/error_middleware.ts";
import user_validation from "./user_validation.ts";

import { authenticate_access,authenticate_temp } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";

import { AccountType } from "../../types/model_type.ts";

const user_route = express.Router();

user_route.get("/",user_Controller.getAllUser);
user_route.get("/userBoard",user_Controller.user_Count);

user_route.get("/getAllAdminFormRequest",authorize(["Admin"]),user_Controller.getAllAdminFormRequest);

user_route.get("/profile/:id",user_Controller.getUserProfile);
user_route.get("/:id",...validate(user_validation.Id_Validate),user_Controller.getUserById);
user_route.delete("/delete/:id",...validate(user_validation.Id_Validate),user_Controller.delete_user);


user_route.post("/adminFormRequest/:id",authenticate_access,authorize(["User","Admin","Teacher","Author"]),validate(user_validation.Id_Validate),user_Controller.adminForm_Request);
user_route.post("/roleAdmin/:id",authenticate_access,authorize(["Admin"]),validate(user_validation.adminRole_Validation),user_Controller.role_AdminProfile);
user_route.post("/roleAuthor/:id",authenticate_access,authorize(["Admin"]),...validate(user_validation.Id_Validate),user_Controller.role_AuthorProfile);

export {
    user_route
}
