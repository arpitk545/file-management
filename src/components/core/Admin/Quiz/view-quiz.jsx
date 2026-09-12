"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Edit, Trash2, Search, Filter, ArrowLeft, Sparkles, Plus, BookOpen, Layers } from "lucide-react"
import { getAllQuizRegions, getAllQuizzesWithCategoryAndQuestions, deleteQuizByTitle } from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading platform quizzes..." }) => (
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
    Rejected: "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]",
    published: "bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]",
    draft: "bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]",
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
        const regionsResponse = await getAllQuizRegions()
        setRegions(regionsResponse?.data || [])

        const quizzesResponse = await getAllQuizzesWithCategoryAndQuestions()
        const allQuizzes = quizzesResponse?.data || []

        const createQuizOnly = allQuizzes
          .filter((quiz) => !quiz?.category?.quizType || quiz?.category?.quizType === "createquiz")
          .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
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
      const selectedExamType = selectedRegion.examTypes.find((et) => et.name === formData.examType)
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
      const selectedExamType = selectedRegion.examTypes.find((et) => et.name === formData.examType)
      const selectedClass = selectedExamType?.specificClasses?.find((cls) => cls.name === formData.specificClass)
      const subjectList = selectedClass?.subjects?.map((s) => s.name) || []
      setSubjects(subjectList)
    } else {
      setSubjects([])
      setChapters([])
    }
  }, [formData.examType, formData.specificClass, selectedRegion])

  useEffect(() => {
    filterQuizzes()
    if (formData.examType && formData.specificClass && formData.subject && selectedRegion) {
      const selectedExamType = selectedRegion.examTypes.find((et) => et.name === formData.examType)
      const selectedClass = selectedExamType?.specificClasses?.find((cls) => cls.name === formData.specificClass)
      const selectedSubject = selectedClass?.subjects?.find((subj) => subj.name === formData.subject)
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
      filtered = filtered.filter((quiz) => (quiz.category?.approvalStatus || quiz.approvalStatus) === formData.approvalStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.fileTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.category?.quizTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    filtered = [...filtered].sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
    setFilteredQuizzes(filtered)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "region" && { examType: "", specificClass: "", subject: "", chapter: "" }),
      ...(name === "examType" && { specificClass: "", subject: "", chapter: "" }),
      ...(name === "specificClass" && { subject: "", chapter: "" }),
      ...(name === "subject" && { chapter: "" }),
    }))
  }

  const handleDelete = async (quiz) => {
    const title = quiz.category?.quizTitle || quiz.fileTitle
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      await deleteQuizByTitle(title)
      setQuizzes((quizzes) => quizzes.filter((q) => q._id !== quiz._id))
      setFilteredQuizzes((quizzes) => quizzes.filter((q) => q._id !== quiz._id))
      toast.success("Quiz deleted successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete quiz.")
    }
  }

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

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Posts Pattern) */}
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
              QUIZ STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
              QUIZ DIRECTORY
            </span>
          </div>
          <button
            onClick={() => navigate("/create-quizs")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>Create New Quiz</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Quiz Management
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Filter, inspect, edit, and moderate quizzes across curriculum tiers and examination systems.
          </p>
        </div>

        {/* Step 1: Filter Card (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Filter className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Filter Quizzes by Hierarchy</h2>
            </div>
            {(formData.region ||
              formData.examType ||
              formData.specificClass ||
              formData.subject ||
              formData.chapter ||
              formData.approvalStatus ||
              searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe] hover:bg-white/80 transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e91a0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                filterQuizzes()
              }}
              placeholder="Search by quiz title, description, or keyword..."
              className="w-full h-12 pl-10 pr-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
            />
          </div>

          {/* Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
            {/* Approval Status (Yellow) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">Status</label>
              <select
                name="approvalStatus"
                value={formData.approvalStatus}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff]"
              >
                <option value="">All Statuses</option>
                {approvalStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Region (Teal) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">Region</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0]"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type (Rose) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">Exam Type</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                disabled={!formData.region}
                className={`w-full h-10 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] ${
                  !formData.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Exam Types</option>
                {examTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class (Orange) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">Class</label>
              <select
                name="specificClass"
                value={formData.specificClass}
                onChange={handleInputChange}
                disabled={!formData.examType}
                className={`w-full h-10 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] ${
                  !formData.examType ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject (Lavender) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                disabled={!formData.specificClass}
                className={`w-full h-10 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] ${
                  !formData.specificClass ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Subjects</option>
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter (Neutral) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Chapter</label>
              <select
                name="chapter"
                value={formData.chapter}
                onChange={handleInputChange}
                disabled={!formData.subject}
                className={`w-full h-10 px-3 bg-white border border-[#c7cad5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] ${
                  !formData.subject ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Chapters</option>
                {chapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#0fbcb0]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                Quiz Directory ({filteredQuizzes.length})
              </h2>
            </div>
            {filteredQuizzes.length !== quizzes.length && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
                Filtered from {quizzes.length} quizzes
              </span>
            )}
          </div>

          {isLoading ? (
            <MiroLoader message="Fetching platform quizzes..." />
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#c7cad5] rounded-2xl p-6">
              <Search className="w-10 h-10 text-[#8e91a0] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#1c1c1e]">No quizzes found</h3>
              <p className="text-xs sm:text-sm text-[#555a6a] mt-1">Try adjusting your filters or create a new quiz</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#e0e2e8]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e0e2e8] text-xs font-bold text-[#555a6a] uppercase tracking-wider bg-[#f7f8fa]">
                      <th className="px-4 py-3.5">Region</th>
                      <th className="px-4 py-3.5">Exam / Class</th>
                      <th className="px-4 py-3.5">Subject</th>
                      <th className="px-4 py-3.5">Quiz Title</th>
                      <th className="px-4 py-3.5 text-center">Questions</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e2e8]">
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz._id} className="hover:bg-[#f7f8fa] transition-colors text-sm">
                        <td className="px-4 py-3.5 font-bold text-[#1c1c1e] whitespace-nowrap">
                          {quiz.category?.region || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[#555a6a]">
                          {quiz.category?.examType || "—"} • {quiz.category?.specificClass || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[#555a6a]">
                          {quiz.category?.subject || "—"}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#1c1c1e] max-w-xs truncate" title={quiz.category?.quizTitle || quiz.fileTitle}>
                          {quiz.category?.quizTitle || quiz.fileTitle}
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-[#1c1c1e]">
                          {quiz.questions?.length || 0}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={quiz.category?.approvalStatus || quiz.approvalStatus || "Approved"} />
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => navigate(`/show-questions/${quiz._id}`)}
                              className="p-2 text-[#4262ff] hover:bg-[#f5f3ff] rounded-full transition-colors active:scale-95"
                              title="Show Questions"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/update-quiz/${quiz._id}`)}
                              className="p-2 text-[#d97706] hover:bg-[#fff8e0] rounded-full transition-colors active:scale-95"
                              title="Edit Quiz"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(quiz)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                              title="Delete Quiz"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden space-y-3">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz._id} className="p-4 rounded-xl border border-[#e0e2e8] bg-white space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#1c1c1e]">
                        {quiz.category?.quizTitle || quiz.fileTitle}
                      </h3>
                      <StatusBadge status={quiz.category?.approvalStatus || quiz.approvalStatus || "Approved"} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f7f8fa] p-2.5 rounded-lg">
                      <div><span className="font-semibold text-[#555a6a]">Region:</span> <span className="font-bold text-[#1c1c1e]">{quiz.category?.region || "—"}</span></div>
                      <div><span className="font-semibold text-[#555a6a]">Exam:</span> <span className="text-[#1c1c1e]">{quiz.category?.examType || "—"}</span></div>
                      <div><span className="font-semibold text-[#555a6a]">Class:</span> <span className="text-[#1c1c1e]">{quiz.category?.specificClass || "—"}</span></div>
                      <div><span className="font-semibold text-[#555a6a]">Questions:</span> <span className="font-bold text-[#1c1c1e]">{quiz.questions?.length || 0}</span></div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e0e2e8]">
                      <button
                        onClick={() => navigate(`/show-questions/${quiz._id}`)}
                        className="px-3 py-1.5 rounded-full bg-[#f5f3ff] text-[#4262ff] text-xs font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => navigate(`/update-quiz/${quiz._id}`)}
                        className="px-3 py-1.5 rounded-full bg-[#fff8e0] text-[#746019] text-xs font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(quiz)}
                        className="p-1.5 rounded-full text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
