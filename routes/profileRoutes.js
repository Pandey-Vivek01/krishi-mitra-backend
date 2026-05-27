const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    updateProfileImage,
    deleteAccount,
} = require("../controllers/profileController");

const { auth } = require("../middlewares/auth");

// All routes protected
router.get("/", auth, getProfile);
router.put("/update", auth, updateProfile);
router.put("/update-image", auth, updateProfileImage);
router.delete("/delete", auth, deleteAccount);

module.exports = router;