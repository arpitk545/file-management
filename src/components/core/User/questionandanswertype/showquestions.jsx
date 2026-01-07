"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Loader2, AlertCircle,  X, Flag, MessageSquare, Eye, Clock, CheckCircle, XCircle, Filter, ChevronDown, Tag, Image as ImageIcon, Maximize2 } from "lucide-react";
import { getAllQandA, reportQuestion, reportAnswer } from "../../../../services/operations/qandA";
import toast from "react-hot-toast";

export default function ShowqnadaQuestions() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showReportDetailsModal, setShowReportDetailsModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportDetails, setReportDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageType, setSelectedImageType] = useState(""); // 'question' or 'answer'
  const [selectedImageAlt, setSelectedImageAlt] = useState("");

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedChapter, setSelectedChapter] = useState("all");

  // Available filter options
  const [availableRegions, setAvailableRegions] = useState([]);
  const [availableExamTypes, setAvailableExamTypes] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState([]);

  // Check if question has pending reports
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

  const hasAnswerReports = (question) => {
    return question.answerReports?.length > 0;
  };

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

  // Extract unique values for filters
  const extractFilterOptions = (questions) => {
    const regions = new Set();
    const examTypes = new Set();
    const classes = new Set();
    const subjects = new Set();
    const chapters = new Set();
    const questionTypes = new Set();

    questions.forEach(q => {
      if (q.category?.region) regions.add(q.category.region);
      if (q.category?.examType) examTypes.add(q.category.examType);
      if (q.category?.specificClass) classes.add(q.category.specificClass);
      if (q.category?.subject) subjects.add(q.category.subject);
      if (q.chapterName) chapters.add(q.chapterName);
      if (q.questiontype) questionTypes.add(q.questiontype);
    });

    return {
      regions: Array.from(regions).sort(),
      examTypes: Array.from(examTypes).sort(),
      classes: Array.from(classes).sort(),
      subjects: Array.from(subjects).sort(),
      chapters: Array.from(chapters).sort(),
      questionTypes: Array.from(questionTypes).sort()
    };
  };

  // Filter questions based on all selected filters
  const filterQuestions = () => {
    let filtered = [...questions];

    if (selectedRegion !== "all") {
      filtered = filtered.filter(q => q.category?.region === selectedRegion);
    }

    if (selectedExamType !== "all") {
      filtered = filtered.filter(q => q.category?.examType === selectedExamType);
    }

    if (selectedClass !== "all") {
      filtered = filtered.filter(q => q.category?.specificClass === selectedClass);
    }

    if (selectedSubject !== "all") {
      filtered = filtered.filter(q => q.category?.subject === selectedSubject);
    }

    if (selectedChapter !== "all") {
      filtered = filtered.filter(q => q.chapterName === selectedChapter);
    }

    if (selectedQuestionType !== "all") {
      filtered = filtered.filter(q => q.questiontype === selectedQuestionType);
    }

    setFilteredQuestions(filtered);
  };

  // Group questions by questiontype
  const groupQuestionsByType = (questions) => {
    const grouped = {};
    
    questions?.forEach((item) => {
      const type = item.questiontype || "Uncategorized";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });
    
    // Sort groups by type name
    const sortedGrouped = {};
    Object.keys(grouped).sort().forEach(type => {
      sortedGrouped[type] = grouped[type];
    });
    
    return sortedGrouped;
  };

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await getAllQandA();
        if (response?.success) {
          const qandaData = response.data || [];
          
          // Filter only ACTIVE Q&A entries and flatten their questions
          const allQuestions = qandaData
            .filter(qanda => qanda.status === 'active') // Only include active Q&A
            .flatMap(qanda =>
              (qanda.questions || []).map((q, index) => ({
                ...q,
                qandaId: qanda._id,
                qandaStatus: qanda.status, // Include status for reference
                chapterName: qanda.chapterName, // Include chapter name
                category: qanda.category, // Include category
                questionIndex: index,
                id: `${qanda._id}-${index}`,
                // Determine if question or answer has pending reports
                hasPendingQuestionReports: hasPendingQuestionReports(q),
                hasPendingAnswerReports: hasPendingAnswerReports(q),
                // Determine if question or answer has any reports
                hasQuestionReports: hasQuestionReports(q),
                hasAnswerReports: hasAnswerReports(q),
                // Check for images
                hasQuestionImage: hasQuestionImage(q),
                hasAnswerImage: hasAnswerImage(q),
                questionReportStatus: q.questionReportStatus || 'not reported',
                answerReportStatus: q.answerReportStatus || 'not reported',
                // Ensure arrays exist
                questionReports: q.questionReports || [],
                answerReports: q.answerReports || []
              }))
            );
          
          setQuestions(allQuestions);
          setFilteredQuestions(allQuestions);
          
          // Extract filter options
          const filterOptions = extractFilterOptions(allQuestions);
          setAvailableRegions(filterOptions.regions);
          setAvailableExamTypes(filterOptions.examTypes);
          setAvailableClasses(filterOptions.classes);
          setAvailableSubjects(filterOptions.subjects);
          setAvailableChapters(filterOptions.chapters);
          setAvailableQuestionTypes(filterOptions.questionTypes);
        } else {
          throw new Error(response?.message || "Failed to fetch questions");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    filterQuestions();
  }, [
    selectedRegion, 
    selectedExamType, 
    selectedClass, 
    selectedSubject, 
    selectedChapter, 
    selectedQuestionType,
    questions
  ]);

  const handleQuestionReportClick = (question, index) => {
    setSelectedQuestion(question);
    setSelectedQuestionIndex(index);
    setReportType("question");
    setShowQuestionModal(true);
    setReportReason("");
    setReportDescription("");
  };

  const handleAnswerReportClick = (question, index) => {
    setSelectedQuestion(question);
    setSelectedQuestionIndex(index);
    setReportType("answer");
    setShowAnswerModal(true);
    setReportReason("");
    setReportDescription("");
  };

  const handleViewReportDetails = (question, type) => {
    setSelectedQuestion(question);
    setReportType(type);
    
    const reports = type === "question" ? question.questionReports : question.answerReports;
    const reportStatus = type === "question" ? question.questionReportStatus : question.answerReportStatus;
    
    setReportDetails({
      type,
      reports: reports || [],
      status: reportStatus,
      question: question.question,
      answer: question.answer
    });
    
    setShowReportDetailsModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !reportDescription.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!selectedQuestion || selectedQuestionIndex === null) {
      toast.error("No question selected");
      return;
    }

    try {
      setSubmitting(true);

      const reportData = {
        reason: reportReason.trim(),
        description: reportDescription.trim()
      };

      let response;
      
      if (reportType === "question") {
        response = await reportQuestion(
          selectedQuestion.qandaId,
          selectedQuestion._id,
          reportData
        );
      } else {
        response = await reportAnswer(
          selectedQuestion.qandaId,
          selectedQuestion._id,
          reportData
        );
      }

      if (response?.success) {
        toast.success(`Report submitted successfully!`);
        
        setQuestions(prevQuestions =>
          prevQuestions.map(q => {
            if (q.id === selectedQuestion.id) {
              const updatedQuestion = {
                ...q,
                questionReportStatus: reportType === "question" ? "reported" : q.questionReportStatus,
                answerReportStatus: reportType === "answer" ? "reported" : q.answerReportStatus,
                hasPendingQuestionReports: reportType === "question" ? true : q.hasPendingQuestionReports,
                hasPendingAnswerReports: reportType === "answer" ? true : q.hasPendingAnswerReports,
                hasQuestionReports: reportType === "question" ? true : q.hasQuestionReports,
                hasAnswerReports: reportType === "answer" ? true : q.hasAnswerReports,
                questionReports: reportType === "question" 
                  ? [
                      ...(q.questionReports || []),
                      {
                        reason: reportReason,
                        description: reportDescription,
                        reportstatus: "Pending",
                        reportedAt: new Date().toISOString()
                      }
                    ]
                  : q.questionReports,
                answerReports: reportType === "answer"
                  ? [
                      ...(q.answerReports || []),
                      {
                        reason: reportReason,
                        description: reportDescription,
                        reportstatus: "Pending",
                        reportedAt: new Date().toISOString()
                      }
                    ]
                  : q.answerReports
              };
              
              return updatedQuestion;
            }
            return q;
          })
        );

        if (reportType === "question") {
          setShowQuestionModal(false);
        } else {
          setShowAnswerModal(false);
        }

        setReportReason("");
        setReportDescription("");
        setSelectedQuestion(null);
        setSelectedQuestionIndex(null);
        setReportType("");
      } else {
        throw new Error(response?.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Full error submitting report:", error);
      toast.error(error.message || "Failed to submit report. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowQuestionModal(false);
    setShowAnswerModal(false);
    setShowReportDetailsModal(false);
    setShowImageModal(false);
    setReportReason("");
    setReportDescription("");
    setSelectedQuestion(null);
    setSelectedQuestionIndex(null);
    setReportType("");
    setReportDetails(null);
    setSelectedImage("");
    setSelectedImageType("");
    setSelectedImageAlt("");
  };

  const clearFilters = () => {
    setSelectedRegion("all");
    setSelectedExamType("all");
    setSelectedClass("all");
    setSelectedSubject("all");
    setSelectedChapter("all");
    setSelectedQuestionType("all");
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
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
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

  const groupedQuestions = groupQuestionsByType(filteredQuestions);
  const totalQuestions = questions.length;
  const filteredQuestionCount = filteredQuestions.length;

  // Check if any filter is active
  const isFilterActive = 
    selectedRegion !== "all" || 
    selectedExamType !== "all" || 
    selectedClass !== "all" || 
    selectedSubject !== "all" || 
    selectedChapter !== "all" || 
    selectedQuestionType !== "all";

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
                  {totalQuestions} active questions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Category Details - First row: Region, Class/Exam Type, Class */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Region */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Region</label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Regions ({availableRegions.length})</option>
                  {availableRegions.map((region) => {
                    const count = questions.filter(q => q.category?.region === region).length;
                    return (
                      <option key={region} value={region}>
                        {region} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Class/Exam Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Class/Exam Type</label>
              <div className="relative">
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types ({availableExamTypes.length})</option>
                  {availableExamTypes.map((type) => {
                    const count = questions.filter(q => q.category?.examType === type).length;
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

            {/* Class */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Class</label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Classes ({availableClasses.length})</option>
                  {availableClasses.map((cls) => {
                    const count = questions.filter(q => q.category?.specificClass === cls).length;
                    return (
                      <option key={cls} value={cls}>
                        {cls} ({count})
                      </option>
                    );
                  })}
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
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Subjects ({availableSubjects.length})</option>
                  {availableSubjects.map((subject) => {
                    const count = questions.filter(q => q.category?.subject === subject).length;
                    return (
                      <option key={subject} value={subject}>
                        {subject} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Chapter</label>
              <div className="relative">
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Chapters ({availableChapters.length})</option>
                  {availableChapters.map((chapter) => {
                    const count = questions.filter(q => q.chapterName === chapter).length;
                    return (
                      <option key={chapter} value={chapter}>
                        {chapter} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Question Type Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Question Type</label>
              <div className="relative">
                <select
                  value={selectedQuestionType}
                  onChange={(e) => setSelectedQuestionType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types ({availableQuestionTypes.length})</option>
                  {availableQuestionTypes.map((type) => {
                    const count = questions.filter(q => q.questiontype === type).length;
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

          {/* Filter Section */}
          {showFilters && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Filter Options</h3>
                {isFilterActive && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    <XCircle className="w-3 h-3" />
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Results Count */}
              <div className="text-sm text-slate-600">
                Showing {filteredQuestionCount} of {totalQuestions} questions
                {selectedRegion !== "all" && ` • Region: ${selectedRegion}`}
                {selectedExamType !== "all" && ` • Exam Type: ${selectedExamType}`}
                {selectedClass !== "all" && ` • Class: ${selectedClass}`}
                {selectedSubject !== "all" && ` • Subject: ${selectedSubject}`}
                {selectedChapter !== "all" && ` • Chapter: ${selectedChapter}`}
                {selectedQuestionType !== "all" && ` • Question Type: ${selectedQuestionType}`}
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No questions found</p>
            {isFilterActive && (
              <p className="text-slate-400 mt-2">
                No questions match your filter criteria.
                <button
                  onClick={clearFilters}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  Clear filters
                </button>
              </p>
            )}
          </div>
        ) : (
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
                    {questions.map((q, index) => {
                      const isQuestionPending = q.hasPendingQuestionReports;
                      const isAnswerPending = q.hasPendingAnswerReports;
                      const questionHasImage = q.hasQuestionImage;
                      const answerHasImage = q.hasAnswerImage;

                      return (
                        <div
                          key={q.id}
                          className={`group bg-white border border-slate-200 rounded-xl p-8 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 backdrop-blur-sm bg-opacity-80 w-full relative`}
                        >
                          {/* Question Section */}
                          <div className="mb-6">
                            {/* Number Badge */}
                            <div className={`absolute -left-4 top-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                              isQuestionPending
                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}>
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            
                            {/* Question Content */}
                            <div className="ml-8">
                              <div className="mb-4 text-left">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold text-blue-600">
                                    Question:
                                  </span>
                                  {isQuestionPending && (
                                    <button
                                      onClick={() => handleViewReportDetails(q, "question")}
                                      className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Reported ({q.questionReports?.length || 0})</span>
                                    </button>
                                  )}
                                </div>
                                <div className={`rounded-lg p-4 shadow-sm ${
                                  isQuestionPending
                                    ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                                    : 'bg-gradient-to-r from-white to-blue-50 border border-blue-100'
                                }`}>
                                  <h3 className="text-base text-left font-medium text-slate-800 leading-relaxed mb-3">
                                    {q.question || "No question text"}
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
                                          onClick={() => handleImageClick(q.questionImage, "question", `Question ${index + 1}`)}
                                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          <Maximize2 className="w-3 h-3" />
                                          <span>View Full</span>
                                        </button>
                                      </div>
                                      <div 
                                        className="relative group cursor-pointer bg-gray-50 rounded-lg border border-blue-200 p-2 hover:bg-blue-50 transition-all duration-200"
                                        onClick={() => handleImageClick(q.questionImage, "question", `Question ${index + 1}`)}
                                      >
                                        <div className="flex items-center justify-center">
                                          <img
                                            src={q.questionImage}
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

                          {/* Answer Section */}
                          <div className="ml-8">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-slate-900">Answer:</h4>
                              {isAnswerPending && (
                                <button
                                  onClick={() => handleViewReportDetails(q, "answer")}
                                  className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Reported ({q.answerReports?.length || 0})</span>
                                </button>
                              )}
                            </div>
                            <div className={`rounded-lg p-6 shadow-inner ${
                              isAnswerPending
                                ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                                : 'bg-gradient-to-r from-white to-emerald-50 border border-emerald-100'
                            }`}>
                              <p className="text-slate-700 text-left leading-relaxed font-medium mb-3">
                                {q.answer || "No answer text"}
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
                                      onClick={() => handleImageClick(q.answerImage, "answer", `Answer ${index + 1}`)}
                                      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800"
                                    >
                                      <Maximize2 className="w-3 h-3" />
                                      <span>View Full</span>
                                    </button>
                                  </div>
                                  <div 
                                    className="relative group cursor-pointer bg-gray-50 rounded-lg border border-emerald-200 p-2 hover:bg-emerald-50 transition-all duration-200"
                                    onClick={() => handleImageClick(q.answerImage, "answer", `Answer ${index + 1}`)}
                                  >
                                    <div className="flex items-center justify-center">
                                      <img
                                        src={q.answerImage}
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

                          {/* Report Buttons */}
                          <div className="flex flex-wrap gap-2 mt-4 sm:mt-6 ml-8">
                            <button
                              onClick={() => handleQuestionReportClick(q, index)}
                              className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 border rounded-lg text-xs sm:text-sm
                                ${isQuestionPending
                                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-700 hover:text-blue-800 border-blue-200'
                                  : 'bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-700 hover:text-blue-800 border-blue-200'
                                }`}
                            >
                              <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">Report Question</span>
                              <span className="xs:hidden">Q Report</span>
                            </button>
                            <button
                              onClick={() => handleAnswerReportClick(q, index)}
                              className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 border rounded-lg text-xs sm:text-sm
                                ${isAnswerPending
                                  ? 'bg-gradient-to-r from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 text-green-700 hover:text-green-800 border-green-200'
                                  : 'bg-gradient-to-r from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 text-green-700 hover:text-green-800 border-green-200'
                                }`}
                            >
                              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">Report Answer</span>
                              <span className="xs:hidden">A Report</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredQuestions.map((q, index) => {
                  const isQuestionPending = q.hasPendingQuestionReports;
                  const isAnswerPending = q.hasPendingAnswerReports;
                  const questionHasImage = q.hasQuestionImage;
                  const answerHasImage = q.hasAnswerImage;

                  return (
                    <div
                      key={q.id}
                      className={`group bg-white border border-slate-200 rounded-xl p-8 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 backdrop-blur-sm bg-opacity-80 w-full relative`}
                    >
                      <div className="mb-6">
                        <div className={`absolute -left-4 top-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                          isQuestionPending
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}>
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        
                        <div className="ml-8">
                          <div className="mb-4 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-blue-600">
                                Question:
                              </span>
                              {isQuestionPending && (
                                <button
                                  onClick={() => handleViewReportDetails(q, "question")}
                                  className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Reported ({q.questionReports?.length || 0})</span>
                                </button>
                              )}
                            </div>
                            <div className={`rounded-lg p-4 shadow-sm ${
                              isQuestionPending
                                ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                                : 'bg-gradient-to-r from-white to-blue-50 border border-blue-100'
                            }`}>
                              <h3 className="text-base text-left font-medium text-slate-800 leading-relaxed mb-3">
                                {q.question || "No question text"}
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
                                      onClick={() => handleImageClick(q.questionImage, "question", `Question ${index + 1}`)}
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      <Maximize2 className="w-3 h-3" />
                                      <span>View Full</span>
                                    </button>
                                  </div>
                                  <div 
                                    className="relative group cursor-pointer bg-gray-50 rounded-lg border border-blue-200 p-2 hover:bg-blue-50 transition-all duration-200"
                                    onClick={() => handleImageClick(q.questionImage, "question", `Question ${index + 1}`)}
                                  >
                                    <div className="flex items-center justify-center">
                                      <img
                                        src={q.questionImage}
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

                      <div className="ml-8">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-slate-900">Answer:</h4>
                          {isAnswerPending && (
                            <button
                              onClick={() => handleViewReportDetails(q, "answer")}
                              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Reported ({q.answerReports?.length || 0})</span>
                            </button>
                          )}
                        </div>
                        <div className={`rounded-lg p-6 shadow-inner ${
                          isAnswerPending
                            ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                            : 'bg-gradient-to-r from-white to-emerald-50 border border-emerald-100'
                        }`}>
                          <p className="text-slate-700 text-left leading-relaxed font-medium mb-3">
                            {q.answer || "No answer text"}
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
                                  onClick={() => handleImageClick(q.answerImage, "answer", `Answer ${index + 1}`)}
                                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>View Full</span>
                                </button>
                              </div>
                              <div 
                                className="relative group cursor-pointer bg-gray-50 rounded-lg border border-emerald-200 p-2 hover:bg-emerald-50 transition-all duration-200"
                                onClick={() => handleImageClick(q.answerImage, "answer", `Answer ${index + 1}`)}
                              >
                                <div className="flex items-center justify-center">
                                  <img
                                    src={q.answerImage}
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

                      <div className="flex flex-wrap gap-2 mt-4 sm:mt-6 ml-8">
                        <button
                          onClick={() => handleQuestionReportClick(q, index)}
                          className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 border rounded-lg text-xs sm:text-sm
                            ${isQuestionPending
                              ? 'bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-700 hover:text-blue-800 border-blue-200'
                              : 'bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-700 hover:text-blue-800 border-blue-200'
                            }`}
                        >
                          <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Report Question</span>
                          <span className="xs:hidden">Q Report</span>
                        </button>
                        <button
                          onClick={() => handleAnswerReportClick(q, index)}
                          className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 border rounded-lg text-xs sm:text-sm
                            ${isAnswerPending
                              ? 'bg-gradient-to-r from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 text-green-700 hover:text-green-800 border-green-200'
                              : 'bg-gradient-to-r from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 text-green-700 hover:text-green-800 border-green-200'
                            }`}
                        >
                          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Report Answer</span>
                          <span className="xs:hidden">A Report</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modals */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-l-4 border-blue-500">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedQuestion?.hasQuestionReports ? "Add Another Report" : "Report Question"}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-slate-100 rounded-lg ml-2"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reason for Reporting Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Incorrect question, Grammatical error..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Please provide detailed information about the issue..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-gray-900 rounded-lg font-medium transition-colors border border-slate-300 disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAnswerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-l-4 border-green-500">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedQuestion?.hasAnswerReports ? "Add Another Report" : "Report Answer"}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-slate-100 rounded-lg ml-2"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reason for Reporting Answer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Incorrect answer, Factually wrong..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Please provide detailed information about the issue..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-gray-900 rounded-lg font-medium transition-colors border border-slate-300 disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="relative w-full max-w-6xl max-h-[95vh]">
            {/* Close Button */}
            <button
              onClick={handleCancel}
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
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportDetailsModal && reportDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-l-4 border-purple-500">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {reportDetails.type === "question" ? "Question Report Details" : "Answer Report Details"}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-slate-100 rounded-lg ml-2"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Report History</h3>
                
                {reportDetails.reports.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">No reports found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportDetails.reports.map((report, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-colors duration-200"
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

              <div className="flex justify-end">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
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