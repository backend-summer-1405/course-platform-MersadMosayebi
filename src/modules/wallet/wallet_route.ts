import express from "express";
const wallet_route = express.Router();
 
import { validate } from "../../middleware/error_middleware.ts";
import gateway_controller from "./gateway_controller.ts";

import { authenticate_access,authenticate_temp } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";
import { courseImage_Uploader,courseLessonVideo_Uploader } from "../../util/file.util.ts";

wallet_route.get("/payment",authenticate_access,gateway_controller.getAllPayment);
wallet_route.post("/payment/gateway",authenticate_access,gateway_controller.buyWithGateway);
wallet_route.get("/payment/verify",gateway_controller.verifyPayment);

export {
    wallet_route
}