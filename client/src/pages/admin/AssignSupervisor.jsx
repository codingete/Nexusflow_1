import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { getAllProjects } from "../../store/slices/projectSlice";
import { CheckCircle, AlertTriangle, Users } from "lucide-react";

const Badge = ({ color, children }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
  >
    {children}
  </span>
);

const AssignSupervisor = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [pendingFor, setPendingFor] = useState(null);

  const { users } = useSelector((state) => state.admin);
  const { projects } = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
  }, [dispatch]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (u) => (u.role || "").toLowerCase() === "teacher"
    );
    return teacherUsers.map((t) => ({
      ...t,
      assignedCount: Array.isArray(t.assignedStudents)
        ? t.assignedStudents.length
        : 0,
      capacityLeft:
        (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((p) => !!p.student?._id)
      .map((p) => ({
        id: p._id,
        title: p.title,
        status: p.status,
        supervisorName: p.supervisor?.name || null,
        supervisorId: p.supervisor?._id || null,
        studentId: p.student?._id || "Unknown",
        studentName: p.student?.name || "-",
        studentEmail: p.student?.email || "-",
        deadline: p.deadline
          ? new Date(p.deadline).toISOString().slice(0, 10)
          : "-",
        updatedAt: p.updatedAt
          ? new Date(p.updatedAt).toLocaleString()
          : "-",
        isApproved: p.status === "approved",
      }));
  }, [projects]);

  // Fix #5: use supervisorId not supervisor
  const filtered = studentProjects.filter((row) => {
    const matchesSearch =
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase());

    const status = row.supervisorId ? "assigned" : "unassigned";
    const matchesFilter = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  // Fix #4: pass object to thunk
  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];
    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }
    if (projectStatus === "rejected") {
      toast.error("Cannot assign supervisor to a rejected project");
      return;
    }

    setPendingFor(projectId);
    const res = await dispatch(
      assignSupervisorThunk({ studentId, supervisorId })
    );
    setPendingFor(null);

    if (assignSupervisorThunk.fulfilled.match(res)) {
      toast.success("Supervisor assigned successfully");
      dispatch(getAllProjects());
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      dispatch(getAllUsers());
    }
  };

  // Fix #6: use supervisorId not supervisor
  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisorId).length,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisorId).length,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0)
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  const headers = [
    "Student",
    "Project Title",
    "Supervisor",
    "Deadline",
    "Updated",
    "Assign Supervisor",
    "Actions",
  ];

  return (
    <div className="space-y-6">

      {/* HEADER CARD */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Assign Supervisor</h1>
          <p className="card-subtitle">
            Manage supervisor assignments for students and projects
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Students
            </label>
            <input
              type="text"
              placeholder="Search by student name or project title..."
              className="input-field w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter Status
            </label>
            {/* Fix #10: correct option values */}
            <select
              className="input-field w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Fix #15: render thead headers */}
            <thead className="bg-slate-50">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.map((row) => (
                //  Fix #12: use row.id
                <tr key={row.id} className="hover:bg-slate-50">

                  {/* Student */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {row.studentName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {row.studentEmail}
                    </div>
                  </td>

                  {/* Project Title */}
                  <td className="px-6 py-4">{row.title}</td>

                  {/* Supervisor Badge */}
                  {/* Fix #11: use supervisorName and supervisorId */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.supervisorId ? (
                      <Badge color="bg-green-100 text-green-800">
                        {row.supervisorName}
                      </Badge>
                    ) : (
                      <Badge color="bg-red-100 text-red-800">
                        {row.status === "rejected" ? "Rejected" : "Not Assigned"}
                      </Badge>
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="px-6 py-4">{row.deadline}</td>

                  {/* Updated At */}
                  <td className="px-6 py-4">{row.updatedAt}</td>

                  {/* Supervisor Select */}
                  {/*  Fix #7,8,9: row.id, teachers, return in map */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="input-field w-full"
                      value={selectedSupervisor[row.id] || ""}
                      disabled={
                        !!row.supervisorId ||
                        row.status === "rejected" ||
                        !row.isApproved
                      }
                      onChange={(e) =>
                        handleSupervisorSelect(row.id, e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select Supervisor
                      </option>
                      {teachers
                        .filter((t) => t.capacityLeft > 0)
                        .map((t) => (
                          <option value={t._id} key={t._id}>
                            {t.name} ({t.capacityLeft} slot left)
                          </option>
                        ))}
                    </select>
                  </td>

                  {/* Assign Button */}
                  {/*  Fix #13: row.id everywhere */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="btn-primary text-sm w-40"
                      onClick={() =>
                        handleAssign(row.studentId, row.status, row.id)
                      }
                      disabled={
                        pendingFor === row.id ||
                        !!row.supervisorId ||
                        row.status === "rejected" ||
                        !row.isApproved ||
                        !selectedSupervisor[row.id]
                      }
                    >
                      {pendingFor === row.id
                        ? "Assigning..."
                        : row.supervisorId
                        ? "Assigned"
                        : row.status === "rejected"
                        ? "Rejected"
                        : !row.isApproved
                        ? "Not Approved"
                        : "Assign"}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/*  Fix #14: typo "fount" → "found" */}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No students found matching your criteria
            </div>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 ${card.bg} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {card.title}
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AssignSupervisor; 