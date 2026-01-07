"use client"

import { useEffect, useState } from "react"
import { PenLine } from "lucide-react"
import { getAllQuizzesWithCategoryAndQuestions } from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export default function QuizReport() {
  const navigate = useNavigate()
  const [reportedRows, setReportedRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 🔄 Fetch real data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQuizzesWithCategoryAndQuestions()
        const allQuizzes = response?.data || []

        const createQuizOnly = allQuizzes.filter(
          (quiz) => quiz?.category?.quizType === "createquiz"
        )

        // Flatten reports from questions
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
                quizId: quiz._id 
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
    // Use the quizId from the row data, and if not found, don't navigate
    if (row.quizId) {
      navigate(`/update-quiz/${row.quizId}`)
    } else {
      toast.error("Quiz ID not found")
      // Stay on the same page - no navigation happens
      console.warn("Quiz ID not available for editing")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <main className="fixed inset-0 overflow-auto scroll-smooth bg-gradient-to-br from-white to-cyan-50">
        <section className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
          <div className="flex items-center justify-center">
            <div className="text-lg text-cyan-700">Loading reports...</div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="fixed inset-0 overflow-auto scroll-smooth bg-gradient-to-br from-white to-cyan-50">
      <section className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-pretty text-2xl font-bold tracking-tight text-black md:text-3xl">Quiz Reports</h1>
            <p className="mt-1 text-sm text-black/70">Review reported questions and refine your quiz quality.</p>
          </div>
          <button
            type="button"
            onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
            className="inline-flex items-center rounded-md border border-cyan-400 bg-white px-3 py-2 text-sm font-medium text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-md active:translate-y-0"
            aria-label="Go back"
          >
            ← Back
          </button>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-xl border border-cyan-200/70 bg-white/90 p-4 shadow-md backdrop-blur-sm md:p-6">
          {/* Table (md+) */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-cyan-200/70 bg-cyan-50/60">
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-cyan-700">S.no</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-cyan-700">Question</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                      Description
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-cyan-700">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedRows.map((row) => (
                    <tr key={row.reportId} className="group border-b border-cyan-100/80 transition hover:bg-cyan-50/70">
                      <td className="px-3 py-3 text-sm font-medium text-black">{row.sNo}</td>
                      <td className="px-3 py-3 text-sm text-black">{row.questionText || "Untitled question"}</td>
                      <td className="px-3 py-3 text-sm text-black/80">{row.description || "No description"}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="inline-flex items-center gap-2 rounded-md border border-cyan-400 bg-white px-3 py-1.5 text-sm font-medium text-cyan-700 shadow-sm transition group-hover:-translate-y-0.5 hover:bg-cyan-100 hover:shadow-md active:translate-y-0"
                          aria-label={`Edit report ${row.sNo}`}
                          title="Edit"
                        >
                          <PenLine className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {reportedRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-black/60">
                        No reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (mobile) */}
          <div className="space-y-3 md:hidden">
            {reportedRows.map((row) => (
              <div
                key={row.reportId}
                className="rounded-lg border border-cyan-200/70 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">#{row.sNo}</div>
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400 bg-white px-2.5 py-1.5 text-xs font-medium text-cyan-700 shadow-sm transition hover:bg-cyan-100"
                    aria-label={`Edit report ${row.sNo}`}
                    title="Edit"
                  >
                    <PenLine className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-medium text-black">{row.questionText || "Untitled question"}</div>
                  <p className="mt-1 text-sm text-black/80">{row.description || "No description"}</p>
                </div>
              </div>
            ))}

            {reportedRows.length === 0 && (
              <div className="rounded-lg border border-cyan-200/70 bg-white p-4 text-center text-sm text-black/70">
                No reports found.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}