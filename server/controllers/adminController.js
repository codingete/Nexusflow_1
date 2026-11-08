import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { Notification } from "../models/notification.js";
import * as userServices from "../services/userServices.js";
import * as notificationServices from "../services/notificationServices.js";

const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const parseExpertise = (expertise) =>
  Array.isArray(expertise)
    ? expertise
    : typeof expertise === "string" && expertise.trim() !== ""
    ? expertise.split(",").map((s) => s.trim())
    : [];


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
  // Only profile fields are editable here; passwords must go through the
  // hashing save hook, and roles/assignments have their own flows.
  const updatedData = pick(req.body, ["name", "email", "department"]);

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

  // Remove everything that only makes sense with this student around.
  await Promise.all([
    User.updateMany({ assignedStudents: id }, { $pull: { assignedStudents: id } }),
    Project.deleteMany({ student: id }),
    SupervisorRequest.deleteMany({ student: id }),
    Notification.deleteMany({ user: id }),
  ]);
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
    expertise: parseExpertise(expertise),
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
  const updatedData = pick(req.body, ["name", "email", "department", "maxStudents"]);
  if (req.body.expertise !== undefined) {
    updatedData.expertise = parseExpertise(req.body.expertise);
  }

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

  // Students and projects go back to "unassigned" rather than pointing at a
  // teacher who no longer exists.
  await Promise.all([
    User.updateMany({ supervisor: id }, { supervisor: null }),
    Project.updateMany({ supervisor: id }, { supervisor: null }),
    SupervisorRequest.deleteMany({ supervisor: id }),
    Notification.deleteMany({ user: id }),
  ]);
  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});


// Lets an admin give a student or teacher a new password (e.g. a forgotten
// one, or the first login). Goes through save() so the password is hashed.
export const setUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters", 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (!["Student", "Teacher"].includes(user.role)) {
    return next(new ErrorHandler("Only student and teacher passwords can be set here", 400));
  }

  user.password = password;
  await user.save();

  await notificationServices.notifyUser(
    user._id,
    "Your password was changed by an administrator.",
    "system",
    null,
    "high"
  );

  res.status(200).json({
    success: true,
    message: `Password updated for ${user.name}`,
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

 
  await notificationServices.notifyUser(
    studentId,
    `You have been assigned a supervisor ${supervisor.name}.`,
    "approval",
    "/students/status",
    "low"
  );

  await notificationServices.notifyUser(
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

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [totalStudents, totalTeachers, totalProjects, pendingRequests, projectStatusStats] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments(),
    SupervisorRequest.countDocuments({ status: "pending" }),
    Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const countFor = (status) => projectStatusStats.find((s) => s._id === status)?.count || 0;
  const pendingProjects = countFor("pending");
  const activeProjects = countFor("approved");

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingProjects,
        pendingRequests,
        activeProjects,
        projectStatusStats,
      },
    },
  });
});