import { X } from "lucide-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";

const AddTeacher = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    expertise: "",
    maxStudents: 5,
  });

  const handleCreateTeacher = (e) => {
    e.preventDefault();
    dispatch(createTeacher(formData));
    setFormData({ name: "", email: "", department: "", password: "", expertise: "",
    maxStudents: 5 });
    dispatch(toggleTeacherModal());
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Teacher
            </h3>
            <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="text-slate-400 hover:to-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateTeacher} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department
              </label>
              <select
                className="input-field w-full py-2 border-b border-slate-600 focus:outline-none"
                required
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                <option value="" disabled>Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Economics">Economics</option>
                <option value="Psychology">Psychology</option>
              </select>
            </div>

<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Expertise
  </label>
  <select className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
required
value={formData.expertise}
onChange={(e) => 
  setFormData({ ...formData, expertise: e.target.value })
}
>
<option value="" disabled>Select Expertise</option>
<option value="Artificial Intelligence">Artificial Intelligence</option>
<option value="Machine Learning">Machine Learning</option>
<option value="Data Science">Data Science</option>
<option value="Cybersecurity">Cybersecurity</option>
<option value="Cloud Computing">Cloud Computing</option>
<option value="Software Development">Software Development</option>
<option value="Web Development">Web Development</option>
<option value="Mobile App Development">Mobile App Development</option>
<option value="Database Systems">Database Systems</option>
<option value="Computer Networks">Computer Networks</option>
<option value="Operating Systems">Operating Systems</option>
<option value="Human-Computer Interaction">Human-Computer Interaction</option>
<option value="Big Data Analytics">Big Data Analytics</option>
<option value="Blockchain Technology">Blockchain Technology</option>
<option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
</select>
</div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Max Students
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.maxStudents}
                onChange={(e) =>
                  setFormData({ ...formData, maxStudents: Number(e.target.value) })
                }
                className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => dispatch(toggleTeacherModal())}
                className="btn-danger"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;