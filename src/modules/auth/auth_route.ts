import express from "express";
import { validate } from "../../middleware/error_middleware.ts";
import auth_validation from "./auth_validation.ts";
import auth_Controller from "./auth_controller.ts";

import { authenticate_access, authenticate_temp } from "../../middleware/authenticate.ts";

import { authorize } from "../../middleware/authorize.ts";


const auth_route = express.Router();


auth_route.post("/register", ...validate(auth_validation.register_Validation), auth_Controller.user_Register);
auth_route.post("/login", ...validate(auth_validation.login_Validation), auth_Controller.user_Login);
auth_route.post("/selectAccount",authenticate_temp,...validate(auth_validation.IdBody_Validate), auth_Controller.selectAccount);
auth_route.post("/refreshToken",authenticate_access,auth_Controller.refreshToken);

auth_route.post("/step1_forgetPassword",...validate(auth_validation.step1_forgetPassword_Validation),auth_Controller.step1_forgetPassword);
auth_route.post("/step2_resetPassword",...validate(auth_validation.step2_resetPassword_Validation),auth_Controller.step2_resetPassword);





export {
    auth_route
}
