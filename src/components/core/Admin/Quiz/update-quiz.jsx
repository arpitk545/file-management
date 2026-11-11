"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { useParams, useNavigate } from "react-router-dom"
import QuizBankSelector from "../../User/Quiz/QuizBankSelector"
import {
  BookOpen,
  X,
  Plus,
  Target,
  Sparkles,
  Trash2,
  Save,
  Database,
  Clock,
  User,
  Tag,
  Upload,
  FileInput,
  FileUp,
  Bot,
  ImageIcon,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  FileText,
  Home,
} from "lucide-react"
import {
  getQuizById,
  updateQuizById,
  deleteQuizById,
  getAllQuizRegions,
  getAllQuizQuestions,
  extractQuestionsFromFile,
} from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import QuizAI from "./CreateQuizAI"

const MiroLoader = ({ message = "Loading Quiz Editor..." }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div className="relative flex items-center justify-center mb-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute w-3 h-3 rounded-full bg-[#ffd02f]" />
    </div>
    <p className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</p>
  </div>
)

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon, options }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (options) {
    return (
      <div className="space-y-1.5 relative">
        <Label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#4262ff]" />}
          {label}
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 sm:h-12 px-4 bg-white border border-[#e0e2e8] rounded-xl font-medium text-xs sm:text-sm text-[#1c1c1e] transition-all hover:border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/10"
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-20 mt-1 w-full bg-white border border-[#e0e2e8] rounded-xl shadow-lg max-h-60 overflow-auto py-1"
              >
                {(options || [])
                  .filter((option) =>
                    option.toLowerCase().includes((value || "").toLowerCase())
                  )
                  .map((option, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-[#f5f3ff] cursor-pointer text-xs font-bold text-[#1c1c1e]"
                      onMouseDown={() => {
                        onChange(option)
                        setIsOpen(false)
                      }}
                    >
                      {option}
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#4262ff]" />}
        {label}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 sm:h-12 px-4 bg-white border border-[#e0e2e8] rounded-xl font-medium text-xs sm:text-sm text-[#1c1c1e] transition-all hover:border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/10"
      />
    </div>
  )
}

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 3 }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{label}</Label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-3 bg-white border border-[#e0e2e8] rounded-xl font-medium text-xs sm:text-sm text-[#1c1c1e] transition-all hover:border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/10 resize-none outline-none"
    />
  </div>
)

const ImageUpload = ({ label, image, onImageChange, onRemove }) => (
  <div className="space-y-2">
    <Label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
      <ImageIcon className="w-3.5 h-3.5 text-[#4262ff]" />
      {label}
    </Label>
    {image ? (
      <div className="relative border border-[#ddd6fe] bg-[#f5f3ff] rounded-2xl overflow-hidden p-2">
        <img
          src={image}
          alt={label}
          className="w-full h-44 object-contain rounded-xl bg-white"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 bg-white border border-[#e0e2e8] text-[#ff7347] hover:bg-[#ffedea] p-1.5 rounded-full shadow transition-all active:scale-95"
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#ddd6fe] bg-[#f5f3ff]/40 rounded-2xl cursor-pointer hover:border-[#4262ff] hover:bg-[#f5f3ff] transition-all">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (event) => {
                const result = event.target?.result
                if (typeof result === "string") onImageChange(result)
              }
              reader.readAsDataURL(file)
            }
          }}
        />
        <Upload className="w-5 h-5 text-[#4262ff] mb-1" />
        <span className="text-xs font-bold text-[#1c1c1e]">Upload image</span>
        <span className="text-[11px] text-[#8e91a0]">PNG, JPG up to ~2MB</span>
      </label>
    )}
  </div>
)

const QuestionCard = ({ question, onUpdate, onDelete, index }) => {
  const handleImageChange = (imageData) => {
    onUpdate({ ...question, image: imageData })
  }
  const handleRemoveImage = () => {
    onUpdate({ ...question, image: null })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="bg-[#fafbff] rounded-2xl border border-[#e0e2e8] p-4 sm:p-6 space-y-4 shadow-xs hover:border-[#c7cad5] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#ffd02f] border border-[#1c1c1e] rounded-lg flex items-center justify-center font-black text-xs text-[#1c1c1e]">
            {index + 1}
          </div>
          <h3 className="text-xs sm:text-sm font-black text-[#1c1c1e]">Question #{index + 1}</h3>
        </div>
        <button
          onClick={onDelete}
          type="button"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#b43b12] bg-[#ffe6cd] hover:bg-[#ff7347] hover:text-white border border-[#ffd0b3] transition-all active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>

      <ModernTextarea
        label="Question Statement"
        placeholder="Enter question statement..."
        value={question.text}
        onChange={(value) => onUpdate({ ...question, text: value })}
        rows={3}
      />

      <ImageUpload
        label="Question Diagram / Image (optional)"
        image={question.image || null}
        onImageChange={handleImageChange}
        onRemove={handleRemoveImage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["A", "B", "C", "D"].map((option) => (
          <ModernInput
            key={option}
            label={`Option ${option}`}
            placeholder={`Enter option ${option}...`}
            value={question.options?.[option] || ""}
            onChange={(value) =>
              onUpdate({
                ...question,
                options: { ...(question.options || {}), [option]: value },
              })
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModernInput
          label="Correct Answer"
          placeholder="Enter correct answer (A, B, C, or D)"
          value={question.correctAnswer}
          onChange={(value) => onUpdate({ ...question, correctAnswer: value })}
          options={["A", "B", "C", "D"]}
        />
        <ModernInput
          label="Difficulty Level"
          placeholder="Enter difficulty (Easy, Average, Hard)"
          value={question.difficulty}
          onChange={(value) => onUpdate({ ...question, difficulty: value })}
          options={["Easy", "Average", "Hard"]}
        />
      </div>

      <ModernTextarea
        label="Explanation / Hint Note (optional)"
        placeholder="Add any notes or explanations for this question..."
        value={question.note || ""}
        onChange={(value) => onUpdate({ ...question, note: value })}
        rows={2}
      />
    </motion.div>
  )
}

export default function UpdateQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    quizTitle: "",
    region: "",
    regionName: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    duration: "",
    author: "",
    quizType: "createquiz",
    description: "",
    thumbnailimage: null,
  })

  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regions, setRegions] = useState([])
  const [questions, setQuestions] = useState([])
  const [importedQuestions, setImportedQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeSource, setActiveSource] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [quizBankQuestions, setQuizBankQuestions] = useState([])

  // Fetch regions and quiz data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const regionsResponse = await getAllQuizRegions()
        const regionList = regionsResponse?.data || []
        setRegions(regionList)

        const quizResponse = await getQuizById(id)
        const quizData = quizResponse?.data
        if (!quizData) {
          toast.error("Quiz not found")
          navigate("/view-quiz")
          return
        }

        const cat = quizData.category || {}
        const matchedRegion = regionList.find((r) => r.name === cat.region)
        setSelectedRegion(matchedRegion || null)

        setFormData({
          quizTitle: cat.quizTitle || quizData.fileTitle || "",
          region: matchedRegion?._id || "",
          regionName: cat.region || "",
          examType: cat.examType || "",
          specificClass: cat.specificClass || "",
          subject: cat.subject || "",
          chapter: cat.chapter || "",
          duration: cat.duration || "",
          author: cat.author || "",
          quizType: cat.quizType || "createquiz",
          description: cat.description || quizData.description || "",
          thumbnailimage: cat.thumbnailimage || null,
        })

        const mappedQuestions = (quizData.questions || []).map((q, idx) => ({
          id: q._id || idx,
          text: q.text || "",
          options: q.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: q.correctAnswer || "",
          difficulty: q.difficulty || "Average",
          image: q.image || null,
          note: q.note || "",
          tags: q.tags || [],
        }))
        setQuestions(mappedQuestions)
      } catch (error) {
        console.error("Error loading quiz:", error)
        toast.error("Failed to load quiz data")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchData()
  }, [id, navigate])

  const getExamTypes = () => {
    if (!selectedRegion?.examTypes) return []
    return selectedRegion.examTypes.map((t) => t.name)
  }

  const getSpecificClasses = () => {
    if (!formData.examType || !selectedRegion) return []
    const et = selectedRegion.examTypes?.find((t) => t.name === formData.examType)
    return et?.specificClasses?.map((c) => c.name) || []
  }

  const getSubjects = () => {
    if (!formData.specificClass || !selectedRegion) return []
    const et = selectedRegion.examTypes?.find((t) => t.name === formData.examType)
    const sc = et?.specificClasses?.find((c) => c.name === formData.specificClass)
    return sc?.subjects?.map((s) => s.name) || []
  }

  const getChapters = () => {
    if (!formData.subject || !selectedRegion) return []
    const et = selectedRegion.examTypes?.find((t) => t.name === formData.examType)
    const sc = et?.specificClasses?.find((c) => c.name === formData.specificClass)
    const sub = sc?.subjects?.find((s) => s.name === formData.subject)
    return sub?.chapters?.map((ch) => ch.name) || []
  }

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        difficulty: "Average",
        image: null,
        note: "",
        tags: [],
      },
    ])
  }

  const updateQuestion = (index, updated) => {
    setQuestions((prev) => {
      const copy = [...prev]
      copy[index] = updated
      return copy
    })
  }

  const deleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const res = await getAllQuizQuestions()
      const allQ = res?.data || []
      const filtered = allQ.filter(
        (q) =>
          (!formData.regionName || q.category?.region?.toLowerCase() === formData.regionName?.toLowerCase()) &&
          (!formData.examType || q.category?.examType === formData.examType) &&
          (!formData.specificClass || q.category?.specificClass === formData.specificClass) &&
          (!formData.subject || q.category?.subject === formData.subject) &&
          (!formData.chapter || q.category?.chapter === formData.chapter)
      )
      const targetList = filtered.length > 0 ? filtered : allQ
      if (targetList.length) {
        setQuizBankQuestions(targetList)
        setActiveSource("quizBank")
        toast.success(`Found ${targetList.length} questions in Quiz Bank`)
      } else {
        toast("No matching questions found in Quiz Bank", { icon: "ℹ️" })
      }
    } catch (error) {
      toast.error("Failed to fetch questions from Quiz Bank")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
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
      if (extracted?.length) {
        setImportedQuestions(extracted)
        setCurrentQuestionIndex(0)
        toast.success(`Extracted ${extracted.length} questions successfully!`)
      } else {
        toast.error("No questions found in the file")
      }
    } catch (error) {
      toast.error("Failed to extract questions: " + (error?.message || "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImportedQuestion = () => {
    if (!importedQuestions.length) return
    setQuestions((prev) => [...prev, importedQuestions[currentQuestionIndex]])
    if (currentQuestionIndex < importedQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
      toast.success(`Added question ${currentQuestionIndex + 1} of ${importedQuestions.length}`)
    } else {
      setImportedQuestions([])
      setCurrentQuestionIndex(0)
      toast.success("All imported questions added to quiz!")
    }
  }

  const handleThumbnailChange = (imageData) => {
    setFormData((fd) => ({ ...fd, thumbnailimage: imageData }))
  }
  const handleRemoveThumbnail = () => {
    setFormData((fd) => ({ ...fd, thumbnailimage: null }))
  }

  const handleUpdateQuiz = async () => {
    if (!formData.region || !formData.examType || !formData.specificClass || !formData.subject || !formData.chapter) {
      toast.error("Please complete all category fields")
      return
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question")
      return
    }
    const invalid = questions.find(
      (q) =>
        !q.text ||
        !q.options?.A ||
        !q.options?.B ||
        !q.options?.C ||
        !q.options?.D ||
        !q.correctAnswer ||
        !["A", "B", "C", "D"].includes(q.correctAnswer)
    )
    if (invalid) {
      toast.error("Please complete all fields for each question and ensure correct answer is A/B/C/D")
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        category: {
          quizTitle: formData.quizTitle,
          region: formData.regionName,
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter,
          duration: formData.duration,
          author: formData.author,
          quizType: formData.quizType,
          description: formData.description || "",
          thumbnailimage: formData.thumbnailimage,
        },
        questions: questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          image: q.image || null,
          note: q.note || "",
          tags: q.tags || [],
        })),
      }
      await updateQuizById(id, payload)
      toast.success(`Quiz updated successfully with ${questions.length} questions!`)
      navigate("/view-quiz")
    } catch (error) {
      console.error("Error updating quiz:", error)
      toast.error("Failed to update quiz: " + (error?.message || "Server error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuiz = async () => {
    if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      try {
        setIsDeleting(true)
        await deleteQuizById(id)
        toast.success("Quiz deleted successfully!")
        navigate("/view-quiz")
      } catch (error) {
        console.error("Error deleting quiz:", error)
        toast.error("Failed to delete quiz")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (isLoading) {
    return <MiroLoader message="Loading Quiz Editor..." />
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full space-y-6">
        
        {/* Posts-Style Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/view-quiz")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quizzes</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              QUIZ STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              EDIT QUIZ
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/create-quizs")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>New Quiz</span>
          </button>
        </div>

        {/* Banner Section */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Quiz
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Modify quiz curriculum routing, adjust metadata, and curate interactive questions.
          </p>
        </div>

        {/* STEP 1: Quiz Details & Taxonomy (Posts Step 1 Pattern) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#ddd6fe]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Taxonomy Hierarchy</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ModernInput
                label="Quiz Title"
                placeholder="Enter quiz title..."
                value={formData.quizTitle}
                onChange={(value) => setFormData({ ...formData, quizTitle: value })}
                icon={Tag}
              />
              <ModernInput
                label="Duration (minutes)"
                type="number"
                placeholder="Enter duration..."
                value={formData.duration || ""}
                onChange={(value) => setFormData({ ...formData, duration: value })}
                icon={Clock}
              />
              <ModernInput
                label="Author / Faculty"
                placeholder="Enter author name..."
                value={formData.author || ""}
                onChange={(value) => setFormData({ ...formData, author: value })}
                icon={User}
              />
            </div>

            {/* Curriculum Selectors in Colored Cards */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5 mb-2.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0fbcb0]" />
                Taxonomy & Curriculum Routing
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. Region - Yellow Accent */}
                <div className="p-3.5 rounded-xl bg-white border border-[#ddd6fe] space-y-1.5 shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#fff8e0] text-[#7a5901]">
                    1. Region
                  </span>
                  <select
                    value={formData.region}
                    onChange={(e) => {
                      const regionId = e.target.value
                      const found = regions.find((r) => r._id === regionId)
                      setSelectedRegion(found || null)
                      setFormData({
                        ...formData,
                        region: regionId,
                        regionName: found?.name || "",
                        examType: "",
                        specificClass: "",
                        subject: "",
                        chapter: "",
                      })
                    }}
                    className="w-full h-11 px-3 rounded-lg text-xs font-bold text-[#1c1c1e] border border-[#e0e2e8] focus:border-[#4262ff] outline-none"
                  >
                    <option value="">Choose region</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Exam Type - Teal Accent */}
                <div className="p-3.5 rounded-xl bg-white border border-[#ddd6fe] space-y-1.5 shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#c3faf5] text-[#006660]">
                    2. Exam Type
                  </span>
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
                    className="w-full h-11 px-3 rounded-lg text-xs font-bold text-[#1c1c1e] border border-[#e0e2e8] focus:border-[#4262ff] outline-none disabled:opacity-50 disabled:bg-[#f7f8fa]"
                  >
                    <option value="">Choose exam type</option>
                    {getExamTypes().map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Class - Rose Accent */}
                <div className="p-3.5 rounded-xl bg-white border border-[#ddd6fe] space-y-1.5 shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ffd8f4] text-[#86296b]">
                    3. Class
                  </span>
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
                    className="w-full h-11 px-3 rounded-lg text-xs font-bold text-[#1c1c1e] border border-[#e0e2e8] focus:border-[#4262ff] outline-none disabled:opacity-50 disabled:bg-[#f7f8fa]"
                  >
                    <option value="">Choose class</option>
                    {getSpecificClasses().map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Subject - Orange Accent */}
                <div className="p-3.5 rounded-xl bg-white border border-[#ddd6fe] space-y-1.5 shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ffe6cd] text-[#b43b12]">
                    4. Subject
                  </span>
                  <select
                    value={formData.subject}
                    disabled={!formData.specificClass}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: "" })}
                    className="w-full h-11 px-3 rounded-lg text-xs font-bold text-[#1c1c1e] border border-[#e0e2e8] focus:border-[#4262ff] outline-none disabled:opacity-50 disabled:bg-[#f7f8fa]"
                  >
                    <option value="">Choose subject</option>
                    {getSubjects().map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Chapter - Lavender Accent */}
                <div className="p-3.5 rounded-xl bg-white border border-[#ddd6fe] space-y-1.5 shadow-2xs">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f5f3ff] text-[#4262ff]">
                    5. Chapter
                  </span>
                  <select
                    value={formData.chapter}
                    disabled={!formData.subject}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg text-xs font-bold text-[#1c1c1e] border border-[#e0e2e8] focus:border-[#4262ff] outline-none disabled:opacity-50 disabled:bg-[#f7f8fa]"
                  >
                    <option value="">Choose chapter</option>
                    {getChapters().map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description & Thumbnail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              <ModernTextarea
                label="Description"
                placeholder="Write a short overview of this quiz..."
                value={formData.description || ""}
                onChange={(v) => setFormData({ ...formData, description: v })}
                rows={4}
              />

              <ImageUpload
                label="Quiz Cover Thumbnail"
                image={formData.thumbnailimage}
                onImageChange={handleThumbnailChange}
                onRemove={handleRemoveThumbnail}
              />
            </div>
          </div>
        </div>

        {/* Question Import & Sources Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0fbcb0]" />
            <h3 className="text-xs sm:text-sm font-black text-[#1c1c1e]">
              Question Import & Sources
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={fetchQuestions}
              className={`h-11 sm:h-12 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                activeSource === "quizBank"
                  ? "bg-[#4262ff] text-white border-[#4262ff] shadow-xs"
                  : "bg-[#f5f3ff] border-[#ddd6fe] text-[#4262ff] hover:bg-[#ebe5ff]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Pull From Bank
            </button>

            <button
              type="button"
              onClick={() => setActiveSource(activeSource === "fileImport" ? null : "fileImport")}
              className={`h-11 sm:h-12 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                activeSource === "fileImport"
                  ? "bg-[#0fbcb0] text-white border-[#0fbcb0] shadow-xs"
                  : "bg-[#c3faf5] border-[#99f1ea] text-[#006660] hover:bg-[#abf7f1]"
              }`}
            >
              <FileInput className="w-3.5 h-3.5" />
              Import File
            </button>

            <button
              type="button"
              onClick={handleExtractQuestions}
              disabled={!selectedFile}
              className={`h-11 sm:h-12 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                activeSource === "extract"
                  ? "bg-[#ff7347] text-white border-[#ff7347] shadow-xs"
                  : "bg-[#ffe6cd] border-[#ffd0b3] text-[#b43b12] hover:bg-[#ffdcbf] disabled:opacity-50"
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              Extract Questions
            </button>

            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="h-11 sm:h-12 px-4 rounded-xl border border-[#fbc0eb] bg-[#ffd8f4] text-[#86296b] hover:bg-[#ffcbf0] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Bot className="w-3.5 h-3.5" />
              AI Generator
            </button>
          </div>

          {/* Quiz Bank Questions 1-by-1 Cycler */}
          {quizBankQuestions.length > 0 && activeSource === "quizBank" && (
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

          {activeSource === "fileImport" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="mt-4 relative">
              <div className="border-2 border-dashed border-[#0fbcb0] bg-[#c3faf5]/30 rounded-2xl p-6 text-center relative">
                <button
                  type="button"
                  onClick={() => setActiveSource(null)}
                  className="absolute top-3 right-3 text-[#b43b12] hover:bg-[#ffe6cd] p-1.5 rounded-full border border-[#ffd0b3] transition-all"
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
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#99f1ea] flex items-center justify-center text-[#0fbcb0]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-[#1c1c1e] text-xs sm:text-sm">
                    {selectedFile ? selectedFile.name : "Select PDF, DOC or CSV Question File"}
                  </p>
                  <p className="text-[11px] text-[#555a6a]">
                    {selectedFile ? "Click 'Extract Questions' button above to parse" : "Click to browse or drop question file here"}
                  </p>
                </label>
              </div>
            </motion.div>
          )}

          {importedQuestions.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="mt-4 border border-[#99f1ea] bg-[#c3faf5]/20 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <h4 className="text-xs sm:text-sm font-black text-[#1c1c1e]">
                  Imported Question {currentQuestionIndex + 1} of {importedQuestions.length}
                </h4>
                <button
                  type="button"
                  onClick={handleAddImportedQuestion}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0fbcb0] hover:bg-[#0da399] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Quiz
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e0e2e8] space-y-3">
                <p className="font-bold text-xs sm:text-sm text-[#1c1c1e]">{importedQuestions[currentQuestionIndex]?.text}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2 p-2 bg-[#f7f8fa] rounded-lg text-xs">
                      <span className="font-bold text-[#4262ff]">{opt}:</span>
                      <span className="text-[#1c1c1e]">{importedQuestions[currentQuestionIndex]?.options?.[opt]}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-[#1c1c1e] pt-1">
                  Correct Answer: <span className="text-[#0fbcb0] font-black">{importedQuestions[currentQuestionIndex]?.correctAnswer}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* STEP 2: Questions Builder (Posts Step 2 Pattern) */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#0fbcb0]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">Quiz Questions & Content</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#ffd02f]" />
                <span>Add Question</span>
              </button>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
                Step 2 of 2
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id || index}
                  question={question}
                  index={index}
                  onUpdate={(updated) => updateQuestion(index, updated)}
                  onDelete={() => deleteQuestion(index)}
                />
              ))}
            </AnimatePresence>

            {questions.length === 0 && (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#e0e2e8] bg-[#f7f8fa]">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-[#8e91a0]" />
                <p className="text-xs sm:text-sm font-bold text-[#1c1c1e]">No questions in this quiz</p>
                <p className="text-xs text-[#555a6a] mt-1">Click &quot;Add Question&quot; to build your quiz set.</p>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
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
        </div>

        {/* Action Buttons Bar matching Posts edit-articles.jsx */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={handleDeleteQuiz}
            disabled={isDeleting}
            className="px-6 py-3 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] text-[#600000] border border-[#e3c5c5] font-bold text-sm transition-all disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Quiz"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/view-quiz")}
            className="px-6 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-semibold text-sm transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdateQuiz}
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-full bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Quiz...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#ffd02f]" />
                <span>Update Quiz</span>
              </>
            )}
          </button>
        </div>

        {/* AI Modal */}
        <QuizAI
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onQuestionGenerated={(question) => {
            setQuestions((prev) => [...prev, question])
          }}
          quizData={{
            ...formData,
            duration: formData.duration || 30,
            author: formData.author || "User",
          }}
        />
      </motion.div>
    </div>
  )
}
