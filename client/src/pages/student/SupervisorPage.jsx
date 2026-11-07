import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProject,
  fetchSupervisor,
  fetchAvailableSupervisors,
  fetchMyRequests,
  requestSupervisor,
} from "../../store/slices/studentSlice";

const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  return `${day}${getDaySuffix(day)} ${month}, ${date.getFullYear()}`;
};

const expertiseText = (expertise) =>
  Array.isArray(expertise) ? expertise.join(", ") : expertise;

const getStatusColor = (status) => {
  switch (status) {
    case "accepted":
    case "approved":
    case "completed":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-[#fef3c7] text-[#92400e]";
  }
};

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const {
    project,
    supervisor,
    supervisors = [],
    requests = [],
    loading,
  } = useSelector((state) => state.student);

  const [showModal, setShowModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(fetchSupervisor());
    dispatch(fetchAvailableSupervisors());
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const pendingTo = new Set(
    (requests || [])
      .filter((r) => r.status === "pending")
      .map((r) => r.supervisor?._id)
  );

  const closeModal = () => {
    setShowModal(false);
    setSelectedSupervisor(null);
    setMessage("");
  };

  const handleSubmitRequest = () => {
    if (selectedSupervisor && message.trim()) {
      dispatch(
        requestSupervisor({ teacherId: selectedSupervisor._id, message: message.trim() })
      );
      closeModal();
    }
  };

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center py-12">
        <h2 className="card-title mb-2">Supervisor Request</h2>
        <p className="text-slate-500 mb-6">
          You have not submitted a project yet. Submit your project proposal first to request a supervisor.
        </p>
        <Link to="/student/submit-proposal" className="btn-primary">
          Submit Proposal
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current supervisor or list to choose from */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {supervisor ? "Current Supervisor" : "Request a Supervisor"}
          </h2>
          {!supervisor && project.status !== "approved" && (
            <p className="card-subtitle">
              You can send requests now, but a supervisor can only accept once an admin has
              approved your project.
            </p>
          )}
        </div>

        {supervisor ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-medium">
              {supervisor.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{supervisor.name}</h3>
              <p className="text-sm text-slate-500">{supervisor.email}</p>
              <p className="text-xs text-slate-400">{supervisor.department}</p>
              {supervisor.expertise?.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Expertise: {expertiseText(supervisor.expertise)}
                </p>
              )}
            </div>
          </div>
        ) : supervisors.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No supervisors available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supervisors.map((sup) => {
              const alreadyRequested = pendingTo.has(sup._id);
              const full = sup.capacityLeft === 0;
              return (
                <div
                  key={sup._id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                      {sup.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{sup.name}</h3>
                      <p className="text-xs text-slate-500">{sup.department}</p>
                    </div>
                  </div>
                  {sup.expertise?.length > 0 && (
                    <p className="text-xs text-slate-500 mb-2">
                      <span className="font-medium">Expertise:</span> {expertiseText(sup.expertise)}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mb-3">
                    {sup.capacityLeft} slot{sup.capacityLeft === 1 ? "" : "s"} left
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSupervisor(sup);
                      setShowModal(true);
                    }}
                    disabled={alreadyRequested || full}
                    className="w-full py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {alreadyRequested ? "Request pending" : full ? "No slots left" : "Request"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project details */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Project Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Project Title
            </h3>
            <p className="text-slate-800 font-medium">{project.title}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}
            >
              {project.status}
            </span>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">{project.description}</p>
          </div>
        </div>
      </div>

      {/* My requests */}
      {requests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Requests</h2>
          </div>
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between p-4 border border-slate-100 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                    {req.supervisor?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-800">{req.supervisor?.name}</h4>
                    <p className="text-xs text-slate-400">{formatDate(req.createdAt)}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(req.status)}`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="font-semibold text-slate-800 mb-4">Request Supervisor</h2>
            <p className="text-sm text-slate-500 mb-4">
              You are requesting{" "}
              <span className="font-semibold text-slate-700">{selectedSupervisor?.name}</span> as
              your supervisor.
            </p>
            <label className="text-xs font-medium text-slate-700 block mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={250}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm min-h-[120px] mb-4"
              placeholder="Introduce yourself and explain why you would like this professor to supervise your project"
            />
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                className="flex-1 btn-primary disabled:opacity-50"
                disabled={!message.trim()}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorPage;
