"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../ui/button"
import { Label } from "../../../ui/label"
import { Bot, Sparkles, X } from "lucide-react"
import toast from "react-hot-toast"
import puter from '@heyputer/puter.js'
import { createQuizWithGeneratedQuestion } from "../../../../services/operations/quizAPI"

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

const QuizAI = ({ isOpen, onClose, onQuestionGenerated, quizData }) => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    language: "English",
    totalQuestions: "",   // ← empty string so input is not stuck at 1
    difficulty: "Average"
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const buildPrompt = () => {
    const { language, totalQuestions, difficulty } = formData
    const { region, examType, specificClass, subject, chapter } = quizData

    const nonEnglishNote =
      language.toLowerCase() !== "english"
        ? `Do NOT use English. Respond strictly in ${language}.`
        : ""

    return `
You are a professional exam setter for competitive engineering exams like GATE.

Generate exactly ${totalQuestions} UNIQUE multiple-choice question(s) with:
- Exactly four options labeled A, B, C, D
- One correct answer only per question
- No ambiguity
- Difficulty: ${difficulty}

Context:
- Language: ${language}
- Exam Type: ${examType}
- Class: ${specificClass}
- Subject: ${subject}
- Chapter: ${Array.isArray(chapter) ? chapter[0] : chapter}
${region ? `- Region: ${region}` : ""}

${nonEnglishNote}

IMPORTANT: Vary the correct answers — do NOT make all answers "A".
Distribute correct answers across A, B, C, and D roughly equally.

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

  const generateQuestions = async () => {
    if (
      !quizData.region ||
      !quizData.examType ||
      !quizData.specificClass ||
      !quizData.subject ||
      !quizData.chapter
    ) {
      toast.error("Please complete all category fields first")
      return
    }

    const count = parseInt(formData.totalQuestions)
    if (!count || count < 1 || count > 20) {
      toast.error("Please enter a valid number of questions (1–20)")
      return
    }

    setTotal(count)
    setProgress(0)

    try {
      setLoading(true)

      let questionsList = []

      // 1. Try Puter AI from frontend first
      try {
        toast.loading("Generating with AI...", { id: "ai-status" })
        let response
        try {
          response = await puter.ai.chat(buildPrompt(), {
            model: "gpt-4o-mini",
            stream: false,
            temperature: 0.9,
            max_tokens: 4096
          })
        } catch (pErr) {
          console.warn("Puter gpt-4o-mini failed, trying default model:", pErr)
          response = await puter.ai.chat(buildPrompt())
        }

        let raw = response?.message?.content || response?.text || response
        if (typeof raw !== 'string') {
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
          throw new Error("Puter AI returned an invalid data format")
        }

        if (Array.isArray(parsed) && parsed.length > 0) {
          questionsList = parsed
          toast.success("Questions generated successfully!", { id: "ai-status" })
        } else {
          throw new Error("Puter AI returned no questions")
        }
      } catch (puterError) {
        console.warn("Puter AI failed or busy, falling back to OpenRouter NVIDIA:", puterError)
        toast.loading("Generating with AI...", { id: "ai-status" })

        // 2. Fallback to OpenRouter (NVIDIA model) from backend
        const backendRes = await createQuizWithGeneratedQuestion({
          region: quizData.region,
          examType: quizData.examType,
          specificClass: quizData.specificClass,
          subject: quizData.subject,
          chapter: quizData.chapter,
          difficulty: formData.difficulty,
          language: formData.language,
          totalQuestions: count
        })

        if (backendRes?.success && Array.isArray(backendRes.questions) && backendRes.questions.length > 0) {
          questionsList = backendRes.questions
          toast.success("Questions generated successfully!", { id: "ai-status" })
        } else {
          toast.error("No questions were generated", { id: "ai-status" })
          return
        }
      }

      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        toast.error("No questions were generated")
        return
      }

      let added = 0

      for (const q of questionsList) {
        const qText = q.question || q.text
        const opts = q.options
        const ans = q.correctAnswer || q.answer

        if (
          !qText ||
          !opts?.A ||
          !opts?.B ||
          !opts?.C ||
          !opts?.D ||
          !ans
        ) continue

        const { shuffledOptions, newCorrectAnswer } = shuffleOptions(opts, ans)

        await new Promise(r => setTimeout(r, 200))

        onQuestionGenerated({
          id: Date.now() + Math.random(),
          text: qText,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswer,
          difficulty: formData.difficulty,
          tags: q.tags || [],
          image: "",
          note: "",
        })

        added++
        setProgress(added)
      }

      if (added > 0) {
        await new Promise(r => setTimeout(r, 400))
        toast.success(`${added} question(s) added to quiz!`)
        onClose()
      } else {
        toast.error("Questions returned but had invalid format")
      }

    } catch (error) {
      console.error("AI Generation Error:", error)
      toast.error("Failed to generate: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
      setProgress(0)
      setTotal(0)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
                <Bot className="w-5 h-5" />
                AI Question Generator
              </h3>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form — hidden while generating */}
            {!loading && (
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </Label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    placeholder="e.g. English, Kannada, Hindi"
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </Label>
                  {/* ← plain input, no min/max clamp on onChange so user can freely type */}
                  <input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => handleChange("totalQuestions", e.target.value)}
                    onBlur={(e) => {
                      // clamp only when user leaves the field
                      const val = parseInt(e.target.value)
                      if (!val || val < 1) handleChange("totalQuestions", 1)
                      else if (val > 20) handleChange("totalQuestions", 20)
                    }}
                    placeholder="e.g. 5"
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Max 20 questions per generation</p>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </Label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Average">Average</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            )}

            {/* Progress — shown while generating */}
            {loading && total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 py-4"
              >
                {/* Animated text counter */}
                <div className="text-center space-y-1">
                  <p className="text-gray-500 text-sm">Generating questions</p>
                  <p className="text-4xl font-bold text-indigo-600">
                    {progress}
                    <span className="text-xl text-gray-400 font-medium"> / {total}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {progress === 0
                      ? "Thinking..."
                      : progress === total
                        ? "Almost done!"
                        : `${total - progress} more to go`}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: total > 0 ? `${(progress / total) * 100}%` : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>

                {/* Pulsing dots */}
                <div className="flex justify-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            {!loading && (
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateQuestions}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Questions
                </Button>
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuizAI