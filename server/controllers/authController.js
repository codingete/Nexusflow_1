import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// There is deliberately no self-registration: only an admin creates accounts
// (see adminController), and the first admin comes from `npm run create-admin`.

const MIN_PASSWORD_LENGTH = 8;

// Login User
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await User.findOne({ email: String(email).toLowerCase(), role }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid email, password or role", 401));
  }

  generateToken(user, 200, "Login successful", res);
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

// Get Current User
export const getUser = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Change the logged-in user's own password.
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("New password and confirm password do not match", 400));
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return next(
      new ErrorHandler(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400)
    );
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new ErrorHandler("Current password is incorrect", 400));
  }
  if (await user.comparePassword(newPassword)) {
    return next(new ErrorHandler("New password must be different from the current one", 400));
  }

  user.password = newPassword; // hashed by the model's save hook
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// Forgot Password
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }

  // Same reply whether or not the account exists, so this endpoint can't be
  // used to find out which emails are registered.
  const genericResponse = {
    success: true,
    message: "If an account with that email exists, a password reset link has been sent.",
  };

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "FYP SYSTEM - Password Reset Request",
      message: generateForgotPasswordEmailTemplate(resetPasswordUrl),
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error(`Password reset email failed: ${error.message}`);
    return next(new ErrorHandler("Could not send the reset email. Please try again later.", 500));
  }

  res.status(200).json(genericResponse);
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired password reset token", 400));
  }

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and Confirm Password do not match", 400));
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return next(
      new ErrorHandler(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400)
    );
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  generateToken(user, 200, "Password reset successful", res);
});
