"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  AlertCircle,
  Calendar,
  X,
  Eye,
  Filter,
  ChevronDown,
  Tag,
  XCircle,
  ImageIcon,
  Maximize2,
  Plus,
  Layers,
  Sparkles,
  Search,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { getallqnadabyId, getAllQuestionTypes } from "../../../../services/operations/qandA";

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
  const [searchQuery, setSearchQuery] = useState("");

  const hasQuestionImage = (question) => {
    return Boolean(question.questionImage && question.questionImage.trim() !== "");
  };

  const hasAnswerImage = (question) => {
    return Boolean(question.answerImage && question.answerImage.trim() !== "");
  };

  const handleImageClick = (imageUrl, type, alt = "") => {
    setSelectedImage(imageUrl);
    setSelectedImageType(type);
    setSelectedImageAlt(alt || `${type} image`);
    setShowImageModal(true);
  };

  const groupQuestionsByType = (questions) => {
    const grouped = {};
    let filteredQuestions = questions || [];

    if (selectedQuestionType !== "all") {
      filteredQuestions = filteredQuestions.filter((item) =>
        (item.questiontype || "Uncategorized") === selectedQuestionType
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredQuestions = filteredQuestions.filter((item) =>
        item.question?.toLowerCase().includes(query) ||
        item.answer?.toLowerCase().includes(query)
      );
    }

    const availableTypes = new Set();
    filteredQuestions?.forEach((item) => {
      const type = item.questiontype || "Uncategorized";
      availableTypes.add(type);
    });

    const filteredQuestionTypes = Array.from(availableTypes);

    filteredQuestions?.forEach((item) => {
      const type = item.questiontype || "Uncategorized";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });

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
    return (question.questionReports?.length || 0) > 0;
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
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-[#fffdf5] text-[#b8860b] border border-[#fde89c]';
      case 'resolved':
        return 'bg-[#c3faf5] text-[#187574] border border-[#9eece4]';
      case 'rejected':
        return 'bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]';
      default:
        return 'bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]';
    }
  };

  const clearFilters = () => {
    setSelectedQuestionType("all");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-sm max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Questions...</h3>
          <p className="text-xs text-[#555a6a]">Fetching chapter contents and questions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-8 text-center space-y-4 shadow-sm max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-[#fbd4d4] text-[#800000] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1c1c1e]">Error Loading Questions</h3>
            <p className="text-xs text-[#800000] mt-1">{error}</p>
          </div>
          <button
            onClick={fetchQuestions}
            className="px-5 py-2.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold text-xs shadow-sm transition-all"
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

  const availableQuestionTypes = Array.from(
    new Set(data?.questions?.map(q => q.questiontype).filter(Boolean) || [])
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/view-qa")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Q&amp;A List</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              QUESTION INSPECTOR
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              CURRICULUM VIEW
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/create-qanda/${id}`)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Questions</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            {data?.chapterName || "Q&A Chapter Collection"}
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Review, inspect formulas, solutions, and examine student report logs for this curriculum chapter.
          </p>
        </div>

        {/* Taxonomy Context Banner (Lavender Miro Card) */}
        <div className="bg-[#f5f3ff] rounded-2xl border border-[#ddd6fe] p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#ddd6fe]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#4262ff] text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
                Curriculum Classification &amp; Metrics
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              {totalQuestions} Total Questions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Region</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {data?.category?.region || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Exam Type</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {data?.category?.examType || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Class</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {data?.category?.specificClass || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Subject</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {data?.category?.subject || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe] col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Chapter Title</span>
              <strong className="text-xs sm:text-sm text-[#4262ff] truncate block">
                {data?.chapterName || "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#4262ff]" />
              <h3 className="text-sm font-bold text-[#1c1c1e]">
                Filter &amp; Search Questions
              </h3>
            </div>

            {(selectedQuestionType !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#800000] bg-[#fbd4d4] hover:bg-[#f8bebe] self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-[#555a6a] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search within questions or solution text..."
                className="w-full h-11 min-h-[44px] pl-10 pr-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all placeholder-[#8e92a0]"
              />
            </div>

            <div>
              <select
                value={selectedQuestionType}
                onChange={(e) => setSelectedQuestionType(e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
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
            </div>
          </div>

          <div className="text-xs text-[#555a6a] pt-1">
            Showing <strong>{filteredQuestionCount}</strong> of <strong>{totalQuestions}</strong> questions
            {selectedQuestionType !== "all" && ` • Filtered by type: "${selectedQuestionType}"`}
          </div>
        </div>

        {/* Grouped Questions Display */}
        {Object.keys(groupedQuestions).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedQuestions).map(([questionType, questions]) => (
              <div key={questionType} className="space-y-4">
                
                {/* Type Header Pill */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e0e2e8]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-6 rounded-full bg-[#4262ff]" />
                    <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                      {questionType}
                    </h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
                      {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                </div>

                {/* Question Cards */}
                <div className="space-y-4">
                  {questions.map((item, index) => {
                    const isQuestionPending = hasPendingQuestionReports(item);
                    const isAnswerPending = hasPendingAnswerReports(item);
                    const questionHasImg = hasQuestionImage(item);
                    const answerHasImg = hasAnswerImage(item);

                    return (
                      <div
                        key={item._id || index}
                        className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm hover:border-[#1c1c1e] transition-colors"
                      >
                        {/* Question Item Top Bar */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${
                                isQuestionPending || isAnswerPending
                                  ? "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
                                  : "bg-[#ffd02f] text-[#1c1c1e]"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                                Question #{index + 1}
                              </span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f3ff] text-[#4262ff]">
                                {item.questiontype || "Standard"}
                              </span>
                            </div>
                          </div>

                          {/* Student Report Indicator */}
                          {(isQuestionPending || isAnswerPending) && (
                            <button
                              type="button"
                              onClick={() => handleViewReport(item, isQuestionPending ? "question" : "answer")}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbd4d4] hover:bg-[#f8bebe] text-[#800000] text-xs font-bold transition-all"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Report Flagged</span>
                            </button>
                          )}
                        </div>

                        {/* Question Statement */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff] block">
                            Question Statement:
                          </span>
                          <div
                            className="text-sm sm:text-base font-medium text-[#1c1c1e] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item.question }}
                          />

                          {/* Question Diagram Thumbnail */}
                          {questionHasImg && (
                            <div className="pt-2">
                              <div className="flex items-center justify-between pb-1.5">
                                <span className="text-xs font-bold text-[#555a6a] flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-[#4262ff]" />
                                  <span>Attached Diagram</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleImageClick(item.questionImage, "question", `Question ${index + 1}`)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#4262ff] hover:underline"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Enlarge Image</span>
                                </button>
                              </div>
                              <div
                                onClick={() => handleImageClick(item.questionImage, "question", `Question ${index + 1}`)}
                                className="inline-block p-2 rounded-xl border border-[#c7cad5] bg-[#f7f8fa] hover:bg-[#fffdf5] cursor-pointer transition-colors max-w-sm"
                              >
                                <img
                                  src={item.questionImage}
                                  alt="Question diagram"
                                  className="max-h-48 rounded-lg object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Answer / Solution Box */}
                        <div className="bg-[#fffdf5] border border-[#fde89c] rounded-xl p-5 sm:p-6 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#187574] text-white flex items-center justify-center text-xs font-bold">
                              A
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#187574]">
                              Step-by-Step Solution &amp; Answer:
                            </span>
                          </div>

                          <div
                            className="text-sm text-[#1c1c1e] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item.answer }}
                          />

                          {/* Answer Diagram Thumbnail */}
                          {answerHasImg && (
                            <div className="pt-2 border-t border-[#fde89c]">
                              <div className="flex items-center justify-between pb-1.5">
                                <span className="text-xs font-bold text-[#555a6a] flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-[#187574]" />
                                  <span>Solution Figure</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleImageClick(item.answerImage, "answer", `Solution ${index + 1}`)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#187574] hover:underline"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Enlarge Figure</span>
                                </button>
                              </div>
                              <div
                                onClick={() => handleImageClick(item.answerImage, "answer", `Solution ${index + 1}`)}
                                className="inline-block p-2 rounded-xl border border-[#fde89c] bg-white hover:bg-[#f7f8fa] cursor-pointer transition-colors max-w-sm"
                              >
                                <img
                                  src={item.answerImage}
                                  alt="Solution figure"
                                  className="max-h-48 rounded-lg object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-3 shadow-sm">
            <BookOpen className="w-10 h-10 text-[#8e92a0] mx-auto" />
            <h3 className="text-base font-bold text-[#1c1c1e]">No Questions Match Filter</h3>
            <p className="text-xs text-[#555a6a]">
              Try resetting your search query or question type filter.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] text-xs font-bold hover:bg-[#f7f8fa]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-[#1c1c1e]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#c7cad5] max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0e2e8]">
              <h3 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
                {selectedImageAlt || "Enlarged Diagram View"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-[#f7f8fa] text-[#555a6a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center p-2 bg-[#f7f8fa] rounded-xl">
              <img
                src={selectedImage}
                alt={selectedImageAlt}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold text-xs shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-[#1c1c1e]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#c7cad5] max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#fbd4d4] text-[#800000]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c1e]">
                  Student Reports Log
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-[#f7f8fa] text-[#555a6a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedReport.reports.map((report, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(report.reportstatus)}`}>
                      {report.reportstatus || "Pending"}
                    </span>
                    <span className="text-[#555a6a]">{formatDate(report.reportedAt)}</span>
                  </div>
                  <div>
                    <strong className="text-[#1c1c1e]">Reason: </strong>
                    <span className="text-[#555a6a]">{report.reason || "N/A"}</span>
                  </div>
                  <div>
                    <strong className="text-[#1c1c1e]">Details: </strong>
                    <span className="text-[#555a6a]">{report.description || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#e0e2e8]">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] font-bold text-xs hover:bg-[#f7f8fa]"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}