"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { useParams, useNavigate } from "react-router-dom"
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
} from "lucide-react"
import {
  getQuizById,
  updateQuizById,
  getAllQuizRegions,
  getAllQuizQuestions,
  extractQuestionsFromFile,
} from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import QuizAI from "./CreateQuizAI"

// ModernInput with optional searchable dropdown
const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon, options }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (options) {
    return (
      <div className="space-y-2 relative">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
              >
                {(options || [])
                  .filter((option) =>
                    option.toLowerCase().includes((value || "").toLowerCase())
                  )
                  .map((option, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
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
}

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

// Reusable image upload with preview via FileReader
const ImageUpload = ({ label, image, onImageChange, onRemove }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <ImageIcon className="w-4 h-4" />
      {label}
    </Label>
    {image ? (
      <div className="relative">
        <img
          src={image}
          alt={label}
          className="w-full h-48 object-contain rounded-xl border-2 border-gray-200"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 transition-colors">
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
        <Upload className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">Click to upload image</span>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
          </div>
          Question {index + 1}
        </h3>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ModernTextarea
        label="Question"
        placeholder="Enter your question here..."
        value={question.text}
        onChange={(value) => onUpdate({ ...question, text: value })}
        rows={3}
      />

      <ImageUpload
        label="Question Image"
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
        label="Note"
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
  const [activeSource, setActiveSource] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)

  // Fetch regions and quiz data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const regionsResponse = await getAllQuizRegions()
        const regionList = regionsResponse?.data || []
        setRegions(regionList)

        const quizResponse = await getQuizById(id)
        const quizData = quizResponse?.data || {}

        const regionObj = regionList.find((r) => r.name === quizData?.category?.region) || null

        setFormData({
          quizTitle: quizData?.category?.quizTitle || "",
          region: regionObj?._id || "",
          regionName: quizData?.category?.region || "",
          examType: quizData?.category?.examType || "",
          specificClass: quizData?.category?.specificClass || "",
          subject: quizData?.category?.subject || "",
          chapter: quizData?.category?.chapter || "",
          duration: quizData?.category?.duration || "",
          author: quizData?.category?.author || "",
          quizType: quizData?.category?.quizType || "createquiz",
          description: quizData?.category?.description || "",
          thumbnailimage: quizData?.category?.thumbnailimage || null,
        })

        setSelectedRegion(regionObj)
        setQuestions(
          (quizData?.questions || []).map((q, idx) => ({
            id: q.id || idx,
            text: q.text || "",
            options: {
              A: q.options?.A || "",
              B: q.options?.B || "",
              C: q.options?.C || "",
              D: q.options?.D || "",
            },
            correctAnswer: q.correctAnswer || "",
            difficulty: q.difficulty || "",
            image: q.image || null,
            note: q.note || "",
            tags: q.tags || [],
          }))
        )
      } catch (error) {
        console.error("Failed to fetch quiz data:", error)
        toast.error("Failed to load quiz data")
        navigate("/view-quiz")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  // Quiz bank fetch
  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await getAllQuizQuestions({
        category: {
          region: formData.regionName,
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter,
          quizType: "quizbank",
        },
      })
      const data = response?.data || []
      setQuestions(data)
      setActiveSource("quizBank")
      toast.success(`Questions loaded from quiz bank`)
    } catch (error) {
      toast.error("No questions found in the quiz bank for the selected category")
    } finally {
      setIsLoading(false)
    }
  }

  // Dropdown option helpers
  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map((type) => type.name) || []
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

  // Question CRUD
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      options: { A: "", B: "", C: "", D: "" },
      correctAnswer: "",
      difficulty: "",
      image: null,
      note: "",
      tags: [],
    }
    setQuestions((prev) => [...prev, newQuestion])
  }
  const updateQuestion = (index, updatedQuestion) => {
    setQuestions((prev) => {
      const next = [...prev]
      next[index] = updatedQuestion
      return next
    })
  }
  const deleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  // File import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setActiveSource("fileImport")
      toast.success(`File selected: ${file.name}`)
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
        setActiveSource("extract")
        toast.success(`Extracted ${data.questions.length} questions!`)
      } else {
        toast.error("No questions extracted from the file.")
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

  // Thumbnail
  const handleThumbnailChange = (imageData) => {
    setFormData((fd) => ({ ...fd, thumbnailimage: imageData }))
  }
  const handleRemoveThumbnail = () => {
    setFormData((fd) => ({ ...fd, thumbnailimage: null }))
  }

  // Submit
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading quiz data...</p>
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
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-center">
                Update Quiz
              </h1>
              <p className="text-gray-600 text-lg text-center">Modify your quiz content and settings</p>
            </div>
          </motion.div>
        </div>

        {/* Quiz Configuration */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible mb-8">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7" />
                Quiz Configuration
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  label="Author"
                  placeholder="Enter author name..."
                  value={formData.author || ""}
                  onChange={(value) => setFormData({ ...formData, author: value })}
                  icon={User}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Select Region</Label>
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
                    className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Class/Exam Type</Label>
                      <select
                        value={formData.examType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            examType: e.target.value,
                            specificClass: "",
                            subject: "",
                            chapter: "",
                          })
                        }
                        className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose exam type</option>
                        {getExamTypes().map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {formData.examType && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700">Specific Class</Label>
                      <select
                        value={formData.specificClass}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specificClass: e.target.value,
                            subject: "",
                            chapter: "",
                          })
                        }
                        className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose class</option>
                        {getSpecificClasses().map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {formData.specificClass && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Subject (Category)</Label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: "" })}
                        className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose subject</option>
                        {getSubjects().map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <AnimatePresence>
                      {formData.subject && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label className="text-sm font-semibold text-gray-700">Chapter/Topic (Sub Category)</Label>
                          <select
                            value={formData.chapter}
                            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                            className="w-full h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="">Choose chapter</option>
                            {getChapters().map((chapter) => (
                              <option key={chapter} value={chapter}>
                                {chapter}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <ModernTextarea
                label="Description"
                placeholder="Write a short description..."
                value={formData.description || ""}
                onChange={(v) => setFormData({ ...formData, description: v })}
                rows={3}
              />

              <ImageUpload
                label="Quiz Thumbnail"
                image={formData.thumbnailimage}
                onImageChange={handleThumbnailChange}
                onRemove={handleRemoveThumbnail}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
          {/* Sources */}
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Database className="w-6 h-6" />
                Question Sources
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button
                  onClick={fetchQuestions}
                  variant={activeSource === "quizBank" ? "default" : "outline"}
                  className={`h-16 rounded-2xl transition-all duration-200 ${
                    activeSource === "quizBank"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 bg-transparent"
                  }`}
                >
                  <Database className="w-5 h-5 mr-2" />
                  Quiz Bank
                </Button>

                <Button
                  onClick={() => setActiveSource("fileImport")}
                  variant={activeSource === "fileImport" ? "default" : "outline"}
                  className={`h-16 rounded-2xl transition-all duration-200 ${
                    activeSource === "fileImport"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-2 border-green-200 hover:border-green-400 hover:bg-green-50 bg-transparent"
                  }`}
                >
                  <FileInput className="w-5 h-5 mr-2" />
                  Import File
                </Button>

                <Button
                  onClick={handleExtractQuestions}
                  disabled={!selectedFile}
                  variant={activeSource === "extract" ? "default" : "outline"}
                  className={`h-16 rounded-2xl transition-all duration-200 ${
                    activeSource === "extract"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 bg-transparent"
                  }`}
                >
                  <FileUp className="w-5 h-5 mr-2" />
                  Extract Questions
                </Button>

                <Button
                  onClick={() => setShowAIModal(true)}
                  variant="outline"
                  className="h-16 rounded-2xl transition-all duration-200 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 bg-transparent"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  AI Generator
                </Button>
              </div>

              {activeSource === "fileImport" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 relative"
                >
                  <div className="border-2 border-dashed border-blue-400 rounded-2xl p-8 text-center relative">
                    <button
                      type="button"
                      onClick={() => setActiveSource(null)}
                      className="absolute top-3 right-3 text-red-600 hover:text-red-800 focus:outline-none text-2xl font-bold"
                      aria-label="Close upload area"
                    >
                      &#x2715;
                    </button>

                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-3">
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
                        {selectedFile ? "Click on the Extract Button to Get Questions" : "Drag & drop or click to browse"}
                      </p>
                    </label>
                  </div>
                </motion.div>
              )}

              {importedQuestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 border-2 border-dashed border-gray-300 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Imported Question {currentQuestionIndex + 1} of {importedQuestions.length}
                    </h3>
                    <Button onClick={handleAddImportedQuestion} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Quiz
                    </Button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-medium mb-2">{importedQuestions[currentQuestionIndex]?.text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["A", "B", "C", "D"].map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="font-bold">{opt}:</span>
                          <span>{importedQuestions[currentQuestionIndex]?.options?.[opt]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <span className="font-bold">Correct Answer:</span> {importedQuestions[currentQuestionIndex]?.correctAnswer}
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Manual Builder */}
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                Question Builder
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Questions ({questions.length})</h3>
                <div className="flex gap-4">
                  <Button
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-6 py-2 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
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
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No questions added yet</p>
                    <p className="text-sm">Click "Add Question" to start building your quiz</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={handleUpdateQuiz}
              disabled={isSubmitting}
              className="h-14 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Quiz
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate("/view-quiz")}
              variant="outline"
              className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </motion.div>
        </motion.div>

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
