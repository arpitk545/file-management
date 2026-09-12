"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  BookOpen, 
  AlertCircle, 
  Calendar, 
  X, 
  Eye, 
  Sparkles, 
  FileText, 
  MessageSquare 
} from "lucide-react";
import { getallqnadabyId } from "../../../../services/operations/qandA";

export default function UserListQuestions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState("");

  const hasPendingQuestionReports = (question) => {
    return question.questionReports?.some(report =>
      report.reportstatus?.toLowerCase() === 'pending'
    ) || question.questionReportStatus === 'reported';
  };

  const hasPendingAnswerReports = (question) => {
    return question.answerReports?.some(report =>
      report.reportstatus?.toLowerCase() === 'pending'
    ) || question.answerReportStatus === 'reported';
  };

  const hasQuestionReports = (question) => {
    return (question.questionReports?.length || 0) > 0;
  };

  const hasAnswerReports = (question) => {
    return (question.answerReports?.length || 0) > 0;
  };

  useEffect(() => {
    if (id) {
      fetchQuestions();
    }
  }, [id]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getallqnadabyId(id);

      if (response?.success) {
        setData({
          chapterName: response.data?.chapterName,
          category: response.data?.category,
          thumbnail: response.data?.thumbnail,
          questions: [...(response.data.questions || [])]
        });
      } else {
        throw new Error('Failed to fetch Q&A data');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions and answers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (question, type) => {
    const reports = type === "question" ? question.questionReports : question.answerReports;

    if (reports && reports.length > 0) {
      setSelectedReport({
        type,
        reports: reports || [],
        question: question.question,
        answer: question.answer,
        createdAt: question.createdAt
      });
      setReportType(type);
      setShowReportModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
    setReportType("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#ffd02f] border-t-[#1c1c1e] animate-spin mb-4" />
        <p className="text-[#1c1c1e] font-semibold text-lg">Loading Chapter Module...</p>
        <p className="text-[#6b6f7e] text-sm mt-1">Retrieving questions and solution keys</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="bg-white border border-[#e0e2e8] rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#fbd4d4] text-[#991b1b] flex items-center justify-center mx-auto font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1c1c1e]">Unable to Load Module</h2>
          <p className="text-xs text-[#6b6f7e]">{error}</p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#f7f8fa] hover:bg-[#eef0f3] text-[#1c1c1e] border border-[#c7cad5]"
            >
              Go Back
            </button>
            <button
              onClick={fetchQuestions}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-[#1c1c1e] p-4 sm:p-6 lg:p-8 space-y-6">
      <style>{`
        .qna-html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          font-size: 0.875rem;
          background: #ffffff;
          border: 1px solid #e0e2e8;
          border-radius: 0.5rem;
        }
        .qna-html-content th, .qna-html-content td {
          border: 1px solid #e0e2e8;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .qna-html-content th {
          background-color: #f7f8fa;
          font-weight: 600;
          color: #1c1c1e;
        }
        .qna-html-content code {
          background-color: #f5f3ff;
          color: #4262ff;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
      `}</style>

      {/* Top Banner */}
      <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                <Sparkles className="w-3.5 h-3.5" />
                Curriculum Chapter
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                {data?.questions?.length || 0} Total Problems
              </span>
              {data?.category?.region && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c3faf5] text-[#187574]">
                  {data.category.region}
                </span>
              )}
              {data?.category?.examType && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                  {data.category.examType}
                </span>
              )}
              {data?.category?.specificClass && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffd8f4] text-[#86296b]">
                  {data.category.specificClass}
                </span>
              )}
              {data?.category?.subject && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff8e0] text-[#746019]">
                  {data.category.subject}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              {data?.chapterName || "Curated Question Set"}
            </h1>
            <p className="text-[#555a6a] text-sm sm:text-base max-w-2xl">
              Step-by-step problem statements and verified answer keys for this curriculum unit.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-white hover:bg-[#f7f8fa] border border-[#c7cad5] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {data?.questions && data.questions.length > 0 ? (
          data.questions.map((item, index) => {
            const isQuestionPending = hasPendingQuestionReports(item);
            const isAnswerPending = hasPendingAnswerReports(item);

            return (
              <div
                key={index}
                className="w-full bg-white border border-[#e0e2e8] hover:border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-sm transition-all relative space-y-5"
              >
                {/* Header Row: Q-Number & Moderation Tags */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        isQuestionPending
                          ? "bg-[#fbd4d4] text-[#800000]"
                          : "bg-[#ffd02f] text-[#1c1c1e]"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Question #{index + 1}
                    </span>
                    {item.questiontype && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                        {item.questiontype}
                      </span>
                    )}
                  </div>

                  {/* Flagged Status */}
                  {(isQuestionPending || isAnswerPending) && (
                    <button
                      onClick={() => handleViewReport(item, isQuestionPending ? "question" : "answer")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fbd4d4] text-[#800000] hover:bg-[#ffc6c6] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Reported Issue
                    </button>
                  )}
                </div>

                {/* Problem Statement Box */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Problem Statement
                  </span>
                  <div
                    className="p-5 rounded-xl bg-[#fafbfc] border border-[#eef0f3] text-base text-[#1c1c1e] leading-relaxed qna-html-content"
                    dangerouslySetInnerHTML={{ __html: item.question }}
                  />
                </div>

                {/* Answer / Solution Box */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00875a] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Verified Solution & Explanation
                  </span>
                  <div
                    className="p-5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-sm text-[#1c1c1e] leading-relaxed qna-html-content"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </div>

                {/* Meta details footer */}
                <div className="flex items-center justify-between text-xs text-[#8e91a0] pt-3 border-t border-[#eef0f3]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#ffd02f]" />
                    {item.createdAt
                      ? format(new Date(item.createdAt), "MMM dd, yyyy • hh:mm a")
                      : "Curriculum Item"}
                  </span>
                  {(hasQuestionReports(item) || hasAnswerReports(item)) && (
                    <button
                      onClick={() => handleViewReport(item, hasQuestionReports(item) ? "question" : "answer")}
                      className="text-xs font-semibold text-[#4262ff] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Moderation Log
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-[#8e91a0] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1c1c1e] mb-1">No Questions Found</h3>
            <p className="text-xs text-[#6b6f7e] mb-4">This chapter doesn't have any published questions yet.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-full text-xs font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm"
            >
              Go Back
            </button>
          </div>
        )}
      </div>

      {/* Bottom Back Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] rounded-full font-bold text-sm shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Question List
        </button>
      </div>

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#e0e2e8]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fbd4d4] text-[#800000] flex items-center justify-center font-bold">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1c1c1e]">
                      {reportType === "question" ? "Question Report Logs" : "Answer Report Logs"}
                    </h3>
                    <p className="text-xs text-[#6b6f7e]">{selectedReport.reports.length} report submission(s)</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-[#f7f8fa] text-[#6b6f7e]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedReport.reports.map((rep, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1c1c1e]">{rep.reason}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#fbd4d4] text-[#800000]">
                        {rep.reportstatus || "Pending"}
                      </span>
                    </div>
                    <p className="text-[#555a6a]">{rep.description}</p>
                    {rep.reportedAt && (
                      <p className="text-[10px] text-[#8e91a0]">{formatDate(rep.reportedAt)}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#eef0f3] flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-[#1c1c1e] text-white hover:bg-[#2c2c34]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}