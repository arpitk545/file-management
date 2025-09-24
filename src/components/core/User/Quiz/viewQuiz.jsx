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
  FileText,
  Clock,
  User,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions, getAllQuizzesWithCategoryAndQuestions } from "../../../../services/operations/quizAPI"


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
         );
         
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

  //this will navigate to the dashboard
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

  const handlePlayQuiz = (quizId) => {
    navigate(`/play-quiz/${quizId}`);
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

  // FIXED: Get the region name from the selected region ID for filtering
  const filteredQuizzes = quizzes.filter(quiz => {
    const selectedRegionName = regions.find(r => r._id === filters.region)?.name;
    const category = quiz.category || {};
    
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
                className="bg-white p-6 rounded-2xl shadow-lg flex flex-col h-full"
              >
                <div className="flex-grow space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">{quiz.category?.quizTitle || quiz.fileTitle}</h2>
                  {/* <p className="text-gray-600 text-sm">{quiz.description}</p> */}

                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold">Duration:</span> {quiz.category?.duration || "N/A"} min
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Questions:</span> {quiz.questions?.length || 0}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 col-span-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Title:</span> {quiz.category?.quizTitle || quiz.fileTitle}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 col-span-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Author:</span> {quiz.category?.author || "Unknown"}
                    </div>
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
                        className="overflow-hidden border-t border-gray-200 pt-4 mt-4 space-y-3 text-sm"
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold">Region:</span> {quiz.category?.region || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold">Exam Type:</span> {quiz.category?.examType || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold">Class:</span> {quiz.category?.specificClass || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold">Subject:</span> {quiz.category?.subject || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Target className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold">Chapter:</span> {quiz.category?.chapter || "N/A"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Play Quiz Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handlePlayQuiz(quiz._id)}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors duration-200 rounded-none"
                  >
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Play Quiz
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}