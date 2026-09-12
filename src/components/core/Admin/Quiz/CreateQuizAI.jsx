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
        className="fixed inset-0 bg-[#050038]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl border-2 border-[#1c1c1e]/15 shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Miro Header */}
          <div className="bg-[#ffd8f4]/50 border-b-2 border-[#d1259e]/30 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2 text-[#050038]">
              <div className="w-8 h-8 rounded-xl bg-[#d1259e] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              AI Question Generator
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-[#050038]/60 hover:text-[#050038] hover:bg-white/60 p-1.5 rounded-full transition-all disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Form — hidden while generating */}
            {!loading && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[#050038]/70">
                    Language
                  </Label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    placeholder="e.g. English, Hindi, Spanish"
                    className="w-full h-11 px-3.5 bg-white border-2 border-[#1c1c1e]/15 rounded-xl font-medium text-sm text-[#1c1c1e] transition-all hover:border-[#1c1c1e]/30 focus:border-[#4262ff] focus:ring-4 focus:ring-[#4262ff]/10 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[#050038]/70">
                    Number of Questions
                  </Label>
                  <input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => handleChange("totalQuestions", e.target.value)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value)
                      if (!val || val < 1) handleChange("totalQuestions", 1)
                      else if (val > 20) handleChange("totalQuestions", 20)
                    }}
                    placeholder="e.g. 5"
                    className="w-full h-11 px-3.5 bg-white border-2 border-[#1c1c1e]/15 rounded-xl font-medium text-sm text-[#1c1c1e] transition-all hover:border-[#1c1c1e]/30 focus:border-[#4262ff] focus:ring-4 focus:ring-[#4262ff]/10 outline-none"
                  />
                  <p className="text-[11px] text-[#050038]/50">Max 20 questions per generation batch</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[#050038]/70">
                    Difficulty Level
                  </Label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border-2 border-[#1c1c1e]/15 rounded-xl font-medium text-sm text-[#1c1c1e] transition-all hover:border-[#1c1c1e]/30 focus:border-[#4262ff] focus:ring-4 focus:ring-[#4262ff]/10 outline-none"
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
                  <p className="text-[#050038]/60 text-xs font-bold uppercase tracking-wider">Generating questions</p>
                  <p className="text-4xl font-black text-[#d1259e]">
                    {progress}
                    <span className="text-xl text-[#050038]/40 font-bold"> / {total}</span>
                  </p>
                  <p className="text-xs text-[#050038]/60 font-medium">
                    {progress === 0
                      ? "AI reasoning & constructing questions..."
                      : progress === total
                        ? "Almost done!"
                        : `${total - progress} remaining`}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#f7f8fa] border border-[#1c1c1e]/10 rounded-full h-3 overflow-hidden p-0.5">
                  <motion.div
                    className="h-full bg-[#d1259e] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: total > 0 ? `${(progress / total) * 100}%` : "0%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Actions */}
            {!loading && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-2 border-[#1c1c1e]/15 hover:border-[#1c1c1e] text-[#050038] font-bold rounded-full px-5 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateQuestions}
                  className="bg-[#d1259e] hover:bg-[#b01c83] text-white font-bold rounded-full px-6 py-2 text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
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