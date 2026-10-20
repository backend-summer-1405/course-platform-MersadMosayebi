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

const optCode_Validation = (min:number)=> body("otpCode")
.isString().isLength({min}).withMessage(`code must contain at least ${min} characters`)

const body_Validation = () => body().isObject({ strict: true }).withMessage("request body must be an object")
    
const register_Validation = [
     body_Validation()
        .custom((value) => Boolean(value?.email || value?.phoneNumber))
        .withMessage("At least one of email or phoneNumber must be provided"),
    email_Validation().optional(),
    phone_Validation().optional(),
    password_Validation(8),

    /*
    .custom((value) => (value.email !== undefined) !== (value.phoneNumber !== undefined))
        .withMessage("provide exactly one of email or phoneNumber"), 
    */
];



const login_Validation = [
    body_Validation()
        .custom((value) => (value.email !== undefined) !== (value.phoneNumber !== undefined))
        .withMessage("provide exactly one of email or phoneNumber"),
    email_Validation().optional(),
    phone_Validation().optional(),
    password_Validation(1),
];

const step1_forgetPassword_Validation = [
    body_Validation()
        .custom((value) => (value.email !== undefined) !== (value.phoneNumber !== undefined))
        .withMessage("provide exactly one of email or phoneNumber"),
     email_Validation().optional(),
     phone_Validation().optional()
]

const step2_resetPassword_Validation = [
    body_Validation()
        .custom((value) => (value.email !== undefined) !== (value.phoneNumber !== undefined))
        .withMessage("provide exactly one of email or phoneNumber"),
     email_Validation().optional(),
     phone_Validation().optional(),
     optCode_Validation(6),
     password_Validation(8),
]

const refreshToken_Validation = [
    body_Validation()
    ,body("refreshToken")
    .isString().withMessage("refreshToken isn't valid")
]

const linkeAccount_Validation = [
     body_Validation()
     ,body("targetPersonId")
     .isUUID().withMessage("targetPersonId isn't valid")
     
]

const switchAccount_Validation = [
    body_Validation(),
    body("targetPersonId")
     .isUUID().withMessage("targetPersonId isn't valid"),
    body("switchToken")
     .isString().withMessage("switchToken isn't valid"), 


]

const Id_Validate = [
     param("id")
     .isUUID()
]

const IdBody_Validate = [
     body_Validation(),
     body("accountId")
     .isUUID().withMessage("id isnt valid")
]

export default{
     register_Validation,
      login_Validation,
      Id_Validate ,
      IdBody_Validate,
      refreshToken_Validation,
      
      step1_forgetPassword_Validation,
      step2_resetPassword_Validation,

      linkeAccount_Validation,
      switchAccount_Validation,
    };
