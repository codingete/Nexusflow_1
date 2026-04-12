import { Project } from "../models/project.js";
import ErrorHandler from "../middlewares/error.js";

export const addFilesToProject = async (projectId, files) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  const fileMetadata = files.map((file) => ({
    filetype: file.mimetype,
    fileUrl: file.path,
    originalName: file.originalname,
    uploadedAt: new Date(),
  }));

  project.files.push(...fileMetadata);
  await project.save();

  return project;
};

export const deleteFileFromProject = async (projectId, fileId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  project.files = project.files.filter(file => file._id.toString() !== fileId);
  await project.save();

  return project;
};

export const getFilesByProject = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  return project.files;
};