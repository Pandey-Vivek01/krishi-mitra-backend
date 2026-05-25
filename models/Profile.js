const mongoose=require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
        type: String,
    },
    about: {
        type: String,
        trim: true,
    },

    // Location — sabke liye important (especially farmers)
    state: { type: String },
    district: { type: String },
    village: { type: String },

    // Farmer specific
    landSize: { type: String },        // kitni zameen hai
    primaryCrops: [{ type: String }],  // kaunsi fasal ugata hai

    // Expert specific
    expertise: [{ type: String }],     // ["wheat", "rice"]
    experience_years: { type: Number },
    verified: { type: Boolean, default: false }, // admin verify karega

    // Buyer specific
    businessName: { type: String },
    businessType: { type: String },    // retailer, wholesaler, etc.
});

module.exports=mongoose.model("Profile",profileSchema);