import {prisma} from "../../util/prisma.util.ts";
import type { Request,Response } from "express";
import {response_Handler,custom_Error} from "../../middleware/response_hanlder.ts";


import "dotenv/config";


//user/admin

// const getProductDBbyId = async(req,res)=>{
//     const {id} = req.params;

//     if(!id) custom_Error("id isn't valid",400);

//     const product = await prisma.product.findFirst({
//       where:{
//         id
//       },
//       include:{
//         categories:true,
//         images:true
//       }
//     })

//     if(!product) custom_Error("product not found",404);

//     res.status(200).json({status:"success",data:product});
// }

// const getAllProducts = async (req, res,next) => {
//    try{
//      const{
//        search,
//        page=1,
//        limit=10,
//        sort="price",
//        order = "asc",
//        minPrice,
//        maxPrice,
//      } =req.query
   
//      let where = {};
    

//      if (search) {
//       where.title = {
//         contains: search,
//       };
//     }

//      if(minPrice || maxPrice){
        
//       where.price = {};

//       if (minPrice) {
//         where.price.gte = Number(minPrice);
//       }

//       if (maxPrice) {
//         where.price.lte = Number(maxPrice);
//       }
//      }

//      let Page = Number(page);
//      let Limit = Number(limit);
//      const skip = (Page - 1) * Limit;

//      const products = await prisma.product.findMany({
//       where,
//       skip,
//       take:Limit,
//       orderBy:{
//         [sort]:order === "desc" ? "desc" : "asc"
//       },
//       include:{
//         images:true,categories:true
//       }
//      })


//      const totalProduct = await prisma.product.count({})
//     const totalPage = Math.ceil(totalProduct/Limit);

//     res.status(200).json({
//       status: "success",

//        pagination: {
//        currentPage: Page,
//        limit:Limit,
//        totalProducts : totalProduct,
//        totalPage:totalPage,
//        },
//       count:products.length,
//       data: products
//     });


//    }catch(error){
//     next(error)
//    }

// };


// ///admin

// const createProduct = async(req,res,next)=>{
//   try{
//   const {
//      title,
//      description ,
//      stock,
//      price,
//      category_ids 
//   } =req.body

//   const product = await prisma.product.findFirst({
//     where:{
//       title
//     }
//   })
//   if(product) custom_Error("conflict,product exist with same title",409);

//   const Data = {
//     title,
//     description,
//     stock,
//     price,
//     ...(category_ids.length !== 0 && {
//     categories: {
//       connect: category_ids.map((id) => ({
//         id: Number(id)
//       }))
//     }
//   })
//   };

//   const data = await prisma.product.create({
//     data:Data,
//     include:{
//       categories:true
//     }
//   })

//   res.status(201).json({status:"success",message:`the product ${title} is created`,data:data});

// }catch(error){
//   next(error)
// }

  

// }

// const addProduct_Category = async(req,res,next)=>{

//     try{
//         const {category_ids,product_id} = req.body;

//         const theproduct = await prisma.product.findFirst({
//           where:{
//             id:product_id
//           }
//         })
//         if(!theproduct) custom_Error("product not found",404);
       
//         const product = await prisma.product.update({
//            where:{
//             id:product_id
//            },
//            data:{
//            categories:{
//            connect:category_ids.map((id)=>({
//              id:Number(id)
//            }))
//            }},
//            include:{
//             categories:true
//            }

//         })

//         res.status(200).json({
//             status:"success",
//             message:"product added to categories",
//             data:product
//         })

//     }catch(error){
//        next(error)
//     }

// }

// const deleteProduct_Category = async(req,res,next)=>{

//     try{
//         const {category_ids,product_id} = req.body;
       
//         const product = await prisma.product.update({
//            where:{
//             id:product_id
//            },
//            data:{
//            categories:{
//            disconnect:category_ids.map((id)=>({
//              id:Number(id)
//            }))
//            }},
//            include:{
//             categories:true
//            }

//         })

//         res.status(200).json({
//             status:"success",
//             message:"product added to categories",
//             data:product
//         })

//     }catch(error){
//        next(error)
//     }

// }


// const editProduct = async(req,res,next)=>{

//   try{
//   const {id} = req.params;
//   const {
//      title,
//      description ,
//      stock,
//      price 
//   } =req.body

//     if(!id) custom_Error("id isn't valid",400);

//     const theProduct = await prisma.product.findFirst({
//       where:{
//         id
//       }
//     })


//     if(!theProduct) custom_Error("product not found",404);

//     const product = await prisma.product.update({
//       where:{
//         id
//       },
//       data:{
//         title,
//         description,
//         price,
//         stock
//       }
//     })

//     res.status(200).json({status:"sucess",message:"the product update successfully",data:product});

//   }catch(error){
//     next(error)
//   }


    
// }

// const deleteProduct = async(req,res)=>{
//     const {id} = req.params;

//     if(!id) custom_Error("id isn't valid",400);

//     const theProduct = await prisma.product.findFirst({
//       where:{
//         id
//       }
//     })

//      if(!theProduct) custom_Error("product not found",404);

//     const product = await prisma.product.delete({
//       where:{
//         id
//       }
//     })

//     res.status(200).json({status:"success",message:"the product is removed",data:product});


// }


// //favorite

// const addProduct_favorite = async(req,res,next)=>{

//   try{
     
//   const {product_id,user_id} = req.params;
  
//   if(!product_id || !user_id) custom_Error("bad request,product or user id isn't valid",400);

//   const user = await prisma.user.findFirst({
//       where:{
//         id:user_id
//       }
//     })

//     if(!user) custom_Error("user not found",404);

//     const product = await prisma.product.findFirst({
//       where:{
//         id:product_id
//       }
//     })
//     if(!product) custom_Error("product not found",404);

//     const theFavorite = await prisma.favorite.findFirst({
//       where:{
//         user_id,
//         product_id
//       }
//     })

//     if(theFavorite) custom_Error("this product added to favorited",409);

//   const favorite = await prisma.favorite.create({
//     data:{
//       user_id,
//       product_id
//     },include:{
//       product:true
//     }
//   })

//   res.status(200).json({status:"success",message:"product be favorite",data:favorite});
// }catch(error){
//   next(error)
// }

// }

// const getUser_Favorite =async(req,res,next)=>{
//    try{
//     const {id} = req.params;
   
//     if(!id) custom_Error("bad request,id isn't valid",400);

//     const user = await prisma.user.findFirst({
//       where:{
//         id
//       }
//     })

//     if(!user) custom_Error("user not found",404);

//     const favorite = await prisma.favorite.findMany({
//       where:{
//         user_id:id
//       },include:{
//         product:true
//       }
//     })

//     res.status(200).json({status:"success",message:"favorite result:",data:favorite})
//    }catch(error){
//     next(error)
//    }
// }

// const deleteProduct_favorite = async(req,res,next)=>{

//   try{
//      const {product_id,user_id} = req.params;
  
//   if(!product_id || !user_id) custom_Error("bad request,product or user id isn't valid",400);

//   const favorite = await prisma.favorite.findFirst({
//     where:{
//       product_id,
//       user_id
//     }
//   })

//   if(!favorite) custom_Error("the product not in favorite list",409);

//   const theFavorite = await prisma.favorite.delete({
//     where:{
//       id:favorite.id
//     }
//   })

//   res.status(200).json({status:"success",message:"favorite removed",data:theFavorite});
// }catch(error){
//   next(error)
// }
// }


export default{
//   createProduct,
//   addProduct_Category,
//   deleteProduct_Category,
//   editProduct,
//   deleteProduct,
//   getAllProducts,
//   getProductDBbyId,

//   getUser_Favorite,
//   deleteProduct_favorite,
//   addProduct_favorite
  
}