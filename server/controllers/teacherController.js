import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { sendEmail } from "../services/emailService.js";
import {
  generateRequestAcceptTemplate,
  generateRequestRejectedTemplate,
} from "../utils/emailTemplates.js";

// Email is best-effort: a broken SMTP setup must not undo an accept/reject
// that has already been saved.
const sendEmailSafely = async (options) => {
  try {
    await sendEmail(options);
  } catch (error) {
    console.error(`Failed to send email to ${options.to}: ${error.message}`);
  }
};

export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const [totalPendingRequests, completedProjects, recentNotifications] =
    await Promise.all([
      SupervisorRequest.countDocuments({ supervisor: teacherId, status: "pending" }),
      Project.countDocuments({ supervisor: teacherId, status: "completed" }),
      Notification.find({ user: teacherId }).sort({ createdAt: -1 }).limit(5),
    ]);

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched for teacher successfully",
    data: {
      dashboardStats: {
        totalPendingRequests,
        completedProjects,
        recentNotifications,
      },
    },
  });
});

// A teacher only ever sees requests addressed to them.
export const getRequests = asyncHandler(async (req, res, next) => {
  const { requests, total } = await requestServices.getAllRequests({
    supervisor: req.user._id,
  });

  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;

      if (requestObj.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...requestObj, latestProject };
      }

      return requestObj;
    })
  );

  res.status(200).json({
    success: true,
    message: "Requests fetched successfully",
    data: {
      requests: updatedRequests,
      total,
    },
  });
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;

  const request = await requestServices.acceptRequest(requestId, req.user._id);

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been accepted by ${req.user.name}`,
    "approval",
    "/student/supervisor",
    "low"
  );

  await sendEmailSafely({
    to: request.student.email,
    subject: "FYP SYSTEM - ✅ Your Supervisor Request Has Been Accepted",
    message: generateRequestAcceptTemplate(req.user.name),
  });

  res.status(200).json({
    success: true,
    message: "Request accepted successfully",
    data: { request },
  });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;

  const request = await requestServices.rejectRequest(requestId, req.user._id);

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been rejected by ${req.user.name}`,
    "rejection",
    "/student/supervisor",
    "high"
  );

  await sendEmailSafely({
    to: request.student.email,
    subject: "FYP SYSTEM - ❌ Your Supervisor Request Has Been Rejected",
    message: generateRequestRejectedTemplate(req.user.name),
  });

  res.status(200).json({
    success: true,
    message: "Request rejected",
    data: { request },
  });
});

// Projects (with their students) that this teacher supervises.
export const getAssignedStudents = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ supervisor: req.user._id })
    .populate("student", "name email department")
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: { projects },
  });
});

// Every file uploaded to a project this teacher supervises.
export const getTeacherFiles = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ supervisor: req.user._id })
    .populate("student", "name email")
    .lean();

  const files = projects.flatMap((project) =>
    (project.files || []).map((file) => ({
      _id: file._id,
      originalName: file.originalName,
      filetype: file.filetype,
      uploadedAt: file.uploadedAt,
      projectId: project._id,
      projectTitle: project.title,
      student: project.student,
    }))
  );

  files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  res.status(200).json({
    success: true,
    data: { files },
  });
});
