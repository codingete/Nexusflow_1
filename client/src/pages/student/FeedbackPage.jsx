import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MessageSquare, AlertCircle, Send, FileX } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getProjectFeedback, createFeedback } from "../../store/slices/feedbackSlice";
import { fetchProject } from "../../store/slices/studentSlice";

const FeedbackPage = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const { list = [], loading } = useSelector((state) => state.feedback);
    const { project: storeProject, loading: loadingProject } = useSelector((state) => state.student);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [type, setType] = useState("general");

    const activeProjectId = projectId || storeProject?._id;

    useEffect(() => {
        if (activeProjectId) {
            dispatch(getProjectFeedback(activeProjectId));
        }
    }, [dispatch, activeProjectId]);

    // The project (with supervisor feedback) may not be loaded yet if the
    // student came straight here.
    useEffect(() => {
        if (!storeProject) {
            dispatch(fetchProject());
        }
    }, [dispatch, storeProject]);

    const supervisorFeedback = [...(storeProject?.feedback || [])].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    if (!activeProjectId && loadingProject) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!activeProjectId) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileX className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Project Selected</h3>
                    <p className="text-slate-500 mb-6">You need to have an active project to view feedback.</p>
                    <Link to="/student/submit-proposal" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Submit Project Proposal
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) return;
        dispatch(createFeedback({ projectId: activeProjectId, rating, comment, type }));
        setRating(0); setComment(""); setType("general");
    };

    const formatDate = (date) => {
        if (!date) return "Just now";
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getFeedbackIcon = (feedbackType) => {
        switch (feedbackType) {
            case "bug": return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <MessageSquare className="w-5 h-5 text-emerald-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800">Supervisor Feedback</h2>
                    <p className="text-sm text-slate-500 mt-1">Comments from your supervisor on your project</p>
                </div>
                <div className="p-6 space-y-4">
                    {supervisorFeedback.length > 0 ? supervisorFeedback.map((f) => (
                        <div key={f._id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-slate-800">{f.title}</h3>
                                <span className="text-sm text-slate-500">{formatDate(f.createdAt)}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">{f.message}</p>
                            <p className="text-sm text-slate-500 mt-2">- {f.supervisorId?.name || "Supervisor"}</p>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-500">Your supervisor hasn't left any feedback yet.</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800">Rate Your Project Experience</h2>
                    <p className="text-sm text-slate-500 mt-1">Share your thoughts and help us improve</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Overall Rating</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="p-1 transition-colors">
                                    <Star className={`w-8 h-8 ${star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="general">General Feedback</option>
                            <option value="feature">Feature Request</option>
                            <option value="bug">Bug Report</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Your Feedback</label>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us what you think..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={!rating || !comment.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            <Send className="w-4 h-4" />Submit Feedback
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-slate-500" />Your Previous Ratings</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {(list || []).length > 0 ? (list || []).map((f, i) => (
                        <div key={f._id || i} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getFeedbackIcon(f.type)}
                                    <span className="text-sm font-medium text-slate-700 capitalize">{f.type}</span>
                                    <span className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-4 h-4 ${star <= f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                                        ))}
                                    </span>
                                </div>
                                <div className="text-right text-sm text-slate-500">
                                    {formatDate(f.createdAt)} · {f.user?.name || "You"}
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{f.comment}</p>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-medium text-slate-900 mb-1">No feedback yet</h3>
                            <p className="text-sm text-slate-500">Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;