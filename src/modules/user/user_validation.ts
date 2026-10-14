import { body ,param} from "express-validator";
import * as jalaali from "jalaali-js";

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


const teacherForm_Validation = [
     body("personId").notEmpty().isUUID().withMessage("personId must be uuid"),
     body("ID_Card").notEmpty().isString().withMessage("ID_Card must be string"),
     body("fullName").notEmpty().isString().contains(" ").withMessage("fullName must be string and firstName and Lastname must be seprated with <space> "),
     body("birthDate").notEmpty().isString()
     .notEmpty().withMessage("the field is required")
     .matches(/^(\d{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/)
     .withMessage("birthDate Format must be as year/month/day (persian calendar)"),
     body("degree").notEmpty().isString().withMessage("the field is required"),
     body("fieldOfwork").notEmpty().isString().withMessage("the field is required"),
     body("experienceYears").notEmpty().toInt().isInt().withMessage("the field is required").withMessage("experienceYears must be integer"),
     body("AcceptRulesOfWebSite").notEmpty().toBoolean().isBoolean().withMessage("the field is required")

     /*
.custom((value) => {
      const [jy, jm, jd] = value.split("/").map(Number);
      if (!jalaali.isValidJalaaliDate(jy, jm, jd)) {
        throw new Error("birthDate Format isn't valid");
      }
      return true;
    }),
*/
     
]

const teacherFormConfirm_Validation = [
     body_Validation(),
     body("status").notEmpty().isString().contains(["Approved","Rejected"]).withMessage("Approved,Rejected"),
     body("rejectionReason").optional().isString()


]


export default{
     Id_Validate,
     adminRole_Validation,
     teacherForm_Validation,
     teacherFormConfirm_Validation
    };
