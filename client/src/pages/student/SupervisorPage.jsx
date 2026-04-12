import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProject,
  fetchSupervisor,
  fetchAvailableSupervisors,
  fetchMyRequests,
  requestSupervisor,
} from "../../store/slices/studentSlice";
import {
  Menu,
  BookOpen,
  Home,
  FileText,
  UploadCloud,
  User,
  MessageSquare,
  Settings,
  ChevronDown
} from "lucide-react";

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
  const year = date.getFullYear();
  return `${day}${getDaySuffix(day)} ${month}, ${year}`;
};

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const studentState = useSelector((state) => state.student);
  const project = useMemo(() => studentState.project, [studentState.project]);
  const supervisor = useMemo(() => studentState.supervisor, [studentState.supervisor]);
  const supervisors = useMemo(() => studentState.supervisors, [studentState.supervisors]);
  const loading = useMemo(() => studentState.loading, [studentState.loading]);
  const requests = useMemo(() => studentState.requests || [], [studentState.requests]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(fetchSupervisor());
    dispatch(fetchAvailableSupervisors());
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const handleOpenRequest = (supervisorItem) => {
    setSelectedSupervisor(supervisorItem);
    setShowModal(true);
  };

  const handleSubmitRequest = () => {
    if (selectedSupervisor && message.trim()) {
      dispatch(requestSupervisor({ teacherId: selectedSupervisor._id, message: message.trim() }));
      setShowModal(false);
      setSelectedSupervisor(null);
      setMessage("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#fef3c7] text-[#92400e]";
      case "accepted":
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-[#fef3c7] text-[#92400e]";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8f9fa] font-sans">
        <div className="w-16 bg-white border-r border-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const NoProjectView = () => (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 flex-shrink-0">
        <div className="grid gap-8 mt-2">
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <Home size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <FileText size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <UploadCloud size={20} />
          </div>
          <div className="p-2 text-blue-500 bg-blue-50 cursor-pointer rounded-lg border-l-4 border-blue-500 shadow-sm relative right-[2px]">
            <User size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <MessageSquare size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <Settings size={20} />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-white bg-blue-500 p-1.5 rounded-md">
              <BookOpen size={20} />
            </div>
            <h1 className="text-[15px] font-semibold text-gray-700 ml-1">
              Final Year Project Management System
            </h1>
          </div>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-gray-700 leading-tight">Student</span>
              <span className="text-[11px] text-gray-400 leading-tight">Student</span>
            </div>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-[15px] font-semibold text-gray-800">Supervisor Request</h2>
              </div>
              <div className="flex justify-center items-center py-16 text-[14px] text-gray-500">
                You have not submitted any project yet. Please submit your project proposal first to request a supervisor.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  if (!project) {
    return <NoProjectView />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      {/* Sidebar */}
      <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 flex-shrink-0">
        <div className="grid gap-8 mt-2">
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <Home size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <FileText size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <UploadCloud size={20} />
          </div>
          <div className="p-2 text-blue-500 bg-blue-50 cursor-pointer rounded-lg border-l-4 border-blue-500 shadow-sm relative right-[2px]">
            <User size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <MessageSquare size={20} />
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
            <Settings size={20} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-white bg-blue-500 p-1.5 rounded-md">
              <BookOpen size={20} />
            </div>
            <h1 className="text-[15px] font-semibold text-gray-700 ml-1">
              Final Year Project Management System
            </h1>
          </div>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-gray-700 leading-tight">Student</span>
              <span className="text-[11px] text-gray-400 leading-tight">Student</span>
            </div>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* Current Supervisor Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-[15px] font-semibold text-gray-800">
                  {supervisor ? "Current Supervisor" : "Request Supervisor"}
                </h2>
              </div>
              
              <div className="p-6">
                {supervisor ? (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-medium">
                      {supervisor.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-800">{supervisor.name}</h3>
                      <p className="text-[13px] text-gray-500">{supervisor.email}</p>
                      <p className="text-[12px] text-gray-400">{supervisor.department}</p>
                      {supervisor.expertise && (
                        <p className="text-[12px] text-gray-400 mt-1">Expertise: {supervisor.expertise}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {supervisors.length === 0 ? (
                      <div className="text-center py-8 text-[14px] text-gray-500">
                        No supervisors available
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {supervisors.map((sup) => (
                          <div
                            key={sup._id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                                {sup.name?.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-[14px] font-semibold text-gray-800">{sup.name}</h3>
                                <p className="text-[12px] text-gray-500">{sup.department}</p>
                              </div>
                            </div>
                            {sup.expertise && (
                              <p className="text-[12px] text-gray-500 mb-3">
                                <span className="font-medium">Expertise:</span> {sup.expertise}
                              </p>
                            )}
                            <button
                              onClick={() => handleOpenRequest(sup)}
                              className="w-full py-2 px-4 bg-blue-500 text-white text-[13px] font-medium rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Request
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Project Details Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-[15px] font-semibold text-gray-800">Project Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Project Title</h3>
                    <p className="text-[14px] text-gray-800 font-medium">{project.title || "No title"}</p>
                  </div>
                 
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${getStatusColor(project.status)}`}>
                      {project.status || "Pending"}
                    </span>
                  </div>
                 
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Requests Card */}
            {requests.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-[15px] font-semibold text-gray-800">My Requests</h2>
                </div>
                <div className="p-6 space-y-4">
                  {requests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                          {req.supervisor?.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-[14px] font-medium text-gray-800">{req.supervisor?.name}</h4>
                          <p className="text-[12px] text-gray-400">{formatDate(req.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-[15px] font-semibold text-gray-800 mb-4">Request Supervisor</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              You are requesting{" "}
              <span className="font-semibold text-gray-700">{selectedSupervisor?.name}</span> as your supervisor.
            </p>
            <div className="mb-4">
              <label className="text-[12px] font-medium text-gray-700 block mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-[13px] min-h-[120px]"
                placeholder="Introduce yourself and explain why you would like this professor to supervise your project"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSupervisor(null);
                  setMessage("");
                }}
                className="flex-1 py-2 px-4 border border-gray-200 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitRequest} 
                className="flex-1 py-2 px-4 bg-blue-500 text-white text-[13px] font-medium rounded-lg hover:bg-blue-600"
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