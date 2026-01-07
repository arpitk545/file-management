'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Badge } from "../../../ui/badge"
import { ArrowLeft, Save, Tag, X } from 'lucide-react'
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { getAllQuizRegions, getQuizBankQuestion, updateQuizBankQuestion } from "../../../../services/operations/quizAPI"

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

export default function UpdateQuizBank() {
  const navigate = useNavigate()
  const { questionId } = useParams()
  
  const [initialQuestion, setInitialQuestion] = useState(null)
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    quizType:"quizbank",
  })

  const [editedQuestion, setEditedQuestion] = useState({
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "",
    difficulty: "",
    tags: []
  })

  const [tagInput, setTagInput] = useState("")

  // Fetch question and regions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch question data first
        const questionResponse = await getQuizBankQuestion(questionId)
        setInitialQuestion(questionResponse.question) 
        
        // Then fetch regions
        const regionsResponse = await getAllQuizRegions()
        setRegions(regionsResponse?.data || [])
        
        // Find matching region
        const matchingRegion = regionsResponse.data.find(
          r => r.name === questionResponse.question.category?.region
        )
        
        // Set form data with existing values
        setFormData({
          region: matchingRegion?._id || "",
          examType: questionResponse.question.category?.examType || "",
          specificClass: questionResponse.question.category?.specificClass || "",
          subject: questionResponse.question.category?.subject || "",
          chapter: questionResponse.question.category?.chapter || "",
          quizType: "quizbank",
        })

        setEditedQuestion({
          text: questionResponse.question.text || "",
          options: questionResponse.question.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: questionResponse.question.correctAnswer || "",
          difficulty: questionResponse.question.difficulty || "",
          tags: questionResponse.question.tags || []
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load question data")
        navigate('/quiz-bank')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [questionId, navigate])

  // Derived values for dropdowns
  const selectedRegionObject = regions.find(r => r._id === formData.region)

  const getExamTypes = () => {
    if (!selectedRegionObject) return []
    return selectedRegionObject.examTypes?.map(et => et.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegionObject || !formData.examType) return []
    const examTypeObj = selectedRegionObject.examTypes?.find(et => et.name === formData.examType)
    return examTypeObj?.specificClasses?.map(sc => sc.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegionObject || !formData.examType || !formData.specificClass) return []
    const examTypeObj = selectedRegionObject.examTypes?.find(et => et.name === formData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find(sc => sc.name === formData.specificClass)
    return classObj?.subjects?.map(subject => subject.name) || []
  }

  const getChapters = () => {
    if (!selectedRegionObject || !formData.examType || !formData.specificClass || !formData.subject) return []
    const examTypeObj = selectedRegionObject.examTypes?.find(et => et.name === formData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find(sc => sc.name === formData.specificClass)
    if (!classObj) return []
    const subjectObj = classObj.subjects?.find(sub => sub.name === formData.subject)
    return subjectObj?.chapters?.map(ch => ch.name) || []
  }

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !editedQuestion.tags.includes(tagInput.trim())) {
      setEditedQuestion(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setEditedQuestion(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Form submission
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)
      
      const selectedRegion = regions.find(r => r._id === formData.region)
      
      const payload = {
        text: editedQuestion.text,
        options: editedQuestion.options,
        correctAnswer: editedQuestion.correctAnswer,
        difficulty: editedQuestion.difficulty,
        tags: editedQuestion.tags,
        category: {
          region: selectedRegion?.name || "",
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter
        }
      }

      await updateQuizBankQuestion(questionId, payload)
      toast.success("Question updated successfully!")
      navigate(-1)
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!initialQuestion) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <p className="text-lg text-gray-600">Question not found</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-visible">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={handleCancel} />
              Edit Question
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Region</Label>
                <select
                  value={formData.region}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      region: e.target.value,
                      examType: "",
                      specificClass: "",
                      subject: "",
                      chapter: ""
                    }))
                  }}
                  className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Choose region</option>
                  {regions.map(region => (
                    <option key={region._id} value={region._id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.region && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Exam Type</Label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      examType: e.target.value,
                      specificClass: "",
                      subject: "",
                      chapter: ""
                    }))}
                    className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Choose exam type</option>
                    {getExamTypes().map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <AnimatePresence>
              {formData.examType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Class</Label>
                    <select
                      value={formData.specificClass}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specificClass: e.target.value,
                        subject: "",
                        chapter: ""
                      }))}
                      className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Choose class</option>
                      {getSpecificClasses().map(cls => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.specificClass && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Subject</Label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          subject: e.target.value,
                          chapter: ""
                        }))}
                        className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Choose subject</option>
                        {getSubjects().map(subject => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {formData.subject && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Chapter</Label>
                    <select
                      value={formData.chapter}
                      onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                      className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Choose chapter</option>
                      {getChapters().map(chapter => (
                        <option key={chapter} value={chapter}>
                          {chapter}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question Details - All fields pre-filled with API data */}
            <ModernTextarea
              label="Question"
              placeholder="Enter your question..."
              value={editedQuestion.text}
              onChange={(value) => setEditedQuestion(prev => ({ ...prev, text: value }))}
              rows={3}
            />
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(editedQuestion.options).map(([key, value]) => (
                <ModernInput
                  key={key}
                  label={`Option ${key}`}
                  placeholder={`Option ${key}...`}
                  value={value}
                  onChange={(val) => setEditedQuestion(prev => ({
                    ...prev,
                    options: { ...prev.options, [key]: val }
                  }))}
                />
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Correct Answer</Label>
                <select
                  value={editedQuestion.correctAnswer}
                  onChange={(e) => setEditedQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select answer</option>
                  {Object.keys(editedQuestion.options).map(option => (
                    <option key={option} value={option}>
                      Option {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Difficulty</Label>
                <select
                  value={editedQuestion.difficulty}
                  onChange={(e) => setEditedQuestion(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full h-14 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select difficulty</option>
                  {["Easy", "Average", "Hard"].map(difficulty => (
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
              {editedQuestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {editedQuestion.tags.map((tag, index) => (
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
            
            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="px-6 py-3 font-semibold rounded-2xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold rounded-2xl"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}