"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { useParams,useNavigate } from "react-router-dom"
import { BookOpen, ArrowLeft, Calendar, User, Clock, FileText, ImageIcon, StickyNote } from "lucide-react"
import toast from "react-hot-toast"

export default function ViewUserQuiz() {
  const params = useParams()
  const router = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Dummy quiz data
  const dummyQuiz = {
    _id: params.quizId || "1",
    title: "Advanced Mathematics Quiz",
    description:
      "A comprehensive quiz covering advanced mathematical concepts including calculus, algebra, and geometry.",
    region: "Maharashtra",
    examType: "Board Exam",
    specificClass: "12th Class",
    subject: "Mathematics",
    chapter: "Calculus",
    totalQuestions: 50,
    totalMarks: 100,
    duration: 120,
    createdBy: "John Doe",
    createdDate: "2024-01-15",
    status: "Published",
    difficulty: "Hard",
    questions: [
      {
        _id: "q1",
        text: "What is the derivative of x^2 + 3x + 5?",
        image: null,
        note: "Use the power rule for differentiation",
        options: {
          A: "2x + 3",
          B: "2x + 5",
          C: "x + 3",
          D: "3x + 2",
        },
        correctAnswer: "A",
        difficulty: "Easy",
      },
      {
        _id: "q2",
        text: "Integrate the function ∫(2x + 5)dx",
        image: null,
        note: "Apply the power rule for integration",
        options: {
          A: "x^2 + 5x + C",
          B: "2x^2 + 5x + C",
          C: "x^2 + 5 + C",
          D: "2x + 5 + C",
        },
        correctAnswer: "A",
        difficulty: "Average",
      },
      {
        _id: "q3",
        text: "Find the area under the curve y = x^2 from x = 0 to x = 3",
        image: "/data-visualization-graph.png",
        note: "Use the definite integral formula",
        options: {
          A: "6",
          B: "9",
          C: "12",
          D: "15",
        },
        correctAnswer: "B",
        difficulty: "Hard",
      },
    ],
  }

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setQuiz(dummyQuiz)
      } catch (error) {
        toast.error("Failed to load quiz")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading quiz details...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Quiz not found</p>
            <Button onClick={() => router.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
              <p className="text-gray-600">View full quiz details and questions</p>
            </div>
          </motion.div>

          <Button
            onClick={() => router.push(`/edit-quiz/${quiz._id}`)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl px-6 h-12"
          >
            Edit Quiz
          </Button>
        </div>

        {/* Quiz Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
              <CardTitle className="text-2xl font-bold">Quiz Information</CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </label>
                <p className="text-gray-700 p-4 bg-gray-50 rounded-2xl border border-gray-200">{quiz.description}</p>
              </div>

              {/* Quiz Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Region</p>
                  <p className="text-lg font-bold text-gray-800">{quiz.region}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Exam Type</p>
                  <p className="text-lg font-bold text-gray-800">{quiz.examType}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                  <p className="text-xs font-semibold text-green-600 uppercase mb-2">Class</p>
                  <p className="text-lg font-bold text-gray-800">{quiz.specificClass}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border border-pink-200">
                  <p className="text-xs font-semibold text-pink-600 uppercase mb-2">Subject</p>
                  <p className="text-lg font-bold text-gray-800">{quiz.subject}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                  <p className="text-xs font-semibold text-orange-600 uppercase mb-2">Chapter</p>
                  <p className="text-lg font-bold text-gray-800">{quiz.chapter}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-600 uppercase mb-2">Difficulty</p>
                  <p className="text-lg font-bold text-gray-800">{quiz.difficulty}</p>
                </div>
              </div>

              {/* Quiz Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Marks</p>
                  <p className="text-2xl font-bold text-purple-600">{quiz.totalMarks}</p>
                </div>
                <div className="text-center flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Duration</p>
                    <p className="text-lg font-bold text-green-600">{quiz.duration} min</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Status</p>
                  <Badge className="bg-green-100 text-green-800 rounded-full">{quiz.status}</Badge>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Created by
                  </p>
                  <p className="text-gray-600">{quiz.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created on
                  </p>
                  <p className="text-gray-600">{new Date(quiz.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Questions ({quiz.questions.length})</h2>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-lg rounded-3xl overflow-visible">
                  <CardContent className="p-8 space-y-6">
                    {/* Question Number and Difficulty */}
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-gray-800">Question {index + 1}</h3>
                      <Badge
                        variant="secondary"
                        className={`rounded-full ${
                          question.difficulty === "Easy"
                            ? "bg-green-100 text-green-800"
                            : question.difficulty === "Average"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {question.difficulty}
                      </Badge>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-2">
                      <p className="text-gray-700 p-4 bg-gray-50 rounded-2xl border border-gray-200 font-medium">
                        {question.text}
                      </p>
                    </div>

                    {/* Question Image */}
                    {question.image && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Image
                        </label>
                        <img
                          src={question.image || "/placeholder.svg"}
                          alt="Question"
                          className="w-full h-48 object-cover rounded-2xl border border-gray-200"
                        />
                      </div>
                    )}

                    {/* Question Note */}
                    {question.note && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <StickyNote className="w-4 h-4" />
                          Note
                        </label>
                        <p className="text-sm text-gray-700 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                          {question.note}
                        </p>
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Options</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(question.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-3 rounded-xl text-sm font-medium transition-all ${
                              question.correctAnswer === key
                                ? "bg-green-100 text-green-800 border-2 border-green-300"
                                : "bg-gray-100 text-gray-800 border border-gray-300"
                            }`}
                          >
                            <span className="font-bold">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                      <p className="text-sm font-semibold text-green-700">
                        ✓ Correct Answer: <span className="font-bold">{question.correctAnswer}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 flex gap-4"
        >
          <Button onClick={() => router.back()} variant="outline" className="flex-1 h-12 rounded-2xl font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => router.push(`/edit-quiz/${quiz._id}`)}
            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl"
          >
            Edit Quiz
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
