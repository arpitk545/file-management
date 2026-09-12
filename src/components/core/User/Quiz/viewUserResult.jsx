"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Award,
  Home,
  RotateCcw,
  Send,
  Download,
  MessageSquareCode,
  ArrowLeft,
  Check,
  BookOpen,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import { getQuizSubmissionById } from "../../../../services/operations/quizAPI"
import { createComment, getAllComments } from "../../../../services/operations/commentAPI"

export default function UserQuizResult() {
  const { resultId } = useParams()
  const navigate = useNavigate()

  const [result, setResult] = useState(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [resultLoading, setResultLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [professionText, setProfessionText] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [approvedComments, setApprovedComments] = useState([])
  const [timeLeft, setTimeLeft] = useState(20 * 60)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [userName, setUserName] = useState("")
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false)

  // Load timeLeft from localStorage on initial render
  useEffect(() => {
    const savedTime = localStorage.getItem("quizResultTimeout")
    if (savedTime) {
      const remainingTime = Math.max(0, Math.floor((parseInt(savedTime) - Date.now()) / 1000))
      if (remainingTime > 0) {
        setTimeLeft(remainingTime)
      } else {
        localStorage.removeItem("quizResultTimeout")
      }
    }
  }, [])

  // Update localStorage and countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem("quizResultTimeout")
      return
    }

    localStorage.setItem("quizResultTimeout", (Date.now() + timeLeft * 1000).toString())

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          localStorage.removeItem("quizResultTimeout")
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    const fetchQuizResult = async () => {
      setResultLoading(true)
      try {
        const res = await getQuizSubmissionById(resultId)
        if (res?.data) {
          const resultData = res.data
          setResult(resultData)

          // Animate score
          const totalQ = resultData.total || resultData.details?.length || 0
          const correctQ = resultData.correctAnswers || 0
          const scorePercentage = totalQ ? Math.round((correctQ / totalQ) * 100) : 0

          setAnimatedScore(0)
          setTimeout(() => {
            const increment = scorePercentage / 50
            let currentScore = 0
            const interval = setInterval(() => {
              currentScore = Math.min(currentScore + increment, scorePercentage)
              setAnimatedScore(currentScore)
              if (currentScore >= scorePercentage) {
                clearInterval(interval)
              }
            }, 20)
            return () => clearInterval(interval)
          }, 400)
        } else {
          toast.error("No assessment result found")
        }
      } catch (err) {
        console.error("Error fetching quiz result:", err)
        toast.error("Failed to load result")
      } finally {
        setResultLoading(false)
      }
    }

    fetchQuizResult()
  }, [resultId])

  useEffect(() => {
    const fetchComments = async () => {
      if (!result?.quiz) return
      setCommentsLoading(true)

      try {
        const commentsRes = await getAllComments()
        if (commentsRes?.success) {
          const filteredComments = commentsRes.comments.comments
            .filter(
              (comment) =>
                comment.status === "approved" &&
                comment.category === "Quiz" &&
                String(comment.refId) === String(result.quiz)
            )
            .map((comment) => ({
              id: comment._id,
              content: comment.content,
              createdAt: comment.createdAt,
              userName: comment.userProfile?.name || "Anonymous",
              userAvatar: comment.userProfile?.avatar,
              initials: comment.userProfile?.initials || "",
              title: comment.title || "",
              rating: comment.rating || 0,
            }))

          setApprovedComments(filteredComments)
        } else {
          toast.error("Failed to fetch comments")
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [result])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!result?.quiz) {
      toast.error("Quiz not loaded yet. Please try again shortly.")
      return
    }

    if (!commentText.trim()) return toast.error("Please write a comment")
    if (userRating === 0) return toast.error("Please provide a star rating")

    setIsSubmittingComment(true)
    try {
      const commentPayload = {
        content: commentText,
        title: professionText.trim(),
        rating: userRating,
        category: "Quiz",
        refId: result.quiz,
      }

      const res = await createComment(commentPayload)
      if (res?.success) {
        toast.success("Comment submitted for review!")
        setCommentText("")
        setProfessionText("")
        setUserRating(0)
      } else {
        toast.error("Failed to submit comment")
      }
    } catch (error) {
      console.error("Comment error:", error)
      toast.error("Error submitting comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault()
      navigate("/view-user-quiz", { replace: true })
    }

    window.addEventListener("popstate", handleBackButton)
    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [navigate])

  const handleBackToDashboard = () => {
    navigate("/dashboard")
  }

  const handleRetakeQuiz = () => {
    navigate("/view-user-quiz")
  }

  const handlereviewanswer = () => {
    navigate(`/review-answer/${resultId}`)
  }

  const getPerformanceData = (percentage) => {
    if (percentage >= 90) {
      return {
        label: "Outstanding Performance",
        badgeBg: "bg-[#c3faf5]",
        badgeText: "text-[#187574]",
        circleColor: "#00b473",
        icon: Trophy,
        message: "Outstanding achievement! You have demonstrated complete mastery of this assessment.",
        emoji: "🏆",
      }
    } else if (percentage >= 70) {
      return {
        label: "Commendable Score",
        badgeBg: "bg-[#c3faf5]",
        badgeText: "text-[#187574]",
        circleColor: "#00b473",
        icon: Award,
        message: "Great effort! You possess a solid and proficient conceptual understanding.",
        emoji: "🎯",
      }
    } else if (percentage >= 50) {
      return {
        label: "Average Performance",
        badgeBg: "bg-[#fff8e0]",
        badgeText: "text-[#746019]",
        circleColor: "#ffd02f",
        icon: TrendingUp,
        message: "Satisfactory attempt. Targeted revision on incorrect topics will boost your performance.",
        emoji: "📈",
      }
    } else {
      return {
        label: "Needs Improvement",
        badgeBg: "bg-[#fbd4d4]",
        badgeText: "text-[#600000]",
        circleColor: "#600000",
        icon: RotateCcw,
        message: "Don't be discouraged! Review the answer key carefully, practice, and reattempt.",
        emoji: "💪",
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownloadCertificate = () => {
    setShowCertificateModal(true)
  }

  const generateCertificate = async () => {
    if (!userName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    setIsGeneratingCertificate(true)

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      const templateUrl = "/certificate-template.png"

      const addTemplate = () => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "Anonymous"
          img.src = templateUrl

          img.onload = function () {
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight)
            resolve()
          }

          img.onerror = function () {
            reject(new Error("Failed to load certificate template"))
          }
        })
      }

      await addTemplate()

      // Name
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(4, 19, 33)
      pdf.setFontSize(28)

      const userNameText = userName.toUpperCase()
      const userNameWidth =
        (pdf.getStringUnitWidth(userNameText) * pdf.internal.getFontSize()) / pdf.internal.scaleFactor
      const userNameX = (pdf.internal.pageSize.getWidth() - userNameWidth) / 2
      pdf.text(userNameText, userNameX, 105)

      // Paragraph
      pdf.setFont("times", "normal")
      pdf.setFontSize(14)
      pdf.setTextColor(4, 19, 33)

      const quizTitle = result?.quizTitle || "Quiz"
      const score = Math.round(animatedScore)
      const date = new Date().toLocaleDateString()

      const paragraph = `This certificate is proudly presented for successfully completing the ${quizTitle}, demonstrating commendable knowledge and skills. The candidate secured an overall score of ${score}%. Issued on ${date}, this performance reflects consistent effort, dedication, and professional competence.`

      const pageCenterX = pdf.internal.pageSize.getWidth() / 2
      const paragraphY = 125

      pdf.text(paragraph, pageCenterX, paragraphY, {
        align: "center",
        maxWidth: 220,
      })

      pdf.save(`Certificate-${userName}-${quizTitle}.pdf`)
      setIsGeneratingCertificate(false)
      setShowCertificateModal(false)
      setUserName("")
      toast.success("Certificate downloaded successfully!")
    } catch (error) {
      console.error("Error generating certificate:", error)
      setIsGeneratingCertificate(false)
      toast.error("Failed to generate certificate. Please try again.")
    }
  }

  const total = result?.total || result?.details?.length || 0
  const correct = result?.correctAnswers || 0
  const incorrect = result?.incorrectAnswers || 0
  const timeTaken = result?.timeTaken ?? "--"
  const scorePercentage = total ? Math.round((correct / total) * 100) : 0
  const timeEfficiency =
    timeTaken && timeTaken !== "--" && parseFloat(timeTaken) > 0
      ? (scorePercentage / parseFloat(timeTaken)).toFixed(1)
      : "--"
  const pace =
    timeTaken && timeTaken !== "--" && parseFloat(timeTaken) > 0
      ? (total / parseFloat(timeTaken)).toFixed(1)
      : "--"

  const performance = getPerformanceData(scorePercentage)
  const PerformanceIcon = performance.icon

  if (resultLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">
          Loading Assessment Result...
        </p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-[#eef0f3] max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#fbd4d4] text-[#600000] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-medium text-[#1c1c1e]">No Result Found</h2>
          <p className="text-xs text-[#555a6a]">
            We could not find assessment submission records for this ID.
          </p>
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="w-full py-3 px-6 rounded-full bg-[#1c1c1e] text-white text-xs font-medium hover:bg-[#2c2c34] transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6">
        {/* Floating Session Timeout Pill */}
        {timeLeft > 0 && (
          <div className="fixed top-4 right-4 z-40">
            <div className="bg-[#fff8e0] border border-[#ffd02f] text-[#746019] px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#746019]" />
              <span className="font-medium">Session:</span>
              <span className="font-mono font-semibold text-[#1c1c1e]">{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        <AnimatePresence>
          {showCertificateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="bg-white rounded-2xl border border-[#eef0f3] p-6 max-w-md w-full shadow-xl space-y-4"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-[#eef0f3]">
                  <div className="w-10 h-10 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-[#1c1c1e]">Download Certificate</h3>
                    <p className="text-xs text-[#555a6a]">Official verified PDF completion certificate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1e] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name as it should appear"
                      className="w-full h-11 px-3.5 border border-[#c7cad5] rounded-xl text-sm text-[#1c1c1e] focus:outline-none focus:border-[#1c1c1e]"
                      autoFocus
                    />
                  </div>

                  <div className="bg-[#fff8e0] border border-[#fde89c] rounded-xl p-3.5 text-xs text-[#746019] leading-relaxed">
                    Your certificate will include your verified name, quiz title, score ({Math.round(animatedScore)}%), and date of completion.
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCertificateModal(false)
                        setUserName("")
                      }}
                      className="flex-1 py-3 px-4 border border-[#c7cad5] text-[#1c1c1e] rounded-full text-xs font-medium hover:bg-[#f7f8fa] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={generateCertificate}
                      disabled={!userName.trim() || isGeneratingCertificate}
                      className="flex-1 py-3 px-4 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingCertificate ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#ffd02f]" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-[#ffd02f]" />
                          <span>Download Certificate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Top Header Bar */}
        <div className="bg-white rounded-2xl border border-[#eef0f3] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#c3faf5] text-[#187574] text-[10px] font-semibold uppercase tracking-wider shrink-0">
                  COMPLETED ASSESSMENT
                </span>
                <span className="text-xs text-[#555a6a]">
                  Submitted Successfully
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-medium text-[#1c1c1e] truncate leading-snug">
                {result.quizTitle || "Quiz Assessment Report"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Home className="w-3.5 h-3.5 text-[#ffd02f]" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handleRetakeQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#ffd02f]" />
              <span>Explore Quizzes</span>
            </button>
          </div>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-2xl border border-[#eef0f3] p-6 sm:p-8 space-y-8 shadow-none">
          {/* Header Summary & Radial Score */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#eef0f3]">
            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-2xl">{performance.emoji}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${performance.badgeBg} ${performance.badgeText}`}>
                  {performance.label}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#1c1c1e] leading-tight">
                Quiz Result Summary
              </h2>
              <p className="text-sm text-[#555a6a] max-w-xl leading-relaxed">
                {performance.message}
              </p>
            </div>

            {/* Score Ring */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#eef0f3"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={performance.circleColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "251.2 251.2", strokeDashoffset: "251.2" }}
                  animate={{
                    strokeDashoffset: `${251.2 - (animatedScore / 100) * 251.2}`,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ strokeDasharray: "251.2 251.2" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-semibold text-[#1c1c1e] tracking-tight">
                  {Math.round(animatedScore)}%
                </span>
                <span className="text-[10px] sm:text-xs text-[#555a6a] font-medium uppercase tracking-wider">
                  Final Score
                </span>
              </div>
            </div>
          </div>

          {/* 4 Performance Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Questions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#f7f8fa] border border-[#eef0f3] flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">Total Questions</span>
                <div className="w-7 h-7 rounded-lg bg-white border border-[#eef0f3] flex items-center justify-center text-[#1c1c1e]">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-semibold text-[#1c1c1e]">{total}</span>
            </div>

            {/* Correct Answers */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#c3faf5]/40 border border-[#0fbcb0]/20 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#187574]">Correct</span>
                <div className="w-7 h-7 rounded-lg bg-white border border-[#0fbcb0]/25 flex items-center justify-center text-[#00b473]">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-semibold text-[#187574]">{correct}</span>
            </div>

            {/* Incorrect Answers */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fbd4d4]/40 border border-[#e3c5c5] flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#600000]">Incorrect</span>
                <div className="w-7 h-7 rounded-lg bg-white border border-[#e3c5c5] flex items-center justify-center text-[#600000]">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-semibold text-[#600000]">{incorrect}</span>
            </div>

            {/* Time Taken */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fff8e0] border border-[#ffd02f]/40 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#746019]">Time Taken</span>
                <div className="w-7 h-7 rounded-lg bg-white border border-[#ffd02f]/40 flex items-center justify-center text-[#746019]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-semibold text-[#746019]">{timeTaken}m</span>
            </div>
          </div>

          {/* Efficiency Analytics Box */}
          <div className="bg-[#fafbfc] border border-[#eef0f3] rounded-2xl p-5 sm:p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1e] mb-4 text-center sm:text-left">
              Assessment Analytics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-[#eef0f3]">
              <div className="sm:pr-4">
                <span className="text-xs text-[#555a6a]">Accuracy Rate</span>
                <div className="text-xl font-semibold text-[#1c1c1e] mt-1">{scorePercentage}%</div>
              </div>
              <div className="pt-3 sm:pt-0 sm:px-4">
                <span className="text-xs text-[#555a6a]">Time Efficiency</span>
                <div className="text-xl font-semibold text-[#1c1c1e] mt-1">
                  {timeEfficiency !== "--" ? `${timeEfficiency}%/min` : "--"}
                </div>
              </div>
              <div className="pt-3 sm:pt-0 sm:pl-4">
                <span className="text-xs text-[#555a6a]">Answering Pace</span>
                <div className="text-xl font-semibold text-[#1c1c1e] mt-1">
                  {pace !== "--" ? `${pace} Qs/min` : "--"}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Interactive Action Buttons (Distinct Dark Colors) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* 1. Review Answers (Deep Charcoal / Black) */}
            <button
              type="button"
              onClick={handlereviewanswer}
              className="py-3.5 px-5 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full"
            >
              <MessageSquareCode className="w-4 h-4 text-[#ffd02f]" />
              <span>Review Answers</span>
            </button>

            {/* 2. Download Certificate (Deep Moss / Emerald Green) */}
            <button
              type="button"
              onClick={handleDownloadCertificate}
              className="py-3.5 px-5 bg-[#187574] hover:bg-[#115655] text-white text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full"
            >
              <Download className="w-4 h-4 text-[#c3faf5]" />
              <span>Download Certificate</span>
            </button>

            {/* 3. Retake / Attempt Another (Deep Royal / Cobalt Blue) */}
            <button
              type="button"
              onClick={handleRetakeQuiz}
              className="py-3.5 px-5 bg-[#2a41b6] hover:bg-[#1e308c] text-white text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full"
            >
              <RotateCcw className="w-4 h-4 text-[#ffd02f]" />
              <span>Attempt Another</span>
            </button>

            {/* 4. Dashboard (Deep Golden Amber / Bronze) */}
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="py-3.5 px-5 bg-[#746019] hover:bg-[#5b4a11] text-white text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full"
            >
              <Home className="w-4 h-4 text-[#fff4c4]" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Feedback & Comments Section */}
        <div className="bg-white rounded-2xl border border-[#eef0f3] p-6 sm:p-8 space-y-6 shadow-none">
          <div className="flex items-center justify-between pb-4 border-b border-[#eef0f3]">
            <div>
              <h2 className="text-base sm:text-lg font-medium text-[#1c1c1e]">
                Discussion & Feedback
              </h2>
              <p className="text-xs text-[#555a6a]">
                Share your review and rating for this assessment
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f7f8fa] text-[#555a6a] border border-[#eef0f3]">
              {approvedComments.length} Comments
            </span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4 bg-[#fafbfc] border border-[#eef0f3] p-4 sm:p-5 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profession" className="block text-xs font-semibold text-[#1c1c1e] uppercase tracking-wider mb-1.5">
                  Profession / Role
                </label>
                <input
                  id="profession"
                  type="text"
                  className="w-full h-10 px-3.5 border border-[#c7cad5] rounded-xl text-xs sm:text-sm text-[#1c1c1e] bg-white focus:outline-none focus:border-[#1c1c1e]"
                  placeholder="e.g. Student, Engineer, Educator"
                  value={professionText}
                  onChange={(e) => setProfessionText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1e] uppercase tracking-wider mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5 h-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= userRating
                            ? "fill-[#ffd02f] text-[#ffd02f]"
                            : "text-[#c7cad5]"
                        }`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="text-xs text-[#746019] font-medium ml-2">
                      {userRating} of 5 Stars
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="commentText" className="block text-xs font-semibold text-[#1c1c1e] uppercase tracking-wider mb-1.5">
                Your Review
              </label>
              <textarea
                id="commentText"
                className="w-full p-3.5 border border-[#c7cad5] rounded-xl text-xs sm:text-sm text-[#1c1c1e] bg-white focus:outline-none focus:border-[#1c1c1e] resize-y min-h-[80px]"
                placeholder="Share your thoughts on the difficulty, coverage, and quality of this quiz..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim() || userRating === 0 || isSubmittingComment}
                className="py-2.5 px-6 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#ffd02f]" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#ffd02f]" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3.5">
            {commentsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
                <span className="ml-2 text-xs text-[#555a6a]">Loading reviews...</span>
              </div>
            ) : approvedComments.length > 0 ? (
              approvedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3.5 bg-[#fafbfc] border border-[#eef0f3] p-4 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-semibold text-xs flex items-center justify-center shrink-0">
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      comment.userName?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1c1c1e]">{comment.userName}</span>
                        {comment.title && (
                          <span className="text-[11px] text-[#555a6a] bg-white border border-[#eef0f3] px-2 py-0.5 rounded-full">
                            {comment.title}
                          </span>
                        )}
                      </div>
                      {comment.createdAt && (
                        <span className="text-[11px] text-[#555a6a]">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {comment.rating > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < comment.rating
                                ? "fill-[#ffd02f] text-[#ffd02f]"
                                : "text-[#c7cad5]"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-[#1c1c1e] leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#555a6a]">
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}