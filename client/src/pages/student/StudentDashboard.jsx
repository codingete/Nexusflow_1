import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Calendar, FileText, Loader2, MessageCircle, User } from "lucide-react";
import { fetchStudentDashboard } from "../../store/slices/studentSlice";

const STATUS_CLASSES = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-purple-100 text-purple-800",
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.student);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStudentDashboard());
  }, [dispatch]);

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const {
    project,
    upcomingDeadlines = [],
    topNotifications = [],
    feedbackNotifications = [],
    supervisorName,
  } = dashboardStats || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome, {authUser?.name}</h1>
        <p className="text-blue-100">Track your final year project in one place.</p>
      </div>

      {!project ? (
        <div className="card text-center py-10">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">No project yet</h2>
          <p className="text-slate-500 mb-6">
            Submit your project proposal to get started.
          </p>
          <Link to="/student/submit-proposal" className="btn-primary">
            Submit Proposal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Overview</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600">Title</p>
                <p className="text-slate-800 font-medium">{project.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Description</p>
                <p className="text-slate-700">{project.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-600">Status</p>
                <span
                  className={`inline-flex items-center px-2 py-[2px] rounded-full text-sm font-medium capitalize ${
                    STATUS_CLASSES[project.status] || "bg-slate-100 text-slate-800"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                {supervisorName ? (
                  <span>Supervisor: {supervisorName}</span>
                ) : (
                  <Link to="/student/supervisor" className="text-blue-600 hover:underline">
                    No supervisor yet. Request one
                  </Link>
                )}
              </div>
              {project.deadline && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Final deadline: {formatDate(project.deadline)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Latest feedback */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title">Latest Feedback</h2>
              <Link
                to={`/student/feedback/${project._id}`}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-600"
              >
                View All
              </Link>
            </div>
            {feedbackNotifications.length > 0 ? (
              <div className="space-y-4">
                {feedbackNotifications.map((feedback) => (
                  <div key={feedback._id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        <h3 className="font-medium text-slate-800">{feedback.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500">{formatDate(feedback.createdAt)}</p>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-lg p-3">
                      {feedback.message}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      - {feedback.supervisorName || "Supervisor"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No feedback yet.</p>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Deadlines</h2>
            </div>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((d) => (
                  <div
                    key={d._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{d.name}</p>
                      <p className="text-sm text-slate-500">{formatDate(d.dueDate)}</p>
                    </div>
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No upcoming deadlines</p>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title">Recent Notifications</h2>
              <Link to="/student/notifications" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {topNotifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {topNotifications.map((n) => (
                  <div key={n._id} className="py-3 flex items-start justify-between">
                    <div>
                      <p className="text-slate-800">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No recent notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
