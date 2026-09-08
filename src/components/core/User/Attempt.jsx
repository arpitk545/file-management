"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { 
  ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, 
  Timer, BookOpen, Target, Loader2, MapPin, Layers, Award, 
} from "lucide-react"
import { submitAiQuiz } from "../../../services/operations/quizAPI"
import toast from "react-hot-toast"

// Local storage keys
const STORAGE_KEY = 'quiz_progress';
const QUIZ_DATA_KEY = 'quiz_data';

export default function Attempt() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Try to get quiz data from location state or localStorage
  const [quizData, setQuizData] = useState(() => {
    return location.state?.quizData || JSON.parse(localStorage.getItem(QUIZ_DATA_KEY))
  })

  // Initialize state from localStorage if available
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved?.currentQuestion || 0
  })

  const [answers, setAnswers] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved?.answers || {}
  })

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved?.timeLeft || (quizData?.duration * 60 || 0)
  })

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(true)

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!quizData) return
    
    const progress = {
      currentQuestion,
      answers,
      timeLeft,
      quizId: quizData._id
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    localStorage.setItem(QUIZ_DATA_KEY, JSON.stringify(quizData))
  }, [currentQuestion, answers, timeLeft, quizData])

  // Handle browser back button
  useEffect(() => {
    if (!shouldBlockNavigation) return

    const handleBeforeUnload = (e) => {
      if (!isSubmitted) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        setShowSubmitModal(true)
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [shouldBlockNavigation, isSubmitted])

  // Redirect if no quiz data
  useEffect(() => {
    if (!quizData) {
      toast.error("No quiz data found. Redirecting...")
      navigate("/dashboard")
    }
  }, [quizData, navigate])

  // Format questions from API response
  const formattedQuestions = quizData?.questions?.map((question, index) => ({
    id: index + 1,
    question: question.text,
    options: Object.values(question.options),
    correctAnswer: question.correctAnswer.charCodeAt(0) - 65,
    tags: question.tags,
    difficulty: question.difficulty
  })) || []

  // Timer effect
  useEffect(() => {
    if (!quizData || isSubmitted) return

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Time's up - auto submit
      setShowSubmitModal(true)
    }
  }, [timeLeft, isSubmitted, quizData])

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < formattedQuestions.length - 1) {
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
    setLoading(true)
    setShouldBlockNavigation(false)
    
    try {
      const fullQuestions = quizData.questions.map((q, index) => {
        const userSelectedIndex = answers[index]
        const correctIndex = q.correctAnswer.charCodeAt(0) - 65
        const options = q.options

        return {
          questionText: q.text,
          options: options,
          correctAnswer: q.correctAnswer,
          userAnswer: userSelectedIndex !== undefined ? String.fromCharCode(65 + userSelectedIndex) : null,
          isCorrect: userSelectedIndex !== undefined && userSelectedIndex === correctIndex,
        }
      })

      const submissionData = {
        metadata: {
          region: quizData.region,
          subject: quizData.subject,
          examType: quizData.examType,
          specificClass: quizData.specificClass,
          difficulty: quizData.difficulty,
          totalQuestions: quizData.totalQuestions,
          duration: quizData.duration * 60, 
        },
        questions: fullQuestions,
       timeTaken: Number(((quizData.duration * 60 - timeLeft) / 60).toFixed(2)),
      }

      const result = await submitAiQuiz(submissionData)

      if (result) {
        // Clear saved progress
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(QUIZ_DATA_KEY)
        
        toast.success("Quiz submitted successfully!")
        navigate("/get-ai-result", { state: { result } })
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error)
      toast.error("Failed to submit quiz")
      setIsSubmitted(false)
      setShouldBlockNavigation(true)
    } finally {
      setLoading(false)
    }
  }

  const getTimeColor = () => {
    if (!quizData) return "text-gray-600"
    const percentage = (timeLeft / (quizData.duration * 60)) * 100
    if (percentage > 50) return "text-green-600"
    if (percentage > 25) return "text-yellow-600"
    return "text-red-600"
  }

  if (!quizData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    )
  }

  const currentQ = formattedQuestions[currentQuestion]
  const answeredCount = Object.keys(answers).length

  // Quiz metadata display
  const quizTitle = `${quizData.subject} - ${quizData.specificClass}`

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Quiz Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{quizTitle}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-gray-600 mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{quizData.region}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Layers className="w-4 h-4" />
                        <span>{quizData.examType}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="w-4 h-4" />
                        <span>{quizData.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / formattedQuestions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{currentQuestion + 1}</span>
                        </div>
                        Question {currentQuestion + 1}
                        <Badge variant="secondary" className="ml-auto">
                          {currentQ?.difficulty}
                        </Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8">
                      {/* Question Text */}
                      <div className="mb-6 md:mb-8">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                          {currentQ?.question}
                        </h2>
                      </div>

                      {/* Options */}
                      <div className="space-y-3 md:space-y-4">
                        {currentQ?.options?.map((option, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                              answers[currentQuestion] === index
                                ? "border-blue-500 bg-blue-50 shadow-lg"
                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                            onClick={() => handleAnswerSelect(index)}
                          >
                            <div className="flex items-center gap-3 md:gap-4">
                              <div
                                className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                                  answers[currentQuestion] === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                }`}
                              >
                                {answers[currentQuestion] === index && (
                                  <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 md:gap-3">
                                <span className="font-semibold text-gray-600">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <span className="text-gray-800 font-medium">{option}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Tags */}
                      {currentQ?.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-6">
                          {currentQ.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6 md:mt-8">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="h-11 md:h-12 px-4 md:px-6 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl md:rounded-2xl disabled:opacity-50 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Previous
                </Button>

                <div className="flex gap-3 md:gap-4">
                  {currentQuestion === formattedQuestions.length - 1 ? (
                    <Button
                      onClick={() => setShowSubmitModal(true)}
                      className="h-11 md:h-12 px-6 md:px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl md:rounded-2xl shadow-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                          Submit Quiz
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="h-11 md:h-12 px-5 md:px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl md:rounded-2xl"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="sticky top-8 space-y-4 md:space-y-6"
            >
              {/* Timer Card */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3">
                    <Timer className="w-5 h-5 md:w-6 md:h-6" />
                    Time Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="text-center">
                    <div className={`text-3xl md:text-4xl font-bold mb-1 md:mb-2 ${getTimeColor()}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      {timeLeft > 60 ? "Minutes:Seconds" : "Hurry up!"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3">
                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Answered</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {answeredCount}/{formattedQuestions.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Remaining</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {formattedQuestions.length - answeredCount}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(answeredCount / formattedQuestions.length) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Question Navigator */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold">Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-5 gap-1 md:gap-2">
                    {formattedQuestions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-semibold transition-all duration-200 text-sm md:text-base ${
                          currentQuestion === index
                            ? "bg-blue-500 text-white shadow-lg"
                            : answers[index] !== undefined
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl md:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                  {timeLeft === 0 ? "Time's Up!" : "Submit Quiz?"}
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  {timeLeft === 0
                    ? "Your time has expired. The quiz will be submitted automatically."
                    : `You have answered ${answeredCount} out of ${formattedQuestions.length} questions. Are you sure you want to submit?`}
                </p>
                <div className="flex gap-3 md:gap-4">
                  {timeLeft > 0 && (
                    <Button
                      onClick={() => setShowSubmitModal(false)}
                      variant="outline"
                      className="flex-1 h-11 md:h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl md:rounded-2xl"
                    >
                      Continue Quiz
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 h-11 md:h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl md:rounded-2xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Now"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}