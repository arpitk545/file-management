"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Badge } from "../../../ui/badge"
import {
  getAllQuizRegions,
  createQuizQuestion,
  getAllQuizQuestions,
  extractQuestionsFromFile,
} from "../../../../services/operations/quizAPI"
import QuizAI from "./CreateQuizAI" // Import the AI component
import {
  Database,
  X,
  Plus,
  Target,
  Save,
  Search,
  Tag,
  Trash2,
  Upload,
  Eye,
  Edit,
  SkipForward,
  Bot,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

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

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 4 }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700">{label}</Label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
    />
  </div>
)

const QuestionBankCard = ({ question, onEdit, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">{index + 1}</span>
        </div>
        <div>
          <Badge
            variant="secondary"
            className={`${
              question.difficulty === "Easy"
                ? "bg-green-100 text-green-800"
                : question.difficulty === "Average"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            } rounded-full`}
          >
            {question.difficulty}
          </Badge>
          <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 rounded-full">
            {question.category?.region || "N/A"}
          </Badge>
          <Badge variant="outline" className="ml-2 bg-indigo-100 text-indigo-800 rounded-full">
            {question.category?.examType || "N/A"}
          </Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onEdit(question._id)}
          variant="ghost"
          size="sm"
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onDelete(question.id)}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
    <div className="space-y-4">
      <p className="text-gray-800 font-medium">{question.text}</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(question.options).map(([key, value]) => (
          <div
            key={key}
            className={`p-2 rounded-xl text-sm ${
              question.correctAnswer === key
                ? "bg-green-300 text-green-800 border border-green-200"
                : "bg-gray-50 text-gray-700 border border-gray-200"
            }`}
          >
            <span className="font-semibold">{key}:</span> {value}
          </div>
        ))}
      </div>
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {question.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="outline" className=" bg-blue-200 text-xs rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  </motion.div>
)

export default function QuizBank() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    quizType: "quizbank",
  })
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "",
    difficulty: "",
    tags: [],
  })
  const [questions, setQuestions] = useState([])
  const [importedQuestions, setImportedQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([])
  const [currentAIQuestionIndex, setCurrentAIQuestionIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [showQuestions, setShowQuestions] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false) // AI Modal state

  // Fetch all regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getAllQuizRegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Failed to fetch quiz regions:", error)
        toast.error("Failed to load quiz data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegions()
  }, [])

  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map((et) => et.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !formData.examType) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
    return examTypeObj?.specificClasses?.map((sc) => sc.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegion || !formData.examType || !formData.specificClass) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find((sc) => sc.name === formData.specificClass)
    return classObj?.subjects?.map((subject) => subject.name) || []
  }

  const getChapters = () => {
    if (!selectedRegion || !formData.examType || !formData.specificClass || !formData.subject) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find((sc) => sc.name === formData.specificClass)
    if (!classObj) return []
    const subjectObj = classObj.subjects?.find((sub) => sub.name === formData.subject)
    return subjectObj?.chapters?.map((ch) => ch.name) || []
  }

  const isFormComplete =
    formData.region && formData.examType && formData.specificClass && formData.subject && formData.chapter

  const addTag = () => {
    if (tagInput.trim() && !newQuestion.tags.includes(tagInput.trim())) {
      setNewQuestion((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setNewQuestion((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleAIQuestionGenerated = (questionsData) => {
    // or set them directly if an array is passed.
    if (Array.isArray(questionsData)) {
      setAiGeneratedQuestions(questionsData)
      setCurrentAIQuestionIndex(0)
      setNewQuestion({
        text: questionsData[0]?.text || "",
        options: questionsData[0]?.options || { A: "", B: "", C: "", D: "" },
        correctAnswer: questionsData[0]?.correctAnswer || "",
        difficulty: questionsData[0]?.difficulty || "",
        tags: questionsData[0]?.tags || [],
      })
      toast.success(`${questionsData.length} AI-generated questions loaded!`)
    } else {
      // If a single question is passed, append it to the existing list
      setAiGeneratedQuestions((prevQuestions) => {
        const updatedQuestions = [...prevQuestions, questionsData]
        setCurrentAIQuestionIndex(updatedQuestions.length - 1) // Set to the newly added question
        setNewQuestion({
          text: questionsData.text || "",
          options: questionsData.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: questionsData.correctAnswer || "",
          difficulty: questionsData.difficulty || "",
          tags: questionsData.tags || [],
        })
        toast.success("AI-generated question added!")
        return updatedQuestions
      })
    }
  }

  const handlePreviousAIQuestion = () => {
    if (aiGeneratedQuestions.length === 0 || currentAIQuestionIndex === 0) return

    const prevIndex = currentAIQuestionIndex - 1
    setCurrentAIQuestionIndex(prevIndex)
    setNewQuestion({
      text: aiGeneratedQuestions[prevIndex]?.text || "",
      options: aiGeneratedQuestions[prevIndex]?.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: aiGeneratedQuestions[prevIndex]?.correctAnswer || "",
      difficulty: aiGeneratedQuestions[prevIndex]?.difficulty || "",
      tags: aiGeneratedQuestions[prevIndex]?.tags || [],
    })
    toast.info(`Moved to question ${prevIndex + 1} of ${aiGeneratedQuestions.length}`)
  }

  const handleNextAIQuestion = () => {
    if (aiGeneratedQuestions.length === 0 || currentAIQuestionIndex >= aiGeneratedQuestions.length - 1) return

    const nextIndex = currentAIQuestionIndex + 1
    setCurrentAIQuestionIndex(nextIndex)
    setNewQuestion({
      text: aiGeneratedQuestions[nextIndex]?.text || "",
      options: aiGeneratedQuestions[nextIndex]?.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: aiGeneratedQuestions[nextIndex]?.correctAnswer || "",
      difficulty: aiGeneratedQuestions[nextIndex]?.difficulty || "",
      tags: aiGeneratedQuestions[nextIndex]?.tags || [],
    })
    toast.info(`Moved to question ${nextIndex + 1} of ${aiGeneratedQuestions.length}`)
  }

  const saveQuestion = async () => {
    if (!newQuestion.text || !newQuestion.correctAnswer || !newQuestion.difficulty) {
      toast.error("Please fill all required fields")
      return
    }
    if (!formData.region || !formData.examType || !formData.specificClass || !formData.subject || !formData.chapter) {
      toast.error("Please fill all category fields")
      return
    }
    try {
      const regionName = regions.find((r) => r._id === formData.region)?.name || formData.region
      const payload = {
        category: {
          ...formData,
          region: regionName,
        },
        questions: [
          {
            text: newQuestion.text,
            options: newQuestion.options,
            correctAnswer: newQuestion.correctAnswer,
            difficulty: newQuestion.difficulty,
            tags: newQuestion.tags,
          },
        ],
      }
      const response = await createQuizQuestion(payload)
      const savedQuestions = response?.data?.questions || []
      setQuestions((prev) => [...prev, ...savedQuestions])

      // Handle different question flows
      if (importedQuestions.length > 0) {
        handleAddQuestion()
      } else if (aiGeneratedQuestions.length > 0) {
        // Move to next AI question or clear if last
        if (currentAIQuestionIndex < aiGeneratedQuestions.length - 1) {
          handleNextAIQuestion()
        } else {
          // Last AI question, clear the flow
          setAiGeneratedQuestions([])
          setCurrentAIQuestionIndex(0)
          setNewQuestion({
            text: "",
            options: { A: "", B: "", C: "", D: "" },
            correctAnswer: "",
            difficulty: "",
            tags: [],
          })
          toast.success("All AI questions processed!")
        }
      } else {
        // Reset form if no imported or AI questions
        setNewQuestion({
          text: "",
          options: { A: "", B: "", C: "", D: "" },
          correctAnswer: "",
          difficulty: "",
          tags: [],
        })
      }

      toast.success("Question saved successfully!")
    } catch (error) {
      console.error("Error creating question", error)
      toast.error("Failed to save question")
    }
  }

  // Handle adding imported question (Add button)
  const handleAddQuestion = () => {
    if (importedQuestions.length === 0) return

    // Save current question first, then move to next
    if (currentQuestionIndex < importedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setNewQuestion(importedQuestions[currentQuestionIndex + 1])
      toast.success(`Added question ${currentQuestionIndex + 1} of ${importedQuestions.length}`)
    } else {
      // Last question
      setImportedQuestions([])
      setCurrentQuestionIndex(0)
      setNewQuestion({
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        difficulty: "",
        tags: [],
      })
      toast.success("All imported questions processed!")
    }
  }

  // Handle skipping question (Skip button)
  const handleSkipQuestion = () => {
    if (importedQuestions.length === 0) return

    if (currentQuestionIndex < importedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setNewQuestion(importedQuestions[currentQuestionIndex + 1])
      toast.info(`Skipped question ${currentQuestionIndex + 1}, moving to next`)
    } else {
      // Last question
      setImportedQuestions([])
      setCurrentQuestionIndex(0)
      setNewQuestion({
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        difficulty: "",
        tags: [],
      })
      toast.success("Finished processing imported questions!")
    }
  }

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id))
    toast.success("Question deleted successfully!")
  }

  const handleEditQuestion = (questionId) => {
    navigate(`/update-quizbank/${questionId}`)
  }

  const filteredQuestions = questions.filter((question) => {
    const questionText = question?.text?.toLowerCase() || ""
    const tagMatches = question?.tags?.some((tag) => tag?.toLowerCase().includes(searchTerm.toLowerCase()))
    return questionText.includes(searchTerm.toLowerCase()) || tagMatches
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      toast.success(`File selected: ${file.name}`)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return
    setIsLoading(true)
    try {
      const data = await extractQuestionsFromFile(selectedFile)
      if (data.questions && data.questions.length) {
        setImportedQuestions(data.questions)
        setCurrentQuestionIndex(0)
        setNewQuestion(data.questions[0])
        console.log("Extracted questions:", data.questions)
        toast.success(`Extracted ${data.questions.length} questions successfully!`)
      } else {
        toast.error("No questions extracted from the file.")
      }
    } catch (err) {
      toast.error("Failed to extract questions: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuestionsByCategory = async () => {
    if (showQuestions) {
      setShowQuestions(false)
      return
    }
    if (!isFormComplete) {
      toast.error("Please select all category fields first")
      return
    }
    setIsFetchingQuestions(true)
    try {
      const regionName = regions.find((r) => r._id === formData.region)?.name || formData.region
      const response = await getAllQuizQuestions({
        category: {
          ...formData,
          region: regionName,
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter,
          quizType: "quizbank",
        },
      })
      const questionsArray = response?.data || []

      if (!questionsArray.length) {
        toast.error("No questions found for selected category.")
        setQuestions([])
        setShowQuestions(false)
        return
      }
      const normalizedQuestions = questionsArray.map((q) => ({
        ...q,
        id: q._id || q.id || Math.random().toString(36).slice(2, 9),
        category: q.category || {
          ...formData,
          region: regionName,
          quizType: "quizbank",
        },
      }))
      setQuestions(normalizedQuestions)
      setShowQuestions(true)
      toast.success(`Fetched ${normalizedQuestions.length} questions`)
    } catch (error) {
      console.error("Failed to fetch questions", error)
      toast.error("Failed to load questions")
    } finally {
      setIsFetchingQuestions(false)
    }
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Quiz Bank
              </h1>
              <p className="text-gray-600 text-lg">Manage and organize your quiz questions</p>
            </div>
          </motion.div>
        </div>

        {/* Question Sources Section */}
        <AnimatePresence>
          {isFormComplete && !showQuestions && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    Question Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* File Import */}
                    <Button
                      onClick={handleImport}
                      disabled={!selectedFile}
                      variant="outline"
                      className="h-16 rounded-2xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 bg-transparent"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Import File
                    </Button>

                    {/* Quiz Bank */}
                    <Button
                      onClick={fetchQuestionsByCategory}
                      variant="outline"
                      className="h-16 rounded-2xl transition-all duration-200 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 bg-transparent"
                    >
                      <Database className="w-5 h-5 mr-2" />
                      Load from Bank
                    </Button>

                    {/* AI Generator */}
                    <Button
                      onClick={() => setShowAIModal(true)}
                      variant="outline"
                      className="h-16 rounded-2xl transition-all duration-200 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 bg-transparent"
                    >
                      <Bot className="w-5 h-5 mr-2" />
                      AI Generator
                    </Button>
                  </div>

                  {/* File Upload Section */}
                  <div className="mt-6">
                    <div className="border-2 border-dashed border-blue-400 rounded-2xl p-6 text-center">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xlsx,.csv"
                          onChange={handleFileChange}
                        />
                        <Upload className="w-10 h-10 text-gray-400" />
                        <p className="font-medium text-blue-600">
                          {selectedFile ? selectedFile.name : "Upload PDF or DOC file"}
                        </p>
                        <p className="text-base text-gray-700">
                          {selectedFile
                            ? "Click on the Import Button to Get Questions"
                            : "Drag & drop or click to browse"}
                        </p>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show Questions Button - Always visible */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={fetchQuestionsByCategory}
            disabled={!isFormComplete || isFetchingQuestions}
            className={`h-12 px-6 rounded-2xl font-semibold transition-all ${
              showQuestions
                ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                : "bg-white text-purple-600 border-2 border-purple-500 hover:bg-purple-50"
            }`}
          >
            {isFetchingQuestions ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                {showQuestions ? "Hide Questions" : "Show Questions"}
              </>
            )}
          </Button>
        </div>

        {/* Main Content Area */}
        {!showQuestions ? (
          <div className="space-y-6">
            {/* Category Selection Card */}
            <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Target className="w-6 h-6" />
                  Category Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Region</Label>
                  <select
                    value={formData.region}
                    onChange={(e) => {
                      const regionId = e.target.value
                      const region = regions.find((r) => r._id === regionId)
                      setSelectedRegion(region)
                      setFormData((prev) => ({
                        ...prev,
                        region: regionId,
                        examType: "",
                        specificClass: "",
                        subject: "",
                        chapter: "",
                      }))
                    }}
                    className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Choose region</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {formData.region && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Class/Exam Type</Label>
                          <select
                            value={formData.examType}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                examType: e.target.value,
                                specificClass: "",
                                subject: "",
                                chapter: "",
                              }))
                            }
                            className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="">Choose exam type</option>
                            {getExamTypes().map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        {formData.examType && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Specific Class</Label>
                            <select
                              value={formData.specificClass}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  specificClass: e.target.value,
                                  subject: "",
                                  chapter: "",
                                }))
                              }
                              className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                              <option value="">Choose class</option>
                              {getSpecificClasses().map((cls) => (
                                <option key={cls} value={cls}>
                                  {cls}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {formData.specificClass && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Subject</Label>
                          <select
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                subject: e.target.value,
                                chapter: "",
                              }))
                            }
                            className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="">Choose subject</option>
                            {getSubjects().map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        </div>
                        {formData.subject && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Chapter/Topic</Label>
                            <select
                              value={formData.chapter}
                              onChange={(e) => setFormData((prev) => ({ ...prev, chapter: e.target.value }))}
                              className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                              <option value="">Choose chapter</option>
                              {getChapters().map((chapter) => (
                                <option key={chapter} value={chapter}>
                                  {chapter}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Add Question Form */}
            <AnimatePresence>
              {isFormComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
                      <CardTitle className="text-xl font-bold flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Plus className="w-6 h-6" />
                          Add Question
                          {importedQuestions.length > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                              {currentQuestionIndex + 1}/{importedQuestions.length}
                            </Badge>
                          )}
                          {aiGeneratedQuestions.length > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                              AI: {currentAIQuestionIndex + 1}/{aiGeneratedQuestions.length}
                            </Badge>
                          )}
                        </div>
                        {aiGeneratedQuestions.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              onClick={handlePreviousAIQuestion}
                              disabled={currentAIQuestionIndex === 0}
                              variant="outline"
                              size="sm"
                              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextAIQuestion}
                              disabled={currentAIQuestionIndex >= aiGeneratedQuestions.length - 1}
                              variant="outline"
                              size="sm"
                              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {aiGeneratedQuestions.length > 0 && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-purple-800">
                              Processing AI questions ({currentAIQuestionIndex + 1}/{aiGeneratedQuestions.length})
                            </span>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setAiGeneratedQuestions([])
                                  setCurrentAIQuestionIndex(0)
                                  setNewQuestion({
                                    text: "",
                                    options: { A: "", B: "", C: "", D: "" },
                                    correctAnswer: "",
                                    difficulty: "",
                                    tags: [],
                                  })
                                  toast.info("AI questions cleared")
                                }}
                                variant="outline"
                                size="sm"
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Clear
                              </Button>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div
                              className="bg-purple-600 h-2.5 rounded-full"
                              style={{
                                width: `${((currentAIQuestionIndex + 1) / aiGeneratedQuestions.length) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {importedQuestions.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-800">
                              Processing imported questions ({currentQuestionIndex + 1}/{importedQuestions.length})
                            </span>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleSkipQuestion}
                                variant="outline"
                                size="sm"
                                className="bg-yellow-500 text-white hover:bg-yellow-600"
                              >
                                <SkipForward className="w-4 h-4 mr-1" />
                                Skip
                              </Button>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${((currentQuestionIndex + 1) / importedQuestions.length) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <ModernTextarea
                        label="Question"
                        placeholder="Enter your question..."
                        value={newQuestion.text}
                        onChange={(value) => setNewQuestion((prev) => ({ ...prev, text: value }))}
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {["A", "B", "C", "D"].map((option) => (
                          <ModernInput
                            key={option}
                            label={`Option ${option}`}
                            placeholder={`Option ${option}...`}
                            value={newQuestion.options[option]}
                            onChange={(value) =>
                              setNewQuestion((prev) => ({
                                ...prev,
                                options: { ...prev.options, [option]: value },
                              }))
                            }
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Correct Answer</Label>
                          <select
                            value={newQuestion.correctAnswer}
                            onChange={(e) => setNewQuestion((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                            className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="">Select answer</option>
                            {["A", "B", "C", "D"].map((option) => (
                              <option key={option} value={option}>
                                Option {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Difficulty</Label>
                          <select
                            value={newQuestion.difficulty}
                            onChange={(e) => setNewQuestion((prev) => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="">Select difficulty</option>
                            {["Easy", "Average", "Hard"].map((difficulty) => (
                              <option key={difficulty} value={difficulty}>
                                {difficulty}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Tags
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add tag..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addTag()}
                            className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-xl"
                          />
                          <Button
                            onClick={addTag}
                            size="sm"
                            className="h-10 px-4 bg-blue-500 hover:bg-blue-600 rounded-xl"
                          >
                            Add
                          </Button>
                        </div>
                        {newQuestion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {newQuestion.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 rounded-full pr-1"
                              >
                                {tag}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                                  onClick={() => removeTag(tag)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={saveQuestion}
                          className="flex-1 h-12 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold rounded-2xl"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          {importedQuestions.length > 0
                            ? "Add & Next"
                            : aiGeneratedQuestions.length > 0
                              ? "Save & Next"
                              : "Save to Bank"}
                        </Button>
                        {importedQuestions.length > 0 && (
                          <Button
                            onClick={handleSkipQuestion}
                            variant="outline"
                            className="h-12 px-6 border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-semibold rounded-2xl bg-transparent"
                          >
                            <SkipForward className="w-5 h-5 mr-2" />
                            Skip
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Questions List - Only shown when showQuestions is true */
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Database className="w-6 h-6" />
                Question Bank ({filteredQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <ModernInput
                  label="Search Questions"
                  placeholder="Search by question text or tags..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  icon={Search}
                />
              </div>
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                <AnimatePresence>
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question, index) => (
                      <QuestionBankCard
                        key={question.id}
                        question={question}
                        index={index}
                        onEdit={handleEditQuestion}
                        onDelete={deleteQuestion}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-gray-500"
                    >
                      <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No questions found</p>
                      <p className="text-sm">Add questions to build your quiz bank</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* AI Modal */}
      <QuizAI
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onQuestionGenerated={handleAIQuestionGenerated}
        quizData={{
          ...formData,
          region: regions.find((r) => r._id === formData.region)?.name || formData.region,
          quizType: "quizbank",
        }}
      />
    </div>
  )
}
