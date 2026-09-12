"use client"
import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Trophy,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  ChevronDown,
  TrendingUp,
  Plus,
  Clock,
  Calendar,
  Users
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions } from "../../../services/operations/quizAPI"
import { getAllContest, deleteContestByTitle } from "../../../services/operations/contestAPI"
import toast from "react-hot-toast"

const MiroLoader = ({ message = "Loading contests..." }) => (
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

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Approved: "bg-[#c3faf5] text-[#187574] border border-[#9eece4]",
    "Waiting for Approval": "bg-[#fff8e0] text-[#746019] border border-[#fde89c]",
    "Rejected Contest": "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]",
    Rejected: "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
        statusConfig[status] || "bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]"
      }`}
    >
      {status}
    </span>
  )
}

const FilterContest = () => {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [contests, setContests] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [filterValues, setFilterValues] = useState({
    status: "",
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })

  // Fetch regions and contests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const regionsResponse = await getAllQuizRegions()
        setRegions(regionsResponse?.data || [])
        
        const contestsResponse = await getAllContest()
        setContests(contestsResponse?.data || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load contests data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Back to the dashboard
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

  // Admin or Manager created check: if admin or manager created, no need for approval -> automatically Approved
  const getEffectiveStatus = (contest) => {
    const authorLower = (contest.author || "").toLowerCase()
    const createdByLower = (
      typeof contest.createdBy === "string"
        ? contest.createdBy
        : (contest.createdBy?.role || contest.createdBy?.accountType || "")
    ).toLowerCase()
    const roleLower = (contest.role || "").toLowerCase()

    if (
      contest.status === "Approved" ||
      !contest.status ||
      authorLower.includes("admin") ||
      authorLower.includes("manager") ||
      createdByLower.includes("admin") ||
      createdByLower.includes("manager") ||
      roleLower.includes("admin") ||
      roleLower.includes("manager") ||
      contest.isAdminCreated === true ||
      contest.isAdmin === true ||
      contest.isManagerCreated === true
    ) {
      return "Approved"
    }
    return contest.status || "Approved"
  }

  // Get selected region
  const selectedRegion = regions.find(region => region._id === filterValues.region)

  const statusOptions = ["Approved", "Waiting for Approval", "Rejected Contest"]
  
  const regionOptions = useMemo(() => {
    return regions.map(region => ({
      name: region.name,
      value: region._id
    }))
  }, [regions])

  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map(type => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !filterValues.examType) return []
    const selectedExamType = selectedRegion.examTypes.find(et => et.name === filterValues.examType)
    return selectedExamType?.specificClasses?.map(cls => cls.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegion || !filterValues.examType || !filterValues.specificClass) return []
    const selectedExamType = selectedRegion.examTypes.find(et => et.name === filterValues.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filterValues.specificClass)
    return selectedSpecificClass?.subjects?.map(subject => subject.name) || []
  }

  const getChapters = () => {
    if (!selectedRegion || !filterValues.examType || !filterValues.specificClass || !filterValues.subject) return []
    const selectedExamType = selectedRegion.examTypes.find(et => et.name === filterValues.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filterValues.specificClass)
    const selectedSubject = selectedSpecificClass?.subjects.find(sub => sub.name === filterValues.subject)
    return selectedSubject?.chapters?.map(ch => ch.name) || []
  }

  // Filter contests based on dropdown selections
  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const effectiveStatus = getEffectiveStatus(contest)
      const matchesStatus = !filterValues.status || effectiveStatus === filterValues.status
      const matchesRegion = !filterValues.region || contest.region === filterValues.region
      const matchesExamType = !filterValues.examType || contest.examType === filterValues.examType
      const matchesSpecificClass = !filterValues.specificClass || contest.specificClass === filterValues.specificClass
      const matchesSubject = !filterValues.subject || contest.subject === filterValues.subject
      const matchesChapter = !filterValues.chapter || contest.chapter === filterValues.chapter

      return matchesStatus && matchesRegion && matchesExamType && matchesSpecificClass && matchesSubject && matchesChapter
    })
  }, [contests, filterValues])

  const handleFilterChange = (name, value) => {
    if (name === "region") {
      setFilterValues(prev => ({
        ...prev,
        region: value,
        examType: "",
        specificClass: "",
        subject: "",
        chapter: ""
      }))
    } else if (name === "examType") {
      setFilterValues(prev => ({
        ...prev,
        examType: value,
        specificClass: "",
        subject: "",
        chapter: ""
      }))
    } else if (name === "specificClass") {
      setFilterValues(prev => ({
        ...prev,
        specificClass: value,
        subject: "",
        chapter: ""
      }))
    } else if (name === "subject") {
      setFilterValues(prev => ({
        ...prev,
        subject: value,
        chapter: ""
      }))
    } else {
      setFilterValues(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleEdit = (contest) => {
    navigate(`/edit-contest/${contest._id}`)
  }

  const handlechangeStatus = (contest) => {
    navigate(`/Enroll-Students/${contest._id}`)
  }

  const showallresult = (contest) => {
    navigate(`/show-all-result/${contest._id}`)
  }

  const handleView = (contest) => {
    navigate(`/view-contest/${contest._id}`)
  }

  const handleDelete = async (contest) => {
    if (window.confirm(`Are you sure you want to delete "${contest.title}"?`)) {
      try {
        setIsLoading(true)
        await deleteContestByTitle(contest.title)
        setContests(prev => prev.filter(c => c._id !== contest._id))
        toast.success("Contest deleted successfully!")
      } catch (error) {
        console.error("Failed to delete contest:", error)
        toast.error("Failed to delete contest")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const clearFilters = () => {
    setFilterValues({
      status: "",
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
  }

  const CustomSelect = ({ label, value, onChange, options, placeholder, name, bgColor = "bg-white" }) => (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={`w-full h-11 min-h-[44px] px-3.5 pr-9 text-sm font-semibold rounded-xl border border-[#c7cad5] ${bgColor} text-[#1c1c1e] hover:border-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all appearance-none cursor-pointer leading-normal`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.name || option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Miro Style) */}
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
              CONTEST DIRECTORY
            </span>
          </div>
          <button
            onClick={() => navigate("/create-contests")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>Create New Contest</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Contest Management
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Filter, inspect, configure, and track contest challenges across curriculum tiers and prize pools.
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1c1c1e]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1c1e]">
                Filter Contests
              </h2>
            </div>
            {Object.values(filterValues).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7f8fa] hover:bg-[#ebedf2] border border-[#c7cad5] text-xs font-bold text-[#555a6a] hover:text-[#1c1c1e] transition-all self-start sm:self-auto"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CustomSelect
              label="Status"
              name="status"
              value={filterValues.status}
              onChange={handleFilterChange}
              options={statusOptions}
              placeholder="All Statuses"
              bgColor="bg-[#fbf9fe]"
            />
            <CustomSelect
              label="Region"
              name="region"
              value={filterValues.region}
              onChange={handleFilterChange}
              options={regionOptions}
              placeholder="All Regions"
              bgColor="bg-[#fffdf5]"
            />
            <CustomSelect
              label="Exam Type"
              name="examType"
              value={filterValues.examType}
              onChange={handleFilterChange}
              options={getExamTypes()}
              placeholder="All Exam Types"
              bgColor="bg-[#f4fbfb]"
            />
            <CustomSelect
              label="Specific Class"
              name="specificClass"
              value={filterValues.specificClass}
              onChange={handleFilterChange}
              options={getSpecificClasses()}
              placeholder="All Classes"
              bgColor="bg-[#fdf6fa]"
            />
            <CustomSelect
              label="Subject"
              name="subject"
              value={filterValues.subject}
              onChange={handleFilterChange}
              options={getSubjects()}
              placeholder="All Subjects"
              bgColor="bg-[#f5f8ff]"
            />
            <CustomSelect
              label="Chapter"
              name="chapter"
              value={filterValues.chapter}
              onChange={handleFilterChange}
              options={getChapters()}
              placeholder="All Chapters"
              bgColor="bg-[#f5fbf7]"
            />
          </div>
        </div>

        {/* Contest List Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                Contests Directory ({filteredContests.length})
              </h2>
              {filteredContests.length !== contests.length && (
                <span className="text-xs font-semibold text-[#555a6a]">
                  (filtered from {contests.length})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#555a6a]">
              <span className="w-2 h-2 rounded-full bg-[#187574] animate-pulse" />
              <span>Live filtering active</span>
            </div>
          </div>

          {isLoading ? (
            <MiroLoader message="Fetching contests..." />
          ) : filteredContests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#fff8e0] border border-[#fde89c] flex items-center justify-center mx-auto text-[#746019]">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1c1c1e]">No contests found</h3>
                <p className="text-xs sm:text-sm text-[#555a6a] max-w-md mx-auto">
                  {contests.length === 0
                    ? "No contests available at the moment. Create a new contest to get started."
                    : "Try adjusting your filter criteria to see more results."}
                </p>
              </div>
              {Object.values(filterValues).some(Boolean) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e] hover:bg-[#f7f8fa]"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredContests.map((contest, index) => {
                  const displayStatus = getEffectiveStatus(contest)
                  return (
                    <motion.div
                      key={contest._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 hover:shadow-md hover:border-[#1c1c1e] transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Title & Status */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1c1c1e] text-[#ffd02f] text-xs font-black flex-shrink-0">
                              {index + 1}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e] truncate">
                              {contest.title}
                            </h3>
                            <StatusBadge status={displayStatus} />
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-[#555a6a] line-clamp-2 leading-relaxed">
                            {contest.description || "A competitive contest to test your knowledge and win exciting prizes."}
                          </p>

                          {/* Chips / Taxonomy Grid */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            {contest.region && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] text-[#1c1c1e] font-semibold">
                                <span className="text-[#555a6a]">Region:</span> {contest.region}
                              </span>
                            )}
                            {contest.examType && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4fbfb] border border-[#d2f3ee] text-[#187574] font-semibold">
                                <span className="text-[#555a6a]">Exam:</span> {contest.examType}
                              </span>
                            )}
                            {contest.specificClass && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf6fa] border border-[#f7d6ee] text-[#86296b] font-semibold">
                                <span className="text-[#555a6a]">Class:</span> {contest.specificClass}
                              </span>
                            )}
                            {contest.subject && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f8ff] border border-[#d6e4ff] text-[#2a41b6] font-semibold">
                                <span className="text-[#555a6a]">Subject:</span> {contest.subject}
                              </span>
                            )}
                            {contest.chapter && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5fbf7] border border-[#cbeed7] text-[#136637] font-semibold">
                                <span className="text-[#555a6a]">Chapter:</span> {contest.chapter}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff8e0] border border-[#fde89c] text-[#746019] font-bold">
                              <Trophy className="w-3.5 h-3.5 text-[#b8860b]" />
                              <span>Prize: ₹{contest.prize || 0}</span>
                            </span>
                            {contest.deadline && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] text-[#555a6a] font-medium">
                                <Calendar className="w-3.5 h-3.5 text-[#555a6a]" />
                                <span>Deadline: {new Date(contest.deadline).toLocaleDateString()}</span>
                              </span>
                            )}
                            {contest.startTime && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] text-[#555a6a] font-medium">
                                <Clock className="w-3.5 h-3.5 text-[#555a6a]" />
                                <span>Start: {new Date(contest.startTime).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: rounded-none icon-only, NO approve/reject buttons */}
                        <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e0e2e8]">
                          {/* View Contest */}
                          <button
                            type="button"
                            onClick={() => handleView(contest)}
                            className="p-2 rounded-none bg-[#f5f3ff] hover:bg-[#ede9fe] border border-[#ddd6fe] text-[#4262ff] transition-all shadow-xs active:scale-95"
                            title="View Contest Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Contest */}
                          <button
                            type="button"
                            onClick={() => handleEdit(contest)}
                            className="p-2 rounded-none bg-[#fff8e0] hover:bg-[#fff4c4] border border-[#fde89c] text-[#746019] transition-all shadow-xs active:scale-95"
                            title="Edit Contest"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Contest Results */}
                          <button
                            type="button"
                            onClick={() => showallresult(contest)}
                            className="p-2 rounded-none bg-[#c3faf5] hover:bg-[#a6f5ed] border border-[#9eece4] text-[#187574] transition-all shadow-xs active:scale-95"
                            title="Contest Results & Leaderboard"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* Enrolled Students */}
                          <button
                            type="button"
                            onClick={() => handlechangeStatus(contest)}
                            className="p-2 rounded-none bg-[#ffd8f4] hover:bg-[#fcc8ee] border border-[#f7d6ee] text-[#86296b] transition-all shadow-xs active:scale-95"
                            title="Enrolled Students"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          {/* Delete Contest */}
                          <button
                            type="button"
                            onClick={() => handleDelete(contest)}
                            className="p-2 rounded-none bg-[#fbd4d4] hover:bg-[#f9a9a9] border border-[#e3c5c5] text-[#800000] transition-all shadow-xs active:scale-95"
                            title="Delete Contest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterContest