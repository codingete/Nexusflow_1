import { Project } from "../models/project.js";
import ErrorHandler from"../middlewares/error.js";

export const getProjectByStudent = async (studentId) => {
  return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

export const getProjectByStudentId = async (studentId) => {
  return await Project.findOne({ student: studentId })
    .populate("supervisor", "name email")
    .populate("feedback.supervisorId", "name email");
};

export const createProject= async (projectData)=>{
    const project =new Project(projectData);
    await project.save();
    return project;
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate("student", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};

export const updateProject = async (projectId, updateData) => {
  return await Project.findByIdAndUpdate(projectId, updateData, { new: true });
};

export const addFeedback = async (projectId, feedbackData) => {
  return await Project.findByIdAndUpdate(
    projectId,
    { $push: { feedback: feedbackData } },
    { new: true }
  );
};

export const getAllProjects = async (filters) => {
  return await Project.find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
};

export const addFilesToProject = async (projectId, files) => {
  const project = await Project.findById(projectId)

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  const fileMetadata = files.map((file) => ({
    fileType: file.mimetype,
    fileUrl: file.path,
    originalName: file.originalname,
    uploadedAt: new Date(),
  }));

  project.files.push(...fileMetadata);
  await project.save();

  return project;
};
