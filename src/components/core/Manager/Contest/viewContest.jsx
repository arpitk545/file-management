"use client"
import { useState, useEffect } from "react"
import {
  Trophy,
  MapPin,
  BookOpen,
  Users,
  Target,
  Calendar,
  ArrowLeft,
  Award,
  FileText,
  Timer,
  ImageIcon,
  Edit,
  CheckCircle,
  Loader2,
  Sparkles
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { getContestById } from "../../../../services/operations/contestAPI"

const ViewContest = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [contestDetails, setContestDetails] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchContestData = async () => {
      setLoading(true)
      try {
        const response = await getContestById(id)
        if (response?.success && response?.data) {
          setContestDetails(response.data)
          setQuestions(response.data.questions || [])
        } else {
          toast.error(response?.message || "Failed to fetch contest details")
        }
      } catch {
        toast.error("Failed to fetch contest details")
      } finally {
        setLoading(false)
      }
    }
    fetchContestData()
  }, [id])

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault()
      navigate("/filter-contest", { replace: true })
    }
    window.addEventListener("popstate", handleBackButton)
    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#050038]" />
        </div>
        <p className="text-sm font-bold text-[#050038]">Loading contest inspector...</p>
      </div>
    )
  }

  if (!contestDetails) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center max-w-md shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#fff8e0] text-[#746019] flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1c1c1e]">Contest not found</h2>
          <p className="text-xs text-[#555a6a]">The contest you are trying to inspect does not exist or has been removed.</p>
          <button
            onClick={() => navigate("/filter-contest")}
            className="inline-flex items-center gap-2 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] px-5 py-2.5 rounded-full text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Contests</span>
          </button>
        </div>
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
              onClick={() => navigate("/filter-contest")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Contests</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              CONTEST INSPECTOR
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              <Sparkles className="w-3.5 h-3.5" />
              {contestDetails.status || "Approved"}
            </span>
          </div>

          <button
            onClick={() => navigate(`/edit-contest/${id}`)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm active:scale-98 self-start sm:self-auto"
          >
            <Edit className="w-4 h-4 text-[#ffd02f]" />
            <span>Edit Contest</span>
          </button>
        </div>

        {/* Contest Header Information Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Thumbnail preview if available */}
            {contestDetails.thumbnail && (
              <div className="w-full lg:w-72 h-48 rounded-xl overflow-hidden border border-[#c7cad5] bg-[#f7f8fa] flex-shrink-0">
                <img
                  src={contestDetails.thumbnail}
                  alt={contestDetails.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#ffd02f] flex items-center justify-center text-[#1c1c1e]">
                  <Trophy className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Contest Title & Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1e] leading-tight">
                {contestDetails.title}
              </h1>
              <p className="text-sm text-[#555a6a] leading-relaxed">
                {contestDetails.description || "Academic contest challenge designed to evaluate conceptual clarity and problem-solving speed."}
              </p>

              {/* Taxonomy Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                {contestDetails.region && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] text-[#1c1c1e] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#555a6a]" />
                    <span>Region:</span> {contestDetails.region}
                  </span>
                )}
                {contestDetails.examType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4fbfb] border border-[#d2f3ee] text-[#187574] font-semibold">
                    <Award className="w-3.5 h-3.5 text-[#187574]" />
                    <span>Exam:</span> {contestDetails.examType}
                  </span>
                )}
                {contestDetails.specificClass && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf6fa] border border-[#f7d6ee] text-[#86296b] font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#86296b]" />
                    <span>Class:</span> {contestDetails.specificClass}
                  </span>
                )}
                {contestDetails.subject && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f8ff] border border-[#d6e4ff] text-[#2a41b6] font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-[#2a41b6]" />
                    <span>Subject:</span> {contestDetails.subject}
                  </span>
                )}
                {contestDetails.chapter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5fbf7] border border-[#cbeed7] text-[#136637] font-semibold">
                    <Target className="w-3.5 h-3.5 text-[#136637]" />
                    <span>Chapter:</span> {contestDetails.chapter}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff8e0] border border-[#fde89c] text-[#746019] font-bold">
                  <Trophy className="w-3.5 h-3.5 text-[#b8860b]" />
                  <span>Prize: ₹{contestDetails.prize || 0}</span>
                </span>
                {contestDetails.deadline && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] text-[#555a6a] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#555a6a]" />
                    <span>Deadline: {new Date(contestDetails.deadline).toLocaleDateString()}</span>
                  </span>
                )}
                {contestDetails.startTime && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] text-[#555a6a] font-medium">
                    <Timer className="w-3.5 h-3.5 text-[#555a6a]" />
                    <span>Start: {new Date(contestDetails.startTime).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#f5f3ff] text-[#4262ff] flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1c1c1e]">Contest Questions</h2>
                <p className="text-xs text-[#555a6a]">All curriculum challenges included in this competition</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe] text-xs font-bold">
              {questions.length} Questions
            </span>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-10 text-[#555a6a] space-y-2">
              <p className="text-sm font-semibold">No questions uploaded for this contest yet.</p>
              <button
                onClick={() => navigate(`/edit-contest/${id}`)}
                className="text-xs font-bold text-[#4262ff] underline hover:text-[#2a41b6]"
              >
                Add questions in edit mode
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id || index}
                  className="p-5 rounded-xl border border-[#e0e2e8] bg-[#fafbfc] hover:border-[#1c1c1e] transition-all space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#1c1c1e] text-[#ffd02f] font-black text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm sm:text-base font-bold text-[#1c1c1e] leading-snug">
                        {question.question}
                      </p>
                      {question.topic && (
                        <span className="inline-block text-[11px] font-semibold text-[#555a6a] bg-white border border-[#e0e2e8] px-2 py-0.5 rounded">
                          Topic: {question.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Diagram Image if present */}
                  {question.image && (
                    <div className="pl-10">
                      <div className="max-w-md rounded-xl overflow-hidden border border-[#c7cad5] bg-white p-2">
                        <img
                          src={question.image}
                          alt={`Question ${index + 1} diagram`}
                          className="w-full h-44 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(question.options || {}).map(([key, value], optIdx) => {
                      const isCorrect = key === question.correctAnswer
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                            isCorrect
                              ? "bg-[#c3faf5] border-2 border-[#187574] text-[#187574]"
                              : "bg-white border-[#e0e2e8] text-[#1c1c1e]"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect ? "bg-[#187574] text-white" : "bg-[#f7f8fa] border border-[#c7cad5] text-[#1c1c1e]"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-snug">{value}</span>
                          {isCorrect && <CheckCircle className="w-4 h-4 text-[#187574] shrink-0" />}
                        </div>
                      )
                    })}
                  </div>

                  {/* Correct answer indicator */}
                  <div className="pl-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c3faf5] border border-[#9eece4] text-xs font-bold text-[#187574]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Correct Answer: Option {question.correctAnswer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ViewContest

