const mongoose = require("mongoose");

const qaSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    askedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,                     // Farmer
    },
    answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,                      // Expert — baad mein assign hoga
    },
    answer: {
        type: String,
        default: null,
    },
    crop_tags: [{ type: String }],          // ["wheat", "rice"]
    language: {
        type: String,
        enum: ["hi", "en", "bn", "pa"],
        default: "hi",
    },
    resolved: {
        type: Boolean,
        default: false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
}, { timestamps: true });

module.exports = mongoose.model("QA", qaSchema);