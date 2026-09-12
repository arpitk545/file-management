"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import {
  MapPin,
  Clock,
  Target,
  User,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  FileText,
  ArrowLeft,
  Sparkles,
  Check,
  XCircle,
  Layers,
  BookOpen,
} from "lucide-react"
import { getQuizById, deleteQuizById, updateApprovalStatusById } from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"

const MiroLoader = ({ message = "Loading quiz details..." }) => (
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

export default function ShowQuestions() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true)
      try {
        const response = await getQuizById(id)
        setQuiz(response.data)
      } catch (err) {
        console.error("Failed to load quiz:", err)
        setError("Failed to load quiz details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadQuiz()
    }
  }, [id])

  const handleEdit = () => {
    navigate(`/update-quiz/${id}`)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this quiz?")
    if (!confirmed) return
    try {
      await deleteQuizById(id)
      toast.success("Quiz deleted successfully!")
      navigate("/view-quiz")
    } catch (err) {
      console.error("Failed to delete quiz:", err)
      toast.error("Failed to delete quiz")
    }
  }

  const handleBack = () => {
    navigate("/view-quiz")
  }

  const handleApprovalStatus = async (status) => {
    try {
      await updateApprovalStatusById(id, status)
      setQuiz((prev) => ({
        ...prev,
        category: {
          ...prev.category,
          approvalStatus: status,
        },
      }))
      toast.success(`Quiz status updated to ${status}`)
    } catch (err) {
      console.error("Failed to update approval status:", err)
      toast.error("Failed to update approval status")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
      case "Waiting for Approval":
        return "bg-[#fff8e0] text-[#746019] border border-[#fde89c]"
      case "Rejected":
        return "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
      default:
        return "bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]"
    }
  }

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
      case "Hard":
        return "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
      default:
        return "bg-[#fff8e0] text-[#746019] border border-[#fde89c]"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <MiroLoader message="Retrieving quiz and questions..." />
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-6 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#fbd4d4] flex items-center justify-center text-red-500">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Quiz Not Found</h2>
        <p className="text-sm text-[#555a6a]">{error || "The requested quiz could not be located."}</p>
        <button
          onClick={handleBack}
          className="px-6 py-2.5 rounded-full bg-[#1c1c1e] text-white text-sm font-bold shadow-sm"
        >
          Back to Directory
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Posts Pattern) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              QUIZ STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
              QUIZ INSPECTOR
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleEdit}
              className="px-5 py-2.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Quiz</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-full bg-[#fbd4d4] hover:bg-[#f8b4b4] text-[#800000] border border-[#e3c5c5] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
              {quiz.category?.quizTitle || quiz.fileTitle || "Quiz Overview"}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(quiz.category?.approvalStatus)}`}>
              {quiz.category?.approvalStatus || "Approved"}
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Review compiled question sets, curriculum categorization, and moderation status.
          </p>
        </div>

        {/* Step 1 Card: Overview & Metadata (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-5 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Curriculum & Parameters</h2>
            </div>

            {/* Moderation Controls */}
            <div className="flex items-center gap-2">
              {quiz.category?.approvalStatus !== "Approved" && (
                <button
                  onClick={() => handleApprovalStatus("Approved")}
                  className="px-4 py-1.5 rounded-full bg-[#c3faf5] hover:bg-[#0fbcb0] text-[#187574] hover:text-white border border-[#9eece4] text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Quiz</span>
                </button>
              )}
              {quiz.category?.approvalStatus !== "Rejected" && (
                <button
                  onClick={() => handleApprovalStatus("Rejected")}
                  className="px-4 py-1.5 rounded-full bg-[#fbd4d4] hover:bg-[#f8b4b4] text-[#800000] border border-[#e3c5c5] text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-3 rounded-xl bg-white border border-[#ddd6fe] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#746019] block">Region</span>
              <span className="font-bold text-sm text-[#1c1c1e]">{quiz.category?.region || "—"}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#ddd6fe] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#187574] block">Exam Type</span>
              <span className="font-bold text-sm text-[#1c1c1e]">{quiz.category?.examType || "—"}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#ddd6fe] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86296b] block">Class</span>
              <span className="font-bold text-sm text-[#1c1c1e]">{quiz.category?.specificClass || "—"}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#ddd6fe] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7c3a00] block">Subject</span>
              <span className="font-bold text-sm text-[#1c1c1e]">{quiz.category?.subject || "—"}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#ddd6fe] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff] block">Chapter</span>
              <span className="font-bold text-sm text-[#1c1c1e]">{quiz.category?.chapter || "All"}</span>
            </div>
          </div>

          {/* Cover Thumbnail if present */}
          {quiz.category?.thumbnailimage && (
            <div className="p-4 bg-white rounded-xl border border-[#ddd6fe] flex items-center gap-4">
              <img
                src={quiz.category.thumbnailimage}
                alt="Quiz cover"
                className="w-20 h-20 object-cover rounded-lg border border-[#ddd6fe]"
              />
              <div>
                <p className="font-bold text-sm text-[#1c1c1e]">Cover Thumbnail</p>
                <p className="text-xs text-[#555a6a]">{quiz.description || "No description provided"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Questions List Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#0fbcb0]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                Compiled Questions ({quiz.questions?.length || 0})
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
              Duration: {quiz.category?.duration || 30} mins
            </span>
          </div>

          <div className="space-y-4">
            {quiz.questions && quiz.questions.length > 0 ? (
              quiz.questions.map((question, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-[#e0e2e8] p-5 sm:p-6 space-y-4 shadow-sm hover:border-[#c7cad5] transition-all"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#ffd02f] rounded-full flex items-center justify-center font-bold text-xs text-[#1c1c1e] shadow-xs">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-sm text-[#1c1c1e]">Question #{index + 1}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getDifficultyBadge(question.difficulty)}`}>
                      {question.difficulty || "Average"}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-[#1c1c1e] leading-relaxed">
                    {question.text}
                  </p>

                  {question.image && (
                    <div className="p-2 bg-[#f7f8fa] rounded-xl border border-[#e0e2e8] max-w-sm">
                      <img src={question.image} alt="Diagram" className="max-h-40 object-contain mx-auto rounded-lg" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                    {Object.entries(question.options || {}).map(([key, val]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border flex items-center gap-2 ${
                          question.correctAnswer === key
                            ? "bg-[#c3faf5]/30 border-[#0fbcb0] text-[#00655d] font-bold"
                            : "bg-[#f7f8fa] border-[#e0e2e8] text-[#1c1c1e]"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          question.correctAnswer === key ? "bg-[#0fbcb0] text-white" : "bg-white text-[#555a6a] border border-[#c7cad5]"
                        }`}>
                          {key}
                        </span>
                        <span className="truncate">{val}</span>
                      </div>
                    ))}
                  </div>

                  {question.note && (
                    <div className="p-3 bg-[#ffe6cd]/30 rounded-xl border border-[#fcd0a1] text-xs text-[#7c3a00]">
                      <span className="font-bold">Explanation Note:</span> {question.note}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-[#c7cad5] rounded-xl">
                <FileText className="w-10 h-10 text-[#8e91a0] mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#1c1c1e]">No questions in this quiz</h3>
                <p className="text-xs text-[#555a6a] mt-1">Use the Edit Quiz button to add questions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}