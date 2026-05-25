// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signup,
  changePassword,
  sendOTP,
} = require("../controllers/Auth")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)   // important   auth
                                                       //This is a middleware function.
                                                       //Middleware runs before the main controller (changePassword here).
                                                       //The purpose of auth (from your previous code) is to:
                                                      //Verify the user’s JWT token.
                                                      //Decode it to get the user info.
                                                      //Attach that info to req.user.
                                                       //Allow only authenticated users to continue.

// Export the router for use in the main application
module.exports = router