import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Loader } from "lucide-react";
import { login } from "../../store/slices/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();

  const { isLoggingIn, authUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
};

const validateForm = () => {
  const newErrors = {};

  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Email is invalid";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


const handleSubmit = (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  // The server only parses JSON / urlencoded bodies, so send a plain object.
  dispatch(
    login({
      email: formData.email,
      password: formData.password,
      role: formData.role,
    })
  );
};

useEffect(() => {
  if (authUser) {
    switch (authUser.role) {
      case "Student":
        navigate("/student");
        break;
      case "Teacher":
        navigate("/teacher");
        break;
      case "Admin":
        navigate("/admin");
        break;
      default:
        navigate("/login");
    }
  }
}, [authUser, navigate]);

return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Educational Project Management
        </h1>
        <p className="text-slate-600 mt-2">Sign in to your account</p>
      </div>

{/* Login Form */}
<div className="card">
  <form onSubmit={handleSubmit} className="space-y-6">
    {errors.general && (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{errors.general}</p>
      </div>
    )}

{/* Role Selection */}
<div>
<label className="label">Select Role</label>
<select
  className="input"
  name="role"
  value={formData.role}
  onChange={handleChange}
>
  <option value="Student">Student</option>
  <option value="Teacher">Teacher</option>
  <option value="Admin">Admin</option>
</select>
</div>
{/* Email Address */}
<div>
  <label className="label">Email Address</label>
  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    className={`input ${errors.email ? "input-error" : ""}`}
    placeholder="Enter your email"
  />
  {errors.email && (
    <p className="text-sm text-red-600">{errors.email}</p>
  )}
</div>

{/* Password*/}
<div>
  <label className="label">Password</label>
  <input
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    className={`input ${errors.password ? "input-error" : ""}`}
    placeholder="Enter your password"
  />
  {errors.password && (
    <p className="text-sm text-red-600">{errors.password}</p>
  )}
</div>

{/* Forgot Password Link */}
<div className="text-right">
  <Link
    to="/forgot-password"
    className="text-sm text-blue-600 hover:text-blue-500"
  >
    Forgot your password?
  </Link>
</div>
{/* Submit Button */}
<button
  type="submit"
  disabled={isLoggingIn}
  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoggingIn ? (
    <div className="flex justify-center items-center">
      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
      Signing In...
    </div>
  ) : (
    "Sign In"
  )}
</button>
  </form>
</div>

    </div>
  </div>
);


};

export default LoginPage;
