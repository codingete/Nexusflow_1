import { Project } from "../models/project.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as projectServices from "../services/projectServices.js";
import * as userServices from "../services/userServices.js";
import * as notificationServices from "../services/notificationServices.js";

const PROJECT_STATUSES = ["pending", "approved", "rejected", "completed"];

const isSupervisor = (project, user) =>
  project.supervisor && project.supervisor._id.toString() === user._id.toString();

export const createProject = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  const existingProject = await projectServices.getProjectByStudentId(studentId);
  if (existingProject && existingProject.status !== "rejected") {
    return next(new ErrorHandler("You already have a project", 400));
  }

  const project = await projectServices.createProject({
    title,
    description,
    student: studentId,
  });

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: { project },
  });
});

export const getProject = asyncHandler(async (req, res, next) => {
  const project = await projectServices.getProjectById(req.params.projectId);

  const isAuthorized =
    req.user.role === "Admin" ||
    project.student._id.toString() === req.user._id.toString() ||
    isSupervisor(project, req.user);

  if (!isAuthorized) {
    return next(new ErrorHandler("Not authorized to view this project", 403));
  }

  res.status(200).json({
    success: true,
    data: { project },
  });
});

export const getAllProjects = asyncHandler(async (req, res, next) => {
  // Only accept known filter keys with plain string values; passing req.query
  // straight to Mongo would allow operator injection (e.g. ?status[$ne]=x).
  const filters = {};
  for (const key of ["status", "supervisor", "student"]) {
    if (typeof req.query[key] === "string") filters[key] = req.query[key];
  }

  // Teachers only see the projects they supervise.
  if (req.user.role === "Teacher") filters.supervisor = req.user._id;

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

  if (project.status !== "approved") {
    return next(
      new ErrorHandler("Project must be approved before assigning a supervisor", 400)
    );
  }
  if (project.supervisor) {
    return next(new ErrorHandler("Supervisor already assigned", 400));
  }

  await userServices.assignSupervisorDirectly(project.student._id, supervisorId);
  const updatedProject = await projectServices.updateProject(projectId, {
    supervisor: supervisorId,
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

  if (!PROJECT_STATUSES.includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }

  const project = await projectServices.getProjectById(projectId);

  if (req.user.role === "Teacher") {
    // Approving or rejecting proposals is the admin's job; a supervisor can
    // only sign a project off as completed.
    if (!isSupervisor(project, req.user)) {
      return next(new ErrorHandler("Not authorized to update project status", 403));
    }
    if (status !== "completed") {
      return next(new ErrorHandler("Supervisors can only mark projects as completed", 403));
    }
  }

  const updatedProject = await projectServices.updateProject(projectId, { status });

  if (status !== project.status) {
    await notificationServices.notifyUser(
      project.student._id,
      `Your project "${project.title}" is now ${status}.`,
      status === "rejected" ? "rejection" : "approval",
      "/student",
      status === "rejected" ? "high" : "medium"
    );
  }

  res.status(200).json({
    success: true,
    message: "Project status updated",
    data: { project: updatedProject },
  });
});

export const fetchDashboardStats = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({ student: req.user._id }).sort({ createdAt: -1 });

  const stats = project
    ? {
        totalFiles: project.files?.length || 0,
        totalFeedback: project.feedback?.length || 0,
        projectStatus: project.status,
        lastUpdated: project.updatedAt,
      }
    : { totalFiles: 0, totalFeedback: 0, projectStatus: "pending", lastUpdated: null };

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { title, message, type } = req.body;

  if (!title || !message) {
    return next(new ErrorHandler("Title and message are required", 400));
  }

  const project = await projectServices.getProjectById(projectId);

  if (req.user.role !== "Admin" && !isSupervisor(project, req.user)) {
    return next(new ErrorHandler("Not authorized to add feedback to this project", 403));
  }

  const updatedProject = await projectServices.addFeedback(projectId, {
    title,
    message,
    type,
    supervisorId: req.user._id,
  });

  await notificationServices.notifyUser(
    project.student._id,
    `${req.user.name} left feedback on your project: "${title}"`,
    "feedback",
    "/student/feedback",
    "medium"
  );

  res.status(200).json({
    success: true,
    message: "Feedback added successfully",
    data: { project: updatedProject },
  });
});
