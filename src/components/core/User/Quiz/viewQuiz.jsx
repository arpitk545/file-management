"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  BookOpen,
  Users,
  Target,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  User,
  Lock,
  Play,
  ArrowLeft,
  Filter,
  X,
  Sparkles,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions, getAllQuizzesWithCategoryAndQuestions } from "../../../../services/operations/quizAPI"

// Passcode Modal Component - Miro Style
const PasscodeModal = ({ isOpen, onClose, onVerify, quizTitle }) => {
  const [passcode, setPasscode] = useState(["", "", "", "", ""])
  const [loading, setLoading] = useState(false)

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return

    const newPasscode = [...passcode]
    newPasscode[index] = value
    setPasscode(newPasscode)

    if (value && index < 4) {
      const nextInput = document.getElementById(`passcode-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      const prevInput = document.getElementById(`passcode-input-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async () => {
    const enteredPasscode = passcode.join("")
    if (enteredPasscode.length !== 5) {
      toast.error("Please enter a 5-digit passcode")
      return
    }

    setLoading(true)
    await onVerify(enteredPasscode)
    setLoading(false)
  }

  const handleClose = () => {
    setPasscode(["", "", "", "", ""])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl border border-[#c7cad5] p-6 w-full max-w-md shadow-sm"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#fff4c4] rounded-full flex items-center justify-center mx-auto mb-3 text-[#746019]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-medium text-[#1c1c1e] mb-1">Enter Passcode</h3>
          <p className="text-[#555a6a] text-xs leading-relaxed">
            Please enter the 5-digit passcode to play <span className="font-semibold text-[#1c1c1e]">"{quizTitle}"</span>
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex justify-center gap-2.5 mb-5">
            {[0, 1, 2, 3, 4].map((index) => (
              <input
                key={index}
                id={`passcode-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={passcode[index]}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-12 text-center border border-[#c7cad5] rounded-lg font-medium text-lg text-[#1c1c1e] bg-white focus:border-2 focus:border-[#4262ff] focus:outline-none transition-colors"
                placeholder="•"
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              type="button"
              className="flex-1 py-3 px-6 border border-[#c7cad5] text-[#1c1c1e] rounded-full text-sm font-medium hover:bg-[#f7f8fa] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              type="button"
              className="flex-1 py-3 px-6 bg-[#1c1c1e] hover:bg-[#2c2c34] active:bg-[#2c2c34] text-white rounded-full text-sm font-medium disabled:bg-[#e0e2e8] disabled:text-[#a5a8b5] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Play className="w-4 h-4 text-[#ffd02f] fill-[#ffd02f]" />
              )}
              <span>Verify & Play</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function QuizDetails() {
  const navigate = useNavigate()
  const [examTypes, setExamTypes] = useState([])
  const [specificClasses, setSpecificClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [openDetails, setOpenDetails] = useState({})
  const [quizzes, setQuizzes] = useState([])
  const [regions, setRegions] = useState([])
  const [filters, setFilters] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)

  // Fetch quizzes and regions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [quizzesRes, regionsRes] = await Promise.all([
          getAllQuizzesWithCategoryAndQuestions(),
          getAllQuizRegions(),
        ])

        const approvedQuizzes = (quizzesRes?.data || [])
          .filter(
            (quiz) =>
              (quiz.approvalStatus === "Approved" || quiz.category?.approvalStatus === "Approved") &&
              quiz.category?.quizType === "createquiz"
          )
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.category?.createdAt || 0)
            const dateB = new Date(b.createdAt || b.category?.createdAt || 0)
            return dateB - dateA
          })

        setQuizzes(approvedQuizzes)
        setRegions(regionsRes?.data || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault()
      navigate("/dashboard", { replace: true })
    }

    window.addEventListener("popstate", handleBackButton)

    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [navigate])

  const toggleDetails = (id) => {
    setOpenDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handlePlayQuiz = (quiz) => {
    if (quiz.category?.passcode) {
      setSelectedQuiz(quiz)
      setShowPasscodeModal(true)
    } else {
      navigate(`/play-quiz/${quiz._id}`)
    }
  }

  const handlePasscodeVerify = async (enteredPasscode) => {
    if (!selectedQuiz) return

    if (enteredPasscode === selectedQuiz.category.passcode) {
      toast.success("Passcode verified!")
      setShowPasscodeModal(false)
      setSelectedQuiz(null)
      navigate(`/play-quiz/${selectedQuiz._id}`)
    } else {
      toast.error("Incorrect passcode. Please try again.")
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "region" && {
        examType: "",
        specificClass: "",
        subject: "",
        chapter: "",
      }),
      ...(name === "examType" && {
        specificClass: "",
        subject: "",
        chapter: "",
      }),
      ...(name === "specificClass" && {
        subject: "",
        chapter: "",
      }),
      ...(name === "subject" && {
        chapter: "",
      }),
    }))
  }

  useEffect(() => {
    const selectedRegion = regions.find((region) => region._id === filters.region)
    if (selectedRegion) {
      setExamTypes(selectedRegion.examTypes || [])
      setFilters((prev) => ({
        ...prev,
        examType: "",
        specificClass: "",
        subject: "",
        chapter: "",
      }))
    } else {
      setExamTypes([])
    }
  }, [filters.region, regions])

  useEffect(() => {
    const selectedRegion = regions.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)

    if (selectedExamType) {
      setSpecificClasses(selectedExamType.specificClasses || [])
      setFilters((prev) => ({
        ...prev,
        specificClass: "",
        subject: "",
        chapter: "",
      }))
    } else {
      setSpecificClasses([])
    }
  }, [filters.examType, filters.region, regions])

  useEffect(() => {
    const selectedRegion = regions.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === filters.specificClass
    )

    if (selectedSpecificClass) {
      setSubjects(selectedSpecificClass.subjects || [])
      setFilters((prev) => ({
        ...prev,
        subject: "",
        chapter: "",
      }))
    } else {
      setSubjects([])
    }
  }, [filters.specificClass, filters.examType, filters.region, regions])

  useEffect(() => {
    const selectedRegion = regions.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === filters.specificClass
    )
    const selectedSubject = selectedSpecificClass?.subjects.find((sub) => sub.name === filters.subject)

    if (selectedSubject) {
      setChapters(selectedSubject.chapters || [])
      setFilters((prev) => ({
        ...prev,
        chapter: "",
      }))
    } else {
      setChapters([])
    }
  }, [filters.subject, filters.specificClass, filters.examType, filters.region, regions])

  const clearAllFilters = () => {
    setFilters({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
  }

  const isFiltered = Boolean(
    filters.region ||
    filters.examType ||
    filters.specificClass ||
    filters.subject ||
    filters.chapter
  )

  const filteredQuizzes = quizzes.filter((quiz) => {
    const selectedRegionName = regions.find((r) => r._id === filters.region)?.name
    const category = quiz.category || {}

    return (
      (!filters.region || category.region === selectedRegionName) &&
      (!filters.examType || category.examType === filters.examType) &&
      (!filters.specificClass || category.specificClass === filters.specificClass) &&
      (!filters.subject || category.subject === filters.subject) &&
      (!filters.chapter || category.chapter === filters.chapter)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">
          Loading available quizzes...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c7cad5] bg-white text-xs font-medium text-[#1c1c1e] hover:bg-[#f7f8fa] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                QUIZ LIBRARY
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                VERIFIED QUIZZES
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#1c1c1e]">
              Available Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-[#555a6a] max-w-2xl leading-relaxed">
              Explore subject tests, chapter-wise practice assessments, and challenge yourself with curriculum-aligned quizzes.
            </p>
          </div>
        </div>

        {/* Filter Card - Miro card-base */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-6 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#fff4c4] flex items-center justify-center text-[#746019]">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-medium text-[#1c1c1e]">Filter Quizzes</h2>
                <p className="text-xs text-[#555a6a]">Select educational board and curriculum taxonomy</p>
              </div>
            </div>

            {isFiltered && (
              <button
                onClick={clearAllFilters}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#600000] border border-[#e3c5c5] rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Region */}
            <div className="space-y-1.5">
              <label htmlFor="region" className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Region
              </label>
              <select
                id="region"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-full text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] cursor-pointer"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div className="space-y-1.5">
              <label htmlFor="examType" className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Exam Type
              </label>
              <select
                id="examType"
                name="examType"
                value={filters.examType}
                onChange={handleFilterChange}
                disabled={!filters.region}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-full text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">All Exam Types</option>
                {examTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <label htmlFor="specificClass" className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Class
              </label>
              <select
                id="specificClass"
                name="specificClass"
                value={filters.specificClass}
                onChange={handleFilterChange}
                disabled={!filters.examType}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-full text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">All Classes</option>
                {specificClasses.map((cls) => (
                  <option key={cls.name} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label htmlFor="subject" className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                disabled={!filters.specificClass}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-full text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div className="space-y-1.5">
              <label htmlFor="chapter" className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Chapter
              </label>
              <select
                id="chapter"
                name="chapter"
                value={filters.chapter}
                onChange={handleFilterChange}
                disabled={!filters.subject}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-full text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">All Chapters</option>
                {chapters.map((ch) => (
                  <option key={ch.name} value={ch.name}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#c7cad5] shadow-sm space-y-3">
            <div className="w-12 h-12 bg-[#fff4c4] rounded-full flex items-center justify-center mx-auto text-[#746019]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-[#1c1c1e]">No quizzes found</h3>
            <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
              {quizzes.length === 0
                ? "There are currently no approved quizzes available in this section."
                : "Try adjusting or clearing your filters to discover available assessments."}
            </p>
            {isFiltered && (
              <div className="pt-1">
                <button
                  onClick={clearAllFilters}
                  type="button"
                  className="px-6 py-3 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Quizzes Grid - Miro card-base with aligned rows and complete image fit */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredQuizzes.map((quiz) => {
              const cat = quiz.category || {}
              const quizTitle = cat.quizTitle || quiz.fileTitle || "Untitled Quiz"

              return (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm overflow-hidden flex flex-col h-full transition-all"
                >
                  {/* Complete Image Thumbnail or Pastel Header - Fixed h-48 for all cards */}
                  {cat.thumbnailimage ? (
                    <div className="h-48 w-full bg-[#f0f1f4] flex items-center justify-center p-3 overflow-hidden border-b border-[#c7cad5]">
                      <img
                        src={cat.thumbnailimage}
                        alt={quizTitle}
                        className="w-full h-full object-contain object-center"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-[#fff8e0] border-b border-[#fde89c] p-5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-semibold uppercase tracking-wider">
                          QUIZ
                        </span>
                        {cat.passcode && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffc6c6] text-[#600000] text-[10px] font-semibold">
                            <Lock className="w-3 h-3" />
                            <span>Protected</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center py-2">
                        <div className="w-14 h-14 rounded-2xl bg-[#ffd02f]/40 flex items-center justify-center text-[#746019]">
                          <BookOpen className="w-8 h-8 text-[#746019]" />
                        </div>
                      </div>
                      <div className="text-center text-[11px] font-medium text-[#746019] uppercase tracking-wider">
                        Study Assessment
                      </div>
                    </div>
                  )}

                  {/* Quiz Content - flex-grow flex flex-col justify-between */}
                  <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Title with consistent min-height */}
                      <div className="min-h-[2.75rem] flex items-start justify-between gap-2">
                        <h2 className="text-base font-medium text-[#1c1c1e] line-clamp-2 leading-snug">
                          {quizTitle}
                        </h2>
                        {cat.thumbnailimage && cat.passcode && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffc6c6] text-[#600000] text-[10px] font-semibold shrink-0">
                            <Lock className="w-3 h-3" />
                            <span>Passcode</span>
                          </span>
                        )}
                      </div>

                      {/* Description with consistent min-height */}
                      <div className="min-h-[2.25rem] flex items-start">
                        <p className="text-[#555a6a] text-xs line-clamp-2 leading-relaxed font-normal">
                          {cat.description || "Interactive assessment designed to test conceptual understanding and recall."}
                        </p>
                      </div>

                      {/* Quiz Info Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#fff8e0] border border-[#fde89c]/60 text-[#1c1c1e]">
                          <Clock className="w-4 h-4 text-[#746019] shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-[#746019] block font-semibold uppercase">Duration</span>
                            <span className="font-medium truncate block">{cat.duration || 30} mins</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#c3faf5]/50 border border-[#0fbcb0]/30 text-[#1c1c1e]">
                          <BookOpen className="w-4 h-4 text-[#187574] shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-[#187574] block font-semibold uppercase">Questions</span>
                            <span className="font-medium truncate block">{quiz.questions?.length || 0} MCQs</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f7f8fa] border border-[#c7cad5] text-[#1c1c1e]">
                          <User className="w-4 h-4 text-[#555a6a] shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-[#555a6a] block font-semibold uppercase">Author</span>
                            <span className="font-medium truncate block">{cat.author || "Academic Board"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f5f3ff] border border-[#4262ff]/20 text-[#1c1c1e]">
                          <Target className="w-4 h-4 text-[#4262ff] shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-[#4262ff] block font-semibold uppercase">Difficulty</span>
                            <span className="font-medium truncate block">{cat.difficulty || "Standard"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle for More Details */}
                      <div className="pt-1">
                        <button
                          onClick={() => toggleDetails(quiz._id)}
                          type="button"
                          className="w-full flex items-center justify-center gap-1.5 text-[#4262ff] hover:underline font-medium text-xs py-1.5 transition-colors cursor-pointer"
                          aria-expanded={!!openDetails[quiz._id]}
                          aria-controls={`details-${quiz._id}`}
                        >
                          {openDetails[quiz._id] ? (
                            <>
                              <span>Hide Details</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>View Curriculum Details</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        <AnimatePresence>
                          {openDetails[quiz._id] && (
                            <motion.div
                              id={`details-${quiz._id}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden border-t border-[#e6e8ec] pt-3 mt-2 text-xs space-y-2"
                            >
                              <div className="grid grid-cols-2 gap-2 text-[#555a6a]">
                                <div className="flex items-center gap-1.5 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                  <span className="truncate">
                                    <strong className="text-[#1c1c1e] font-medium">Region:</strong> {cat.region || "All"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 truncate">
                                  <FileText className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                  <span className="truncate">
                                    <strong className="text-[#1c1c1e] font-medium">Exam:</strong> {cat.examType || "N/A"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 truncate">
                                  <Users className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                  <span className="truncate">
                                    <strong className="text-[#1c1c1e] font-medium">Class:</strong> {cat.specificClass || "N/A"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 truncate">
                                  <BookOpen className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                  <span className="truncate">
                                    <strong className="text-[#1c1c1e] font-medium">Subject:</strong> {cat.subject || "N/A"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 col-span-2 truncate">
                                  <Target className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                  <span className="truncate">
                                    <strong className="text-[#1c1c1e] font-medium">Chapter:</strong> {cat.chapter || "All Chapters"}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Play Quiz Button - Miro button-primary pinned to exact same baseline */}
                    <div className="pt-3 mt-auto border-t border-[#e6e8ec]">
                      <button
                        onClick={() => handlePlayQuiz(quiz)}
                        type="button"
                        className="w-full py-3 px-6 bg-[#1c1c1e] hover:bg-[#2c2c34] active:bg-[#2c2c34] text-white text-sm font-medium rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
                      >
                        <Play className="w-4 h-4 text-[#ffd02f] fill-[#ffd02f] group-hover:translate-x-0.5 transition-transform" />
                        <span>Play Quiz</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Passcode Modal */}
        <PasscodeModal
          isOpen={showPasscodeModal}
          onClose={() => {
            setShowPasscodeModal(false)
            setSelectedQuiz(null)
          }}
          onVerify={handlePasscodeVerify}
          quizTitle={selectedQuiz?.category?.quizTitle || selectedQuiz?.fileTitle || "Quiz"}
        />
      </div>
    </div>
  )
}