"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Badge } from "../../ui/badge"
import { Clock, Target, Zap, Loader2, X, ArrowLeft } from "lucide-react"
import { getAllQuizRegions, createQuizWithGeneratedQuestion } from "../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import puter from '@heyputer/puter.js'
import questionIdGenerator from '../../../lib/questionIdGenerator'

const shuffleOptions = (options, correctAnswer) => {
  const labels = ["A", "B", "C", "D"]
  const values = labels.map(l => options[l])

  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]]
  }

  const correctText = options[correctAnswer]
  const shuffledOptions = {}
  let newCorrectAnswer = correctAnswer

  values.forEach((text, idx) => {
    shuffledOptions[labels[idx]] = text
    if (text === correctText) newCorrectAnswer = labels[idx]
  })

  return { shuffledOptions, newCorrectAnswer }
}

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
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [storeStats, setStoreStats] = useState({ totalQuestions: 0, uniqueHashes: 0 })

  const questionTypes = ["Easy", "Average", "Hard"]
  const languages = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Gujarati", "Marathi"]

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      setStoreStats(questionIdGenerator.getStats())
    }
    updateStats()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

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
      let timePerQuestion = 1
      if (questionType === "Average") timePerQuestion = 2
      if (questionType === "Hard") timePerQuestion = 3

      setFormData((prev) => ({
        ...prev,
        duration: Number.parseInt(totalQuestions) * timePerQuestion,
      }))
    }
  }, [formData.questionType, formData.totalQuestions])

  const buildPrompt = (count) => {
    const { questionType: difficulty, languages, region, examType, specificClass, subject, topics } = formData
    const selectedRegion = regions.find(r => r._id === region)
    const regionName = selectedRegion?.name || region

    const language = languages[0] || "English"
    const nonEnglishNote = language.toLowerCase() !== "english"
      ? `Do NOT use English. Respond strictly in ${language}.`
      : ""

    return `
You are a professional exam setter for competitive engineering exams like GATE.

Generate exactly ${count} UNIQUE multiple-choice question(s) with:
- Exactly four options labeled A, B, C, D
- One correct answer only per question
- No ambiguity
- Difficulty: ${difficulty}

Context:
- Language: ${language}
- Exam Type: ${examType}
- Class: ${specificClass}
- Subject: ${subject}
- Chapter: ${topics.join(", ")}
- Region: ${regionName}

${nonEnglishNote}

IMPORTANT: 
1. Generate completely UNIQUE questions. Do NOT repeat any questions
2. Vary the correct answers — do NOT make all answers "A"
3. Distribute correct answers across A, B, C, and D roughly equally

Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences:
[
  {
    "question": "Full question text here",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "answer": "B",
    "tags": ["tag1"]
  }
]
`
  }

  const generateUniqueQuestionsWithPuter = async (desiredCount, maxAttempts = 3) => {
    let allQuestions = []
    let attempts = 0
    let totalGenerated = 0

    while (allQuestions.length < desiredCount && attempts < maxAttempts) {
      const remainingNeeded = desiredCount - allQuestions.length
      const prompt = buildPrompt(remainingNeeded)
      
      let response;
      try {
        response = await puter.ai.chat(prompt, {
          model: "gpt-4o-mini",
          stream: false,
          temperature: 0.9,
          max_tokens: 4096
        })
      } catch (pErr) {
        console.warn("Puter gpt-4o-mini failed, trying default model:", pErr);
        response = await puter.ai.chat(prompt);
      }

      let raw = response?.message?.content || response?.text || response;
      if (typeof raw !== 'string') {
        raw = JSON.stringify(raw) || "";
      }
      let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        cleaned = arrayMatch[0];
      }

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        console.error("AI parse error. Raw response:", raw);
        attempts++;
        continue;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        attempts++
        continue
      }

      for (const q of parsed) {
        if (
          !q.question ||
          !q.options?.A ||
          !q.options?.B ||
          !q.options?.C ||
          !q.options?.D ||
          !q.answer
        ) continue

        // Check for duplicate using crypto-based ID generator
        const isDuplicate = await questionIdGenerator.isQuestionDuplicate(q.question)
        
        if (!isDuplicate) {
          const { shuffledOptions, newCorrectAnswer } = shuffleOptions(q.options, q.answer)
          const uniqueId = await questionIdGenerator.generateUniqueId(q.question)
          
          await questionIdGenerator.addQuestion(q.question, uniqueId)
          
          allQuestions.push({
            id: uniqueId,
            text: q.question,
            options: shuffledOptions,
            correctAnswer: newCorrectAnswer,
            difficulty: formData.questionType,
            tags: q.tags || [],
            image: "",
            note: "",
            timestamp: Date.now(),
            hash: await questionIdGenerator.generateQuestionHash(q.question)
          })
          
          totalGenerated++
          setProgress(totalGenerated)
          setStoreStats(questionIdGenerator.getStats())
        } else {
          console.log('Duplicate detected:', q.question.substring(0, 50))
        }
        
        if (allQuestions.length >= desiredCount) break
      }
      
      attempts++
      
      // Wait before retry if needed
      if (allQuestions.length < desiredCount && attempts < maxAttempts) {
        toast.loading(`Generated ${allQuestions.length} unique questions, generating ${desiredCount - allQuestions.length} more...`, { duration: 2000 })
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    
    return allQuestions
  }

  const generateUniqueQuestions = async (desiredCount) => {
    // 1. First attempt: Puter AI from frontend
    try {
      toast.loading("Generating with AI...", { id: "ai-gen" });
      const puterQuestions = await generateUniqueQuestionsWithPuter(desiredCount);
      if (Array.isArray(puterQuestions) && puterQuestions.length > 0) {
        toast.success(`Generated ${puterQuestions.length} question(s) successfully!`, { id: "ai-gen" });
        return puterQuestions;
      }
      throw new Error("Puter AI generated no questions");
    } catch (puterError) {
      console.warn("Puter AI failed or busy, falling back to OpenRouter NVIDIA:", puterError);
      toast.loading("Generating with AI...", { id: "ai-gen" });
    }

    // 2. Fallback: OpenRouter AI from backend (NVIDIA model)
    let allQuestions = [];
    const selectedRegion = regions.find(r => r._id === formData.region);
    const regionName = selectedRegion?.name || formData.region;

    try {
      const response = await createQuizWithGeneratedQuestion({
        region: regionName,
        examType: formData.examType,
        specificClass: formData.specificClass,
        subject: formData.subject,
        chapter: formData.topics,
        difficulty: formData.questionType,
        language: formData.languages,
        totalQuestions: desiredCount,
      });

      if (response?.success && Array.isArray(response.questions) && response.questions.length > 0) {
        for (const q of response.questions) {
          const qText = q.question || q.text;
          const opts = q.options;
          const ans = q.correctAnswer || q.answer;

          if (!qText || !opts?.A || !opts?.B || !opts?.C || !opts?.D || !ans) continue;

          const isDuplicate = await questionIdGenerator.isQuestionDuplicate(qText);
          if (!isDuplicate) {
            const { shuffledOptions, newCorrectAnswer } = shuffleOptions(opts, ans);
            const uniqueId = await questionIdGenerator.generateUniqueId(qText);
            await questionIdGenerator.addQuestion(qText, uniqueId);

            allQuestions.push({
              id: uniqueId,
              text: qText,
              options: shuffledOptions,
              correctAnswer: newCorrectAnswer,
              difficulty: formData.questionType,
              tags: q.tags || [],
              image: "",
              note: "",
              timestamp: Date.now(),
              hash: await questionIdGenerator.generateQuestionHash(qText)
            });

            setProgress(allQuestions.length);
            setStoreStats(questionIdGenerator.getStats());
          }
          if (allQuestions.length >= desiredCount) break;
        }

        if (allQuestions.length > 0) {
          toast.success(`Generated ${allQuestions.length} question(s) successfully!`, { id: "ai-gen" });
          return allQuestions;
        }
      }
      throw new Error("Backend OpenRouter returned no valid questions");
    } catch (backendError) {
      console.error("Backend OpenRouter failed as well:", backendError);
      toast.error("Failed to generate questions with AI", { id: "ai-gen" });
    }

    return allQuestions;
  }

  const generateQuestions = async () => {
    const {
      region,
      examType,
      specificClass,
      subject,
      topics,
      questionType,
      languages,
      totalQuestions,
    } = formData;

    // Validation
    if (!region || !examType || !specificClass || !subject || !topics.length || !questionType || !languages.length || !totalQuestions) {
      toast.error("Please fill all required fields");
      return;
    }

    const count = parseInt(totalQuestions)
    if (!count || count < 1 || count > 20) {
      toast.error("Please enter a valid number of questions (1–20)")
      return
    }

    setGenerating(true)
    setProgress(0)

    try {
      const generatedQuestions = await generateUniqueQuestions(count)

      // Create quiz session with crypto IDs
      const sessionId = await questionIdGenerator.generateUniqueId(`session_${Date.now()}`)
      const selectedRegion = regions.find(r => r._id === region)
      
      const quizData = {
        id: sessionId,
        region: selectedRegion?.name || region,
        examType,
        specificClass,
        subject,
        chapter: topics,
        difficulty: questionType,
        duration: formData.duration,
        languages,
        questions: generatedQuestions,
        totalQuestions: generatedQuestions.length,
        sessionHash: await questionIdGenerator.generateQuestionHash(`${sessionId}-${Date.now()}`),
        generatedAt: new Date().toISOString()
      }

      // Store in localStorage with encryption
      const savedQuizzes = localStorage.getItem('generatedQuizzes')
      const quizzes = savedQuizzes ? JSON.parse(savedQuizzes) : {}
      quizzes[sessionId] = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        questions: generatedQuestions,
        metadata: quizData,
        hash: await questionIdGenerator.generateQuestionHash(JSON.stringify(quizData))
      }
      localStorage.setItem('generatedQuizzes', JSON.stringify(quizzes))

      // Navigate to attempt page
      navigate('/attempt', { state: { quizData } })

    } catch (error) {
      console.error("AI Generation Error:", error)
      toast.error("Failed to generate questions: " + (error.message || "Unknown error"))
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  const handleClearStore = () => {
    if (window.confirm(`Are you sure you want to clear ${storeStats.totalQuestions} stored questions? This action cannot be undone.`)) {
      questionIdGenerator.clearStore()
      setStoreStats({ totalQuestions: 0, uniqueHashes: 0 })
      toast.success("Question store cleared successfully")
    }
  }

  const handleCancel = () => {
    window.location.href = "/dashboard"
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the quiz builder</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8"
      >
        {/* Centered Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Create Quiz
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Configure your quiz and generate questions with AI
          </p>
          {storeStats.totalQuestions > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              🔒 {storeStats.totalQuestions} unique questions in secure store
            </p>
          )}
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="bg-white/90 border-0 shadow-xl rounded-none">
            <CardContent className="p-6 space-y-6">
              {/* All fields in a single grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Region</Label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    disabled={generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select region</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Exam Type</Label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value }))}
                    disabled={!formData.region || generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select exam type</option>
                    {examTypes.map((examType) => (
                      <option key={examType.name} value={examType.name}>
                        {examType.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Class</Label>
                  <select
                    value={formData.specificClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, specificClass: e.target.value }))}
                    disabled={!formData.examType || generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select class</option>
                    {specificClasses.map((specificClass) => (
                      <option key={specificClass.name} value={specificClass.name}>
                        {specificClass.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Subject</Label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    disabled={!formData.specificClass || generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.name} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Topics</Label>
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
                    disabled={!formData.subject || generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select topics</option>
                    {topics.map((topic) => (
                      <option key={topic.name} value={topic.name}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  {formData.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 rounded-none text-xs">
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

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Difficulty</Label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, questionType: e.target.value }))}
                    disabled={generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select difficulty</option>
                    {questionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Language</Label>
                  <select
                    value={formData.languages[0] || ""}
                    onChange={(e) => {
                      if (!formData.languages.includes(e.target.value)) {
                        setFormData(prev => ({
                          ...prev,
                          languages: [e.target.value],
                        }))
                      }
                    }}
                    disabled={generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Select language</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Total Questions</Label>
                  <Input
                    type="number"
                    placeholder="1-20"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalQuestions: e.target.value }))}
                    disabled={generating}
                    className="w-full h-11 px-3 border-2 border-gray-200 rounded-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Duration (minutes)</Label>
                  <div className="w-full h-11 px-3 bg-gray-50 border-2 border-gray-200 rounded-none flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-700 font-medium">{formData.duration} min</span>
                  </div>
                </div>
              </div>

              {/* Generation Progress */}
              {generating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4"
                >
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <p className="text-gray-700 font-medium">Generating unique questions with crypto verification...</p>
                    </div>
                    {progress > 0 && (
                      <>
                        <p className="text-2xl font-bold text-indigo-600">
                          {progress}
                          <span className="text-base text-gray-400"> unique questions generated</span>
                        </p>
                        <div className="w-full bg-gray-200 h-1 overflow-hidden">
                          <motion.div
                            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${Math.min((progress / parseInt(formData.totalQuestions)) * 100, 100)}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </>
                    )}
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
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-6 justify-center"
        >
          <Button
            onClick={generateQuestions}
            disabled={generating}
            className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={generating}
            className="h-12 px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-none hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </motion.div>

        {/* Clear Store Button */}
        {storeStats.totalQuestions > 0 && !generating && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleClearStore}
              variant="ghost"
              className="text-xs text-gray-400 hover:text-red-600"
            >
              Clear Question Store ({storeStats.totalQuestions} questions)
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}