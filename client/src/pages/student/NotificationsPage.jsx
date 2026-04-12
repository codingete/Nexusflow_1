import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Bell,
    CheckCircle,
    Clock,
    AlertTriangle,
    Info,
    Check,
    CheckCheck,
} from "lucide-react";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../../store/slices/notificationSlice";

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const { list = [], unreadCount = 0, loading } = useSelector(
        (state) => state.notification
    );
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        dispatch(getNotifications());
    }, [dispatch]);

    const handleMarkAsRead = (notificationId) => {
        dispatch(markAsRead(notificationId));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const filteredNotifications = list?.filter((notification) => {
        if (filter === "unread") return !notification.isRead;
        return true;
    }) || [];

    const getIcon = (type) => {
        switch (type) {
            case "alert":
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "success":
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-500" />;
            case "deadline":
                return <Clock className="w-5 h-5 text-purple-500" />;
            default:
                return <Bell className="w-5 h-5 text-slate-500" />;
        }
    };

    const getBgColor = (type, isRead) => {
        if (isRead) return "bg-white";
        switch (type) {
            case "alert":
                return "bg-amber-50";
            case "success":
                return "bg-emerald-50";
            case "info":
                return "bg-blue-50";
            case "deadline":
                return "bg-purple-50";
            default:
                return "bg-slate-50";
        }
    };

    const formatDate = (date) => {
        if (!date) return "Just now";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (loading && list?.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Bell className="w-6 h-6 mr-2 text-blue-600" />
                        Notifications
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Stay updated with your project activities
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-lg p-1 border border-slate-200 flex">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                filter === "all"
                                    ? "bg-slate-100 text-slate-800"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                filter === "unread"
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 sm:p-6 transition-colors hover:bg-slate-50 ${getBgColor(
                                    notification.type,
                                    notification.isRead
                                )}`}
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3
                                                className={`text-base font-medium ${
                                                    notification.isRead
                                                        ? "text-slate-700"
                                                        : "text-slate-900"
                                                }`}
                                            >
                                                {notification.title || "Notification"}
                                            </h3>
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                                {formatDate(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p
                                            className={`mt-1 text-sm ${
                                                notification.isRead
                                                    ? "text-slate-500"
                                                    : "text-slate-700"
                                            }`}
                                        >
                                            {notification.message}
                                        </p>

                                        {!notification.isRead && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() =>
                                                        handleMarkAsRead(notification._id)
                                                    }
                                                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Mark as read
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">
                            No notifications found
                        </h3>
                        <p className="text-slate-500 max-w-sm">
                            {filter === "unread"
                                ? "You've read all your notifications. You're all caught up!"
                                : "You don't have any notifications yet. We'll let you know when something happens."}
                        </p>
                        {filter === "unread" && (
                            <button
                                onClick={() => setFilter("all")}
                                className="mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                View all notifications
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;