"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  AlertCircle,
  BookOpen,
  Filter,
  Search,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  MessageSquare,
  ImageIcon,
  ArrowLeft,
  Layers,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Maximize2,
  X
} from "lucide-react";
import { getAllQandA, updateQandA, deleteQandA, updateReportStatus } from "../../../../services/operations/qandA";
import toast from "react-hot-toast";

const ReportStatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || "pending";
  if (s === "resolved") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
        <CheckCircle className="w-3 h-3" />
        <span>Resolved</span>
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
      <AlertCircle className="w-3 h-3" />
      <span>Pending</span>
    </span>
  );
};

export default function ShowReport() {
  const navigate = useNavigate();
  const [qandas, setQandas] = useState([]);
  const [filteredQandas, setFilteredQandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lightboxImage, setLightboxImage] = useState(null);

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

  useEffect(() => {
    let result = qandas;

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

    setFilteredQandas(result);
  }, [searchTerm, statusFilter, qandas]);

  const handleUpdateReportStatus = async (qandaId, questionId, reportType, newStatus) => {
    try {
      await updateReportStatus(qandaId, questionId, reportType, newStatus);
      toast.success(`Report marked as ${newStatus}!`);
      fetchQandAs();
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    }
  };

  const handleToggleVisibility = async (qandaId, questionId, itemType, currentShowStatus) => {
    try {
      const newShowStatus = currentShowStatus === "hide" ? "show" : "hide";
      const qandaToUpdate = qandas.find((q) => q._id === qandaId);
      if (!qandaToUpdate) return;

      const updatedQuestions = qandaToUpdate.questions.map((q) => {
        if (q._id === questionId) {
          if (itemType === "question") {
            return { ...q, questionReportShow: newShowStatus };
          } else {
            return { ...q, answerReportShow: newShowStatus };
          }
        }
        return q;
      });

      await updateQandA(qandaId, { questions: updatedQuestions });
      toast.success(`${itemType === "question" ? "Question" : "Answer"} ${newShowStatus === "hide" ? "hidden" : "visible"}!`);
      fetchQandAs();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to toggle visibility");
    }
  };

  const handleEditQanda = (qandaId) => {
    navigate(`/edit-qanda/${qandaId}`);
  };

  const getPendingReportsCount = (reports) => {
    return reports?.filter((r) => r.reportstatus?.toLowerCase() === "pending")?.length || 0;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-sm max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Reports...</h3>
          <p className="text-xs text-[#555a6a]">Fetching moderation flags &amp; history</p>
        </div>
      </div>
    );
  }

  const pendingCount = getPendingReports();

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              MODERATION STUDIO
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]">
              STUDENT REPORTS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#800000]" />
              <span>{pendingCount} Pending Reports</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Student Flagged Reports &amp; Corrections
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Investigate student complaints, fix incorrect question/answer keys, and resolve or reject flagged items.
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-[#555a6a] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions, answers, reasons, chapters..."
                className="w-full h-11 min-h-[44px] pl-10 pr-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all placeholder-[#8e92a0]"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
              >
                <option value="pending">● Pending Reports Only</option>
                <option value="all">All Report Statuses</option>
                <option value="resolved">Resolved Reports</option>
                <option value="rejected">Rejected Reports</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Content List */}
        {filteredQandas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-3 shadow-sm">
            <CheckCircle className="w-12 h-12 text-[#187574] mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
              No Pending Reports Found
            </h3>
            <p className="text-xs sm:text-sm text-[#555a6a] max-w-sm mx-auto">
              All student flags have been reviewed, resolved, or rejected!
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
                <div
                  key={qanda._id}
                  className="bg-white rounded-2xl border border-[#c7cad5] overflow-hidden shadow-sm space-y-6"
                >
                  {/* Chapter Header */}
                  <div className="bg-[#f5f3ff] p-5 sm:p-6 border-b border-[#ddd6fe] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                          Chapter
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]">
                          {totalPendingReports} Pending Flag{totalPendingReports !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                        {qanda.chapterName || "Untitled Chapter"}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      {qanda.category?.region && (
                        <span className="font-semibold px-2.5 py-0.5 rounded-full bg-[#c3faf5] text-[#187574]">
                          {qanda.category.region}
                        </span>
                      )}
                      {qanda.category?.subject && (
                        <span className="font-semibold px-2.5 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e]">
                          {qanda.category.subject}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditQanda(qanda._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] text-xs font-bold hover:bg-[#f7f8fa]"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Chapter</span>
                      </button>
                    </div>
                  </div>

                  {/* Flagged Questions */}
                  <div className="p-5 sm:p-7 space-y-6">
                    {(qanda.questions || []).map((question, qIndex) => {
                      const pendingQuestionReports = question.questionReports?.filter(
                        (r) => r.reportstatus?.toLowerCase() === "pending"
                      ) || [];
                      const pendingAnswerReports = question.answerReports?.filter(
                        (r) => r.reportstatus?.toLowerCase() === "pending"
                      ) || [];

                      const hasPendingQuestion = pendingQuestionReports.length > 0;
                      const hasPendingAnswer = pendingAnswerReports.length > 0;

                      if (!hasPendingQuestion && !hasPendingAnswer) return null;

                      const isQuestionHidden = question.questionReportShow === "hide";
                      const isAnswerHidden = question.answerReportShow === "hide";

                      return (
                        <div
                          key={question._id}
                          className="bg-[#f7f8fa] rounded-2xl border border-[#e0e2e8] p-5 sm:p-6 space-y-5"
                        >
                          {/* Question Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
                                {qIndex + 1}
                              </span>
                              <h3 className="text-sm font-bold text-[#1c1c1e]">
                                Question #{qIndex + 1}
                              </h3>
                              {hasPendingQuestion && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fbd4d4] text-[#800000]">
                                  {pendingQuestionReports.length} Question Report{pendingQuestionReports.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              {hasPendingAnswer && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fffdf5] text-[#b8860b] border border-[#fde89c]">
                                  {pendingAnswerReports.length} Answer Report{pendingAnswerReports.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {hasPendingQuestion && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleVisibility(
                                      qanda._id,
                                      question._id,
                                      "question",
                                      question.questionReportShow
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold hover:bg-[#f7f8fa]"
                                >
                                  {isQuestionHidden ? <Eye className="w-3.5 h-3.5 text-[#187574]" /> : <EyeOff className="w-3.5 h-3.5 text-[#800000]" />}
                                  <span>{isQuestionHidden ? "Show Question" : "Hide Question"}</span>
                                </button>
                              )}

                              {hasPendingAnswer && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleVisibility(
                                      qanda._id,
                                      question._id,
                                      "answer",
                                      question.answerReportShow
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold hover:bg-[#f7f8fa]"
                                >
                                  {isAnswerHidden ? <Eye className="w-3.5 h-3.5 text-[#187574]" /> : <EyeOff className="w-3.5 h-3.5 text-[#800000]" />}
                                  <span>{isAnswerHidden ? "Show Answer" : "Hide Answer"}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Question Section & its reports */}
                          {hasPendingQuestion && (
                            <div className="space-y-3">
                              <div className="bg-white rounded-xl border border-[#c7cad5] p-4 space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff] block">
                                  Question Statement:
                                </span>
                                {!isQuestionHidden ? (
                                  <>
                                    <div
                                      className="text-xs sm:text-sm text-[#1c1c1e] leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: question.question }}
                                    />
                                    {question.questionImage && question.questionImage.trim() !== "" && (
                                      <div className="pt-2 border-t border-[#eef0f3] mt-2">
                                        <div className="flex items-center justify-between pb-1.5">
                                          <span className="text-xs font-bold text-[#555a6a] flex items-center gap-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-[#4262ff]" />
                                            <span>Attached Question Diagram</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setLightboxImage({
                                                url: question.questionImage,
                                                title: `Question #${qIndex + 1} Diagram`
                                              })
                                            }
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#4262ff] hover:underline"
                                          >
                                            <Maximize2 className="w-3 h-3" />
                                            <span>Enlarge</span>
                                          </button>
                                        </div>
                                        <div
                                          onClick={() =>
                                            setLightboxImage({
                                              url: question.questionImage,
                                              title: `Question #${qIndex + 1} Diagram`
                                            })
                                          }
                                          className="inline-block p-1.5 rounded-xl border border-[#c7cad5] bg-[#f7f8fa] hover:bg-[#fffdf5] cursor-pointer transition-colors max-w-xs"
                                        >
                                          <img
                                            src={question.questionImage}
                                            alt="Question diagram"
                                            className="max-h-40 rounded-lg object-contain"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-[#800000] italic">
                                    Question is currently hidden from students.
                                  </span>
                                )}
                              </div>

                              {/* Student reports list for question */}
                              <div className="space-y-2.5">
                                {pendingQuestionReports.map((report, rIndex) => (
                                  <div
                                    key={report._id || rIndex}
                                    className="bg-[#fffdf5] rounded-xl border border-[#fde89c] p-4 space-y-3"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <ReportStatusBadge status={report.reportstatus} />
                                        <span className="text-xs text-[#555a6a]">
                                          {new Date(report.reportedAt).toLocaleDateString()}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdateReportStatus(
                                              qanda._id,
                                              question._id,
                                              "question",
                                              "resolved"
                                            )
                                          }
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#c3faf5] hover:bg-[#a6f4ec] text-[#187574] text-xs font-bold"
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Resolve</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdateReportStatus(
                                              qanda._id,
                                              question._id,
                                              "question",
                                              "rejected"
                                            )
                                          }
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fbd4d4] hover:bg-[#f8bebe] text-[#800000] text-xs font-bold"
                                        >
                                          <XCircle className="w-3 h-3" />
                                          <span>Reject</span>
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                      <div>
                                        <strong className="text-[#1c1c1e]">Reason: </strong>
                                        <span className="text-[#555a6a]">{report.reason}</span>
                                      </div>
                                      <div>
                                        <strong className="text-[#1c1c1e]">Description: </strong>
                                        <span className="text-[#555a6a]">{report.description}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Answer Section & its reports */}
                          {hasPendingAnswer && (
                            <div className="space-y-3 pt-2">
                              <div className="bg-[#fffdf5] rounded-xl border border-[#fde89c] p-4 space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#187574] block">
                                  Answer / Solution:
                                </span>
                                {!isAnswerHidden ? (
                                  <>
                                    <div
                                      className="text-xs sm:text-sm text-[#1c1c1e] leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: question.answer }}
                                    />
                                    {question.answerImage && question.answerImage.trim() !== "" && (
                                      <div className="pt-2 border-t border-[#fde89c] mt-2">
                                        <div className="flex items-center justify-between pb-1.5">
                                          <span className="text-xs font-bold text-[#555a6a] flex items-center gap-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-[#187574]" />
                                            <span>Attached Solution Diagram</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setLightboxImage({
                                                url: question.answerImage,
                                                title: `Question #${qIndex + 1} Solution Diagram`
                                              })
                                            }
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#187574] hover:underline"
                                          >
                                            <Maximize2 className="w-3 h-3" />
                                            <span>Enlarge</span>
                                          </button>
                                        </div>
                                        <div
                                          onClick={() =>
                                            setLightboxImage({
                                              url: question.answerImage,
                                              title: `Question #${qIndex + 1} Solution Diagram`
                                            })
                                          }
                                          className="inline-block p-1.5 rounded-xl border border-[#fde89c] bg-[#fffdf5] hover:bg-white cursor-pointer transition-colors max-w-xs"
                                        >
                                          <img
                                            src={question.answerImage}
                                            alt="Answer diagram"
                                            className="max-h-40 rounded-lg object-contain"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-[#800000] italic">
                                    Answer is currently hidden from students.
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2.5">
                                {pendingAnswerReports.map((report, rIndex) => (
                                  <div
                                    key={report._id || rIndex}
                                    className="bg-[#fffdf5] rounded-xl border border-[#fde89c] p-4 space-y-3"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <ReportStatusBadge status={report.reportstatus} />
                                        <span className="text-xs text-[#555a6a]">
                                          {new Date(report.reportedAt).toLocaleDateString()}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdateReportStatus(
                                              qanda._id,
                                              question._id,
                                              "answer",
                                              "resolved"
                                            )
                                          }
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#c3faf5] hover:bg-[#a6f4ec] text-[#187574] text-xs font-bold"
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Resolve</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdateReportStatus(
                                              qanda._id,
                                              question._id,
                                              "answer",
                                              "rejected"
                                            )
                                          }
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fbd4d4] hover:bg-[#f8bebe] text-[#800000] text-xs font-bold"
                                        >
                                          <XCircle className="w-3 h-3" />
                                          <span>Reject</span>
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                      <div>
                                        <strong className="text-[#1c1c1e]">Reason: </strong>
                                        <span className="text-[#555a6a]">{report.reason}</span>
                                      </div>
                                      <div>
                                        <strong className="text-[#1c1c1e]">Description: </strong>
                                        <span className="text-[#555a6a]">{report.description}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
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

      </div>

      {/* Diagram Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#c7cad5] p-5 max-w-3xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e0e2e8] pb-3">
              <h3 className="font-bold text-sm sm:text-base text-[#1c1c1e]">{lightboxImage.title}</h3>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-full hover:bg-[#f7f8fa] text-[#555a6a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-[#f7f8fa] rounded-xl border border-[#e0e2e8]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] object-contain rounded-lg shadow-xs"
              />
            </div>
            <div className="flex justify-end pt-2 border-t border-[#e0e2e8]">
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-4 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e] hover:bg-[#f7f8fa]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}