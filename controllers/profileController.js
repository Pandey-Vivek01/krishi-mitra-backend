const User = require("../models/User");
const Profile = require("../models/Profile");

// Get Own Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("additionalDetails")
            .select("-password -token");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message
        });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const {
            gender,
            dateOfBirth,
            about,
            state,
            district,
            village,
            // Farmer specific
            landSize,
            primaryCrops,
            // Expert specific
            expertise,
            experience_years,
            // Buyer specific
            businessName,
            businessType,
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const updatedProfile = await Profile.findByIdAndUpdate(
            user.additionalDetails,
            {
                gender,
                dateOfBirth,
                about,
                state,
                district,
                village,
                landSize,
                primaryCrops,
                expertise,
                experience_years,
                businessName,
                businessType,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: updatedProfile
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
};

// Update Profile Image
exports.updateProfileImage = async (req, res) => {
    try {
        const imageUrl = req.file?.path;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { image: imageUrl },
            { new: true }
        ).select("-password -token");

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile image",
            error: error.message
        });
    }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Delete profile
        await Profile.findByIdAndDelete(user.additionalDetails);
        // Delete user
        await User.findByIdAndDelete(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete account",
            error: error.message
        });
    }
};