import express from "express";
import type { Request,Response,RequestHandler } from "express";
import {globalError_Middleware} from "./middleware/error_middleware.ts";
import "dotenv/config";
import { user_route } from "./modules/user/user_route.ts";
import {auth_route} from "./modules/auth/auth_route.ts";

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.use("/user",auth_route,user_route);

 
app.get("/",(req:Request,res:Response)=>{

    res.status(200).send("<style>body{background:black} h1{color:red}</style><h1>course platform server is running . . .</h1>");
});

app.use(globalError_Middleware);
app.listen(port,():void=>console.log(`server is running on port:${port}`));



