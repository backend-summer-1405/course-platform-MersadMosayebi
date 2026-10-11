import express from "express";
import user_Controller from "./user_controller.ts";
import { validate } from "../../middleware/error_middleware.ts";
import user_validation from "./user_validation.ts";

import { authenticate_access,authenticate_temp } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";

import { AccountType } from "../../types/model_type.ts";

const user_route = express.Router();

user_route.get("/",authenticate_access,authorize([AccountType.Admin]),user_Controller.getAllUser);
user_route.get("/userBoard",user_Controller.user_Count);
user_route.get("/:id",...validate(user_validation.Id_Validate),user_Controller.getUserById);


user_route.delete("/delete/:id",...validate(user_validation.Id_Validate),user_Controller.delete_user);

user_route.post("/admin/:id",authenticate_access,...validate(user_validation.Id_Validate),user_Controller.AdminAccount);

export {
    user_route
}
