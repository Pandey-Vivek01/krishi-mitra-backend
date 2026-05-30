const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,  
        required:true,  
    },
    createdAt:{
        type:Date,
        default:Date.now,// ❌ Date.now() — server start hone ke time ki date fix ho jaati hai , ✅ Date.now — function reference dena chahiye
        expires:50*60, // here 50*60 seconds is the expiration time of otp mongodb will automatically delete this document after that time
    },
 
});

 // a function to send mails 
 async function sendVerificationEmail(email,otp){
    try{
         const mailResponse = await mailSender(
    email,
    "KrishiMitra - OTP Verification",
    `<h2>Aapka OTP hai: <strong>${otp}</strong></h2><p>Yeh OTP 5 minute mein expire ho jayega.</p>`
    );
    }
    catch(error){
               console.log("error occurs while sending mails",error);
               throw error;
    }
 }

  OTPSchema.pre("save",async function(next) {
    console.log("New document saved to database");
    //only send email when a new document is created
    if(this.isNew){
    await sendVerificationEmail(this.email,this.otp);
    }
    next();
  });

module.exports=mongoose.model("OTP",OTPSchema);