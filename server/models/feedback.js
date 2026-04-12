import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["general", "feature", "bug"],
        default: "general"
    }
}, { timestamps: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);