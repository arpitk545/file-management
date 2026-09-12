"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Target, Zap, Loader2, X, ArrowLeft, Bot, Sparkles, CheckCircle, Database } from "lucide-react"
import { getAllQuizRegions, createQuizWithGeneratedQuestion } from "../../../services/operations/quizAPI"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import puter from "@heyputer/puter.js"
import questionIdGenerator from "../../../lib/questionIdGenerator"

const shuffleOptions = (options, correctAnswer) => {
  const labels = ["A", "B", "C", "D"]
  const values = labels.map((l) => options[l])

  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
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
    questionType: "Easy",
    languages: ["English"],
    totalQuestions: "5",
    duration: 5,
  })
  const navigate = useNavigate()
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
      event.preventDefault()
      navigate("/dashboard", { replace: true })
    }

    window.addEventListener("popstate", handleBackButton)

    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [navigate])

  // Fetch exam types when region is selected
  useEffect(() => {
    if (formData.region) {
      const selectedRegion = regions.find((region) => region._id === formData.region)
      if (selectedRegion) {
        setExamTypes(selectedRegion.examTypes || [])
        setFormData((prev) => ({ ...prev, examType: "", specificClass: "", subject: "", topics: [] }))
      }
    } else {
      setExamTypes([])
    }
  }, [formData.region, regions])

  // Fetch specific classes when exam type is selected
  useEffect(() => {
    if (formData.region && formData.examType) {
      const selectedRegion = regions.find((region) => region._id === formData.region)
      if (selectedRegion) {
        const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
        if (selectedExamType) {
          setSpecificClasses(selectedExamType.specificClasses || [])
          setFormData((prev) => ({ ...prev, specificClass: "", subject: "", topics: [] }))
        }
      }
    } else {
      setSpecificClasses([])
    }
  }, [formData.examType, formData.region, regions])

  // Fetch subjects when specific class is selected
  useEffect(() => {
    if (formData.region && formData.examType && formData.specificClass) {
      const selectedRegion = regions.find((region) => region._id === formData.region)
      if (selectedRegion) {
        const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
        if (selectedExamType) {
          const selectedSpecificClass = selectedExamType.specificClasses?.find(
            (sc) => sc.name === formData.specificClass
          )
          if (selectedSpecificClass) {
            setSubjects(selectedSpecificClass.subjects || [])
            setFormData((prev) => ({ ...prev, subject: "", topics: [] }))
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
      const selectedRegion = regions.find((region) => region._id === formData.region)
      if (selectedRegion) {
        const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
        if (selectedExamType) {
          const selectedSpecificClass = selectedExamType.specificClasses?.find(
            (sc) => sc.name === formData.specificClass
          )
          if (selectedSpecificClass) {
            const selectedSubject = selectedSpecificClass.subjects?.find(
              (sub) => sub.name === formData.subject
            )
            if (selectedSubject) {
              setTopics(selectedSubject.chapters || [])
              setFormData((prev) => ({ ...prev, topics: [] }))
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

      const parsed = Number.parseInt(totalQuestions) || 0
      setFormData((prev) => ({
        ...prev,
        duration: parsed * timePerQuestion,
      }))
    }
  }, [formData.questionType, formData.totalQuestions])

  const buildPrompt = (count) => {
    const { questionType: difficulty, languages, region, examType, specificClass, subject, topics } = formData
    const selectedRegion = regions.find((r) => r._id === region)
    const regionName = selectedRegion?.name || region

    const language = languages[0] || "English"
    const nonEnglishNote =
      language.toLowerCase() !== "english"
        ? `Do NOT use English. Respond strictly in ${language}.`
        : ""

    return `
You are a professional exam setter for competitive academic curricula.

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

      let response
      try {
        response = await puter.ai.chat(prompt, {
          model: "gpt-4o-mini",
          stream: false,
          temperature: 0.9,
          max_tokens: 4096,
        })
      } catch (pErr) {
        console.warn("Puter gpt-4o-mini failed, trying default model:", pErr)
        response = await puter.ai.chat(prompt)
      }

      let raw = response?.message?.content || response?.text || response
      if (typeof raw !== "string") {
        raw = JSON.stringify(raw) || ""
      }
      let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim()
      const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (arrayMatch) {
        cleaned = arrayMatch[0]
      }

      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch (e) {
        console.error("AI parse error. Raw response:", raw)
        attempts++
        continue
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
        )
          continue

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
            hash: await questionIdGenerator.generateQuestionHash(q.question),
          })

          totalGenerated++
          setProgress(totalGenerated)
          setStoreStats(questionIdGenerator.getStats())
        } else {
          console.log("Duplicate detected:", q.question.substring(0, 50))
        }

        if (allQuestions.length >= desiredCount) break
      }

      attempts++

      if (allQuestions.length < desiredCount && attempts < maxAttempts) {
        toast.loading(
          `Generated ${allQuestions.length} unique questions, generating ${desiredCount - allQuestions.length} more...`,
          { duration: 2000 }
        )
        await new Promise((r) => setTimeout(r, 1000))
      }
    }

    return allQuestions
  }

  const generateUniqueQuestions = async (desiredCount) => {
    // 1. Puter AI
    try {
      toast.loading("Generating questions with AI...", { id: "ai-gen" })
      const puterQuestions = await generateUniqueQuestionsWithPuter(desiredCount)
      if (Array.isArray(puterQuestions) && puterQuestions.length > 0) {
        toast.success(`Generated ${puterQuestions.length} question(s) successfully!`, { id: "ai-gen" })
        return puterQuestions
      }
      throw new Error("Puter AI generated no questions")
    } catch (puterError) {
      console.warn("Puter AI failed, trying backend fallback:", puterError)
      toast.loading("Generating with AI...", { id: "ai-gen" })
    }

    // 2. OpenRouter AI Fallback
    let allQuestions = []
    const selectedRegion = regions.find((r) => r._id === formData.region)
    const regionName = selectedRegion?.name || formData.region

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
      })

      if (response?.success && Array.isArray(response.questions) && response.questions.length > 0) {
        for (const q of response.questions) {
          const qText = q.question || q.text
          const opts = q.options
          const ans = q.correctAnswer || q.answer

          if (!qText || !opts?.A || !opts?.B || !opts?.C || !opts?.D || !ans) continue

          const isDuplicate = await questionIdGenerator.isQuestionDuplicate(qText)
          if (!isDuplicate) {
            const { shuffledOptions, newCorrectAnswer } = shuffleOptions(opts, ans)
            const uniqueId = await questionIdGenerator.generateUniqueId(qText)
            await questionIdGenerator.addQuestion(qText, uniqueId)

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
              hash: await questionIdGenerator.generateQuestionHash(qText),
            })

            setProgress(allQuestions.length)
            setStoreStats(questionIdGenerator.getStats())
          }
          if (allQuestions.length >= desiredCount) break
        }

        if (allQuestions.length > 0) {
          toast.success(`Generated ${allQuestions.length} question(s) successfully!`, { id: "ai-gen" })
          return allQuestions
        }
      }
      throw new Error("Backend AI returned no valid questions")
    } catch (backendError) {
      console.error("Backend AI failed:", backendError)
      toast.error("Failed to generate questions with AI", { id: "ai-gen" })
    }

    return allQuestions
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
    } = formData

    if (
      !region ||
      !examType ||
      !specificClass ||
      !subject ||
      !topics.length ||
      !questionType ||
      !languages.length ||
      !totalQuestions
    ) {
      toast.error("Please fill all required fields")
      return
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

      if (!generatedQuestions.length) {
        toast.error("No questions could be generated. Please try again.")
        return
      }

      const sessionId = await questionIdGenerator.generateUniqueId(`session_${Date.now()}`)
      const selectedRegion = regions.find((r) => r._id === region)

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
        generatedAt: new Date().toISOString(),
      }

      const savedQuizzes = localStorage.getItem("generatedQuizzes")
      const quizzes = savedQuizzes ? JSON.parse(savedQuizzes) : {}
      quizzes[sessionId] = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        questions: generatedQuestions,
        metadata: quizData,
        hash: await questionIdGenerator.generateQuestionHash(JSON.stringify(quizData)),
      }
      localStorage.setItem("generatedQuizzes", JSON.stringify(quizzes))

      navigate("/attempt", { state: { quizData } })
    } catch (error) {
      console.error("AI Generation Error:", error)
      toast.error("Failed to generate questions: " + (error.message || "Unknown error"))
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  const handleClearStore = () => {
    if (
      window.confirm(
        `Are you sure you want to clear ${storeStats.totalQuestions} stored questions? This action cannot be undone.`
      )
    ) {
      questionIdGenerator.clearStore()
      setStoreStats({ totalQuestions: 0, uniqueHashes: 0 })
      toast.success("Question store cleared successfully")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#555a6a]">
          Loading AI quiz builder...
        </p>
      </div>
    )
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
                AI GENERATOR
              </span>
              <span className="px-3 py-1 bg-[#f5f3ff] text-[#4262ff] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                CRYPTO-VERIFIED
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#1c1c1e]">
              Create AI Assessment Quiz
            </h1>
            <p className="text-xs sm:text-sm text-[#555a6a] max-w-2xl leading-relaxed">
              Configure curriculum parameters and generate unique, verified multiple-choice questions instantly using AI.
            </p>
            {storeStats.totalQuestions > 0 && (
              <p className="text-[11px] text-[#555a6a] pt-1">
                🔒 {storeStats.totalQuestions} unique questions verified in local cryptographic hash store
              </p>
            )}
          </div>
        </div>

        {/* Configuration Card - Miro card-base */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#e6e8ec]">
            <div className="w-8 h-8 rounded-lg bg-[#fff4c4] flex items-center justify-center text-[#746019]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-medium text-[#1c1c1e]">Curriculum & Parameters</h2>
              <p className="text-xs text-[#555a6a]">Select academic board and specify topic details</p>
            </div>
          </div>

          {/* 4-Column Hierarchy Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Region */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#fff8e0] border border-[#fde89c]/70">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#746019]">
                Region / Board
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                disabled={generating}
                className="w-full h-10 px-3 bg-white border border-[#fde89c] rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
              >
                <option value="">Select region</option>
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
                onChange={(e) => setFormData((prev) => ({ ...prev, examType: e.target.value }))}
                disabled={!formData.region || generating}
                className="w-full h-10 px-3 bg-white border border-[#0fbcb0]/40 rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">Select exam type</option>
                {examTypes.map((examType) => (
                  <option key={examType.name} value={examType.name}>
                    {examType.name}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, specificClass: e.target.value }))}
                disabled={!formData.examType || generating}
                className="w-full h-10 px-3 bg-white border border-[#ffd8f4] rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">Select class</option>
                {specificClasses.map((specificClass) => (
                  <option key={specificClass.name} value={specificClass.name}>
                    {specificClass.name}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                disabled={!formData.specificClass || generating}
                className="w-full h-10 px-3 bg-white border border-[#ffe6cd] rounded-lg text-xs font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.name} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topics Multi-Select & Chips */}
          <div className="space-y-2 pt-2 border-t border-[#e6e8ec]">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
              Chapter / Topics (Select to Add)
            </label>
            <select
              value={formData.topics[0] || ""}
              onChange={(e) => {
                if (e.target.value && !formData.topics.includes(e.target.value)) {
                  setFormData((prev) => ({
                    ...prev,
                    topics: [...prev.topics, e.target.value],
                  }))
                }
              }}
              disabled={!formData.subject || generating}
              className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm font-normal text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] disabled:bg-[#f7f8fa] disabled:text-[#a5a8b5] disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">Choose topics from subject list...</option>
              {topics.map((topic) => (
                <option key={topic.name} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>

            {formData.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fff8e0] text-[#746019] border border-[#fde89c] rounded-full text-xs font-semibold"
                  >
                    <span>{topic}</span>
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-[#600000]"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          topics: prev.topics.filter((t) => t !== topic),
                        }))
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Assessment Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#e6e8ec]">
            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Difficulty Level
              </label>
              <select
                value={formData.questionType}
                onChange={(e) => setFormData((prev) => ({ ...prev, questionType: e.target.value }))}
                disabled={generating}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] cursor-pointer"
              >
                {questionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Language
              </label>
              <select
                value={formData.languages[0] || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData((prev) => ({
                      ...prev,
                      languages: [e.target.value],
                    }))
                  }
                }}
                disabled={generating}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] cursor-pointer"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Questions */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Total Questions (1–20)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="5"
                value={formData.totalQuestions}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalQuestions: e.target.value }))}
                disabled={generating}
                className="w-full h-11 px-3.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555a6a]">
                Estimated Duration
              </label>
              <div className="w-full h-11 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-lg flex items-center gap-2 text-sm text-[#1c1c1e]">
                <Clock className="w-4 h-4 text-[#555a6a]" />
                <span className="font-medium">{formData.duration || 0} Minutes</span>
              </div>
            </div>
          </div>

          {/* AI Generation State */}
          {generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#fff8e0] border border-[#fde89c] text-center space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#746019]">
                <Loader2 className="w-4 h-4 animate-spin text-[#746019]" />
                <span>Generating unique questions with cryptographic hash verification...</span>
              </div>
              {progress > 0 && (
                <div className="space-y-2">
                  <p className="text-base font-semibold text-[#1c1c1e]">
                    {progress} of {formData.totalQuestions} unique questions generated
                  </p>
                  <div className="w-full bg-[#fde89c] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1c1c1e] h-full transition-all duration-300"
                      style={{
                        width: `${Math.min((progress / (parseInt(formData.totalQuestions) || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate("/dashboard")}
            type="button"
            disabled={generating}
            className="py-3 px-8 border border-[#c7cad5] text-[#1c1c1e] rounded-full text-sm font-medium hover:bg-[#f7f8fa] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={generateQuestions}
            disabled={generating}
            type="button"
            className="py-3.5 px-8 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] active:bg-[#e0b020] text-[#1c1c1e] text-sm font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#e0e2e8] disabled:text-[#a5a8b5]"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Assessment...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate Quiz Assessment</span>
              </>
            )}
          </button>
        </div>

        {/* Clear Store Link */}
        {storeStats.totalQuestions > 0 && !generating && (
          <div className="text-center pt-2 pb-8">
            <button
              onClick={handleClearStore}
              type="button"
              className="text-xs text-[#555a6a] hover:text-[#600000] hover:underline cursor-pointer transition-colors"
            >
              Clear Cryptographic Question Store ({storeStats.totalQuestions} questions cached)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}