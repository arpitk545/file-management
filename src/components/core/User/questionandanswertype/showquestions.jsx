"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  AlertCircle, 
  X, 
  Flag, 
  MessageSquare, 
  Eye, 
  Filter, 
  ChevronDown, 
  Maximize2,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Home
} from "lucide-react";
import { getAllQandA, reportQuestion, reportAnswer } from "../../../../services/operations/qandA";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ShowqnadaQuestions() {
  const navigate = useNavigate();
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
  const [selectedImageAlt, setSelectedImageAlt] = useState("");

  // Filter states
  const [showFilters, setShowFilters] = useState(true);
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
    return (question.questionReports?.length || 0) > 0;
  };

  const hasAnswerReports = (question) => {
    return (question.answerReports?.length || 0) > 0;
  };

  const hasQuestionImage = (question) => {
    return Boolean(question.questionImage && question.questionImage.trim() !== "");
  };

  const hasAnswerImage = (question) => {
    return Boolean(question.answerImage && question.answerImage.trim() !== "");
  };

  const handleImageClick = (imageUrl, type, alt = "") => {
    setSelectedImage(imageUrl);
    setSelectedImageAlt(alt || `${type} diagram`);
    setShowImageModal(true);
  };

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

  const groupQuestionsByType = (questions) => {
    const grouped = {};
    questions?.forEach((item) => {
      const type = item.questiontype || "General Problems";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });

    const sortedGrouped = {};
    Object.keys(grouped).sort().forEach(type => {
      sortedGrouped[type] = grouped[type];
    });

    return sortedGrouped;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await getAllQandA();
        if (response?.success) {
          const qandaData = response.data || [];
          const allQuestions = qandaData
            .filter(qanda => qanda.status === 'active')
            .flatMap(qanda =>
              (qanda.questions || []).map((q, index) => ({
                ...q,
                qandaId: qanda._id,
                qandaStatus: qanda.status,
                chapterName: qanda.chapterName,
                category: qanda.category,
                questionIndex: index,
                id: `${qanda._id}-${index}`,
                hasPendingQuestionReports: hasPendingQuestionReports(q),
                hasPendingAnswerReports: hasPendingAnswerReports(q),
                hasQuestionReports: hasQuestionReports(q),
                hasAnswerReports: hasAnswerReports(q),
                hasQuestionImage: hasQuestionImage(q),
                hasAnswerImage: hasAnswerImage(q),
                questionReportStatus: q.questionReportStatus || 'not reported',
                answerReportStatus: q.answerReportStatus || 'not reported',
                questionReports: q.questionReports || [],
                answerReports: q.answerReports || []
              }))
            );

          setQuestions(allQuestions);
          setFilteredQuestions(allQuestions);

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
      toast.error("Please fill in both the reason and detailed description");
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
        toast.success(`Report submitted for review!`);

        setQuestions(prevQuestions =>
          prevQuestions.map(q => {
            if (q.id === selectedQuestion.id) {
              return {
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
            }
            return q;
          })
        );

        handleCancel();
      } else {
        throw new Error(response?.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Full error submitting report:", error);
      toast.error(error.message || "Failed to submit report.");
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

  const isFilterActive =
    selectedRegion !== "all" ||
    selectedExamType !== "all" ||
    selectedClass !== "all" ||
    selectedSubject !== "all" ||
    selectedChapter !== "all" ||
    selectedQuestionType !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#ffd02f] border-t-[#1c1c1e] animate-spin mb-4" />
        <p className="text-[#1c1c1e] font-semibold text-lg">Loading Question Archive...</p>
        <p className="text-[#6b6f7e] text-sm mt-1">Retrieving questions and solution sets</p>
      </div>
    );
  }

  const groupedQuestions = groupQuestionsByType(filteredQuestions);

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
        .qna-html-content ul, .qna-html-content ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .qna-html-content ul { list-style-type: disc; }
        .qna-html-content ol { list-style-type: decimal; }
        .qna-html-content code {
          background-color: #f5f3ff;
          color: #4262ff;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
      `}</style>

      {/* Navigation Bar */}
      <div className="w-full flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/dashboard")}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c7cad5] bg-white text-xs font-semibold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c7cad5] bg-white text-xs font-semibold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#1c1c1e]" />
            <span>Back</span>
          </button>
        </div>
        <button
          onClick={() => navigate("/view-your-q-and-a")}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          My Q&A Documents
        </button>
      </div>

      {/* Top Banner */}
      <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                <Sparkles className="w-3.5 h-3.5" />
                Curated Repository
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                {filteredQuestions.length} Problems
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#c3faf5] text-[#187574]">
                Verified Answers
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              Q & A Question Bank
            </h1>
            <p className="text-[#555a6a] text-sm sm:text-base max-w-3xl leading-relaxed">
              Explore syllabus-aligned problems grouped by question format. Use instant filters to isolate topics or flag any issues directly.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#c7cad5] transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => navigate("/qanda")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1c1c1e] hover:bg-[#2c2c34] shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Chapter Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Multi-tier Filter Studio */}
      {showFilters && (
        <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#c3faf5] text-[#187574] flex items-center justify-center font-bold">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1c1c1e]">Taxonomy & Module Filters</h2>
                <p className="text-xs text-[#6b6f7e]">Filter by board, exam, class, subject, chapter, or question format</p>
              </div>
            </div>
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#4262ff] bg-[#f5f3ff] hover:bg-[#ebe8ff] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Region */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#187574] mb-1 block">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#0fbcb0]"
              >
                <option value="all">All Regions ({availableRegions.length})</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#4262ff] mb-1 block">
                Exam Type
              </label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#4262ff]"
              >
                <option value="all">All Exam Types ({availableExamTypes.length})</option>
                {availableExamTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#86296b] mb-1 block">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#86296b]"
              >
                <option value="all">All Classes ({availableClasses.length})</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#746019] mb-1 block">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#ffd02f]"
              >
                <option value="all">All Subjects ({availableSubjects.length})</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#c05621] mb-1 block">
                Chapter
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#c05621]"
              >
                <option value="all">All Chapters ({availableChapters.length})</option>
                {availableChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#555a6a] mb-1 block">
                Format
              </label>
              <select
                value={selectedQuestionType}
                onChange={(e) => setSelectedQuestionType(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#4262ff]"
              >
                <option value="all">All Formats ({availableQuestionTypes.length})</option>
                {availableQuestionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 text-xs text-[#6b6f7e] flex items-center justify-between">
            <span>
              Showing <strong className="text-[#1c1c1e]">{filteredQuestions.length}</strong> of {questions.length} total questions
            </span>
          </div>
        </div>
      )}

      {/* Questions Groups Display */}
      {filteredQuestions.length === 0 ? (
        <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-[#8e91a0] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1c1c1e] mb-1">No Questions Match Criteria</h3>
          <p className="text-xs text-[#6b6f7e] max-w-md mx-auto mb-4">
            Try loosening your filters or resetting to view all available questions.
          </p>
          {isFilterActive && (
            <button
              onClick={clearFilters}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedQuestions).map(([typeName, groupList]) => (
            <div key={typeName} className="space-y-4">
              {/* Question Type Group Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-6 rounded-full bg-[#4262ff]" />
                  <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                    {typeName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                    {groupList.length} items
                  </span>
                </div>
              </div>

              {/* Questions Under This Type */}
              <div className="space-y-5">
                {groupList.map((q, idx) => {
                  const isQuestionPending = q.hasPendingQuestionReports;
                  const isAnswerPending = q.hasPendingAnswerReports;

                  return (
                    <div
                      key={q.id || idx}
                      className="bg-white border border-[#e0e2e8] hover:border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-sm transition-all relative"
                    >
                      {/* Top Header: Badge, Chapter, Reports */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                              isQuestionPending
                                ? "bg-[#fbd4d4] text-[#800000]"
                                : "bg-[#ffd02f] text-[#1c1c1e]"
                            }`}
                          >
                            Q{idx + 1}
                          </div>
                          {q.chapterName && (
                            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff] border border-[#e0e2e8]">
                              {q.chapterName}
                            </span>
                          )}
                          {q.category?.subject && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff8e0] text-[#746019]">
                              {q.category?.subject}
                            </span>
                          )}
                          {q.category?.specificClass && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffd8f4] text-[#86296b]">
                              {q.category?.specificClass}
                            </span>
                          )}
                          {q.category?.region && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c3faf5] text-[#187574]">
                              {q.category?.region}
                            </span>
                          )}
                        </div>

                        {/* Reported status badges */}
                        {(q.hasQuestionReports || isQuestionPending) && (
                          <button
                            onClick={() => handleViewReportDetails(q, "question")}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fbd4d4] text-[#800000] hover:bg-[#ffc6c6] transition-colors shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Question Flagged ({q.questionReports?.length || 1})
                          </button>
                        )}
                      </div>

                      {/* Question Content Statement */}
                      <div className="space-y-2 mb-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                          Problem Statement
                        </span>
                        <div
                          className="text-base text-[#1c1c1e] leading-relaxed qna-html-content p-4 rounded-xl bg-[#fafbfc] border border-[#eef0f3]"
                          dangerouslySetInnerHTML={{ __html: q.question || "No question statement" }}
                        />

                        {/* Optional Question Diagram */}
                        {q.hasQuestionImage && (
                          <div className="pt-2">
                            <div className="inline-block relative rounded-xl border border-[#c7cad5] overflow-hidden group">
                              <img
                                src={q.questionImage}
                                alt={`Question ${idx + 1} diagram`}
                                className="max-h-48 w-auto object-contain cursor-pointer"
                                onClick={() => handleImageClick(q.questionImage, "question", `Question ${idx + 1} Diagram`)}
                              />
                              <button
                                onClick={() => handleImageClick(q.questionImage, "question", `Question ${idx + 1} Diagram`)}
                                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1c1c1e]/80 text-white flex items-center gap-1 backdrop-blur-sm hover:bg-[#1c1c1e]"
                              >
                                <Maximize2 className="w-3 h-3" />
                                Full Size
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Solution Statement */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#00875a]">
                            Detailed Solution & Answer
                          </span>
                          {(q.hasAnswerReports || isAnswerPending) && (
                            <button
                              onClick={() => handleViewReportDetails(q, "answer")}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fbd4d4] text-[#800000] hover:bg-[#ffc6c6] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Answer Flagged ({q.answerReports?.length || 1})
                            </button>
                          )}
                        </div>
                        <div
                          className="text-sm text-[#1c1c1e] leading-relaxed qna-html-content p-5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]"
                          dangerouslySetInnerHTML={{ __html: q.answer || "No solution provided" }}
                        />

                        {/* Optional Answer Diagram */}
                        {q.hasAnswerImage && (
                          <div className="pt-2">
                            <div className="inline-block relative rounded-xl border border-[#c7cad5] overflow-hidden group">
                              <img
                                src={q.answerImage}
                                alt={`Answer ${idx + 1} diagram`}
                                className="max-h-48 w-auto object-contain cursor-pointer"
                                onClick={() => handleImageClick(q.answerImage, "answer", `Answer ${idx + 1} Diagram`)}
                              />
                              <button
                                onClick={() => handleImageClick(q.answerImage, "answer", `Answer ${idx + 1} Diagram`)}
                                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1c1c1e]/80 text-white flex items-center gap-1 backdrop-blur-sm hover:bg-[#1c1c1e]"
                              >
                                <Maximize2 className="w-3 h-3" />
                                Full Size
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Report / Moderation Action Pills */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eef0f3]">
                        <button
                          onClick={() => handleQuestionReportClick(q, idx)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#555a6a] hover:text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#ffe6cd] border border-[#e0e2e8] transition-all"
                        >
                          <Flag className="w-3.5 h-3.5 text-[#fcb900]" />
                          Report Question Issue
                        </button>
                        <button
                          onClick={() => handleAnswerReportClick(q, idx)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#555a6a] hover:text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#fbd4d4] border border-[#e0e2e8] transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#991b1b]" />
                          Report Solution Error
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e0e2e8]">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fff8e0] text-[#746019] flex items-center justify-center font-bold">
                    <Flag className="w-4 h-4 text-[#fcb900]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1c1c1e]">Report Question Problem</h3>
                    <p className="text-xs text-[#6b6f7e]">Flag ambiguous statements, missing options, or typos</p>
                  </div>
                </div>
                <button onClick={handleCancel} className="p-1 rounded-lg hover:bg-[#f7f8fa] text-[#6b6f7e]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-1 block">
                    Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Factual error, Missing figure, Typo..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:outline-none focus:border-[#4262ff]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-1 block">
                    Detailed Explanation
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Explain what is incorrect or what the problem should be..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full p-3 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:outline-none focus:border-[#4262ff] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eef0f3]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#c7cad5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={submitting || !reportReason.trim() || !reportDescription.trim()}
                  className="px-6 py-2 rounded-full text-sm font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Question Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Answer Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e0e2e8]">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fbd4d4] text-[#991b1b] flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1c1c1e]">Report Solution Error</h3>
                    <p className="text-xs text-[#6b6f7e]">Flag incorrect calculations, wrong key, or poor steps</p>
                  </div>
                </div>
                <button onClick={handleCancel} className="p-1 rounded-lg hover:bg-[#f7f8fa] text-[#6b6f7e]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-1 block">
                    Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Calculation mistake, Incomplete solution..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:outline-none focus:border-[#4262ff]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-1 block">
                    Detailed Explanation
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide the corrected derivation or explain why the current solution is faulty..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full p-3 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:outline-none focus:border-[#4262ff] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eef0f3]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#c7cad5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={submitting || !reportReason.trim() || !reportDescription.trim()}
                  className="px-6 py-2 rounded-full text-sm font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Answer Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="relative max-w-4xl max-h-[90vh] bg-[#1c1c1e] p-2 rounded-2xl border border-white/10 flex flex-col items-center">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-white text-xs font-semibold py-2">{selectedImageAlt}</p>
            <img
              src={selectedImage}
              alt={selectedImageAlt}
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Report History Modal */}
      {showReportDetailsModal && reportDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e0e2e8]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f5f3ff] text-[#4262ff] flex items-center justify-center font-bold">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1c1c1e]">Report History</h3>
                    <p className="text-xs text-[#6b6f7e]">{reportDetails.type === "question" ? "Question Reports" : "Solution Reports"}</p>
                  </div>
                </div>
                <button onClick={handleCancel} className="p-1 rounded-lg hover:bg-[#f7f8fa] text-[#6b6f7e]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {reportDetails.reports.length === 0 ? (
                  <p className="text-xs text-[#6b6f7e] text-center py-4">No report logs found</p>
                ) : (
                  reportDetails.reports.map((rep, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1c1c1e]">{rep.reason}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fbd4d4] text-[#800000]">
                          {rep.reportstatus || "Pending"}
                        </span>
                      </div>
                      <p className="text-[#555a6a]">{rep.description}</p>
                      {rep.reportedAt && (
                        <p className="text-[10px] text-[#8e91a0]">
                          {new Date(rep.reportedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-[#eef0f3] flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1c1c1e] text-white hover:bg-[#2c2c34]"
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