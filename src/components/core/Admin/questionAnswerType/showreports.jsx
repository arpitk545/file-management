"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, AlertCircle, BookOpen, Filter, Search, Eye, EyeOff, CheckCircle, XCircle, MessageSquare, ImageIcon } from "lucide-react";
import { getAllQandA, updateQandA, deleteQandA } from "../../../../services/operations/qandA";
import { updateReportStatus } from "../../../../services/operations/qandA";
import toast from "react-hot-toast";

const ReportStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="w-3 h-3" /> },
    resolved: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
  };

  const config = statusConfig[status?.toLowerCase()] || { color: "bg-gray-100 text-gray-800", icon: null };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
    </span>
  );
};

export default function ShowReport() {
  const [qandas, setQandas] = useState([]);
  const [filteredQandas, setFilteredQandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch all Q&A data
  useEffect(() => {
    fetchQandAs();
  }, []);

  const fetchQandAs = async () => {
    try {
      setLoading(true);
      const response = await getAllQandA();
      if (response?.success) {
        const data = response.data || [];
        setQandas(data);
        setFilteredQandas(data);
      } else {
        throw new Error("Failed to fetch Q&A data");
      }
    } catch (error) {
      console.error("Error fetching Q&A:", error);
      toast.error("Failed to load Q&A data");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search - MODIFIED to only show pending reports
  useEffect(() => {
    let result = qandas;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((qanda) =>
        qanda.chapterName?.toLowerCase().includes(searchLower) ||
        qanda.category?.region?.toLowerCase().includes(searchLower) ||
        qanda.category?.subject?.toLowerCase().includes(searchLower) ||
        qanda.questions?.some((q) =>
          q.question?.toLowerCase().includes(searchLower) ||
          q.answer?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply status filter - MODIFIED: Default shows only pending
    if (statusFilter !== "all") {
      result = result.filter((qanda) => {
        return qanda.questions?.some((q) => {
          const hasQuestionReport = q.questionReports?.some((r) =>
            r.reportstatus?.toLowerCase() === statusFilter.toLowerCase()
          );
          const hasAnswerReport = q.answerReports?.some((r) =>
            r.reportstatus?.toLowerCase() === statusFilter.toLowerCase()
          );
          return hasQuestionReport || hasAnswerReport;
        });
      });
    } else {
      // Default: Show only questions/answers with pending reports
      result = result.filter((qanda) => {
        return qanda.questions?.some((q) => {
          const hasPendingQuestionReport = q.questionReports?.some((r) =>
            r.reportstatus?.toLowerCase() === "pending"
          );
          const hasPendingAnswerReport = q.answerReports?.some((r) =>
            r.reportstatus?.toLowerCase() === "pending"
          );
          return hasPendingQuestionReport || hasPendingAnswerReport;
        });
      });
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((qanda) => {
        if (typeFilter === "question") {
          return qanda.questions?.some((q) => 
            q.questionReports?.some((r) => r.reportstatus?.toLowerCase() === "pending")
          );
        } else if (typeFilter === "answer") {
          return qanda.questions?.some((q) => 
            q.answerReports?.some((r) => r.reportstatus?.toLowerCase() === "pending")
          );
        }
        return true;
      });
    }

    setFilteredQandas(result);
  }, [searchTerm, statusFilter, typeFilter, qandas]);

  // Handle hide/show toggle for question or answer separately
  const handleToggleVisibility = async (qandaId, questionId, type, currentShow) => {
    try {
      const newShowValue = currentShow === "show" ? "hide" : "show";
      const data = {
        type: type, // "question" or "answer"
        reportshow: newShowValue,
      };

      const response = await updateReportStatus(qandaId, questionId, data);
      console.log("Update visibility response:", response);

      if (response.success) {
        // Update local state
        setQandas((prev) =>
          prev.map((qanda) => {
            if (qanda._id === qandaId) {
              const updatedQuestions = qanda.questions?.map((q) => {
                if (q._id === questionId) {
                  if (type === "question") {
                    return { ...q, questionReportShow: newShowValue };
                  } else {
                    return { ...q, answerReportShow: newShowValue };
                  }
                }
                return q;
              });
              return { ...qanda, questions: updatedQuestions };
            }
            return qanda;
          })
        );

        toast.success(
          `${type === "question" ? "Question" : "Answer"} ${
            newShowValue === "hide" ? "hidden" : "shown"
          } successfully!`
        );
      } else {
        toast.error(response.message || "Failed to update visibility");
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  // Handle resolve/reject for reports
  const handleUpdateReportStatus = async (qandaId, questionId, type, newStatus) => {
    try {
      console.log("Updating report status:", { qandaId, questionId, type, newStatus });
      
      const data = {
        type: type,
        reportstatus: newStatus,
      };

      const response = await updateReportStatus(qandaId, questionId, data);
      console.log("Update report status response:", response);

      if (response.success) {
        // Update local state
        setQandas((prev) =>
          prev.map((qanda) => {
            if (qanda._id === qandaId) {
              const updatedQuestions = qanda.questions?.map((q) => {
                if (q._id === questionId) {
                  if (type === "question") {
                    const updatedQuestionReports = (q.questionReports || []).map((report) => ({
                      ...report,
                      reportstatus: newStatus,
                    }));
                    
                    return {
                      ...q,
                      questionReports: updatedQuestionReports,
                      questionReportStatus: newStatus === "resolved" ? "resolved" : q.questionReportStatus,
                    };
                  } else if (type === "answer") {
                    const updatedAnswerReports = (q.answerReports || []).map((report) => ({
                      ...report,
                      reportstatus: newStatus,
                    }));
                    
                    return {
                      ...q,
                      answerReports: updatedAnswerReports,
                      answerReportStatus: newStatus === "resolved" ? "resolved" : q.answerReportStatus,
                    };
                  }
                }
                return q;
              });
              return { ...qanda, questions: updatedQuestions };
            }
            return qanda;
          })
        );

        toast.success(
          `${type === "question" ? "Question" : "Answer"} report ${newStatus} successfully!`
        );
        
        // Refresh the list after status change
        fetchQandAs();
      } else {
        toast.error(response.message || "Failed to update report status");
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    }
  };

  const handleDeleteQuestion = async (qandaId, questionIndex) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await deleteQandA(qandaId, questionIndex);

      if (response.success) {
        setQandas((prev) =>
          prev.map((q) => {
            if (q._id === qandaId) {
              const updatedQuestions = q.questions.filter((_, index) => index !== questionIndex);
              return { ...q, questions: updatedQuestions };
            }
            return q;
          })
        );
        
        // Refresh the list after deletion
        fetchQandAs();
        toast.success("Question deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleEditQanda = (qandaId) => {
    window.location.href = `/edit-qanda/${qandaId}`;
  };

  // Helper function to get pending reports count
  const getPendingReportsCount = (reports) => {
    return reports?.filter((r) => r.reportstatus?.toLowerCase() === "pending")?.length || 0;
  };

  const getTotalReports = () => {
    return qandas.reduce((total, qanda) => {
      const questionReports = qanda.questions?.reduce(
        (qTotal, q) => qTotal + getPendingReportsCount(q.questionReports),
        0
      );
      const answerReports = qanda.questions?.reduce(
        (qTotal, q) => qTotal + getPendingReportsCount(q.answerReports),
        0
      );
      return total + questionReports + answerReports;
    }, 0);
  };

  const getPendingReports = () => {
    return qandas.reduce((total, qanda) => {
      const pendingQuestionReports = qanda.questions?.reduce(
        (qTotal, q) => qTotal + getPendingReportsCount(q.questionReports),
        0
      );
      const pendingAnswerReports = qanda.questions?.reduce(
        (qTotal, q) => qTotal + getPendingReportsCount(q.answerReports),
        0
      );
      return total + pendingQuestionReports + pendingAnswerReports;
    }, 0);
  };

  const getResolvedReports = () => {
    return qandas.reduce((total, qanda) => {
      const resolvedQuestionReports = qanda.questions?.reduce(
        (qTotal, q) =>
          qTotal +
          (q.questionReports?.filter((r) => r.reportstatus?.toLowerCase() === "resolved")?.length || 0),
        0
      );
      const resolvedAnswerReports = qanda.questions?.reduce(
        (qTotal, q) =>
          qTotal + (q.answerReports?.filter((r) => r.reportstatus?.toLowerCase() === "resolved")?.length || 0),
        0
      );
      return total + resolvedQuestionReports + resolvedAnswerReports;
    }, 0);
  };

  const getRejectedReports = () => {
    return qandas.reduce((total, qanda) => {
      const rejectedQuestionReports = qanda.questions?.reduce(
        (qTotal, q) =>
          qTotal +
          (q.questionReports?.filter((r) => r.reportstatus?.toLowerCase() === "rejected")?.length || 0),
        0
      );
      const rejectedAnswerReports = qanda.questions?.reduce(
        (qTotal, q) =>
          qTotal + (q.answerReports?.filter((r) => r.reportstatus?.toLowerCase() === "rejected")?.length || 0),
        0
      );
      return total + rejectedQuestionReports + rejectedAnswerReports;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl text-center font-bold text-slate-900">Pending Reports Management</h1>
                <p className="text-slate-600">Review and manage pending reports only</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Pending: {getPendingReports()} reports
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions, answers, chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter - MODIFIED: Default shows pending only */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending Reports</option>
                  <option value="all">All Status</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Both Types</option>
                  <option value="question">Question Reports</option>
                  <option value="answer">Answer Reports</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "pending" || typeFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("pending");
                    setTypeFilter("all");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Q&A List */}
        {filteredQandas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending reports found</h3>
            <p className="text-slate-600">
              {qandas.length === 0
                ? "No Q&A data available"
                : "All reports have been resolved or rejected"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQandas.map((qanda) => {
              const totalPendingQuestionReports = (qanda.questions || []).reduce(
                (total, q) => total + getPendingReportsCount(q.questionReports),
                0
              );
              const totalPendingAnswerReports = (qanda.questions || []).reduce(
                (total, q) => total + getPendingReportsCount(q.answerReports),
                0
              );
              const totalPendingReports = totalPendingQuestionReports + totalPendingAnswerReports;

              if (totalPendingReports === 0) return null;

              return (
                <div key={qanda._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Q&A Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{qanda.chapterName || "Untitled Chapter"}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Region: {qanda.category?.region || "N/A"}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Subject: {qanda.category?.subject || "N/A"}
                          </span>
                          {totalPendingQuestionReports > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {totalPendingQuestionReports} Pending Question Reports
                            </span>
                          )}
                          {totalPendingAnswerReports > 0 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              {totalPendingAnswerReports} Pending Answer Reports
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Questions with Reports */}
                  <div className="p-6">
                    {(qanda.questions || []).map((question, qIndex) => {
                      // Get pending reports only
                      const pendingQuestionReports = question.questionReports?.filter((r) => 
                        r.reportstatus?.toLowerCase() === "pending"
                      ) || [];
                      const pendingAnswerReports = question.answerReports?.filter((r) => 
                        r.reportstatus?.toLowerCase() === "pending"
                      ) || [];

                      const hasPendingQuestionReports = pendingQuestionReports.length > 0;
                      const hasPendingAnswerReports = pendingAnswerReports.length > 0;

                      if (!hasPendingQuestionReports && !hasPendingAnswerReports) return null;

                      // Check if question or answer is hidden
                      const isQuestionHidden = question.questionReportShow === "hide";
                      const isAnswerHidden = question.answerReportShow === "hide";

                      return (
                        <div key={question._id} className="mb-8 last:mb-0 border border-slate-200 rounded-lg p-4">
                          {/* Question Header with Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-600">
                                Question {qIndex + 1}
                              </span>
                              {hasPendingQuestionReports && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  {pendingQuestionReports.length} Pending Question Report{pendingQuestionReports.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              {hasPendingAnswerReports && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                  {pendingAnswerReports.length} Pending Answer Report{pendingAnswerReports.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {/* Hide/Show Question Button - Only show if has pending question reports */}
                              {hasPendingQuestionReports && (
                                <button
                                  onClick={() =>
                                    handleToggleVisibility(
                                      qanda._id,
                                      question._id,
                                      "question",
                                      question.questionReportShow
                                    )
                                  }
                                  className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1 ${
                                    isQuestionHidden
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-blue-500 hover:bg-blue-600 text-white"
                                  }`}
                                  title={isQuestionHidden ? "Show Question" : "Hide Question"}
                                >
                                  {isQuestionHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  {isQuestionHidden ? "Show Question" : "Hide Question"}
                                </button>
                              )}

                              {/* Hide/Show Answer Button - Only show if has pending answer reports */}
                              {hasPendingAnswerReports && (
                                <button
                                  onClick={() =>
                                    handleToggleVisibility(
                                      qanda._id,
                                      question._id,
                                      "answer",
                                      question.answerReportShow
                                    )
                                  }
                                  className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1 ${
                                    isAnswerHidden
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-blue-500 hover:bg-blue-600 text-white"
                                  }`}
                                  title={isAnswerHidden ? "Show Answer" : "Hide Answer"}
                                >
                                  {isAnswerHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  {isAnswerHidden ? "Show Answer" : "Hide Answer"}
                                </button>
                              )}

                              {/* Edit Button - Only show if there are visible pending reports */}
                              {(hasPendingQuestionReports && !isQuestionHidden) || 
                               (hasPendingAnswerReports && !isAnswerHidden) ? (
                                <button
                                  onClick={() => handleEditQanda(qanda._id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                                  title="Edit Q&A"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              ) : null}
                            </div>
                          </div>

                          {/* Question Section with Image and Reports Below */}
                          {hasPendingQuestionReports && (
                            <div className="mb-6">
                              {/* Show Question Content only if not hidden */}
                              {!isQuestionHidden ? (
                                <>
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                      <h3 className="text-lg font-semibold text-slate-900">Question:</h3>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-3">
                                      <p className="text-slate-800 text-left">{question.question}</p>
                                    </div>
                                    
                                    {/* Question Image - Show if available with increased width */}
                                    {question.questionImage && question.questionImage !== null && (
                                      <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <ImageIcon className="w-4 h-4 text-blue-600" />
                                          <span className="text-sm font-medium text-slate-700">Question Image:</span>
                                        </div>
                                        <div className="border border-blue-200 rounded-lg overflow-hidden w-full max-w-3xl">
                                          <img 
                                            src={question.questionImage} 
                                            alt="Question" 
                                            className="w-full h-auto max-h-96 object-contain"
                                            onError={(e) => {
                                              e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Question Reports - Below question content */}
                                  <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                      <h4 className="text-md font-semibold text-slate-900">
                                        Question Reports ({pendingQuestionReports.length})
                                      </h4>
                                    </div>
                                    <div className="space-y-3">
                                      {pendingQuestionReports.map((report, rIndex) => (
                                        <div key={report._id || rIndex} className="p-4 bg-red-50 rounded-lg border border-red-200">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                              <ReportStatusBadge status={report.reportstatus} />
                                              <span className="text-sm text-slate-600">
                                                {new Date(report.reportedAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() =>
                                                  handleUpdateReportStatus(
                                                    qanda._id,
                                                    question._id,
                                                    "question",
                                                    "resolved"
                                                  )
                                                }
                                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                                              >
                                                <CheckCircle className="w-3 h-3" />
                                                Mark Resolved
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleUpdateReportStatus(
                                                    qanda._id,
                                                    question._id,
                                                    "question",
                                                    "rejected"
                                                  )
                                                }
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                                              >
                                                <XCircle className="w-3 h-3" />
                                                Mark Rejected
                                              </button>
                                            </div>
                                          </div>
                                          <div className="space-y-2 text-left">
                                            <div>
                                              <span className="text-sm font-medium text-slate-700 mr-2">Reason:</span>
                                              <span className="text-slate-900 text-sm">{report.reason}</span>
                                            </div>
                                            <div>
                                              <span className="text-sm font-medium text-slate-700 mr-2">Description:</span>
                                              <span className="text-slate-900 text-sm">{report.description}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                // Hidden Question Message
                                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <EyeOff className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-left">Question is hidden</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Answer Section with Reports Below */}
                          {hasPendingAnswerReports && (
                            <div className={hasPendingQuestionReports ? "mt-6 pt-6 border-t border-slate-200" : ""}>
                              {/* Show Answer Content only if not hidden */}
                              {!isAnswerHidden ? (
                                <>
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                      <h3 className="text-lg font-semibold text-slate-900">Answer:</h3>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded border border-green-200 mb-3">
                                      <p className="text-slate-800 text-left">{question.answer}</p>
                                    </div>
                                  </div>

                                  {/* Answer Reports - Below answer content */}
                                  <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                      <h4 className="text-md font-semibold text-slate-900">
                                        Answer Reports ({pendingAnswerReports.length})
                                      </h4>
                                    </div>
                                    <div className="space-y-3">
                                      {pendingAnswerReports.map((report, rIndex) => (
                                        <div key={report._id || rIndex} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                              <ReportStatusBadge status={report.reportstatus} />
                                              <span className="text-sm text-slate-600">
                                                {new Date(report.reportedAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() =>
                                                  handleUpdateReportStatus(
                                                    qanda._id,
                                                    question._id,
                                                    "answer",
                                                    "resolved"
                                                  )
                                                }
                                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                                              >
                                                <CheckCircle className="w-3 h-3" />
                                                Mark Resolved
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleUpdateReportStatus(
                                                    qanda._id,
                                                    question._id,
                                                    "answer",
                                                    "rejected"
                                                  )
                                                }
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                                              >
                                                <XCircle className="w-3 h-3" />
                                                Mark Rejected
                                              </button>
                                            </div>
                                          </div>
                                          <div className="space-y-2 text-left">
                                            <div>
                                              <span className="text-sm font-medium text-slate-700 mr-2">Reason:</span>
                                              <span className="text-slate-900 text-sm">{report.reason}</span>
                                            </div>
                                            <div>
                                              <span className="text-sm font-medium text-slate-700 mr-2">Description:</span>
                                              <span className="text-slate-900 text-sm">{report.description}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                // Hidden Answer Message
                                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <EyeOff className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-left">Answer is hidden</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Delete Button - Only show if there are visible pending reports */}
                          {((hasPendingQuestionReports && !isQuestionHidden) || 
                            (hasPendingAnswerReports && !isAnswerHidden)) && (
                            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
                              <button
                                onClick={() => handleDeleteQuestion(qanda._id, qIndex)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete This Question
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {filteredQandas.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reports Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{filteredQandas.length}</p>
                <p className="text-sm text-slate-600">Chapters with Pending Reports</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{getPendingReports()}</p>
                <p className="text-sm text-slate-600">Pending Reports</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-700">{getResolvedReports()}</p>
                <p className="text-sm text-slate-600">Total Resolved</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-700">{getRejectedReports()}</p>
                <p className="text-sm text-slate-600">Total Rejected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}