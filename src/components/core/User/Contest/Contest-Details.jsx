"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  BookOpen,
  Users,
  Target,
  Calendar,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Timer,
  Award,
  FileText,
  Lock,
  Play,
  ArrowLeft,
  Filter,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions } from "../../../../services/operations/quizAPI"
import { getAllContest } from "../../../../services/operations/contestAPI"

// Passcode Modal Component - Miro Style
const PasscodeModal = ({ isOpen, onClose, onVerify, contestTitle }) => {
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
            Please enter the 5-digit passcode to enroll in <span className="font-semibold text-[#1c1c1e]">"{contestTitle}"</span>
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
                <CheckCircle className="w-4 h-4 text-[#ffd02f]" />
              )}
              <span>Verify & Enroll</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Helper function to format date and time
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A"
  const date = new Date(isoString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export default function ContestDetails() {
  const navigate = useNavigate()
  const [openDetails, setOpenDetails] = useState({})
  const [contests, setContests] = useState([])
  const [regions, setRegions] = useState([])
  const [filters, setFilters] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })
  const [loading, setLoading] = useState(true)
  const [selectedContest, setSelectedContest] = useState(null)
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)

  // Fetch contests and regions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [contestsRes, regionsRes] = await Promise.all([
          getAllContest(),
          getAllQuizRegions(),
        ])
        setContests(contestsRes?.data || [])
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

  const handleEnroll = (contest) => {
    if (contest.passcode) {
      setSelectedContest(contest)
      setShowPasscodeModal(true)
    } else {
      navigate(`/Contest-Enrollment/${contest._id}`)
    }
  }

  const handlePasscodeVerify = async (enteredPasscode) => {
    if (!selectedContest) return

    if (enteredPasscode === selectedContest.passcode) {
      toast.success("Passcode verified! Enrolling you in the contest.")
      setShowPasscodeModal(false)
      setSelectedContest(null)
      navigate(`/Contest-Enrollment/${selectedContest._id}`)
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

  const getExamTypes = () => {
    if (!filters.region) return []
    const selectedRegion = regions.find((region) => region._id === filters.region)
    return selectedRegion?.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!filters.region || !filters.examType) return []
    const selectedRegion = regions.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!filters.region || !filters.examType || !filters.specificClass) return []
    const selectedRegion = regions.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === filters.specificClass
    )
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  const getChapters = () => {
    if (!filters.region || !filters.examType || !filters.specificClass || !filters.subject) return []
    const selectedRegion = regions.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === filters.specificClass
    )
    const selectedSubject = selectedSpecificClass?.subjects.find((sub) => sub.name === filters.subject)
    return selectedSubject?.chapters?.map((ch) => ch.name) || []
  }

  const filteredContests = contests.filter((contest) => {
    const selectedRegionName = regions.find((r) => r._id === filters.region)?.name

    return (
      (!filters.region || contest.region === selectedRegionName) &&
      (!filters.examType || contest.examType === filters.examType) &&
      (!filters.specificClass || contest.specificClass === filters.specificClass) &&
      (!filters.subject || contest.subject === filters.subject) &&
      (!filters.chapter || contest.chapter === filters.chapter)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">
          Loading available contests...
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c7cad5] bg-white text-xs font-medium text-[#1c1c1e] hover:bg-[#f7f8fa] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                STUDENT ARENA
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                CONTEST DIRECTORY
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#1c1c1e]">
              Available Contests
            </h1>
            <p className="text-xs sm:text-sm text-[#555a6a] max-w-2xl leading-relaxed">
              Explore live academic competitions, timed challenges, and test your knowledge against peers.
            </p>
          </div>
        </div>

        {/* Filter Card - Miro card-base with defined border */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-6 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#fff4c4] flex items-center justify-center text-[#746019]">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-medium text-[#1c1c1e]">Filter Contests</h2>
                <p className="text-xs text-[#555a6a]">Select curriculum board and specific subject</p>
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
            {/* Region Filter */}
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

            {/* Exam Type Filter */}
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
                {getExamTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
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
                {getSpecificClasses().map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
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
                {getSubjects().map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Filter */}
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
                {getChapters().map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredContests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#c7cad5] shadow-sm space-y-3">
            <div className="w-12 h-12 bg-[#fff4c4] rounded-full flex items-center justify-center mx-auto text-[#746019]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-[#1c1c1e]">No contests found</h3>
            <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
              {contests.length === 0
                ? "There are currently no active contests available."
                : "Try adjusting or clearing your filters to discover available competitions."}
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
          /* Contests Grid - Miro card-base with aligned rows and complete image fit */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredContests.map((contest) => (
              <motion.div
                key={contest._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm overflow-hidden flex flex-col h-full transition-all"
              >
                {/* Complete Image Thumbnail or Pastel Header - Fixed h-48 for all cards */}
                {contest.thumbnail ? (
                  <div className="h-48 w-full bg-[#f0f1f4] flex items-center justify-center p-3 overflow-hidden border-b border-[#c7cad5]">
                    <img
                      src={contest.thumbnail}
                      alt={contest.title}
                      className="w-full h-full object-contain object-center"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-[#fff8e0] border-b border-[#fde89c] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-semibold uppercase tracking-wider">
                        COMPETITION
                      </span>
                      {contest.passcode && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffc6c6] text-[#600000] text-[10px] font-semibold">
                          <Lock className="w-3 h-3" />
                          <span>Protected</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <div className="w-14 h-14 rounded-2xl bg-[#ffd02f]/40 flex items-center justify-center text-[#746019]">
                        <Award className="w-8 h-8 text-[#746019]" />
                      </div>
                    </div>
                    <div className="text-center text-[11px] font-medium text-[#746019] uppercase tracking-wider">
                      Academic Arena
                    </div>
                  </div>
                )}

                {/* Contest Content - flex-grow flex flex-col justify-between to keep enroll button on exact same baseline */}
                <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Title with consistent min-height */}
                    <div className="min-h-[2.75rem] flex items-start justify-between gap-2">
                      <h2 className="text-base font-medium text-[#1c1c1e] line-clamp-2 leading-snug">
                        {contest.title}
                      </h2>
                      {contest.thumbnail && contest.passcode && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffc6c6] text-[#600000] text-[10px] font-semibold shrink-0">
                          <Lock className="w-3 h-3" />
                          <span>Passcode</span>
                        </span>
                      )}
                    </div>

                    {/* Description with consistent min-height */}
                    <div className="min-h-[2.25rem] flex items-start">
                      <p className="text-[#555a6a] text-xs line-clamp-2 leading-relaxed font-normal">
                        {contest.description || "Active competitive assessment designed for verified academic benchmarking."}
                      </p>
                    </div>

                    {/* Contest Info Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#fff8e0] border border-[#fde89c]/60 text-[#1c1c1e]">
                        <Award className="w-4 h-4 text-[#746019] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-[#746019] block font-semibold uppercase">Prize</span>
                          <span className="font-medium truncate block">{contest.prize || "Certificate"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#c3faf5]/50 border border-[#0fbcb0]/30 text-[#1c1c1e]">
                        <BookOpen className="w-4 h-4 text-[#187574] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-[#187574] block font-semibold uppercase">Questions</span>
                          <span className="font-medium truncate block">{contest.questions?.length || 0} MCQs</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f5f3ff] border border-[#4262ff]/20 text-[#1c1c1e]">
                        <Calendar className="w-4 h-4 text-[#4262ff] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-[#4262ff] block font-semibold uppercase">Deadline</span>
                          <span className="font-medium truncate block text-[11px]">{formatDateTime(contest.deadline)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f7f8fa] border border-[#c7cad5] text-[#1c1c1e]">
                        <Timer className="w-4 h-4 text-[#555a6a] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-[#555a6a] block font-semibold uppercase">Start</span>
                          <span className="font-medium truncate block text-[11px]">{formatDateTime(contest.startTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle for More Details */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleDetails(contest._id)}
                        type="button"
                        className="w-full flex items-center justify-center gap-1.5 text-[#4262ff] hover:underline font-medium text-xs py-1.5 transition-colors cursor-pointer"
                        aria-expanded={!!openDetails[contest._id]}
                        aria-controls={`details-${contest._id}`}
                      >
                        {openDetails[contest._id] ? (
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
                        {openDetails[contest._id] && (
                          <motion.div
                            id={`details-${contest._id}`}
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
                                  <strong className="text-[#1c1c1e] font-medium">Region:</strong> {contest.regionName || contest.region || "All"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                <span className="truncate">
                                  <strong className="text-[#1c1c1e] font-medium">Exam:</strong> {contest.examType || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 truncate">
                                <Users className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                <span className="truncate">
                                  <strong className="text-[#1c1c1e] font-medium">Class:</strong> {contest.specificClass || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 truncate">
                                <BookOpen className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                <span className="truncate">
                                  <strong className="text-[#1c1c1e] font-medium">Subject:</strong> {contest.subject || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 col-span-2 truncate">
                                <Target className="w-3.5 h-3.5 text-[#1c1c1e] shrink-0" />
                                <span className="truncate">
                                  <strong className="text-[#1c1c1e] font-medium">Chapter:</strong> {contest.chapter || "All Chapters"}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Enroll Button - Miro button-primary pinned to bottom line across all cards */}
                  <div className="pt-3 mt-auto border-t border-[#e6e8ec]">
                    <button
                      onClick={() => handleEnroll(contest)}
                      type="button"
                      className="w-full py-3 px-6 bg-[#1c1c1e] hover:bg-[#2c2c34] active:bg-[#2c2c34] text-white text-sm font-medium rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
                    >
                      <Play className="w-4 h-4 text-[#ffd02f] fill-[#ffd02f] group-hover:translate-x-0.5 transition-transform" />
                      <span>Enroll Now</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Passcode Modal */}
        <PasscodeModal
          isOpen={showPasscodeModal}
          onClose={() => {
            setShowPasscodeModal(false)
            setSelectedContest(null)
          }}
          onVerify={handlePasscodeVerify}
          contestTitle={selectedContest?.title || "Contest"}
        />
      </div>
    </div>
  )
}