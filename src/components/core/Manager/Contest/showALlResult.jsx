"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { getallContestResult } from "../../../../services/operations/contestAPI" 
import {
  Trophy,
  ArrowLeft,
  Users,
  Award,
  Calendar,
  Sparkles,
  Loader2
} from "lucide-react"

export default function ShowALLResult() {
  const { id } = useParams() 
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const response = await getallContestResult(id)
        if (response?.success && Array.isArray(response.data)) {
          // Sort results by score descending
          const sorted = [...response.data].sort((a, b) => (b.score || 0) - (a.score || 0))
          setResults(sorted)
        } else {
          toast.error("Failed to fetch contest results or no results found.")
          setResults([])
        }
      } catch (error) {
        console.error("Error fetching contest results:", error)
        toast.error("Error loading contest results.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResults()
    } else {
      setLoading(false)
      toast.error("No contest ID provided.")
    }
  }, [id])

  const handleBack = () => {
    navigate("/filter-contest")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#050038]" />
        </div>
        <p className="text-sm font-bold text-[#050038]">Loading contest results & leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Contests</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              CONTEST LEADERBOARD
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              <Sparkles className="w-3.5 h-3.5" />
              SUBMISSION RESULTS
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
            {results.length} Total Submissions
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Contest Submissions & Scores
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Review all participant scores, accuracy, and performance ranks for this contest challenge.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6">
          {results.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#fff8e0] border border-[#fde89c] text-[#746019] flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1c1c1e]">No results found for this contest</h3>
                <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
                  No students have completed their submissions for this contest yet.
                </p>
              </div>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Contests Directory</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#e0e2e8] bg-[#f7f8fa] text-[#555a6a] text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Rank</th>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4 text-center">Score</th>
                      <th className="py-3.5 px-4 text-center">Questions</th>
                      <th className="py-3.5 px-4 text-right">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e2e8]">
                    {results.map((result, index) => {
                      const isTop3 = index < 3
                      return (
                        <tr key={index} className="hover:bg-[#fafbfc] transition-colors">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                                index === 0
                                  ? "bg-[#ffd02f] text-[#050038] shadow-xs"
                                  : index === 1
                                  ? "bg-[#e0e2e8] text-[#1c1c1e]"
                                  : index === 2
                                  ? "bg-[#ffe6cd] text-[#805000]"
                                  : "bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={result.image || "/placeholder.svg?height=40&width=40&query=user+avatar"}
                                alt={result.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#c7cad5]"
                              />
                              <span className="font-bold text-[#1c1c1e]">{result.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[#555a6a] font-mono text-xs">{result.email}</td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                              <Award className="w-3.5 h-3.5" />
                              {result.score} pts
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap text-[#555a6a] font-semibold">
                            {result.totalQuestions} items
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap text-xs text-[#555a6a]">
                            {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : "—"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-[#fafbfc] border border-[#e0e2e8] rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[#1c1c1e] text-[#ffd02f] font-black text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <img
                          src={result.image || "/placeholder.svg?height=40&width=40&query=user+avatar"}
                          alt={result.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#c7cad5]"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-[#1c1c1e]">{result.name}</h3>
                          <p className="text-xs text-[#555a6a] font-mono">{result.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                        {result.score} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#e0e2e8] text-xs text-[#555a6a]">
                      <span>Questions: {result.totalQuestions}</span>
                      <span>{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}