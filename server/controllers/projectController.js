import { Project } from "../models/project.js";
import { User } from "../models/user.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as projectServices from "../services/projectServices.js";
import { uploadFile } from "../utils/cloudinary.js";

export const createProject = asyncHandler(async (req, res, next) => {
  const { title, description, repositoryUrl } = req.body;
  const studentId = req.user._id;

  const existingProject = await projectServices.getProjectByStudentId(studentId);
  if (existingProject) {
    return next(new ErrorHandler("You already have a project", 400));
  }

  const project = await projectServices.createProject({
    title,
    description,
    repositoryUrl,
    student: studentId,
  });

  await User.findByIdAndUpdate(studentId, {
    $push: { project: project._id },
  });

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: { project },
  });
});

export const getProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const project = await projectServices.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const isAuthorized =
    req.user.role === "Admin" ||
    project.student._id.toString() === req.user._id.toString() ||
    project.supervisor?._id.toString() === req.user._id.toString();

  if (!isAuthorized) {
    return next(new ErrorHandler("Not authorized to view this project", 403));
  }

  res.status(200).json({
    success: true,
    data: { project },
  });
});

export const getAllProjects = asyncHandler(async (req, res, next) => {
  const filters = req.query;
  const projects = await projectServices.getAllProjects(filters);

  res.status(200).json({
    success: true,
    data: {
      count: projects.length,
      projects,
    },
  });
});

export const assignSupervisor = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { supervisorId } = req.body;

  const project = await projectServices.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const supervisor = await User.findById(supervisorId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor", 400));
  }

  const updatedProject = await projectServices.updateProject(projectId, {
    supervisor: supervisorId,
    status: "ongoing",
  });

  await User.findByIdAndUpdate(supervisorId, {
    $addToSet: { supervisedProjects: projectId },
  });

  res.status(200).json({
    success: true,
    message: "Supervisor assigned successfully",
    data: { project: updatedProject },
  });
});

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "ongoing", "completed", "rejected"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }

  const project = await projectServices.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const isAuthorized =
    req.user.role === "Admin" ||
    project.supervisor?._id.toString() === req.user._id.toString();

  if (!isAuthorized) {
    return next(new ErrorHandler("Not authorized to update project status", 403));
  }

  const updatedProject = await projectServices.updateProject(projectId, {
    status,
  });

  res.status(200).json({
    success: true,
    message: "Project status updated",
    data: { project: updatedProject },
  });
});

export const fetchDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId });
  if (!project) {
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalFiles: 0,
          totalFeedback: 0,
          projectStatus: "pending",
          lastUpdated: null,
        },
      },
    });
  }

  const stats = {
    totalFiles: project.files?.length || 0,
    totalFeedback: project.feedback?.length || 0,
    projectStatus: project.status,
    lastUpdated: project.updatedAt,
  };

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { title, message, type } = req.body;

  const project = await projectServices.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (
    req.user.role !== "Admin" &&
    project.supervisor?._id.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorHandler("Not authorized to add feedback to this project", 403));
  }

  const feedbackData = {
    title,
    message,
    type,
    supervisorId: req.user._id,
  };

  const updatedProject = await projectServices.addFeedback(projectId, feedbackData);

  res.status(200).json({
    success: true,
    message: "Feedback added successfully",
    data: { project: updatedProject },
  });
});