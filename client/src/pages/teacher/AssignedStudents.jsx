import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, X, Users } from "lucide-react";
import { fetchAssignedStudents } from "../../store/slices/teacherSlice";
import { addProjectFeedback, updateProjectStatus } from "../../store/slices/projectSlice";

const STATUS_BADGE = {
  pending: "badge-pending",
  approved: "badge-approved",
  rejected: "badge-rejected",
  completed: "badge-completed",
};

const emptyFeedback = { title: "", message: "", type: "general" };

const AssignedStudents = () => {
  const dispatch = useDispatch();
  const { assignedProjects, loading } = useSelector((state) => state.teacher);

  const [feedbackFor, setFeedbackFor] = useState(null);
  const [feedback, setFeedback] = useState(emptyFeedback);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(fetchAssignedStudents());
  }, [dispatch]);

  const closeFeedback = () => {
    setFeedbackFor(null);
    setFeedback(emptyFeedback);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      addProjectFeedback({ projectId: feedbackFor._id, ...feedback })
    );
    if (addProjectFeedback.fulfilled.match(res)) {
      closeFeedback();
      dispatch(fetchAssignedStudents());
    }
  };

  const markCompleted = async (projectId) => {
    setBusyId(projectId);
    const res = await dispatch(updateProjectStatus({ projectId, status: "completed" }));
    setBusyId(null);
    if (updateProjectStatus.fulfilled.match(res)) {
      dispatch(fetchAssignedStudents());
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Assigned Students</h1>
          <p className="card-subtitle">
            Students you supervise, their projects, and the feedback you've given
          </p>
        </div>
      </div>

      {loading && assignedProjects.length === 0 ? (
        <div className="card text-center py-8 text-slate-500">Loading...</div>
      ) : assignedProjects.length === 0 ? (
        <div className="card text-center py-10">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            No students assigned yet. Accept a supervision request to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedProjects.map((p) => (
            <div key={p._id} className="card">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {p.student?.name || "Unknown student"}
                    </h3>
                    <span className={`badge ${STATUS_BADGE[p.status] || "badge-pending"} capitalize`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {p.student?.email} {p.student?.department ? `· ${p.student.department}` : ""}
                  </p>
                  <h4 className="font-medium text-slate-700 mt-3">{p.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{p.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {p.files?.length || 0} file(s) · {p.feedback?.length || 0} feedback ·
                    Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : "-"}
                  </p>
                </div>

                <div className="flex lg:flex-col gap-2 lg:w-44">
                  <button
                    className="btn-primary btn-small inline-flex items-center justify-center"
                    onClick={() => setFeedbackFor(p)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Give feedback
                  </button>
                  {p.status === "approved" && (
                    <button
                      className="btn-secondary btn-small inline-flex items-center justify-center"
                      disabled={busyId === p._id}
                      onClick={() => markCompleted(p._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {busyId === p._id ? "Saving..." : "Mark completed"}
                    </button>
                  )}
                </div>
              </div>

              {p.feedback?.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
                  {[...p.feedback]
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    .slice(0, 3)
                    .map((f) => (
                      <div key={f._id} className="text-sm bg-slate-50 rounded-lg p-3">
                        <p className="font-medium text-slate-700">{f.title}</p>
                        <p className="text-slate-600">{f.message}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {feedbackFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Feedback for {feedbackFor.student?.name}
              </h3>
              <button onClick={closeFeedback} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={submitFeedback} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  className="input"
                  required
                  value={feedback.title}
                  onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={feedback.type}
                  onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Needs work</option>
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea
                  className="input min-h-[120px]"
                  required
                  maxLength={1000}
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeFeedback} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedStudents;
