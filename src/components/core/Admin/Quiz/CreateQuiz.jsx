"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { getAllQuizRegions, createQuizQuestion, getAllQuizQuestions, extractQuestionsFromFile } from "../../../../services/operations/quizAPI"
import QuizAI from "./CreateQuizAI"
import { Database, X, Plus,Clock,User, Target, Tag, Trash2, Upload, BookOpen, CheckCircle,  Bot, Sparkles, FileInput, FileUp } from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  </div>
)

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 4 }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700">{label}</Label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
    />
  </div>
)

const ProgressIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center mb-8">
    <div className="flex items-center space-x-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              index < currentStep
                ? "bg-green-500 text-white"
                : index === currentStep
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-8 h-1 mx-2 rounded-full transition-all duration-300 ${
                index < currentStep ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  </div>
)

const QuestionCard = ({ question, onUpdate, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-6"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
        </div>
        Question {index + 1}
      </h3>
      <Button
        onClick={onDelete}
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>

    <ModernTextarea
      label="Question"
      placeholder="Enter your question here..."
      value={question.text}
      onChange={(value) => onUpdate({ ...question, text: value })}
      rows={3}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {["A", "B", "C", "D"].map((option) => (
        <ModernInput
          key={option}
          label={`Option ${option}`}
          placeholder={`Enter option ${option}...`}
          value={question.options[option] || ""}
          onChange={(value) =>
            onUpdate({
              ...question,
              options: { ...question.options, [option]: value },
            })
          }
        />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">Correct Answer</Label>
        <select
          value={question.correctAnswer}
          onChange={(e) => onUpdate({ ...question, correctAnswer: e.target.value })}
          className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Select correct answer</option>
          {["A", "B", "C", "D"].map((option) => (
            <option key={option} value={option}>
              Option {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">Difficulty Level</Label>
        <select
          value={question.difficulty}
          onChange={(e) => onUpdate({ ...question, difficulty: e.target.value })}
          className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Select difficulty</option>
          {["Easy", "Average", "Hard"].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>
  </motion.div>
)

export default function CreateQuiz() {
  const [formData, setFormData] = useState({
    quizTitle: "",
    region: "",
    examType: "",
    duration:"",
    specificClass: "",
    subject: "",
    chapter: "",
    quizType:"createquiz",
  })

  const [regions, setRegions] = useState([])
  const selectedRegion = regions.find(region => region._id === formData.region)
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [importedQuestions, setImportedQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeSource, setActiveSource] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const navigate =useNavigate();

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQuizRegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Failed to fetch quiz regions:", error)
        toast.error("Failed to load quiz data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegions()
  }, [])

  // Update current step based on form completion
  useEffect(() => {
    let step = 0
    if (formData.region) step = 1
    if (formData.examType) step = 2
    if (formData.specificClass) step = 3
    if (formData.subject) step = 4
    if (formData.chapter) step = 5
    setCurrentStep(step)
  }, [formData])

const getExamTypes = () => {
  if (!selectedRegion) return []
  return selectedRegion.examTypes?.map(type => type.name) || []
}

const getSpecificClasses = () => {
  if (!selectedRegion || !formData.examType) return []
  const selectedExamType = selectedRegion.examTypes.find(et => et.name === formData.examType)
  return selectedExamType?.specificClasses?.map(cls => cls.name) || []
}

const getSubjects = () => {
  if (!selectedRegion || !formData.examType || !formData.specificClass) return []
  const selectedExamType = selectedRegion.examTypes.find(et => et.name === formData.examType)
  const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === formData.specificClass)
  return selectedSpecificClass?.subjects?.map(subject => subject.name) || []
}

const getChapters = () => {
  if (!selectedRegion || !formData.examType || !formData.specificClass || !formData.subject) return []
  const selectedExamType = selectedRegion.examTypes.find(et => et.name === formData.examType)
  const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === formData.specificClass)
  const selectedSubject = selectedSpecificClass?.subjects.find(sub => sub.name === formData.subject)
  return selectedSubject?.chapters?.map(ch => ch.name) || []
}

  // Question management functions
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      options: { A: "", B: "", C: "", D: "" },
      correctAnswer: "",
      difficulty: "",
    }

    setQuestions(prev =>
      Array.isArray(prev) ? [newQuestion, ...prev] : [newQuestion]
    )
  }

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
  }

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  // File import handling
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setActiveSource('fileImport')
      toast.success(`File selected: ${file.name}`)
    }
  }
const fetchQuestions = async () => {
  try {
    setIsLoading(true);

    const selectedRegion = regions.find(region => region._id === formData.region);

    const payload = {
      category: {
        region: selectedRegion?.name || "",
        examType: formData.examType,
        specificClass: formData.specificClass,
        subject: formData.subject,
        chapter: formData.chapter,
          quizType: "quizbank",
      }
    };
    const response = await getAllQuizQuestions(payload);

    setQuestions(response.data);

    if (response.data.length === 0) {
      toast.error(`No question found in ${selectedRegion?.name || "selected region"}`);
    } else {
      toast.success(`Questions loaded from quiz bank`);
    }

  } catch (error) {
    toast.error(`Failed to fetch questions.`);
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};

  const handleExtractQuestions = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      const data = await extractQuestionsFromFile(selectedFile);
      if (data.questions && data.questions.length) {
        setImportedQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setQuestions(data?.questions[0]);
        console.log("Extracted questions:", data.questions);
        toast.success(`Extracted ${data.questions.length} questions successfully!`);
      } else {
        toast.error("No questions extracted from the file.");
      }
    } catch (err) {
      toast.error("Failed to extract questions: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImportedQuestion = () => {
    if (importedQuestions.length === 0) return
    
    setQuestions(prevQuestions =>
      Array.isArray(prevQuestions)
        ? [importedQuestions[currentQuestionIndex], ...prevQuestions]
        : [importedQuestions[currentQuestionIndex]]
    )
    
    if (currentQuestionIndex < importedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      toast.success(`Added question ${currentQuestionIndex + 1} of ${importedQuestions.length}`)
    } else {
      setImportedQuestions([])
      setCurrentQuestionIndex(0)
      toast.success("All imported questions added to quiz!")
    }
  }

 // Create quiz function
const handleCreateQuiz = async () => {
  if (!isFormComplete) {
    toast.error("Please complete all category fields");
    return;
  }

  if (questions.length === 0) {
    toast.error("Please add at least one question");
    return;
  }

  try {
    setIsLoading(true);
    const regionName = selectedRegion?.name || "";
    const payload = {
      category: {
        quizTitle: formData.quizTitle,
        language:formData.language,
        duration:formData.duration,
        author:formData.author,
        region: regionName,
        examType: formData.examType,
        specificClass: formData.specificClass,
        subject: formData.subject,
        chapter: formData.chapter,
        quizType: formData.quizType, 
      },
      questions: questions.map(q => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        tags: q.tags || [],
      })),
    };

    await createQuizQuestion(payload);

    toast.success(`Quiz created successfully with ${questions.length} questions!`);
    navigate("/view-quiz")
    // Reset form after successful creation
    setQuestions([]);
    setFormData({
      quizTitle: "",
      language: "",
      duration:"",
      author: "",
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    });
   //setSelectedRegion(null);
    setSelectedFile(null);
    setImportedQuestions([]);
  } catch (error) {
    console.error("Error creating quiz:", error);
    toast.error("Failed to create quiz: " + (error.message || "Server error"));
  } finally {
    setIsLoading(false);
  }
};

  const isFormComplete =
  formData.region && formData.examType && formData.specificClass && formData.subject && formData.chapter

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Quiz
              </h1>
              <p className="text-gray-600 text-lg">Build your custom quiz step by step</p>
            </div>
          </motion.div>

          <ProgressIndicator currentStep={currentStep} totalSteps={5} />
        </div>

        {/* Category Selection Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7" />
                Quiz Configuration
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Quiz Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <ModernInput
                 label="Quiz Title"
                 placeholder="Enter quiz title..."
                 value={formData.quizTitle}
                 onChange={(value) => setFormData({...formData, quizTitle: value})}
                 icon={Tag}
               />
               
               <ModernInput
                 label="Duration (minutes)"
                 type="number"
                 placeholder="Enter duration..."
                 value={formData.duration || ""}
                 onChange={(value) => setFormData({...formData, duration: value})}
                 icon={Clock}
               />
               
               <ModernInput
                 label="Author"
                 placeholder="Enter author name..."
                 value={formData.author || ""}
                 onChange={(value) => setFormData({...formData, author: value})}
                 icon={User}
               />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Select Region</Label>
                  <select
                    value={formData.region}
                    onChange={(e) => {
                      const selectedRegionId = e.target.value
                     // setSelectedRegion(selected)
                      setFormData({
                        ...formData,
                        region:selectedRegionId,
                        examType: "",
                        specificClass: "",
                        subject: "",
                        chapter: "",
                      })
                    }}
                    className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Choose region</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <AnimatePresence>
                  {formData.region && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Class/Exam Type</Label>
                      <select
                        value={formData.examType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            examType: e.target.value,
                            specificClass: "",
                            subject: "",
                            chapter: "",
                          })
                        }
                        className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose exam type</option>
                        {getExamTypes().map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {formData.examType && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Specific Class</Label>
                      <select
                        value={formData.specificClass}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specificClass: e.target.value,
                            subject: "",
                            chapter: "",
                          })
                        }
                        className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose class</option>
                        {getSpecificClasses().map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {formData.specificClass && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Subject (Category)</Label>
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subject: e.target.value,
                            chapter: "",
                          })
                        }
                        className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose subject</option>
                        {getSubjects().map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <AnimatePresence>
                      {formData.subject && getChapters().length> 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label className="text-sm font-semibold text-gray-700">Chapter/Topic (Sub Category)</Label>
                          <select
                            value={formData.chapter}
                            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                            className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="">Choose chapter</option>
                            {getChapters().map((chapterName) => (
                              <option key={chapterName} value={chapterName}>
                                {chapterName}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz Sources */}
        <AnimatePresence>
          {isFormComplete && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Question Sources */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Database className="w-6 h-6" />
                    Question Sources
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button
                      onClick={fetchQuestions}
                      variant={activeSource === 'quizBank' ? 'default' : 'outline'}
                      className={`h-16 rounded-2xl transition-all duration-200 ${
                        activeSource === 'quizBank' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 bg-transparent'
                      }`}
                    >
                      <Database className="w-5 h-5 mr-2" />
                      Quiz Bank
                    </Button>

                    <Button
                      onClick={() => setActiveSource('fileImport')}
                      variant={activeSource === 'fileImport' ? 'default' : 'outline'}
                      className={`h-16 rounded-2xl transition-all duration-200 ${
                        activeSource === 'fileImport' 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'border-2 border-green-200 hover:border-green-400 hover:bg-green-50 bg-transparent'
                      }`}
                    >
                      <FileInput className="w-5 h-5 mr-2" />
                      Import File
                    </Button>

                    <Button
                      onClick={handleExtractQuestions}
                      disabled={!selectedFile}
                      variant={activeSource === 'extract' ? 'default' : 'outline'}
                      className={`h-16 rounded-2xl transition-all duration-200 ${
                        activeSource === 'extract' 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 bg-transparent'
                      }`}
                    >
                      <FileUp className="w-5 h-5 mr-2" />
                      Extract Questions
                    </Button>

                    <Button
                      onClick={() =>  setShowAIModal(true)}
                      variant='outline'
                      className={`h-16 rounded-2xl transition-all duration-200 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 bg-transparent
                      `}
                    >
                      <Bot className="w-5 h-5 mr-2" />
                      AI Generator
                    </Button>
                  </div>

                  {/* File Upload Section */}
                 {activeSource === 'fileImport' && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     transition={{ duration: 0.3 }}
                     className="mt-6 relative"
                   >
                     <div className="border-2 border-dashed border-blue-400 rounded-2xl p-8 text-center relative">
                       {/* Red Cross Icon at top right */}
                       <button
                         type="button"
                         onClick={() => setActiveSource(null)}  // close the upload UI
                         className="absolute top-3 right-3 text-red-600 hover:text-red-800 focus:outline-none text-2xl font-bold"
                         aria-label="Close upload area"
                       >
                         &#x2715; {/* × */}
                       </button>
                 
                       <label
                         htmlFor="file-upload"
                         className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                       >
                         <input
                           type="file"
                           id="file-upload"
                           className="hidden"
                           accept=".pdf,.doc,.docx,.xlsx,.csv"
                           onChange={handleFileChange}
                         />
                         <Upload className="w-10 h-10 text-gray-400" />
                         <p className="font-medium text-blue-600">
                           {selectedFile ? selectedFile.name : "Upload PDF or DOC file"}
                         </p>
                         <p className="text-base text-gray-700">
                           {selectedFile ? "Click on the Exract Buttom to Get Questions" : "Drag & drop or click to browse"}
                         </p>
                       </label>
                     </div>
                   </motion.div>
                 )}
                 

                  {/* Imported Questions Section */}
                    {importedQuestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 border-2 border-dashed border-gray-300 rounded-2xl p-6"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            Imported Question {currentQuestionIndex + 1} of {importedQuestions.length}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                              disabled={currentQuestionIndex === 0}
                              variant="outline"
                              className="bg-gray-100 hover:bg-gray-200"
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={() => setCurrentQuestionIndex(prev => 
                                Math.min(importedQuestions.length - 1, prev + 1)
                              )}
                              disabled={currentQuestionIndex === importedQuestions.length - 1}
                              variant="outline"
                              className="bg-gray-100 hover:bg-gray-200"
                            >
                              Next
                            </Button>
                            <Button
                              onClick={handleAddImportedQuestion}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Quiz
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="font-medium mb-2">{importedQuestions[currentQuestionIndex]?.text}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {["A", "B", "C", "D"].map(opt => (
                              <div key={opt} className="flex items-center gap-2">
                                <span className="font-bold">{opt}:</span>
                                <span>{importedQuestions[currentQuestionIndex]?.options[opt]}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <span className="font-bold">Correct Answer:</span> {importedQuestions[currentQuestionIndex]?.correctAnswer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                </CardContent>
              </Card>

              {/* Manual Question Builder */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <BookOpen className="w-6 h-6" />
                    Question Builder
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Questions ({questions.length})</h3>
                    <div className="flex gap-4">
                     
                      <Button
                        onClick={addQuestion}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-6 py-2 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <AnimatePresence>
                      {Array.isArray(questions) &&
                        questions.map((question, index) => (
                          <QuestionCard
                            key={question.id || index}
                            question={question}
                            index={index}
                            onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                            onDelete={() => deleteQuestion(index)}
                          />
                        ))}
                    </AnimatePresence>

                    {questions.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No questions added yet</p>
                        <p className="text-sm">Click "Add Question" to start building your quiz</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Section */}
              {questions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center gap-4"
                >
                  <Button
                    onClick={handleCreateQuiz}
                    disabled={isLoading}
                    className="h-14 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {isLoading ? "Creating..." : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Create Quiz
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
             <QuizAI
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                onQuestionGenerated={(question) => {
                  setQuestions(prev => Array.isArray(prev) ? [question, ...prev] : [question])
                }}
                quizData={{
                  ...formData,
                  duration: formData.duration || 30,
                  author: formData.author || "User"
                }}
              />
      </motion.div>
    </div>
  )
}