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
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions, getAllQuizzesWithCategoryAndQuestions } from "../../../../services/operations/quizAPI"

// Passcode Modal Component
const PasscodeModal = ({ isOpen, onClose, onVerify, quizTitle }) => {
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
            Please enter the 5-digit passcode to play <span className="font-semibold">"{quizTitle}"</span>
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
                <Play className="w-4 h-4" />
              )}
              Play Quiz
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
    chapter: ""
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
          getAllQuizRegions()
        ])

        const approvedQuizzes = (quizzesRes?.data || []).filter(
          (quiz) =>
            (quiz.approvalStatus === "Approved" || quiz.category?.approvalStatus === "Approved") &&
            quiz.category?.quizType === "createquiz"
        )
         
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

  // This will navigate to the dashboard
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
    // Check if quiz has passcode
    if (quiz.category?.passcode) {
      setSelectedQuiz(quiz)
      setShowPasscodeModal(true)
    } else {
      // No passcode required, navigate directly
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

  useEffect(() => {
    const selectedRegion = regions.find(region => region._id === filters.region)
    if (selectedRegion) {
      setExamTypes(selectedRegion.examTypes || [])
      setFilters(prev => ({
        ...prev,
        examType: "",
        specificClass: "",
        subject: "",
        chapter: ""
      }))
    } else {
      setExamTypes([])
    }
  }, [filters.region, regions])

  useEffect(() => {
    const selectedRegion = regions.find(region => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find(et => et.name === filters.examType)

    if (selectedExamType) {
      setSpecificClasses(selectedExamType.specificClasses || [])
      setFilters(prev => ({
        ...prev,
        specificClass: "",
        subject: "",
        chapter: ""
      }))
    } else {
      setSpecificClasses([])
    }
  }, [filters.examType, filters.region, regions])

  useEffect(() => {
    const selectedRegion = regions.find(region => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find(et => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filters.specificClass)

    if (selectedSpecificClass) {
      setSubjects(selectedSpecificClass.subjects || [])
      setFilters(prev => ({
        ...prev,
        subject: "",
        chapter: ""
      }))
    } else {
      setSubjects([])
    }
  }, [filters.specificClass, filters.examType, filters.region, regions])

  useEffect(() => {
    const selectedRegion = regions.find(region => region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find(et => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filters.specificClass)
    const selectedSubject = selectedSpecificClass?.subjects.find(sub => sub.name === filters.subject)

    if (selectedSubject) {
      setChapters(selectedSubject.chapters || [])
      setFilters(prev => ({
        ...prev,
        chapter: ""
      }))
    } else {
      setChapters([])
    }
  }, [filters.subject, filters.specificClass, filters.examType, filters.region, regions])

  // Get the region name from the selected region ID for filtering
  const filteredQuizzes = quizzes.filter(quiz => {
    const selectedRegionName = regions.find(r => r._id === filters.region)?.name
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-indigo-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">Available Quizzes</h1>

        {/* Filter Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Quizzes</h2>
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
                {examTypes.map(type => (
                  <option key={type.name} value={type.name}>
                    {type.name}
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
                {specificClasses.map(cls => (
                  <option key={cls.name} value={cls.name}>
                    {cls.name}
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
                {subjects.map(sub => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
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
                {chapters.map(ch => (
                  <option key={ch.name} value={ch.name}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
              >
                {/* Thumbnail */}
                {quiz.category?.thumbnailimage && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={quiz.category.thumbnailimage} 
                      alt={quiz.category.quizTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Quiz Content */}
                <div className="p-6 flex-grow space-y-4">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {quiz.category?.quizTitle || quiz.fileTitle}
                  </h2>

                  {/* Description */}
                  {quiz.category?.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {quiz.category.description}
                    </p>
                  )}

                  {/* Quiz Info Grid */}
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold">Duration:</span> 
                      <span>{quiz.category?.duration || "N/A"} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Questions:</span> 
                      <span>{quiz.questions?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Author:</span> 
                      <span className="truncate">{quiz.category?.author || "Unknown"}</span>
                    </div>
                    {quiz.category?.passcode && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Lock className="w-4 h-4 text-red-600" />
                        <span className="font-semibold">Passcode:</span> 
                        <span className="text-red-600">Protected</span>
                      </div>
                    )}
                  </div>

                  {/* Toggle for More Details */}
                  <button
                    onClick={() => toggleDetails(quiz._id)}
                    className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-semibold py-2 rounded-lg transition-colors duration-200"
                    aria-expanded={!!openDetails[quiz._id]}
                    aria-controls={`details-${quiz._id}`}
                  >
                    {openDetails[quiz._id] ? (
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
                    {openDetails[quiz._id] && (
                      <motion.div
  id={`details-${quiz._id}`}
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.3 }}
  className="overflow-hidden border-t border-gray-200 pt-4 mt-4 text-sm"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
    {/* Region */}
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-indigo-600" />
      <span className="font-semibold">Region:</span> {quiz.category?.region || "N/A"}
    </div>

    {/* Exam Type */}
    <div className="flex items-center gap-2">
      <FileText className="w-4 h-4 text-indigo-600" />
      <span className="font-semibold">Exam Type:</span> {quiz.category?.examType || "N/A"}
    </div>

    {/* Class */}
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-indigo-600" />
      <span className="font-semibold">Class:</span> {quiz.category?.specificClass || "N/A"}
    </div>

    {/* Subject */}
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-indigo-600" />
      <span className="font-semibold">Subject:</span> {quiz.category?.subject || "N/A"}
    </div>

    {/* Chapter - full width on last row */}
    <div className="flex items-center gap-2 md:col-span-2">
      <Target className="w-4 h-4 text-indigo-600" />
      <span className="font-semibold">Chapter:</span> {quiz.category?.chapter || "N/A"}
    </div>
  </div>
</motion.div>

                    )}
                  </AnimatePresence>
                </div>

                {/* Play Quiz Button */}
                <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handlePlayQuiz(quiz)}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors duration-200 "
                  >
                    <Play className="h-5 w-5 mr-3" />
                    Play Quiz
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
            setSelectedQuiz(null)
          }}
          onVerify={handlePasscodeVerify}
          quizTitle={selectedQuiz?.category?.quizTitle || "Quiz"}
        />
      </div>
    </div>
  )
}