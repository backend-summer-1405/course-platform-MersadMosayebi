import { body ,param} from "express-validator";

const email_Validation = () => body("email")
    .isString().withMessage("email must be a string")
    .trim()
    .isEmail().withMessage("email isn't valid")
    .toLowerCase();

const phone_Validation = () => body("phoneNumber")
    .isString().withMessage("phoneNumber must be a string")
    .trim()
    .isMobilePhone("any").withMessage("phoneNumber isn't valid");

const password_Validation = (min: number) => body("password")
    .isString().withMessage("password must be a string")
    .isLength({ min }).withMessage(`password must contain at least ${min} characters`)

const body_Validation = () => body().isObject({ strict: true }).withMessage("request body must be an object")    

const Id_Validate = [
     param("id")
     .isUUID()
]


const adminRole_Validation = [
      body_Validation()
      .custom((value) => (value.email !== undefined) !== (value.phoneNumber !== undefined))
        .withMessage("provide exactly one of email or phoneNumber"),
    email_Validation().optional(),
    phone_Validation().optional(),
]



export default{
     Id_Validate,
     adminRole_Validation,
    };
