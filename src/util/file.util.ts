import multer from "multer";
import path from "path";

class imageUploader{
    private folderAddress: string;

 constructor(folderAddress:string){
 this.folderAddress = folderAddress
 }

 diskStorage = multer.diskStorage({

    destination: (req,file,cb)=> cb(null,`src/uploads/${this.folderAddress}/`),

    filename: (req,file,cb)=>{
    const ext= path.extname(file.originalname);
    const uniqueName = Date.now();
    cb(null,uniqueName + ext);
    },
});

}

const userImageUpload = new imageUploader("user/profileImage");
const userResumeUpload = new imageUploader("user/resume");

const courseImageUpload = new imageUploader("course");

const userImage_Uploader = multer({storage : userImageUpload.diskStorage});
const courseImage_Uploader = multer({storage : courseImageUpload.diskStorage});
const userResume_Uploader = multer({storage : userResumeUpload.diskStorage});



export {courseImage_Uploader,userImage_Uploader,userResume_Uploader};