import { asyncHandler } from "../middlewares/asyncHandler.js";
import { Feedback } from "../models/feedback.js";

export const createFeedback = asyncHandler(async (req, res) => {
    const { projectId, rating, comment, type } = req.body;
    const userId = req.user._id;

    if (!projectId || !rating || !comment) {
        return res.status(400).json({
            success: false,
            message: "Please provide Project ID, Rating, and Comment."
        });
    }

    const newFeedback = await Feedback.create({
        project: projectId,
        user: userId,
        rating: Number(rating),
        comment,
        type: type || "general"
    });

    const populatedFeedback = await Feedback.findById(newFeedback._id)
        .populate("user", "name role");

    res.status(201).json({
        success: true,
        data: populatedFeedback
    });
});

export const getProjectFeedback = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project ID is required."
        });
    }

    const feedbacks = await Feedback.find({ project: projectId })
        .populate("user", "name role")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: feedbacks
    });
});