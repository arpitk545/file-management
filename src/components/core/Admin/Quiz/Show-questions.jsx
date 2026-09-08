import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import {
  MapPin,
  Tag,
  Clock,
  Target,
  User,
  Calendar,
  CheckCircle,
  Award,
  BookOpen,
  Edit,
  Trash2,
  FileText,
} from "lucide-react"
import { getQuizById, deleteQuizById, updateApprovalStatusById } from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"

export default function ShowQuestions()  {
  const {id} = useParams ();
  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

 useEffect(() => {
  const loadQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await getQuizById(id)
      setQuiz(response.data) 
    } catch (err) {
      console.error("Failed to load quiz:", err)
      setError("Failed to load quiz details")
    } finally {
      setIsLoading(false)
    }
  }

  if (id) {
    loadQuiz()
  }
}, [id])


  const handleEdit = () => {
    navigate(`/update-quiz/${id}`)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this quiz?");
  if (!confirmed) return;
      try {
        await deleteQuizById(id)
        toast.success("Quiz deleted successfully!")
        navigate("/view-quiz")
      } catch (err) {
        console.error("Failed to delete quiz:", err)
        toast.error("Failed to delete quiz")
      }
    }
  

  const handleBack = () => {
    navigate(-1)
  }

  const handleApprovalStatus = async (status) => {
    try {
      await updateApprovalStatusById(id, status)
      setQuiz(prev => ({
      ...prev,
      category: {
        ...prev.category,
        approvalStatus: status,
      },
    }));
      toast.success(`Quiz status updated to ${status}`)
      navigate("/view-quiz")
    } catch (err) {
      console.error("Failed to update approval status:", err)
      toast.error("Failed to update approval status")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-100"
      case "Waiting for Approval":
        return "text-yellow-600 bg-yellow-100"
      case "Rejected":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100"
      case "Average":
        return "text-yellow-600 bg-yellow-100"
      case "Hard":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading quiz details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading quiz</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz not found</h3>
          <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quiz Details
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Complete quiz information and questions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors duration-200"
              title="Edit Quiz"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-200"
              title="Delete Quiz"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Quiz Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{quiz.category.quizTitle}</h2>
                <p className="text-blue-100 text-sm sm:text-base">{quiz.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(quiz.category.approvalStatus)}`}>
                  {quiz.category.approvalStatus || "Waiting for Approval"}
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail Image */}
          {quiz.category.thumbnailimage && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thumbnail Image</h3>
              <div className="flex justify-center">
                <img 
                  src={quiz.category.thumbnailimage} 
                  alt="Quiz thumbnail" 
                  className="max-w-full h-auto max-h-64 rounded-lg object-contain"
                />
              </div>
            </div>
          )}

          {/* Approval Buttons */}
          <div className="flex justify-end gap-4 p-4 bg-gray-50 border-b">
            {quiz.category.approvalStatus !== "Approved" && (
              <button
                onClick={() => handleApprovalStatus("Approved")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Approve Quiz
              </button>
            )}
            {quiz.category.approvalStatus !== "Rejected" && (
              <button
                onClick={() => handleApprovalStatus("Rejected")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject Quiz
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium text-gray-900">{quiz.category.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium text-gray-900">{quiz.category.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Chapter:</span>
                    <span className="font-medium text-gray-900">{quiz.category.chapter}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium text-gray-900">{quiz.category.specificClass}</span>
                  </div>
                </div>
              </div>

              {/* Quiz Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Quiz Settings
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium text-gray-900">{quiz.questions?.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{quiz.category.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 mt-1 rounded-full text-xs font-medium  ${getStatusColor(quiz.category?.approvalStatus)}`}>
                      {quiz.category?.approvalStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Author & Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Author & Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Author:</span>
                    <span className="font-medium text-gray-900">{quiz.category.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">Updated At:</span>
                    <span className="font-medium text-gray-900">{new Date(quiz.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Questions</h2>
                <p className="text-green-100">Total {quiz.questions?.length} questions</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{quiz.questions?.length}</div>
                <div className="text-green-100 text-sm">Questions</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <motion.div
                  key={question._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-900 font-medium text-base sm:text-lg leading-relaxed">{question.text}</p>
                  </div>

                  {/* Question Image */}
                  {question.image && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Question Image:</h4>
                      <div className="flex justify-center">
                        <img 
                          src={question.image} 
                          alt={`Question ${index + 1}`} 
                          className="max-w-full h-auto max-h-64 rounded-lg object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {Object.entries(question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          question.correctAnswer === key
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              question.correctAnswer === key
                                ? "bg-green-200 text-green-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {key}
                          </div>
                          <span className="font-medium">{value}</span>
                          {question.correctAnswer === key && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Question Note */}
                  {question.note && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-1">Note</h4>
                          <p className="text-yellow-800 text-sm">{question.note}</p>
                        </div>
                      </div>
                    </div>
                  )}

                 {question.tags && question.tags.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {question.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}