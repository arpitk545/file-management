"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Filter,
  CheckCircle,
  Loader2,
  BookOpen,
  Calendar,
  Timer,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Award,
  Home
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions } from "../../services/operations/quizAPI"
import { getAllContest } from "../../services/operations/contestAPI"

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

export default function Contest() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [filters, setFilters] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })
  const [allContests, setAllContests] = useState([])
  const [regionsData, setRegionsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    const fetchData = async () => {
      try {
        setLoading(true)
        const [contestsRes, regionsRes] = await Promise.all([getAllContest(), getAllQuizRegions()])
        setAllContests(contestsRes?.data || [])
        setRegionsData(regionsRes?.data || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load contests")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value }

      if (name === "region") {
        newFilters.examType = ""
        newFilters.specificClass = ""
        newFilters.subject = ""
        newFilters.chapter = ""
        setCurrentStep(2)
      } else if (name === "examType") {
        newFilters.specificClass = ""
        newFilters.subject = ""
        newFilters.chapter = ""
        setCurrentStep(3)
      } else if (name === "specificClass") {
        newFilters.subject = ""
        newFilters.chapter = ""
        setCurrentStep(4)
      } else if (name === "subject") {
        newFilters.chapter = ""
        setCurrentStep(5)
      } else if (name === "chapter") {
        setCurrentStep(6)
      }
      return newFilters
    })
  }

  const getExamTypes = () => {
    if (!filters.region) return []
    const selectedRegion = regionsData.find((region) => region._id === filters.region)
    return selectedRegion?.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!filters.region || !filters.examType) return []
    const selectedRegion = regionsData.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!filters.region || !filters.examType || !filters.specificClass) return []
    const selectedRegion = regionsData.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find((sc) => sc.name === filters.specificClass)
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  const getChapters = () => {
    if (!filters.region || !filters.examType || !filters.specificClass || !filters.subject) return []
    const selectedRegion = regionsData.find((region) => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find((sc) => sc.name === filters.specificClass)
    const selectedSubject = selectedSpecificClass?.subjects.find((sub) => sub.name === filters.subject)
    return selectedSubject?.chapters?.map((ch) => ch.name) || []
  }

  const resetFilters = () => {
    setCurrentStep(1)
    setFilters({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
  }

  const areFiltersActive = () => {
    return Boolean(
      filters.region ||
      filters.examType ||
      filters.specificClass ||
      filters.subject ||
      filters.chapter
    )
  }

  const getContestsToDisplay = () => {
    const selectedRegionName = regionsData.find((r) => r._id === filters.region)?.name

    return allContests.filter((contest) => {
      const matchRegion = !filters.region || contest.region === selectedRegionName || contest.region === filters.region
      const matchExam = !filters.examType || contest.examType === filters.examType
      const matchClass = !filters.specificClass || contest.specificClass === filters.specificClass
      const matchSub = !filters.subject || contest.subject === filters.subject
      const matchChap = !filters.chapter || contest.chapter === filters.chapter
      const matchStatus = !contest.status || contest.status === "Approved"
      return matchRegion && matchExam && matchClass && matchSub && matchChap && matchStatus
    })
  }

  const handleStartContest = (contestId) => {
    if (!isLoggedIn) {
      toast.error("Please login to participate in contests")
      navigate("/login")
      return
    }
    navigate(`/Contest-Enrollment/${contestId}`)
  }

  const contestsToRender = getContestsToDisplay()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#050038]" />
        </div>
        <p className="text-sm font-semibold text-[#050038]">Loading academic arena...</p>
      </div>
    )
  }

  const stepsList = [
    { num: 1, label: "Region" },
    { num: 2, label: "Exam" },
    { num: 3, label: "Class" },
    { num: 4, label: "Subject" },
    { num: 5, label: "Chapter" },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-8">
        
        {/* Miro Top Navigation Banner */}
        <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                  <Sparkles className="w-3.5 h-3.5" />
                  COMPETITIVE ARENA
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  <Trophy className="w-3.5 h-3.5" />
                  LIVE CONTESTS &amp; OLYMPIADS
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1c1c1e] tracking-tight">
                Academic Contests &amp; Olympiads
              </h1>
              <p className="text-sm sm:text-base text-[#555a6a] max-w-2xl">
                Participate in timed challenges, test your depth across chapters, and earn recognition on academic leaderboards.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap self-start md:self-center">
              {areFiltersActive() && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#b8860b] bg-[#fffdf5] border border-[#fde89c] hover:bg-[#fef9c3] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
              {localStorage.getItem("token") && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-white border border-[#c7cad5] hover:bg-[#f7f8fa] shadow-xs active:scale-98 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Home className="w-4 h-4 text-blue-600" />
                  <span>Dashboard</span>
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1c1c1e] hover:bg-[#2c2c34] shadow-xs transition-all active:scale-98 whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Miro Guided Smart Filter */}
          <div className="lg:col-span-4 xl:col-span-3 sticky top-6">
            <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ffd02f] flex items-center justify-center font-bold text-[#050038]">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#050038] text-sm">Guided Filter</h3>
                    <p className="text-xs text-[#71767b]">Narrow down by syllabus</p>
                  </div>
                </div>
                {areFiltersActive() && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#050038] underline hover:text-[#464b53]"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {stepsList.map((step) => {
                  const isActive = currentStep === step.num
                  const isCompleted = currentStep > step.num
                  return (
                    <button
                      key={step.num}
                      onClick={() => setCurrentStep(step.num)}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg border text-center transition-all ${
                        isActive
                          ? "bg-[#050038] border-[#050038] text-white"
                          : isCompleted
                          ? "bg-[#c3faf5] border-[#a5efe8] text-[#187574]"
                          : "bg-[#f7f8fa] border-[#e1e4e8] text-[#71767b] hover:bg-white"
                      }`}
                    >
                      <span className="text-xs font-extrabold">{step.num}</span>
                      <span className="text-[10px] font-medium truncate w-full mt-0.5">{step.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Step Panels */}
              <AnimatePresence mode="wait">
                {/* Step 1: Region Selection */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#71767b]">Step 1: Choose Region</span>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {regionsData.map((region) => {
                        const isSelected = filters.region === region._id
                        return (
                          <button
                            key={region._id}
                            onClick={() => handleFilterChange("region", region._id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all ${
                              isSelected
                                ? "bg-[#fff1c2] border-[#ffd02f] font-bold text-[#050038]"
                                : "bg-white border-[#e1e4e8] hover:border-[#050038] text-[#050038]"
                            }`}
                          >
                            <span>{region.name}</span>
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 text-[#050038]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#71767b]" />
                            )}
                          </button>
                        )
                      })}
                      {regionsData.length === 0 && (
                        <p className="text-xs text-[#71767b] py-2">No regions registered yet.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Exam Type */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-medium text-[#464b53] p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg">
                      Region: <span className="font-bold text-[#050038]">{regionsData.find((r) => r._id === filters.region)?.name || "Not Selected"}</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#71767b]">Step 2: Choose Exam Type</span>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {getExamTypes().map((type) => {
                        const isSelected = filters.examType === type
                        return (
                          <button
                            key={type}
                            onClick={() => handleFilterChange("examType", type)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all ${
                              isSelected
                                ? "bg-[#fff1c2] border-[#ffd02f] font-bold text-[#050038]"
                                : "bg-white border-[#e1e4e8] hover:border-[#050038] text-[#050038]"
                            }`}
                          >
                            <span>{type}</span>
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 text-[#050038]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#71767b]" />
                            )}
                          </button>
                        )
                      })}
                      {getExamTypes().length === 0 && (
                        <p className="text-xs text-[#71767b] py-2">Please select a region first.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Specific Class */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-medium text-[#464b53] p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg space-y-1">
                      <div>Region: <span className="font-bold text-[#050038]">{regionsData.find((r) => r._id === filters.region)?.name}</span></div>
                      <div>Exam: <span className="font-bold text-[#050038]">{filters.examType}</span></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#71767b]">Step 3: Select Class</span>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {getSpecificClasses().map((cls) => {
                        const isSelected = filters.specificClass === cls
                        return (
                          <button
                            key={cls}
                            onClick={() => handleFilterChange("specificClass", cls)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all ${
                              isSelected
                                ? "bg-[#fff1c2] border-[#ffd02f] font-bold text-[#050038]"
                                : "bg-white border-[#e1e4e8] hover:border-[#050038] text-[#050038]"
                            }`}
                          >
                            <span>{cls}</span>
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 text-[#050038]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#71767b]" />
                            )}
                          </button>
                        )
                      })}
                      {getSpecificClasses().length === 0 && (
                        <p className="text-xs text-[#71767b] py-2">No classes found under selected exam.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Subject Selection */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-medium text-[#464b53] p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg space-y-1">
                      <div>Exam: <span className="font-bold text-[#050038]">{filters.examType}</span></div>
                      <div>Class: <span className="font-bold text-[#050038]">{filters.specificClass}</span></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#71767b]">Step 4: Select Subject</span>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {getSubjects().map((sub) => {
                        const isSelected = filters.subject === sub
                        return (
                          <button
                            key={sub}
                            onClick={() => handleFilterChange("subject", sub)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all ${
                              isSelected
                                ? "bg-[#fff1c2] border-[#ffd02f] font-bold text-[#050038]"
                                : "bg-white border-[#e1e4e8] hover:border-[#050038] text-[#050038]"
                            }`}
                          >
                            <span>{sub}</span>
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 text-[#050038]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#71767b]" />
                            )}
                          </button>
                        )
                      })}
                      {getSubjects().length === 0 && (
                        <p className="text-xs text-[#71767b] py-2">No subjects found for this class.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Chapter Selection */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-medium text-[#464b53] p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg space-y-1">
                      <div>Subject: <span className="font-bold text-[#050038]">{filters.subject}</span></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#71767b]">Step 5: Select Chapter</span>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {getChapters().map((ch) => {
                        const isSelected = filters.chapter === ch
                        return (
                          <button
                            key={ch}
                            onClick={() => handleFilterChange("chapter", ch)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all ${
                              isSelected
                                ? "bg-[#fff1c2] border-[#ffd02f] font-bold text-[#050038]"
                                : "bg-white border-[#e1e4e8] hover:border-[#050038] text-[#050038]"
                            }`}
                          >
                            <span>{ch}</span>
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 text-[#050038]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#71767b]" />
                            )}
                          </button>
                        )
                      })}
                      {getChapters().length === 0 && (
                        <p className="text-xs text-[#71767b] py-2">No specific chapters listed. All syllabus active.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Filter Summary */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#187574]">
                      <CheckCircle className="w-4 h-4" /> Filters Active
                    </div>
                    <div className="space-y-2 text-xs">
                      {filters.region && (
                        <div className="p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg">
                          <span className="text-[#71767b]">Region: </span>
                          <span className="font-bold text-[#050038]">{regionsData.find((r) => r._id === filters.region)?.name}</span>
                        </div>
                      )}
                      {filters.examType && (
                        <div className="p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg">
                          <span className="text-[#71767b]">Exam: </span>
                          <span className="font-bold text-[#050038]">{filters.examType}</span>
                        </div>
                      )}
                      {filters.specificClass && (
                        <div className="p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg">
                          <span className="text-[#71767b]">Class: </span>
                          <span className="font-bold text-[#050038]">{filters.specificClass}</span>
                        </div>
                      )}
                      {filters.subject && (
                        <div className="p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg">
                          <span className="text-[#71767b]">Subject: </span>
                          <span className="font-bold text-[#050038]">{filters.subject}</span>
                        </div>
                      )}
                      {filters.chapter && (
                        <div className="p-2.5 bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg">
                          <span className="text-[#71767b]">Chapter: </span>
                          <span className="font-bold text-[#050038]">{filters.chapter}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={resetFilters}
                      className="w-full py-2 px-3 text-xs font-bold text-[#050038] bg-[#ffd02f] hover:bg-[#ffc000] rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Contests Catalog */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {contestsToRender.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {contestsToRender.map((contest, index) => (
                  <motion.div
                    key={contest._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-[#c7cad5] hover:border-[#1c1c1e] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {contest.examType && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f0f1f3] text-[#050038]">
                              {contest.examType}
                            </span>
                          )}
                          {contest.specificClass && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f0f1f3] text-[#464b53]">
                              {contest.specificClass}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#c3faf5] text-[#187574]">
                          <Award className="w-3 h-3" /> Approved
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-extrabold text-lg text-[#050038] group-hover:text-black line-clamp-2 leading-snug mb-2">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-[#464b53] line-clamp-2 mb-4 leading-relaxed">
                        {contest.description || "Academic contest challenge designed to evaluate conceptual clarity and problem-solving speed."}
                      </p>

                      {/* Metadata Grid */}
                      <div className="bg-[#f7f8fa] border border-[#e1e4e8] rounded-lg p-3 space-y-2 text-xs text-[#464b53] mb-5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#71767b]">
                            <BookOpen className="w-3.5 h-3.5 text-[#050038]" /> Questions
                          </span>
                          <span className="font-bold text-[#050038]">{contest.questions?.length || 0} items</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#71767b]">
                            <Timer className="w-3.5 h-3.5 text-[#050038]" /> Start Time
                          </span>
                          <span className="font-semibold text-[#050038]">{formatDateTime(contest.startTime)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#71767b]">
                            <Calendar className="w-3.5 h-3.5 text-[#050038]" /> Deadline
                          </span>
                          <span className="font-semibold text-[#050038]">{formatDateTime(contest.deadline)}</span>
                        </div>
                      </div>

                      {/* Subject and Chapter Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {contest.subject && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#e6f4ea] text-[#137333]">
                            {contest.subject}
                          </span>
                        )}
                        {contest.chapter && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#fce8e6] text-[#c5221f]">
                            {contest.chapter}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action CTA */}
                    <button
                      onClick={() => handleStartContest(contest._id)}
                      className="w-full py-2.5 px-4 bg-[#ffd02f] hover:bg-[#ffc000] text-[#050038] font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-4 h-4 text-[#050038]" /> Enroll In Contest
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e1e4e8] rounded-xl p-12 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#f7f8fa] border border-[#e1e4e8] flex items-center justify-center mx-auto mb-4 text-[#71767b]">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#050038] mb-1">No Approved Contests Match Filters</h3>
                <p className="text-xs text-[#71767b] max-w-sm mx-auto mb-6">
                  Try clearing some filter criteria or selecting another exam stream to view active challenges.
                </p>
                {areFiltersActive() && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#050038] bg-[#ffd02f] hover:bg-[#ffc000] rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

