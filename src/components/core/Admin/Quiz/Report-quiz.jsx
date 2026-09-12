"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PenLine, ArrowLeft, AlertCircle, Sparkles, MessageSquare, CheckCircle, ShieldAlert } from "lucide-react"
import { getAllQuizzesWithCategoryAndQuestions } from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading Issue Reports..." }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div className="relative flex items-center justify-center mb-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute w-3 h-3 rounded-full bg-[#ffd02f]" />
    </div>
    <p className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</p>
  </div>
)

export default function QuizReport() {
  const navigate = useNavigate()
  const [reportedRows, setReportedRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQuizzesWithCategoryAndQuestions()
        const allQuizzes = response?.data || []

        const createQuizOnly = allQuizzes.filter(
          (quiz) => quiz?.category?.quizType === "createquiz"
        )

        let idx = 1
        const rows = []
        createQuizOnly.forEach((quiz) => {
          quiz.questions?.forEach((q) => {
            q.reports?.forEach((r) => {
              rows.push({
                sNo: idx++,
                questionId: q._id,
                questionText: q.text,
                description: r.description,
                submittedAt: r.submittedAt,
                reportId: r._id || `${q._id}-${idx}`,
                quizId: quiz._id,
                quizTitle: quiz.category?.quizTitle || quiz.fileTitle || "Quiz",
              })
            })
          })
        })

        setReportedRows(rows)
      } catch (err) {
        toast.error("Failed to load reports")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleEdit = (row) => {
    if (row.quizId) {
      navigate(`/update-quiz/${row.quizId}`)
    } else {
      toast.error("Quiz ID not found")
    }
  }

  if (isLoading) {
    return <MiroLoader message="Loading Issue Reports..." />
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full space-y-6">
        
        {/* Posts-Style Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e0e2e8] bg-white text-xs font-bold text-[#1c1c1e] hover:border-[#1c1c1e] shadow-xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#555a6a]" />
              Dashboard
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-bold tracking-wide uppercase shadow-xs">
              <ShieldAlert className="w-3 h-3 text-[#1c1c1e]" />
              Moderation Queue
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe6cd] text-[#b43b12] text-[11px] font-bold">
              <AlertCircle className="w-3 h-3 text-[#ff7347]" />
              Quiz Audit
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#555a6a]">
              Total Reports: <span className="text-[#1c1c1e] font-black">{reportedRows.length}</span>
            </span>
          </div>
        </div>

        {/* Banner Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1c1c1e] tracking-tight">Reported Quiz Questions</h1>
          <p className="text-xs sm:text-sm font-medium text-[#555a6a] mt-1">
            Review student and candidate reports to resolve typos, answer discrepancies, or formatting issues.
          </p>
        </div>

        {/* Main Reports Card */}
        <div className="bg-white border border-[#e0e2e8] rounded-2xl shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#fff8e0] to-white border-b border-[#e0e2e8] px-5 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-black text-[#1c1c1e]">
                Open Question Reports ({reportedRows.length})
              </h2>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e0e2e8] bg-[#f7f8fa] text-[11px] font-bold uppercase tracking-wider text-[#555a6a]">
                  <th className="py-3 px-4 w-16 text-center">#</th>
                  <th className="py-3 px-4 w-1/4">Quiz Title</th>
                  <th className="py-3 px-4 w-2/5">Question Text</th>
                  <th className="py-3 px-4">Report Details</th>
                  <th className="py-3 px-4 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e2e8]">
                <AnimatePresence>
                  {reportedRows.map((row) => (
                    <tr key={row.reportId} className="hover:bg-[#fafbff] transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <span className="w-6 h-6 rounded-md bg-[#f7f8fa] border border-[#e0e2e8] inline-flex items-center justify-center text-xs font-bold text-[#1c1c1e]">
                          {row.sNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-[#1c1c1e]">
                        {row.quizTitle}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#1c1c1e]">
                        <p className="line-clamp-2 leading-relaxed">{row.questionText || "Untitled question"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#1c1c1e]">
                        <div className="p-2.5 rounded-xl bg-[#fff8e0] border border-[#ffd02f]/40">
                          <p className="font-semibold text-xs text-[#1c1c1e]">{row.description || "No description provided"}</p>
                          {row.submittedAt && (
                            <p className="text-[10px] text-[#555a6a] mt-1">
                              Reported: {new Date(row.submittedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#f0c224] text-[#1c1c1e] font-bold text-xs shadow-xs transition-all active:scale-95"
                          title="Edit Quiz"
                        >
                          <PenLine className="h-3 w-3" />
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </AnimatePresence>

                {reportedRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-xs font-bold text-[#555a6a]">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-[#0fbcb0]" />
                      No pending reports! All quiz questions are verified.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards Fallback View */}
          <div className="space-y-3 p-4 md:hidden">
            {reportedRows.map((row) => (
              <div
                key={row.reportId}
                className="rounded-xl border border-[#e0e2e8] bg-white p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                    Report #{row.sNo}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#f0c224] text-[#1c1c1e] font-bold text-xs shadow-xs active:scale-95"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    <span>Resolve</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#555a6a] mb-0.5">
                    {row.quizTitle}
                  </h4>
                  <p className="text-xs font-bold text-[#1c1c1e] leading-relaxed">
                    {row.questionText || "Untitled question"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#fff8e0] border border-[#ffd02f]/40 text-xs">
                  <span className="font-bold text-[#1c1c1e] block mb-0.5">Issue Reported:</span>
                  <p className="text-[#555a6a] text-xs font-medium">{row.description || "No description"}</p>
                </div>
              </div>
            ))}

            {reportedRows.length === 0 && (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#e0e2e8] bg-[#f7f8fa]">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-[#0fbcb0]" />
                <p className="text-xs font-bold text-[#1c1c1e]">No question reports found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}