import { asyncHandler } from '../middlewares/asyncHandler.js';
import ErrorHandler from '../middlewares/error.js';
import {User} from '../models/user.js';
import {Project} from '../models/project.js';
import {Notification} from '../models/notification.js';
import * as userServices from '../services/userServices.js';
import * as projectService from '../services/projectServices.js';
import * as fileServices from '../services/fileServices.js';
import * as requestServices from"../services/requestServices.js";
import * as notificationService from"../services/notificationServices.js";

export const getStudentProject = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const { project } = await projectService.getProjectByStudent(studentId);

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
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);

    if (!project || project.student.toString() !== studentId.toString()) {
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

    const existingProject = await projectService.getProjectByStudent(studentId);

    if (existingProject && existingProject.status != "rejected") {
        return next(
            new ErrorHandler(
                "You already have an active project. You can only submit a new proposal if the previous one was rejected.",
                400
            )
        );
    }

    const projectData = {
        student: studentId,
        title,
        description,
    };
    const project = await projectService.createProject(projectData);

   await User.findByIdAndUpdate(studentId, { project: project._id });

res.status(201).json({
  success: true,
  data: { project },
  message: "Project proposal submitted successfully",
});
});

export const uploadFiles =asyncHandler (async(req,res,next)=>{
    const{projectId}=req.params;
    const studentId=req.user._id;
    const project=await projectService.getProjectById(projectId);

    if (!project || project.student.toString() != studentId.toString()) {
    return next(
        new ErrorHandler("Not authorized to upload files to this project", 403)
    );
}

    if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
}

    const updatedProject = await fileServices.addFilesToProject(
    projectId,
    req.files);
    res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: { project: updatedProject },
});

});

export const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department expertise")
    .lean();

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Available supervisors fetched successfully"
  });
});

export const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department expertise"
  );

  if (!student.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet",
    });
  }

  res.status(200).json({
    success:true,
    data:{supervisor: student.supervisor},
  });
});

export const requestSupervisor = asyncHandler(async (req, res, next) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);
  if (student.supervisor) {
    return next(new ErrorHandler("You already have a supervisor assigned.", 400));
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor selected.", 400));
  }

  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
  return next(
    new ErrorHandler(
      "Selected supervisor has reached maximum student capacity.",
      400
    )
  );
}

const requestData = {
    student:studentId,
    supervisor:teacherId,
    message,
};


const request = await requestService.createRequest(requestData);

await notificationService.notifyUser(
  teacherId,
  `${student.name} has requested ${supervisor.name} to be their supervisor.`,
  "request",
  "/teacher/requests",
  "medium"
);

res.status(201).json({
  success: true,
  data: { request },
  message: "Supervisor request sent successfully"
});
});

export const getMyRequests = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  
  const requests = await requestServices.getRequestsByStudent(studentId);

  res.status(200).json({
    success: true,
    data: { requests },
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name")
    .lean();

  const now = new Date();
 
  const upcomingDeadlines = await Project.find({
    student: studentId,
    deadline: { $gte: now },
  })
    .select("title description")
    .sort({ deadline: 1 })
    .limit(3)
    .lean();

  const topNotifications = await Notification.find({ user: studentId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const feedbackNotifications =
    project?.feedback && project?.feedback.length > 0
      ? project.feedback
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
      : [];

  const supervisorName = project?.supervisor?.name || null;

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      topNotifications,
      feedbackNotifications,
      supervisorName
    }
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const file = project.files.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  if (userRole !== "Admin" && userRole !== "Teacher" && project.student.toString() !== userId.toString()) {
    return next(new ErrorHandler("Not authorized to download this file", 403));
  }

  const filePath = file.fileUrl;

  res.download(filePath, file.originalName, (err) => {
    if (err) {
      console.error("File download error:", err);
      if (!res.headersSent) {
        return next(new ErrorHandler("Error downloading file", 500));
      }
    }
  });
});