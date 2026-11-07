import { User } from "../models/user.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import ErrorHandler from "../middlewares/error.js";

// Errors propagate untouched so the error middleware can turn duplicate-email
// and validation errors into 400 responses.
export const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};


export const updateUser = async (id,updateData) => {
    return await User.findByIdAndUpdate(id,updateData,{
new:true,
runValidators:true,
    }).select("-password");
};

export const getUserById = async (id) => {
return await User.findById(id).select(
    "-password -resetPasswordToken -resetPasswordExpire"
);
};

export const deleteUser = async (id) => {
const user = await User.findById(id);
if (!user) {
    throw new Error("User not found");
}
return await user.deleteOne();
};

export const getAllUsers = async () => {
const query = { role: { $ne: "Admin" } };
const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .sort({ createdAt: -1 });

return users;
};


export const assignSupervisorDirectly = async (studentId, supervisorId) => {
  const student = await User.findOne({ _id: studentId, role: "Student" });
  const supervisor = await User.findOne({ _id: supervisorId, role: "Teacher" });

  if (!student || !supervisor) {
    throw new ErrorHandler("Student or Supervisor not found", 404);
  }
  if (student.supervisor) {
    throw new ErrorHandler("This student already has a supervisor", 400);
  }
  if (!supervisor.hasCapacity()) {
    throw new ErrorHandler(
      `${supervisor.name} has reached the maximum number of students`,
      400
    );
  }

  student.supervisor = supervisorId;
  supervisor.assignedStudents.addToSet(studentId);
  await Promise.all([student.save(), supervisor.save()]);

  // The student is now supervised, so any other open requests are moot.
  await SupervisorRequest.updateMany(
    { student: studentId, status: "pending" },
    { status: "rejected" }
  );

  return { student, supervisor };
};