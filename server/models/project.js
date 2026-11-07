import mongoose from "mongoose";

const projectsSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"]
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  title: {
    type: String,
    required: [true, "Project title is required"],
    trim: true,
    maxlength: [200, "Title cannot be more than 200 characters"],

  },
description: {
    type: String,
    required: [true, "Project description is required"],
},
status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "rejected", "completed"],
},
files: [
    {
        filetype: {
            type: String,
            required: true,
        },
        fileUrl: {
    type: String,
    required: true,
},
originalName: {
    type: String,
    required: true,
},
uploadedAt: {
    type: Date,
    default: Date.now,
},
},
],
feedback: [
    {
    supervisorId:{
        type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},
type: {
  type: String,
  enum: ["positive", "negative", "general"],
  default: "general",
},
title: {
  type: String,
  required: true,
},
message: {
  type: String,
  required: true,
   maxlength: [1000, "Feedback message cannot be more than 1000 characters"],
},
createdAt: {
  type: Date,
  default: Date.now,
},
    },
],
deadline:{
    type:Date,
},

},

{ timestamps:true,}
);

// Indexing for better query performance
projectsSchema.index({ student: 1 });
projectsSchema.index({ supervisor: 1 });
projectsSchema.index({ status: 1 });

export const Project =
  mongoose.models.Project || mongoose.model('Project', projectsSchema);

