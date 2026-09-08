"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { useParams,useNavigate } from "react-router-dom"
import { BookOpen, ArrowLeft, Trash2, StickyNote } from "lucide-react"
import toast from "react-hot-toast"

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  </div>
)

export default function EditQuiz() {
  const params = useParams()
  const router = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    totalMarks: 100,
    duration: 120,
    difficulty: "Average",
    questions: [],
  })

  // Dummy quiz data
  const dummyQuiz = {
    _id: params.quizId || "1",
    title: "Advanced Mathematics Quiz",
    description: "A comprehensive quiz covering advanced mathematical concepts",
    region: "Maharashtra",
    examType: "Board Exam",
    specificClass: "12th Class",
    subject: "Mathematics",
    chapter: "Calculus",
    totalMarks: 100,
    duration: 120,
    difficulty: "Hard",
    questions: [
      {
        _id: "q1",
        text: "What is the derivative of x^2 + 3x + 5?",
        image: null,
        note: "Use the power rule",
        options: { A: "2x + 3", B: "2x + 5", C: "x + 3", D: "3x + 2" },
        correctAnswer: "A",
      },
    ],
  }

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setQuizData(dummyQuiz)
      } catch (error) {
        toast.error("Failed to load quiz")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuizData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuizData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }))
  }

  const handleOptionChange = (questionIndex, optionKey, value) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[questionIndex].options[optionKey] = value
    setQuizData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }))
  }

  const handleDeleteQuestion = (index) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
    toast.success("Question deleted")
  }

  const handleSaveQuiz = async () => {
    try {
      if (!quizData.title || !quizData.description) {
        toast.error("Please fill in all required fields")
        return
      }
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Quiz updated successfully!")
      router.push(`/view-quiz/${params.quizId}`)
    } catch (error) {
      toast.error("Failed to save quiz")
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading quiz...</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-800">Edit Quiz</h1>
              <p className="text-gray-600">Modify quiz details and questions</p>
            </div>
          </motion.div>
        </div>

        {/* Quiz Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
              <CardTitle className="text-2xl font-bold">Quiz Details</CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <ModernInput
                label="Quiz Title"
                placeholder="Enter quiz title"
                value={quizData.title}
                onChange={(value) => setQuizData({ ...quizData, title: value })}
              />

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                <textarea
                  placeholder="Enter quiz description"
                  value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  className="w-full h-24 p-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ModernInput
                  label="Region"
                  placeholder="Enter region"
                  value={quizData.region}
                  onChange={(value) => setQuizData({ ...quizData, region: value })}
                />
                <ModernInput
                  label="Exam Type"
                  placeholder="Enter exam type"
                  value={quizData.examType}
                  onChange={(value) => setQuizData({ ...quizData, examType: value })}
                />
                <ModernInput
                  label="Class"
                  placeholder="Enter class"
                  value={quizData.specificClass}
                  onChange={(value) => setQuizData({ ...quizData, specificClass: value })}
                />
                <ModernInput
                  label="Subject"
                  placeholder="Enter subject"
                  value={quizData.subject}
                  onChange={(value) => setQuizData({ ...quizData, subject: value })}
                />
                <ModernInput
                  label="Chapter"
                  placeholder="Enter chapter"
                  value={quizData.chapter}
                  onChange={(value) => setQuizData({ ...quizData, chapter: value })}
                />
                <ModernInput
                  label="Duration (minutes)"
                  type="number"
                  placeholder="Enter duration"
                  value={quizData.duration}
                  onChange={(value) => setQuizData({ ...quizData, duration: Number.parseInt(value) })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernInput
                  label="Total Marks"
                  type="number"
                  placeholder="Enter total marks"
                  value={quizData.totalMarks}
                  onChange={(value) => setQuizData({ ...quizData, totalMarks: Number.parseInt(value) })}
                />
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Difficulty Level</Label>
                  <select
                    value={quizData.difficulty}
                    onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
                    className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Average">Average</option>
                    <option value="Hard">Hard</option>
                  </select>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Questions ({quizData.questions.length})</h2>
          </div>

          <div className="space-y-4">
            {quizData.questions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-lg rounded-3xl overflow-visible">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Question {index + 1}</h3>
                      <Button
                        onClick={() => handleDeleteQuestion(index)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Question Text</Label>
                      <textarea
                        value={question.text}
                        onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                        className="w-full h-20 p-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Option {key}</Label>
                          <Input
                            value={value}
                            onChange={(e) => handleOptionChange(index, key, e.target.value)}
                            placeholder={`Enter option ${key}`}
                            className="h-12 px-4 border-2 border-gray-200 rounded-2xl"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Correct Answer</Label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl font-medium"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <StickyNote className="w-4 h-4" />
                        Note (Optional)
                      </Label>
                      <textarea
                        value={question.note || ""}
                        onChange={(e) => handleQuestionChange(index, "note", e.target.value)}
                        placeholder="Add any helpful note"
                        className="w-full h-16 p-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
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
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuiz}
            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl"
          >
            Save Changes
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
