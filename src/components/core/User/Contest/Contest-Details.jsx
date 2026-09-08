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
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions } from "../../../../services/operations/quizAPI"
import { getAllContest } from "../../../../services/operations/contestAPI"

// Passcode Modal Component
const PasscodeModal = ({ isOpen, onClose, onVerify, contestTitle }) => {
  const [passcode, setPasscode] = useState(["", "", "", "", ""])
  const [loading, setLoading] = useState(false)

  const handleDigitChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return
    
    const newPasscode = [...passcode]
    newPasscode[index] = value
    setPasscode(newPasscode)

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`passcode-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      const prevInput = document.getElementById(`passcode-input-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async () => {
    const enteredPasscode = passcode.join('')
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Passcode</h3>
          <p className="text-gray-600 text-sm">
            Please enter the 5-digit passcode to enroll in <span className="font-semibold">"{contestTitle}"</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-2 mb-6">
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
                className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg font-medium text-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="•"
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Verify & Enroll
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
    month: "long",
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
    chapter: ""
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
          getAllQuizRegions()
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
      event.preventDefault();
      navigate("/dashboard", { replace: true }); 
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  const toggleDetails = (id) => {
    setOpenDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleEnroll = (contest) => {
    // Check if contest has passcode
    if (contest.passcode) {
      setSelectedContest(contest)
      setShowPasscodeModal(true)
    } else {
      // No passcode required, navigate directly
      navigate(`/Contest-Enrollment/${contest._id}`);
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
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent filters when parent changes
      ...(name === "region" && {
        examType: "",
        specificClass: "",
        subject: "",
        chapter: ""
      }),
      ...(name === "examType" && {
        specificClass: "",
        subject: "",
        chapter: ""
      }),
      ...(name === "specificClass" && {
        subject: "",
        chapter: ""
      }),
      ...(name === "subject" && {
        chapter: ""
      })
    }))
  }

  const getExamTypes = () => {
    if (!filters.region) return []
    const selectedRegion = regions.find(region => region._id === filters.region)
    return selectedRegion?.examTypes?.map(type => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!filters.region || !filters.examType) return []
    const selectedRegion = regions.find(region => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find(et => et.name === filters.examType)
    return selectedExamType?.specificClasses?.map(cls => cls.name) || []
  }

  const getSubjects = () => {
    if (!filters.region || !filters.examType || !filters.specificClass) return []
    const selectedRegion = regions.find(region => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find(et => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filters.specificClass)
    return selectedSpecificClass?.subjects?.map(subject => subject.name) || []
  }

  const getChapters = () => {
    if (!filters.region || !filters.examType || !filters.specificClass || !filters.subject) return []
    const selectedRegion = regions.find(region => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find(et => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filters.specificClass)
    const selectedSubject = selectedSpecificClass?.subjects.find(sub => sub.name === filters.subject)
    return selectedSubject?.chapters?.map(ch => ch.name) || []
  }

  const filteredContests = contests.filter(contest => {
    const selectedRegionName = regions.find(r => r._id === filters.region)?.name;

    return (
      (!filters.region || contest.region === selectedRegionName) &&
      (!filters.examType || contest.examType === filters.examType) &&
      (!filters.specificClass || contest.specificClass === filters.specificClass) &&
      (!filters.subject || contest.subject === filters.subject) &&
      (!filters.chapter || contest.chapter === filters.chapter)
    );
  });

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading your Contests...</h2>
          <p className="text-gray-600">Please wait while we load your Contests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-indigo-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">Available Contests</h1>

        {/* Filter Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Contests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Region Filter */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                id="region"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type Filter */}
            <div>
              <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-1">
                Exam Type
              </label>
              <select
                id="examType"
                name="examType"
                value={filters.examType}
                onChange={handleFilterChange}
                disabled={!filters.region}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Exam Types</option>
                {getExamTypes().map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label htmlFor="specificClass" className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                id="specificClass"
                name="specificClass"
                value={filters.specificClass}
                onChange={handleFilterChange}
                disabled={!filters.examType}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {getSpecificClasses().map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                disabled={!filters.specificClass}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {getSubjects().map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Filter */}
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">
                Chapter
              </label>
              <select
                id="chapter"
                name="chapter"
                value={filters.chapter}
                onChange={handleFilterChange}
                disabled={!filters.subject}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Chapters</option>
                {getChapters().map(ch => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredContests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No contests found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => (
              <motion.div
                key={contest._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
              >
                {/* Thumbnail */}
                {contest.thumbnail && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={contest.thumbnail} 
                      alt={contest.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Contest Content */}
                <div className="p-6 flex-grow space-y-4">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {contest.title}
                  </h2>

                  {/* Description */}
                  {contest.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {contest.description}
                    </p>
                  )}

                  {/* Contest Info Grid */}
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold">Prize:</span> 
                      <span className="truncate">{contest.prize || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Questions:</span> 
                      <span>{contest.questions?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Deadline:</span> 
                      <span className="text-xs">{formatDateTime(contest.deadline)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Timer className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Start Time:</span> 
                      <span className="text-xs">{formatDateTime(contest.startTime)}</span>
                    </div>
                    {contest.passcode && (
                      <div className="flex items-center gap-2 text-gray-700 col-span-2">
                        <Lock className="w-4 h-4 text-red-600" />
                        <span className="font-semibold">Passcode:</span> 
                        <span className="text-red-600">Protected</span>
                      </div>
                    )}
                  </div>

                  {/* Toggle for More Details */}
                  <button
                    onClick={() => toggleDetails(contest._id)}
                    className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-semibold py-2 rounded-lg transition-colors duration-200"
                    aria-expanded={!!openDetails[contest._id]}
                    aria-controls={`details-${contest._id}`}
                  >
                    {openDetails[contest._id] ? (
                      <>
                        Hide Details <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show Details <ChevronDown className="w-4 h-4" />
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
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-gray-200 pt-4 mt-4 text-sm"
                      >
                        <div className="grid grid-cols-2 gap-4 text-gray-700">
                          {/* Region */}
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold">Region:</span> {contest.regionName || contest.region || "N/A"}
                          </div>

                          {/* Exam Type */}
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold">Exam Type:</span> {contest.examType || "N/A"}
                          </div>

                          {/* Class */}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold">Class:</span> {contest.specificClass || "N/A"}
                          </div>

                          {/* Subject */}
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold">Subject:</span> {contest.subject || "N/A"}
                          </div>

                          {/* Chapter - full width on last row */}
                          <div className="flex items-center gap-2 col-span-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold">Chapter:</span> {contest.chapter || "N/A"}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enroll Button */}
                <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEnroll(contest)}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors duration-200"
                  >
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Enroll Now
                  </button>
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