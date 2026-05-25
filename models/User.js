const mongoose=require("mongoose");
// const { resetPasswordToken } = require("../controllers/ResetPassword");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,      
    },
    email:{
        type:String,
        required:true,
        trim:true, 
    },
    contactNumber:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        },
    accountType:{
        type:String,
        enum:["Farmer","Buyer","Expert"],
        required:true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        default : null,
    },
    image:{
        type:String,
         default: "", 
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
});

module.exports=mongoose.model("user",userSchema);