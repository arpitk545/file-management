"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  BookOpen,
  Target,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FileText,
  Clock,
  Lock,
  Play,
  ArrowLeft,
  Filter,
  Search,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions, getAllQuizzesWithCategoryAndQuestions } from "../../services/operations/quizAPI"

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
      const nextInput = document.getElementById(`quiz-passcode-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      const prevInput = document.getElementById(`quiz-passcode-input-${index - 1}`)
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-3xl border border-[#c7cad5] p-6 sm:p-8 w-full max-w-md shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#fff4c4] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#746019] shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#1c1c1e] mb-1 font-sans">Passcode Protected</h3>
          <p className="text-[#555a6a] text-xs leading-relaxed font-sans">
            Please enter the 5-digit passcode to attempt <span className="font-bold text-[#1c1c1e]">"{quizTitle}"</span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center gap-2.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <input
                key={index}
                id={`quiz-passcode-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={passcode[index]}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-[#f7f8fa] border-2 border-[#c7cad5] focus:border-[#1c1c1e] rounded-xl outline-hidden transition-all text-[#1c1c1e] shadow-2xs"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              type="button"
              className="flex-1 py-3 px-5 border border-[#c7cad5] hover:bg-[#f7f8fa] text-[#1c1c1e] rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || passcode.join("").length !== 5}
              type="button"
              className="flex-1 py-3 px-5 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white rounded-full text-xs font-bold disabled:bg-[#e0e2e8] disabled:text-[#a5a8b5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Play className="w-4 h-4 text-[#ffd02f] fill-[#ffd02f]" />
              )}
              <span>Verify &amp; Play</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function QuizCatalog() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentStep, setCurrentStep] = useState(1)

  const [filters, setFilters] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })

  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [openDetails, setOpenDetails] = useState({})

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
              (quiz.approvalStatus === "Approved" || quiz.category?.approvalStatus === "Approved" || !quiz.approvalStatus)
          )
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.category?.createdAt || 0)
            const dateB = new Date(b.createdAt || b.category?.createdAt || 0)
            return dateB - dateA
          })

        setQuizzes(approvedQuizzes)
        setRegions(regionsRes?.data || [])
      } catch (error) {
        console.error("Failed to fetch quizzes data:", error)
        toast.error("Failed to load quizzes catalog")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Selected Region Object
  const selectedRegionObj = regions.find((r) => r.name === filters.region || r._id === filters.region)
  const examTypes = selectedRegionObj?.examTypes || []

  // Selected Exam Type Object
  const selectedExamTypeObj = examTypes.find((et) => et.name === filters.examType)
  const specificClasses = selectedExamTypeObj?.specificClasses || []

  // Selected Class Object
  const selectedClassObj = specificClasses.find((sc) => sc.name === filters.specificClass)
  const subjects = selectedClassObj?.subjects || []

  // Selected Subject Object
  const selectedSubjectObj = subjects.find((sub) => sub.name === filters.subject)
  const chapters = selectedSubjectObj?.chapters || []

  const handleSelectRegion = (regionName) => {
    setFilters({
      region: regionName,
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
    setCurrentStep(2)
  }

  const handleSelectExamType = (examTypeName) => {
    setFilters((prev) => ({
      ...prev,
      examType: examTypeName,
      specificClass: "",
      subject: "",
      chapter: "",
    }))
    setCurrentStep(3)
  }

  const handleSelectClass = (className) => {
    setFilters((prev) => ({
      ...prev,
      specificClass: className,
      subject: "",
      chapter: "",
    }))
    setCurrentStep(4)
  }

  const handleSelectSubject = (subjectName) => {
    setFilters((prev) => ({
      ...prev,
      subject: subjectName,
      chapter: "",
    }))
    setCurrentStep(5)
  }

  const handleSelectChapter = (chapterName) => {
    setFilters((prev) => ({
      ...prev,
      chapter: chapterName,
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
    setSearchQuery("")
    setCurrentStep(1)
  }

  const isFiltered = Boolean(
    filters.region ||
    filters.examType ||
    filters.specificClass ||
    filters.subject ||
    filters.chapter ||
    searchQuery.trim()
  )

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
      const targetId = selectedQuiz._id
      setSelectedQuiz(null)
      navigate(`/play-quiz/${targetId}`)
    } else {
      toast.error("Incorrect passcode. Please try again.")
    }
  }

  // Filtered Quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const cat = quiz.category || {}
    const regionName = selectedRegionObj?.name || filters.region

    if (filters.region && cat.region !== regionName) return false
    if (filters.examType && cat.examType !== filters.examType) return false
    if (filters.specificClass && cat.specificClass !== filters.specificClass) return false
    if (filters.subject && cat.subject !== filters.subject) return false
    if (filters.chapter && cat.chapter !== filters.chapter) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const title = (cat.quizTitle || quiz.fileTitle || "").toLowerCase()
      const desc = (cat.description || "").toLowerCase()
      const subj = (cat.subject || "").toLowerCase()
      const reg = (cat.region || "").toLowerCase()
      if (!title.includes(q) && !desc.includes(q) && !subj.includes(q) && !reg.includes(q)) {
        return false
      }
    }

    return true
  })

  const stepItems = [
    { num: 1, title: "Region", value: filters.region },
    { num: 2, title: "Exam Type", value: filters.examType },
    { num: 3, title: "Class", value: filters.specificClass },
    { num: 4, title: "Subject", value: filters.subject },
    { num: 5, title: "Chapter", value: filters.chapter },
  ]

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
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-8">
        
        {/* Top Miro Navigation Banner */}
        <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                  <Sparkles className="w-3.5 h-3.5" />
                  ACADEMIC ASSESSMENTS
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFIED QUIZZES &amp; CHALLENGES
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1c1c1e] tracking-tight font-sans">
                Interactive Quizzes &amp; Challenges
              </h1>
              <p className="text-sm sm:text-base text-[#555a6a] max-w-2xl font-sans">
                Explore syllabus-aligned quizzes, timed assessments, and chapter-wise practice tests with immediate analytics.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap self-start md:self-center">
              {isFiltered && (
                <button
                  onClick={clearAllFilters}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#b8860b] bg-[#fffdf5] border border-[#fde89c] hover:bg-[#fef9c3] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1c1c1e] hover:bg-[#2c2c34] shadow-xs transition-all active:scale-98 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>

          {/* Step Flow Indicator */}
          <div className="mt-6 pt-6 border-t border-[#e0e2e8]">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {stepItems.map((step) => {
                const isSelected = !!step.value
                const isCurrent = currentStep === step.num
                return (
                  <button
                    key={step.num}
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? "border-[#4262ff] bg-[#f5f3ff] ring-2 ring-[#4262ff]/20"
                        : isSelected
                        ? "border-[#c7cad5] bg-white"
                        : "border-[#e0e2e8] bg-[#f7f8fa] opacity-75"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? "bg-[#187574] text-white"
                          : isCurrent
                          ? "bg-[#4262ff] text-white"
                          : "bg-[#e0e2e8] text-[#555a6a]"
                      }`}
                    >
                      {isSelected ? "✓" : step.num}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-xs font-bold text-[#1c1c1e] truncate">{step.title}</p>
                      <p className="text-xs text-[#555a6a] truncate">
                        {step.value || "All / Any"}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout: Left Filter Sidebar & Right Quizzes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Guided Smart Filter Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 shadow-xs sticky top-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ffd02f] flex items-center justify-center text-[#1c1c1e] font-bold">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1c1c1e]">Guided Filters</h2>
                    <p className="text-xs text-[#555a6a]">Step {currentStep} of 5</p>
                  </div>
                </div>
                {isFiltered && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[#4262ff] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#555a6a] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes by title, subject..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#c7cad5] rounded-xl text-xs font-medium text-[#1c1c1e] focus:outline-hidden focus:border-[#4262ff] transition-colors"
                />
              </div>

              {/* Dynamic Steps Accordion */}
              <AnimatePresence mode="wait">
                {/* Step 1: Region */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#187574] bg-[#c3faf5] px-2.5 py-0.5 rounded-md">
                        Step 1: Region / Board
                      </span>
                      <span className="text-xs text-[#555a6a]">{regions.length} available</span>
                    </div>
                    <p className="text-xs text-[#555a6a]">Select educational board or geographic state:</p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {regions.map((region) => {
                        const isSelected = filters.region === region.name;
                        return (
                          <button
                            key={region._id || region.name}
                            onClick={() => handleSelectRegion(region.name)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "bg-[#c3faf5] border-[#0fbcb0] font-bold text-[#187574] shadow-2xs"
                                : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                            }`}
                          >
                            <span className="text-xs font-medium text-[#1c1c1e] truncate">{region.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#555a6a]" />
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Exam Type */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff] bg-[#f5f3ff] px-2.5 py-0.5 rounded-md">
                        Step 2: Exam Type
                      </span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Change Region
                      </button>
                    </div>
                    <p className="text-xs text-[#555a6a]">
                      Streams in <strong>{filters.region || "All"}</strong>:
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {examTypes.length > 0 ? (
                        examTypes.map((et) => {
                          const isSelected = filters.examType === et.name;
                          return (
                            <button
                              key={et.name}
                              onClick={() => handleSelectExamType(et.name)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "bg-[#f5f3ff] border-[#4262ff] font-bold text-[#4262ff] shadow-2xs"
                                  : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                              }`}
                            >
                              <span className="text-xs font-medium text-[#1c1c1e] truncate">{et.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#555a6a]" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#555a6a] p-3 text-center">
                          No specific exam streams defined. Please proceed to Class or reset.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Class */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#86296b] bg-[#ffd8f4] px-2.5 py-0.5 rounded-md">
                        Step 3: Class / Grade
                      </span>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Change Exam
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {specificClasses.length > 0 ? (
                        specificClasses.map((cls) => {
                          const isSelected = filters.specificClass === cls.name;
                          return (
                            <button
                              key={cls.name}
                              onClick={() => handleSelectClass(cls.name)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "bg-[#ffd8f4] border-[#d946ef] font-bold text-[#86296b] shadow-2xs"
                                  : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                              }`}
                            >
                              <span className="text-xs font-medium text-[#1c1c1e] truncate">{cls.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#555a6a]" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#555a6a] p-3 text-center">
                          No specific classes found. Please reset or choose another stream.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Subject */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#746019] bg-[#fff8e0] px-2.5 py-0.5 rounded-md">
                        Step 4: Subject
                      </span>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Change Class
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {subjects.length > 0 ? (
                        subjects.map((sub) => {
                          const isSelected = filters.subject === sub.name;
                          return (
                            <button
                              key={sub.name}
                              onClick={() => handleSelectSubject(sub.name)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "bg-[#fff8e0] border-[#ffd02f] font-bold text-[#746019] shadow-2xs"
                                  : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                              }`}
                            >
                              <span className="text-xs font-medium text-[#1c1c1e] truncate">{sub.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#555a6a]" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#555a6a] p-3 text-center">
                          No subjects configured for this class.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Chapter */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1c1c1e] bg-[#f0f2f5] px-2.5 py-0.5 rounded-md">
                        Step 5: Chapter
                      </span>
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Change Subject
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {chapters.length > 0 ? (
                        chapters.map((ch) => {
                          const isSelected = filters.chapter === ch.name;
                          return (
                            <button
                              key={ch.name}
                              onClick={() => handleSelectChapter(ch.name)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "bg-[#1c1c1e] border-[#1c1c1e] font-bold text-white shadow-2xs"
                                  : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                              }`}
                            >
                              <span className="text-xs font-medium truncate">{ch.name}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd02f]" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#555a6a] p-3 text-center">
                          All chapters included for this subject.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Criteria Box */}
              {isFiltered && (
                <div className="p-3.5 bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-[#555a6a] uppercase tracking-wider text-[10px] block">
                    Active Filters
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {filters.region && (
                      <span className="px-2 py-0.5 rounded-md bg-[#c3faf5] text-[#187574] border border-[#9eece4] font-medium text-xs">
                        {filters.region}
                      </span>
                    )}
                    {filters.examType && (
                      <span className="px-2 py-0.5 rounded-md bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe] font-medium text-xs">
                        {filters.examType}
                      </span>
                    )}
                    {filters.specificClass && (
                      <span className="px-2 py-0.5 rounded-md bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5] font-medium text-xs">
                        {filters.specificClass}
                      </span>
                    )}
                    {filters.subject && (
                      <span className="px-2 py-0.5 rounded-md bg-[#fff8e0] text-[#746019] border border-[#fde89c] font-medium text-xs">
                        {filters.subject}
                      </span>
                    )}
                    {filters.chapter && (
                      <span className="px-2 py-0.5 rounded-md bg-[#f0f2f5] text-[#1c1c1e] border border-[#c7cad5] font-medium text-xs">
                        {filters.chapter}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#c7cad5] text-[#1c1c1e] font-medium text-xs">
                        "{searchQuery}"
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Quizzes Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                  Available Quizzes
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd02f] text-[#1c1c1e]">
                  {filteredQuizzes.length}
                </span>
              </div>
              <span className="text-xs text-[#555a6a]">
                Showing approved academic quizzes
              </span>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#fff4c4] text-[#746019] flex items-center justify-center mx-auto">
                  <Target className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1c1c1e]">
                    No Quizzes Match Selected Filters
                  </h3>
                  <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
                    {isFiltered
                      ? "No quizzes match your current combination. Try clearing some criteria or selecting a different board."
                      : "There are currently no approved quizzes published yet. Check back soon!"}
                  </p>
                </div>
                {isFiltered && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
                {filteredQuizzes.map((quiz, index) => {
                  const cat = quiz.category || {}
                  const quizTitle = cat.quizTitle || quiz.fileTitle || "Untitled Quiz"

                  return (
                    <motion.div
                      key={quiz._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="bg-white rounded-2xl border border-[#c7cad5] hover:border-[#1c1c1e] shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between transition-all group"
                    >
                      <div>
                        {/* Thumbnail or Pastel Header */}
                        {cat.thumbnailimage ? (
                          <div className="h-44 w-full bg-[#f0f1f4] flex items-center justify-center p-3 overflow-hidden border-b border-[#c7cad5]">
                            <img
                              src={cat.thumbnailimage}
                              alt={quizTitle}
                              className="w-full h-full object-contain object-center"
                            />
                          </div>
                        ) : (
                          <div className="h-44 w-full bg-[#fff8e0] border-b border-[#fde89c] p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-bold uppercase tracking-wider">
                                ASSESSMENT
                              </span>
                              {cat.passcode && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffc6c6] text-[#600000] text-[10px] font-bold">
                                  <Lock className="w-3 h-3" />
                                  <span>Protected</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-center py-2">
                              <div className="w-12 h-12 rounded-2xl bg-[#ffd02f]/40 flex items-center justify-center text-[#746019] shadow-2xs">
                                <BookOpen className="w-6 h-6 text-[#746019]" />
                              </div>
                            </div>
                            <div className="text-center text-[11px] font-bold text-[#746019] uppercase tracking-wider">
                              Practice Quiz
                            </div>
                          </div>
                        )}

                        {/* Card Info */}
                        <div className="p-5 space-y-3">
                          {/* Badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            {cat.subject && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c3faf5] text-[#187574]">
                                {cat.subject}
                              </span>
                            )}
                            {cat.specificClass && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f0f1f3] text-[#464b53]">
                                {cat.specificClass}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-base font-bold text-[#1c1c1e] group-hover:text-[#4262ff] transition-colors line-clamp-2 leading-snug">
                            {quizTitle}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-[#555a6a] line-clamp-2 leading-relaxed">
                            {cat.description || "Interactive syllabus quiz designed to test conceptual clarity and retention."}
                          </p>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#fff8e0] border border-[#fde89c] text-[#746019]">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-bold truncate">{cat.duration || 30} mins</span>
                            </div>

                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] text-[#4262ff]">
                              <BookOpen className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-bold truncate">{quiz.questions?.length || 0} MCQs</span>
                            </div>
                          </div>

                          {/* Accordion for Taxonomy */}
                          <div className="pt-1">
                            <button
                              onClick={() => toggleDetails(quiz._id)}
                              type="button"
                              className="w-full flex items-center justify-center gap-1.5 text-[#4262ff] hover:underline font-bold text-xs py-1 transition-colors cursor-pointer"
                            >
                              {openDetails[quiz._id] ? (
                                <>
                                  <span>Hide Curriculum</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  <span>View Curriculum</span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>

                            <AnimatePresence>
                              {openDetails[quiz._id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden border-t border-[#e6e8ec] pt-2 mt-2 text-xs space-y-1.5 text-[#555a6a]"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <MapPin className="w-3 h-3 text-[#1c1c1e] shrink-0" />
                                    <span className="truncate">
                                      <strong className="text-[#1c1c1e]">Region:</strong> {cat.region || "All"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <FileText className="w-3 h-3 text-[#1c1c1e] shrink-0" />
                                    <span className="truncate">
                                      <strong className="text-[#1c1c1e]">Exam:</strong> {cat.examType || "General"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Target className="w-3 h-3 text-[#1c1c1e] shrink-0" />
                                    <span className="truncate">
                                      <strong className="text-[#1c1c1e]">Chapter:</strong> {cat.chapter || "All Chapters"}
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Play Quiz CTA */}
                      <div className="p-5 pt-0">
                        <button
                          onClick={() => handlePlayQuiz(quiz)}
                          type="button"
                          className="w-full py-2.5 px-4 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#1c1c1e]" />
                          <span>Play Quiz</span>
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

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
