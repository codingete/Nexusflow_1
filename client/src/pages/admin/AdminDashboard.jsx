import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Activity,
  FileText,
  Search,
  Download,
  FileCheck,
  FileX,
  Clock,
} from "lucide-react";
import { getDashboardStats } from "../../store/slices/adminSlice";
import { getNotifications } from "../../store/slices/notificationSlice";
import { getAllProjects, downloadProjectFile } from "../../store/slices/projectSlice";
import { LABELS } from "../../constants/labels";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);
  const { list: notifications } = useSelector((state) => state.notification);
  const { projects } = useSelector((state) => state.project);

  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());
  }, [dispatch]);

  const dashboardStats = useMemo(() => {
    const statsData = [
      {
        title: "Total Students",
        value: stats?.totalStudents || 0,
        Icon: Users,
        bg: "bg-white",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        title: "Total Teachers",
        value: stats?.totalTeachers || 0,
        Icon: Users,
        bg: "bg-white",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
      },
      {
        title: "Total Projects",
        value: stats?.totalProjects || 0,
        Icon: BookOpen,
        bg: "bg-white",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      },
      {
        title: "Pending Requests",
        value: stats?.pendingRequests || 0,
        Icon: Clock,
        bg: "bg-white",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        title: "Active Projects",
        value: stats?.activeProjects || 0,
        Icon: CheckCircle,
        bg: "bg-white",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ];
    return statsData;
  }, [stats]);

  const supervisorsBucket = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => {
      if (!p?.supervisor?.name) return;
      const name = p.supervisor.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [projects]);

  const pieData = useMemo(() => {
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    };
    (projects || []).forEach((p) => {
      const status = (p.status || "pending").toLowerCase();
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });
    return [
      { name: "Pending", value: statusCounts.pending, color: "#f59e0b" },
      { name: "Approved", value: statusCounts.approved, color: "#10b981" },
      { name: "Rejected", value: statusCounts.rejected, color: "#ef4444" },
      { name: "Completed", value: statusCounts.completed, color: "#8b5cf6" },
    ].filter((d) => d.value > 0);
  }, [projects]);

  const latestNotifications = useMemo(
    () => (notifications || []).slice(0, 6),
    [notifications]
  );

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();
    if (p === "high" && (t === "rejection" || t === "reject")) return "bg-red-600";
    if (p === "medium" && (t === "deadline" || t === "due")) return "bg-orange-500";
    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-slate-400";
    if (t === "approval" || t === "approved") return "bg-green-600";
    if (t === "request") return "bg-blue-600";
    if (t === "feedback") return "bg-purple-600";
    if (t === "meeting") return "bg-cyan-600";
    if (t === "system") return "bg-slate-600";
    return "bg-slate-400";
  };

  const getBadgeClasses = (kind, value) => {
    const v = (value || "").toLowerCase();
    if (kind === "type") {
      if (["rejection", "reject"].includes(v)) return "bg-red-100 text-red-800";
      if (["approval", "approved"].includes(v)) return "bg-green-100 text-green-800";
      if (["deadline", "due"].includes(v)) return "bg-orange-100 text-orange-800";
      if (v === "request") return "bg-blue-100 text-blue-800";
      if (v === "feedback") return "bg-purple-100 text-purple-800";
      if (v === "meeting") return "bg-cyan-100 text-cyan-800";
      if (v === "system") return "bg-slate-100 text-slate-800";
    }
    if (kind === "priority") {
      if (v === "high") return "bg-red-100 text-red-800";
      if (v === "medium") return "bg-yellow-100 text-yellow-800";
      if (v === "low") return "bg-slate-100 text-slate-600";
    }
    return "bg-slate-100 text-slate-600";
  };

  const handleDownload = async (projectId, fileId, name) => {
    const res = await dispatch(downloadProjectFile({ projectId, fileId }));

    if (downloadProjectFile.fulfilled.match(res)) {
      const url = window.URL.createObjectURL(new Blob([res.payload.blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name || "downloaded-file");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const reportsData = useMemo(() => {
    return (projects || [])
      .filter((p) => p.status === "completed" && p.files?.length > 0)
      .map((p) => {
        const reportFile = p.files?.[0];
        return {
          projectId: p._id,
          projectTitle: p.title,
          studentName: p.student?.name,
          reportFileId: reportFile?._id,
          reportName: reportFile?.originalName,
          uploadedAt: reportFile?.uploadedAt || p.updatedAt,
        };
      })
      .filter((f) => f.reportFileId);
  }, [projects]);

  const filteredReports = useMemo(() => {
    if (!reportSearch) return reportsData;
    const search = reportSearch.toLowerCase();
    return reportsData.filter(
      (r) =>
        r.projectTitle?.toLowerCase().includes(search) ||
        r.studentName?.toLowerCase().includes(search)
    );
  }, [reportsData, reportSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {LABELS.DASHBOARD.TITLE}
        </h1>
        <p className="text-blue-100">
          {LABELS.DASHBOARD.SUBTITLE}
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {dashboardStats.map((item, i) => {
          return (
            <div key={i} className={`${item.bg} rounded-lg p-4`}>
              <div className="flex items-center">
                <div className={`p-2 ${item.iconBg} rounded-lg`}>
                  <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-600">
                    {item.title}
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vertical Bar Chart */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="card-title">{LABELS.DASHBOARD.PROJECT_DISTRIBUTION}</h3>
          </div>
          <div className="p-4">
            {supervisorsBucket.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded text-slate-500">
                {LABELS.DASHBOARD.NO_DATA}
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={supervisorsBucket}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{LABELS.DASHBOARD.PROJECT_STATUS}</h3>
          </div>
          <div className="p-4 flex flex-col items-center justify-center h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center text-xs">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY LOGS (Timeline) */}
      <div className="card">
        <div className="card-header flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="card-title flex items-center">
            <Activity size={18} className="mr-2 text-indigo-500" />
            {LABELS.DASHBOARD.RECENT_ACTIVITY}
          </h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">{LABELS.DASHBOARD.VIEW_ALL}</button>
        </div>
        <div className="p-0">
          {latestNotifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500">{LABELS.DASHBOARD.NO_ACTIVITY}</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {latestNotifications.map((notif, i) => (
                <li key={notif._id || i} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${getBulletColor(notif.type, notif.priority)}`}></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-800">{notif.title || "Notification"}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                      {(notif.type || notif.priority) && (
                        <div className="mt-2 flex gap-2">
                          {notif.type && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold ${getBadgeClasses("type", notif.type)}`}>
                              {notif.type}
                            </span>
                          )}
                          {notif.priority && notif.priority !== "low" && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold ${getBadgeClasses("priority", notif.priority)}`}>
                              {notif.priority}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* EXPORT REPORTS */}
      <div className="card">
        <div className="card-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="card-title flex items-center">
            <FileText size={18} className="mr-2 text-blue-500" />
            {LABELS.DASHBOARD.FINAL_REPORTS}
          </h3>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="form-input text-sm pl-9"
              placeholder={LABELS.DASHBOARD.SEARCH_REPORTS}
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium border-b border-slate-200">{LABELS.DASHBOARD.PROJECT_TITLE}</th>
                <th className="p-4 font-medium border-b border-slate-200">{LABELS.DASHBOARD.STUDENT}</th>
                <th className="p-4 font-medium border-b border-slate-200">{LABELS.DASHBOARD.DATE_UPLOADED}</th>
                <th className="p-4 font-medium border-b border-slate-200 text-right">{LABELS.DASHBOARD.ACTION}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-500">
                    {LABELS.DASHBOARD.NO_REPORTS}
                  </td>
                </tr>
              ) : (
                filteredReports.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{f.projectTitle}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-2">
                          {(f.studentName || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-600">{f.studentName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(f.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownload(f.projectId, f.reportFileId, f.reportName)}
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                      >
                        <Download size={14} className="mr-1.5 text-slate-400" />
                        {LABELS.DASHBOARD.DOWNLOAD}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;