"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, BookOpen, Loader2, AlertCircle, Calendar, X, Eye, Filter, ChevronDown, Tag, XCircle, ImageIcon, Maximize2 } from "lucide-react";
import { getallqnadabyId } from "../../../../services/operations/qandA";
import { getAllQuestionTypes } from "../../../../services/operations/qandA";

export default function ListQuestions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState("");

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageType, setSelectedImageType] = useState("");
  const [selectedImageAlt, setSelectedImageAlt] = useState("");

  // Filter states
  const [questionTypes, setQuestionTypes] = useState([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if question or answer has images
  const hasQuestionImage = (question) => {
    return question.questionImage && question.questionImage.trim() !== "";
  };

  const hasAnswerImage = (question) => {
    return question.answerImage && question.answerImage.trim() !== "";
  };

  // Handle image click
  const handleImageClick = (imageUrl, type, alt = "") => {
    setSelectedImage(imageUrl);
    setSelectedImageType(type);
    setSelectedImageAlt(alt || `${type} image`);
    setShowImageModal(true);
  };

  // Group questions by questiontype
  const groupQuestionsByType = (questions) => {
    const grouped = {};
    
    let filteredQuestions = questions || [];
    
    // Filter by selected question type
    if (selectedQuestionType !== "all") {
      filteredQuestions = filteredQuestions.filter((item) => 
        (item.questiontype || "Uncategorized") === selectedQuestionType
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredQuestions = filteredQuestions.filter((item) => 
        item.question?.toLowerCase().includes(query) || 
        item.answer?.toLowerCase().includes(query)
      );
    }
    
    // Get unique question types from filtered questions
    const availableTypes = new Set();
    filteredQuestions?.forEach((item) => {
      const type = item.questiontype || "Uncategorized";
      availableTypes.add(type);
    });
    
    // Only show question types that are actually present in filtered results
    const filteredQuestionTypes = Array.from(availableTypes);
    
    // Group the filtered questions
    filteredQuestions?.forEach((item) => {
      const type = item.questiontype || "Uncategorized";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });
    
    // Sort groups by type name
    const sortedGrouped = {};
    filteredQuestionTypes.sort().forEach(type => {
      if (grouped[type]) {
        sortedGrouped[type] = grouped[type];
      }
    });
    
    return sortedGrouped;
  };

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
    return question.questionReports?.length > 0;
  };


  useEffect(() => {
    if (id) {
      fetchQuestions();
      fetchQuestionTypesList();
    }
  }, [id]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getallqnadabyId(id);
      
      if (response?.success) {
        setData(response.data);
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

  const fetchQuestionTypesList = async () => {
    try {
      const response = await getAllQuestionTypes();
      if (response?.data) {
        setQuestionTypes(response.data.map(type => type.name));
      }
    } catch (error) {
      console.error("Error fetching question types:", error);
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
        questionImage: question.questionImage,
        answerImage: question.answerImage,
        createdAt: question.createdAt
      });
      setReportType(type);
      setShowReportModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setShowImageModal(false);
    setSelectedReport(null);
    setReportType("");
    setSelectedImage("");
    setSelectedImageType("");
    setSelectedImageAlt("");
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

  const clearFilters = () => {
    setSelectedQuestionType("all");
    setSearchQuery("");
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

  const groupedQuestions = groupQuestionsByType(data?.questions);
  const totalQuestions = data?.questions?.length || 0;
  const filteredQuestionCount = Object.values(groupedQuestions).flat().length;
  
  // Get question types that are actually present in the current data
  const availableQuestionTypes = Array.from(
    new Set(data?.questions?.map(q => q.questiontype).filter(Boolean) || [])
  );

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BookOpen size={14} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                  Q & A Collection
                </h1>
                <p className="text-slate-600">
                  {totalQuestions} questions • {data?.chapterName}
                </p>
              </div>
            </div>
            
          </div>

          {/* Category Details - First row: Region, Class/Exam Type, Class */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Region */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Region</label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>{data?.category?.region || "No region"}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Class/Exam Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Class/Exam Type</label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>{data?.category?.examType || "No exam type"}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Class */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Class</label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>{data?.category?.specificClass || "No class"}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Second row: Subject, Chapter, Question Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Subject */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Subject</label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>{data?.category?.subject || "No subject"}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Chapter</label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>{data?.chapterName || "No chapter"}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Question Type Filter - Always shown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Question Type</label>
              <div className="relative">
                <select
                  value={selectedQuestionType}
                  onChange={(e) => setSelectedQuestionType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types ({totalQuestions})</option>
                  {availableQuestionTypes.sort().map((type) => {
                    const count = data?.questions?.filter(q => q.questiontype === type).length || 0;
                    return (
                      <option key={type} value={type}>
                        {type} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filter Section - Simplified */}
          {showFilters && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Filter Options</h3>
                {(selectedQuestionType !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    <XCircle className="w-3 h-3" />
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Results Count */}
              <div className="text-sm text-slate-600">
                Showing {filteredQuestionCount} of {totalQuestions} questions
                {selectedQuestionType !== "all" && ` • Filtered by: ${selectedQuestionType}`}
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="mb-12">
          {Object.keys(groupedQuestions).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedQuestions).map(([questionType, questions]) => (
                <div key={questionType} className="space-y-4">
                  {/* Simple One-line Question Type Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                      <h2 className="text-xl font-bold text-slate-800">{questionType}</h2>
                      <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                      </span>
                    </div>
                  </div>

                  {/* Questions under this type */}
                  {questions.map((item, index) => {
                    const isQuestionPending = hasPendingQuestionReports(item);
                    const isAnswerPending = hasPendingAnswerReports(item);
                    const questionHasImage = hasQuestionImage(item);
                    const answerHasImage = hasAnswerImage(item);

                    return (
                      <div
                        key={item._id || index}
                        className={`group bg-white border border-slate-200 rounded-xl p-8 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 backdrop-blur-sm bg-opacity-80 w-full relative`}
                      >
                        {/* Question Section */}
                        <div className="mb-6">
                          {/* Number Badge - Only red if question has pending reports */}
                          <div 
                            onClick={() => hasQuestionReports(item) && handleViewReport(item, "question")}
                            className={`absolute -left-4 top-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${hasQuestionReports(item) ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
                              isQuestionPending
                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}
                            title={hasQuestionReports(item) ? "Click to view reports" : "No reports"}
                          >
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          
                          {/* Question Content - Aligned from left */}
                          <div className="ml-8">
                            <div className="mb-4 text-left">
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
                                <h3 className="text-base text-left font-medium text-slate-800 leading-relaxed mb-3">
                                  {item.question}
                                </h3>
                                
                                {/* Question Image - Small Preview */}
                                {questionHasImage && (
                                  <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-blue-600">
                                          Question Image:
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleImageClick(item.questionImage, "question", `Question ${index + 1}`)}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        <Maximize2 className="w-3 h-3" />
                                        <span>View Full</span>
                                      </button>
                                    </div>
                                    <div 
                                      className="relative group cursor-pointer bg-gray-50 rounded-lg border border-blue-200 p-2 hover:bg-blue-50 transition-all duration-200"
                                      onClick={() => handleImageClick(item.questionImage, "question", `Question ${index + 1}`)}
                                    >
                                      <div className="flex items-center justify-center">
                                        <img
                                          src={item.questionImage}
                                          alt={`Question ${index + 1}`}
                                          className="max-h-40 w-auto object-contain rounded transition-transform duration-300 group-hover:scale-105"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/300x150?text=Image+Not+Found";
                                          }}
                                        />
                                      </div>
                                      <div className="absolute inset-0 bg-blue-900 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-lg"></div>
                                    </div>
                                  </div>
                                )}
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
                            <p className="text-slate-700 text-left leading-relaxed font-medium mb-3">
                              {item.answer}
                            </p>
                            
                            {/* Answer Image - Small Preview */}
                            {answerHasImage && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-emerald-600">
                                      Answer Image:
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleImageClick(item.answerImage, "answer", `Answer ${index + 1}`)}
                                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800"
                                  >
                                    <Maximize2 className="w-3 h-3" />
                                    <span>View Full</span>
                                  </button>
                                </div>
                                <div 
                                  className="relative group cursor-pointer bg-gray-50 rounded-lg border border-emerald-200 p-2 hover:bg-emerald-50 transition-all duration-200"
                                  onClick={() => handleImageClick(item.answerImage, "answer", `Answer ${index + 1}`)}
                                >
                                  <div className="flex items-center justify-center">
                                    <img
                                      src={item.answerImage}
                                      alt={`Answer ${index + 1}`}
                                      className="max-h-40 w-auto object-contain rounded transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/300x150?text=Image+Not+Found";
                                      }}
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-emerald-900 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-lg"></div>
                                </div>
                              </div>
                            )}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg">No questions found</p>
              {(selectedQuestionType !== "all") && (
                <p className="text-slate-400 mt-2">
                  No questions match your filter criteria.
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear filters to see all questions
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/view-qa")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} />
            View all Q & A
          </button>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="relative w-full max-w-6xl max-h-[95vh]">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-12 right-0 p-3 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {selectedImageType === "question" ? "Question Image" : "Answer Image"}
                    </h3>
                    <p className="text-white/70 text-sm">{selectedImageAlt}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(selectedImage, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-sm">Open in New Tab</span>
                </button>
              </div>
            </div>
            
            {/* Image Container */}
            <div className="relative h-full flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt={selectedImageAlt}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                  }}
                />
                
              </div>
            </div>
            
            {/* Click Outside to Close */}
            <div 
              className="absolute inset-0 -z-10"
              onClick={handleCloseModal}
            />
          </div>
        </div>
      )}

      {/* Report Details Modal - Updated to show question image */}
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
                  
                  {/* Question Image in Modal if exists */}
                  {selectedReport.questionImage && (
                    <div className="ml-7 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          <p className="text-sm text-blue-600 font-medium">Question Image:</p>
                        </div>
                        <button
                          onClick={() => handleImageClick(selectedReport.questionImage, "question", "Question Image")}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>View Full</span>
                        </button>
                      </div>
                      <div 
                        className="relative group cursor-pointer bg-gray-50 rounded-lg border border-blue-200 p-2 hover:bg-blue-50 transition-all duration-200"
                        onClick={() => handleImageClick(selectedReport.questionImage, "question", "Question Image")}
                      >
                        <div className="flex items-center justify-center">
                          <img
                            src={selectedReport.questionImage}
                            alt="Question"
                            className="max-h-40 w-auto object-contain rounded transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/300x150?text=Image+Not+Found";
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-blue-900 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-lg"></div>
                      </div>
                    </div>
                  )}
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
                    
                    {/* Answer Image in Modal if exists */}
                    {selectedReport.answerImage && (
                      <div className="ml-7 mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-600 font-medium">Answer Image:</p>
                          </div>
                          <button
                            onClick={() => handleImageClick(selectedReport.answerImage, "answer", "Answer Image")}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>View Full</span>
                          </button>
                        </div>
                        <div 
                          className="relative group cursor-pointer bg-gray-50 rounded-lg border border-green-200 p-2 hover:bg-green-50 transition-all duration-200"
                          onClick={() => handleImageClick(selectedReport.answerImage, "answer", "Answer Image")}
                        >
                          <div className="flex items-center justify-center">
                            <img
                              src={selectedReport.answerImage}
                              alt="Answer"
                              className="max-h-40 w-auto object-contain rounded transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/300x150?text=Image+Not+Found";
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-green-900 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-lg"></div>
                        </div>
                      </div>
                    )}
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