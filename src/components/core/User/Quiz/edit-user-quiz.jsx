"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  BookOpen,
  ArrowLeft,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  HelpCircle,
  StickyNote,
  AlertCircle,
  Image as ImageIcon,
  X,
  Upload,
  MapPin,
  FileText,
  Check,
  Lock,
  Sparkles
} from "lucide-react"
import toast from "react-hot-toast"
import {
  getQuizById,
  updateQuizById,
  getAllQuizRegions
} from "../../../../services/operations/quizAPI"

// Miro Thumbnail Uploader (Complete aspect ratio fit, no cropping)
function ThumbnailUploader({ preview, onFileSelect, onClear }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555a6a]">
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
          <div className="w-10 h-10 rounded-full bg-[#f0f1f4] border border-[#c7cad5] flex items-center justify-center">
            <Upload className="w-4 h-4 text-[#555a6a]" />
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

// Per-question diagram upload & note component
function QuestionImageAndNote({ question, onUpdate }) {
  const handleSelect = (file) => {
    const reader = new FileReader()
    reader.onload = () => onUpdate({ ...question, image: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#e6e8ec]">
      {/* Question Diagram / Image */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555a6a]">
          Question Diagram / Image (Optional)
        </label>

        {question.image ? (
          <div className="relative border border-[#c7cad5] rounded-xl overflow-hidden bg-[#f0f1f4] h-36 flex items-center justify-center p-2">
            <img src={question.image} alt="Question Diagram" className="w-full h-full object-contain object-center" />
            <button
              type="button"
              onClick={() => onUpdate({ ...question, image: "" })}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-[#600000] hover:bg-[#fbd4d4] border border-[#e3c5c5] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Remove diagram"
              title="Remove diagram"
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
              <p className="text-xs font-semibold text-[#1c1c1e]">Add diagram or photo</p>
              <p className="text-[10px] text-[#555a6a]">PNG or JPG format</p>
            </div>
          </label>
        )}
      </div>

      {/* Question Solution / Note */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#555a6a]">
          Explanatory Note / Solution (Optional)
        </label>
        <textarea
          rows={4}
          value={question.note || ""}
          onChange={(e) => onUpdate({ ...question, note: e.target.value })}
          placeholder="Detailed solution or reference note shown after answer submission..."
          className="w-full h-36 p-3 bg-white border border-[#c7cad5] rounded-xl text-xs font-medium text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-[#1c1c1e] transition-all resize-none"
        />
      </div>
    </div>
  )
}

export default function EditQuiz() {
  const params = useParams()
  const navigate = useNavigate()
  const quizId = params.quizId || params.id
  const { user } = useSelector((state) => state.profile)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [regions, setRegions] = useState([])

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    thumbnailimage: "",
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    totalMarks: 100,
    duration: 60,
    difficulty: "Average",
    author: "",
    passcode: "",
    approvalStatus: "Approved",
    questions: [],
  })

  // Load Regions and Quiz Data
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsLoading(true)

        // 1. Fetch Region Taxonomy
        let loadedRegions = []
        try {
          const regionsRes = await getAllQuizRegions()
          loadedRegions = regionsRes?.data || []
          if (isMounted) setRegions(loadedRegions)
        } catch (err) {
          console.warn("Could not load regions list:", err)
        }

        // 2. Fetch Quiz Data
        if (quizId && quizId !== "1") {
          const res = await getQuizById(quizId)
          const data = res?.quiz || res?.data
          if (data && isMounted) {
            const cat = data.category || {}

            // Permission check: If user role is "user", verify ownership
            const currentUserId = user?._id || user?.id
            if (user?.role === "user" && currentUserId) {
              const quizOwnerId = (typeof data.user === "object" ? data.user?._id : data.user) || cat.userId
              if (quizOwnerId && quizOwnerId.toString() !== currentUserId.toString()) {
                toast.error("You are only allowed to edit your own quizzes.")
                navigate("/filter-user-quiz")
                return
              }
            }

            setQuizData({
              title: cat.quizTitle || data.quizTitle || data.title || "",
              description: cat.description || data.description || "",
              thumbnailimage: cat.thumbnailimage || data.thumbnailimage || "",
              region: cat.region || data.region || "",
              examType: cat.examType || data.examType || "",
              specificClass: cat.specificClass || data.specificClass || "",
              subject: cat.subject || data.subject || "",
              chapter: cat.chapter || data.chapter || "",
              totalMarks: cat.totalMarks || data.totalMarks || 100,
              duration: cat.duration || data.duration || 60,
              difficulty: cat.difficulty || data.difficulty || "Average",
              author: cat.author || data.author || "Educator",
              passcode: cat.passcode || data.passcode || "",
              approvalStatus: cat.approvalStatus || data.approvalStatus || "Approved",
              questions: Array.isArray(data.questions) ? data.questions : [],
            })
            return
          }
        }
      } catch (error) {
        console.error("Error loading quiz for edit:", error)
        toast.error("Failed to load quiz details")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [quizId])

  // Derive active region object from regions list (matching either by .name or ._id)
  const selectedRegion = regions.find(
    (r) => r.name === quizData.region || r._id === quizData.region
  ) || null

  const getExamTypes = () => {
    if (!selectedRegion) {
      return quizData.examType ? [quizData.examType] : []
    }
    const types = selectedRegion.examTypes?.map((type) => type.name) || []
    if (quizData.examType && !types.includes(quizData.examType)) {
      types.unshift(quizData.examType)
    }
    return types
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !quizData.examType) {
      return quizData.specificClass ? [quizData.specificClass] : []
    }
    const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === quizData.examType)
    const classes = selectedExamType?.specificClasses?.map((cls) => cls.name) || []
    if (quizData.specificClass && !classes.includes(quizData.specificClass)) {
      classes.unshift(quizData.specificClass)
    }
    return classes
  }

  const getSubjects = () => {
    if (!selectedRegion || !quizData.examType || !quizData.specificClass) {
      return quizData.subject ? [quizData.subject] : []
    }
    const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === quizData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses?.find(
      (sc) => sc.name === quizData.specificClass
    )
    const subjects = selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
    if (quizData.subject && !subjects.includes(quizData.subject)) {
      subjects.unshift(quizData.subject)
    }
    return subjects
  }

  const getChapters = () => {
    if (!selectedRegion || !quizData.examType || !quizData.specificClass || !quizData.subject) {
      return quizData.chapter ? [quizData.chapter] : []
    }
    const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === quizData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses?.find(
      (sc) => sc.name === quizData.specificClass
    )
    const selectedSubject = selectedSpecificClass?.subjects?.find((sub) => sub.name === quizData.subject)
    const chapters = selectedSubject?.chapters?.map((ch) => ch.name) || []
    if (quizData.chapter && !chapters.includes(quizData.chapter)) {
      chapters.unshift(quizData.chapter)
    }
    return chapters
  }

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
    const currentOptions = { ...(updatedQuestions[questionIndex].options || {}) }
    currentOptions[optionKey] = value
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: currentOptions,
    }
    setQuizData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }))
  }

  const handleAddQuestion = () => {
    const newQuestion = {
      _id: `q_${Date.now()}`,
      text: "",
      image: "",
      note: "",
      options: { A: "", B: "", C: "", D: "" },
      correctAnswer: "A",
      difficulty: "Average",
      tags: [],
    }
    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))
    toast.success("New question added")
  }

  const handleDeleteQuestion = (index) => {
    if (quizData.questions.length <= 1) {
      toast.error("A quiz must have at least one question")
      return
    }
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
    toast.success("Question removed")
  }

  const handleSaveQuiz = async () => {
    if (!quizData.title.trim() || !quizData.description.trim()) {
      toast.error("Please fill in title and description")
      return
    }

    try {
      setIsSaving(true)

      const regionName = selectedRegion?.name || quizData.region || ""

      // Structure category & questions matching the server Quiz schema
      const payload = {
        category: {
          quizTitle: quizData.title,
          description: quizData.description,
          thumbnailimage: quizData.thumbnailimage || "",
          region: regionName,
          examType: quizData.examType || "",
          specificClass: quizData.specificClass || "",
          subject: quizData.subject || "",
          chapter: quizData.chapter || "",
          duration: Number(quizData.duration) || 60,
          difficulty: quizData.difficulty || "Average",
          totalMarks: Number(quizData.totalMarks) || 100,
          author: quizData.author || "Educator",
          passcode: quizData.passcode || "",
          approvalStatus: quizData.approvalStatus || "Approved",
        },
        questions: quizData.questions.map((q) => ({
          text: q.text || q.questionText || "",
          image: q.image || "",
          note: q.note || "",
          options: q.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: q.correctAnswer || "A",
          difficulty: q.difficulty || "Average",
          tags: q.tags || [],
        })),
      }

      if (quizId && quizId !== "1") {
        await updateQuizById(quizId, payload)
        toast.success("Quiz updated successfully!")
      } else {
        toast.success("Quiz settings saved!")
      }
      navigate("/filter-user-quiz")
    } catch (error) {
      console.error("Error updating quiz:", error)
      toast.error(error?.response?.data?.error || "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans w-full">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse border border-[#c7cad5]">
          <Clock className="h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">
          Loading quiz editor...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans overflow-x-hidden">
      {/* Full Width Container */}
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#c7cad5] w-full">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/filter-user-quiz")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quizzes</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#ffd02f] text-[#1c1c1e] shadow-2xs border border-[#e5ba2a]">
              QUIZ EDITOR
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              {quizData.subject || "Academic"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate("/filter-user-quiz")}
              className="px-4 py-2 rounded-full bg-white border border-[#c7cad5] hover:bg-[#ebecf0] text-xs font-bold text-[#1c1c1e] transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#ffd02f]" />
              <span>{isSaving ? "Saving..." : "Save Quiz Changes"}</span>
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
            Edit Quiz Details & Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-3xl leading-relaxed">
            Update curriculum dropdown taxonomy (Region, Exam Type, Class, Subject, Chapter), adjust question statements, manage diagrams, and configure answer keys.
          </p>
        </div>

        {/* Basic Information & Taxonomy Card */}
        <div className="bg-white rounded-3xl border border-[#c7cad5] shadow-sm p-6 sm:p-8 space-y-6 w-full text-left">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#e6e8ec]">
            <div className="w-8 h-8 rounded-xl bg-[#fff8e0] border border-[#fde89c] flex items-center justify-center text-[#746019]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1c1c1e]">Assessment Information & Taxonomy</h2>
              <p className="text-xs text-[#6a6d7c]">Select region, exam, class, subject, and chapter using cascading dropdowns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Quiz Title *
              </label>
              <input
                type="text"
                name="title"
                value={quizData.title}
                onChange={handleInputChange}
                className="w-full h-11 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                placeholder="e.g. Higher Secondary Mathematics Assessment"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Author Name
              </label>
              <input
                type="text"
                name="author"
                value={quizData.author}
                onChange={handleInputChange}
                className="w-full h-11 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                placeholder="Educator / Mentor"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Description *
              </label>
              <textarea
                name="description"
                value={quizData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full p-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-medium text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all resize-y"
                placeholder="Brief overview of the syllabus and topics covered in this quiz..."
              />
            </div>
          </div>

          {/* CASCADING TAXONOMY DROPDOWNS - Exact same as create-quiz.jsx */}
          <div className="pt-2 border-t border-[#e6e8ec] space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#187574]" />
              <label className="text-xs font-bold uppercase tracking-wider text-[#1c1c1e]">
                Curriculum Classification (Cascading Selectors)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* 1. Region / Board Dropdown */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#fff8e0] border border-[#fde89c]/70">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#746019]">
                  Region / Board
                </label>
                <select
                  value={selectedRegion?._id || quizData.region}
                  onChange={(e) => {
                    const selectedVal = e.target.value
                    const foundObj = regions.find((r) => r._id === selectedVal || r.name === selectedVal)
                    setQuizData((prev) => ({
                      ...prev,
                      region: foundObj ? foundObj.name : selectedVal,
                      examType: "",
                      specificClass: "",
                      subject: "",
                      chapter: "",
                    }))
                  }}
                  className="w-full h-10 px-3 bg-white border border-[#fde89c] rounded-lg text-xs font-semibold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
                >
                  <option value="">Choose region</option>
                  {regions.map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.name}
                    </option>
                  ))}
                  {quizData.region && !regions.some((r) => r.name === quizData.region || r._id === quizData.region) && (
                    <option value={quizData.region}>{quizData.region}</option>
                  )}
                </select>
              </div>

              {/* 2. Exam Type Dropdown */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#c3faf5]/40 border border-[#0fbcb0]/30">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#187574]">
                  Exam Type
                </label>
                <select
                  value={quizData.examType}
                  disabled={!quizData.region}
                  onChange={(e) =>
                    setQuizData((prev) => ({
                      ...prev,
                      examType: e.target.value,
                      specificClass: "",
                      subject: "",
                      chapter: "",
                    }))
                  }
                  className="w-full h-10 px-3 bg-white border border-[#0fbcb0]/40 rounded-lg text-xs font-semibold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#187574] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Choose exam</option>
                  {getExamTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Class Level Dropdown */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#ffd8f4]/40 border border-[#ffd8f4]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#86296b]">
                  Class Level
                </label>
                <select
                  value={quizData.specificClass}
                  disabled={!quizData.examType}
                  onChange={(e) =>
                    setQuizData((prev) => ({
                      ...prev,
                      specificClass: e.target.value,
                      subject: "",
                      chapter: "",
                    }))
                  }
                  className="w-full h-10 px-3 bg-white border border-[#ffd8f4] rounded-lg text-xs font-semibold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#86296b] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Choose class</option>
                  {getSpecificClasses().map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Subject Dropdown */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#ffe6cd]/50 border border-[#ffe6cd]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#746019]">
                  Subject
                </label>
                <select
                  value={quizData.subject}
                  disabled={!quizData.specificClass}
                  onChange={(e) =>
                    setQuizData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                      chapter: "",
                    }))
                  }
                  className="w-full h-10 px-3 bg-white border border-[#ffe6cd] rounded-lg text-xs font-semibold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ff7347] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Choose subject</option>
                  {getSubjects().map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Chapter / Topic Dropdown */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#f5f3ff] border border-[#4262ff]/20">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4262ff]">
                  Chapter / Topic
                </label>
                <select
                  value={quizData.chapter}
                  disabled={!quizData.subject}
                  onChange={(e) => setQuizData((prev) => ({ ...prev, chapter: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#4262ff]/30 rounded-lg text-xs font-semibold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
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

          {/* Parameters Strip: Duration, Marks, Difficulty, Passcode, Thumbnail */}
          <div className="pt-2 border-t border-[#e6e8ec] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Duration (Minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={quizData.duration}
                onChange={handleInputChange}
                className="w-full h-11 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
              />
            </div>

            {/* Total Marks */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Total Marks
              </label>
              <input
                type="number"
                name="totalMarks"
                value={quizData.totalMarks}
                onChange={handleInputChange}
                className="w-full h-11 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={quizData.difficulty || "Average"}
                onChange={handleInputChange}
                className="w-full h-11 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Average">Average</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Passcode (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Passcode (Optional)
              </label>
              <input
                type="text"
                name="passcode"
                value={quizData.passcode}
                onChange={handleInputChange}
                placeholder="e.g. 12345 (Leave blank for public)"
                className="w-full h-11 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
              />
            </div>
          </div>

          {/* Cover Thumbnail Uploader */}
          <div className="pt-2 border-t border-[#e6e8ec]">
            <ThumbnailUploader
              preview={quizData.thumbnailimage}
              onFileSelect={({ dataUrl }) => setQuizData((prev) => ({ ...prev, thumbnailimage: dataUrl }))}
              onClear={() => setQuizData((prev) => ({ ...prev, thumbnailimage: "" }))}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-5 w-full text-left">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#c7cad5] w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ffd8f4] border border-[#f3bee5] flex items-center justify-center text-[#86296b]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">
                  Questions Suite ({quizData.questions.length})
                </h2>
                <p className="text-xs text-[#6a6d7c]">Manage question prompts, attach diagrams, options, and verified answer keys</p>
              </div>
            </div>

            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#ffd02f]" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6 w-full">
            {quizData.questions.map((q, qIndex) => (
              <div
                key={q._id || qIndex}
                className="bg-white rounded-3xl border border-[#c7cad5] shadow-sm p-6 sm:p-7 space-y-5 w-full transition-all hover:border-[#1c1c1e]/40"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e6e8ec]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#ffd02f] text-[#1c1c1e] font-black text-xs flex items-center justify-center border border-[#e5ba2a] shadow-2xs">
                      {qIndex + 1}
                    </span>
                    <span className="text-sm font-bold text-[#1c1c1e]">Question {qIndex + 1}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={q.difficulty || "Average"}
                      onChange={(e) => handleQuestionChange(qIndex, "difficulty", e.target.value)}
                      className="h-8 px-2.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-lg text-xs font-bold text-[#1c1c1e] cursor-pointer"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Average">Average</option>
                      <option value="Hard">Hard</option>
                    </select>

                    <button
                      onClick={() => handleDeleteQuestion(qIndex)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#600000] bg-[#fbd4d4] hover:bg-[#ffc6c6] border border-[#e3c5c5] transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                    Question Statement *
                  </label>
                  <textarea
                    value={q.text || q.questionText || ""}
                    onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                    rows={2}
                    className="w-full p-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                    placeholder="Enter the complete question prompt..."
                  />
                </div>

                {/* Question Diagram & Explanation Note */}
                <QuestionImageAndNote
                  question={q}
                  onUpdate={(updated) => {
                    const updatedQuestions = [...quizData.questions]
                    updatedQuestions[qIndex] = updated
                    setQuizData((prev) => ({ ...prev, questions: updatedQuestions }))
                  }}
                />

                {/* Options Grid (A, B, C, D) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                    Multiple Choice Options & Verified Answer Key
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {["A", "B", "C", "D"].map((optKey) => {
                      const isCorrect = String(q.correctAnswer).trim().toUpperCase() === optKey

                      return (
                        <div
                          key={optKey}
                          className={`flex items-center gap-2 p-3 rounded-2xl border transition-all ${
                            isCorrect
                              ? "bg-[#c3faf5]/50 border-[#187574] shadow-xs"
                              : "bg-[#f7f8fa] border-[#c7cad5]"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? "bg-[#187574] text-white"
                                : "bg-white border border-[#c7cad5] text-[#1c1c1e]"
                            }`}
                          >
                            {optKey}
                          </span>
                          <input
                            type="text"
                            value={q.options?.[optKey] || ""}
                            onChange={(e) => handleOptionChange(qIndex, optKey, e.target.value)}
                            placeholder={`Option ${optKey}`}
                            className="flex-1 bg-transparent text-xs font-semibold text-[#1c1c1e] focus:outline-none min-w-0"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuestionChange(qIndex, "correctAnswer", optKey)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all shrink-0 cursor-pointer ${
                              isCorrect
                                ? "bg-[#187574] text-white"
                                : "bg-white border border-[#c7cad5] text-[#6a6d7c] hover:bg-[#e6e8ec]"
                            }`}
                          >
                            {isCorrect ? "✓ Key" : "Set Key"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="pt-4 pb-12 flex items-center justify-between gap-4 border-t border-[#c7cad5] w-full">
          <button
            onClick={() => navigate("/filter-user-quiz")}
            type="button"
            className="px-6 py-3 rounded-full border border-[#c7cad5] bg-white text-xs font-bold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors cursor-pointer"
          >
            Cancel Changes
          </button>
          <button
            onClick={handleSaveQuiz}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#ffd02f]" />
            <span>{isSaving ? "Saving Quiz..." : "Save Quiz Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
