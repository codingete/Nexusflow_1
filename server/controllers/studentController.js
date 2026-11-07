import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { Deadline } from "../models/deadline.js";
import { Notification } from "../models/notification.js";
import * as projectService from "../services/projectServices.js";
import * as fileServices from "../services/fileServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationService from "../services/notificationServices.js";

// Populated refs are documents, so compare ids rather than the refs themselves.
const idOf = (ref) => (ref?._id ?? ref)?.toString();

export const getStudentProject = asyncHandler(async (req, res, next) => {
  const project = await projectService.getProjectByStudentId(req.user._id);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: "No project found for this student",
    });
  }

  res.status(200).json({
    success: true,
    data: { project },
  });
});

export const getProjectById = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const project = await projectService.getProjectById(projectId);

  if (idOf(project.student) !== idOf(req.user._id)) {
    return next(new ErrorHandler("Project not found or unauthorized", 404));
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  if (!title || !description) {
    return next(new ErrorHandler("Title and description are required", 400));
  }

  const existingProject = await projectService.getProjectByStudent(studentId);

  if (existingProject && existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have an active project. You can only submit a new proposal if the previous one was rejected.",
        400
      )
    );
  }

  const project = await projectService.createProject({
    student: studentId,
    title,
    description,
  });

  res.status(201).json({
    success: true,
    data: { project },
    message: "Project proposal submitted successfully",
  });
});

// Runs before multer so nothing is written to disk for someone else's project.
export const ensureOwnProject = asyncHandler(async (req, res, next) => {
  const project = await projectService.getProjectById(req.params.projectId);

  if (idOf(project.student) !== idOf(req.user._id)) {
    return next(
      new ErrorHandler("Not authorized to upload files to this project", 403)
    );
  }

  req.project = project;
  next();
});

export const uploadFiles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const project = req.project;

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  const updatedProject = await fileServices.addFilesToProject(projectId, req.files);

  if (project.supervisor) {
    await notificationService.notifyUser(
      project.supervisor._id,
      `${req.user.name} uploaded ${req.files.length} file(s) to "${project.title}".`,
      "general",
      "/teacher/files",
      "low"
    );
  }

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: { project: updatedProject },
  });
});

export const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department expertise maxStudents assignedStudents")
    .lean();

  res.status(200).json({
    success: true,
    data: {
      supervisors: supervisors.map(({ assignedStudents, ...s }) => ({
        ...s,
        capacityLeft: Math.max((s.maxStudents || 0) - (assignedStudents?.length || 0), 0),
      })),
    },
    message: "Available supervisors fetched successfully",
  });
});

export const getSupervisor = asyncHandler(async (req, res, next) => {
  const student = await User.findById(req.user._id).populate(
    "supervisor",
    "name email department expertise"
  );

  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor || null },
    message: student.supervisor ? undefined : "No supervisor assigned yet",
  });
});

export const requestSupervisor = asyncHandler(async (req, res, next) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  if (!teacherId || !message?.trim()) {
    return next(new ErrorHandler("Supervisor and message are required", 400));
  }

  const student = await User.findById(studentId);
  if (student.supervisor) {
    return next(new ErrorHandler("You already have a supervisor assigned.", 400));
  }

  const project = await projectService.getProjectByStudent(studentId);
  if (!project || project.status === "rejected") {
    return next(
      new ErrorHandler("Submit a project proposal before requesting a supervisor.", 400)
    );
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor selected.", 400));
  }

  if (!supervisor.hasCapacity()) {
    return next(
      new ErrorHandler("Selected supervisor has reached maximum student capacity.", 400)
    );
  }

  const request = await requestServices.createRequest({
    student: studentId,
    supervisor: teacherId,
    message: message.trim(),
  });

  await notificationService.notifyUser(
    teacherId,
    `${student.name} has requested you to be their supervisor.`,
    "request",
    "/teacher/pending-requests",
    "medium"
  );

  res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request sent successfully",
  });
});

export const getMyRequests = asyncHandler(async (req, res, next) => {
  const requests = await requestServices.getRequestsByStudent(req.user._id);

  res.status(200).json({
    success: true,
    data: { requests },
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name email")
    .populate("feedback.supervisorId", "name")
    .lean();

  const [upcomingDeadlines, topNotifications] = await Promise.all([
    project
      ? Deadline.find({ project: project._id, dueDate: { $gte: new Date() } })
          .sort({ dueDate: 1 })
          .limit(3)
          .lean()
      : [],
    Notification.find({ user: studentId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const feedbackNotifications = [...(project?.feedback || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3)
    .map((f) => ({ ...f, supervisorName: f.supervisorId?.name || null }));

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      topNotifications,
      feedbackNotifications,
      supervisorName: project?.supervisor?.name || null,
    },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const { role, _id: userId } = req.user;

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const allowed =
    role === "Admin" ||
    (role === "Teacher" && idOf(project.supervisor) === idOf(userId)) ||
    (role === "Student" && idOf(project.student) === idOf(userId));

  if (!allowed) {
    return next(new ErrorHandler("Not authorized to download this file", 403));
  }

  const file = project.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  res.download(file.fileUrl, file.originalName, (err) => {
    if (err) {
      console.error("File download error:", err);
      if (!res.headersSent) {
        return next(new ErrorHandler("Error downloading file", 500));
      }
    }
  });
});
