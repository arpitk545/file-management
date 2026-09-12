"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  getAllQuizRegions,
  createQuizQuestion,
  getAllQuizQuestions,
  extractQuestionsFromFile,
} from "../../../../services/operations/quizAPI"
import QuizAI from "./CreateQuizAI"
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
  ImageIcon,
  StickyNote,
  ArrowLeft,
  BookOpen,
  Layers,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading question bank..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon, required = false }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
      {Icon && <Icon className="w-3.5 h-3.5 inline mr-1 text-[#4262ff]" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
    />
  </div>
)

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 3, required = false }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all resize-none"
    />
  </div>
)

function QuestionImageAndNote({ question, onUpdate }) {
  const handleSelect = (file) => {
    const reader = new FileReader()
    reader.onload = () => onUpdate({ ...question, image: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4 pt-3 border-t border-[#e0e2e8]">
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b] flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5 text-[#d1259e]" />
          Question Diagram / Image (optional)
        </label>

        {question.image ? (
          <div className="relative border border-[#f3bee5] bg-[#ffd8f4]/20 rounded-xl p-2.5 flex items-center gap-3">
            <img src={question.image || "/placeholder.svg"} alt="Question" className="w-16 h-16 object-contain rounded-lg bg-white border border-[#f3bee5]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1c1c1e]">Diagram attached</p>
              <p className="text-[11px] text-[#86296b]">Included with question</p>
            </div>
            <button
              type="button"
              onClick={() => onUpdate({ ...question, image: "" })}
              className="p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#f3bee5] bg-[#ffd8f4]/15 rounded-xl cursor-pointer hover:border-[#d1259e] hover:bg-[#ffd8f4]/25 transition-all">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleSelect(file)
              }}
            />
            <Upload className="w-4 h-4 text-[#d1259e]" />
            <span className="text-xs font-bold text-[#1c1c1e]">Upload Question Image</span>
            <span className="text-[11px] text-[#86296b]">(PNG/JPG)</span>
          </label>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00] flex items-center gap-1">
          <StickyNote className="w-3.5 h-3.5 text-[#ff7347]" />
          Explanation / Solution Note (optional)
        </label>
        <textarea
          placeholder="Add an explanatory note or hint for this question..."
          value={question.note || ""}
          onChange={(e) => onUpdate({ ...question, note: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all resize-none"
        />
      </div>
    </div>
  )
}

const QuestionBankCard = ({ question, onEdit, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-2xl border border-[#e0e2e8] p-5 sm:p-6 shadow-sm hover:border-[#c7cad5] transition-all space-y-4"
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#ffd02f] rounded-full flex items-center justify-center font-bold text-xs text-[#1c1c1e] shadow-xs">
          {index + 1}
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            question.difficulty === "Easy"
              ? "bg-[#c3faf5] text-[#187574] border-[#9eece4]"
              : question.difficulty === "Hard"
                ? "bg-[#fbd4d4] text-[#800000] border-[#e3c5c5]"
                : "bg-[#fff8e0] text-[#746019] border-[#fde89c]"
          }`}
        >
          {question.difficulty || "Average"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onEdit(question.id || question._id)}
          className="p-1.5 text-[#d97706] hover:bg-[#fff8e0] rounded-full transition-colors active:scale-95"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(question.id || question._id)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>

    <p className="text-sm sm:text-base font-bold text-[#1c1c1e] leading-relaxed">{question.text}</p>

    {question.image && (
      <div className="p-2 bg-[#f7f8fa] rounded-xl border border-[#e0e2e8] max-w-sm">
        <img src={question.image || "/placeholder.svg"} alt="Diagram" className="max-h-36 object-contain mx-auto rounded-lg" />
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
      {Object.entries(question.options || {}).map(([key, val]) => (
        <div
          key={key}
          className={`p-3 rounded-xl border flex items-center gap-2 ${
            question.correctAnswer === key
              ? "bg-[#c3faf5]/30 border-[#0fbcb0] text-[#00655d] font-bold"
              : "bg-white border-[#e0e2e8] text-[#1c1c1e]"
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            question.correctAnswer === key ? "bg-[#0fbcb0] text-white" : "bg-[#f7f8fa] text-[#555a6a]"
          }`}>
            {key}
          </span>
          <span className="truncate">{val}</span>
        </div>
      ))}
    </div>

    {question.note && (
      <div className="p-3 bg-[#ffe6cd]/30 rounded-xl border border-[#fcd0a1] text-xs text-[#7c3a00]">
        <span className="font-bold">Explanation:</span> {question.note}
      </div>
    )}
  </motion.div>
)

export default function QuizBank() {
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })

  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "",
    difficulty: "Average",
    tags: [],
    image: "",
    note: "",
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [importedQuestions, setImportedQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([])
  const [currentAIQuestionIndex, setCurrentAIQuestionIndex] = useState(0)
  const [quizBankViewQuestions, setQuizBankViewQuestions] = useState([])
  const [currentViewQuestionIndex, setCurrentViewQuestionIndex] = useState(0)
  const [showBankViewCard, setShowBankViewCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [showAIModal, setShowAIModal] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQuizRegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Failed to load regions:", error)
        toast.error("Failed to load quiz regions")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegions()
  }, [])

  const getExamTypes = () => selectedRegion?.examTypes?.map((t) => t.name) || []
  const getSpecificClasses = () => {
    if (!formData.examType || !selectedRegion) return []
    const examTypeObj = selectedRegion.examTypes.find((t) => t.name === formData.examType)
    return examTypeObj?.specificClasses?.map((c) => c.name) || []
  }
  const getSubjects = () => {
    if (!formData.specificClass || !selectedRegion) return []
    const examTypeObj = selectedRegion.examTypes.find((t) => t.name === formData.examType)
    const classObj = examTypeObj?.specificClasses?.find((c) => c.name === formData.specificClass)
    return classObj?.subjects?.map((s) => s.name) || []
  }
  const getChapters = () => {
    if (!formData.subject || !selectedRegion) return []
    const examTypeObj = selectedRegion.examTypes.find((t) => t.name === formData.examType)
    const classObj = examTypeObj?.specificClasses?.find((c) => c.name === formData.specificClass)
    const subjectObj = classObj?.subjects?.find((s) => s.name === formData.subject)
    return subjectObj?.chapters?.map((ch) => ch.name) || []
  }

  const isFormComplete =
    formData.region &&
    formData.examType &&
    formData.specificClass &&
    formData.subject &&
    formData.chapter

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import")
      return
    }

    try {
      setIsLoading(true)
      const data = await extractQuestionsFromFile(selectedFile)
      if (data && data.length > 0) {
        setImportedQuestions(data)
        setCurrentQuestionIndex(0)
        setNewQuestion(data[0])
        toast.success(`Extracted ${data.length} questions successfully!`)
      } else {
        toast.error("No questions extracted from the file.")
      }
    } catch (err) {
      toast.error("Failed to extract questions: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

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
    if (Array.isArray(questionsData)) {
      setAiGeneratedQuestions(questionsData)
      setCurrentAIQuestionIndex(0)
      setNewQuestion({
        text: questionsData[0]?.text || "",
        options: questionsData[0]?.options || { A: "", B: "", C: "", D: "" },
        correctAnswer: questionsData[0]?.correctAnswer || "",
        difficulty: questionsData[0]?.difficulty || "Average",
        tags: questionsData[0]?.tags || [],
        image: questionsData[0]?.image || "",
        note: questionsData[0]?.note || "",
      })
      toast.success(`${questionsData.length} AI questions loaded!`)
    }
  }

  const handleNextAIQuestion = () => {
    if (aiGeneratedQuestions.length === 0 || currentAIQuestionIndex >= aiGeneratedQuestions.length - 1) return
    const nextIndex = currentAIQuestionIndex + 1
    setCurrentAIQuestionIndex(nextIndex)
    setNewQuestion({
      text: aiGeneratedQuestions[nextIndex]?.text || "",
      options: aiGeneratedQuestions[nextIndex]?.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: aiGeneratedQuestions[nextIndex]?.correctAnswer || "",
      difficulty: aiGeneratedQuestions[nextIndex]?.difficulty || "Average",
      tags: aiGeneratedQuestions[nextIndex]?.tags || [],
      image: aiGeneratedQuestions[nextIndex]?.image || "",
      note: aiGeneratedQuestions[nextIndex]?.note || "",
    })
  }

  const handlePreviousAIQuestion = () => {
    if (aiGeneratedQuestions.length === 0 || currentAIQuestionIndex === 0) return
    const prevIndex = currentAIQuestionIndex - 1
    setCurrentAIQuestionIndex(prevIndex)
    setNewQuestion({
      text: aiGeneratedQuestions[prevIndex]?.text || "",
      options: aiGeneratedQuestions[prevIndex]?.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: aiGeneratedQuestions[prevIndex]?.correctAnswer || "",
      difficulty: aiGeneratedQuestions[prevIndex]?.difficulty || "Average",
      tags: aiGeneratedQuestions[prevIndex]?.tags || [],
      image: aiGeneratedQuestions[prevIndex]?.image || "",
      note: aiGeneratedQuestions[prevIndex]?.note || "",
    })
  }

  const saveQuestion = async () => {
    if (!newQuestion.text || !newQuestion.correctAnswer || !newQuestion.difficulty) {
      toast.error("Please fill all required fields (statement, options, correct answer)")
      return
    }
    if (!isFormComplete) {
      toast.error("Please complete all taxonomy category fields")
      return
    }

    try {
      const regionName = regions.find((r) => r._id === formData.region)?.name || formData.region
      const payload = {
        category: {
          ...formData,
          region: regionName,
          quizType: "quizbank",
        },
        questions: [
          {
            text: newQuestion.text,
            options: newQuestion.options,
            correctAnswer: newQuestion.correctAnswer,
            difficulty: newQuestion.difficulty,
            tags: newQuestion.tags,
            image: newQuestion.image || "",
            note: newQuestion.note || "",
          },
        ],
      }
      await createQuizQuestion(payload)

      if (aiGeneratedQuestions.length > 0 && currentAIQuestionIndex < aiGeneratedQuestions.length - 1) {
        handleNextAIQuestion()
      } else if (importedQuestions.length > 0 && currentQuestionIndex < importedQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setNewQuestion(importedQuestions[currentQuestionIndex + 1])
      } else {
        setNewQuestion({
          text: "",
          options: { A: "", B: "", C: "", D: "" },
          correctAnswer: "",
          difficulty: "Average",
          tags: [],
          image: "",
          note: "",
        })
      }

      toast.success("Question saved to Quiz Bank!")
    } catch (error) {
      console.error("Error creating question", error)
      toast.error("Failed to save question")
    }
  }

  const showQuestionsListView = async () => {
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
        return
      }

      const normalized = questionsArray.map((q) => ({
        ...q,
        id: q._id || q.id || Math.random().toString(36).slice(2, 9),
        category: q.category || {
          ...formData,
          region: regionName,
          quizType: "quizbank",
        },
      }))

      setQuestions(normalized)
      setShowQuestions(true)
      toast.success(`Loaded ${normalized.length} questions`)
    } catch (error) {
      console.error("Failed to fetch questions", error)
      toast.error("Failed to load questions")
    } finally {
      setIsFetchingQuestions(false)
    }
  }

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id && q._id !== id))
    toast.success("Question removed from list!")
  }

  const filteredQuestions = questions.filter((question) => {
    const questionText = question?.text?.toLowerCase() || ""
    const tagMatches = question?.tags?.some((tag) => tag?.toLowerCase().includes(searchTerm.toLowerCase()))
    return questionText.includes(searchTerm.toLowerCase()) || tagMatches
  })

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Posts Pattern) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              QUIZ STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              QUESTION BANK
            </span>
          </div>
          <button
            onClick={() => navigate("/view-quiz")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <span>View All Quizzes</span>
            <Sparkles className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Quiz Question Bank
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Author, import, and catalog reusable questions by curriculum category, level, and chapter.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && <MiroLoader message="Processing question bank..." />}

        {/* Step 1 Card: Category Hierarchy (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Curriculum Taxonomy Hierarchy</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Region (Yellow) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                1. Region <span className="text-red-500">*</span>
              </label>
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
                className="w-full h-11 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
              >
                <option value="">Choose region</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type (Teal) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                2. Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.examType}
                disabled={!formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    examType: e.target.value,
                    specificClass: "",
                    subject: "",
                    chapter: "",
                  }))
                }
                className={`w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all ${
                  !formData.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose exam type</option>
                {getExamTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class (Rose) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">
                3. Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.specificClass}
                disabled={!formData.examType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specificClass: e.target.value,
                    subject: "",
                    chapter: "",
                  }))
                }
                className={`w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] transition-all ${
                  !formData.examType ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose class</option>
                {getSpecificClasses().map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject (Orange) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">
                4. Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject}
                disabled={!formData.specificClass}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subject: e.target.value,
                    chapter: "",
                  }))
                }
                className={`w-full h-11 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all ${
                  !formData.specificClass ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose subject</option>
                {getSubjects().map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter (Lavender) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                5. Chapter <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.chapter}
                disabled={!formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, chapter: e.target.value }))}
                className={`w-full h-11 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all ${
                  !formData.subject ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose chapter</option>
                {getChapters().map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Source Trigger Pills (When Taxonomy Complete) */}
        {isFormComplete && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5] hover:bg-[#ffd8f4]/80 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-xs"
            >
              <Bot className="w-4 h-4" />
              <span>AI Question Generator</span>
            </button>
            <label className="px-5 py-2.5 rounded-full bg-[#c3faf5] text-[#187574] border border-[#9eece4] hover:bg-[#c3faf5]/80 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs">
              <Upload className="w-4 h-4" />
              <span>Import Questions File</span>
              <input
                type="file"
                accept=".docx,.pdf,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    handleImport()
                  }
                }}
              />
            </label>
            <button
              onClick={showQuestionsListView}
              disabled={isFetchingQuestions}
              className="px-5 py-2.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs"
            >
              <Eye className="w-4 h-4 text-[#4262ff]" />
              <span>{showQuestions ? "Hide Question List" : "View Saved Questions"}</span>
            </button>
          </div>
        )}

        {/* Step 2 Card: Question Editor Form */}
        {isFormComplete && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-[#0fbcb0]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                  Question Details
                </h2>
                {aiGeneratedQuestions.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b]">
                    AI Question {currentAIQuestionIndex + 1} of {aiGeneratedQuestions.length}
                  </span>
                )}
                {importedQuestions.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574]">
                    Imported {currentQuestionIndex + 1} of {importedQuestions.length}
                  </span>
                )}
              </div>

              {/* Cycle Controls */}
              {aiGeneratedQuestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousAIQuestion}
                    disabled={currentAIQuestionIndex === 0}
                    className="p-1.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextAIQuestion}
                    disabled={currentAIQuestionIndex >= aiGeneratedQuestions.length - 1}
                    className="p-1.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <ModernTextarea
                label="Question Statement"
                placeholder="Type question text..."
                value={newQuestion.text}
                onChange={(value) => setNewQuestion((prev) => ({ ...prev, text: value }))}
                rows={3}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["A", "B", "C", "D"].map((option) => (
                  <ModernInput
                    key={option}
                    label={`Option ${option}`}
                    placeholder={`Enter option ${option}...`}
                    value={newQuestion.options[option] || ""}
                    onChange={(value) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        options: { ...prev.options, [option]: value },
                      }))
                    }
                    required
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                    Correct Answer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full h-12 px-3.5 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
                  >
                    <option value="">Select correct answer</option>
                    {["A", "B", "C", "D"].map((opt) => (
                      <option key={opt} value={opt}>
                        Option {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full h-12 px-3.5 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
                  >
                    <option value="">Select difficulty</option>
                    {["Easy", "Average", "Hard"].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <QuestionImageAndNote question={newQuestion} onUpdate={setNewQuestion} />

              {/* Tags */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Tags & Keywords</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Type tag & press Enter"
                    className="flex-1 h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="h-12 px-6 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-sm shadow-sm transition-all"
                  >
                    Add
                  </button>
                </div>

                {newQuestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {newQuestion.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
                      >
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="p-0.5 hover:text-red-500">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e0e2e8]">
                <button
                  type="button"
                  onClick={saveQuestion}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold rounded-full text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {importedQuestions.length > 0
                      ? "Save & Next Imported"
                      : aiGeneratedQuestions.length > 0
                        ? "Save & Next AI"
                        : "Save Question to Bank"}
                  </span>
                </button>

                {(importedQuestions.length > 0 || aiGeneratedQuestions.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (importedQuestions.length > 0 && currentQuestionIndex < importedQuestions.length - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1)
                        setNewQuestion(importedQuestions[currentQuestionIndex + 1])
                      } else if (aiGeneratedQuestions.length > 0 && currentAIQuestionIndex < aiGeneratedQuestions.length - 1) {
                        handleNextAIQuestion()
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-bold rounded-full text-sm transition-all shadow-sm"
                  >
                    Skip Question
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Existing Questions List Card */}
        {showQuestions && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#4262ff]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                  Bank Questions ({filteredQuestions.length})
                </h2>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e91a0]" />
              <input
                type="text"
                placeholder="Filter saved questions by text or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff]"
              />
            </div>

            {isFetchingQuestions ? (
              <MiroLoader message="Fetching saved questions..." />
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#c7cad5] rounded-2xl p-6">
                <Database className="w-10 h-10 text-[#8e91a0] mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#1c1c1e]">No questions found in this category</h3>
                <p className="text-xs sm:text-sm text-[#555a6a] mt-1">Add your first question to populate the bank</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => (
                  <QuestionBankCard
                    key={q.id || q._id || idx}
                    question={q}
                    index={idx}
                    onEdit={(qId) => navigate(`/update-quizbank/${qId}`)}
                    onDelete={deleteQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
    </div>
  )
}
