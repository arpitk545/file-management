"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Upload,
  X,
  Sparkles,
  Clock,
  ImageIcon,
  Award,
  Calendar,
  BookOpen,
  User,
  Database,
  FileInput,
  FileUp,
  ArrowLeft,
  MapPin,
  FileText,
  Layers,
} from "lucide-react"
import {
  getAllQuizRegions,
  getAllQuizQuestions,
  extractQuestionsFromFile,
} from "../../../services/operations/quizAPI"
import { createContest } from "../../../services/operations/contestAPI"
import ContestAI from "./Contest/AIContest"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon, required = false }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-[#8e91a0]" />}
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 min-h-[48px] px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium leading-normal"
    />
  </div>
)

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 3 }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">{label}</label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full p-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium leading-normal resize-none"
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
    deadline: "",
    startTime: "",
    duration: "",
    author: "",
    status: "Approved",
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
      setShowQuestionForm(true)
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
      setShowQuestionForm(true)
      toast.success("All quiz bank questions added to contest!")
    }
  }

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

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
  }

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
    setQuestions((prev) => [...prev, newQuestion])
    setCurrentQuestionNumber((prev) => prev + 1)
    setShowQuestionForm(true)
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
      setIsLoading(true)
      const selectedRegionObj = regions.find((region) => region._id === contestData.region)

      const payload = {
        category: {
          region: selectedRegionObj?.name || "",
          examType: contestData.examType,
          specificClass: contestData.specificClass,
          subject: contestData.subject,
          chapter: contestData.chapter,
          quizType: "quizbank",
        },
      }

      const response = await getAllQuizQuestions(payload)
      setQuizBankQuestions(response.data || [])
      setCurrentQuizBankIndex(0)
      setActiveSource("quizBank")

      if ((response.data || []).length === 0) {
        toast.error(`No questions found in ${selectedRegionObj?.name || "selected region"}`)
      } else {
        toast.success(`${response.data.length} questions loaded from quiz bank`)
      }
    } catch (error) {
      toast.error(`Failed to fetch questions.`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!contestData.title || questions.length === 0) {
      toast.error("Please enter a title and at least one question.")
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()

      Object.entries(contestData).forEach(([key, value]) => {
        if (key === "region") {
          const regionName = regions.find((region) => region._id === value)?.name || ""
          formData.append("region", regionName)
        } else {
          formData.append(key, value)
        }
      })

      if (thumbnail) {
        formData.append("thumbnail", thumbnail)
      }

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

  const handleCreateOwn = () => {
    setShowQuestionForm(true)
    addQuestion()
  }

  const handleCreateByAI = () => {
    setShowAIModal(true)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        {/* Header Bar matching Posts createArticles.jsx */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              CONTEST STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              NEW CONTEST
            </span>
          </div>
          <button
            onClick={() => navigate("/filter-contest")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <span>View All Contests</span>
            <Sparkles className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>CONTEST BUILDER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Create Contest
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Design competitive contests, configure taxonomy, and compile question sets.
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && <MiroLoader message="Processing contest data..." />}

        {/* STEP 1: Contest Setup & Taxonomy (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#ddd6fe]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Contest Setup & Taxonomy Hierarchy</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          {/* General Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModernInput
              label="Contest Title"
              placeholder="e.g. National Olympiad 2026"
              value={contestData.title}
              onChange={(value) => handleContestDataChange("title", value)}
              icon={BookOpen}
              required
            />
            <ModernInput
              label="Author / Organizer"
              placeholder="e.g. Admin or Committee"
              value={contestData.author}
              onChange={(value) => handleContestDataChange("author", value)}
              icon={User}
            />
            <ModernInput
              label="Start Date & Time"
              type="datetime-local"
              value={contestData.startTime}
              onChange={(value) => handleContestDataChange("startTime", value)}
              icon={Calendar}
            />
            <ModernInput
              label="Deadline / Expiry"
              type="datetime-local"
              value={contestData.deadline}
              onChange={(value) => handleContestDataChange("deadline", value)}
              icon={Calendar}
            />
            <ModernInput
              label="Duration (minutes)"
              type="number"
              placeholder="e.g. 60"
              value={contestData.duration}
              onChange={(value) => handleContestDataChange("duration", value)}
              icon={Clock}
            />
          </div>

          {/* Taxonomy Grid with Pastel Tints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-2">
            {/* Region (Yellow) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                1. Region <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.region}
                onChange={(e) => handleContestDataChange("region", e.target.value)}
                disabled={isLoading}
                className="w-full h-11 min-h-[44px] px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff]"
              >
                <option value="">Choose region...</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type (Teal) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                2. Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.examType}
                onChange={(e) => handleContestDataChange("examType", e.target.value)}
                disabled={!contestData.region}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#0fbcb0] ${
                  !contestData.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose exam type...</option>
                {getExamTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class (Rose) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">
                3. Class <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.specificClass}
                onChange={(e) => handleContestDataChange("specificClass", e.target.value)}
                disabled={!contestData.examType}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#86296b] ${
                  !contestData.examType ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose class...</option>
                {getSpecificClasses().map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject (Orange) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">
                4. Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.subject}
                onChange={(e) => handleContestDataChange("subject", e.target.value)}
                disabled={!contestData.specificClass}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#ff7347] ${
                  !contestData.specificClass ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose subject...</option>
                {getSubjects().map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter (Lavender) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                5. Chapter <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.chapter}
                onChange={(e) => handleContestDataChange("chapter", e.target.value)}
                disabled={!contestData.subject}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] ${
                  !contestData.subject ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose chapter...</option>
                {getChapters().map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thumbnail & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Thumbnail Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Contest Thumbnail</label>
              <div className="border-2 border-dashed border-[#c7cad5] rounded-xl p-4 text-center hover:border-[#4262ff] transition-all bg-white">
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="Contest thumbnail"
                      className="max-h-36 mx-auto rounded-lg object-contain border border-[#e0e2e8]"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-[#8e91a0] mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-[#1c1c1e]">Drag & drop an image or click to browse</p>
                    <p className="text-[11px] text-[#555a6a] mt-0.5">Recommended: 800x450px</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                      className="hidden"
                      id="contest-thumbnail"
                    />
                    <label
                      htmlFor="contest-thumbnail"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1c1c1e] text-white rounded-full hover:bg-[#2c2c34] cursor-pointer text-xs font-bold shadow-sm transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#ffd02f]" />
                      <span>Choose Thumbnail</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <ModernTextarea
              label="Contest Description"
              placeholder="Describe contest guidelines, eligibility, and rules..."
              value={contestData.description}
              onChange={(value) => handleContestDataChange("description", value)}
              rows={5}
            />
          </div>

          {/* Question Source Trigger Pills (Visible when chapter is chosen & form not open) */}
          {!showQuestionForm && contestData.chapter && (
            <div className="pt-4 border-t border-[#e0e2e8] space-y-3 w-full">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1c1c1e]">
                Choose how to compose questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
                <button
                  type="button"
                  onClick={handleCreateOwn}
                  className="w-full h-13 min-h-[52px] px-5 py-3.5 rounded-xl bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 text-[#ffd02f]" />
                  <span>Create Your Own</span>
                </button>
                <button
                  type="button"
                  onClick={fetchQuestionsFromQuizBank}
                  className="w-full h-13 min-h-[52px] px-5 py-3.5 rounded-xl bg-[#4262ff] text-white hover:bg-[#3251e0] font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm"
                >
                  <Database className="w-4 h-4 text-[#fff4c4]" />
                  <span>Quiz Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSource("fileImport")}
                  className="w-full h-13 min-h-[52px] px-5 py-3.5 rounded-xl bg-[#187574] text-white hover:bg-[#135e5d] font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm"
                >
                  <FileInput className="w-4 h-4 text-[#c3faf5]" />
                  <span>Import File</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateByAI}
                  className="w-full h-13 min-h-[52px] px-5 py-3.5 rounded-xl bg-[#86296b] text-white hover:bg-[#6c1f56] font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#ffd8f4]" />
                  <span>Create by AI</span>
                </button>
              </div>
            </div>
          )}

          {/* File Import Dropzone Panel */}
          {activeSource === "fileImport" && !showQuestionForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="pt-4 border-t border-[#ddd6fe]">
              <div className="border-2 border-dashed border-[#0fbcb0] bg-[#c3faf5]/15 rounded-2xl p-6 text-center relative">
                <button
                  type="button"
                  onClick={() => setActiveSource(null)}
                  className="absolute top-3 right-3 p-1 rounded-full text-red-500 hover:bg-red-50"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xlsx,.csv"
                    onChange={handleFileChange}
                  />
                  <Upload className="w-8 h-8 text-[#0fbcb0]" />
                  <p className="font-bold text-sm text-[#1c1c1e]">{selectedFile ? selectedFile.name : "Upload PDF, DOCX, or Excel file"}</p>
                  <p className="text-xs text-[#555a6a]">
                    {selectedFile ? "File selected! Click 'Extract Questions' below" : "Drag & drop or click to browse files"}
                  </p>
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleExtractQuestions}
                  disabled={!selectedFile || isLoading}
                  className="px-6 py-2.5 bg-[#0fbcb0] hover:bg-[#0da399] text-white font-bold text-xs rounded-full shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <FileUp className="w-4 h-4" />
                  <span>{isLoading ? "Extracting Questions..." : "Extract Questions"}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Imported Questions Review Panel */}
          {importedQuestions.length > 0 && activeSource === "importedFile" && !showQuestionForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="pt-4 border-t border-[#ddd6fe]">
              <div className="bg-white rounded-2xl border border-[#9eece4] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1c1c1e]">
                    Imported Question {currentImportedQuestionIndex + 1} of {importedQuestions.length}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentImportedQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentImportedQuestionIndex === 0}
                      className="px-3 py-1.5 rounded-full border border-[#c7cad5] text-xs font-bold hover:bg-[#f7f8fa] disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentImportedQuestionIndex((prev) => Math.min(importedQuestions.length - 1, prev + 1))}
                      disabled={currentImportedQuestionIndex === importedQuestions.length - 1}
                      className="px-3 py-1.5 rounded-full border border-[#c7cad5] text-xs font-bold hover:bg-[#f7f8fa] disabled:opacity-40"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={handleAddImportedQuestion}
                      className="px-4 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Contest</span>
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-sm text-[#1c1c1e]">{importedQuestions[currentImportedQuestionIndex]?.text || importedQuestions[currentImportedQuestionIndex]?.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className="p-2 rounded-lg bg-[#f7f8fa] text-xs flex items-center gap-2">
                      <span className="font-bold text-[#4262ff]">{opt}:</span>
                      <span>{importedQuestions[currentImportedQuestionIndex]?.options?.[opt] || importedQuestions[currentImportedQuestionIndex]?.options?.[opt - 1]}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-[#187574]">
                  Correct Answer: {importedQuestions[currentImportedQuestionIndex]?.correctAnswer}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quiz Bank Question Review Panel */}
          {quizBankQuestions.length > 0 && activeSource === "quizBank" && !showQuestionForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="pt-4 border-t border-[#ddd6fe]">
              <div className="bg-white rounded-2xl border border-[#ddd6fe] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1c1c1e]">
                    Quiz Bank Question {currentQuizBankIndex + 1} of {quizBankQuestions.length}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentQuizBankIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuizBankIndex === 0}
                      className="px-3 py-1.5 rounded-full border border-[#c7cad5] text-xs font-bold hover:bg-[#f7f8fa] disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentQuizBankIndex((prev) => Math.min(quizBankQuestions.length - 1, prev + 1))}
                      disabled={currentQuizBankIndex === quizBankQuestions.length - 1}
                      className="px-3 py-1.5 rounded-full border border-[#c7cad5] text-xs font-bold hover:bg-[#f7f8fa] disabled:opacity-40"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuizBankQuestion}
                      className="px-4 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Contest</span>
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-sm text-[#1c1c1e]">{quizBankQuestions[currentQuizBankIndex]?.text || quizBankQuestions[currentQuizBankIndex]?.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className="p-2 rounded-lg bg-[#f7f8fa] text-xs flex items-center gap-2">
                      <span className="font-bold text-[#4262ff]">{opt}:</span>
                      <span>{quizBankQuestions[currentQuizBankIndex]?.options?.[opt] || quizBankQuestions[currentQuizBankIndex]?.options?.[opt - 1]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-[#187574]">Correct: {quizBankQuestions[currentQuizBankIndex]?.correctAnswer}</span>
                  <span className="text-[#7c3a00]">Difficulty: {quizBankQuestions[currentQuizBankIndex]?.difficulty}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* STEP 2: Questions Builder (White Card) */}
        {showQuestionForm && (
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#0fbcb0]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                  Contest Questions ({questions.length})
                </h2>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
                Step 2 of 2
              </span>
            </div>

            {/* Source pills bar within Step 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full pb-2">
              <button
                type="button"
                onClick={addQuestion}
                className="w-full h-12 min-h-[48px] px-4 py-3 rounded-sm bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-[#ffd02f]" />
                <span>Add Question</span>
              </button>
              <button
                type="button"
                onClick={fetchQuestionsFromQuizBank}
                className="w-full h-12 min-h-[48px] px-4 py-3 rounded-sm bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe] hover:bg-[#ede9fe] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                <Database className="w-4 h-4" />
                <span>Quiz Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSource("fileImport")}
                className="w-full h-12 min-h-[48px] px-4 py-3 rounded-sm bg-[#c3faf5] text-[#187574] border border-[#9eece4] hover:bg-[#a6f5ed] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                <FileInput className="w-4 h-4" />
                <span>Import File</span>
              </button>
              <button
                type="button"
                onClick={handleCreateByAI}
                className="w-full h-12 min-h-[48px] px-4 py-3 rounded-sm bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5] hover:bg-[#f7c2eb] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#86296b]" />
                <span>Create by AI</span>
              </button>
            </div>

            {/* Active Source Sub-panels inside Step 2 */}
            {activeSource === "fileImport" && (
              <div className="border-2 border-dashed border-[#0fbcb0] bg-[#c3faf5]/15 rounded-xl p-4 text-center relative">
                <button
                  type="button"
                  onClick={() => setActiveSource(null)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  id="file-upload-step2"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xlsx,.csv"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload-step2" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#0fbcb0] text-white rounded-full text-xs font-bold hover:bg-[#0da399]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{selectedFile ? selectedFile.name : "Select Document File"}</span>
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleExtractQuestions}
                    disabled={isLoading}
                    className="ml-3 px-4 py-2 bg-[#1c1c1e] text-white rounded-full text-xs font-bold hover:bg-[#2c2c34]"
                  >
                    Extract Questions
                  </button>
                )}
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              <AnimatePresence>
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 sm:p-5 rounded-xl border border-[#e0e2e8] bg-white space-y-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#e0e2e8]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1c1c1e] text-white text-xs font-extrabold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold text-[#1c1c1e]">Question {index + 1}</span>
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteQuestion(question.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Topic</label>
                        <input
                          type="text"
                          placeholder="e.g. Mechanics or Algebra"
                          value={question.topic}
                          onChange={(e) => updateQuestion(question.id, "topic", e.target.value)}
                          className="w-full h-11 min-h-[44px] px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Difficulty Level</label>
                        <select
                          value={question.questionType}
                          onChange={(e) => updateQuestion(question.id, "questionType", e.target.value)}
                          className="w-full h-11 min-h-[44px] px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Average">Average</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Question Prompt</label>
                      <textarea
                        placeholder="Enter the complete question..."
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                        rows={2}
                        className="w-full p-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] resize-none"
                      />
                    </div>

                    {/* Image Upload for Question */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                        Question Image (Optional)
                      </label>
                      {question.image ? (
                        <div className="relative inline-block">
                          <img
                            src={question.image}
                            alt="Question"
                            className="max-h-36 rounded-lg object-contain border border-[#e0e2e8]"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuestion(question.id, "image", null)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(question.id, e.target.files?.[0])}
                            className="hidden"
                            id={`image-${question.id}`}
                          />
                          <label
                            htmlFor={`image-${question.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] text-xs font-bold hover:bg-[#f7f8fa] cursor-pointer shadow-xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#86296b]" />
                            <span>Upload Image</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Answer Options</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {question.options?.map((option, optIdx) => {
                          const optLetter = ["A", "B", "C", "D"][optIdx] || optIdx + 1
                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe] text-xs font-bold flex items-center justify-center shrink-0">
                                {optLetter}
                              </span>
                              <input
                                type="text"
                                placeholder={`Option ${optLetter}`}
                                value={option}
                                onChange={(e) => updateQuestionOption(question.id, optIdx, e.target.value)}
                                className="w-full h-10 min-h-[40px] px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Correct Answer Select */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">Correct Answer</label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                        className="w-full sm:w-48 h-10 min-h-[40px] px-3 bg-[#c3faf5]/30 border border-[#9eece4] rounded-xl text-sm font-bold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#0fbcb0]"
                      >
                        {["A", "B", "C", "D"].map((opt) => (
                          <option key={opt} value={opt}>
                            Option {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Card Action */}
            <div className="pt-6 border-t border-[#e0e2e8] flex justify-start">
              <button
                type="button"
                onClick={addQuestion}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] font-semibold text-sm transition-all active:scale-95 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Question</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons Bar matching Posts createArticles.jsx */}
        {showQuestionForm && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isLoading}
              className="px-8 py-3.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] rounded-full font-extrabold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#1c1c1e]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing Contest...</span>
                </>
              ) : (
                <>
                  <span>Publish Contest</span>
                  <Sparkles className="w-4 h-4 text-[#1c1c1e]" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/filter-contest")}
              className="px-8 py-3.5 bg-white border border-[#c7cad5] text-[#1c1c1e] rounded-full hover:bg-[#f7f8fa] font-semibold text-sm transition-all shadow-sm"
            >
              Cancel Contest
            </button>
          </div>
        )}

        {/* AI Modal */}
        <ContestAI
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onQuestionsGenerated={(generatedQuestions) => {
            setShowQuestionForm(true)
            setQuestions((prev) => [...(Array.isArray(prev) ? prev : []), ...generatedQuestions])
            setCurrentQuestionNumber((prev) => prev + generatedQuestions.length)
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