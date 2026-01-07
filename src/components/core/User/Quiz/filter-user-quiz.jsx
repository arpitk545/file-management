"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Eye, Edit, Trash2, Filter } from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

// Dummy quiz data
const DUMMY_QUIZZES = [
  {
    _id: "1",
    quizTitle: "General Science Quiz",
    description: "Basic science concepts",
    region: "Maharashtra",
    examType: "SSC",
    specificClass: "10th",
    subject: "Science",
    chapter: "Physics",
    totalQuestions: 25,
    duration: 45,
    approvalStatus: "Approved",
    createdAt: new Date("2025-01-15"),
  },
  {
    _id: "2",
    quizTitle: "Biology Fundamentals",
    description: "Important biology topics",
    region: "Karnataka",
    examType: "CBSE",
    specificClass: "12th",
    subject: "Biology",
    chapter: "Photosynthesis",
    totalQuestions: 30,
    duration: 60,
    approvalStatus: "Approved",
    createdAt: new Date("2025-01-10"),
  },
  {
    _id: "3",
    quizTitle: "Mathematics Problem Solving",
    description: "Advanced math problems",
    region: "Gujarat",
    examType: "JEE",
    specificClass: "12th",
    subject: "Mathematics",
    chapter: "Calculus",
    totalQuestions: 50,
    duration: 90,
    approvalStatus: "Pending",
    createdAt: new Date("2025-01-20"),
  },
  {
    _id: "4",
    quizTitle: "History Timeline",
    description: "Indian history facts",
    region: "Maharashtra",
    examType: "SSC",
    specificClass: "10th",
    subject: "History",
    chapter: "Medieval India",
    totalQuestions: 20,
    duration: 30,
    approvalStatus: "Approved",
    createdAt: new Date("2025-01-18"),
  },
]

const REGIONS = ["All", "Maharashtra", "Karnataka", "Gujarat", "Delhi", "Tamil Nadu"]

export default function FilterUserQuiz() {
  const navigate = useNavigate()
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [quizzes, setQuizzes] = useState(DUMMY_QUIZZES)
  const [filteredQuizzes, setFilteredQuizzes] = useState(DUMMY_QUIZZES)

  // Filter quizzes based on selected region
  useEffect(() => {
    if (selectedRegion === "All") {
      setFilteredQuizzes(quizzes)
    } else {
      setFilteredQuizzes(quizzes.filter((quiz) => quiz.region === selectedRegion))
    }
  }, [selectedRegion, quizzes])

  const handleViewQuiz = (quizId) => {
    navigate(`/view-all-user-quiz`)
  }

  const handleEditQuiz = (quizId) => {
    navigate(`/edit-user-quiz`)
  }

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId))
      toast.success("Quiz deleted successfully")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Filter className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Quizzes
              </h1>
              <p className="text-gray-600 text-lg">Manage and view your created quizzes</p>
            </div>
          </motion.div>
        </div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-semibold text-gray-700">Filter by Region:</span>
                {REGIONS.map((region) => (
                  <Button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`rounded-full px-6 py-2 transition-all ${
                      selectedRegion === region
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {region}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Showing {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? "zes" : ""} in {selectedRegion}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quizzes Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {filteredQuizzes.length === 0 ? (
            <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 text-lg">No quizzes found in {selectedRegion}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-3xl">
                    <th className="px-6 py-4 text-left font-semibold">Quiz Title</th>
                    <th className="px-6 py-4 text-left font-semibold">Region</th>
                    <th className="px-6 py-4 text-left font-semibold">Class</th>
                    <th className="px-6 py-4 text-left font-semibold">Subject</th>
                    <th className="px-6 py-4 text-left font-semibold">Questions</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz, index) => (
                    <motion.tr
                      key={quiz._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-all"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{quiz.quizTitle}</p>
                          <p className="text-sm text-gray-500">{quiz.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                          {quiz.region}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{quiz.specificClass}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{quiz.subject}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 rounded-full">
                          {quiz.totalQuestions}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={quiz.approvalStatus === "Approved" ? "default" : "secondary"}
                          className={`rounded-full ${
                            quiz.approvalStatus === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {quiz.approvalStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleViewQuiz(quiz._id)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                            title="View quiz"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>

                          <Button
                            onClick={() => handleEditQuiz(quiz._id)}
                            variant="ghost"
                            size="sm"
                            className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-full"
                            title="Edit quiz"
                          >
                            <Edit className="w-5 h-5" />
                          </Button>

                          <Button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                            title="Delete quiz"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
