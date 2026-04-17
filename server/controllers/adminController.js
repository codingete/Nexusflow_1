import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as userServices from "../services/userServices.js";
import * as notificationServices from "../services/notificationServices.js";


export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password || !department) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department: department || "",
    role: "Student",
  });

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = { ...req.body };
  delete updatedData.role; 

  const user = await userServices.updateUser(id, updatedData);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: { user },
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);

  if (!user) {
    throw new ErrorHandler("Student not found", 404);
  }

  if (user.role !== "Student") {
    throw new ErrorHandler("User is not a student", 400);
  }

  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});


export const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, expertise } = req.body;

  if (!name || !email || !password || !department || !maxStudents || !expertise) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    maxStudents,
    expertise: Array.isArray(expertise)
      ? expertise
      : typeof expertise === "string" && expertise.trim() !== ""
      ? expertise.split(",").map((s) => s.trim())
      : [],
    role: "Teacher",
  });

  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = { ...req.body };
  delete updatedData.role; 

  const user = await userServices.updateUser(id, updatedData);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: { user },
  });
});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);

  if (!user) {
    throw new ErrorHandler("Teacher not found", 404);
  }

  if (user.role !== "Teacher") {
    throw new ErrorHandler("User is not a teacher", 400);
  }

  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});


export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userServices.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
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

export const getAllProject = asyncHandler(async (req, res, next) => {

});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [totalStudents, totalTeachers, totalProjects, projectStatusStats] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments(),
    Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const pendingProjects = projectStatusStats.find((s) => s._id === "pending")?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingProjects,
        projectStatusStats,
      },
    },
  });
});