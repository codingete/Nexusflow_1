export const generateToken = (user, statusCode, message, res) => {
  const token = user.generateToken();

  // The user may have been loaded with +password; never send the hash back.
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.resetPasswordToken;
  delete safeUser.resetPasswordExpire;

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: "lax",
    })
    .json({
      success: true,
      user: safeUser,
      message,
      token,
    });
};
