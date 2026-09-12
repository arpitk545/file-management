"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Timer,
  BookOpen,
  Target,
  X,
  Bookmark,
  RotateCcw,
  Flag,
  HelpCircle,
  ArrowLeft,
  Clock,
  Check,
  Loader2,
} from "lucide-react"
import { getQuizById, submitQuiz } from "../../../../services/operations/quizAPI"
import { UnauthenticatedModal } from "../../../ui/playquizmodel"

export default function PlayQuiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quizData, setQuizData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState({})
  const [visited, setVisited] = useState({ 0: true })
  const [timeLeft, setTimeLeft] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [timeTaken, setTimeTaken] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Fetch quiz and restore progress
  useEffect(() => {
    const fetchQuizAndProgress = async () => {
      try {
        const res = await getQuizById(quizId)
        const quiz = res?.data
        if (!quiz?.questions?.length) {
          toast.error("Quiz has no questions.")
          return
        }

        const duration = quiz?.category?.duration ?? 0
        setQuizData(quiz)

        const savedProgress = JSON.parse(localStorage.getItem(`quiz_${quizId}_progress`))
        const now = Date.now()

        if (savedProgress) {
          const elapsed = Math.floor((now - savedProgress.startTime) / 1000)
          const remaining = Math.max(0, duration * 60 - elapsed)

          setAnswers(savedProgress.answers || {})
          setMarkedForReview(savedProgress.markedForReview || {})
          setVisited(savedProgress.visited || { 0: true })
          setCurrentQuestion(savedProgress.currentQuestion || 0)
          setTimeLeft(remaining)
          setStartTime(savedProgress.startTime)
        } else {
          setTimeLeft(duration * 60)
          setStartTime(now)

          localStorage.setItem(
            `quiz_${quizId}_progress`,
            JSON.stringify({
              answers: {},
              markedForReview: {},
              visited: { 0: true },
              currentQuestion: 0,
              startTime: now,
            })
          )
        }
      } catch (err) {
        toast.error("Failed to load quiz. Please try again.")
      }
    }

    if (quizId) fetchQuizAndProgress()
  }, [quizId])

  // Track visited questions
  useEffect(() => {
    setVisited((prev) => ({
      ...prev,
      [currentQuestion]: true,
    }))
  }, [currentQuestion])

  // Save progress to localStorage
  useEffect(() => {
    if (quizId && quizData && startTime) {
      localStorage.setItem(
        `quiz_${quizId}_progress`,
        JSON.stringify({
          answers,
          markedForReview,
          visited,
          currentQuestion,
          startTime,
        })
      )
    }
  }, [answers, markedForReview, visited, currentQuestion, quizId, quizData, startTime])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && startTime) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1

          if (newTime <= 0) {
            const totalTime = (quizData?.category?.duration ?? 0) * 60
            setTimeTaken(totalTime)
          }

          return newTime
        })
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted && quizData) {
      handleAutoSubmit()
    }
  }, [timeLeft, isSubmitted, quizData, startTime])

  const handleAutoSubmit = async () => {
    setIsSubmitted(true)
    setShowSubmitModal(false)

    try {
      const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedIndex]) => ({
        questionIndex: parseInt(questionIndex),
        selectedOption: String.fromCharCode(65 + selectedIndex),
      }))

      const totalTime = (quizData.category?.duration ?? 0) * 60
      const timeTakenMinutes = (totalTime / 60).toFixed(2)
      setTimeTaken(parseFloat(timeTakenMinutes))

      const response = await submitQuiz(quizId, {
        answers: formattedAnswers,
        timeTaken: parseFloat(timeTakenMinutes),
      })

      if (response.success) {
        toast.success(response.message || "Submitted successfully!")
        localStorage.removeItem(`quiz_${quizId}_progress`)
        const resultId = response.data?.resultId
        if (!resultId) {
          toast.error("Result ID missing in response")
          return
        }
        navigate(`/quiz-result/${resultId}`)
      } else {
        toast.error(response.message || "Submission failed")
      }
    } catch (err) {
      console.error("Error submitting quiz:", err)
      toast.error("Something went wrong during submission")
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (optionIndex) => {
    setAnswers((prev) => {
      // Toggle unselect if clicking the already selected option
      if (prev[currentQuestion] === optionIndex) {
        const newAnswers = { ...prev }
        delete newAnswers[currentQuestion]
        return newAnswers
      }
      return {
        ...prev,
        [currentQuestion]: optionIndex,
      }
    })
  }

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const newAnswers = { ...prev }
      delete newAnswers[currentQuestion]
      return newAnswers
    })
  }

  const handleToggleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion]: !prev[currentQuestion],
    }))
  }

  const handleMarkAndNext = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion]: true,
    }))
    if (currentQuestion < (quizData?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < (quizData?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitted(true)
    setShowSubmitModal(false)

    const now = Date.now()
    const elapsedSeconds = Math.floor((now - startTime) / 1000)
    const totalTime = (quizData.category?.duration ?? 0) * 60
    const actualTimeTaken = Math.min(elapsedSeconds, totalTime)
    const timeTakenMinutes = (actualTimeTaken / 60).toFixed(2)
    setTimeTaken(parseFloat(timeTakenMinutes))

    try {
      const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedIndex]) => ({
        questionIndex: parseInt(questionIndex),
        selectedOption: String.fromCharCode(65 + selectedIndex),
      }))

      const response = await submitQuiz(quizId, {
        answers: formattedAnswers,
        timeTaken: parseFloat(timeTakenMinutes),
      })

      if (response.success) {
        toast.success(response.message || "Submitted successfully!")
        localStorage.removeItem(`quiz_${quizId}_progress`)
        const resultId = response.data?.resultId
        if (!resultId) {
          toast.error("Result ID missing in response")
          return
        }
        navigate(`/quiz-result/${resultId}`)
      } else {
        toast.error(response.message || "Submission failed")
      }
    } catch (err) {
      console.error("Error submitting quiz:", err)
      toast.error("Something went wrong during submission")
    }
  }

  const getTimeColor = () => {
    if (!quizData) return "text-[#1c1c1e]"
    const totalSecs = (quizData.category?.duration || 30) * 60
    const percentage = (timeLeft / (totalSecs || 1)) * 100
    if (percentage > 50) return "text-[#00b473]"
    if (percentage > 20) return "text-[#746019]"
    return "text-[#600000]"
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setShowLoginModal(true)
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      if (!isSubmitted) {
        setShowSubmitModal(true)
        window.history.pushState(null, "", window.location.href)
      }
    }

    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isSubmitted])

  const handleCancelQuiz = () => {
    setShowCancelModal(true)
  }

  const confirmCancel = () => {
    localStorage.removeItem(`quiz_${quizId}_progress`)
    setShowCancelModal(false)
    navigate("/view-user-quiz")
  }

  if (showLoginModal) {
    return <UnauthenticatedModal quizTitle="this quiz" onClose={() => setShowLoginModal(false)} />
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">
          Loading test assessment...
        </p>
      </div>
    )
  }

  const currentQ = quizData?.questions?.[currentQuestion]
  const totalQuestions = quizData?.questions?.length || 0

  // Question Statistics Breakdown (5 States + Total)
  // 1. Answered: Has answer AND not marked for review
  // 2. Answered & Marked: Has answer AND marked for review
  // 3. Not Answered & Marked: No answer AND marked for review
  // 4. Not Answered: Visited AND no answer AND not marked for review
  // 5. Not Visited: Never visited AND no answer AND not marked for review
  let answeredCount = 0
  let answeredAndMarkedCount = 0
  let notAnsweredAndMarkedCount = 0
  let notAnsweredCount = 0
  let notVisitedCount = 0

  for (let i = 0; i < totalQuestions; i++) {
    const hasAnswer = answers[i] !== undefined
    const isMarked = Boolean(markedForReview[i])
    const isVis = Boolean(visited[i])

    if (hasAnswer && !isMarked) {
      answeredCount++
    } else if (hasAnswer && isMarked) {
      answeredAndMarkedCount++
    } else if (!hasAnswer && isMarked) {
      notAnsweredAndMarkedCount++
    } else if (!hasAnswer && isVis) {
      notAnsweredCount++
    } else {
      notVisitedCount++
    }
  }

  const getQuestionStatus = (index) => {
    const hasAnswer = answers[index] !== undefined
    const isMarked = Boolean(markedForReview[index])
    const isVis = Boolean(visited[index])

    if (hasAnswer && !isMarked) return "answered"
    if (hasAnswer && isMarked) return "answered_marked"
    if (!hasAnswer && isMarked) return "marked"
    if (!hasAnswer && isVis) return "not_answered"
    return "not_visited"
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6">
        {/* Top Header Bar */}
        <div className="bg-white rounded-2xl border border-[#eef0f3] p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#c3faf5] text-[#187574] text-[10px] font-semibold uppercase tracking-wider shrink-0">
                  LIVE ATTEMPT
                </span>
                <span className="text-xs text-[#555a6a]">
                  Question {currentQuestion + 1} of {totalQuestions}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-medium text-[#1c1c1e] truncate leading-snug">
                {quizData.category?.quizTitle || quizData.fileTitle || "Assessment Quiz"}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#eef0f3]">
            {/* Timer Badge: Miro Canary Yellow Surface */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#fff8e0] border border-[#ffd02f] rounded-full shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shrink-0">
                <Clock className="w-3 h-3 text-[#1c1c1e]" />
              </div>
              <span className="text-xs text-[#746019] font-medium">Time:</span>
              <span
                className={`text-xs sm:text-sm font-semibold tracking-wider font-mono ${
                  timeLeft <= 300 ? "text-[#600000] font-bold animate-pulse" : "text-[#1c1c1e]"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Cancel Button: Miro Brand Red Pastel Pill */}
            <button
              onClick={handleCancelQuiz}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-[#e3c5c5] bg-[#fbd4d4] hover:bg-[#ffc6c6] text-xs font-semibold text-[#600000] transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* 2-Column Assessment Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Question Panel (3 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#eef0f3] p-4 sm:p-7 space-y-5 sm:space-y-6 shadow-none">
              {/* Question Header & Action Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eef0f3]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center text-xs font-medium shrink-0">
                    {currentQuestion + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">
                    Single Choice
                  </span>
                  {currentQ?.difficulty && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7f8fa] border border-[#eef0f3] text-[#555a6a]">
                      {currentQ.difficulty}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleToggleMarkForReview}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border flex-1 sm:flex-none ${
                      markedForReview[currentQuestion]
                        ? "bg-[#f5f3ff] text-[#4262ff] border-[#4262ff]/40 shadow-2xs"
                        : "bg-white text-[#555a6a] border-[#c7cad5] hover:bg-[#f7f8fa]"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 shrink-0" />
                    <span>{markedForReview[currentQuestion] ? "Marked for Review" : "Mark for Review"}</span>
                  </button>

                  {answers[currentQuestion] !== undefined && (
                    <button
                      type="button"
                      onClick={handleClearResponse}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#600000] hover:bg-[#fbd4d4]/50 transition-colors cursor-pointer flex-1 sm:flex-none"
                    >
                      <RotateCcw className="w-3 h-3 shrink-0" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg font-medium text-[#1c1c1e] leading-relaxed">
                  {currentQ?.text}
                </p>

                {/* Optional Question Image */}
                {currentQ?.image && (
                  <div className="h-48 sm:h-56 w-full bg-[#f0f1f4] rounded-xl overflow-hidden border border-[#eef0f3] flex items-center justify-center p-2">
                    <img
                      src={currentQ.image}
                      alt={`Question ${currentQuestion + 1} illustration`}
                      className="max-h-full max-w-full object-contain object-center"
                    />
                  </div>
                )}
              </div>

              {/* MCQ Options A, B, C, D */}
              <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                {Object.values(currentQ?.options || {}).map((optionText, index) => {
                  const isSelected = answers[currentQuestion] === index
                  const label = String.fromCharCode(65 + index)

                  return (
                    <div
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5 ${
                        isSelected
                          ? "border-[#1c1c1e] bg-[#fff8e0] shadow-2xs"
                          : "border-[#eef0f3] bg-white hover:border-[#c7cad5] hover:bg-[#fafbfc]"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-grow">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                            isSelected
                              ? "bg-[#1c1c1e] text-white border-[#1c1c1e]"
                              : "border-[#c7cad5] text-[#555a6a] bg-white"
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : label}
                        </div>

                        <div className="text-sm font-normal text-[#1c1c1e] leading-relaxed">
                          {optionText}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#746019] bg-[#ffd02f]/25 border border-[#ffd02f]/60 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 self-start sm:self-center ml-9 sm:ml-0">
                          <Check className="w-3 h-3 text-[#00b473]" />
                          <span>Selected (Click to unselect)</span>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bottom Test Navigation Actions (Mobile-Responsive Grid/Flex) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 sm:pt-6 border-t border-[#eef0f3]">
                {/* Previous & Unselect Option */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className={`py-2.5 px-4 rounded-full border border-[#c7cad5] bg-white text-xs font-medium text-[#1c1c1e] hover:bg-[#f7f8fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      answers[currentQuestion] !== undefined ? "w-full sm:w-auto" : "col-span-2 sm:col-span-1 w-full sm:w-auto"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span>Previous</span>
                  </button>

                  {answers[currentQuestion] !== undefined && (
                    <button
                      type="button"
                      onClick={handleClearResponse}
                      className="py-2.5 px-3.5 rounded-full border border-[#e3c5c5] bg-[#fbd4d4]/60 hover:bg-[#fbd4d4] text-xs font-semibold text-[#600000] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Unselect</span>
                    </button>
                  )}
                </div>

                {/* Mark & Next + Save & Next / Submit Test */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleMarkAndNext}
                    className="py-2.5 px-3.5 sm:px-4 rounded-full border border-[#4262ff]/40 bg-[#f5f3ff] text-[#4262ff] text-xs font-medium hover:bg-[#ebe8ff] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                  >
                    <Bookmark className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Mark & Next</span>
                  </button>

                  {currentQuestion === totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="py-2.5 px-4 sm:px-5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-medium shadow-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 text-[#ffd02f] shrink-0" />
                      <span className="truncate">Submit Test</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="py-2.5 px-4 sm:px-5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-medium shadow-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                    >
                      <span className="truncate">Save & Next</span>
                      <ChevronRight className="w-4 h-4 text-[#ffd02f] shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Question Palette (Upper) & Question Statistics (Below) */}
          <div className="lg:col-span-1 space-y-5">
            {/* 1. Question Palette (Upper, 6 in one row) */}
            <div className="bg-white rounded-2xl border border-[#eef0f3] p-5 space-y-4 shadow-none">
              <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1e]">
                  Question Palette
                </h3>
                <span className="text-[11px] text-[#555a6a]">Click number to jump</span>
              </div>

              {/* 6 questions in one row as requested */}
              <div className="grid grid-cols-6 gap-2 p-0.5">
                {quizData.questions.map((_, index) => {
                  const status = getQuestionStatus(index)
                  const isCurrent = currentQuestion === index

                  // Miro palette color coding
                  let btnStyle = "bg-white text-[#555a6a] border border-[#c7cad5] hover:bg-[#f7f8fa]"

                  if (status === "answered") {
                    btnStyle = "bg-[#00b473] text-white border border-[#00b473]"
                  } else if (status === "answered_marked") {
                    btnStyle = "bg-[#ffd02f] text-[#1c1c1e] border-2 border-[#1c1c1e] font-semibold"
                  } else if (status === "marked") {
                    btnStyle = "bg-[#4262ff] text-white border border-[#4262ff]"
                  } else if (status === "not_answered") {
                    btnStyle = "bg-[#fbd4d4] text-[#600000] border border-[#e3c5c5]"
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentQuestion(index)}
                      className={`h-9 w-full rounded-xl text-xs font-medium transition-all relative flex items-center justify-center cursor-pointer ${btnStyle} ${
                        isCurrent ? "ring-2 ring-offset-1 ring-[#1c1c1e] scale-105 z-10" : ""
                      }`}
                    >
                      <span>{index + 1}</span>
                      {status === "answered_marked" && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#00b473]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Question Statistics Card (Below Palette, 2 in the same row) */}
            <div className="bg-white rounded-2xl border border-[#eef0f3] p-5 space-y-4 shadow-none">
              <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#1c1c1e]" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1e]">
                    Question Statistics
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1c1c1e] text-white">
                  Total: {totalQuestions}
                </span>
              </div>

              {/* Status Grid Badges: 2 items per row */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* 1. Current Question */}
                <div className="p-2.5 rounded-xl bg-[#fff8e0] border border-[#fde89c] flex flex-col justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center text-[9px] font-bold shrink-0">
                      {currentQuestion + 1}
                    </span>
                    <span className="text-[#746019] text-[11px] font-medium leading-tight">Current</span>
                  </div>
                  <span className="font-semibold text-[#746019] text-sm">
                    Q{currentQuestion + 1} <span className="text-[10px] font-normal text-[#746019]/70">/ {totalQuestions}</span>
                  </span>
                </div>

                {/* 2. Total Questions */}
                <div className="p-2.5 rounded-xl bg-[#1c1c1e] text-white flex flex-col justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                      #
                    </span>
                    <span className="text-white/80 text-[11px] font-medium leading-tight">Total Questions</span>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    {totalQuestions}
                  </span>
                </div>

                {/* 3. Answered */}
                <div className="p-2.5 rounded-xl bg-[#c3faf5]/50 border border-[#0fbcb0]/25 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#00b473] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                      ✓
                    </span>
                    <span className="text-[#187574] text-[11px] font-medium leading-tight">Answered</span>
                  </div>
                  <span className="font-semibold text-[#187574] text-sm">
                    {answeredCount}
                  </span>
                </div>

                {/* 4. Not Answered */}
                <div className="p-2.5 rounded-xl bg-[#fbd4d4]/50 border border-[#e3c5c5] flex flex-col justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#ffc6c6] text-[#600000] border border-[#e3c5c5] flex items-center justify-center text-[9px] font-bold shrink-0">
                      ✕
                    </span>
                    <span className="text-[#600000] text-[11px] font-medium leading-tight">Not Answered</span>
                  </div>
                  <span className="font-semibold text-[#600000] text-sm">
                    {notAnsweredCount}
                  </span>
                </div>

                {/* 5. Answered & Marked */}
                <div className="p-2.5 rounded-xl bg-[#fff8e0]/70 border border-[#ffd02f]/40 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center text-[9px] font-bold shrink-0">
                      ✓
                    </span>
                    <span className="text-[#746019] text-[11px] font-medium leading-tight">Answered & Mark</span>
                  </div>
                  <span className="font-semibold text-[#746019] text-sm">
                    {answeredAndMarkedCount}
                  </span>
                </div>

                {/* 6. Not Answered & Marked */}
                <div className="p-2.5 rounded-xl bg-[#f5f3ff] border border-[#4262ff]/25 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#4262ff] text-white flex items-center justify-center text-[9px] shrink-0">
                      <Bookmark className="w-2.5 h-2.5" />
                    </span>
                    <span className="text-[#4262ff] text-[11px] font-medium leading-tight">Not Ans & Mark</span>
                  </div>
                  <span className="font-semibold text-[#4262ff] text-sm">
                    {notAnsweredAndMarkedCount}
                  </span>
                </div>

                {/* 7. Not Visited (if any unvisited questions) */}
                {notVisitedCount > 0 && (
                  <div className="col-span-2 p-2.5 rounded-xl bg-[#f7f8fa] border border-[#eef0f3] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-white text-[#555a6a] border border-[#c7cad5] flex items-center justify-center text-[9px]">
                        —
                      </span>
                      <span className="text-[#555a6a] text-xs font-medium">Not Visited Questions</span>
                    </div>
                    <span className="font-semibold text-[#555a6a] text-sm">
                      {notVisitedCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Final Assessment Action */}
              <div className="pt-2 border-t border-[#eef0f3]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-3 px-4 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-[#ffd02f]" />
                  <span>Submit Final Assessment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <AnimatePresence>
          {showSubmitModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl border border-[#eef0f3] p-6 max-w-md w-full shadow-xl text-center space-y-4"
              >
                <div className="w-12 h-12 bg-[#fff4c4] text-[#746019] rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-medium text-[#1c1c1e]">
                    {timeLeft === 0 ? "Time's Up!" : "Submit Assessment?"}
                  </h3>
                  <p className="text-xs text-[#555a6a] leading-relaxed">
                    {timeLeft === 0
                      ? "Your test duration has expired. The quiz will now submit automatically."
                      : `You have answered ${answeredCount + answeredAndMarkedCount} out of ${totalQuestions} questions. Are you ready to submit your test?`}
                  </p>
                </div>

                {/* Quick Summary Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-[#f7f8fa] p-3 rounded-xl border border-[#eef0f3] text-[#555a6a] text-left">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#eef0f3]">
                    <span>Current:</span>
                    <strong className="text-[#1c1c1e]">Q{currentQuestion + 1}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#eef0f3]">
                    <span>Total Questions:</span>
                    <strong className="text-[#1c1c1e]">{totalQuestions}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#eef0f3]">
                    <span>Answered:</span>
                    <strong className="text-[#00b473]">{answeredCount}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#eef0f3]">
                    <span>Not Answered:</span>
                    <strong className="text-[#600000]">{notAnsweredCount}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#eef0f3]">
                    <span>Answered & Marked:</span>
                    <strong className="text-[#746019]">{answeredAndMarkedCount}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#eef0f3]">
                    <span>Not Answered & Marked:</span>
                    <strong className="text-[#4262ff]">{notAnsweredAndMarkedCount}</strong>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 pt-2 w-full">
                  {timeLeft > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="w-full sm:flex-1 py-3 px-4 border border-[#c7cad5] text-[#1c1c1e] rounded-full text-xs font-medium hover:bg-[#f7f8fa] transition-colors cursor-pointer"
                    >
                      Continue Test
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full sm:flex-1 py-3 px-4 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-[#ffd02f]" />
                    <span>Confirm & Submit</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl border border-[#eef0f3] p-5 sm:p-6 max-w-md w-full shadow-xl text-center space-y-4"
              >
                <div className="w-12 h-12 bg-[#fbd4d4] text-[#600000] rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-medium text-[#1c1c1e]">Cancel Quiz?</h3>
                  <p className="text-xs text-[#555a6a] leading-relaxed">
                    Are you sure you want to cancel? Your progress will be discarded and you will return to the quiz catalog.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 pt-2 w-full">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="w-full sm:flex-1 py-3 px-4 border border-[#c7cad5] text-[#1c1c1e] rounded-full text-xs font-medium hover:bg-[#f7f8fa] transition-colors cursor-pointer"
                  >
                    Keep Playing
                  </button>
                  <button
                    type="button"
                    onClick={confirmCancel}
                    className="w-full sm:flex-1 py-3 px-4 bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#600000] border border-[#e3c5c5] rounded-full text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Yes, Cancel Quiz
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}