const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Create Post (Expert only)
exports.createPost = async (req, res) => {
    try {
        const { title, content, crop_tags, language } = req.body;
        const images = req.files ? req.files.map(f => f.path) : [];

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const post = await Post.create({
            author: req.user.id,
            title,
            content,
            images,
            crop_tags,
            language: language || "hi",
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create post",
            error: error.message
        });
    }
};

// Get All Posts (with search, filter, pagination)
exports.getAllPosts = async (req, res) => {
    try {
        const { search, crop_tag, language } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (search) filter.title = { $regex: search, $options: "i" };
        if (crop_tag) filter.crop_tags = crop_tag;
        if (language) filter.language = language;

        const posts = await Post.find(filter)
            .populate("author", "firstName lastName image")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalPosts: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            posts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message
        });
    }
};

// Get Single Post
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "firstName lastName image")
            .populate({
                path: "comments",
                populate: { path: "author", select: "firstName lastName image" }
            });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        return res.status(200).json({ success: true, post });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch post",
            error: error.message
        });
    }
};

// Update Post (Expert only — own post)
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        if (post.author.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });

        const { title, content, crop_tags, language } = req.body;
        const updated = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content, crop_tags, language },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post: updated
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update post",
            error: error.message
        });
    }
};

// Delete Post (Expert only — own post)
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        if (post.author.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });

        await Post.findByIdAndDelete(req.params.id);
        // Delete all comments of this post
        await Comment.deleteMany({ post: req.params.id });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete post",
            error: error.message
        });
    }
};

// Like / Unlike Post
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const userId = req.user.id;
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();

        return res.status(200).json({
            success: true,
            message: alreadyLiked ? "Post unliked" : "Post liked",
            totalLikes: post.likes.length
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to toggle like",
            error: error.message
        });
    }
};

// Add Comment
exports.addComment = async (req, res) => {
    try {
        const { content, parentComment } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const comment = await Comment.create({
            post: req.params.id,
            author: req.user.id,
            content,
            parentComment: parentComment || null,
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            success: true,
            message: "Comment added",
            comment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add comment",
            error: error.message
        });
    }
};