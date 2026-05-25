const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

// send otp
exports.sendOTP = async(req,res) =>{
    try{
        // fetch email
        const {email} =  req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        // if user already exist then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered"
            })
        }
        // generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated: ", otp)

        // Check unique otp or not
        const result = await OTP.findOne({otp: otp});

        while(result){
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        const result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email , otp};
        // Shorthand syntax is used: { email, otp } is equivalent to { email: email, otp: otp }

        // create an entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response 
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            OTP:otp,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}

// Signup
exports.signup = async (req, res)=>{
    try{
        // Fetch data from request body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // Validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        // Password matching
        if(password !== confirmPassword){
           return res.status(400).json({
            success:false,
            message:"Password and confirm password does not match , please try again"
           })
        } 

        // check user alaready exist or not 
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered"
            });
        }
        // Find most recent otp stored for the user
        const recentotp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("recentotp" , recentotp);

        // Validate otp
        if(recentotp.length === 0){
            // OTP not found
            return res.status(400).json({
                success:false,
                message:"OTP Not Found or Expired"
            })
        }
        else if(otp != recentotp[0].otp){
            return res.status(400).json({
                success:false,
                message:"Invailed OTP"
            })
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password,10);

        // entry create in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        });

        const user = await User.create({
           firstName,
           lastName,
           email,
           contactNumber,
           password:hashedPassword,
           accountType,
           additionalDetails:profileDetails._id,
           image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        // return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User can not be registered , Please try again"
        })
    }
}

// Login

exports.login = async(req, res) =>{
    try{
        // deta fetch
        const{email , password} = req.body;
        // Validation of email and password 
        if(!email || !password){
            return res.status(401).json({
                success:false,
                message:"Please fill all the details carefully"
            });
        }
        //check for registered user 
        /// Important line
        const user = await User.findOne({email}).populate("additionalDetails");
        //findOne() returns a Promise.
        //await is used to wait for the database to respond before moving to the next line.

        // If not a registered user
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered"
            });
        }
        // varify password and generate a jwt token 
        if(await bcrypt.compare(password, user.password)){

            const jwtPayload = {
                email:user.email,
                id:user.id,
                accountType:user.accountType,
            }
            // When password is matched
            let token = jwt.sign(jwtPayload,
                                 process.env.JWT_SECRET,
                                 {expiresIn:"2h"}
            );
            user.token = token;
            user.password = undefined; // both will locally stored and password will not be shown in frontend if you want to acces with user.password to enhance security
            
            const options = {
                expires : new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }

            // create cookie 
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"User logged in successfully"
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Incorrect Password"
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login faliure, please try again"
        });
    }
}

/// Change Password

exports.changePassword = async(req,res) => {
    try{
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id);

                                                            //req.user.id
                                                            //This usually comes from decoded JWT in a protected route.
                                                            //Example:
                                                            //const decoded = jwt.verify(token, process.env.JWT_SECRET);
                                                            //req.user = decoded;   // decoded contains { id, email }
                                                            //So req.user.id = the user’s MongoDB _id stored in the JWT payload
        // get old password , new password and confirm new password from request.body
        const {oldPassword, newPassword} = req.body;

        // validate old password
        const isPasswordMatch = await bcrypt.compare(oldPassword , userDetails.password)
        
        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                message: "The password is incorrect"
            })
        }

        // Update password 
        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUserDetails = await User.findByIdAndUpdate(
                                                                req.user.id,
                                                                {password: encryptedPassword},
                                                                {new: true}
        )
                                                                  //If you set { new: true }, it will return the updated document after the update.

        // Send notification email
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated ",
                    updatedUserDetails.email
                    `password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            
            console.log("Email sent successfully", emailResponse.response)
        }
        catch(error){
            console.log("Error occured while sending email : " , error)
            return res.status(500).json({
                success:false,
                message:"Error occured while sending email",
                error:error.message
            })
        }
        // Return success response
        return res.status(200).json({
            success:true,
            message:"Password updated successfully"
        });
    }
    catch(error){
        console.error("Error occured while updating password : ", error);
        return res.status(500).json({
            success:false,
            message:"Error occured while updating password ",
            error: error.message
        })
    }
}