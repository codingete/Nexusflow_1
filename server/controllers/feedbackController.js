import { asyncHandler } from "../middlewares/asyncHandler.js";
import { Feedback } from "../models/feedback.js";
import { Project } from "../models/project.js";

// Only the project's student, its supervisor, or an admin may see or add to
// a project's feedback.
const canAccessProject = async (projectId, user) => {
    const project = await Project.findById(projectId).select("student supervisor").lean();
    if (!project) return false;
    const id = user._id.toString();
    return (
        user.role === "Admin" ||
        project.student?.toString() === id ||
        project.supervisor?.toString() === id
    );
};

export const createFeedback = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId || req.body.projectId;
    const { rating, comment, type } = req.body;
    const userId = req.user._id;

    if (!projectId || !rating || !comment) {
        return res.status(400).json({
            success: false,
            message: "Please provide Project ID, Rating, and Comment."
        });
    }

    if (!(await canAccessProject(projectId, req.user))) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to leave feedback on this project."
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

    if (!(await canAccessProject(projectId, req.user))) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to view feedback for this project."
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