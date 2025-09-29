"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Badge } from "../../ui/badge"
import { BookOpen, Clock, Target, Zap, Loader2, X, ArrowLeft, Sparkles } from "lucide-react"
import { createQuizWithGeneratedQuestion, getAllQuizRegions } from "../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon }) => (
  <div className="space-y-2 w-full">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full"
    />
  </div>
)

export default function CreateQuiz() {
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    topics: [],
    questionType: "",
    languages: [],
    totalQuestions: "",
    duration: 0,
  })
  const navigate = useNavigate();
  const [regions, setRegions] = useState([])
  const [examTypes, setExamTypes] = useState([])
  const [specificClasses, setSpecificClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)

  const questionTypes = ["Easy", "Average", "Hard"]
  const languages = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Gujarati", "Marathi"]

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true)
        const response = await getAllQuizRegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Failed to fetch regions:", error)
        toast.error("Failed to load regions")
      } finally {
        setLoading(false)
      }
    }
    fetchRegions()
  }, [])

  useEffect(() => {
  const handleBackButton = (event) => {
    event.preventDefault();
    navigate("/dashboard", { replace: true });
  };

  window.addEventListener("popstate", handleBackButton);

  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
}, [navigate]);


  // Fetch exam types when region is selected
  useEffect(() => {
    if (formData.region) {
      const selectedRegion = regions.find(region => region._id === formData.region)
      if (selectedRegion) {
        setExamTypes(selectedRegion.examTypes || [])
        setFormData(prev => ({ ...prev, examType: "", specificClass: "", subject: "", topics: [] }))
      }
    } else {
      setExamTypes([])
    }
  }, [formData.region, regions])

  // Fetch specific classes when exam type is selected
  useEffect(() => {
    if (formData.region && formData.examType) {
      const selectedRegion = regions.find(region => region._id === formData.region)
      if (selectedRegion) {
        const selectedExamType = selectedRegion.examTypes.find(et => et.name === formData.examType)
        if (selectedExamType) {
          setSpecificClasses(selectedExamType.specificClasses || [])
          setFormData(prev => ({ ...prev, specificClass: "", subject: "", topics: [] }))
        }
      }
    } else {
      setSpecificClasses([])
    }
  }, [formData.examType, formData.region, regions])

  // Fetch subjects when specific class is selected
  useEffect(() => {
    if (formData.region && formData.examType && formData.specificClass) {
      const selectedRegion = regions.find(region => region._id === formData.region)
      if (selectedRegion) {
        const selectedExamType = selectedRegion.examTypes.find(et => et.name === formData.examType)
        if (selectedExamType) {
          const selectedSpecificClass = selectedExamType.specificClasses.find(sc => sc.name === formData.specificClass)
          if (selectedSpecificClass) {
            setSubjects(selectedSpecificClass.subjects || [])
            setFormData(prev => ({ ...prev, subject: "", topics: [] }))
          }
        }
      }
    } else {
      setSubjects([])
    }
  }, [formData.specificClass, formData.examType, formData.region, regions])

  // Fetch topics when subject is selected
  useEffect(() => {
    if (formData.region && formData.examType && formData.specificClass && formData.subject) {
      const selectedRegion = regions.find(region => region._id === formData.region)
      if (selectedRegion) {
        const selectedExamType = selectedRegion.examTypes.find(et => et.name === formData.examType)
        if (selectedExamType) {
          const selectedSpecificClass = selectedExamType.specificClasses.find(sc => sc.name === formData.specificClass)
          if (selectedSpecificClass) {
            const selectedSubject = selectedSpecificClass.subjects.find(sub => sub.name === formData.subject)
            if (selectedSubject) {
              setTopics(selectedSubject.chapters || [])
              setFormData(prev => ({ ...prev, topics: [] }))
            }
          }
        }
      }
    } else {
      setTopics([])
    }
  }, [formData.subject, formData.specificClass, formData.examType, formData.region, regions])

  // Auto-calculate duration based on question type and total questions
  useEffect(() => {
    const { questionType, totalQuestions } = formData
    if (questionType && totalQuestions) {
      let timePerQuestion = 1 // Easy: 1 min
      if (questionType === "Average") timePerQuestion = 2
      if (questionType === "Hard") timePerQuestion = 3

      setFormData((prev) => ({
        ...prev,
        duration: Number.parseInt(totalQuestions) * timePerQuestion,
      }))
    }
  }, [formData.questionType, formData.totalQuestions])

  const handleSubmit = async () => {
    try {
      const {
        region,
        examType,
        specificClass,
        subject,
        topics,
        questionType,
        languages,
        totalQuestions,
        duration,
      } = formData;

      // Basic validation
      if (
        !region || !examType || !specificClass || !subject ||
        !topics.length || !questionType || !languages.length || !totalQuestions
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const payload = {
        region,
        examType,
        specificClass,
        subject,
        chapter: topics,         
        difficulty: questionType,
        language: languages,    
        totalQuestions: Number(totalQuestions),
        duration: Number(duration),
      };
      setLoading(true);

      const response = await createQuizWithGeneratedQuestion(payload);
      if (response) {
        toast.success("Quiz generated successfully!");
        const quizData = {
         ...response, 
         region: regions.find(r => r._id === region)?.name || region,
         examType,
         specificClass,
         subject,
         difficulty: questionType,
         duration,
         languages
       };
         navigate('/attempt', { state: { quizData } });
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = "/dashboard"
  }
   if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading your Quiz...</h2>
          <p className="text-gray-600">Please wait while we process your AI quiz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Quiz
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">Design your custom quiz with AI assistance</p>
            </div>
          </motion.div>
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 sm:p-8">
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-5 h-5 sm:w-7 sm:h-7" />
                Quiz Configuration
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">1</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Region</Label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full bg-white"
                    >
                      <option value="">Select region</option>
                      {regions.map((region) => (
                        <option key={region._id} value={region._id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Exam Type</Label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value }))}
                      disabled={!formData.region}
                      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full bg-white"
                    >
                      <option value="">Select exam type</option>
                      {examTypes.map((examType) => (
                        <option key={examType.name} value={examType.name}>
                          {examType.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Class</Label>
                    <select
                      value={formData.specificClass}
                      onChange={(e) => setFormData(prev => ({ ...prev, specificClass: e.target.value }))}
                      disabled={!formData.examType}
                      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full bg-white"
                    >
                      <option value="">Select class</option>
                      {specificClasses.map((specificClass) => (
                        <option key={specificClass.name} value={specificClass.name}>
                          {specificClass.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Subject & Topics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm sm:text-base">2</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Subject & Topics</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Subject</Label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      disabled={!formData.specificClass}
                      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full bg-white"
                    >
                      <option value="">Select subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.name} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Topics</Label>
                    <select
                      value={formData.topics[0] || ""}
                      onChange={(e) => {
                        if (!formData.topics.includes(e.target.value)) {
                          setFormData(prev => ({
                            ...prev,
                            topics: [...prev.topics, e.target.value],
                          }))
                        }
                      }}
                      disabled={!formData.subject}
                      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full bg-white"
                    >
                      <option value="">Select topics</option>
                      {topics.map((topic) => (
                        <option key={topic.name} value={topic.name}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                    {formData.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 rounded-full">
                            {topic}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  topics: prev.topics.filter(t => t !== topic),
                                }))
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Quiz Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm sm:text-base">3</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Quiz Settings</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Question Type</Label>
                    <select
                      value={formData.questionType}
                      onChange={(e) => setFormData(prev => ({ ...prev, questionType: e.target.value }))}
                      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full bg-white"
                    >
                      <option value="">Select difficulty</option>
                      {questionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Languages</Label>
                    <select
                      value={formData.languages[0] || ""}
                      onChange={(e) => {
                        if (!formData.languages.includes(e.target.value)) {
                          setFormData(prev => ({
                            ...prev,
                            languages: [...prev.languages, e.target.value],
                          }))
                        }
                      }}
                      className="h-14 px-4 border-2 border-gray-200 rounded-2xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full bg-white"
                    >
                      <option value="">Select languages</option>
                      {languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    {formData.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.languages.map((language, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 rounded-full">
                            {language}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  languages: prev.languages.filter(l => l !== language),
                                }))
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <ModernInput
                    label="Total Questions"
                    type="number"
                    placeholder="Enter number"
                    value={formData.totalQuestions}
                    onChange={(value) => setFormData(prev => ({ ...prev, totalQuestions: value }))}
                    icon={Target}
                  />

                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </Label>
                    <div className="h-14 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{formData.duration} minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Duration Info */}
              {formData.questionType && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Duration Calculation</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div
                      className={`p-2 sm:p-3 rounded-xl ${
                        formData.questionType === "Easy" ? "bg-green-100 text-green-800" : "bg-white text-gray-600"
                      }`}
                    >
                      <div className="font-semibold">Easy: 1 min/question</div>
                    </div>
                    <div
                      className={`p-2 sm:p-3 rounded-xl ${
                        formData.questionType === "Average" ? "bg-yellow-100 text-yellow-800" : "bg-white text-gray-600"
                      }`}
                    >
                      <div className="font-semibold">Average: 2 min/question</div>
                    </div>
                    <div
                      className={`p-2 sm:p-3 rounded-xl ${
                        formData.questionType === "Hard" ? "bg-red-100 text-red-800" : "bg-white text-gray-600"
                      }`}
                    >
                      <div className="font-semibold">Hard: 3 min/question</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center"
        >
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="overflow-hidden h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outline"
            className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl sm:rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 bg-transparent text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Cancel
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}