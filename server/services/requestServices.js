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