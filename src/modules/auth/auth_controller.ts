import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts"

import Hash from "../../util/bcrypt.util.ts";
import OtpCode from "../../util/code.util.ts"
import Token from "../../util/token.util.ts"

import type {
    registerRequest,
    loginRequest,
    step1_ForgetPassword,
    step2_ResetPassword,
    refreshTokenRequest,
    linkAccountRequest,
    switchAccountRequest,
  
} from "./auth_types.ts";

// import { AccountType, type tokenType, type AuthRequest} from "../../types/model_type.ts"



//refreshToken

const refreshToken = async(req:refreshTokenRequest,res:Response)=>{

  const deviceId = req.headers['x-device-id'] as string
  const {refreshToken} = req.body;

  if (!deviceId) {
   custom_Error("deviceId required",400);
   return;
  }

  // if (!refreshToken) {
  //   custom_Error("refreshToken is required",400);
  //   return;
  // }

  const hashedToken = Token.hash_refreshToken(refreshToken)

  const session = await prisma.deviceSession.findFirst({
    where: { deviceId, refreshToken: hashedToken },
    include: { person: true },
  })

  if (!session) {
   custom_Error("Invalid refresh token",400);
   return;
  }

  let expire = session.refreshTokenExpiresAt as Date;

  if (expire < new Date()) {

    await prisma.deviceSession.update({
      where: { id: session.id },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    })
    custom_Error("Refresh token expired, please login again",401);
    return;
  }

  //newRefreshToken
  const newRefreshToken = Token.create_refreshToken();
  const HashedRefreshToken = Token.hash_refreshToken(newRefreshToken);

  await prisma.deviceSession.update({
    where: { id: session.id },
    data: {
      refreshToken: HashedRefreshToken ,
      refreshTokenExpiresAt: Token.tokenExpiry(),
    },
  })

  response_Handler({
    statusCode: 200,
    message: "Token refreshed successfully",
    data: {
      accessToken: Token.create_accessToken({personId:session.personId,role: session.person.role}),
      role: session.person.role,
      refreshToken:  newRefreshToken,
      personId: session.personId,
      },
       res,
  })

}  

//forgetPassword

const step1_forgetPassword = async(req:step1_ForgetPassword,res:Response)=>{

    const {email,phoneNumber} = req.body;

    

    const person = await prisma.person.findFirst({
        where:{
            OR:[{email},{phoneNumber}]
        }
    })

    if(!person) {
        custom_Error("user not found",404);
        return
    }

    const OTPCode = OtpCode.generateCode();

    const Hash_OTPCode = OtpCode.hashCode(OTPCode);

    const code = await prisma.otpCode.create({
        data:{
            personId : person.id,
            otpCode : Hash_OTPCode,
            expiresAt : new Date(Date.now() + 60*20*1000)
        }
    })

    response_Handler({
        statusCode:200,
        message:"code sent",
        data:{
           code:OTPCode
        },
        res
    })

}


const step2_resetPassword = async(req:step2_ResetPassword,res:Response)=>{
     
    const {email,phoneNumber,otpCode,password} = req.body;

   

     const person = await prisma.person.findFirst({
        where:{
            OR:[{email},{phoneNumber}]
        }
    })

    if(!person) {
        custom_Error("user not found",404);
        return
    }

    const Hash_OTPCode = OtpCode.hashCode(otpCode); 
    
    
    const code = await prisma.otpCode.findFirst({
        where:{
            personId:person.id,
            otpCode:Hash_OTPCode
        }
    })

    if(!code) {
        custom_Error("code isnt correct",403);
        return;
    }



    if(code.used == true) custom_Error("code used",403);
    if(code.expiresAt  < new Date()) custom_Error("code is expired",403);

    const new_Password  = await Hash.hash_Password(password);

    const thePerson = await prisma.person.update({
        where:{
            id:person.id
        },
        data:{
            password:new_Password
        },omit:{
            password:true
        }
    })

    const theOTPcode = await prisma.otpCode.delete({
        where:{
            id:code.id
        }
    })

   
   
    response_Handler({
        statusCode:200,
        message:"password reset successfully",
        data:{thePerson},
        res
    })

}


//authentication


const register = async(req: registerRequest, res: Response)=> {

  const { email, phoneNumber, password } = req.body

  const existingPerson = await prisma.person.findFirst({
        where: { OR: [{ email }, { phoneNumber }] },
    });

    if (existingPerson) custom_Error("email or phoneNumber registered before", 409);

    const hashedPassword = await Hash.hash_Password(password);

     const person = await prisma.person.create({
         data: {
           ...(email && { email }),
           ...(phoneNumber && { phoneNumber }),
           password: hashedPassword,
           wallet: { create: { balance: 0 } },
         },
           select: {
           id: true,
           email: true,
           phoneNumber: true,
           role: true 
          }
     });

    response_Handler({
        statusCode:201,
        message:"user register successfully",
        data:{user:person},
        res
    }) 
}

const login =async(req: loginRequest, res: Response)=> {
  const { email, phoneNumber, password} = req.body
  const deviceId = req.headers['x-device-id'] as string;
  if(!deviceId){
     custom_Error("bad request,no devicId provided",400);
     return;
  } 

 const person = await prisma.person.findFirst({
        where: {OR:[{email},{phoneNumber}]},
        
    });

    if (!person || !(await Hash.compare_Password(password, person.password))) {
        return custom_Error("invalid credentials", 401);
    }

    

  const RefreshToken = Token.create_refreshToken()
  const hashedRefreshToken = Token.hash_refreshToken(RefreshToken)

  await prisma.deviceSession.upsert({
    where: { deviceId_personId: { deviceId, personId: person.id } },
    update: {
      refreshToken: hashedRefreshToken,
      refreshTokenExpiresAt: Token.tokenExpiry(),
    },
    create: {
      deviceId,
      personId: person.id,
      refreshToken: hashedRefreshToken,
      refreshTokenExpiresAt: Token.tokenExpiry(),
    },
  })


    response_Handler({
        statusCode:200,
        message:"user Login successfully",
        data:{
             accessToken: Token.create_accessToken({personId:person.id, role:person.role}),
             refreshToken: RefreshToken,
             personId: person.id,
            },
        res
     }) 
}


//switchAccount Process

 const linkAccount = async (req: linkAccountRequest, res: Response) => {
  const { targetPersonId } = req.body;
  const currentPersonId = req.user?.personId;   
  const deviceId = req.headers['x-device-id'] as string;
  
  if(currentPersonId === undefined){
    custom_Error("id isnt valid",400);
    return;
  }
  
  if (currentPersonId === targetPersonId) {
    custom_Error("can't link with same account",409);
  }

  const existingLink = await prisma.linkedAccount.findFirst({
    where: {
      OR: [
        { personId: currentPersonId, linkedId: targetPersonId },
        { personId: targetPersonId, linkedId: currentPersonId },
      ],
    },
  });

  if (existingLink) {
    custom_Error("Accounts already linked",409);
  }


  const deviceSessionA = await prisma.deviceSession.findUnique({
    where: { deviceId_personId: { deviceId, personId: currentPersonId } },
  });

  const deviceSessionB = await prisma.deviceSession.findFirst({
      where: { deviceId, personId: targetPersonId },
    });

  if (!deviceSessionA || !deviceSessionB) {
   custom_Error("Device session not found",404);
   return;
  }
 
  
  const switchTokenA = Token.create_switchToken();
  const switchTokenB = Token.create_switchToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (pr) => {
    //A → B
    const linkAtoB = await pr.linkedAccount.create({
      data: { personId: currentPersonId, linkedId: targetPersonId },
    });

    //B → A
    const linkBtoA = await pr.linkedAccount.create({
      data: { personId: targetPersonId, linkedId: currentPersonId },
    });

    // switchToken A
    await pr.linkedAccountToken.create({
      data: {
        linkedAccountId: linkAtoB.id,
        deviceSessionId: deviceSessionA.id,
        switchToken: Token.hash_refreshToken(switchTokenA),
        switchTokenExpiresAt: expiresAt,
      },
    });

    
     // switchToken B 
      await pr.linkedAccountToken.create({
        data: {
          linkedAccountId: linkBtoA.id,
          deviceSessionId: deviceSessionB.id,
          switchToken: Token.hash_refreshToken(switchTokenB),
          switchTokenExpiresAt: expiresAt,
        },
      });
    
  });

  response_Handler({
    statusCode:201,
    message: 'Accounts linked successfully',
    data:{switchToken: switchTokenA},
    res
  });
};


const switchAccount =async(req: switchAccountRequest, res: Response)=> {
  const currentPersonId = req.user?.personId; 
  const { switchToken, targetPersonId} = req.body;
  const deviceId = req.headers["x-device-id"] as string;
 
   if(currentPersonId === undefined){
    custom_Error("id isnt valid",400);
    return;
  }
  

  if (!switchToken || !targetPersonId || !deviceId) {
     custom_Error("bad request",400);
     return;
  }


  const currentSession = await prisma.deviceSession.findUnique({
    where: { deviceId_personId: { deviceId, personId: currentPersonId } },
  })

  if (!currentSession) {
    custom_Error("there is no linkedAccount in this device",404);
    return;
  }

  
  // LinkedAccount
  let linkedAccount = await prisma.linkedAccount.findUnique({
    where: { personId_linkedId: { personId: currentPersonId, linkedId: targetPersonId } },
    include: { linked: { select: { id: true, role: true } } },
  })

  if (!linkedAccount) {

    linkedAccount = await prisma.linkedAccount.findUnique({
      where: {
        personId_linkedId: { personId: targetPersonId, linkedId: currentPersonId }
      },
      include: { linked: { select: { id: true, role: true } } },
    })

   if (!linkedAccount) {
     custom_Error("theres is no link for this account",404);
     return;
   }
 }

//  console.log(currentSession);

  // LinkedAccountToken for currentPerson deviceSession
  let lat = await prisma.linkedAccountToken.findUnique({
    where: {
      linkedAccountId_deviceSessionId: {
        linkedAccountId: linkedAccount.id,
        deviceSessionId: currentSession.id,
      },
    },
  })

  if (!lat?.switchToken || !lat.switchTokenExpiresAt || lat.switchTokenExpiresAt < new Date()) {
    // console.log({linkAccount:linkedAccount,lat:lat?.switchToken,latexpire:lat?.switchTokenExpiresAt,latbool:(lat?.switchTokenExpiresAt)});
    custom_Error("switchtoken isn't valid or expired",401);
    
    return;
  }

  // console.log(Token.hash_refreshToken(switchToken),lat.switchToken)

  if (Token.hash_refreshToken(switchToken) === lat.switchToken) {
    custom_Error("switchtoken is expired",401);
    return;
  }

  const targetPerson = linkedAccount.linked

  //refreshing refreshToken and switchToken
  const newSwitchToken = Token.create_switchToken();
  const newRefreshToken =  Token.create_refreshToken();
  const HashedRefreshToken = Token.hash_refreshToken(newRefreshToken);

  await prisma.$transaction([

    // new switchToken for their link (linkedAccounts)
    prisma.linkedAccountToken.update({
      where: { id: lat.id },
      data: {
        switchToken: Token.hash_refreshToken(newSwitchToken),
        switchTokenExpiresAt: Token.tokenExpiry(),
      },
    }),
   
    //new refreshToken for targetPerson deviceSession
    prisma.deviceSession.upsert({
      where: { deviceId_personId: { deviceId, personId: targetPerson.id } },
      update: {
        refreshToken: HashedRefreshToken,
        refreshTokenExpiresAt: Token.tokenExpiry(),
      },
      create: {
        deviceId,
        personId: targetPerson.id,
        refreshToken: HashedRefreshToken,
        refreshTokenExpiresAt: Token.tokenExpiry(),
      },
    }),
  ])

    response_Handler({
    statusCode:200,
    message:"account switched successfully",
    data:{
      accessToken: Token.create_accessToken({personId:targetPerson.id, role:targetPerson.role}),
      refreshToken: newRefreshToken,    
      switchToken: newSwitchToken,       
      personId: targetPerson.id,
    },
    res
  })
}



const getAllLinKAccount = async(req:Request,res:Response)=>{

  const linkAccount = await prisma.linkedAccount.findMany({});

  const linkeAccountToken = await prisma.linkedAccountToken.findMany({});

  response_Handler({
    statusCode:200,
    message:"done",
    data:{
      linkeAccount:linkAccount,
      linkeAccountToken:linkeAccountToken
    },
    res
  })
}

const getAllDevice = async(req:Request,res:Response)=>{

  const Device = await prisma.deviceSession.findMany({});


  response_Handler({
    statusCode:200,
    message:"done",
    data:{
      Device
    },
    res
  })
}





export default {
    // user_Register,
    // user_Login,
    // selectAccount,
    refreshToken,

    step1_forgetPassword,
    step2_resetPassword,

    register,
    login,
    linkAccount,
    switchAccount,

    getAllLinKAccount,
    getAllDevice
    
};
