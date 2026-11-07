import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle, Clock, Download, FileText, FolderOpen, XCircle } from "lucide-react";
import {
  getAllProjects,
  saveProjectFile,
  updateProjectStatus,
} from "../../store/slices/projectSlice";
import { LABELS } from "../../constants/labels";

const STATUS_BADGE = {
  pending: "badge-pending",
  approved: "badge-approved",
  rejected: "badge-rejected",
  completed: "badge-completed",
};

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.project);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, completed: 0 };
    (projects || []).forEach((p) => {
      if (c[p.status] !== undefined) c[p.status]++;
    });
    return c;
  }, [projects]);

  const filtered = (projects || []).filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.title || "").toLowerCase().includes(term) ||
      (p.student?.name || "").toLowerCase().includes(term);
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const changeStatus = async (projectId, status) => {
    setBusyId(projectId);
    await dispatch(updateProjectStatus({ projectId, status }));
    setBusyId(null);
  };

  const statCards = [
    { title: "Pending Review", value: counts.pending, Icon: Clock, bg: "bg-yellow-100", color: "text-yellow-600" },
    { title: "Approved", value: counts.approved, Icon: CheckCircle, bg: "bg-green-100", color: "text-green-600" },
    { title: "Rejected", value: counts.rejected, Icon: XCircle, bg: "bg-red-100", color: "text-red-600" },
    { title: "Completed", value: counts.completed, Icon: FolderOpen, bg: "bg-purple-100", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">{LABELS.PROJECTS.TITLE}</h1>
          <p className="card-subtitle">
            Review proposals, approve or reject them, and track progress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ title, value, Icon, bg, color }) => (
          <div key={title} className="card">
            <div className="flex items-center">
              <div className={`p-3 ${bg} rounded-lg`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">{title}</p>
                <p className="text-lg font-semibold text-slate-800">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {LABELS.PROJECTS.SEARCH_PROJECTS}
            </label>
            <input
              type="text"
              placeholder="Search by project title or student..."
              className="input-field w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {LABELS.PROJECTS.FILTER_STATUS}
            </label>
            <select
              className="input-field w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{LABELS.PROJECTS.PROJECTS_LIST}</h2>
        </div>

        {loading && (projects || []).length === 0 ? (
          <div className="py-8 text-center text-slate-500">{LABELS.COMMON.LOADING}</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            {LABELS.PROJECTS.NO_PROJECTS_FOUND}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((p) => {
              const busy = busyId === p._id;
              const expanded = expandedId === p._id;
              return (
                <div key={p._id} className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{p.title}</h3>
                        <span className={`badge ${STATUS_BADGE[p.status] || "badge-pending"} capitalize`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{p.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Student: {p.student?.name || "-"} ({p.student?.email || "-"}) · Supervisor:{" "}
                        {p.supervisor?.name || "Not assigned"} · Deadline:{" "}
                        {p.deadline ? new Date(p.deadline).toLocaleDateString() : "-"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {p.status === "pending" && (
                        <>
                          <button
                            className="btn-primary btn-small"
                            disabled={busy}
                            onClick={() => changeStatus(p._id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-danger btn-small"
                            disabled={busy}
                            onClick={() => changeStatus(p._id, "rejected")}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {p.status === "approved" && (
                        <button
                          className="btn-secondary btn-small"
                          disabled={busy}
                          onClick={() => changeStatus(p._id, "completed")}
                        >
                          Mark completed
                        </button>
                      )}
                      <button
                        className="btn-outline btn-small"
                        onClick={() => setExpandedId(expanded ? null : p._id)}
                      >
                        Files ({p.files?.length || 0})
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-3 space-y-2">
                      {(p.files || []).length === 0 ? (
                        <p className="text-sm text-slate-500">No files uploaded yet.</p>
                      ) : (
                        p.files.map((f) => (
                          <div
                            key={f._id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{f.originalName}</span>
                              <span className="text-xs text-slate-400">
                                {f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : ""}
                              </span>
                            </div>
                            <button
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                              onClick={() =>
                                dispatch(
                                  saveProjectFile({
                                    projectId: p._id,
                                    fileId: f._id,
                                    name: f.originalName,
                                  })
                                )
                              }
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
