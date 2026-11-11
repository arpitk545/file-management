"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowLeft,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  BookOpen,
  MapPin,
  Layers,
  Search,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import {
  getAllQuizRegions,
  getUserQuizzes,
  deleteQuizById,
  deleteQuizByTitle,
} from "../../../../services/operations/quizAPI"

export default function FilterUserQuiz() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [filters, setFilters] = useState({
    status: "",
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    search: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [regionsRes, quizzesRes] = await Promise.all([
          getAllQuizRegions(),
          getUserQuizzes(),
        ])

        const regionList = (regionsRes?.data || []).map((r) => r.name)
        setRegions(regionList)

        const allQuizzes = (quizzesRes?.data || [])
          .map((quiz) => ({
            _id: quiz._id,
            rawQuiz: quiz,
            fileTitle: quiz.fileTitle,
            quizTitle: quiz.category?.quizTitle || quiz.fileTitle || "Untitled Quiz",
            description: quiz.description || quiz.category?.description || "",
            region: quiz.category?.region || "Other",
            examType: quiz.category?.examType || "",
            specificClass: quiz.category?.specificClass || "—",
            subject: quiz.category?.subject || "—",
            chapter: quiz.category?.chapter || "",
            totalQuestions: quiz.questions?.length || 0,
            duration: quiz.duration || 30,
            approvalStatus: quiz.approvalStatus || quiz.category?.approvalStatus || "Waiting for Approval",
            createdAt: quiz.createdAt || new Date(),
          }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

        setQuizzes(allQuizzes)
      } catch (error) {
        console.error("Failed to load user quizzes:", error)
        toast.error("Failed to load your quizzes")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Available filter options derived from quizzes & regions
  const regionOptions = useMemo(() => {
    const fromQuizzes = quizzes.map((q) => q.region).filter(Boolean)
    const combined = Array.from(new Set([...regions, ...fromQuizzes]))
    return combined.filter((r) => r && r !== "All")
  }, [quizzes, regions])

  const examTypeOptions = useMemo(() => {
    const list = quizzes
      .filter((q) => !filters.region || q.region === filters.region)
      .map((q) => q.examType)
      .filter(Boolean)
    return Array.from(new Set(list))
  }, [quizzes, filters.region])

  const classOptions = useMemo(() => {
    const list = quizzes
      .filter(
        (q) =>
          (!filters.region || q.region === filters.region) &&
          (!filters.examType || q.examType === filters.examType)
      )
      .map((q) => q.specificClass)
      .filter(Boolean)
      .filter((c) => c !== "—")
    return Array.from(new Set(list))
  }, [quizzes, filters.region, filters.examType])

  const subjectOptions = useMemo(() => {
    const list = quizzes
      .filter(
        (q) =>
          (!filters.region || q.region === filters.region) &&
          (!filters.examType || q.examType === filters.examType) &&
          (!filters.specificClass || q.specificClass === filters.specificClass)
      )
      .map((q) => q.subject)
      .filter(Boolean)
      .filter((s) => s !== "—")
    return Array.from(new Set(list))
  }, [quizzes, filters.region, filters.examType, filters.specificClass])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => {
      const next = { ...prev, [name]: value }
      if (name === "region") {
        next.examType = ""
        next.specificClass = ""
        next.subject = ""
      } else if (name === "examType") {
        next.specificClass = ""
        next.subject = ""
      } else if (name === "specificClass") {
        next.subject = ""
      }
      return next
    })
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      search: "",
    })
  }

  const isFiltered = Boolean(
    filters.status ||
    filters.region ||
    filters.examType ||
    filters.specificClass ||
    filters.subject ||
    filters.search.trim()
  )

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (filters.status && quiz.approvalStatus !== filters.status) return false
      if (filters.region && quiz.region !== filters.region) return false
      if (filters.examType && quiz.examType !== filters.examType) return false
      if (filters.specificClass && quiz.specificClass !== filters.specificClass) return false
      if (filters.subject && quiz.subject !== filters.subject) return false
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim()
        const titleMatch = (quiz.quizTitle || "").toLowerCase().includes(query)
        const descMatch = (quiz.description || "").toLowerCase().includes(query)
        const subMatch = (quiz.subject || "").toLowerCase().includes(query)
        const regMatch = (quiz.region || "").toLowerCase().includes(query)
        if (!titleMatch && !descMatch && !subMatch && !regMatch) return false
      }
      return true
    })
  }, [quizzes, filters])

  const handleViewQuiz = (quiz) => {
    const targetQuiz = quiz.rawQuiz || quiz
    navigate(`/view-all-user-quiz/${quiz._id}`, { state: { quizId: quiz._id, quiz: targetQuiz } })
  }

  const handleEditQuiz = (quiz) => {
    navigate(`/edit-user-quiz/${quiz._id}`)
  }

  const handleDeleteQuiz = async (quiz) => {
    if (window.confirm(`Are you sure you want to delete "${quiz.quizTitle}"?`)) {
      try {
        if (quiz._id) {
          await deleteQuizById(quiz._id)
        } else {
          await deleteQuizByTitle(quiz.fileTitle || quiz.quizTitle)
        }
        setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id))
        toast.success("Quiz deleted successfully")
      } catch (err) {
        console.error("Failed to delete quiz:", err)
        toast.error(err?.response?.data?.error || "Failed to delete quiz")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">
          Loading your quizzes...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Top Header & Navigation Bar - 100% Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e8ec]">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#ffd02f] text-[#1c1c1e] shadow-2xs">
              QUIZ DIRECTORY
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              MY ASSESSMENTS
            </span>
          </div>

          <button
            onClick={() => navigate("/build-quiz")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>Create New Quiz</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
            My Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-2xl leading-relaxed">
            Manage, review, edit, or test your custom academic quizzes created across all syllabus boards.
          </p>
        </div>

        {/* Filter Card - Miro card-base with Dropdowns matching filterfile.jsx */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shadow-2xs">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1c1c1e]">
                  Filter by Board & Taxonomy
                </h2>
                <p className="text-xs text-[#6a6d7c]">Select dropdown taxonomy to refine quiz list</p>
              </div>
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#800000] border border-[#e3c5c5] rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Approval Status */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#fff8e0]/60 border border-[#fde89c]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#746019]">
                Approval Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full h-10 px-2.5 bg-white border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Waiting for Approval">Waiting for Approval</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Region / Board */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#fff4c4]/40 border border-[#fde89c]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#746019]">
                Region / Board
              </label>
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full h-10 px-2.5 bg-white border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
              >
                <option value="">All Regions</option>
                {regionOptions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#c3faf5]/30 border border-[#9eece4]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#187574]">
                Exam Type
              </label>
              <select
                name="examType"
                value={filters.examType}
                onChange={handleFilterChange}
                className="w-full h-10 px-2.5 bg-white border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0] cursor-pointer"
              >
                <option value="">All Exam Types</option>
                {examTypeOptions.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Level */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#ffd8f4]/30 border border-[#f3bee5]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#86296b]">
                Class Level
              </label>
              <select
                name="specificClass"
                value={filters.specificClass}
                onChange={handleFilterChange}
                className="w-full h-10 px-2.5 bg-white border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] cursor-pointer"
              >
                <option value="">All Classes</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#ffe6cd]/30 border border-[#fcd0a1]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#7c3a00]">
                Subject
              </label>
              <select
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                className="w-full h-10 px-2.5 bg-white border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] cursor-pointer"
              >
                <option value="">All Subjects</option>
                {subjectOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quizzes Repository Listing Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">
                Quiz Repository
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd02f] text-[#1c1c1e]">
                {filteredQuizzes.length} {filteredQuizzes.length === 1 ? "Quiz" : "Quizzes"}
              </span>
              {filteredQuizzes.length !== quizzes.length && (
                <span className="text-xs text-[#6a6d7c]">
                  (filtered from {quizzes.length})
                </span>
              )}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0] pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search quiz title, subject..."
                className="w-full h-10 pl-9 pr-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
              />
            </div>
          </div>

          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3 bg-[#fafbfc] rounded-2xl border border-dashed border-[#c7cad5]">
              <div className="w-12 h-12 bg-[#fff4c4] rounded-full flex items-center justify-center mx-auto text-[#746019]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#1c1c1e]">No quizzes found</h3>
              <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
                {quizzes.length === 0
                  ? "You haven't built any quizzes yet. Click below to start your first assessment."
                  : "Try adjusting or clearing your filters to discover quizzes in your repository."}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => (quizzes.length === 0 ? navigate("/build-quiz") : clearFilters())}
                  type="button"
                  className="px-6 py-3 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  {quizzes.length === 0 ? "Build First Quiz" : "Clear All Filters"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <div className="min-w-full rounded-xl border border-[#e6e8ec] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fafbfc] border-b border-[#e6e8ec]">
                      <tr>
                        <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[28%]">
                          Quiz Title & Description
                        </th>
                        <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[14%]">
                          Region / Board
                        </th>
                        <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[16%]">
                          Class & Subject
                        </th>
                        <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[14%]">
                          Questions
                        </th>
                        <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[14%]">
                          Approval Status
                        </th>
                        <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider text-center w-[14%]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6e8ec] bg-white">
                      {filteredQuizzes.map((quiz) => (
                        <tr key={quiz._id} className="hover:bg-[#f7f8fa] transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-[#1c1c1e] line-clamp-1 leading-snug">
                                {quiz.quizTitle}
                              </p>
                              {quiz.description && (
                                <p className="text-xs text-[#555a6a] line-clamp-1 font-medium">
                                  {quiz.description}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff8e0] text-[#746019] border border-[#fde89c] text-[11px] font-bold">
                              <MapPin className="w-3 h-3" />
                              <span>{quiz.region}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                            <div className="font-bold text-[#1c1c1e]">{quiz.subject}</div>
                            <div className="text-[11px] text-[#6a6d7c]">{quiz.specificClass}</div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5f3ff] text-[#4262ff] border border-[#4262ff]/20 text-[11px] font-bold">
                              <Layers className="w-3 h-3" />
                              <span>{quiz.totalQuestions} Questions</span>
                            </span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {quiz.approvalStatus === "Approved" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574] border border-[#9eece4] text-[11px] font-bold">
                                <CheckCircle className="w-3 h-3 text-[#187574]" />
                                <span>Approved</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff4c4] text-[#746019] border border-[#fde89c] text-[11px] font-bold">
                                <Clock className="w-3 h-3 text-[#746019]" />
                                <span>{quiz.approvalStatus}</span>
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewQuiz(quiz)}
                                className="w-8 h-8 rounded-full bg-white hover:bg-[#f7f8fa] text-[#1c1c1e] border border-[#c7cad5] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                                title="View / Inspect Quiz"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEditQuiz(quiz)}
                                className="w-8 h-8 rounded-full bg-white hover:bg-[#f7f8fa] text-[#4262ff] border border-[#c7cad5] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                                title="Edit Quiz"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteQuiz(quiz)}
                                className="w-8 h-8 rounded-full bg-[#fbd4d4]/50 hover:bg-[#fbd4d4] text-[#600000] border border-[#e3c5c5] flex items-center justify-center transition-colors cursor-pointer"
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
              </div>

              {/* Mobile Card List View - 100% Responsive for Mobile */}
              <div className="block lg:hidden space-y-3">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="bg-white border border-[#c7cad5] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-[#1c1c1e] line-clamp-2 leading-snug">
                        {quiz.quizTitle}
                      </h3>
                      {quiz.approvalStatus === "Approved" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c3faf5] text-[#187574] border border-[#9eece4] text-[10px] font-bold shrink-0">
                          <CheckCircle className="w-3 h-3 text-[#187574]" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fff4c4] text-[#746019] border border-[#fde89c] text-[10px] font-bold shrink-0">
                          <Clock className="w-3 h-3 text-[#746019]" />
                          <span>{quiz.approvalStatus}</span>
                        </span>
                      )}
                    </div>

                    {quiz.description && (
                      <p className="text-xs text-[#555a6a] line-clamp-2 font-medium">
                        {quiz.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f7f8fa] p-3 rounded-xl border border-[#e6e8ec]">
                      <div>
                        <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Region / Board</span>
                        <span className="font-semibold text-[#1c1c1e] truncate block">{quiz.region || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Subject</span>
                        <span className="font-semibold text-[#1c1c1e] truncate block">{quiz.subject || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Class</span>
                        <span className="font-semibold text-[#1c1c1e] truncate block">{quiz.specificClass || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Questions</span>
                        <span className="font-semibold text-[#4262ff] truncate block">{quiz.totalQuestions} MCQs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e6e8ec]">
                      <button
                        type="button"
                        onClick={() => handleViewQuiz(quiz)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] text-xs font-bold hover:bg-[#f7f8fa] shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditQuiz(quiz)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f5f3ff] border border-[#4262ff]/30 text-[#4262ff] text-xs font-bold hover:bg-[#ece8ff] shadow-2xs cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(quiz)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#600000] border border-[#e3c5c5] text-xs font-bold shadow-2xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
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
