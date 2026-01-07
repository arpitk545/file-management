"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input" 
import { Plus, Trash2, Upload, X, Sparkles, Settings, ChevronDown, Clock, ImageIcon, Award, Calendar, BookOpen, User, Database, FileInput, FileUp } from 'lucide-react'
import { getAllQuizRegions,getAllQuizQuestions, extractQuestionsFromFile  } from "../../../services/operations/quizAPI"
import { createContest } from "../../../services/operations/contestAPI"
import ContestAI from "./Contest/AIContest"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
    />
  </div>
)

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 3 }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700">{label}</Label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 resize-none shadow-sm hover:border-gray-300"
    />
  </div>
)

const CreateContest = () => {
  const navigate = useNavigate()
  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    prize: "",
    deadline: "",
    startTime: "",
    duration: "",
    author: "", 
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [regions, setRegions] = useState([])
  const selectedRegion = regions.find((region) => region._id === contestData.region)
  const [questions, setQuestions] = useState([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0)
  const [showAIModal, setShowAIModal] = useState(false)
  
  const [quizBankQuestions, setQuizBankQuestions] = useState([])
  const [currentQuizBankIndex, setCurrentQuizBankIndex] = useState(0)
  const [importedQuestions, setImportedQuestions] = useState([])
  const [currentImportedQuestionIndex, setCurrentImportedQuestionIndex] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeSource, setActiveSource] = useState(null)


  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setActiveSource("fileImport")
      toast.success(`File selected: ${file.name}`)
    }
  }

  const handleExtractQuestions = async () => {
    if (!selectedFile) return
    setIsLoading(true)

    try {
      const data = await extractQuestionsFromFile(selectedFile)
      if (data.questions && data.questions.length) {
        setImportedQuestions(data.questions)
        setCurrentImportedQuestionIndex(0)
        setActiveSource("importedFile")
        toast.success(`Extracted ${data.questions.length} questions successfully!`)
      } else {
        toast.error("No questions extracted from the file.")
      }
    } catch (err) {
      toast.error("Failed to extract questions: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImportedQuestion = () => {
    if (importedQuestions.length === 0) return

    const currentQuestion = importedQuestions[currentImportedQuestionIndex]
    setContestData((prev) => ({
      ...prev,
      chapter: currentQuestion.topic || prev.chapter,
    }))

    setQuestions((prevQuestions) =>
      Array.isArray(prevQuestions)
        ? [currentQuestion, ...prevQuestions]
        : [currentQuestion]
    )

    if (currentImportedQuestionIndex < importedQuestions.length - 1) {
      setCurrentImportedQuestionIndex(currentImportedQuestionIndex + 1)
      toast.success(`Added question ${currentImportedQuestionIndex + 1} of ${importedQuestions.length}`)
    } else {
      setImportedQuestions([])
      setCurrentImportedQuestionIndex(0)
      setActiveSource(null)
      setShowQuestionForm(true) // Keep form open
      toast.success("All imported questions added to contest!")
    }
  }

  const handleAddQuizBankQuestion = () => {
    if (quizBankQuestions.length === 0) return

    const currentQuestion = quizBankQuestions[currentQuizBankIndex]
    
    const mappedQuestion = {
      id: Date.now(),
      topic: currentQuestion.topic || contestData.chapter || "",
      questionType: currentQuestion.difficulty || "Easy",
      image: currentQuestion.image || null,
      question: currentQuestion.text || currentQuestion.question || "",
      options: [
        currentQuestion.options?.A || currentQuestion.options?.[0] || "",
        currentQuestion.options?.B || currentQuestion.options?.[1] || "",
        currentQuestion.options?.C || currentQuestion.options?.[2] || "",
        currentQuestion.options?.D || currentQuestion.options?.[3] || "",
      ],
      correctAnswer: currentQuestion.correctAnswer || "A",
    }

    setQuestions((prevQuestions) =>
      Array.isArray(prevQuestions)
        ? [mappedQuestion, ...prevQuestions]
        : [mappedQuestion]
    )

    if (currentQuizBankIndex < quizBankQuestions.length - 1) {
      setCurrentQuizBankIndex(currentQuizBankIndex + 1)
      toast.success(`Added question ${currentQuizBankIndex + 1} of ${quizBankQuestions.length}`)
    } else {
      setQuizBankQuestions([])
      setCurrentQuizBankIndex(0)
      setActiveSource(null)
      setShowQuestionForm(true) // Keep form open
      toast.success("All quiz bank questions added to contest!")
    }
  }

  // Handle thumbnail upload
  const handleThumbnailUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error("Please select a valid image file")
    }
  }

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
  }

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQuizRegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Failed to fetch quiz regions:", error)
        toast.error("Failed to load regions data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegions()
  }, [])

  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map((type) => type.name) || []
  }
  const getSpecificClasses = () => {
    if (!selectedRegion || !contestData.examType) return []
    const selectedExamType = selectedRegion.examTypes.find((et) => et.name === contestData.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }
  const getSubjects = () => {
    if (!selectedRegion || !contestData.examType || !contestData.specificClass) return []
    const selectedExamType = selectedRegion.examTypes.find((et) => et.name === contestData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find((sc) => sc.name === contestData.specificClass)
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }
  const getChapters = () => {
    if (!selectedRegion || !contestData.examType || !contestData.specificClass || !contestData.subject) return []
    const selectedExamType = selectedRegion.examTypes.find((et) => et.name === contestData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find((sc) => sc.name === contestData.specificClass)
    const selectedSubject = selectedSpecificClass?.subjects.find((sub) => sub.name === contestData.subject)
    return selectedSubject?.chapters?.map((ch) => ch.name) || []
  }

  const handleContestDataChange = (field, value) => {
    setContestData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "region") {
        updated.examType = ""
        updated.specificClass = ""
        updated.subject = ""
        updated.chapter = ""
      }
      if (field === "examType") {
        updated.specificClass = ""
        updated.subject = ""
        updated.chapter = ""
      }
      if (field === "specificClass") {
        updated.subject = ""
        updated.chapter = ""
      }
      if (field === "subject") {
        updated.chapter = ""
      }
      return updated
    })
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      topic: contestData.chapter || "",
      questionType: "Easy",
      image: null,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
    }
    // Add new question at the beginning of the array
    setQuestions((prev) => [newQuestion, ...prev])
    setCurrentQuestionNumber((prev) => prev + 1)
  }

  const deleteQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    if (currentQuestionNumber > 1) {
      setCurrentQuestionNumber((prev) => prev - 1)
    }
  }

  const updateQuestion = (questionId, field, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)))
  }

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)),
            }
          : q,
      ),
    )
  }

  const handleImageUpload = (questionId, file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateQuestion(questionId, "image", e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const fetchQuestionsFromQuizBank = async () => {
  try {
    setIsLoading(true);
    
    const selectedRegionObj = regions.find(region => region._id === contestData.region);

    const payload = {
      category: {
        region: selectedRegionObj?.name || "",
        examType: contestData.examType,
        specificClass: contestData.specificClass,
        subject: contestData.subject,
        chapter: contestData.chapter,
        quizType: "quizbank",
      }
    };

    const response = await getAllQuizQuestions(payload);
    setQuizBankQuestions(response.data);
    setCurrentQuizBankIndex(0);
    setActiveSource("quizBank");

    if (response.data.length === 0) {
      toast.error(`No questions found in ${selectedRegionObj?.name || "selected region"}`);
    } else {
      toast.success(`${response.data.length} questions loaded from quiz bank`);
    }

  } catch (error) {
    toast.error(`Failed to fetch questions.`);
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};

const handlePublish = async () => {
  if (!contestData.title || questions.length === 0) {
    toast.error("Please enter a title and at least one question.")
    return
  }

  try {
    setIsLoading(true)
    const formData = new FormData()

    // Append all contest data
    Object.entries(contestData).forEach(([key, value]) => {
      if (key === "region") {
        const regionName = regions.find(region => region._id === value)?.name || ""
        formData.append("region", regionName) 
      } else {
        formData.append(key, value)
      }
    })

    // Append thumbnail if exists
    if (thumbnail) {
      formData.append("thumbnail", thumbnail)
    }

    // Append questions
    formData.append("questions", JSON.stringify(questions))
    const response = await createContest(formData)

    if (response.success) {
      toast.success("Contest created successfully!")
      navigate("/filter-contest")
      setContestData({
        title: "",
        description: "",
        region: "",
        examType: "",
        specificClass: "",
        subject: "",
        chapter: "",
        prize: "",
        deadline: "",
        startTime: "",
        duration: "",
        author: "",
        status: "Approved",
      })
      setThumbnail(null)
      setThumbnailPreview(null)
      setQuestions([])
      setShowQuestionForm(false)
      setCurrentQuestionNumber(1)
    } else {
      toast.error(response.message || "Failed to create contest")
    }
  } catch (error) {
    console.error("Create Contest Error:", error)
    toast.error("Something went wrong while creating the contest")
  } finally {
    setIsLoading(false)
  }
}


  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this contest?")) {
      console.log("Deleting contest")
    }
  }

  const handleCreateOwn = () => {
    setShowQuestionForm(true)
    addQuestion()
  }

  const handleCreateByAI = () => {
    setShowAIModal(true)
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      {" "}
      <div className="max-w-6xl mx-auto space-y-6">
        {" "}
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          {" "}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {" "}
            Create New Contest
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Design engaging contests with custom questions and advanced settings
          </p>
        </motion.div>
        {/* Contest Setup - Card for desktop, plain for mobile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="md:shadow-xl md:border-0 bg-white md:bg-white/90 md:backdrop-blur-xl rounded-2xl overflow-hidden w-full">
            {" "}
        
            <div className="md:bg-gradient-to-r md:from-blue-600 md:via-purple-600 md:to-indigo-600 text-white p-5 md:p-6">
              {" "}
              <div className="flex items-center gap-2 text-xl md:text-2xl font-bold">
                {" "}
                <div className="p-2 bg-blue-600 md:bg-white/20 rounded-lg">
                  {" "}
                  <Settings className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                Contest Setup
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-6">
              {" "}
              {/* Decreased padding and space-y */}
              {/* Contest Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {" "}
                {/* Adjusted grid and decreased gap */}
                <ModernInput
                  label="Contest Title"
                  placeholder="Enter contest title"
                  value={contestData.title}
                  onChange={(value) => handleContestDataChange("title", value)}
                  icon={BookOpen}
                />
                <ModernInput
                  label="Start Time"
                  type="datetime-local"
                  value={contestData.startTime}
                  onChange={(value) => handleContestDataChange("startTime", value)}
                  icon={Calendar}
                />
                <ModernInput
                  label="Deadline"
                  type="datetime-local"
                  value={contestData.deadline}
                  onChange={(value) => handleContestDataChange("deadline", value)}
                  icon={Calendar}
                />
                <ModernInput
                  label="Duration (minutes)"
                  type="number"
                  placeholder="e.g., 30"
                  value={contestData.duration}
                  onChange={(value) => handleContestDataChange("duration", value)}
                  icon={Clock}
                />
                <ModernInput
                  label="Author"
                  placeholder="Enter author name"
                  value={contestData.author}
                  onChange={(value) => handleContestDataChange("author", value)}
                  icon={User}
                />
              </div>
              
              {/* Thumbnail Upload Section */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Contest Thumbnail
                </Label>
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-all duration-200 bg-gray-50/50">
                  {thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Contest thumbnail"
                        className="max-h-48 mx-auto rounded-xl shadow-md"
                      />
                      <Button
                        onClick={removeThumbnail}
                        variant="destructive"
                        size="sm"
                        className="absolute bg-gray-200 hover:bg-gray-300 -top-2 -right-2 rounded-full w-6 h-6 p-0 shadow-md"
                      >
                        <X className="w-3 text-red-400 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3 font-medium">
                        Drag & drop an image or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Recommended: 800x450px (16:9 aspect ratio)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                        className="hidden"
                        id="contest-thumbnail"
                      />
                      <label
                        htmlFor="contest-thumbnail"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 cursor-pointer font-medium shadow-md transition-all duration-200"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choose Thumbnail
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contest Description */}
              <ModernTextarea
                label="Contest Description"
                placeholder="Enter contest description"
                value={contestData.description}
                onChange={(value) => handleContestDataChange("description", value)}
              />
              {/* Category Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {" "}
                {/* Decreased gap */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Select Region</Label>
                  <div className="relative">
                    <select
                      value={contestData.region}
                      onChange={(e) => handleContestDataChange("region", e.target.value)}
                      className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                      disabled={isLoading}
                    >
                      <option value="">Choose region</option>
                      {regions.map((region) => (
                        <option key={region._id} value={region._id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <AnimatePresence>
                  {contestData.region && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Class/Exam Type</Label>
                      <div className="relative">
                        <select
                          value={contestData.examType}
                          onChange={(e) => handleContestDataChange("examType", e.target.value)}
                          className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                        >
                          <option value="">Choose exam type</option>
                          {getExamTypes().map((examType) => (
                            <option key={examType} value={examType}>
                              {examType}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {contestData.examType && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Specific Class</Label>
                      <div className="relative">
                        <select
                          value={contestData.specificClass}
                          onChange={(e) => handleContestDataChange("specificClass", e.target.value)}
                          className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                        >
                          <option value="">Choose class</option>
                          {getSpecificClasses().map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {contestData.specificClass && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Subject (Category)</Label>
                      <div className="relative">
                        <select
                          value={contestData.subject}
                          onChange={(e) => handleContestDataChange("subject", e.target.value)}
                          className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                        >
                          <option value="">Choose subject</option>
                          {getSubjects().map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {contestData.subject && getChapters().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Chapter/Topic (Sub Category)</Label>
                      <div className="relative">
                        <select
                          value={contestData.chapter}
                          onChange={(e) => handleContestDataChange("chapter", e.target.value)}
                          className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                        >
                          <option value="">Choose chapter</option>
                          {getChapters().map((chapterName) => (
                            <option key={chapterName} value={chapterName}>
                              {chapterName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Action Buttons */}
              {!showQuestionForm && contestData.chapter && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-gray-100">
                  {" "}
                  {/* Decreased gap and padding-top */}
                  <Button
                    onClick={handleCreateOwn}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-2 bg-white/20 rounded-lg mr-2">
                      <Settings className="w-4 h-4" />
                    </div>
                    Create Your Own
                  </Button>
                  <Button
                    onClick={fetchQuestionsFromQuizBank}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-2 bg-white/20 rounded-lg mr-2">
                      <Database className="w-4 h-4" />
                    </div>
                    Quiz Bank
                  </Button>
                  <Button
                    onClick={() => setActiveSource("fileImport")}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-2 bg-white/20 rounded-lg mr-2">
                      <FileInput className="w-4 h-4" />
                    </div>
                    Import File
                  </Button>
                  <Button
                    onClick={handleCreateByAI}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-500 text-white rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-2 bg-white/20 rounded-lg mr-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    Create by AI
                  </Button>
                </div>
              )}

              {activeSource === "fileImport" && !showQuestionForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="relative pt-4 border-t-2 border-gray-100">
                  <div className="border-2 border-dashed border-green-400 rounded-2xl p-8 text-center relative">
                    <button
                      type="button"
                      onClick={() => setActiveSource(null)}
                      className="absolute top-3 right-3 text-red-600 hover:text-red-800 focus:outline-none text-2xl font-bold"
                      aria-label="Close upload area"
                    >
                      ✕
                    </button>

                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-3">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xlsx,.csv"
                        onChange={handleFileChange}
                      />
                      <Upload className="w-10 h-10 text-gray-400" />
                      <p className="font-medium text-green-600">{selectedFile ? selectedFile.name : "Upload PDF or DOC file"}</p>
                      <p className="text-base text-gray-700">
                        {selectedFile ? "Click 'Extract Questions' to process the file" : "Drag & drop or click to browse"}
                      </p>
                    </label>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleExtractQuestions}
                      disabled={!selectedFile || isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl h-12 font-semibold"
                    >
                      <FileUp className="w-4 h-4 mr-2" />
                      {isLoading ? "Extracting..." : "Extract Questions"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {importedQuestions.length > 0 && activeSource === "importedFile" && !showQuestionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="border-2 border-dashed border-green-300 rounded-2xl p-6 pt-4 border-t-2"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Imported Question {currentImportedQuestionIndex + 1} of {importedQuestions.length}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentImportedQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentImportedQuestionIndex === 0}
                        variant="outline"
                        className="bg-gray-100 hover:bg-gray-200"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentImportedQuestionIndex((prev) => Math.min(importedQuestions.length - 1, prev + 1))}
                        disabled={currentImportedQuestionIndex === importedQuestions.length - 1}
                        variant="outline"
                        className="bg-gray-100 hover:bg-gray-200"
                      >
                        Skip
                      </Button>
                      <Button onClick={handleAddImportedQuestion} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Contest
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-medium mb-2">{importedQuestions[currentImportedQuestionIndex]?.text || importedQuestions[currentImportedQuestionIndex]?.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["A", "B", "C", "D"].map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="font-bold">{opt}:</span>
                          <span>{importedQuestions[currentImportedQuestionIndex]?.options?.[opt] || importedQuestions[currentImportedQuestionIndex]?.options?.[opt - 1]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <span className="font-bold">Correct Answer:</span> {importedQuestions[currentImportedQuestionIndex]?.correctAnswer}
                    </div>
                  </div>
                </motion.div>
              )}

              {quizBankQuestions.length > 0 && activeSource === "quizBank" && !showQuestionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="border-2 border-dashed border-blue-300 rounded-2xl p-6 pt-4 border-t-2"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Quiz Bank Question {currentQuizBankIndex + 1} of {quizBankQuestions.length}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentQuizBankIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuizBankIndex === 0}
                        variant="outline"
                        className="bg-gray-100 hover:bg-gray-200"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentQuizBankIndex((prev) => Math.min(quizBankQuestions.length - 1, prev + 1))}
                        disabled={currentQuizBankIndex === quizBankQuestions.length - 1}
                        variant="outline"
                        className="bg-gray-100 hover:bg-gray-200"
                      >
                        Skip
                      </Button>
                      <Button onClick={handleAddQuizBankQuestion} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Contest
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-medium mb-3 text-gray-800">{quizBankQuestions[currentQuizBankIndex]?.text || quizBankQuestions[currentQuizBankIndex]?.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {["A", "B", "C", "D"].map((opt) => (
                        <div key={opt} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                          <span className="font-bold text-blue-600">{opt}:</span>
                          <span>{quizBankQuestions[currentQuizBankIndex]?.options?.[opt] || quizBankQuestions[currentQuizBankIndex]?.options?.[opt - 1]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="font-bold">Correct Answer:</span> <span className="text-green-600 font-semibold">{quizBankQuestions[currentQuizBankIndex]?.correctAnswer}</span>
                      </div>
                      <div>
                        <span className="font-bold">Difficulty:</span> <span className="text-orange-600 font-semibold">{quizBankQuestions[currentQuizBankIndex]?.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        {/* Questions Section - Only shown when form is active */}
        {showQuestionForm && (
          <div className="space-y-4">
            {" "}
            {/* Decreased space-y */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Questions ({currentQuestionNumber})
              </h2>
              <Button
                onClick={addQuestion}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl h-12 px-4 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pb-4 border-b-2 border-gray-200">
              <Button
                onClick={handleCreateOwn}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="p-1 bg-white/20 rounded mr-2">
                  <Settings className="w-3 h-3" />
                </div>
                Create Your Own
              </Button>
              <Button
                onClick={fetchQuestionsFromQuizBank}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="p-1 bg-white/20 rounded mr-2">
                  <Database className="w-3 h-3" />
                </div>
                Quiz Bank
              </Button>
              <Button
                onClick={() => setActiveSource("fileImport")}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="p-1 bg-white/20 rounded mr-2">
                  <FileInput className="w-3 h-3" />
                </div>
                Import File
              </Button>
              <Button
                onClick={handleCreateByAI}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="p-1 bg-white/20 rounded mr-2">
                  <Sparkles className="w-3 h-3" />
                </div>
                Create by AI
              </Button>
            </div>

            {/* File import section when editing */}
            {activeSource === "fileImport" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="relative pt-4 border-t-2 border-gray-100">
                <div className="border-2 border-dashed border-green-400 rounded-2xl p-8 text-center relative">
                  <button
                    type="button"
                    onClick={() => setActiveSource(null)}
                    className="absolute top-3 right-3 text-red-600 hover:text-red-800 focus:outline-none text-2xl font-bold"
                    aria-label="Close upload area"
                  >
                    ✕
                  </button>

                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-3">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xlsx,.csv"
                      onChange={handleFileChange}
                    />
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="font-medium text-green-600">{selectedFile ? selectedFile.name : "Upload PDF or DOC file"}</p>
                    <p className="text-base text-gray-700">
                      {selectedFile ? "Click 'Extract Questions' to process the file" : "Drag & drop or click to browse"}
                    </p>
                  </label>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleExtractQuestions}
                    disabled={!selectedFile || isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl h-12 font-semibold"
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    {isLoading ? "Extracting..." : "Extract Questions"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Imported questions preview when editing */}
            {importedQuestions.length > 0 && activeSource === "importedFile" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="border-2 border-dashed border-green-300 rounded-2xl p-6 pt-4 border-t-2"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Imported Question {currentImportedQuestionIndex + 1} of {importedQuestions.length}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentImportedQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentImportedQuestionIndex === 0}
                      variant="outline"
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentImportedQuestionIndex((prev) => Math.min(importedQuestions.length - 1, prev + 1))}
                      disabled={currentImportedQuestionIndex === importedQuestions.length - 1}
                      variant="outline"
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Skip
                    </Button>
                    <Button onClick={handleAddImportedQuestion} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Contest
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-medium mb-2">{importedQuestions[currentImportedQuestionIndex]?.text || importedQuestions[currentImportedQuestionIndex]?.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <span className="font-bold">{opt}:</span>
                        <span>{importedQuestions[currentImportedQuestionIndex]?.options?.[opt] || importedQuestions[currentImportedQuestionIndex]?.options?.[opt - 1]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <span className="font-bold">Correct Answer:</span> {importedQuestions[currentImportedQuestionIndex]?.correctAnswer}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quiz bank questions preview when editing */}
            {quizBankQuestions.length > 0 && activeSource === "quizBank" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="border-2 border-dashed border-blue-300 rounded-2xl p-6 pt-4 border-t-2"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Quiz Bank Question {currentQuizBankIndex + 1} of {quizBankQuestions.length}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentQuizBankIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuizBankIndex === 0}
                      variant="outline"
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentQuizBankIndex((prev) => Math.min(quizBankQuestions.length - 1, prev + 1))}
                      disabled={currentQuizBankIndex === quizBankQuestions.length - 1}
                      variant="outline"
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Skip
                    </Button>
                    <Button onClick={handleAddQuizBankQuestion} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Contest
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-medium mb-3 text-gray-800">{quizBankQuestions[currentQuizBankIndex]?.text || quizBankQuestions[currentQuizBankIndex]?.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                        <span className="font-bold text-blue-600">{opt}:</span>
                        <span>{quizBankQuestions[currentQuizBankIndex]?.options?.[opt] || quizBankQuestions[currentQuizBankIndex]?.options?.[opt - 1]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="font-bold">Correct Answer:</span> <span className="text-green-600 font-semibold">{quizBankQuestions[currentQuizBankIndex]?.correctAnswer}</span>
                    </div>
                    <div>
                      <span className="font-bold">Difficulty:</span> <span className="text-orange-600 font-semibold">{quizBankQuestions[currentQuizBankIndex]?.difficulty}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="md:shadow-xl md:border-0 bg-white md:bg-white/90 md:backdrop-blur-xl rounded-2xl overflow-hidden mb-4">
                    {" "}
                    {/* Decreased border-radius, shadow, margin-bottom */}
                    <div className="md:bg-gradient-to-r md:from-indigo-600 md:to-blue-600 text-white p-4 md:p-5">
                      {" "}
                      {/* Decreased padding */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-lg md:text-xl font-bold">
                          {" "}
                          {/* Decreased gap */}
                          <div className="w-8 h-8 bg-blue-600 md:bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
                            {" "}
                            {/* Decreased border-radius, font-size */}
                            {index + 1}
                          </div>
                          Question {index + 1}
                        </div>
                        {questions.length > 1 && (
                          <Button
                            onClick={() => deleteQuestion(question.id)}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 rounded-lg h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 md:p-6 space-y-4">
                      {" "}
                      {/* Decreased padding and space-y */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {" "}
                        {/* Decreased gap */}
                        {/* Topic */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Topic</Label>
                          <input
                            type="text"
                            placeholder="Enter topic"
                            value={question.topic}
                            onChange={(e) => updateQuestion(question.id, "topic", e.target.value)}
                            className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                          />
                        </div>
                        {/* Question Type */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Difficulty Level</Label>
                          <div className="relative">
                            <select
                              value={question.questionType}
                              onChange={(e) => updateQuestion(question.id, "questionType", e.target.value)}
                              className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Average">Average</option>
                              <option value="Hard">Hard</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      {/* Image Upload */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-800">Question Image (Optional)</Label>
                        <div className="border-2 border-dashed border-blue-300 rounded-2xl p-4 text-center hover:border-blue-400 transition-all duration-200 bg-gray-50/50">
                          {question.image ? (
                            <div className="relative inline-block">
                              <img
                                src={question.image || "/placeholder.svg"}
                                alt="Question"
                                className="max-h-40 mx-auto rounded-xl shadow-md"
                              />
                              <Button
                                onClick={() => updateQuestion(question.id, "image", null)}
                                variant="destructive"
                                size="sm"
                                className="absolute bg-gray-200 hover:bg-gray-300 -top-2 -right-2 rounded-full w-6 h-6 p-0 shadow-md"
                              >
                                <X className="w-3 text-red-400 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <p className="text-sm text-gray-600 mb-2 font-medium">
                                Drag & drop an image or click to browse
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(question.id, e.target.files[0])}
                                className="hidden"
                                id={`image-${question.id}`}
                              />
                              <label
                                htmlFor={`image-${question.id}`}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 cursor-pointer font-medium shadow-md transition-all duration-200 text-sm"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Image
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Question Field */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-800">Question</Label>
                        <textarea
                          placeholder="Enter your question here..."
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 resize-none shadow-sm hover:border-gray-300"
                        />
                      </div>
                      {/* Options A-E */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800">Answer Options</Label>
                        <div className="grid grid-cols-1 gap-3">
                          {Array.isArray(question.options) &&
                            question.options.slice(0, 4).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md">
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <input
                                  type="text"
                                  placeholder={`Enter option ${String.fromCharCode(65 + optionIndex)}`}
                                  value={option}
                                  onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                                  className="flex-1 h-10 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                      {/* Correct Answer */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-800">Correct Answer</Label>
                        <div className="relative">
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                            className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                          >
                            {["A", "B", "C", "D",].map((option) => (
                              <option key={option} value={option}>
                                Option {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {/* Bottom Action Buttons */}
        {showQuestionForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-6"
          >
            <Button
              onClick={handlePublish}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl h-12 text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Publish Contest
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl h-12 text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Contest
            </Button>
          </motion.div>
        )}
        <ContestAI
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onQuestionsGenerated={(questions) => {
            setShowQuestionForm(true)
            setQuestions((prev) => [...(Array.isArray(prev) ? prev : []), ...questions])
            setCurrentQuestionNumber((prev) => prev + questions.length)
          }}
          contestData={{
            ...contestData,
            duration: contestData.duration || 30,
          }}
        />
      </div>
    </div>
  )
}

export default CreateContest
