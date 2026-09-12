"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllQuizRegions, createQuizQuestion, getAllQuizQuestions, extractQuestionsFromFile } from "../../../../services/operations/quizAPI"
import QuizAI from "./CreateQuizAI"
import {
  Database,
  X,
  Plus,
  Clock,
  User,
  Target,
  Tag,
  Trash2,
  Upload,
  BookOpen,
  CheckCircle,
  Bot,
  Sparkles,
  FileInput,
  FileUp,
  ImageIcon,
  StickyNote,
  ArrowLeft,
  Layers,
  ChevronRight,
  HelpCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading quiz data..." }) => (
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

function ThumbnailUploader({ preview, onFileSelect, onClear }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#187574] flex items-center gap-1">
        <ImageIcon className="w-3.5 h-3.5 text-[#0fbcb0]" />
        Quiz Cover Thumbnail
      </label>

      {preview ? (
        <div className="relative border-2 border-dashed border-[#0fbcb0] bg-[#c3faf5]/20 rounded-2xl p-3 flex items-center gap-4">
          <img src={preview || "/placeholder.svg"} alt="Quiz thumbnail" className="w-20 h-20 object-cover rounded-xl border border-[#9eece4] bg-white" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#1c1c1e]">Cover image selected</p>
            <p className="text-xs text-[#187574]">Ready for upload</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200 transition-all active:scale-95"
            aria-label="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#0fbcb0]/50 bg-[#c3faf5]/10 rounded-2xl cursor-pointer hover:border-[#0fbcb0] hover:bg-[#c3faf5]/25 transition-all">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                onFileSelect({ file, dataUrl: reader.result })
              }
              reader.readAsDataURL(file)
            }}
          />
          <div className="w-10 h-10 rounded-xl bg-white border border-[#9eece4] flex items-center justify-center text-[#0fbcb0] shadow-xs">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm text-[#1c1c1e]">Upload Cover Image</p>
            <p className="text-xs text-[#187574]">PNG, JPG up to 2MB</p>
          </div>
        </label>
      )}
    </div>
  )
}

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
            <img src={question.image || "/placeholder.svg"} alt="Question preview" className="w-16 h-16 object-contain rounded-lg bg-white border border-[#f3bee5]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1c1c1e]">Diagram attached</p>
              <p className="text-[11px] text-[#86296b]">Included in question card</p>
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

const QuestionCard = ({ question, onUpdate, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-2xl border border-[#e0e2e8] p-5 sm:p-6 space-y-5 shadow-sm hover:border-[#c7cad5] transition-all"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xs shadow-xs">
          {index + 1}
        </div>
        <h3 className="text-base font-bold text-[#1c1c1e]">Question #{index + 1}</h3>
      </div>
      <button
        onClick={onDelete}
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#c93b12] bg-[#ffedea] hover:bg-[#ff7347] hover:text-white border border-[#ff7347]/30 transition-all active:scale-95"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Remove
      </button>
    </div>

    <ModernTextarea
      label="Question Statement"
      placeholder="Enter question statement here..."
      value={question.text}
      onChange={(value) => onUpdate({ ...question, text: value })}
      rows={3}
      required
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {["A", "B", "C", "D"].map((option) => (
        <ModernInput
          key={option}
          label={`Option ${option}`}
          placeholder={`Enter option ${option}...`}
          value={question.options[option] || ""}
          onChange={(value) =>
            onUpdate({
              ...question,
              options: { ...question.options, [option]: value },
            })
          }
          required
        />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
          Correct Answer <span className="text-red-500">*</span>
        </label>
        <select
          value={question.correctAnswer}
          onChange={(e) => onUpdate({ ...question, correctAnswer: e.target.value })}
          className="w-full h-12 px-3.5 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
        >
          <option value="">Select correct answer</option>
          {["A", "B", "C", "D"].map((option) => (
            <option key={option} value={option}>
              Option {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
          Difficulty Level <span className="text-red-500">*</span>
        </label>
        <select
          value={question.difficulty}
          onChange={(e) => onUpdate({ ...question, difficulty: e.target.value })}
          className="w-full h-12 px-3.5 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
        >
          <option value="">Select difficulty</option>
          {["Easy", "Average", "Hard"].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>

    <QuestionImageAndNote question={question} onUpdate={onUpdate} />
  </motion.div>
)

export default function CreateQuiz() {
  const [formData, setFormData] = useState({
    quizTitle: "",
    description: "",
    thumbnailimage: "",
    region: "",
    examType: "",
    duration: "",
    specificClass: "",
    subject: "",
    chapter: "",
    quizType: "createquiz",
    author: "",
    language: "",
  })

  const [regions, setRegions] = useState([])
  const selectedRegion = regions.find((region) => region._id === formData.region)
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [importedQuestions, setImportedQuestions] = useState([])
  const [quizBankQuestions, setQuizBankQuestions] = useState([])
  const [currentQuizBankIndex, setCurrentQuizBankIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeSource, setActiveSource] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true)
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
    if (!selectedRegion?.examTypes) return []
    return selectedRegion.examTypes.map((type) => type.name)
  }

  const getSpecificClasses = () => {
    if (!formData.examType || !selectedRegion) return []
    const examTypeObj = selectedRegion.examTypes.find((type) => type.name === formData.examType)
    return examTypeObj?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!formData.specificClass || !selectedRegion) return []
    const examTypeObj = selectedRegion.examTypes.find((type) => type.name === formData.examType)
    const classObj = examTypeObj?.specificClasses?.find((cls) => cls.name === formData.specificClass)
    return classObj?.subjects?.map((sub) => sub.name) || []
  }

  const getChapters = () => {
    if (!formData.subject || !selectedRegion) return []
    const examTypeObj = selectedRegion.examTypes.find((type) => type.name === formData.examType)
    const classObj = examTypeObj?.specificClasses?.find((cls) => cls.name === formData.specificClass)
    const subjectObj = classObj?.subjects?.find((sub) => sub.name === formData.subject)
    return subjectObj?.chapters?.map((ch) => ch.name) || []
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        difficulty: "Average",
        tags: [],
        image: "",
        note: "",
      },
    ])
  }

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
  }

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const isFormComplete =
    formData.quizTitle &&
    formData.region &&
    formData.examType &&
    formData.specificClass &&
    formData.subject

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      toast.success(`File selected: ${file.name}`)
    }
  }

  const handleExtractQuestions = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first")
      return
    }

    try {
      setIsLoading(true)
      const extracted = await extractQuestionsFromFile(selectedFile)

      if (extracted && extracted.length > 0) {
        setImportedQuestions(extracted)
        setCurrentQuestionIndex(0)
        toast.success(`Extracted ${extracted.length} questions successfully!`)
      } else {
        toast.error("No questions found in the file")
      }
    } catch (error) {
      console.error("Error extracting questions:", error)
      toast.error("Failed to extract questions: " + (error.message || "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImportedQuestion = () => {
    if (importedQuestions.length === 0) return

    const questionToAdd = importedQuestions[currentQuestionIndex]
    setQuestions([...questions, questionToAdd])

    if (currentQuestionIndex < importedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      toast.success(`Added question ${currentQuestionIndex + 1} of ${importedQuestions.length}`)
    } else {
      setImportedQuestions([])
      setCurrentQuestionIndex(0)
      toast.success("All imported questions processed!")
    }
  }

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await getAllQuizQuestions()
      const allQuestions = response?.data || []

      const filtered = allQuestions.filter(
        (q) =>
          q.category?.region === selectedRegion?.name &&
          q.category?.examType === formData.examType &&
          q.category?.specificClass === formData.specificClass &&
          q.category?.subject === formData.subject &&
          (!formData.chapter || q.category?.chapter === formData.chapter)
      )

      if (filtered.length > 0) {
        setQuizBankQuestions(filtered)
        setCurrentQuizBankIndex(0)
        setActiveSource("quizBank")
        toast.success(`Found ${filtered.length} questions in Quiz Bank`)
      } else {
        toast.info("No matching questions found in Quiz Bank")
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast.error("Failed to fetch questions from Quiz Bank")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddQuizBankQuestion = () => {
    if (quizBankQuestions.length === 0) return

    const questionToAdd = quizBankQuestions[currentQuizBankIndex]
    setQuestions([
      ...questions,
      {
        text: questionToAdd.text,
        options: questionToAdd.options,
        correctAnswer: questionToAdd.correctAnswer,
        difficulty: questionToAdd.difficulty || "Average",
        tags: questionToAdd.tags || [],
        image: questionToAdd.image || "",
        note: questionToAdd.note || "",
      },
    ])

    if (currentQuizBankIndex < quizBankQuestions.length - 1) {
      setCurrentQuizBankIndex(currentQuizBankIndex + 1)
      toast.success(`Added question ${currentQuizBankIndex + 1} of ${quizBankQuestions.length}`)
    } else {
      setQuizBankQuestions([])
      setCurrentQuizBankIndex(0)
      setActiveSource(null)
      toast.success("All quiz bank questions processed!")
    }
  }

  const handleCreateQuiz = async () => {
    if (!formData.region || !formData.examType || !formData.specificClass || !formData.subject) {
      toast.error("Please complete all category fields")
      return
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question")
      return
    }

    const invalidQuestions = questions.filter(
      (q) => !q.text || !q.options.A || !q.options.B || !q.options.C || !q.options.D || !q.correctAnswer
    )

    if (invalidQuestions.length > 0) {
      toast.error("Please complete all question fields (text, all 4 options, and correct answer)")
      return
    }

    try {
      setIsLoading(true)

      const payload = {
        category: {
          quizTitle: formData.quizTitle,
          region: selectedRegion?.name,
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter,
          duration: formData.duration || 30,
          author: formData.author || "Admin",
          quizType: "createquiz",
          description: formData.description || "",
          thumbnailimage: formData.thumbnailimage,
        },
        questions: questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          tags: q.tags || [],
          image: q.image || "",
          note: q.note || "",
        })),
      }

      await createQuizQuestion(payload)

      toast.success(`Quiz created successfully with ${questions.length} questions!`)
      navigate("/view-quiz")
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast.error("Failed to create quiz: " + (error.message || "Server error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Consistent Top Bar (Same as Posts) */}
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
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              NEW QUIZ
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

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>STEP-BY-STEP QUIZ BUILDER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Create Quiz
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Configure taxonomy hierarchy, basic parameters, and compile question sets.
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && <MiroLoader message="Processing quiz builder..." />}

        {/* Step 1: Configuration Card (Lavender / Blue Accent Palette matching Posts) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-5 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Quiz Setup & Taxonomy</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <ModernInput
              label="Quiz Title"
              placeholder="e.g. Thermodynamics Chapter 1 Quiz"
              value={formData.quizTitle}
              onChange={(value) => setFormData({ ...formData, quizTitle: value })}
              icon={Tag}
              required
            />
            <ModernInput
              label="Duration (minutes)"
              type="number"
              placeholder="e.g. 30"
              value={formData.duration || ""}
              onChange={(value) => setFormData({ ...formData, duration: value })}
              icon={Clock}
              required
            />
            <ModernInput
              label="Author / Faculty"
              placeholder="e.g. Prof. Sharma"
              value={formData.author || ""}
              onChange={(value) => setFormData({ ...formData, author: value })}
              icon={User}
            />
          </div>

          {/* Taxonomy Selectors (Colored Boxes matching Posts createArticles.jsx) */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-2.5">
              Taxonomy Hierarchy <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Region (Yellow tint) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                  1. Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => {
                    const selectedRegionId = e.target.value
                    setFormData({
                      ...formData,
                      region: selectedRegionId,
                      examType: "",
                      specificClass: "",
                      subject: "",
                      chapter: "",
                    })
                  }}
                  className="w-full h-11 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
                >
                  <option value="">Choose region...</option>
                  {regions.map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Type (Teal tint) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                  2. Exam Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.examType}
                  disabled={!formData.region}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examType: e.target.value,
                      specificClass: "",
                      subject: "",
                      chapter: "",
                    })
                  }
                  className={`w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all ${
                    !formData.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose exam type...</option>
                  {getExamTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Class (Rose tint) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">
                  3. Specific Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.specificClass}
                  disabled={!formData.examType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specificClass: e.target.value,
                      subject: "",
                      chapter: "",
                    })
                  }
                  className={`w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#86296b] transition-all ${
                    !formData.examType ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose class...</option>
                  {getSpecificClasses().map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject (Orange tint) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">
                  4. Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  disabled={!formData.specificClass}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subject: e.target.value,
                      chapter: "",
                    })
                  }
                  className={`w-full h-11 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all ${
                    !formData.specificClass ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose subject...</option>
                  {getSubjects().map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter (Lavender tint) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                  5. Chapter
                </label>
                <select
                  value={formData.chapter}
                  disabled={!formData.subject || getChapters().length === 0}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  className={`w-full h-11 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all ${
                    !formData.subject || getChapters().length === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose chapter (optional)</option>
                  {getChapters().map((chapterName) => (
                    <option key={chapterName} value={chapterName}>
                      {chapterName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description & Thumbnail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
            <ThumbnailUploader
              preview={formData.thumbnailimage}
              onFileSelect={({ file, dataUrl }) => {
                setFormData((prev) => ({ ...prev, thumbnailimage: dataUrl }))
              }}
              onClear={() => setFormData((prev) => ({ ...prev, thumbnailimage: "" }))}
            />

            <ModernTextarea
              label="Quiz Description"
              placeholder="Write a short summary of instructions, coverage, and scoring rules..."
              value={formData.description || ""}
              onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
              rows={4}
            />
          </div>
        </div>

        {/* Step 2: Question Sources & Builder Card (when category complete) */}
        <AnimatePresence>
          {isFormComplete && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-[#0fbcb0]" />
                  <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                    Question Set ({questions.length})
                  </h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
                  Step 2 of 2
                </span>
              </div>

              {/* Source Action Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={fetchQuestions}
                  className={`h-12 px-4 rounded-full font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    activeSource === "quizBank"
                      ? "bg-[#1c1c1e] text-white shadow-sm"
                      : "bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe] hover:bg-[#ede9fe]"
                  }`}
                >
                  <Database className="w-4 h-4" />
                  Quiz Bank
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSource(activeSource === "fileImport" ? null : "fileImport")}
                  className={`h-12 px-4 rounded-full font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    activeSource === "fileImport"
                      ? "bg-[#1c1c1e] text-white shadow-sm"
                      : "bg-[#c3faf5]/60 text-[#187574] border border-[#9eece4] hover:bg-[#c3faf5]"
                  }`}
                >
                  <FileInput className="w-4 h-4" />
                  Import File
                </button>

                <button
                  type="button"
                  onClick={handleExtractQuestions}
                  disabled={!selectedFile}
                  className={`h-12 px-4 rounded-full font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    activeSource === "extract"
                      ? "bg-[#1c1c1e] text-white shadow-sm"
                      : "bg-[#ffe6cd]/60 text-[#7c3a00] border border-[#fcd0a1] hover:bg-[#ffe6cd] disabled:opacity-40"
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  Extract Questions
                </button>

                <button
                  type="button"
                  onClick={() => setShowAIModal(true)}
                  className="h-12 px-4 rounded-full font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 bg-[#ffd8f4]/60 text-[#86296b] border border-[#f3bee5] hover:bg-[#ffd8f4]"
                >
                  <Bot className="w-4 h-4" />
                  AI Generator
                </button>
              </div>

              {/* File Upload Drop Area */}
              {activeSource === "fileImport" && (
                <div className="relative border-2 border-dashed border-[#0fbcb0] bg-[#c3faf5]/15 rounded-2xl p-6 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveSource(null)}
                    className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1.5 rounded-full border border-red-200"
                    aria-label="Close upload area"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xlsx,.csv"
                      onChange={handleFileChange}
                    />
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#9eece4] flex items-center justify-center text-[#0fbcb0]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-sm text-[#1c1c1e]">{selectedFile ? selectedFile.name : "Select PDF or DOC Question File"}</p>
                    <p className="text-xs text-[#187574]">
                      {selectedFile ? "Click 'Extract Questions' button above to parse" : "Click or drag file here"}
                    </p>
                  </label>
                </div>
              )}

              {/* Imported Questions Cycler */}
              {importedQuestions.length > 0 && (
                <div className="border border-[#9eece4] bg-[#c3faf5]/20 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h4 className="text-sm font-bold text-[#1c1c1e]">
                      Imported Question {currentQuestionIndex + 1} of {importedQuestions.length}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-semibold text-[#1c1c1e] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(importedQuestions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === importedQuestions.length - 1}
                        className="px-4 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-semibold text-[#1c1c1e] disabled:opacity-40"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        onClick={handleAddImportedQuestion}
                        className="px-4 py-1.5 rounded-full bg-[#1c1c1e] text-white text-xs font-bold flex items-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to Quiz
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#9eece4] space-y-2.5">
                    <p className="font-semibold text-sm text-[#1c1c1e]">{importedQuestions[currentQuestionIndex]?.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {["A", "B", "C", "D"].map((opt) => (
                        <div key={opt} className="p-2 rounded-lg bg-[#f7f8fa] text-xs flex items-center gap-2">
                          <span className="font-bold text-[#4262ff]">{opt}:</span>
                          <span>{importedQuestions[currentQuestionIndex]?.options?.[opt]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-bold text-[#1c1c1e]">
                      Correct Answer: <span className="text-[#0fbcb0] font-black">{importedQuestions[currentQuestionIndex]?.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Bank Questions Cycler */}
              {quizBankQuestions.length > 0 && activeSource === "quizBank" && (
                <div className="border border-[#ddd6fe] bg-[#f5f3ff] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h4 className="text-sm font-bold text-[#1c1c1e]">
                      Quiz Bank Question {currentQuizBankIndex + 1} of {quizBankQuestions.length}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentQuizBankIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuizBankIndex === 0}
                        className="px-4 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-semibold text-[#1c1c1e] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentQuizBankIndex((prev) => Math.min(quizBankQuestions.length - 1, prev + 1))}
                        disabled={currentQuizBankIndex === quizBankQuestions.length - 1}
                        className="px-4 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-semibold text-[#1c1c1e] disabled:opacity-40"
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={handleAddQuizBankQuestion}
                        className="px-4 py-1.5 rounded-full bg-[#1c1c1e] text-white text-xs font-bold flex items-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to Quiz
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#ddd6fe] space-y-2.5">
                    <p className="font-semibold text-sm text-[#1c1c1e]">{quizBankQuestions[currentQuizBankIndex]?.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {["A", "B", "C", "D"].map((opt) => (
                        <div key={opt} className="p-2 rounded-lg bg-[#f7f8fa] text-xs flex items-center gap-2">
                          <span className="font-bold text-[#4262ff]">{opt}:</span>
                          <span>{quizBankQuestions[currentQuizBankIndex]?.options?.[opt]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id || index}
                      question={question}
                      index={index}
                      onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                      onDelete={() => deleteQuestion(index)}
                    />
                  ))}
                </AnimatePresence>

                {questions.length === 0 && (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#c7cad5] bg-[#fafbfc]">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-[#8e91a0]" />
                    <p className="text-base font-bold text-[#1c1c1e]">No questions added yet</p>
                    <p className="text-xs text-[#555a6a] mt-0.5">Add questions manually, import from file, or generate with AI.</p>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white text-xs font-bold hover:bg-[#2c2c34] active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Question
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-6 border-t border-[#e0e2e8] flex justify-start">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] font-semibold text-sm transition-all active:scale-95 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Question</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Bar matching Posts createArticles.jsx */}
        {Boolean(formData.subject) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={handleCreateQuiz}
              disabled={isLoading}
              className="px-8 py-3.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] rounded-full font-extrabold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#1c1c1e]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing Quiz...</span>
                </>
              ) : (
                <>
                  <span>Publish Quiz</span>
                  <Sparkles className="w-4 h-4 text-[#1c1c1e]" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/view-quiz")}
              className="px-8 py-3.5 bg-white border border-[#c7cad5] text-[#1c1c1e] rounded-full hover:bg-[#f7f8fa] font-semibold text-sm transition-all shadow-sm"
            >
              Cancel Quiz
            </button>
          </div>
        )}

        {/* AI Popover Modal */}
        <QuizAI
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onQuestionGenerated={(question) => {
            setQuestions((prev) => (Array.isArray(prev) ? [question, ...prev] : [question]))
          }}
          quizData={{
            ...formData,
            duration: formData.duration || 30,
            author: formData.author || "User",
          }}
        />
      </div>
    </div>
  )
}