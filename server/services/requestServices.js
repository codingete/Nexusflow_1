import { SupervisorRequest } from "../models/supervisorRequest.js";
import { Project } from "../models/project.js";
import ErrorHandler from "../middlewares/error.js";
import { assignSupervisorDirectly } from "./userServices.js";

export const createRequest = async (requestData) => {
  const existingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (existingRequest) {
    throw new ErrorHandler(
      "You have already sent a request to this supervisor. Please wait for their response.",
      400
    );
  }

  return await SupervisorRequest.create(requestData);
};

export const getRequestsByStudent = async (studentId) => {
  return await SupervisorRequest.find({ student: studentId })
    .populate("supervisor", "name email department expertise")
    .sort({ createdAt: -1 })
    .lean();
};

export const getAllRequests = async (filters) => {
  const requests = await SupervisorRequest.find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await SupervisorRequest.countDocuments(filters);

  return { requests, total };
};

// Loads a request and checks it belongs to this supervisor and is still open.
const getPendingRequestFor = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email")
    .populate("supervisor", "name email");

  if (!request) throw new ErrorHandler("Request not found", 404);

  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new ErrorHandler("Not authorized to respond to this request", 403);
  }

  if (request.status !== "pending") {
    throw new ErrorHandler("Request has already been processed", 400);
  }

  return request;
};

// Accepting a request makes the teacher the student's supervisor.
export const acceptRequest = async (requestId, supervisorId) => {
  const request = await getPendingRequestFor(requestId, supervisorId);

  const project = await Project.findOne({ student: request.student._id }).sort({
    createdAt: -1,
  });

  if (!project || project.status !== "approved") {
    throw new ErrorHandler(
      "The student's project must be approved before you can accept this request",
      400
    );
  }

  if (project.supervisor) {
    throw new ErrorHandler("This project already has a supervisor", 400);
  }

  // Links student and teacher, checks capacity, and closes the student's
  // other pending requests.
  await assignSupervisorDirectly(request.student._id, supervisorId);

  project.supervisor = supervisorId;
  await project.save();

  request.status = "accepted";
  await request.save();

  return request;
};

export const rejectRequest = async (requestId, supervisorId) => {
  const request = await getPendingRequestFor(requestId, supervisorId);

  request.status = "rejected";
  await request.save();

  return request;
};
