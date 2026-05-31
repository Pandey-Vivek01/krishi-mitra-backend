// auth
// is farmer
// is buyer 
// is expert

const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req, res, next) => {
    try{
        // Extract jwt token
        //PENDING : other ways to fetch token
        const token = req.cookies.token   // cookie se try karo
           || req.body.token             // body se try karo
           || req.headers["authorization"]?.replace("Bearer ", "");
           // header se try karo, "Bearer " hata ke

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token Missing"
            });
        }
        // varify the token
        try{
             const decode =  jwt.verify(token, process.env.JWT_SECRET);
             
             console.log(decode);
             req.user = decode;
             next();                     //Calls the next middleware or controller in the request–response cycle.
                                         //Without next(), the request would stop here and not move forward.
        }
         catch(error){
            return res.status(401).json({
                success:false,
                message:"Token is invailed"
            });
         }

    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while verifying the token "
        });
    }
}

exports.isFarmer = async (req, res, next) =>{
    try{
        if(req.user.accountType !== "Farmer"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for farmers"
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role can not be varified , please try again"
        });
    }
}

exports.isBuyer = async (req, res, next) =>{
    try{
        if(req.user.accountType !== "Buyer"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Buyer"
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role can not be varified , please try again"
        });
    }
}


exports.isExpert = async (req, res, next) =>{
    try{
        if(req.user.accountType !== "Expert"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Expert"
            });
        }
        // Verified check add karo
        // const user = await User.findById(req.user.id);
        // if(!user.additionalDetails.verified){
        //     return res.status(403).json({
        //         success: false,
        //         message: "Your Expert profile is not verified yet"
        //     });
        // }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role can not be varified , please try again"
        });
    }
}