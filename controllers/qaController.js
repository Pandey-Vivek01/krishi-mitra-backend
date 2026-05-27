const QA = require("../models/QA");

// Ask Question (Farmer only)
exports.askQuestion = async (req, res) => {
    try {
        const { question, crop_tags, language } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const qa = await QA.create({
            question,
            askedBy: req.user.id,
            crop_tags,
            language: language || "hi",
        });

        return res.status(201).json({
            success: true,
            message: "Question asked successfully",
            qa
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to ask question",
            error: error.message
        });
    }
};

// Get All Questions (with filter, pagination)
exports.getAllQuestions = async (req, res) => {
    try {
        const { crop_tag, resolved, language } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (crop_tag) filter.crop_tags = crop_tag;
        if (resolved !== undefined) filter.resolved = resolved === "true";
        if (language) filter.language = language;

        const questions = await QA.find(filter)
            .populate("askedBy", "firstName lastName image")
            .populate("answeredBy", "firstName lastName image")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await QA.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalQuestions: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            questions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
            error: error.message
        });
    }
};

// Get Single Question
exports.getQuestionById = async (req, res) => {
    try {
        const qa = await QA.findById(req.params.id)
            .populate("askedBy", "firstName lastName image")
            .populate("answeredBy", "firstName lastName image");

        if (!qa) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        return res.status(200).json({ success: true, qa });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch question",
            error: error.message
        });
    }
};

// Answer Question (Expert only)
exports.answerQuestion = async (req, res) => {
    try {
        const { answer } = req.body;
        const qa = await QA.findById(req.params.id);

        if (!qa) return res.status(404).json({ success: false, message: "Question not found" });
        if (qa.resolved) return res.status(400).json({ success: false, message: "Question already answered" });

        if (!answer) {
            return res.status(400).json({
                success: false,
                message: "Answer is required"
            });
        }

        const updated = await QA.findByIdAndUpdate(
            req.params.id,
            {
                answer,
                answeredBy: req.user.id,
                resolved: true,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Question answered successfully",
            qa: updated
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to answer question",
            error: error.message
        });
    }
};

// Delete Question (Farmer — own question only)
exports.deleteQuestion = async (req, res) => {
    try {
        const qa = await QA.findById(req.params.id);

        if (!qa) return res.status(404).json({ success: false, message: "Question not found" });
        if (qa.askedBy.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });

        await QA.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete question",
            error: error.message
        });
    }
};

// Like / Unlike Question
exports.toggleLike = async (req, res) => {
    try {
        const qa = await QA.findById(req.params.id);
        if (!qa) return res.status(404).json({ success: false, message: "Question not found" });

        const userId = req.user.id;
        const alreadyLiked = qa.likes.includes(userId);

        if (alreadyLiked) {
            qa.likes.pull(userId);
        } else {
            qa.likes.push(userId);
        }
        await qa.save();

        return res.status(200).json({
            success: true,
            message: alreadyLiked ? "Unliked" : "Liked",
            totalLikes: qa.likes.length
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to toggle like",
            error: error.message
        });
    }
};