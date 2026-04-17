import { SupervisorRequest } from "../models/supervisorRequest.js";

export const createRequest = async (requestData) => {
  const existingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (existingRequest) {
    throw new Error(
      "You have already sent a request to this supervisor. Please wait for their response."
    );
  }

  const request = await SupervisorRequest.create(requestData);
  return await request.save();
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

export const acceptRequest = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email assignedStudents maxStudents");

  if (!request) throw new Error("Request not found");

  if (request.supervisor._id.toString() !== supervisorId) {
    throw new Error("Not authorized to accept this request");
  }

  if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }

  request.status = "accepted";
  await request.save();

  return request;

};

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.rejectRequest(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been rejected by ${req.user.name}`,
    "rejection",
    "/students/status",
    "high"
  );

  const student = await User.findById(request.student._id);
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