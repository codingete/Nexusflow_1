import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  FolderOpen,
  MessageSquare,
  MessageCircle,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { getNotifications } from "../../store/slices/notificationSlice";

const StudentDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.list);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const { data } = await axiosInstance.get(`/student/project/${projectId}`);
        setProject(data.data);
        setFeedbackList(data.data?.feedback || []);
        setUpcomingDeadlines([
          { title: "Mid-term Report", date: "2026-05-15" },
          { title: "Final Presentation", date: "2026-06-20" }
        ]);
      } catch (error) {
        toast.error("Failed to fetch project details");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, navigate]);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const navItems = [
    {
      name: "Overview",
      path: `/student/project/${projectId}/overview`,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Daily Logs",
      path: `/student/project/${projectId}/logs`,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Tasks",
      path: `/student/project/${projectId}/tasks`,
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      name: "Files",
      path: `/student/project/${projectId}/files`,
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      name: "Chat",
      path: `/student/project/${projectId}/chat`,
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: "Settings",
      path: `/student/project/${projectId}/settings`,
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl text-slate-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">
            Project Workspace
          </h2>
          <p className="text-sm text-slate-500 mt-1 truncate">
            {project.title}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`mr-3 ${
                      isActive ? "text-blue-700" : "text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log out
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 ml-2 truncate max-w-[200px]">
            {project.title}
          </h2>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
              <span className="text-lg font-bold text-slate-800">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mr-3 ${
                        isActive ? "text-blue-700" : "text-slate-400"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Overview */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Project Overview</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Title</label>
                    <p className="text-slate-800 font-medium">{project?.title || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Description
                    </label>
                    <p className="text-slate-800 font-medium">
                      {project?.description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-600">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-[2px] rounded-full text-sm font-medium capitalize ${project?.status === "approved" ? "bg-green-100 text-green-800" : project?.status === "pending" ? "bg-yellow-100 text-yellow-800" : project?.status === "rejected" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800"}`}
                    >
                      {project?.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Latest Feedback & Upcoming Deadlines */}
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h2 className="card-title">Latest Feedback</h2>
                  <Link
                    to={`/student/feedback/${project?._id}`}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-600 transition-all"
                  >
                    View All
                  </Link>
                </div>
                {feedbackList && feedbackList.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackList.slice(0, 3).map((feedback, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                            <h3 className="font-medium text-slate-800">
                              {feedback.title || "Supervisor Feedback"}
                            </h3>
                          </div>
                          <p className="text-sm">{feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : ""}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {feedback.message}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-sm text-slate-500">- {feedback.supervisorName || "Supervisor"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-600 text-sm">
                    No feedback yet.
                  </div>
                )}
              </div>
            </div>

            {/* UPCOMING DEADLINES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Upcoming Deadlines</h2>
                </div>
                {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">{d.title}</p>
                          <p className="text-sm text-slate-500">{d.date}</p>
                        </div>
                        <span className="text-sm text-orange-600 font-medium">Due Soon</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No upcoming deadlines</p>
                )}
              </div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Recent Notifications</h2>
                </div>
                {notifications && notifications.length > 0 ? (
                  <div className="p-0 divide-y divide-slate-100">
                    {notifications.slice(0, 5).map((n, i) => {
                      return (
                        <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">
                                {n.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {formatDate(n.createdAt)}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      No recent notifications
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Outlet context={{ project }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;