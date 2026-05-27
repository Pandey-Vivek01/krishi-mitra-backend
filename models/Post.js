const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    images: [{ type: String }],          // Cloudinary URLs
    crop_tags: [{ type: String }],       // ["wheat", "rice"]
    language: {
        type: String,
        enum: ["hi", "en", "bn", "pa"],
        default: "en",
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    savedBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);