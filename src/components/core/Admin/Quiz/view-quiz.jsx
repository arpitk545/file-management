"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Edit, Trash2, Search, Filter, ArrowLeft } from "lucide-react"
import { getAllQuizRegions, getAllQuizzesWithCategoryAndQuestions,deleteQuizByTitle } from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import { useParams,useNavigate} from "react-router-dom"

const StatusBadge = ({ status }) => {
  const statusColors = {
    Approved: "bg-emerald-100 text-emerald-800",
    "Waiting for Approval": "bg-amber-100 text-amber-800",
    Rejected: "bg-rose-100 text-rose-800",
    published: "bg-indigo-100 text-indigo-800",
    draft: "bg-slate-100 text-slate-800",
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-slate-100 text-slate-800"}`}
    >
      {status}
    </span>
  )
}

export default function ViewQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    approvalStatus: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [regions, setRegions] = useState([])
  const [examTypes, setExamTypes] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)

  const approvalStatuses = ["Approved", "Waiting for Approval", "Rejected"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch regions data
        const regionsResponse = await getAllQuizRegions()
        setRegions(regionsResponse?.data || [])

        // Fetch quizzes data
        const quizzesResponse = await getAllQuizzesWithCategoryAndQuestions()
        const allQuizzes = quizzesResponse?.data || [];

        const createQuizOnly = allQuizzes.filter(
        (quiz) => quiz?.category?.quizType === "createquiz"
       );
        setQuizzes(createQuizOnly)
        setFilteredQuizzes(createQuizOnly)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load quiz data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.region) {
      const region = regions.find((r) => r._id === formData.region)
      setSelectedRegion(region)
      setExamTypes(region?.examTypes?.map((t) => t.name) || [])
    } else {
      setExamTypes([])
      setClasses([])
      setSubjects([])
      setChapters([])
    }
  }, [formData.region, regions])

 useEffect(() => {
  filterQuizzes()
  if (formData.examType && selectedRegion) {
    const selectedExamType = selectedRegion.examTypes.find(
      (et) => et.name === formData.examType
    )
    const classList = selectedExamType?.specificClasses?.map((c) => c.name) || []
    setClasses(classList)
  } else {
    setClasses([])
    setSubjects([])
    setChapters([])
  }
}, [formData.examType, selectedRegion])

useEffect(() => {
  filterQuizzes()
  if (formData.examType && formData.specificClass && selectedRegion) {
    const selectedExamType = selectedRegion.examTypes.find(
      (et) => et.name === formData.examType
    )
    const selectedClass = selectedExamType?.specificClasses?.find(
      (cls) => cls.name === formData.specificClass
    )
    const subjectList = selectedClass?.subjects?.map((s) => s.name) || []
    setSubjects(subjectList)
  } else {
    setSubjects([])
    setChapters([])
  }
}, [formData.examType, formData.specificClass, selectedRegion])


 useEffect(() => {
  filterQuizzes()
  if (
    formData.examType &&
    formData.specificClass &&
    formData.subject &&
    selectedRegion
  ) {
    const selectedExamType = selectedRegion.examTypes.find(
      (et) => et.name === formData.examType
    )
    const selectedClass = selectedExamType?.specificClasses?.find(
      (cls) => cls.name === formData.specificClass
    )
    const selectedSubject = selectedClass?.subjects?.find(
      (subj) => subj.name === formData.subject
    )
    const chapterList = selectedSubject?.chapters?.map((ch) => ch.name) || []
    setChapters(chapterList)
  } else {
    setChapters([])
  }
}, [formData.examType, formData.specificClass, formData.subject, selectedRegion])


  const filterQuizzes = () => {
    let filtered = quizzes

    if (formData.region) {
      const regionName = regions.find((r) => r._id === formData.region)?.name || ""
      filtered = filtered.filter((quiz) => quiz.category?.region === regionName)
    }

    if (formData.examType) {
      filtered = filtered.filter((quiz) => quiz.category?.examType === formData.examType)
    }

    if (formData.specificClass) {
      filtered = filtered.filter((quiz) => quiz.category?.specificClass === formData.specificClass)
    }

    if (formData.subject) {
      filtered = filtered.filter((quiz) => quiz.category?.subject === formData.subject)
    }

    if (formData.chapter) {
      filtered = filtered.filter((quiz) => quiz.category?.chapter === formData.chapter)
    }

    if (formData.approvalStatus) {
      filtered = filtered.filter((quiz) => quiz.approvalStatus === formData.approvalStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.fileTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.category?.quizTitle?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredQuizzes(filtered)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset dependent fields
      ...(name === "region" && { examType: "", specificClass: "", subject: "", chapter: "" }),
      ...(name === "examType" && { specificClass: "", subject: "", chapter: "" }),
      ...(name === "specificClass" && { subject: "", chapter: "" }),
      ...(name === "subject" && { chapter: "" }),
    }))
  }

  const handleView = (quiz) => {
    window.location.href = `/show-questions/${id || quiz._id}`
  }

  const handleUpdate = (quiz) => {
    window.location.href = `/update-quiz/${id || quiz._id}`
  }
  
//delete the quiz by title
const handleDelete = async (quiz) => {
  if (!window.confirm("Are you sure you want to delete this quiz?")) return;

  try {
    await deleteQuizByTitle(quiz.category.quizTitle);
    setQuizzes((quizzes) => quizzes.filter((q) => q._id !== quiz._id));
    toast.success("Quiz deleted successfully!");
    window.location.reload();
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete quiz.");
  }
};

  const clearFilters = () => {
    setFormData({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
      approvalStatus: "",
    })
    setSearchQuery("")
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-cyan-200 via-indigo-200 to-blue-200 p-4 sm:p-6 lg:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
        {/* Main Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Quiz Management</h1>
                <p className="text-purple-100 text-sm sm:text-base">View and manage all quizzes in your system</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </motion.button>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Filter Quizzes</h2>
              {(formData.region ||
                formData.examType ||
                formData.specificClass ||
                formData.subject ||
                formData.chapter ||
                formData.approvalStatus ||
                searchQuery) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </motion.button>
              )}
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Approval Status Field */}
                <div className="space-y-2">
                  <label htmlFor="approvalStatus" className="block text-sm font-semibold text-gray-700">
                    Approval Status
                  </label>
                  <select
                    id="approvalStatus"
                    name="approvalStatus"
                    value={formData.approvalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    {approvalStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region Field */}
                <div className="space-y-2">
                  <label htmlFor="region" className="block text-sm font-semibold text-gray-700">
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200"
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Type Field */}
                <div className="space-y-2">
                  <label htmlFor="examType" className="block text-sm font-semibold text-gray-700">
                    Exam Type
                  </label>
                  <select
                    id="examType"
                    name="examType"
                    value={formData.examType}
                    onChange={handleInputChange}
                    disabled={!formData.region}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Types</option>
                    {examTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Field */}
                <div className="space-y-2">
                  <label htmlFor="specificClass" className="block text-sm font-semibold text-gray-700">
                    Class
                  </label>
                  <select
                    id="specificClass"
                    name="specificClass"
                    value={formData.specificClass}
                    onChange={handleInputChange}
                    disabled={!formData.examType}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    disabled={!formData.specificClass}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter Field */}
                <div className="space-y-2">
                  <label htmlFor="chapter" className="block text-sm font-semibold text-gray-700">
                    Chapter
                  </label>
                  <select
                    id="chapter"
                    name="chapter"
                    value={formData.chapter}
                    onChange={handleInputChange}
                    disabled={!formData.subject}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Chapters</option>
                    {chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Quiz List */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Quiz List ({filteredQuizzes.length})
                {filteredQuizzes.length !== quizzes.length && (
                  <span className="text-sm font-normal text-gray-500 ml-2">(filtered from {quizzes.length})</span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-gray-500">
                <Search className="w-4 h-4" />
                <span className="text-sm">Live filtering active</span>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <span className="text-gray-600 text-lg">Loading quizzes...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="min-w-full rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full table-fixed">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Region
                          </th>
                          <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Questions
                          </th>
                          <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="w-[27%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="w-[12%] px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <AnimatePresence>
                          {filteredQuizzes.map((quiz, index) => (
                            <motion.tr
                              key={quiz._id}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              custom={index}
                              className="hover:bg-gray-50 transition-colors duration-200"
                            >
                              <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900">
                                {quiz.category?.region || "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">
                                {quiz.category?.subject || "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">
                                {quiz.category?.specificClass || "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">
                                {quiz.questions?.length || 0}
                              </td>
                              <td className="px-4 py-3 whitespace-normal">
                                <StatusBadge
                                  status={
                                    quiz.category?.approvalStatus || quiz.approvalStatus || "Waiting for Approval"
                                  }
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-normal text-sm text-gray-700 break-words">
                                {quiz.category?.quizTitle || quiz.fileTitle || "Untitled Quiz"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleView(quiz)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                                    title="View Quiz"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleUpdate(quiz)}
                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                                    title="Edit Quiz"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDelete(quiz)}
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                                    title="Delete Quiz"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  <AnimatePresence>
                    {filteredQuizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {quiz.category?.quizTitle || quiz.fileTitle || "Untitled Quiz"}
                            </h3>
                            <StatusBadge
                              status={quiz.category?.approvalStatus || quiz.approvalStatus || "Waiting for Approval"}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-700">
                              <div className="font-medium">Region:</div>
                              <div>{quiz.category?.region || "—"}</div>
                            </div>
                            <div className="text-gray-700">
                              <div className="font-medium">Subject:</div>
                              <div>{quiz.category?.subject || "—"}</div>
                            </div>
                            <div className="text-gray-700">
                              <div className="font-medium">Class:</div>
                              <div>{quiz.category?.specificClass || "—"}</div>
                            </div>
                            <div className="text-gray-700">
                              <div className="font-medium">Questions:</div>
                              <div>{quiz.questions?.length || 0}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1 pt-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleView(quiz)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpdate(quiz)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(quiz)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* No Results State */}
            {!isLoading && filteredQuizzes.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
                <p className="text-gray-600">
                  {quizzes.length === 0
                    ? "Create your first quiz to get started."
                    : "Try adjusting your filter criteria."}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
