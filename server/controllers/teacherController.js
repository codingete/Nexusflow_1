import { asyncHandler } from "../middlewares/asyncHandler.js";
  import * as userServices from "../services/userServices.js";
  import * as projectServices from "../services/projectServices.js";
  import * as requestServices from "../services/requestServices.js";
  import * as notificationServices from "../services/notificationServices.js";
  import { Project } from "../models/project.js";
  import { Notification } from "../models/notification.js";
  import { SupervisorRequest } from "../models/supervisorRequest.js";
  import * as fileServices from "../services/fileServices.js";
  import {sendEmail}from"../services/emailService.js";
  import { generateRequestAcceptTemplate, generateRequestRejectedTemplate} from "../utils/emailTemplates.js"

    export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
    const teacherId = req.user._id;

    const totalPendingRequests = await SupervisorRequest.countDocuments({
      supervisor: teacherId,
      status: "pending",
    });

    const completedProjects = await Project.countDocuments({
      supervisor: teacherId,
      status: "completed",
    });

    const recentNotifications = await Notification.find({
      user: teacherId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const dashboardStats = {
      totalPendingRequests,
      completedProjects,
      recentNotifications,
    };

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched for teacher successfully",
      data: { dashboardStats },
    });
  });

export const getRequests = asyncHandler(async (req, res, next) => {
  const { supervisor } = req.query;

  const filters = {};
  if (supervisor) filters.supervisor = supervisor;

  const {requests,total} = await requestServices.getAllRequests(filters);

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
  message: "Body.json(): Promise<any> fully",
  data: {
    requests: updatedRequests,
    total,
  },
});
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.acceptRequest(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student._id,
    "Your supervisor request has been accepted by ${req.user.name}",
    "approval",
    "/students/status",
    "low"
  );

  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestAcceptTemplate(req.user.name);
await sendEmail({
  to: studentEmail,
  subject: "FYP SYSTEM - ✅ Your Supervisor Request Has Been Accepted ",
  message: message,
});

res.status(200).json({
  success: true,
  message: "Request accepted successfully",
  data: { request },
});
});


export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user.id;

  const request = await requestServices.rejectRequest(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student_id,
    `Your supervisor request has been rejected by ${req.user.name}`,
    "rejection",
    "/students/status",
    "high"
  );

  const student = await User.findById(request.student_id);
  const studentEmail = student.email;
  const message = generateRequestRejectedTemplate(req.user.name);

  await sendEmail({
    to: studentEmail,
    subject: "FYP SYSTEM - ❌ Your Supervisor Request Has Been Rejected",
    message,
  });

res.status(200).json({
  success: true,
  message: "Request rejected",
  data: { request },
});
});













export const assignSupervisor = asyncHandler(async (req, res, next) => {
  const { studentId, supervisorId } = req.body;

  if (!studentId || !supervisorId) {
    return next(
      new ErrorHandler("Student ID and Supervisor ID are required", 400)
    );
  }

  const project = await Project.findOne({ student: studentId });

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor != null) {
    return next(new ErrorHandler("Supervisor already assigned", 400));
  }

  if (project.status !== "approved") {
    return next(
      new ErrorHandler("Project must be approved before assigning a supervisor", 400)
    );
  }

  const { student, supervisor } = await userServices.assignSupervisorDirectly(
    studentId,
    supervisorId
  );

  project.supervisor = supervisor._id;
  await project.save();

  await notificationService.notifyUser(
    studentId,
    `You have been assigned a supervisor ${supervisor.name}.`,
    "approval",
    "/students/status",
    "low"
  );

  await notificationService.notifyUser(
    supervisorId,
    `The student ${student.name} has been officially assigned to you for FYP supervision.`,
    "general",
    "/teachers/status",
    "low"
  );

  res.status(200).json({
    success: true,
    message: "Supervisor assigned successfully",
    data: { student, supervisor },
  });
});

