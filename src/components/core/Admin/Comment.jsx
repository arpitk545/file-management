"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Check,
  X,
  Trash2,
  Clock,
  Calendar,
  Star,
  User,
  ArrowLeft,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  MessageSquare
} from "lucide-react";
import {
  getAllComments,
  changeCommentStatus,
  deleteComment
} from "../../../services/operations/commentAPI";
import toast from "react-hot-toast";

const Comment = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await getAllComments();
        setLoading(false);
        if (res?.success) {
          const commentList = res.comments?.comments;
          setComments(Array.isArray(commentList) ? commentList : []);
        } else {
          toast.error("Failed to load comments");
        }
      } catch (error) {
        setLoading(false);
        toast.error("Error loading comments");
      }
    };
    fetchComments();
  }, []);

  const [processingComments, setProcessingComments] = useState(new Set());
  const [processingAction, setProcessingAction] = useState({});

  const filteredComments = Array.isArray(comments)
    ? comments.filter((comment) => {
        const statusMatch =
          selectedFilter === "all" || comment.status === selectedFilter;
        const categoryMatch =
          selectedCategory === "all" || comment.category === selectedCategory;
        return statusMatch && categoryMatch;
      })
    : [];

  const handleStatusChange = async (comment, newStatus) => {
    const identifier = `${comment.userProfile?.email}-${comment.content}`;
    try {
      setProcessingAction((prev) => ({ ...prev, [identifier]: newStatus }));
      setProcessingComments((prev) => new Set(prev).add(identifier));
      const response = await changeCommentStatus({
        name: comment.userProfile?.name,
        email: comment.userProfile?.email,
        content: comment.content,
        status: newStatus,
        category: comment.category,
      });
      if (response?.comment) {
        setComments((prev) =>
          prev.map((c) =>
            c.userProfile?.email === comment.userProfile?.email &&
            c.content === comment.content
              ? { ...c, status: newStatus }
              : c
          )
        );
        toast.success(`Comment marked as ${newStatus}`);
      } else {
        toast.error(`Failed to update comment status`);
      }
    } catch (error) {
      toast.error(`Error updating comment: ${error.message}`);
    } finally {
      setProcessingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(identifier);
        return newSet;
      });
      setProcessingAction((prev) => {
        const newState = { ...prev };
        delete newState[identifier];
        return newState;
      });
    }
  };

  const handleDelete = async (comment) => {
    const identifier = `${comment.userProfile?.name}-${comment.content}`;
    try {
      setProcessingAction((prev) => ({ ...prev, [identifier]: "delete" }));
      setProcessingComments((prev) => new Set(prev).add(identifier));
      const response = await deleteComment({
        name: comment.userProfile?.name,
        email: comment.userProfile?.email,
        content: comment.content,
        category: comment.category,
      });
      if (response?.success) {
        setComments((prev) =>
          prev.filter(
            (c) =>
              !(
                c.userProfile?.name === comment.userProfile?.name &&
                c.content === comment.content
              )
          )
        );
        toast.success("Comment deleted successfully");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      toast.error(`Error deleting comment: ${error.message}`);
    } finally {
      setProcessingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(identifier);
        return newSet;
      });
      setProcessingAction((prev) => {
        const newState = { ...prev };
        delete newState[identifier];
        return newState;
      });
    }
  };

  const handleApprove = (comment) => handleStatusChange(comment, "approved");
  const handleReject = (comment) => handleStatusChange(comment, "rejected");

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Article":
        return "bg-[#ffd8f4] text-[#86296b] border border-[#f7bfe5]";
      case "File":
        return "bg-[#c3faf5] text-[#187574] border border-[#9eece4]";
      case "Quiz":
        return "bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]";
      case "Contest":
        return "bg-[#fff8e0] text-[#746019] border border-[#fde89c]";
      case "AIQuiz":
        return "bg-[#e8f5e9] text-[#1b5e20] border border-[#c8e6c9]";
      default:
        return "bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]";
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || "pending";
    if (s === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
          <CheckCircle className="w-3 h-3" />
          <span>Approved</span>
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]">
          <XCircle className="w-3 h-3" />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fffdf5] text-[#b8860b] border border-[#fde89c]">
        <Clock className="w-3 h-3" />
        <span>Pending Review</span>
      </span>
    );
  };

  const pendingCount = comments.filter((c) => c.status === "pending").length;
  const approvedCount = comments.filter((c) => c.status === "approved").length;
  const rejectedCount = comments.filter((c) => c.status === "rejected").length;
  const avgRating =
    filteredComments.length > 0
      ? (
          filteredComments.reduce((sum, c) => sum + (Number(c.rating) || 0), 0) /
          filteredComments.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6 max-w-7xl mx-auto">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              MODERATION STUDIO
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
              COMMENTS &amp; FEEDBACK
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#b8860b]" />
              <span>{pendingCount} Pending Moderation</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Comment Moderation &amp; Community Feedback
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Review student comments across Articles, Files, Quizzes and Contests. Approve genuine contributions and purge spam.
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Filter by Status:
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-hidden focus:border-[#4262ff] transition-colors"
              >
                <option value="all">All Comments ({comments.length})</option>
                <option value="pending">Pending Review ({pendingCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Filter by Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-hidden focus:border-[#4262ff] transition-colors"
              >
                <option value="all">All Categories</option>
                <option value="Article">Posts / Articles</option>
                <option value="File">Resource Files</option>
                <option value="Quiz">Quizzes</option>
                <option value="Contest">Contests</option>
                <option value="AIQuiz">AI Quizzes</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="pt-2 border-t border-[#e0e2e8] flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedFilter === "all"
                  ? "bg-[#1c1c1e] text-white"
                  : "bg-[#f7f8fa] text-[#555a6a] hover:bg-[#e0e2e8]"
              }`}
            >
              All ({comments.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("pending")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedFilter === "pending"
                  ? "bg-[#ffd02f] text-[#1c1c1e]"
                  : "bg-[#fffdf5] text-[#b8860b] border border-[#fde89c] hover:bg-[#fef9c3]"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("approved")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedFilter === "approved"
                  ? "bg-[#187574] text-white"
                  : "bg-[#c3faf5] text-[#187574] hover:bg-[#a6f4ec]"
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("rejected")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedFilter === "rejected"
                  ? "bg-[#800000] text-white"
                  : "bg-[#fbd4d4] text-[#800000] hover:bg-[#f8bebe]"
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Comments Container */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] overflow-hidden shadow-xs">
          <div className="bg-[#f5f3ff] p-5 sm:p-6 border-b border-[#ddd6fe] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#4262ff]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                User Comments ({filteredComments.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-[#555a6a]">
              Showing matching entries
            </span>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
                <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Comments...</h3>
                <p className="text-xs text-[#555a6a]">Fetching user opinions from server</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-16 space-y-3 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#c3faf5] text-[#187574] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c1e]">No Comments Found</h3>
                <p className="text-xs text-[#555a6a]">
                  No comments match your currently selected filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredComments.map((comment, index) => {
                    const identifier = `${comment.userProfile?.email}-${comment.content}`;
                    const isProcessing = processingComments.has(identifier);
                    const currentAction = processingAction[identifier];

                    return (
                      <motion.div
                        key={identifier}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="bg-[#f7f8fa] hover:bg-[#fafafa] rounded-2xl border border-[#e0e2e8] p-4 sm:p-5 space-y-4 transition-all"
                      >
                        {/* Header Bar: User & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {comment.userProfile?.avatar ? (
                              <img
                                src={comment.userProfile.avatar}
                                alt={comment.userProfile.name}
                                className="w-10 h-10 rounded-full object-cover border border-[#c7cad5]"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-sm flex items-center justify-center border border-[#e5bc29]">
                                {comment.userProfile?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm sm:text-base font-bold text-[#1c1c1e] leading-tight">
                                {comment.userProfile?.name || "Anonymous Learner"}
                              </h4>
                              <p className="text-xs text-[#555a6a]">
                                {comment.userProfile?.email || "No email"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getCategoryBadgeClass(
                                comment.category
                              )}`}
                            >
                              {comment.category === "Article" ? "Post" : comment.category}
                            </span>
                            {getStatusBadge(comment.status)}
                          </div>
                        </div>

                        {/* Comment Body */}
                        <div className="bg-white rounded-xl border border-[#c7cad5] p-4 space-y-1.5">
                          <p className="text-xs sm:text-sm text-[#1c1c1e] leading-relaxed">
                            {comment.content}
                          </p>
                        </div>

                        {/* Footer Bar: Meta info and Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#e0e2e8]">
                          <div className="flex items-center gap-4 text-xs text-[#555a6a] flex-wrap">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {comment.createdAt
                                ? new Date(comment.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })
                                : "Recent"}
                            </span>

                            {comment.rating && (
                              <span className="flex items-center gap-1 font-bold text-[#746019] bg-[#fff8e0] px-2 py-0.5 rounded-full border border-[#fde89c]">
                                <Star className="w-3 h-3 fill-[#ffd02f] text-[#ffd02f]" />
                                <span>{comment.rating} / 5</span>
                              </span>
                            )}

                            {comment.title && (
                              <span className="text-xs text-[#555a6a] font-medium truncate max-w-xs">
                                Ref: {comment.title}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 justify-end">
                            {comment.status !== "approved" && (
                              <button
                                type="button"
                                onClick={() => handleApprove(comment)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#c3faf5] hover:bg-[#a6f4ec] text-[#187574] text-xs font-bold transition-all disabled:opacity-50"
                                title="Approve comment"
                              >
                                {isProcessing && currentAction === "approved" ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>Approve</span>
                              </button>
                            )}

                            {comment.status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => handleReject(comment)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fffdf5] hover:bg-[#fef9c3] text-[#b8860b] border border-[#fde89c] text-xs font-bold transition-all disabled:opacity-50"
                                title="Reject comment"
                              >
                                {isProcessing && currentAction === "rejected" ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                                <span>Reject</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(comment)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#800000] border border-[#e3c5c5] text-xs font-bold transition-all disabled:opacity-50"
                              title="Delete permanently"
                            >
                              {isProcessing && currentAction === "delete" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Real Analytical Summary Cards */}
        {filteredComments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#c7cad5] shadow-xs text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Total Filtered
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#1c1c1e]">
                {filteredComments.length}
              </p>
              <p className="text-xs text-[#555a6a]">Community comments</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#c7cad5] shadow-xs text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Average Rating
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#746019] flex items-center justify-center gap-1">
                <Star className="w-6 h-6 fill-[#ffd02f] text-[#ffd02f]" />
                {avgRating}
              </p>
              <p className="text-xs text-[#555a6a]">Based on user reviews</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#c7cad5] shadow-xs text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Pending Action
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#b8860b]">
                {pendingCount}
              </p>
              <p className="text-xs text-[#555a6a]">Requires admin decision</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Comment;
