import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import {
  createStudent,
  deleteStudent,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Plus, Users, TriangleAlert, X } from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import { LABELS, DEPARTMENT_OPTIONS } from "../../constants/labels";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  const students = useMemo(() => {
    const studentUsers = (users || []).filter((u) => u.role?.toLowerCase() === "student");
    return studentUsers.map((student) => {
      const studentProject = (projects || []).find((p) => p.student?._id === student._id);
      return {
        ...student,
        projectTitle: studentProject?.title || null,
        supervisor: studentProject?.supervisor || null,
        projectStatus: studentProject?.status || null,
      };
    });
  }, [users, projects]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const departments = useMemo(() => {
    const set = new Set((students || []).map((s) => s.department).filter(Boolean));
    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    } else {
      dispatch(createStudent(formData));
    }
    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
    });
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="card">
        <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="card-title">{LABELS.STUDENTS.TITLE}</h1>
            <p className="card-subtitle">
              {LABELS.STUDENTS.SUBTITLE}
            </p>
          </div>

          <button
            onClick={() => dispatch(toggleStudentModal())}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{LABELS.STUDENTS.ADD_NEW}</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center p-4">
          <Users className="w-6 h-6 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm text-slate-600">{LABELS.STUDENTS.TOTAL_STUDENTS}</p>
            <p className="text-lg font-semibold">{students.length}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center ">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-600">{LABELS.STUDENTS.COMPLETED_PROJECTS}</p>
              <p className="text-lg font-semibold text-slate-800">
                {students.filter((s) => s.projectStatus === "completed").length}
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
              <p className="text-sm text-slate-600">{LABELS.STUDENTS.UNASSIGNED}</p>
              <p className="text-lg font-semibold text-slate-800">
                {students.filter((s) => !s.supervisor).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {LABELS.STUDENTS.SEARCH_STUDENTS}
            </label>
            <input
              type="text"
              placeholder={LABELS.STUDENTS.SEARCH_BY_NAME_EMAIL}
              className="input-field w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {LABELS.STUDENTS.FILTER_STATUS}
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

      {/* STUDENTS TABLE */}
      <div className="card">
          <div className="card-header">
          <h2 className="card-title">{LABELS.STUDENTS.STUDENTS_LIST}</h2>
        </div>

        <div className="overflow-x-auto">
          {filteredStudents && filteredStudents.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.STUDENTS.STUDENT_INFO}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.STUDENTS.DEPARTMENT_YEAR}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.STUDENTS.SUPERVISOR}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.STUDENTS.PROJECT_TITLE}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{LABELS.COMMON.ACTIONS}</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {filteredStudents.map((student) => {
                  return (
                    <tr key={student._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {student.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {typeof student.supervisor} 
                        <div className="text-sm text-slate-900">
                          {student.department || "-"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {student.createdAt
                            ? new Date(student.createdAt).getFullYear()
                            : "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.supervisor ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-green-800 bg-gray-100 text-xs font-medium">
                            {typeof student.supervisor === "object"
                              ? student.supervisor.name
                              : student.supervisor}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-gray-100 text-xs font-medium">
                            {student.projectStatus === "rejected"
                              ? LABELS.STUDENTS.REJECTED
                              : LABELS.STUDENTS.NOT_ASSIGNED}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {student.projectTitle}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {LABELS.COMMON.EDIT}
                          </button>

                          <button
                            onClick={() => handleDelete(student)}
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
            filteredStudents.length ===0 &&(
            <div className="text-center py-8 text-slate-500">
              {LABELS.STUDENTS.NO_STUDENTS_FOUND}
            </div>
          ))}
        </div>
      </div>

      {/*Edit Student Modal*/}

      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {LABELS.STUDENTS.EDIT_STUDENT}
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
          {LABELS.STUDENTS.FULL_NAME}
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
    {LABELS.STUDENTS.EMAIL}
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
    {LABELS.STUDENTS.DEPARTMENT}
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
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-lg font-medium text-slate-900 mb-2">
                {LABELS.STUDENTS.DELETE_STUDENT}
              </h1>

              <p className="text-sm text-slate-500 mb-4">
                {LABELS.STUDENTS.CONFIRM_DELETE}
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


      {isCreateStudentModalOpen && <AddStudent />}
    </div>
  );
};

export default ManageStudents;