"use client"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Timer, BookOpen, Target } from "lucide-react"
import { getContestById, submitContest, checkContestAttempt } from "../../../../services/operations/contestAPI"

export default function Attempt() {
  const { contestId } = useParams()
  const navigate = useNavigate()
  const [contestData, setContestData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasAttempted, setHasAttempted] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [timeTaken, setTimeTaken] = useState(0)

useEffect(() => {
  const checkAttempt = async () => {
    try {
      const res = await checkContestAttempt(contestId);
      if (res.success) {
        const { attempted } = res.data;

        setHasAttempted(attempted);

        if (attempted) {
          toast.success("You have already attempted this contest.");
        } 
      } else {
        toast.error(res.message || "Could not fetch attempt status.");
      }
    } catch (err) {
      console.error("Error checking attempt:", err);
      toast.error("An error occurred while checking attempt status.");
    }
  };

  checkAttempt();
}, [contestId]);

  // Load contest data and resume progress
  useEffect(() => {
    const fetchContestAndProgress = async () => {
      try {
        const res = await getContestById(contestId)
        if (res.success) {
          setContestData(res.data)
          
          // Load saved progress from localStorage
          const savedProgress = JSON.parse(localStorage.getItem(`contest_${contestId}_progress`))
          if (savedProgress) {
            setAnswers(savedProgress.answers || {})
            setCurrentQuestion(savedProgress.currentQuestion || 0)
            
            // Calculate remaining time
            const elapsedSeconds = Math.floor((Date.now() - savedProgress.startTime) / 1000)
            const remainingTime = Math.max(0, (res.data.duration * 60) - elapsedSeconds)
            setTimeLeft(remainingTime)
            setStartTime(savedProgress.startTime)
          } else {
            // New attempt
            setTimeLeft(res.data.duration * 60)
            const now = Date.now()
            setStartTime(now)
            localStorage.setItem(`contest_${contestId}_progress`, JSON.stringify({
              answers: {},
              currentQuestion: 0,
              startTime: now
            }))
          }
        } else {
          console.error("Failed to load contest:", res.message)
        }
      } catch (err) {
        console.error("Error loading contest:", err)
      }
    }

    if (contestId && !hasAttempted) {
      fetchContestAndProgress()
    }
  }, [contestId, hasAttempted])

  // Save progress to localStorage
  useEffect(() => {
    if (contestId && contestData && startTime) {
      localStorage.setItem(`contest_${contestId}_progress`, JSON.stringify({
        answers,
        currentQuestion,
        startTime
      }))
    }
  }, [answers, currentQuestion, contestId, contestData, startTime])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && startTime) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          
          // Calculate time taken when time runs out
          if (newTime <= 0) {
            const totalTime = contestData.duration * 60
            setTimeTaken(totalTime)
          }
          
          return newTime
        })
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted && contestData) {
      handleAutoSubmit()
    }
  }, [timeLeft, isSubmitted, contestData, startTime])

  const handleAutoSubmit = async () => {
    setIsSubmitted(true)
    setShowSubmitModal(false)
    
    try {
      const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedIndex]) => ({
        questionIndex: parseInt(questionIndex),
        selectedOption: String.fromCharCode(65 + selectedIndex),
      }))

      const response = await submitContest(contestId, { 
        answers: formattedAnswers,
        timeTaken: contestData.duration * 60 
      })

      if (response.success) {
        toast.success(response.message || "Submitted successfully!")
        // Clear saved progress
        localStorage.removeItem(`contest_${contestId}_progress`)
        navigate(`/result/${contestId}`)
      } else {
        toast.error(response.message || "Submission failed")
      }
    } catch (err) {
      console.error("Error submitting contest:", err)
      toast.error("Something went wrong during submission")
    }
  }

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
    if (currentQuestion < contestData?.questions.length - 1) {
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
    
    // Calculate time taken
    const now = Date.now()
    const elapsedSeconds = Math.floor((now - startTime) / 1000)
    const actualTimeTaken = Math.min(elapsedSeconds, contestData.duration * 60)
    setTimeTaken(actualTimeTaken)

    try {
      const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedIndex]) => ({
        questionIndex: parseInt(questionIndex),
        selectedOption: String.fromCharCode(65 + selectedIndex),
      }))

      const response = await submitContest(contestId, { 
        answers: formattedAnswers,
        timeTaken: actualTimeTaken
      })

      if (response.success) {
        toast.success(response.message || "Submitted successfully!")
        // Clear saved progress
        localStorage.removeItem(`contest_${contestId}_progress`)
        navigate(`/result/${contestId}`)
      } else {
        toast.error(response.message || "Submission failed")
      }
    } catch (err) {
      console.error("Error submitting contest:", err)
      toast.error("Something went wrong during submission")
    }
  }

  const getTimeColor = () => {
    if (!contestData) return "text-gray-600"
    const percentage = (timeLeft / (contestData.duration * 60)) * 100
    if (percentage > 50) return "text-green-600"
    if (percentage > 25) return "text-yellow-600"
    return "text-red-600"
  }

  const currentQ = contestData?.questions[currentQuestion]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = contestData?.questions?.length || 0

  if (hasAttempted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
        <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden max-w-md w-full">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              {contestData?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">You have already attempted this contest</h3>
              <p className="text-gray-600 mb-6">View your results to see how you performed.</p>
              <Button
                onClick={() => navigate(`/result/${contestId}`)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl px-8 py-3 shadow-lg"
              >
                See Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  

  if (!contestData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Quiz Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{contestData.title}</h1>
                    <p className="text-gray-600">
                      Question {currentQuestion + 1} of {totalQuestions}
                    </p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 md:h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
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
                  <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-lg md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 md:p-6">
                      <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{currentQuestion + 1}</span>
                        </div>
                        Question {currentQuestion + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 lg:p-8">
                      {/* Question Text */}
                      <div className="mb-4 md:mb-6 lg:mb-8">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">{currentQ?.question}</h2>
                      </div>

                      {/* Image Section */}
                      {currentQ?.image && (
                        <div className="mb-4 md:mb-6 lg:mb-8 flex justify-center">
                          <img
                            src={currentQ.image || "/placeholder.svg"}
                            alt={`Question ${currentQuestion + 1} illustration`}
                            className="max-w-full h-auto max-h-48 md:max-h-64 rounded-lg shadow-md border border-gray-200"
                          />
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-3 md:space-y-4">
                        {currentQ?.options.map((option, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                              answers[currentQuestion] === index
                                ? "border-blue-500 bg-blue-50 shadow-md md:shadow-lg"
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
                                <span className="font-semibold text-gray-600">{String.fromCharCode(65 + index)}.</span>
                                <span className="text-gray-800 font-medium">{option}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6 md:mt-8">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="h-10 md:h-12 px-4 md:px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl md:rounded-2xl disabled:opacity-50 hover:bg-gray-200 transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Previous
                </Button>
                <div className="flex gap-3 md:gap-4">
                  {currentQuestion === contestData.questions.length - 1 ? (
                    <Button
                      onClick={() => setShowSubmitModal(true)}
                      className="h-10 md:h-12 px-4 md:px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl md:rounded-2xl shadow-md md:shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="h-10 md:h-12 px-4 md:px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 font-semibold rounded-xl md:rounded-2xl transition-colors duration-200"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          {/* Timer & Info Sidebar */}
          <div className="lg:col-span-1 mt-4 md:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="sticky top-4 md:top-8 space-y-4 md:space-y-6"
            >
              {/* Timer Card */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-lg md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3">
                    <Timer className="w-5 h-5 md:w-6 md:h-6" />
                    Time Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="text-center">
                    <div className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2 ${getTimeColor()}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      {timeLeft > 60 ? "Minutes:Seconds" : "Hurry up!"}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Progress Card */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-lg md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3">
                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Answered</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs md:text-sm">
                      {answeredCount}/{totalQuestions}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Remaining</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs md:text-sm">
                      {totalQuestions - answeredCount}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 md:h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-1 md:h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Question Navigator */}
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-lg md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold">Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-5 gap-1 md:gap-2">
                    {contestData.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-semibold transition-all duration-200 text-xs md:text-sm ${
                          currentQuestion === index
                            ? "bg-blue-500 text-white shadow-md md:shadow-lg"
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
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full shadow-lg md:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <AlertTriangle className="w-6 h-6 md:w-8  text-yellow-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                  {timeLeft === 0 ? "Time's Up!" : "Submit Quiz?"}
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  {timeLeft === 0
                    ? "Your time has expired. The quiz will be submitted automatically."
                    : `You have answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`}
                </p>
                <div className="flex gap-3 md:gap-4">
                  {timeLeft > 0 && (
                    <Button
                      onClick={() => setShowSubmitModal(false)}
                      variant="outline"
                      className="flex-1 h-10 md:h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl md:rounded-2xl"
                    >
                      Continue Quiz
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 h-10 md:h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl md:rounded-2xl"
                  >
                    Submit Now
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