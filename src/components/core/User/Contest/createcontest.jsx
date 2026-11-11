"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Upload,
  X,
  Sparkles,
  Settings,
  Clock,
  ImageIcon,
  Award,
  Calendar,
  BookOpen,
  User,
  Database,
  ArrowLeft,
  ArrowRight,
  MapPin,
  FileText,
  Layers,
  Key,
} from "lucide-react"
import { getAllQuizRegions, getAllQuizQuestions } from "../../../../services/operations/quizAPI"
import { createContest } from "../../../../services/operations/contestAPI"
import ContestAI from "../../Manager/Contest/AIContest"
import QuizBankSelector from "../Quiz/QuizBankSelector"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 font-sans">
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
  <div className="space-y-1.5 font-sans">
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
  <div className="space-y-1.5 font-sans">
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

export default function BuildContest() {
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
    passcode: "",
    status: "Approved",
  })

  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [regions, setRegions] = useState([])
  const selectedRegion = regions.find((region) => region._id === contestData.region)
  const [questions, setQuestions] = useState([])
  const [quizBankQuestions, setQuizBankQuestions] = useState([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0)
  const [showAIModal, setShowAIModal] = useState(false)

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

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
  }

  // Fetch regions on mount
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
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === contestData.specificClass
    )
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  const getChapters = () => {
    if (
      !selectedRegion ||
      !contestData.examType ||
      !contestData.specificClass ||
      !contestData.subject
    )
      return []
    const selectedExamType = selectedRegion.examTypes.find((et) => et.name === contestData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === contestData.specificClass
    )
    const selectedSubject = selectedSpecificClass?.subjects.find(
      (sub) => sub.name === contestData.subject
    )
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
          : q
      )
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
      const selectedReg = regions.find((region) => region._id === contestData.region)

      if (!selectedReg?.name) {
        toast.error("Please select a region first before pulling from Quiz Bank")
        return
      }

      const payload = {
        category: {
          region: selectedReg?.name || "",
          examType: contestData.examType,
          specificClass: contestData.specificClass,
          subject: contestData.subject,
          chapter: contestData.chapter,
          quizType: "quizbank",
        },
      }

      const response = await getAllQuizQuestions(payload)
      if (response?.data && response.data.length > 0) {
        setQuizBankQuestions(response.data)
        toast.success(`Found ${response.data.length} questions in Quiz Bank. Review and add below.`)
      } else {
        toast.error(`No questions found in ${selectedReg?.name || "selected region"} quiz bank`)
        setQuizBankQuestions([])
      }
    } catch (error) {
      toast.error("Failed to fetch questions from quiz bank")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!contestData.title || !contestData.title.trim()) {
      toast.error("Please enter a contest title.")
      return
    }

    if (!contestData.region) {
      toast.error("Please select a region for the contest.")
      return
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question.")
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()

      Object.entries(contestData).forEach(([key, value]) => {
        if (key === "region") {
          const regionName = regions.find((region) => region._id === value)?.name || ""
          formData.append("region", regionName)
        } else if (key === "description") {
          const cleanDesc = value && value.trim()
            ? value.trim()
            : `${contestData.title.trim()} Contest guidelines and overview.`
          formData.append("description", cleanDesc)
        } else if (key === "author") {
          formData.append("author", value && value.trim() ? value.trim() : "Organizer")
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value)
        }
      })

      if (thumbnail) {
        formData.append("thumbnail", thumbnail)
      }

      // Format questions for Contest schema: options array of strings, normalized prompt
      const formattedPayloadQuestions = questions.map((q) => {
        let opts = []
        if (Array.isArray(q.options)) {
          opts = q.options.map((opt) => (opt !== null && opt !== undefined ? String(opt) : ""))
        } else if (q.options && typeof q.options === "object") {
          opts = [
            String(q.options.A || ""),
            String(q.options.B || ""),
            String(q.options.C || ""),
            String(q.options.D || ""),
          ]
          if (q.options.E) opts.push(String(q.options.E))
        }

        while (opts.length < 4) {
          opts.push(`Option ${String.fromCharCode(65 + opts.length)}`)
        }
        if (opts.length > 5) opts = opts.slice(0, 5)

        let ans = (q.correctAnswer || "A").trim().toUpperCase()
        if (!["A", "B", "C", "D", "E"].includes(ans)) ans = "A"

        return {
          topic: q.topic || contestData.chapter || "General",
          questionType: q.questionType || "Average",
          image: typeof q.image === "string" ? q.image : "",
          question: q.question || q.text || "Question prompt",
          options: opts,
          correctAnswer: ans,
        }
      })

      formData.append("questions", JSON.stringify(formattedPayloadQuestions))
      formData.append("status", "Approved")

      const response = await createContest(formData)

      if (response?.success) {
        toast.success("Contest created and approved successfully!")
        navigate("/filter-contest")
      } else {
        toast.error(response?.message || "Failed to create contest")
      }
    } catch (error) {
      console.error("Create Contest Error:", error)
      toast.error("Something went wrong while creating the contest")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this contest?")) {
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
        passcode: "",
        status: "Approved",
      })
      setThumbnail(null)
      setThumbnailPreview(null)
      setQuestions([])
      setShowQuestionForm(false)
      setCurrentQuestionNumber(0)
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
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#ffd02f] text-[#1c1c1e] shadow-2xs">
              STUDENT ARENA
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              CONTEST CREATION
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
            Build Competition Contest
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-2xl leading-relaxed">
            Design engaging quizzes and timed academic contests with live leaderboards, custom question compositions, and curriculum taxonomy.
          </p>
        </div>

        {/* Contest Setup Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shadow-2xs">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1c1c1e]">
                  Contest Setup & Specifications
                </h2>
                <p className="text-xs text-[#6a6d7c]">Fill in contest schedule, metadata, and taxonomy</p>
              </div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574] shadow-2xs">
              Phase 1 of 2
            </span>
          </div>

          {/* Core Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernInput
              label="Contest Title"
              placeholder="e.g., Annual Science Olympiad"
              value={contestData.title}
              onChange={(value) => handleContestDataChange("title", value)}
              icon={BookOpen}
              required
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
              placeholder="e.g. 30"
              value={contestData.duration}
              onChange={(value) => handleContestDataChange("duration", value)}
              icon={Clock}
            />
          </div>

          {/* Secondary Details: Author & Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernInput
              label="Host / Author Name"
              placeholder="e.g. Taksha, Department of Mathematics"
              value={contestData.author}
              onChange={(value) => handleContestDataChange("author", value)}
              icon={User}
            />

            {/* Passcode 5-digit inputs */}
            <div className="space-y-1.5 font-sans">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#8e91a0]" />
                <span>Room Passcode (5 digits)</span>
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={contestData.passcode[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      const newPasscode = contestData.passcode.split("")
                      newPasscode[index] = value
                      const updatedPasscode = newPasscode.join("").slice(0, 5)
                      setContestData({ ...contestData, passcode: updatedPasscode })

                      if (value && index < 4) {
                        const nextInput = document.getElementById(`passcode-${index + 1}`)
                        if (nextInput) nextInput.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !contestData.passcode[index] && index > 0) {
                        const prevInput = document.getElementById(`passcode-${index - 1}`)
                        if (prevInput) prevInput.focus()
                      }
                    }}
                    id={`passcode-${index}`}
                    className="w-full h-12 text-center bg-white border border-[#c7cad5] rounded-xl font-bold text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
                    placeholder="•"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Regional & Academic Taxonomy Hierarchy */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1c1c1e]">
                Curriculum Classification:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
              {/* Region (Yellow) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                  1. Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={contestData.region}
                  onChange={(e) => handleContestDataChange("region", e.target.value)}
                  disabled={isLoading}
                  className="w-full h-11 min-h-[44px] px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] cursor-pointer"
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
                  className={`w-full h-11 min-h-[44px] px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0] cursor-pointer ${
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
                  className={`w-full h-11 min-h-[44px] px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] cursor-pointer ${
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
                  className={`w-full h-11 min-h-[44px] px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] cursor-pointer ${
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
                  className={`w-full h-11 min-h-[44px] px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] cursor-pointer ${
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
          </div>

          {/* Thumbnail & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Thumbnail Upload */}
            <div className="space-y-1.5 font-sans">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Contest Thumbnail
              </label>
              <div className="border-2 border-dashed border-[#c7cad5] rounded-2xl p-4 text-center hover:border-[#1c1c1e] transition-all bg-[#f7f8fa] hover:bg-white">
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="Contest thumbnail"
                      className="max-h-36 mx-auto rounded-xl object-contain border border-[#e0e2e8]"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200 shadow-sm cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-[#8e91a0] mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-[#1c1c1e]">
                      Drag & drop an image or click to browse
                    </p>
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
              placeholder="Describe contest guidelines, rules, and scoring system..."
              value={contestData.description}
              onChange={(value) => handleContestDataChange("description", value)}
              rows={5}
            />
          </div>

          {/* Deep Question Composition Source Buttons */}
          {!showQuestionForm && contestData.chapter && (
            <div className="pt-4 border-t border-[#e0e2e8] space-y-3 w-full">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1c1c1e]">
                Choose how to compose questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                <button
                  type="button"
                  onClick={handleCreateOwn}
                  className="w-full h-13 min-h-[52px] px-5 py-3.5 rounded-xl bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#ffd02f]" />
                  <span>Create Your Own</span>
                </button>
                <button
                  type="button"
                  onClick={fetchQuestionsFromQuizBank}
                  className="w-full h-13 min-h-[52px] px-5 py-3.5 rounded-xl bg-[#4262ff] text-white hover:bg-[#3251e0] font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <Database className="w-4 h-4 text-[#fff4c4]" />
                  <span>Quiz Bank</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateByAI}
                  className="w-full h-13 min-h-[52px] px-5 py-3.5 rounded-xl bg-[#86296b] text-white hover:bg-[#6c1f56] font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#ffd8f4]" />
                  <span>Create by AI</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Bank 1-by-1 Question Review & Selector */}
        {quizBankQuestions.length > 0 && (
          <QuizBankSelector
            questions={quizBankQuestions}
            onAddQuestion={(q) => {
              const opts = Array.isArray(q.options)
                ? q.options
                : [q.options?.A || "", q.options?.B || "", q.options?.C || "", q.options?.D || ""]
              const newQ = {
                id: q._id || Date.now() + Math.random(),
                topic: contestData.chapter || "",
                questionType: q.difficulty || "Average",
                image: q.image || null,
                question: q.text || q.question || "",
                options: opts,
                correctAnswer: q.correctAnswer || "A",
              }
              setQuestions((prev) => [...prev, newQ])
              setShowQuestionForm(true)
              setCurrentQuestionNumber((prev) => prev + 1)
            }}
            alreadyAdded={(q) => {
              const qText = (q.text || q.question || "").trim().toLowerCase()
              return questions.some(
                (existing) => (existing.question || existing.text || "").trim().toLowerCase() === qText
              )
            }}
            onClose={() => setQuizBankQuestions([])}
          />
        )}

        {/* Questions Section */}
        {showQuestionForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1c1e]">
                Contest Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#ffd02f]" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id || index}
                  className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4 w-full"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e8ec]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-black text-xs shadow-2xs">
                        Q{index + 1}
                      </span>
                      <h3 className="text-base font-extrabold text-[#1c1c1e]">
                        Question {index + 1}
                      </h3>
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Topic */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                        Topic / Subject Area
                      </label>
                      <input
                        type="text"
                        placeholder="Enter topic"
                        value={question.topic}
                        onChange={(e) => updateQuestion(question.id, "topic", e.target.value)}
                        className="w-full h-11 min-h-[44px] px-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                      />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                        Difficulty Level
                      </label>
                      <select
                        value={question.questionType}
                        onChange={(e) => updateQuestion(question.id, "questionType", e.target.value)}
                        className="w-full h-11 min-h-[44px] px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all cursor-pointer"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Average">Average</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Question Prompt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Type your question statement here..."
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      rows={3}
                      className="w-full p-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all resize-none"
                    />
                  </div>

                  {/* Image Attachment (Optional) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Question Image Attachment (Optional)
                    </label>
                    <div className="border-2 border-dashed border-[#c7cad5] rounded-xl p-3 text-center bg-[#f7f8fa]">
                      {question.image ? (
                        <div className="relative inline-block">
                          <img
                            src={question.image}
                            alt="Question preview"
                            className="max-h-32 mx-auto rounded-lg object-contain border border-[#c7cad5]"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuestion(question.id, "image", null)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 border border-red-200 cursor-pointer shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(question.id, e.target.files?.[0])}
                            className="hidden"
                            id={`img-upload-${question.id}`}
                          />
                          <label
                            htmlFor={`img-upload-${question.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e] hover:bg-[#ebecf0] cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#ffd02f]" />
                            <span>Upload Image</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-2.5 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Multiple Choice Options
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.isArray(question.options) &&
                        question.options.slice(0, 4).map((option, optionIndex) => {
                          const optionLetter = String.fromCharCode(65 + optionIndex)
                          const isCorrect = question.correctAnswer === optionLetter

                          return (
                            <div
                              key={optionIndex}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                isCorrect
                                  ? "bg-[#c3faf5]/30 border-[#0fbcb0]"
                                  : "bg-white border-[#c7cad5]"
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                  isCorrect
                                    ? "bg-[#187574] text-white shadow-2xs"
                                    : "bg-[#f0f1f4] text-[#1c1c1e]"
                                }`}
                              >
                                {optionLetter}
                              </span>
                              <input
                                type="text"
                                placeholder={`Enter option ${optionLetter}`}
                                value={option}
                                onChange={(e) =>
                                  updateQuestionOption(question.id, optionIndex, e.target.value)
                                }
                                className="flex-1 px-3 py-2 bg-transparent text-xs font-semibold text-[#1c1c1e] focus:outline-none"
                              />
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Correct Answer Select */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                      Mark Correct Answer
                    </label>
                    <div className="flex gap-2">
                      {["A", "B", "C", "D"].map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => updateQuestion(question.id, "correctAnswer", letter)}
                          className={`w-12 h-10 rounded-xl font-black text-xs transition-all cursor-pointer ${
                            question.correctAnswer === letter
                              ? "bg-[#187574] text-white shadow-sm"
                              : "bg-[#f0f1f4] text-[#555a6a] hover:bg-[#e0e2e8]"
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#e6e8ec] flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#fbd4d4] bg-[#fff8f8] hover:bg-[#ffc6c6] text-[#800000] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Reset Contest
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-[#f7f8fa] disabled:border disabled:border-[#c7cad5] disabled:text-[#8e92a4] text-[#1c1c1e] text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin" />
                    <span>Publishing Arena...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Contest</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI Generator Modal */}
        <ContestAI
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onQuestionsGenerated={(generatedQuestions) => {
            setShowQuestionForm(true)
            setQuestions((prev) => [
              ...(Array.isArray(prev) ? prev : []),
              ...generatedQuestions,
            ])
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