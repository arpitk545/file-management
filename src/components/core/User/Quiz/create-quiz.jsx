"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  getAllQuizRegions,
  createQuizQuestion,
  getAllQuizQuestions,
  extractQuestionsFromFile,
} from "../../../../services/operations/quizAPI"
import QuizAI from "../../Admin/Quiz/CreateQuizAI"
import QuizBankSelector from "./QuizBankSelector"
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
  Sparkles,
  FileInput,
  FileUp,
  Image as ImageIcon,
  StickyNote,
  ArrowLeft,
  Bot,
  HelpCircle,
  FileText,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

// Progress Indicator - Miro Style (Pill steps)
const ProgressIndicator = ({ currentStep, totalSteps = 5 }) => {
  const stepLabels = ["Region", "Exam", "Class", "Subject", "Chapter"]

  return (
    <div className="w-full bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
        {stepLabels.map((label, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isCompleted
                    ? "bg-[#ffd02f] text-[#1c1c1e]"
                    : isCurrent
                    ? "bg-[#1c1c1e] text-white"
                    : "bg-[#f7f8fa] text-[#555a6a] border border-[#c7cad5]"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold">
                  {isCompleted ? "✓" : index + 1}
                </span>
                <span className="text-[11px] tracking-wide uppercase font-semibold">{label}</span>
              </div>
              {index < totalSteps - 1 && (
                <div className={`w-4 sm:w-8 h-[2px] rounded-full ${isCompleted ? "bg-[#ffd02f]" : "bg-[#e0e2e8]"}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Miro Thumbnail Uploader (Complete aspect ratio fit, no cropping)
function ThumbnailUploader({ preview, onFileSelect, onClear }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
        Quiz Cover Thumbnail (Optional)
      </label>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#c7cad5] bg-[#f0f1f4] h-48 flex items-center justify-center p-3">
          <img src={preview} alt="Quiz thumbnail" className="w-full h-full object-contain object-center" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[#600000] hover:bg-[#fbd4d4] border border-[#e3c5c5] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Remove thumbnail"
            title="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed border-[#c7cad5] hover:border-[#1c1c1e] rounded-2xl bg-[#fafbfc] cursor-pointer transition-colors">
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
          <div className="w-10 h-10 rounded-full bg-[#fff4c4] text-[#746019] flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-[#1c1c1e]">Upload Cover Image</p>
            <p className="text-[11px] text-[#555a6a]">PNG, JPG, WEBP up to 2MB (Full image displayed)</p>
          </div>
        </label>
      )}
    </div>
  )
}

// Per-question image upload + note
function QuestionImageAndNote({ question, onUpdate }) {
  const handleSelect = (file) => {
    const reader = new FileReader()
    reader.onload = () => onUpdate({ ...question, image: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#e6e8ec]">
      {/* Image Uploader */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
          Question Diagram / Image (Optional)
        </label>

        {question.image ? (
          <div className="relative border border-[#c7cad5] rounded-xl overflow-hidden bg-[#f0f1f4] h-36 flex items-center justify-center p-2">
            <img src={question.image} alt="Question Diagram" className="w-full h-full object-contain object-center" />
            <button
              type="button"
              onClick={() => onUpdate({ ...question, image: "" })}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-[#600000] hover:bg-[#fbd4d4] border border-[#e3c5c5] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-[#c7cad5] hover:border-[#1c1c1e] rounded-xl bg-white cursor-pointer transition-colors h-36">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleSelect(file)
              }}
            />
            <div className="text-center">
              <ImageIcon className="w-5 h-5 text-[#555a6a] mx-auto mb-1" />
              <p className="text-xs font-medium text-[#1c1c1e]">Add diagram or photo</p>
              <p className="text-[10px] text-[#555a6a]">PNG or JPG format</p>
            </div>
          </label>
        )}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
          Explanatory Note / Solution (Optional)
        </label>
        <textarea
          placeholder="Add an explanatory hint or answer explanation..."
          value={question.note || ""}
          onChange={(e) => onUpdate({ ...question, note: e.target.value })}
          rows={5}
          className="w-full p-3 bg-white border border-[#c7cad5] rounded-xl text-xs font-normal text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] resize-none h-36"
        />
      </div>
    </div>
  )
}

// Question Card - Miro card-base
const QuestionCard = ({ question, onUpdate, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-6 space-y-4 transition-all"
  >
    <div className="flex items-center justify-between pb-3 border-b border-[#e6e8ec]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center text-xs font-semibold">
          {index + 1}
        </div>
        <h3 className="text-sm font-medium text-[#1c1c1e]">Question {index + 1}</h3>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#600000] bg-[#fbd4d4] hover:bg-[#ffc6c6] border border-[#e3c5c5] transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Remove</span>
      </button>
    </div>

    {/* Question Prompt */}
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
        Question Prompt
      </label>
      <textarea
        placeholder="Enter your question text here..."
        value={question.text}
        onChange={(e) => onUpdate({ ...question, text: e.target.value })}
        rows={3}
        className="w-full p-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] resize-none"
      />
    </div>

    {/* Options A, B, C, D */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {["A", "B", "C", "D"].map((option) => (
        <div key={option} className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
            Option {option}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555a6a]">
              {option}.
            </span>
            <input
              type="text"
              placeholder={`Enter option ${option} content...`}
              value={question.options[option] || ""}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  options: { ...question.options, [option]: e.target.value },
                })
              }
              className="w-full h-11 pl-8 pr-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
            />
          </div>
        </div>
      ))}
    </div>

    {/* Answer & Difficulty Selectors */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
          Correct Answer
        </label>
        <div className="grid grid-cols-4 gap-2">
          {["A", "B", "C", "D"].map((option) => {
            const isSelected = question.correctAnswer === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onUpdate({ ...question, correctAnswer: option })}
                className={`h-10 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#1c1c1e] text-white border-[#1c1c1e]"
                    : "bg-white text-[#1c1c1e] border-[#c7cad5] hover:bg-[#f7f8fa]"
                }`}
              >
                Option {option}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Easy", color: "bg-[#c3faf5] text-[#187574] border-[#0fbcb0]/30" },
            { label: "Average", color: "bg-[#fff4c4] text-[#746019] border-[#fde89c]" },
            { label: "Hard", color: "bg-[#ffd8f4] text-[#86296b] border-[#ffd8f4]" },
          ].map(({ label, color }) => {
            const isSelected = question.difficulty === label
            return (
              <button
                key={label}
                type="button"
                onClick={() => onUpdate({ ...question, difficulty: label })}
                className={`h-10 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? `${color} border-2 border-current font-semibold shadow-xs`
                    : "bg-white text-[#555a6a] border-[#c7cad5] hover:bg-[#f7f8fa]"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>

    <QuestionImageAndNote question={question} onUpdate={onUpdate} />
  </motion.div>
)

export default function BuildQuiz() {
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
    passcode: "",
  })

  const [regions, setRegions] = useState([])
  const selectedRegion = regions.find((region) => region._id === formData.region)
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [quizBankQuestions, setQuizBankQuestions] = useState([])
  const [importedQuestions, setImportedQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeSource, setActiveSource] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const navigate = useNavigate()

  // Fetch regions
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

  // Update current step based on form completion
  useEffect(() => {
    let step = 0
    if (formData.region) step = 1
    if (formData.examType) step = 2
    if (formData.specificClass) step = 3
    if (formData.subject) step = 4
    if (formData.chapter) step = 5
    setCurrentStep(step)
  }, [formData])

  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !formData.examType) return []
    const selectedExamType = selectedRegion.examTypes.find((et) => et.name === formData.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegion || !formData.examType || !formData.specificClass) return []
    const selectedExamType = selectedRegion.examTypes.find((et) => et.name === formData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === formData.specificClass
    )
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  const getChapters = () => {
    if (!selectedRegion || !formData.examType || !formData.specificClass || !formData.subject) return []
    const selectedExamType = selectedRegion.examTypes.find((et) => et.name === formData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(
      (sc) => sc.name === formData.specificClass
    )
    const selectedSubject = selectedSpecificClass?.subjects.find((sub) => sub.name === formData.subject)
    return selectedSubject?.chapters?.map((ch) => ch.name) || []
  }

  // Question management
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      image: "",
      note: "",
      options: { A: "", B: "", C: "", D: "" },
      correctAnswer: "",
      difficulty: "Easy",
      tags: [],
    }
    setQuestions((prev) => (Array.isArray(prev) ? [...prev, newQuestion] : [newQuestion]))
  }

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
  }

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  // File import handling
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setActiveSource("fileImport")
      toast.success(`File selected: ${file.name}`)
    }
  }

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const selectedRegionObj = regions.find((region) => region._id === formData.region)

      const payload = {
        category: {
          region: selectedRegionObj?.name || "",
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter,
          quizType: "quizbank",
        },
      }
      const response = await getAllQuizQuestions(payload)
      const list = response?.data || []

      if (!list || list.length === 0) {
        toast.error(`No questions found in Quiz Bank for ${selectedRegionObj?.name || "selected category"}`)
        setQuizBankQuestions([])
        setActiveSource(null)
      } else {
        setQuizBankQuestions(list)
        setActiveSource("quizBank")
        toast.success(`Found ${list.length} questions in Quiz Bank. Review and add below.`)
      }
    } catch (error) {
      toast.error(`Failed to fetch questions from Quiz Bank.`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExtractQuestions = async () => {
    if (!selectedFile) return
    setIsLoading(true)

    try {
      const data = await extractQuestionsFromFile(selectedFile)
      if (data?.questions && data.questions.length) {
        setImportedQuestions(data.questions)
        setCurrentQuestionIndex(0)
        setQuestions(data.questions)
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

  const handleAddImportedQuestion = () => {
    if (importedQuestions.length === 0) return

    setQuestions((prevQuestions) =>
      Array.isArray(prevQuestions)
        ? [importedQuestions[currentQuestionIndex], ...prevQuestions]
        : [importedQuestions[currentQuestionIndex]]
    )

    if (currentQuestionIndex < importedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      toast.success(`Added question ${currentQuestionIndex + 1} of ${importedQuestions.length}`)
    } else {
      setImportedQuestions([])
      setCurrentQuestionIndex(0)
      toast.success("All imported questions added to quiz!")
    }
  }

  const isFormComplete = Boolean(
    formData.region &&
    formData.examType &&
    formData.specificClass &&
    formData.subject &&
    formData.chapter
  )

  const handleCreateQuiz = async () => {
    if (!isFormComplete) {
      toast.error("Please complete all category fields")
      return
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question")
      return
    }

    try {
      setIsLoading(true)
      const regionName = selectedRegion?.name || ""
      const payload = {
        category: {
          quizTitle: formData.quizTitle,
          description: formData.description,
          thumbnailimage: formData.thumbnailimage,
          language: formData.language,
          duration: formData.duration,
          author: formData.author,
          region: regionName,
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter,
          quizType: formData.quizType,
          passcode: formData.passcode,
          approvalStatus: "Approved",
        },
        questions: questions.map((q) => ({
          text: q.text,
          image: q.image || "",
          note: q.note || "",
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          tags: q.tags || [],
        })),
      }

      await createQuizQuestion(payload)

      toast.success(`Quiz created successfully with ${questions.length} questions!`)
      navigate("/view-quiz")

      // Reset
      setQuestions([])
      setFormData({
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
        passcode: "",
      })
      setSelectedFile(null)
      setImportedQuestions([])
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast.error("Failed to create quiz: " + (error.message || "Server error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c7cad5] bg-white text-xs font-medium text-[#1c1c1e] hover:bg-[#f7f8fa] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                QUIZ BUILDER
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                ACADEMIC SUITE
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#1c1c1e]">
              Build Custom Quiz
            </h1>
            <p className="text-xs sm:text-sm text-[#555a6a] max-w-2xl leading-relaxed">
              Configure curriculum metadata, upload optional cover art, and compose multiple-choice questions from the quiz bank, file extraction, AI generator, or manual composition.
            </p>
          </div>
        </div>

        {/* Stepper Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={5} />

        {/* Section 1: Configuration Card - Miro card-base */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#e6e8ec]">
            <div className="w-8 h-8 rounded-lg bg-[#fff4c4] flex items-center justify-center text-[#746019]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-medium text-[#1c1c1e]">1. Quiz Configuration</h2>
              <p className="text-xs text-[#555a6a]">Set basic information, duration, and passcode</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Quiz Title
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Physics Benchmark Test"
                value={formData.quizTitle}
                onChange={(e) => setFormData({ ...formData, quizTitle: e.target.value })}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Duration (Minutes)
              </label>
              <input
                type="number"
                placeholder="e.g. 30"
                value={formData.duration || ""}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Author Name
              </label>
              <input
                type="text"
                placeholder="e.g. Faculty of Science"
                value={formData.author || ""}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
              />
            </div>
          </div>

          {/* Description & Thumbnail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Description / Guidelines
              </label>
              <textarea
                placeholder="Provide student instructions, negative marking criteria, or syllabus coverage..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full p-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] resize-none h-48"
              />
            </div>

            <ThumbnailUploader
              preview={formData.thumbnailimage}
              onFileSelect={({ dataUrl }) => setFormData((prev) => ({ ...prev, thumbnailimage: dataUrl }))}
              onClear={() => setFormData((prev) => ({ ...prev, thumbnailimage: "" }))}
            />
          </div>

          {/* 5-Column Taxonomy Hierarchy - Miro pastel accents */}
          <div className="pt-2 border-t border-[#e6e8ec] space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#1c1c1e]">Curriculum Taxonomy</h3>
              <p className="text-xs text-[#555a6a]">Select educational board and cascading subject filters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Region */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#fff8e0] border border-[#fde89c]/70">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746019]">
                  Region / Board
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
                  className="w-full h-10 px-3 bg-white border border-[#fde89c] rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
                >
                  <option value="">Choose region</option>
                  {regions.map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Type */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#c3faf5]/40 border border-[#0fbcb0]/30">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#187574]">
                  Exam Type
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
                  className="w-full h-10 px-3 bg-white border border-[#0fbcb0]/40 rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Choose exam</option>
                  {getExamTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#ffd8f4]/40 border border-[#ffd8f4]">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86296b]">
                  Class Level
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
                  className="w-full h-10 px-3 bg-white border border-[#ffd8f4] rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Choose class</option>
                  {getSpecificClasses().map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#ffe6cd]/50 border border-[#ffe6cd]">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746019]">
                  Subject
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
                  className="w-full h-10 px-3 bg-white border border-[#ffe6cd] rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Choose subject</option>
                  {getSubjects().map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#f5f3ff] border border-[#4262ff]/20">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4262ff]">
                  Chapter / Topic
                </label>
                <select
                  value={formData.chapter}
                  disabled={!formData.subject}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#4262ff]/30 rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Choose chapter</option>
                  {getChapters().map((chapterName) => (
                    <option key={chapterName} value={chapterName}>
                      {chapterName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Optional Passcode Protected Section */}
          <div className="pt-2 border-t border-[#e6e8ec] space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#555a6a]" />
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Optional Passcode (5 Digits)
              </label>
            </div>
            <div className="flex items-center gap-2 max-w-xs">
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={formData.passcode[index] || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    const newPasscode = (formData.passcode || "").split("")
                    newPasscode[index] = value
                    const updated = newPasscode.join("").slice(0, 5)
                    setFormData({ ...formData, passcode: updated })

                    if (value && index < 4) {
                      const nextInput = document.getElementById(`quiz-passcode-${index + 1}`)
                      if (nextInput) nextInput.focus()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !formData.passcode[index] && index > 0) {
                      const prevInput = document.getElementById(`quiz-passcode-${index - 1}`)
                      if (prevInput) prevInput.focus()
                    }
                  }}
                  id={`quiz-passcode-${index}`}
                  className="w-11 h-11 text-center border border-[#c7cad5] rounded-lg font-medium text-lg text-[#1c1c1e] bg-white focus:border-2 focus:border-[#4262ff] focus:outline-none"
                  placeholder="•"
                />
              ))}
              {formData.passcode && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, passcode: "" })}
                  className="text-xs font-semibold text-[#600000] hover:underline ml-2 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#555a6a]">
              Leave blank if this quiz is publicly accessible to all students.
            </p>
          </div>
        </div>

        {/* Section 2: Question Sources Bar */}
        {isFormComplete && (
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-5 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#c3faf5] flex items-center justify-center text-[#187574]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-[#1c1c1e]">2. Select Question Source</h2>
                  <p className="text-xs text-[#555a6a]">Choose how you want to populate questions</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Quiz Bank */}
              <button
                type="button"
                onClick={fetchQuestions}
                className={`py-3 px-5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSource === "quizBank"
                    ? "bg-[#4262ff] text-white shadow-sm"
                    : "bg-white text-[#1c1c1e] border border-[#c7cad5] hover:bg-[#f7f8fa]"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Pull from Quiz Bank</span>
              </button>

              {/* Import File */}
              <button
                type="button"
                onClick={() => setActiveSource("fileImport")}
                className={`py-3 px-5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSource === "fileImport"
                    ? "bg-[#1c1c1e] text-white shadow-sm"
                    : "bg-white text-[#1c1c1e] border border-[#c7cad5] hover:bg-[#f7f8fa]"
                }`}
              >
                <FileInput className="w-4 h-4" />
                <span>Upload PDF / Word File</span>
              </button>

              {/* Extract Questions */}
              <button
                type="button"
                onClick={handleExtractQuestions}
                disabled={!selectedFile}
                className="py-3 px-5 rounded-full text-xs font-medium bg-white text-[#1c1c1e] border border-[#c7cad5] hover:bg-[#f7f8fa] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileUp className="w-4 h-4" />
                <span>Extract from File</span>
              </button>

              {/* AI Generator */}
              <button
                type="button"
                onClick={() => setShowAIModal(true)}
                className="py-3 px-5 rounded-full text-xs font-medium bg-[#f5f3ff] text-[#4262ff] border border-[#4262ff]/40 hover:bg-[#ebe8ff] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Generate via AI</span>
              </button>
            </div>

            {/* Quiz Bank 1-by-1 Question Review & Selector */}
            {activeSource === "quizBank" && quizBankQuestions.length > 0 && (
              <QuizBankSelector
                questions={quizBankQuestions}
                existingQuestions={questions}
                onAddQuestion={(newQ) => {
                  setQuestions((prev) => [...prev, newQ])
                }}
                onClose={() => {
                  setActiveSource(null)
                  setQuizBankQuestions([])
                }}
              />
            )}

            {/* File Upload Area */}
            {activeSource === "fileImport" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
                className="relative p-6 border-2 border-dashed border-[#c7cad5] hover:border-[#1c1c1e] rounded-2xl bg-[#fafbfc] text-center"
              >
                <button
                  type="button"
                  onClick={() => setActiveSource(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[#600000] hover:bg-[#fbd4d4] border border-[#e3c5c5] flex items-center justify-center cursor-pointer shadow-xs"
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
                  <div className="w-12 h-12 rounded-2xl bg-[#c3faf5] flex items-center justify-center text-[#187574] mb-1">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[#1c1c1e]">
                    {selectedFile ? selectedFile.name : "Select Syllabus Document or Question Sheet"}
                  </p>
                  <p className="text-xs text-[#555a6a]">
                    {selectedFile
                      ? 'Click the "Extract from File" button above to parse questions'
                      : "Supports PDF, DOC, DOCX, XLSX, and CSV (Click to browse)"}
                  </p>
                </label>
              </motion.div>
            )}

            {/* Imported Questions Review Panel */}
            {importedQuestions.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#f7f8fa] border border-[#c7cad5] shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-semibold text-[#1c1c1e]">
                    Parsed Question {currentQuestionIndex + 1} of {importedQuestions.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-3 py-1.5 rounded-full border border-[#c7cad5] bg-white text-xs font-medium text-[#1c1c1e] disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(importedQuestions.length - 1, prev + 1))}
                      disabled={currentQuestionIndex === importedQuestions.length - 1}
                      className="px-3 py-1.5 rounded-full border border-[#c7cad5] bg-white text-xs font-medium text-[#1c1c1e] disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={handleAddImportedQuestion}
                      className="px-4 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Quiz</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#c7cad5] space-y-2">
                  <p className="text-xs font-medium text-[#1c1c1e] leading-snug">
                    {importedQuestions[currentQuestionIndex]?.text}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#555a6a]">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="truncate">
                        <strong className="text-[#1c1c1e]">{opt}:</strong> {importedQuestions[currentQuestionIndex]?.options?.[opt] || "—"}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-[#187574] font-medium pt-1 border-t border-[#e6e8ec]">
                    Correct: Option {importedQuestions[currentQuestionIndex]?.correctAnswer}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Question Builder (Manual & Added Questions) */}
        {isFormComplete && (
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#e6e8ec]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ffd8f4] flex items-center justify-center text-[#86296b]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-[#1c1c1e]">3. Question Suite</h2>
                  <p className="text-xs text-[#555a6a]">
                    Total Questions: <span className="font-semibold text-[#1c1c1e]">{questions.length}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="py-2.5 px-5 bg-[#1c1c1e] hover:bg-[#2c2c34] active:bg-[#2c2c34] text-white text-xs font-medium rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#ffd02f]" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-5">
              <AnimatePresence>
                {Array.isArray(questions) &&
                  questions.map((question, index) => (
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
                <div className="text-center py-12 bg-[#fafbfc] rounded-2xl border border-dashed border-[#c7cad5] space-y-3">
                  <div className="w-12 h-12 bg-[#fff4c4] rounded-full flex items-center justify-center mx-auto text-[#746019]">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-medium text-[#1c1c1e]">No questions added yet</h3>
                  <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
                    Choose from the question sources above (Quiz Bank, File Import, AI) or click below to compose questions manually.
                  </p>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-6 py-3 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    Add First Question
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Add Question Trigger */}
            {questions.length > 0 && (
              <div className="flex justify-center pt-4 border-t border-[#e6e8ec]">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="py-2.5 px-6 border border-[#c7cad5] text-[#1c1c1e] rounded-full text-xs font-medium hover:bg-[#f7f8fa] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Question</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Bottom Action CTAs */}
        {isFormComplete && questions.length > 0 && (
          <div className="flex items-center justify-center gap-4 pt-4 pb-12">
            <button
              onClick={() => navigate("/dashboard")}
              type="button"
              className="py-3 px-8 border border-[#c7cad5] text-[#1c1c1e] rounded-full text-sm font-medium hover:bg-[#f7f8fa] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateQuiz}
              disabled={isLoading}
              type="button"
              className="py-3.5 px-8 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] active:bg-[#e0b020] text-[#1c1c1e] text-sm font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#e0e2e8] disabled:text-[#a5a8b5]"
            >
              {isLoading ? (
                <span>Publishing Quiz...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Publish Quiz ({questions.length} Questions)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Generator Modal */}
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
