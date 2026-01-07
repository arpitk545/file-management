"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { 
  getAllQandARegions, 
  createQandA, 
  addQuestionToQanda 
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
  FileText
} from 'lucide-react';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Thumbnail Uploader Component
function ThumbnailUploader({ preview, onFileSelect, onClear }) {
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setThumbnailFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      onFileSelect({ file, dataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setThumbnailFile(null);
    onClear();
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Thumbnail (Optional)
      </Label>

      {preview ? (
        <div className="relative border-2 border-dashed border-blue-300 rounded-lg overflow-hidden">
          <img 
            src={preview || "/placeholder.svg"} 
            alt="Q&A thumbnail" 
            className="w-full h-56 object-cover" 
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white text-red-600 rounded-full shadow"
            aria-label="Remove thumbnail"
            title="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="w-8 h-8 text-blue-500" />
          <div className="text-center">
            <p className="font-semibold text-gray-700">Upload thumbnail</p>
            <p className="text-sm text-gray-500">PNG, JPG up to ~2MB</p>
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
  onQuestionChange, 
  onAnswerChange, 
  onRemove, 
  totalQuestions 
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs">
              {index + 1}
            </div>
            Question {index + 1}
          </h3>
        </div>
        {totalQuestions > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
            title="Remove this question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Question *
              </Label>
              <textarea
                value={question}
                onChange={(e) => onQuestionChange(index, e.target.value)}
                placeholder="Enter your question here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Answer *
              </Label>
              <textarea
                value={answer}
                onChange={(e) => onAnswerChange(index, e.target.value)}
                placeholder="Enter the answer here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
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
function StepIndicator({ currentStep, totalSteps, labels }) {
  return (
    <div className="mb-8">
      {/* Mobile Step Indicator */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index + 1 <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`h-1 flex-1 ${
                        index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {labels[currentStep - 1]}
          </h3>
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-3xl">
            <div className="flex justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      index + 1 <= currentStep
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : index + 1 === currentStep
                        ? 'border-blue-600 bg-white text-blue-600'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {index === 0 ? <Layers className="w-5 h-5" /> : 
                     index === 1 ? <BookOpen className="w-5 h-5" /> : 
                     index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      index + 1 <= currentStep
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {labels[index]}
                  </span>
                  {index < totalSteps - 1 && (
                    <div
                      className={`absolute top-5 left-full w-full h-0.5 -translate-x-1/2 ${
                        index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function CreateQandAWithQuestions() {
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapterName: "",
    tags: "",
    status: "deactivate"
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([
    { question: "", answer: "" }
  ]);
  const [activeStep, setActiveStep] = useState(1); 
  const [createdQnaId, setCreatedQnaId] = useState(null);
  const [isCreatingQna, setIsCreatingQna] = useState(false);
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);
  const navigate = useNavigate();

  const stepLabels = ["Category Setup", "Add Questions"];

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true);
        const response = await getAllQandARegions();
        setRegions(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch Q&A regions:", error);
        toast.error("Failed to load Q&A data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
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

  const addQuestion = () => {
    setQuestions([...questions, { question: "", answer: "" }]);
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
        toast.error(`Please select ${fieldName}`);
        return false;
      }
    }
    return true;
  };

  // Validate questions step
  const validateQuestionsStep = () => {
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        toast.error(`Please enter question ${i + 1}`);
        return false;
      }
      if (!questions[i].answer.trim()) {
        toast.error(`Please enter answer ${i + 1}`);
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
      
      // Prepare form data for Q&A creation
      const formDataToSend = new FormData();
      
      // Add category data
      formDataToSend.append("category[region]", formData.region);
      formDataToSend.append("category[examType]", formData.examType);
      formDataToSend.append("category[specificClass]", formData.specificClass);
      formDataToSend.append("category[subject]", formData.subject);
      
      // Add other fields
      formDataToSend.append("chapterName", formData.chapterName);
      formDataToSend.append("status", formData.status);
      
      // Add tags as comma-separated string
      if (formData.tags) {
        formDataToSend.append("tags", formData.tags);
      }
      
      // Add thumbnail if exists
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      // Create Q&A first
      const response = await createQandA(formDataToSend);

      if (response.success && response.data?._id) {
        const qnaId = response.data._id;
        setCreatedQnaId(qnaId);
        toast.success("Q&A created successfully! Now add questions.");
        
        // Move to step 2
        setActiveStep(2);
      } else {
        throw new Error(response.message || "Failed to create Q&A");
      }
    } catch (error) {
      console.error("Error creating Q&A:", error);
      toast.error(error.message || "Failed to create Q&A");
    } finally {
      setIsCreatingQna(false);
    }
  };

  // Step 2: Add questions to created Q&A
  const handleAddQuestions = async () => {
    if (!validateQuestionsStep() || !createdQnaId) {
      toast.error("Please create Q&A first or complete all questions");
      return;
    }

    try {
      setIsAddingQuestions(true);

      // Prepare data for API - array of questions
      const requestData = {
        questions: questions.map(q => ({
          question: q.question.trim(),
          answer: q.answer.trim()
        }))
      };

      // Call API to add questions to Q&A
      const response = await addQuestionToQanda(createdQnaId, requestData);

      if (response.success) {
        toast.success(`Successfully added ${questions.length} question(s)!`);
        
        // Navigate to view Q&A
        navigate("/view-qa");
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

  // Navigation between steps
  const goToNextStep = () => {
    if (validateCategoryStep()) {
      handleCreateQna();
    }
  };

  const goToPreviousStep = () => {
    setActiveStep(1);
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }} 
            className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-6"
          >
            <div className="flex-1 ">
              <h1 className="text-2xl  md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Q & A with Questions
              </h1>
              <p className="text-gray-600 text-sm md:text-base lg:text-lg">
                Create a complete Q&A chapter with questions and answers
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/view-qa")}
              className="mt-2 md:mt-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
          </motion.div>
          
          {/* Progress Steps */}
          <StepIndicator 
            currentStep={activeStep} 
            totalSteps={2} 
            labels={stepLabels}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Category Selection */}
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/90 border-0 shadow-xl md:shadow-2xl overflow-visible mb-8 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 md:p-6 lg:p-8 rounded-t-xl">
                  <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                    <Target className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                    <span className="truncate">Category & Chapter Details</span>
                  </CardTitle>
                  <p className="text-blue-100 text-sm md:text-base mt-2">
                    Select region, exam type, class, subject, and enter chapter name
                  </p>
                </CardHeader>

                <CardContent className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
                  {/* Responsive Grid for Category Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Region */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Region *</Label>
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
                        className="w-full h-10 md:h-12 px-3 md:px-4 border-2 border-gray-200 rounded-lg font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 md:focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose region</option>
                        {regions.map((region) => (
                          <option key={region._id} value={region.name}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Exam Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Exam Type *</Label>
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
                        className="w-full h-10 md:h-12 px-3 md:px-4 border-2 border-gray-200 rounded-lg font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 md:focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Choose exam type</option>
                        {getExamTypes().map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Specific Class */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Class *</Label>
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
                        className="w-full h-10 md:h-12 px-3 md:px-4 border-2 border-gray-200 rounded-lg font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 md:focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Choose class</option>
                        {getSpecificClasses().map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Subject *</Label>
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subject: e.target.value,
                          })
                        }
                        disabled={!formData.specificClass}
                        className="w-full h-10 md:h-12 px-3 md:px-4 border-2 border-gray-200 rounded-lg font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 md:focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Choose subject</option>
                        {getSubjects().map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Chapter Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Chapter Name *</Label>
                    <Input
                      type="text"
                      placeholder="Enter chapter name..."
                      value={formData.chapterName}
                      onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                      className="w-full h-10 md:h-12 px-3 md:px-4 border-2 border-gray-200 rounded-lg font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 md:focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Thumbnail Upload - Responsive */}
                  <div className="space-y-2">
                    <ThumbnailUploader
                      preview={thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""}
                      onFileSelect={(fileData) => setThumbnailFile(fileData.file)}
                      onClear={() => setThumbnailFile(null)}
                    />
                  </div>

                  {/* Tags Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <TagIcon className="w-4 h-4" />
                      Tags (comma separated)
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter tags separated by commas..."
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full h-10 md:h-12 px-3 md:px-4 border-2 border-gray-200 rounded-lg font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 md:focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="text-xs md:text-sm text-gray-500">
                      Example: physics, mechanics, formulas
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/view-qa")}
                      className="h-10 md:h-12 px-4 md:px-6 font-semibold order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={goToNextStep}
                      disabled={isCreatingQna || !formData.region || !formData.examType || !formData.specificClass || !formData.subject || !formData.chapterName}
                      className="h-10 md:h-12 px-4 md:px-6  bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 order-1 sm:order-2"
                    >
                      {isCreatingQna ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Q&A...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Next: Add Questions
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Add Questions */}
          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/90 border-0 shadow-xl md:shadow-2xl overflow-visible mb-8 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 md:p-6 lg:p-8 rounded-t-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                        <span className="truncate">Add Questions & Answers</span>
                      </CardTitle>
                      <p className="text-green-100 text-sm md:text-base mt-2">
                        {createdQnaId 
                          ? `Adding questions to Q&A ID: ${createdQnaId.slice(0, 8)}...`
                          : "Add questions to your created Q&A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 md:px-3 py-1 bg-white/20 rounded-full">
                        <span className="text-xs md:text-sm font-medium">
                          {questions.length} question{questions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
                  {/* Category Summary - Responsive */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">Q&A Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
                      <div className="bg-white p-2 md:p-3 rounded border">
                        <p className="text-xs text-gray-500">Region</p>
                        <p className="font-semibold text-gray-800 truncate">{formData.region}</p>
                      </div>
                      <div className="bg-white p-2 md:p-3 rounded border">
                        <p className="text-xs text-gray-500">Exam Type</p>
                        <p className="font-semibold text-gray-800 truncate">{formData.examType}</p>
                      </div>
                      <div className="bg-white p-2 md:p-3 rounded border">
                        <p className="text-xs text-gray-500">Class</p>
                        <p className="font-semibold text-gray-800 truncate">{formData.specificClass}</p>
                      </div>
                      <div className="bg-white p-2 md:p-3 rounded border">
                        <p className="text-xs text-gray-500">Subject</p>
                        <p className="font-semibold text-gray-800 truncate">{formData.subject}</p>
                      </div>
                      <div className="bg-white p-2 md:p-3 rounded border">
                        <p className="text-xs text-gray-500">Chapter</p>
                        <p className="font-semibold text-gray-800 truncate">{formData.chapterName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">Questions</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={addQuestion}
                          className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm md:text-base"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Add Question</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {questions.map((q, index) => (
                        <QuestionItem
                          key={index}
                          index={index}
                          question={q.question}
                          answer={q.answer}
                          onQuestionChange={handleQuestionChange}
                          onAnswerChange={handleAnswerChange}
                          onRemove={removeQuestion}
                          totalQuestions={questions.length}
                        />
                      ))}
                    </AnimatePresence>

                    {questions.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No questions added yet</p>
                        <Button
                          type="button"
                          onClick={addQuestion}
                          variant="outline"
                          className="mt-3"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Question
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
                    <div className="order-2 sm:order-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goToPreviousStep}
                        className="h-10 md:h-12 px-4 md:px-6 font-semibold w-full sm:w-auto"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Category
                      </Button>
                    </div>
                    
                    <div className="order-1 sm:order-2 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="text-center sm:text-left">
                        <span className="text-xs md:text-sm text-gray-600 block">
                          {questions.length} question{questions.length !== 1 ? 's' : ''} ready
                        </span>
                        {questions.some(q => !q.question.trim() || !q.answer.trim()) && (
                          <span className="text-xs text-amber-600">
                            Complete all questions to continue
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddQuestions}
                        disabled={isAddingQuestions || questions.some(q => !q.question.trim() || !q.answer.trim()) || !createdQnaId}
                        className="h-10 md:h-12 px-4 md:px-6  bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isAddingQuestions ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding {questions.length} question{questions.length !== 1 ? 's' : ''}...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                            Add {questions.length} Question{questions.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}