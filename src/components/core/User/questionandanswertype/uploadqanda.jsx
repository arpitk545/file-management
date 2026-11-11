"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllQandARegions, 
  createQandA, 
  addQuestionToQanda,
  getAllQuestionTypes
} from "../../../../services/operations/qandA";
import { 
  Sparkles, 
  Target, 
  ImageIcon, 
  Upload, 
  X, 
  CheckCircle, 
  Tag as TagIcon,
  BookOpen,
  MessageSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Layers,
  FileText,
  Home
} from 'lucide-react';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Thumbnail Uploader Component
function ThumbnailUploader({ preview, onFileSelect, onClear }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      onFileSelect({ file, dataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-[#4262ff]" />
        Chapter Thumbnail (Optional)
      </label>

      {preview ? (
        <div className="relative border border-[#c7cad5] rounded-xl overflow-hidden bg-white max-w-md">
          <img 
            src={preview} 
            alt="Q&A thumbnail preview" 
            className="w-full h-44 object-cover" 
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white text-[#991b1b] rounded-full shadow-md transition-all"
            aria-label="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#c7cad5] hover:border-[#4262ff] bg-[#f7f8fa] hover:bg-[#f5f3ff] rounded-xl cursor-pointer transition-all">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4262ff] shadow-sm border border-[#e0e2e8]">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1c1c1e]">Upload chapter cover image</p>
            <p className="text-xs text-[#6b6f7e]">PNG, JPG, WebP up to 2MB</p>
          </div>
        </label>
      )}
    </div>
  );
}

// Question Item Component
function QuestionItem({ 
  index, 
  question, 
  answer, 
  questiontype,
  onQuestionChange, 
  onAnswerChange, 
  onQuestionTypeChange,
  questionTypes = [],
  onRemove, 
  totalQuestions 
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-[#e0e2e8] hover:border-[#c7cad5] rounded-2xl p-5 bg-white shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3] mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 bg-[#ffd02f] text-[#1c1c1e] rounded-full text-xs font-bold shadow-sm">
            {index + 1}
          </div>
          <h4 className="text-sm font-bold text-[#1c1c1e]">
            Question Item #{index + 1}
          </h4>
          {questiontype && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
              {questiontype}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa] rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {totalQuestions > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 text-[#991b1b] hover:bg-[#fbd4d4] rounded-lg transition-colors"
              title="Delete question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            {/* Question Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#555a6a] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#4262ff]" />
                Question Type (Optional)
              </label>
              <input
                list={`question-types-${index}`}
                value={questiontype || ""}
                onChange={(e) => onQuestionTypeChange(index, e.target.value)}
                placeholder="e.g., Short Answer, 2 Marks, Descriptive, MCQ..."
                className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20 transition-all"
              />
              <datalist id={`question-types-${index}`}>
                {questionTypes.map((type, tIdx) => (
                  <option key={tIdx} value={type.name || type} />
                ))}
                <option value="Short Answer" />
                <option value="Long Answer" />
                <option value="Multiple Choice" />
                <option value="Descriptive" />
                <option value="Numerical" />
                <option value="True/False" />
              </datalist>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#555a6a] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#00b473]" />
                Question Statement *
              </label>
              <textarea
                value={question}
                onChange={(e) => onQuestionChange(index, e.target.value)}
                placeholder="State the question clearly..."
                rows={3}
                className="w-full p-3 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20 transition-all resize-none"
                required
              />
            </div>

            {/* Answer Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#555a6a] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#fcb900]" />
                Solution & Answer *
              </label>
              <textarea
                value={answer}
                onChange={(e) => onAnswerChange(index, e.target.value)}
                placeholder="Provide complete solution and answer..."
                rows={4}
                className="w-full p-3 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20 transition-all resize-none"
                required
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Step Indicator Component
function StepIndicator({ currentStep, labels }) {
  return (
    <div className="w-full flex items-center justify-center mb-8">
      <div className="flex items-center gap-3 sm:gap-6">
        {labels.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;

          return (
            <div key={idx} className="flex items-center gap-2 sm:gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isActive
                    ? "bg-[#ffd02f] text-[#1c1c1e] ring-4 ring-[#ffd02f]/30"
                    : isDone
                    ? "bg-[#00b473] text-white"
                    : "bg-[#e0e2e8] text-[#555a6a]"
                }`}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <div className="text-left">
                <p className="text-xs text-[#6b6f7e] uppercase font-semibold tracking-wider">
                  Step {stepNum}
                </p>
                <p className={`text-xs sm:text-sm font-bold ${isActive ? "text-[#1c1c1e]" : "text-[#555a6a]"}`}>
                  {label}
                </p>
              </div>
              {idx < labels.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 bg-[#c7cad5] ml-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateQandAWithQuestions() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapterName: "",
    tags: "",
    status: "active"
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [regions, setRegions] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [questions, setQuestions] = useState([
    { question: "", answer: "", questiontype: "" }
  ]);
  const [activeStep, setActiveStep] = useState(1); 
  const [createdQnaId, setCreatedQnaId] = useState(null);
  const [isCreatingQna, setIsCreatingQna] = useState(false);
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);

  const stepLabels = ["Taxonomy & Chapter", "Questions & Solutions"];

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getAllQandARegions();
        setRegions(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch Q&A regions:", error);
        toast.error("Failed to load Q&A regions");
      }
    };

    fetchRegions();
  }, []);

  // Fetch question types
  useEffect(() => {
    const fetchQTypes = async () => {
      try {
        const response = await getAllQuestionTypes();
        if (response?.data) {
          setQuestionTypes(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch question types:", err);
      }
    };
    fetchQTypes();
  }, []);

  const getExamTypes = () => {
    if (!formData.region) return [];
    const selectedRegion = regions.find((region) => region.name === formData.region);
    return selectedRegion?.examTypes?.map((type) => type.name) || [];
  };

  const getSpecificClasses = () => {
    if (!formData.region || !formData.examType) return [];
    const selectedRegion = regions.find((region) => region.name === formData.region);
    const selectedExamType = selectedRegion?.examTypes?.find((et) => et.name === formData.examType);
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || [];
  };

  const getSubjects = () => {
    if (!formData.region || !formData.examType || !formData.specificClass) return [];
    const selectedRegion = regions.find((region) => region.name === formData.region);
    const selectedExamType = selectedRegion?.examTypes?.find((et) => et.name === formData.examType);
    const selectedSpecificClass = selectedExamType?.specificClasses?.find((sc) => sc.name === formData.specificClass);
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || [];
  };

  // Question handlers
  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answer = value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questiontype = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", answer: "", questiontype: "" }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  // Validate category step
  const validateCategoryStep = () => {
    const requiredFields = ['region', 'examType', 'specificClass', 'subject', 'chapterName'];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`Please select or enter ${fieldName}`);
        return false;
      }
    }
    return true;
  };

  // Validate questions step
  const validateQuestionsStep = () => {
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        toast.error(`Please enter question statement for question ${i + 1}`);
        return false;
      }
      if (!questions[i].answer.trim()) {
        toast.error(`Please enter answer for question ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  // Step 1: Create Q&A (Get ID)
  const handleCreateQna = async () => {
    if (!validateCategoryStep()) return;

    try {
      setIsCreatingQna(true);
      const formDataToSend = new FormData();
      formDataToSend.append("category[region]", formData.region);
      formDataToSend.append("category[examType]", formData.examType);
      formDataToSend.append("category[specificClass]", formData.specificClass);
      formDataToSend.append("category[subject]", formData.subject);
      formDataToSend.append("chapterName", formData.chapterName);
      formDataToSend.append("status", formData.status);
      
      if (formData.tags) {
        formDataToSend.append("tags", formData.tags);
      }
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      const response = await createQandA(formDataToSend);

      if (response.success && response.data?._id) {
        const qnaId = response.data._id;
        setCreatedQnaId(qnaId);
        toast.success("Chapter created! Now add your questions.");
        setActiveStep(2);
      } else {
        throw new Error(response.message || "Failed to create Q&A chapter");
      }
    } catch (error) {
      console.error("Error creating Q&A:", error);
      toast.error(error.message || "Failed to create Q&A chapter");
    } finally {
      setIsCreatingQna(false);
    }
  };

  // Step 2: Add questions to created Q&A
  const handleAddQuestions = async () => {
    if (!validateQuestionsStep() || !createdQnaId) {
      toast.error("Please complete all questions before submitting");
      return;
    }

    try {
      setIsAddingQuestions(true);
      const requestData = {
        questions: questions.map(q => ({
          question: q.question.trim(),
          answer: q.answer.trim(),
          questiontype: q.questiontype?.trim() || "General"
        }))
      };

      const response = await addQuestionToQanda(createdQnaId, requestData);

      if (response.success) {
        toast.success(`Successfully published ${questions.length} question(s)!`);
        navigate("/view-your-q-and-a");
      } else {
        throw new Error(response.message || "Failed to add questions");
      }
    } catch (error) {
      console.error("Error adding questions:", error);
      toast.error(error.message || "Failed to add questions");
    } finally {
      setIsAddingQuestions(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-[#1c1c1e] p-4 sm:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                <Sparkles className="w-3.5 h-3.5" />
                Student Workflow
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                2-Step Creator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              Create Q & A Module
            </h1>
            <p className="text-[#555a6a] text-sm sm:text-base max-w-2xl">
              Set up your curriculum hierarchy, chapter title, and compose detailed questions and solutions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c7cad5] bg-white text-xs font-semibold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/view-your-q-and-a")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#c7cad5] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              My Q & A Sets
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={activeStep} labels={stepLabels} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Category & Chapter Selection */}
        {activeStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8"
          >
            <div className="pb-4 border-b border-[#e0e2e8] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c3faf5] text-[#187574] flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1c1c1e]">Step 1: Taxonomy & Chapter Details</h3>
                <p className="text-xs text-[#555a6a]">Select academic level, specify chapter title, and upload optional cover</p>
              </div>
            </div>

            {/* 4-Tier Taxonomy Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Region */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#187574] flex items-center gap-1">
                  <span>Region / Board *</span>
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      region: e.target.value,
                      examType: "",
                      specificClass: "",
                      subject: "",
                    });
                  }}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#0fbcb0] focus:ring-2 focus:ring-[#c3faf5] transition-all"
                >
                  <option value="">Select Board / State</option>
                  {regions.map((region) => (
                    <option key={region._id || region.name} value={region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4262ff] flex items-center gap-1">
                  <span>Exam Type *</span>
                </label>
                <select
                  value={formData.examType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examType: e.target.value,
                      specificClass: "",
                      subject: "",
                    })
                  }
                  disabled={!formData.region}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#f5f3ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Exam Track</option>
                  {getExamTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Class */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#86296b] flex items-center gap-1">
                  <span>Class / Grade *</span>
                </label>
                <select
                  value={formData.specificClass}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specificClass: e.target.value,
                      subject: "",
                    })
                  }
                  disabled={!formData.examType}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#86296b] focus:ring-2 focus:ring-[#ffd8f4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Grade</option>
                  {getSpecificClasses().map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#746019] flex items-center gap-1">
                  <span>Subject *</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subject: e.target.value,
                    })
                  }
                  disabled={!formData.specificClass}
                  className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#fcb900] focus:ring-2 focus:ring-[#fff8e0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Subject</option>
                  {getSubjects().map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chapter Name & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1">
                  <span>Chapter Title *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chapter 4: Chemical Bonding and Molecular Structure"
                  value={formData.chapterName}
                  onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                  className="w-full min-h-[44px] px-4 py-2.5 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Initial Visibility
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full min-h-[44px] px-4 py-2.5 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold focus:outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20 transition-all"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="deactivate">Draft / Deactivated</option>
                </select>
              </div>
            </div>

            {/* Thumbnail dropzone */}
            <ThumbnailUploader
              preview={thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""}
              onFileSelect={(fileData) => setThumbnailFile(fileData.file)}
              onClear={() => setThumbnailFile(null)}
            />

            {/* Tags Input with Preview Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-[#4262ff]" />
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. thermodynamics, formulas, derivations, cbse2025"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full min-h-[44px] px-4 py-2.5 text-sm bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20 transition-all"
              />
              {formData.tags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.tags
                    .split(",")
                    .filter((t) => t.trim())
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff] border border-[#e0e2e8]"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-[#e0e2e8]">
              <button
                type="button"
                onClick={() => navigate("/view-your-q-and-a")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-white hover:bg-[#f7f8fa] border border-[#c7cad5] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateQna}
                disabled={
                  isCreatingQna || 
                  !formData.region || 
                  !formData.examType || 
                  !formData.specificClass || 
                  !formData.subject || 
                  !formData.chapterName
                }
                className="w-full sm:w-auto px-8 py-2.5 rounded-full text-sm font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isCreatingQna ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#1c1c1e] border-t-transparent animate-spin" />
                    Creating Chapter...
                  </>
                ) : (
                  <>
                    Next: Add Questions
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Add Questions & Answers */}
        {activeStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8"
          >
            {/* Header */}
            <div className="pb-4 border-b border-[#e0e2e8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1c1c1e]">Step 2: Add Questions & Solutions</h3>
                  <p className="text-xs text-[#555a6a]">Compose each problem statement with its corresponding solution</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-[#1c1c1e] text-white hover:bg-[#2c2c34] shadow-sm transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add New Question
              </button>
            </div>

            {/* Chapter Summary Strip */}
            <div className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs text-[#6b6f7e] uppercase font-semibold">Active Chapter:</span>
                  <h4 className="text-base font-bold text-[#1c1c1e]">{formData.chapterName}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c3faf5] text-[#187574]">
                    {formData.region}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                    {formData.examType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffd8f4] text-[#86296b]">
                    {formData.specificClass}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff8e0] text-[#746019]">
                    {formData.subject}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <AnimatePresence>
                {questions.map((q, index) => (
                  <QuestionItem
                    key={index}
                    index={index}
                    question={q.question}
                    answer={q.answer}
                    questiontype={q.questiontype}
                    onQuestionChange={handleQuestionChange}
                    onAnswerChange={handleAnswerChange}
                    onQuestionTypeChange={handleQuestionTypeChange}
                    questionTypes={questionTypes}
                    onRemove={removeQuestion}
                    totalQuestions={questions.length}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Quick Add Question Bar */}
            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-4 rounded-xl border-2 border-dashed border-[#c7cad5] hover:border-[#ffd02f] hover:bg-[#fffdf5] text-sm font-bold text-[#1c1c1e] flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-[#fcb900]" />
              Add Another Question
            </button>

            {/* Footer Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#e0e2e8]">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-white hover:bg-[#f7f8fa] border border-[#c7cad5] flex items-center justify-center gap-2 transition-all order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Taxonomy
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                <span className="text-xs text-[#6b6f7e] hidden sm:inline">
                  {questions.length} question(s) configured
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestions}
                  disabled={
                    isAddingQuestions ||
                    questions.some(q => !q.question.trim() || !q.answer.trim()) ||
                    !createdQnaId
                  }
                  className="w-full sm:w-auto px-8 py-2.5 rounded-full text-sm font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {isAddingQuestions ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-[#1c1c1e] border-t-transparent animate-spin" />
                      Publishing Set...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#00b473]" />
                      Publish All {questions.length} Question{questions.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}