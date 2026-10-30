import express from "express";
const wallet_route = express.Router();
 
import { validate } from "../../middleware/error_middleware.ts";
import gateway_controller from "./gateway_controller.ts";
import wallet_controller from "./wallet_controller.ts";

import { authenticate_access,authenticate_temp } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";
import { courseImage_Uploader,courseLessonVideo_Uploader } from "../../util/file.util.ts";


//wallet

wallet_route.post("/payment/walletBalance",authenticate_access,wallet_controller.buyWithWallet);
wallet_route.post("/charge",authenticate_access,wallet_controller.chargeWallet);
wallet_route.get("/charge/verify",wallet_controller.verifyChargeWallet)


//gateway
wallet_route.get("/payment",authenticate_access,gateway_controller.getAllPayment);
wallet_route.get("/purchase",authenticate_access,gateway_controller.getAllPurchase);
wallet_route.get("/transaction",authenticate_access,gateway_controller.getAllTransaction);
wallet_route.post("/payment/gateway",authenticate_access,gateway_controller.buyWithGateway);
wallet_route.get("/payment/verify",gateway_controller.verifyPayment);


wallet_route.get("/:id",authenticate_access,wallet_controller.getUserWallet);

export {
    wallet_route
}