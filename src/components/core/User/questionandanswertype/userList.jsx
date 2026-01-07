"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, BookOpen, Loader2, AlertCircle, Calendar, X, Eye } from "lucide-react";
import { getallqnadabyId } from "../../../../services/operations/qandA";

export default function UserListQuestions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState(""); // "question" or "answer"

  // Check if question has pending reports (for showing label AND red styling)
  const hasPendingQuestionReports = (question) => {
    return question.questionReports?.some(report => 
      report.reportstatus?.toLowerCase() === 'pending'
    ) || question.questionReportStatus === 'reported';
  };

  // Check if answer has pending reports (for showing label AND red styling)
  const hasPendingAnswerReports = (question) => {
    return question.answerReports?.some(report => 
      report.reportstatus?.toLowerCase() === 'pending'
    ) || question.answerReportStatus === 'reported';
  };

  // Check if question has any reports (for modal view)
  const hasQuestionReports = (question) => {
    return question.questionReports?.length > 0;
  };

  // Check if answer has any reports (for modal view)
  const hasAnswerReports = (question) => {
    return question.answerReports?.length > 0;
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
        // Extract questions array from API response
        setData({
          questions: [
            ...(response.data.questions || [])
          ]
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'resolved':
        return <AlertCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-6">{error}</p>
          <button
            onClick={fetchQuestions}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <BookOpen size={14} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Q & A Collection
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Explore curated questions and comprehensive answers
            {data?.questions && (
              <span className="ml-2 text-indigo-600 font-medium">
                ({data.questions.length} items)
              </span>
            )}
          </p>
        </div>

        {/* Questions List */}
        <div className="mb-12">
          {data?.questions && data.questions.length > 0 ? (
            <div className="space-y-6">
              {data.questions.map((item, index) => {
                const isQuestionPending = hasPendingQuestionReports(item);
                const isAnswerPending = hasPendingAnswerReports(item);
                const showQuestionReports = hasQuestionReports(item);
                const showAnswerReports = hasAnswerReports(item);

                return (
                  <div
                    key={index}
                    className={`group bg-white border border-slate-200 rounded-xl p-8 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 backdrop-blur-sm bg-opacity-80 w-full relative`}
                  >
                    {/* Question Section */}
                    <div className="mb-6">
                      {/* Number Badge - Only red if question has pending reports */}
                      <div className={`absolute -left-4 top-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        isQuestionPending
                          ? 'bg-gradient-to-br from-red-500 to-red-600'
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      
                      {/* Question Content - Aligned from left */}
                      <div className="ml-8">
                        <div className="mb-2 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-blue-600">
                              Question:
                            </span>
                            {/* ONLY show label if there are PENDING reports */}
                            {isQuestionPending && (
                              <button
                                onClick={() => handleViewReport(item, "question")}
                                className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Reported ({item.questionReports?.length || 0})</span>
                              </button>
                            )}
                          </div>
                          <div className={`rounded-lg p-4 shadow-sm ${
                            isQuestionPending
                              ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                              : 'bg-gradient-to-r from-white to-blue-50 border border-blue-100'
                          }`}>
                            <h3 className="text-base text-left font-medium text-slate-800 leading-relaxed">
                              {item.question}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Answer Section - Aligned from left */}
                    <div className="ml-8">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-slate-900">Answer:</h4>
                        {/* ONLY show label if there are PENDING reports */}
                        {isAnswerPending && (
                          <button
                            onClick={() => handleViewReport(item, "answer")}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Reported ({item.answerReports?.length || 0})</span>
                          </button>
                        )}
                      </div>
                      <div className={`rounded-lg p-6 shadow-inner ${
                        isAnswerPending
                          ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                          : 'bg-gradient-to-r from-white to-emerald-50 border border-emerald-100'
                      }`}>
                        <p className="text-slate-700 text-left leading-relaxed font-medium">
                          {item.answer}
                        </p>
                      </div>
                    </div>

                    {/* Created At - Right bottom corner */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="text-yellow-500 w-3 h-3" />
                      <span className="bg-white text-green-500 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        {format(new Date(item.createdAt), "MMM dd, yyyy")}
                      </span>
                      <span className="bg-white text-blue-500 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        {format(new Date(item.createdAt), "hh:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No questions found</p>
              <p className="text-slate-400 mt-2">Add questions to see them listed here</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/view-your-q-and-a")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} />
            View all Q & A
          </button>
        </div>
      </div>

      {/* Report Details Modal - Still shows even for resolved/rejected reports */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-l-4 border-red-500"
            style={{
              background: 'linear-gradient(to right, #fff 0%, #fef2f2 100%)'
            }}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {reportType === "question" ? "Question Report Details" : "Answer Report Details"}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 ml-11">
                    <span className="text-xs text-slate-600">
                      {selectedReport.reports.length} report{selectedReport.reports.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 rounded-lg ml-2 flex-shrink-0"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Content Preview */}
              <div className="mb-6 space-y-4">
                {/* Question - Left aligned text */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">Q</span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">Question:</p>
                  </div>
                  <div className="ml-7 p-3 bg-white rounded border border-blue-100">
                    <p className="text-gray-900 font-medium text-left">{selectedReport.question}</p>
                  </div>
                </div>

                {/* Answer - Only show for answer reports - Left aligned text */}
                {reportType === "answer" && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <p className="text-sm text-green-600 font-medium">Answer:</p>
                    </div>
                    <div className="ml-7 p-3 bg-white rounded border border-green-100">
                      <p className="text-gray-900 font-medium text-left">{selectedReport.answer}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reports List */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Report History</h3>
                
                {selectedReport.reports.length === 0 ? (
                  <div className="text-center py-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">No reports found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedReport.reports.map((report, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-white to-slate-50 rounded-lg border border-slate-200 hover:border-red-300 transition-colors duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(report.reportstatus)}`}>
                              {getStatusIcon(report.reportstatus)}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.reportstatus)}`}>
                              {report.reportstatus || 'Pending'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {report.reportedAt ? formatDate(report.reportedAt) : 'Date not available'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-left">
                          <div className="flex items-start">
                            <span className="text-sm font-medium text-slate-700 mr-2 min-w-[60px]">Reason:</span>
                            <span className="text-slate-900 text-sm flex-1 text-left">{report.reason}</span>
                          </div>
                          
                          <div className="flex items-start">
                            <span className="text-sm font-medium text-slate-700 mr-2 min-w-[60px]">Description:</span>
                            <span className="text-slate-900 text-sm flex-1 text-left">{report.description}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200"
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