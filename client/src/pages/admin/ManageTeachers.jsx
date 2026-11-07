import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";
import {
  deleteTeacher,
  getAllUsers,
  updateTeacher,
} from "../../store/slices/adminSlice";
import {
  BadgeCheck,
  Plus,
  Users,
  TriangleAlert,
  AlertTriangle,
  X,
} from "lucide-react";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { LABELS, DEPARTMENT_OPTIONS } from "../../constants/labels";

const ManageTeachers = () => {
  const { users } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);

  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    expertise: "",
    maxStudents: 10,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const teachers = useMemo(() => {
    return (users || []).filter((u) => u.role?.toLowerCase() === "teacher");
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set(
      (teachers || []).map((t) => t.department).filter(Boolean)
    );
    return Array.from(set);
  }, [teachers]);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || teacher.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      expertise: "",
      maxStudents: 10,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      dispatch(updateTeacher({ id: editingTeacher._id, data: formData }));
    }
    handleCloseModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      expertise: Array.isArray(teacher.expertise)
        ? teacher.expertise[0]
        : teacher.expertise,
      maxStudents: teacher.maxStudents,
    });
    setShowModal(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete._id));
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="card">
        <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="card-title">{LABELS.TEACHERS.TITLE}</h1>
            <p className="card-subtitle">
              {LABELS.TEACHERS.SUBTITLE}
            </p>
          </div>

          <button
            onClick={() => dispatch(toggleTeacherModal())}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{LABELS.TEACHERS.ADD_NEW}</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center p-4">
          <Users className="w-6 h-6 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm text-slate-600">{LABELS.TEACHERS.TITLE.replace("Manage ", "")}</p>
            <p className="text-lg font-semibold">{teachers.length}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BadgeCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">Assigned Students</p>
              <p className="text-lg font-semibold text-slate-800">
                {teachers.reduce(
                  (sum, t) => sum + (t.assignedStudents?.length || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
          <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
          <TriangleAlert className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-slate-600">Departments</p>
            <p className="text-lg font-semibold text-slate-800">
              {departments.length}
            </p>
          </div>
        </div>
      </div>
</div>
      {/* FILTERS */}
      <div className="card">
        <div className="flex  flex-col md:flex-row gap-4">
          <div className="flex-1">
  <label className="block text-sm font-medium text-slate-700 mb-2">
    {LABELS.TEACHERS.SEARCH_TEACHERS}
    </label>
          <input
            type="text"
            placeholder={LABELS.TEACHERS.SEARCH_BY_NAME_EMAIL || "Search by name or email..."}
            className="input-field w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
</div>
<div className="w-full md:w-48">
  <label className="block text-sm font-medium text-slate-700 mb-2">
    {LABELS.TEACHERS.FILTER_DEPARTMENT}
    </label>
          <select
           className="input-field w-full"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">{LABELS.STUDENTS.ALL_DEPARTMENTS}</option>
            {departments.map((dept) => (
              <option key={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>
      </div>

      {/* TEACHERS TABLE */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{LABELS.TEACHERS.TEACHERS_LIST}</h2>
        </div>

        <div className="overflow-x-auto">
          {filteredTeachers&&filteredTeachers.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.TEACHERS.TEACHER_INFO}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.TEACHERS.DEPARTMENT}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.TEACHERS.EXPERTISE}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.STUDENTS.DATE}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.COMMON.ACTIONS}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
  {filteredTeachers.map((teacher) => {
    return (
      <tr key={teacher._id} className="hover:bg-slate-50">
        <td className="px-6 py-4">
          <div>
            <div className="text-sm font-medium text-slate-900">
              {teacher.name}
            </div>
            <div className="text-sm text-slate-500">{teacher.email}
              </div>
            
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
          {teacher.department || "-"}
          <div className="text-xs text-slate-500">
            {teacher.assignedStudents?.length || 0}/{teacher.maxStudents ?? "-"} students
          </div>
        </td>

        <td className="px-6 py-4 text-sm text-slate-900">
          {Array.isArray(teacher.expertise)
            ? teacher.expertise.join(", ")
            : teacher.expertise || "-"}
        </td>

        <td className="px-6 py-4">
          <div className="text-sm text-slate-900">
            {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "-"}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(teacher)}
              className="text-blue-600 hover:text-blue-900"
            >
              {LABELS.COMMON.EDIT}
            </button>

            <button
              onClick={() => handleDelete(teacher)}
              className="text-red-600 hover:text-red-900"
            >
              {LABELS.COMMON.DELETE}
            </button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
            </table>
          ) : (
            filteredTeachers.length ===0 &&(
            <div className="text-center py-8 text-slate-500">
              {LABELS.TEACHERS.NO_TEACHERS_FOUND}
            </div>
          ))}
        </div>
      </div>

{/*Edit Teacher Modal*/}

{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {LABELS.TEACHERS.EDIT_TEACHER}
        </h3>
        <button
          onClick={handleCloseModal}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {LABELS.TEACHERS.NAME}
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"/>

          <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    {LABELS.TEACHERS.EMAIL}
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
    {LABELS.TEACHERS.DEPARTMENT}
  </label>
  <select className="input-field w-full py-1 border-b border-slate-600 focus:outline-none"
 required
 value={formData.department}
 onChange={(e) => {
   setFormData({ ...formData, department: e.target.value })
 }}
 >
 {DEPARTMENT_OPTIONS.map((dept) => (
   <option key={dept} value={dept}>{dept}</option>
 ))}
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
    onClick={handleCloseModal}
    className="btn-danger"
  >
    {LABELS.COMMON.CANCEL}
  </button>
  <button type="submit" className="btn-primary">
    {LABELS.COMMON.SUBMIT}
  </button>
</div>
      </form>
    </div>
  </div>
)}



      {/* DELETE MODAL */}
      {showDeleteModal && teacherToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-lg font-medium text-slate-900 mb-2">
                {LABELS.TEACHERS.DELETE_TEACHER}
              </h1>

              <p className="text-sm text-slate-500 mb-4">
                {LABELS.TEACHERS.CONFIRM_DELETE}
              </p>

              <div className="flex justify-center space-x-3">
                <button onClick={cancelDelete} className="btn-secondary">
                  {LABELS.COMMON.CANCEL}
                </button>

                <button onClick={confirmDelete} className="btn-danger">
                  {LABELS.COMMON.DELETE}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateTeacherModalOpen && <AddTeacher />}
    </div>
     
  );
};

export default ManageTeachers;