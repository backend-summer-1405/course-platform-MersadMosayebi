import express from "express";
import { validate } from "../../middleware/error_middleware.ts";
import auth_validation from "./auth_validation.ts";
import auth_Controller from "./auth_controller.ts";

import { authenticate_access, authenticate_temp } from "../../middleware/authenticate.ts";

import { authorize } from "../../middleware/authorize.ts";


const auth_route = express.Router();

auth_route.get("/getAllLinkAccount/:id",auth_Controller.getAllLinKAccount);
auth_route.get("/getAllDevice/:id",auth_Controller.getAllDevice);

auth_route.post("/register", ...validate(auth_validation.register_Validation), auth_Controller.register);
auth_route.post("/login", ...validate(auth_validation.login_Validation), auth_Controller.login);
auth_route.patch("/switchAccount",authenticate_access, auth_Controller.switchAccount);
auth_route.post("/linkAccount",authenticate_access, auth_Controller.linkAccount);



auth_route.post("/refreshToken",auth_Controller.refreshToken);

auth_route.post("/step1_forgetPassword",...validate(auth_validation.step1_forgetPassword_Validation),auth_Controller.step1_forgetPassword);
auth_route.post("/step2_resetPassword",...validate(auth_validation.step2_resetPassword_Validation),auth_Controller.step2_resetPassword);





export {
    auth_route
}
