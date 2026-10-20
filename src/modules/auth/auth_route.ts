import express from "express";
import { validate } from "../../middleware/error_middleware.ts";
import auth_validation from "./auth_validation.ts";
import auth_Controller from "./auth_controller.ts";

import { authenticate_access, authenticate_temp } from "../../middleware/authenticate.ts";

import { authorize } from "../../middleware/authorize.ts";


const auth_route = express.Router();

//registerLogin
auth_route.post("/register", ...validate(auth_validation.register_Validation), auth_Controller.register);
auth_route.post("/login", ...validate(auth_validation.login_Validation), auth_Controller.login);

//switchAccount Proceess
auth_route.patch("/switchAccount",authenticate_access,...validate(auth_validation.switchAccount_Validation) 
,auth_Controller.switchAccount);
auth_route.post("/linkAccount",authenticate_access,...validate(auth_validation.linkeAccount_Validation)
,auth_Controller.linkAccount);


//refreshToken
auth_route.post("/refreshToken",...validate(auth_validation.refreshToken_Validation)
,auth_Controller.refreshToken);

//forgetPassword
auth_route.post("/step1_forgetPassword",...validate(auth_validation.step1_forgetPassword_Validation),auth_Controller.step1_forgetPassword);
auth_route.post("/step2_resetPassword",...validate(auth_validation.step2_resetPassword_Validation),auth_Controller.step2_resetPassword);

//for admin
auth_route.get("/getAllLinkAccount",authenticate_access,auth_Controller.getAllLinKAccount);
auth_route.get("/getAllDevice",authenticate_access,auth_Controller.getAllDevice);



export {
    auth_route
}
