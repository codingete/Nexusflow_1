import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { updatePassword } from "../../store/slices/authSlice";

const empty = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePassword = ({ onClose }) => {
  const dispatch = useDispatch();
  const { isUpdatingPassword } = useSelector((state) => state.auth);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    try {
      await dispatch(updatePassword(form)).unwrap();
      onClose();
    } catch (message) {
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
              className="input"
              value={form.currentPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
              value={form.newPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isUpdatingPassword} className="btn-primary disabled:opacity-50">
              {isUpdatingPassword ? "Saving..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
