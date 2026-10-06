"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  getAllQuizRegions,
  createQuizQuestion,
  getAllQuizQuestions,
  extractQuestionsFromFile,
  getAllQuizzesWithCategoryAndQuestions,
  deleteQuizBankQuestion,
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
  Filter,
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
      <div className="flex items-center gap-2.5 flex-wrap">
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

        {question.category && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#555a6a]">
            {question.category.region && (
              <span className="px-2 py-0.5 rounded-md bg-[#fff8e0] text-[#746019] border border-[#fde89c]">
                {question.category.region}
              </span>
            )}
            {question.category.examType && (
              <>
                <span className="text-[#8e91a0]">›</span>
                <span className="px-2 py-0.5 rounded-md bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  {question.category.examType}
                </span>
              </>
            )}
            {question.category.specificClass && (
              <>
                <span className="text-[#8e91a0]">›</span>
                <span className="px-2 py-0.5 rounded-md bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
                  {question.category.specificClass}
                </span>
              </>
            )}
            {question.category.subject && (
              <>
                <span className="text-[#8e91a0]">›</span>
                <span className="px-2 py-0.5 rounded-md bg-[#ffe6cd] text-[#7c3a00] border border-[#fcd0a1]">
                  {question.category.subject}
                </span>
              </>
            )}
            {question.category.chapter && (
              <>
                <span className="text-[#8e91a0]">›</span>
                <span className="px-2 py-0.5 rounded-md bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
                  {question.category.chapter}
                </span>
              </>
            )}
          </div>
        )}
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
          onClick={() => onDelete(question)}
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
  const [stagedQuestions, setStagedQuestions] = useState([])
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

  // Saved Bank Quizzes state for browsing questions that actually exist
  const [bankQuizzes, setBankQuizzes] = useState([])
  const [isFetchingBankQuizzes, setIsFetchingBankQuizzes] = useState(false)
  const [viewFilter, setViewFilter] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })

  const fetchBankQuizzes = async () => {
    try {
      setIsFetchingBankQuizzes(true)
      const response = await getAllQuizzesWithCategoryAndQuestions()
      const data = response?.data || []
      setBankQuizzes(data)
    } catch (err) {
      console.error("Failed to load bank quizzes:", err)
    } finally {
      setIsFetchingBankQuizzes(false)
    }
  }

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
    fetchBankQuizzes()
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

  const handleImport = async (fileArg) => {
    const file = fileArg || selectedFile
    if (!file) {
      toast.error("Please select a file to import")
      return
    }

    try {
      setIsLoading(true)
      const data = await extractQuestionsFromFile(file)
      if (data && data.length > 0) {
        const formatted = data.map((q) => ({
          id: q._id || q.id || Math.random().toString(36).slice(2, 9),
          text: q.text || "",
          options: q.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: q.correctAnswer || "A",
          difficulty: q.difficulty || "Average",
          tags: q.tags || [],
          image: q.image || "",
          note: q.note || "",
          source: "File",
        }))

        setStagedQuestions((prev) => [...prev, ...formatted])
        setImportedQuestions(data)
        setCurrentQuestionIndex(0)
        setNewQuestion({
          text: formatted[0].text,
          options: formatted[0].options,
          correctAnswer: formatted[0].correctAnswer,
          difficulty: formatted[0].difficulty,
          tags: formatted[0].tags,
          image: formatted[0].image,
          note: formatted[0].note,
        })
        toast.success(`Extracted ${formatted.length} question(s) from file and added to staging queue!`)
      } else {
        toast.error("No questions extracted from the file.")
      }
    } catch (err) {
      toast.error("Failed to extract questions: " + err.message)
    } finally {
      setIsLoading(false)
      setSelectedFile(null)
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

  const handleAIQuestionGenerated = (incoming) => {
    if (!incoming) return
    const incomingList = Array.isArray(incoming) ? incoming : [incoming]

    const formatted = incomingList.map((q) => ({
      id: q._id || q.id || Math.random().toString(36).slice(2, 9),
      text: q.text || "",
      options: q.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: q.correctAnswer || "A",
      difficulty: q.difficulty || "Average",
      tags: q.tags || [],
      image: q.image || "",
      note: q.note || "",
      source: "AI",
    }))

    setStagedQuestions((prev) => {
      const existingTexts = new Set(prev.map((item) => item.text))
      const toAdd = formatted.filter((item) => !existingTexts.has(item.text))
      return [...prev, ...toAdd]
    })

    setAiGeneratedQuestions((prev) => {
      const updated = [...prev, ...incomingList]
      if (prev.length === 0 && updated.length > 0) {
        setCurrentAIQuestionIndex(0)
        setNewQuestion({
          text: updated[0]?.text || "",
          options: updated[0]?.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: updated[0]?.correctAnswer || "",
          difficulty: updated[0]?.difficulty || "Average",
          tags: updated[0]?.tags || [],
          image: updated[0]?.image || "",
          note: updated[0]?.note || "",
        })
      }
      return updated
    })

    toast.success(`Added ${formatted.length} AI question(s) to staging queue!`)
  }

  const handleAddManualToStaged = () => {
    if (!newQuestion.text || !newQuestion.correctAnswer || !newQuestion.difficulty) {
      toast.error("Please fill statement, options, and select a correct answer")
      return
    }
    if (!newQuestion.options.A || !newQuestion.options.B) {
      toast.error("Please provide at least options A and B")
      return
    }

    const questionToAdd = {
      id: Math.random().toString(36).slice(2, 9),
      text: newQuestion.text,
      options: { ...newQuestion.options },
      correctAnswer: newQuestion.correctAnswer,
      difficulty: newQuestion.difficulty,
      tags: [...newQuestion.tags],
      image: newQuestion.image || "",
      note: newQuestion.note || "",
      source: "Manual",
    }

    setStagedQuestions((prev) => [...prev, questionToAdd])
    toast.success("Question added to staging queue!")

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

  const handleEditStagedQuestion = (qToEdit) => {
    setNewQuestion({
      text: qToEdit.text || "",
      options: qToEdit.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: qToEdit.correctAnswer || "",
      difficulty: qToEdit.difficulty || "Average",
      tags: qToEdit.tags || [],
      image: qToEdit.image || "",
      note: qToEdit.note || "",
    })
    setStagedQuestions((prev) => prev.filter((q) => q.id !== qToEdit.id))
    toast("Loaded question into editor! Modify and click 'Add to Queue' or 'Save Question'.", { icon: "ℹ️" })
    setTimeout(() => {
      const el = document.getElementById("question-details-editor")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleRemoveStagedQuestion = (qId) => {
    setStagedQuestions((prev) => prev.filter((q) => q.id !== qId))
    toast("Removed question from queue", { icon: "🗑️" })
  }

  const saveAllStagedQuestions = async () => {
    if (stagedQuestions.length === 0) {
      toast.error("No questions in the staging queue to save")
      return
    }
    if (!isFormComplete) {
      toast.error("Please complete all 5 Category Hierarchy fields first")
      return
    }

    try {
      setIsLoading(true)
      const regionName = regions.find((r) => r._id === formData.region)?.name || formData.region
      const payload = {
        category: {
          ...formData,
          region: regionName,
          quizType: "quizbank",
        },
        questions: stagedQuestions.map((q) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty || "Average",
          tags: q.tags || [],
          image: q.image || "",
          note: q.note || "",
        })),
      }

      await createQuizQuestion(payload)
      toast.success(`All ${stagedQuestions.length} questions saved to Quiz Bank!`)
      setStagedQuestions([])
      setAiGeneratedQuestions([])
      setImportedQuestions([])
      setNewQuestion({
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        difficulty: "Average",
        tags: [],
        image: "",
        note: "",
      })
      fetchBankQuizzes()
    } catch (error) {
      console.error("Error saving staged questions:", error)
      toast.error("Failed to save questions to Quiz Bank")
    } finally {
      setIsLoading(false)
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
      setIsLoading(true)
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
      fetchBankQuizzes()
    } catch (error) {
      console.error("Error creating question", error)
      toast.error("Failed to save question")
    } finally {
      setIsLoading(false)
    }
  }

  // Only quizzes that have questions AND belong to an official region in the Quiz Region Tree
  const validBankQuizzes = useMemo(() => {
    if (!regions || regions.length === 0) {
      return bankQuizzes.filter((q) => q.questions && q.questions.length > 0)
    }

    const officialMap = new Map(
      regions.map((r) => [r.name?.trim()?.toLowerCase(), r.name?.trim()])
    )

    return bankQuizzes
      .filter((q) => q.questions && q.questions.length > 0)
      .filter((q) => {
        const reg = q.category?.region?.trim()?.toLowerCase()
        return reg && officialMap.has(reg)
      })
      .map((q) => {
        const officialName = officialMap.get(q.category?.region?.trim()?.toLowerCase())
        return {
          ...q,
          category: {
            ...q.category,
            region: officialName || q.category?.region,
          },
        }
      })
  }, [bankQuizzes, regions])

  // Total questions count across the bank
  const totalBankQuestionsCount = useMemo(() => {
    return validBankQuizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)
  }, [validBankQuizzes])

  // 1. Regions with questions
  const availableRegions = useMemo(() => {
    const map = new Map()
    validBankQuizzes.forEach((q) => {
      const r = q.category?.region
      if (r) {
        map.set(r, (map.get(r) || 0) + (q.questions?.length || 0))
      }
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [validBankQuizzes])

  // 2. Exam types with questions for selected region
  const availableExamTypes = useMemo(() => {
    if (!viewFilter.region) return []
    const map = new Map()
    validBankQuizzes
      .filter((q) => q.category?.region === viewFilter.region)
      .forEach((q) => {
        const et = q.category?.examType
        if (et) {
          map.set(et, (map.get(et) || 0) + (q.questions?.length || 0))
        }
      })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [validBankQuizzes, viewFilter.region])

  // 3. Classes with questions for selected exam type
  const availableClasses = useMemo(() => {
    if (!viewFilter.region || !viewFilter.examType) return []
    const map = new Map()
    validBankQuizzes
      .filter(
        (q) =>
          q.category?.region === viewFilter.region &&
          q.category?.examType === viewFilter.examType
      )
      .forEach((q) => {
        const c = q.category?.specificClass
        if (c) {
          map.set(c, (map.get(c) || 0) + (q.questions?.length || 0))
        }
      })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [validBankQuizzes, viewFilter.region, viewFilter.examType])

  // 4. Subjects with questions for selected class
  const availableSubjects = useMemo(() => {
    if (!viewFilter.region || !viewFilter.examType || !viewFilter.specificClass) return []
    const map = new Map()
    validBankQuizzes
      .filter(
        (q) =>
          q.category?.region === viewFilter.region &&
          q.category?.examType === viewFilter.examType &&
          q.category?.specificClass === viewFilter.specificClass
      )
      .forEach((q) => {
        const s = q.category?.subject
        if (s) {
          map.set(s, (map.get(s) || 0) + (q.questions?.length || 0))
        }
      })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [validBankQuizzes, viewFilter.region, viewFilter.examType, viewFilter.specificClass])

  // 5. Chapters with questions for selected subject
  const availableChapters = useMemo(() => {
    if (
      !viewFilter.region ||
      !viewFilter.examType ||
      !viewFilter.specificClass ||
      !viewFilter.subject
    )
      return []
    const map = new Map()
    validBankQuizzes
      .filter(
        (q) =>
          q.category?.region === viewFilter.region &&
          q.category?.examType === viewFilter.examType &&
          q.category?.specificClass === viewFilter.specificClass &&
          q.category?.subject === viewFilter.subject
      )
      .forEach((q) => {
        const ch = q.category?.chapter
        if (ch) {
          map.set(ch, (map.get(ch) || 0) + (q.questions?.length || 0))
        }
      })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [
    validBankQuizzes,
    viewFilter.region,
    viewFilter.examType,
    viewFilter.specificClass,
    viewFilter.subject,
  ])

  // Matching questions for the selected filter
  const matchingQuestions = useMemo(() => {
    let filtered = validBankQuizzes
    if (viewFilter.region) {
      filtered = filtered.filter((q) => q.category?.region === viewFilter.region)
    }
    if (viewFilter.examType) {
      filtered = filtered.filter((q) => q.category?.examType === viewFilter.examType)
    }
    if (viewFilter.specificClass) {
      filtered = filtered.filter((q) => q.category?.specificClass === viewFilter.specificClass)
    }
    if (viewFilter.subject) {
      filtered = filtered.filter((q) => q.category?.subject === viewFilter.subject)
    }
    if (viewFilter.chapter) {
      filtered = filtered.filter((q) => q.category?.chapter === viewFilter.chapter)
    }

    const allQ = []
    filtered.forEach((quiz) => {
      ;(quiz.questions || []).forEach((q) => {
        allQ.push({
          ...q,
          id: q._id || q.id || Math.random().toString(36).slice(2, 9),
          category: quiz.category,
        })
      })
    })
    return allQ
  }, [validBankQuizzes, viewFilter])

  const handleViewFilterChange = (field, value) => {
    setShowQuestions(false)
    setViewFilter((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "region") {
        next.examType = ""
        next.specificClass = ""
        next.subject = ""
        next.chapter = ""
      } else if (field === "examType") {
        next.specificClass = ""
        next.subject = ""
        next.chapter = ""
      } else if (field === "specificClass") {
        next.subject = ""
        next.chapter = ""
      } else if (field === "subject") {
        next.chapter = ""
      }
      return next
    })
  }

  const clearViewFilter = () => {
    setShowQuestions(false)
    setViewFilter({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
  }

  const handleViewQuestionsClick = () => {
    if (matchingQuestions.length === 0) {
      toast.error("No questions found in Quiz Bank.")
      return
    }
    setQuestions(matchingQuestions)
    setShowQuestions(true)
    toast.success(
      viewFilter.region
        ? `Loaded ${matchingQuestions.length} questions for ${viewFilter.region}!`
        : `Loaded all ${matchingQuestions.length} questions from Quiz Bank!`
    )
    setTimeout(() => {
      const el = document.getElementById("bank-questions-card")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const deleteQuestion = async (qItem) => {
    const qId = qItem?.id || qItem?._id || qItem
    const qText = qItem?.text
    if (!window.confirm("Are you sure you want to delete this question?")) return
    try {
      if (qText) {
        await deleteQuizBankQuestion(qText)
      }
      setQuestions((prev) =>
        prev.filter((q) => q.id !== qId && q._id !== qId && (qText ? q.text !== qText : true))
      )
      setBankQuizzes((prev) =>
        prev.map((quiz) => ({
          ...quiz,
          questions: (quiz.questions || []).filter(
            (q) => q._id !== qId && q.id !== qId && (qText ? q.text !== qText : true)
          ),
        }))
      )
      toast.success("Question deleted successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete question")
    }
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

        {/* ============================================================== */}
        {/* 1. FILTER CARD: BROWSE QUESTIONS THAT ACTUALLY EXIST IN BANK */}
        {/* ============================================================== */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-5 w-full">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Browse & Filter Saved Questions
                </h2>
                <p className="text-xs text-[#555a6a]">
                  Only regions and categories with questions in the bank are shown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe] shadow-2xs">
                {totalBankQuestionsCount} Total Questions in Bank
              </span>
              {(viewFilter.region || viewFilter.examType || viewFilter.specificClass || viewFilter.subject || viewFilter.chapter) && (
                <button
                  type="button"
                  onClick={clearViewFilter}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-white text-gray-600 hover:text-red-500 border border-[#c7cad5] hover:border-red-200 transition-all flex items-center gap-1 shadow-2xs"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Filter</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Select Region Pills if any exist */}
          {availableRegions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              <span className="text-xs font-bold text-[#555a6a]">Regions with Questions:</span>
              {availableRegions.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => handleViewFilterChange("region", r.name === viewFilter.region ? "" : r.name)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    viewFilter.region === r.name
                      ? "bg-[#1c1c1e] text-white border-[#1c1c1e] shadow-sm scale-102"
                      : "bg-white text-[#1c1c1e] border-[#c7cad5] hover:border-[#1c1c1e]"
                  }`}
                >
                  {r.name} <span className="opacity-75 text-[10px]">({r.count})</span>
                </button>
              ))}
            </div>
          )}

          {/* 5-Dropdown Hierarchy Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. Region */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                1. Region <span className="text-red-500">*</span>
              </label>
              <select
                value={viewFilter.region}
                onChange={(e) => handleViewFilterChange("region", e.target.value)}
                className="w-full h-11 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
              >
                <option value="">
                  {availableRegions.length === 0
                    ? "No questions found in bank"
                    : "Choose region with questions"}
                </option>
                {availableRegions.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name} ({r.count} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Exam Type */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                2. Exam Type
              </label>
              <select
                value={viewFilter.examType}
                disabled={!viewFilter.region || availableExamTypes.length === 0}
                onChange={(e) => handleViewFilterChange("examType", e.target.value)}
                className={`w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all ${
                  !viewFilter.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">
                  {availableExamTypes.length === 0
                    ? "No exam types"
                    : `All Exam Types (${availableExamTypes.reduce((a, b) => a + b.count, 0)})`}
                </option>
                {availableExamTypes.map((et) => (
                  <option key={et.name} value={et.name}>
                    {et.name} ({et.count} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Class */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">
                3. Class
              </label>
              <select
                value={viewFilter.specificClass}
                disabled={!viewFilter.examType || availableClasses.length === 0}
                onChange={(e) => handleViewFilterChange("specificClass", e.target.value)}
                className={`w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] transition-all ${
                  !viewFilter.examType ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">
                  {availableClasses.length === 0
                    ? "No classes"
                    : `All Classes (${availableClasses.reduce((a, b) => a + b.count, 0)})`}
                </option>
                {availableClasses.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Subject */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">
                4. Subject
              </label>
              <select
                value={viewFilter.subject}
                disabled={!viewFilter.specificClass || availableSubjects.length === 0}
                onChange={(e) => handleViewFilterChange("subject", e.target.value)}
                className={`w-full h-11 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all ${
                  !viewFilter.specificClass ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">
                  {availableSubjects.length === 0
                    ? "No subjects"
                    : `All Subjects (${availableSubjects.reduce((a, b) => a + b.count, 0)})`}
                </option>
                {availableSubjects.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.count} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Chapter */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                5. Chapter
              </label>
              <select
                value={viewFilter.chapter}
                disabled={!viewFilter.subject || availableChapters.length === 0}
                onChange={(e) => handleViewFilterChange("chapter", e.target.value)}
                className={`w-full h-11 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all ${
                  !viewFilter.subject ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">
                  {availableChapters.length === 0
                    ? "No chapters"
                    : `All Chapters (${availableChapters.reduce((a, b) => a + b.count, 0)})`}
                </option>
                {availableChapters.map((ch) => (
                  <option key={ch.name} value={ch.name}>
                    {ch.name} ({ch.count} questions)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Footer: View Questions Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#ddd6fe]/60">
            <div className="text-xs font-semibold text-[#555a6a]">
              {viewFilter.region ? (
                <div className="flex flex-wrap items-center gap-1">
                  <span>Target:</span>
                  <span className="font-bold text-[#1c1c1e]">{viewFilter.region}</span>
                  {viewFilter.examType && <><span>›</span><span className="font-bold text-[#1c1c1e]">{viewFilter.examType}</span></>}
                  {viewFilter.specificClass && <><span>›</span><span className="font-bold text-[#1c1c1e]">{viewFilter.specificClass}</span></>}
                  {viewFilter.subject && <><span>›</span><span className="font-bold text-[#1c1c1e]">{viewFilter.subject}</span></>}
                  {viewFilter.chapter && <><span>›</span><span className="font-bold text-[#1c1c1e]">{viewFilter.chapter}</span></>}
                </div>
              ) : (
                <span>Pick a region above to filter and inspect questions</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={matchingQuestions.length === 0}
                onClick={handleViewQuestionsClick}
                className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
                  matchingQuestions.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#1c1c1e] hover:bg-[#2c2c34] text-white"
                }`}
              >
                <Eye className="w-4 h-4 text-[#ffd02f]" />
                <span>
                  {viewFilter.region
                    ? `View Questions (${matchingQuestions.length})`
                    : `View All Questions (${matchingQuestions.length})`}
                </span>
              </button>

              {showQuestions && (
                <button
                  type="button"
                  onClick={() => setShowQuestions(false)}
                  className="px-4 py-2.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-bold text-xs sm:text-sm transition-all"
                >
                  Hide Questions
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Existing Questions List Card (Displayed when View Questions clicked) */}
        {showQuestions && (
          <div id="bank-questions-card" className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full scroll-mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#4262ff]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                  Bank Questions ({filteredQuestions.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestions(false)}
                className="p-1.5 rounded-full bg-[#f7f8fa] hover:bg-gray-200 text-gray-600 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e91a0]" />
              <input
                type="text"
                placeholder="Filter loaded questions by text or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff]"
              />
            </div>

            {isFetchingBankQuizzes ? (
              <MiroLoader message="Fetching saved questions..." />
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#c7cad5] rounded-2xl p-6">
                <Database className="w-10 h-10 text-[#8e91a0] mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#1c1c1e]">No questions found for this selection</h3>
                <p className="text-xs sm:text-sm text-[#555a6a] mt-1">Try another category filter or search keyword</p>
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

        {/* ============================================================== */}
        {/* 2. SECTION: ADD NEW QUESTIONS TO BANK */}
        {/* ============================================================== */}
        <div className="pt-6 border-t border-[#e0e2e8] space-y-1">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#0fbcb0]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#1c1c1e]">
              Add New Questions to Bank
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#555a6a]">
            Select target region and category structure below to author questions or use AI/file import.
          </p>
        </div>

        {/* Step 1 Card: Category Hierarchy (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Category Hierarchy Selection</h2>
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
              onClick={() => {
                setAiGeneratedQuestions([])
                setCurrentAIQuestionIndex(0)
                setShowAIModal(true)
              }}
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
                    handleImport(file)
                  }
                }}
              />
            </label>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGED QUESTIONS QUEUE: ACCUMULATED FROM AI, FILE, OR MANUAL  */}
        {/* ============================================================== */}
        {isFormComplete && stagedQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#fffdf5] rounded-2xl border-2 border-[#fcd0a1] shadow-sm p-5 sm:p-7 space-y-5 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#fcd0a1]">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xs shadow-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                    Questions Ready to Save ({stagedQuestions.length})
                  </h2>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {stagedQuestions.filter((q) => q.source === "AI").length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
                        {stagedQuestions.filter((q) => q.source === "AI").length} AI
                      </span>
                    )}
                    {stagedQuestions.filter((q) => q.source === "File").length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                        {stagedQuestions.filter((q) => q.source === "File").length} File
                      </span>
                    )}
                    {stagedQuestions.filter((q) => q.source === "Manual").length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fff8e0] text-[#746019] border border-[#fde89c]">
                        {stagedQuestions.filter((q) => q.source === "Manual").length} Manual
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#555a6a]">
                  All questions generated from AI, imported from file, or created manually are collected here. Review, edit, and save all together into Quiz Bank.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Clear all questions from the staging queue?")) {
                      setStagedQuestions([])
                      toast("Queue cleared", { icon: "🗑️" })
                    }
                  }}
                  className="px-4 py-2.5 rounded-full bg-white border border-[#c7cad5] text-gray-600 hover:text-red-500 hover:border-red-200 text-xs font-bold transition-all shadow-2xs"
                >
                  Clear Queue
                </button>
                <button
                  type="button"
                  onClick={saveAllStagedQuestions}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#ffd02f]" />
                  <span>Save All {stagedQuestions.length} to Quiz Bank</span>
                </button>
              </div>
            </div>

            {/* List of staged questions */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {stagedQuestions.map((q, index) => (
                <div
                  key={q.id || index}
                  className="p-4 rounded-xl bg-white border border-[#fcd0a1] hover:border-[#ff7347] transition-all space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              q.source === "AI"
                                ? "bg-[#ffd8f4] text-[#86296b]"
                                : q.source === "File"
                                ? "bg-[#c3faf5] text-[#187574]"
                                : "bg-[#fff8e0] text-[#746019]"
                            }`}
                          >
                            {q.source || "Manual"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f7f8fa] text-[#555a6a]">
                            {q.difficulty || "Average"}
                          </span>
                          {q.correctAnswer && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#c3faf5] text-[#187574]">
                              Ans: Option {q.correctAnswer}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#1c1c1e] leading-snug line-clamp-2">
                          {q.text}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditStagedQuestion(q)}
                        className="p-1.5 rounded-lg bg-[#f7f8fa] hover:bg-blue-50 text-blue-600 border border-transparent hover:border-blue-200 transition-all text-xs font-bold flex items-center gap-1"
                        title="Edit in form below"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-[#f7f8fa] hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 transition-all text-xs font-bold"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                    {["A", "B", "C", "D"].map((key) => (
                      <div
                        key={key}
                        className={`p-2 rounded-lg text-xs font-medium border truncate ${
                          q.correctAnswer === key
                            ? "bg-[#c3faf5]/60 border-[#9eece4] text-[#187574] font-bold"
                            : "bg-[#f7f8fa] border-[#e0e2e8] text-[#555a6a]"
                        }`}
                      >
                        <span className="font-bold mr-1.5">{key}:</span>
                        <span>{q.options?.[key] || "—"}</span>
                      </div>
                    ))}
                  </div>

                  {q.note && (
                    <p className="text-xs text-[#7c3a00] bg-[#ffe6cd]/30 p-2 rounded-lg border border-[#fcd0a1] truncate">
                      <span className="font-bold">Note:</span> {q.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2 Card: Question Editor Form */}
        {isFormComplete && (
          <div id="question-details-editor" className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
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
                <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                  {/* Primary: Add current question to the staging queue */}
                  <button
                    type="button"
                    onClick={handleAddManualToStaged}
                    className="w-full sm:w-auto px-7 py-3 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold rounded-full text-sm shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question to Queue</span>
                  </button>

                  {/* Secondary: Save single question immediately */}
                  <button
                    type="button"
                    onClick={saveQuestion}
                    className="w-full sm:w-auto px-6 py-3 bg-white border border-[#c7cad5] hover:bg-[#f7f8fa] text-[#1c1c1e] font-bold rounded-full text-sm shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-[#4262ff]" />
                    <span>Save This Question Directly</span>
                  </button>

                  {/* Tertiary: Save all staged questions if any exist */}
                  {stagedQuestions.length > 0 && (
                    <button
                      type="button"
                      onClick={saveAllStagedQuestions}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-7 py-3 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-extrabold rounded-full text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#ffd02f]" />
                      <span>Save All {stagedQuestions.length} Queued to Bank</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
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
                  className="w-full sm:w-auto px-4 py-2.5 text-gray-500 hover:text-gray-800 hover:bg-[#f7f8fa] font-bold rounded-full text-xs transition-all"
                >
                  Clear Form
                </button>
              </div>
            </div>
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
