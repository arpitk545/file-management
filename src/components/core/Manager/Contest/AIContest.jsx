"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../ui/button"
import { Label } from "../../../ui/label"
import { Bot, Sparkles, X, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"
import puter from '@heyputer/puter.js'
import { createContestWithAI } from "../../../../services/operations/contestAPI"

// ── Duplicate prevention ─────────────────────────────────────────────────────
// Simple hash: FNV-32 on question text (no crypto needed in browser)
const hashQuestion = (text) => {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h.toString(36)
}

// Module-level Set persists across modal open/close within the same session
const seenHashes = new Set()

// ── Shuffle options, remap correct answer ────────────────────────────────────
const shuffleOptions = (optionsObj, correctAnswer) => {
  const labels = ["A", "B", "C", "D"]
  const values = labels.map(l => optionsObj[l])
  const correctText = optionsObj[correctAnswer]

  // Fisher-Yates
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]]
  }

  const shuffled = {}
  let newCorrect = correctAnswer
  values.forEach((text, idx) => {
    shuffled[labels[idx]] = text
    if (text === correctText) newCorrect = labels[idx]
  })

  return { shuffled, newCorrect }
}

// ── Prompt builder ───────────────────────────────────────────────────────────
const buildContestPrompt = ({ language, examType, specificClass, subject, chapter, difficulty, totalQuestions }) => {
  const nonEnglishNote =
    language.toLowerCase() !== "english"
      ? `IMPORTANT: Respond strictly in ${language}. Do NOT use English.`
      : ""

  return `
You are an expert question setter for competitive engineering CONTESTS and OLYMPIADS (not regular exams).

Contest questions must be:
- Challenging, multi-step, and require deep conceptual understanding
- Based on application, analysis, or problem-solving — NOT simple recall
- Tricky with plausible wrong options (distractors must be tempting)
- Appropriate for a timed contest environment

Generate exactly ${totalQuestions} UNIQUE contest-level MCQs for:
- Exam Type: ${examType}
- Class / Level: ${specificClass}
- Subject: ${subject}
- Chapter / Topic: ${Array.isArray(chapter) ? chapter[0] : chapter}
- Difficulty: ${difficulty}
- Language: ${language}

${nonEnglishNote}

Rules:
1. Each question must have exactly 4 options (A, B, C, D).
2. Exactly one correct answer per question.
3. Distribute correct answers across A, B, C, D — do NOT put all answers as "A".
4. Include a brief explanation for each correct answer.
5. Assign relevant topic tags.
6. Questions must be completely different from each other.

Respond ONLY with a valid JSON array. No markdown, no code fences, no explanation outside JSON:
[
  {
    "question": "Full contest question text",
    "options": {
      "A": "Option text",
      "B": "Option text",
      "C": "Option text",
      "D": "Option text"
    },
    "answer": "B",
    "explanation": "Brief explanation of why B is correct",
    "tags": ["tag1", "tag2"]
  }
]
`
}

// ── Component ────────────────────────────────────────────────────────────────
const ContestAI = ({ isOpen, onClose, onQuestionsGenerated, contestData }) => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    language: "English",
    totalQuestions: "",
    difficulty: "Average"
  })

  // Per-render duplicate guard (resets when component unmounts)
  const localHashes = useRef(new Set())

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateContestQuestions = async () => {
    if (
      !contestData?.region ||
      !contestData?.examType ||
      !contestData?.specificClass ||
      !contestData?.subject ||
      !contestData?.chapter
    ) {
      toast.error("Please complete all contest category fields first")
      return
    }

    const count = parseInt(formData.totalQuestions)
    if (!count || count < 1 || count > 50) {
      toast.error("Please enter a valid number of questions (1–50)")
      return
    }

    setTotal(count)
    setProgress(0)
    localHashes.current.clear()

    try {
      setLoading(true)

      let questionsList = []

      // 1. Try Puter AI from frontend first
      try {
        toast.loading("Generating with AI...", { id: "ai-status" })

        const contestPrompt = buildContestPrompt({
          language: formData.language,
          examType: contestData.examType,
          specificClass: contestData.specificClass,
          subject: contestData.subject,
          chapter: contestData.chapter,
          difficulty: formData.difficulty,
          totalQuestions: count,
        })

        let response
        try {
          response = await puter.ai.chat(contestPrompt, {
            model: "gpt-4o-mini",
            stream: false,
            temperature: 0.9,
            max_tokens: 4096,
          })
        } catch (pErr) {
          console.warn("Puter gpt-4o-mini failed, trying default model:", pErr)
          response = await puter.ai.chat(contestPrompt)
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
        const backendRes = await createContestWithAI({
          region: contestData?.region,
          examType: contestData?.examType,
          specificClass: contestData?.specificClass,
          subject: contestData?.subject,
          chapter: contestData?.chapter,
          difficulty: formData.difficulty,
          language: formData.language,
          totalQuestions: count
        })

        const rawList = backendRes?.questions || backendRes?.data
        if (backendRes?.success && Array.isArray(rawList) && rawList.length > 0) {
          questionsList = rawList
          toast.success("Questions generated successfully!", { id: "ai-status" })
        } else {
          toast.error("No questions were generated. Try again.", { id: "ai-status" })
          return
        }
      }

      const validQuestions = []

      for (const q of questionsList) {
        const qText = (q.question || q.text || "").trim()
        const opts = q.options
        const ans = q.correctAnswer || q.answer

        // Validate structure
        if (
          !qText ||
          !opts?.A ||
          !opts?.B ||
          !opts?.C ||
          !opts?.D ||
          !ans
        ) continue

        // Deduplicate
        const hash = hashQuestion(qText)
        if (seenHashes.has(hash) || localHashes.current.has(hash)) continue
        seenHashes.add(hash)
        localHashes.current.add(hash)

        // Shuffle options
        const { shuffled, newCorrect } = shuffleOptions(opts, ans)

        // Animate progress with small delay
        await new Promise(r => setTimeout(r, 200))

        validQuestions.push({
          id: Date.now() + Math.random(),
          topic: Array.isArray(contestData.chapter) ? contestData.chapter[0] : contestData.chapter || "",
          questionType: formData.difficulty,
          image: null,
          question: qText,
          // Contest format: flat array of 4 options (matches onQuestionsGenerated consumer)
          options: [shuffled.A, shuffled.B, shuffled.C, shuffled.D],
          // Store label AND text so consumer can use either
          optionsMap: shuffled,
          correctAnswer: newCorrect,          // "A" | "B" | "C" | "D"
          correctAnswerText: shuffled[newCorrect],
          explanation: q.explanation || "",
          tags: q.tags || [],
          metadata: {
            language: formData.language,
            examType: contestData.examType,
            specificClass: contestData.specificClass,
            subject: contestData.subject,
            chapter: contestData.chapter,
          },
        })

        setProgress(prev => prev + 1)
      }

      if (validQuestions.length > 0) {
        await new Promise(r => setTimeout(r, 400))
        onQuestionsGenerated(validQuestions)
        toast.success(`${validQuestions.length} contest question(s) added!`)
        onClose()
      } else {
        toast.error("All generated questions were duplicates or invalid. Try again.")
      }

    } catch (error) {
      console.error("ContestAI Error:", error)
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
                Contest AI Generator
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
                    placeholder="e.g. English, Hindi, Kannada"
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </Label>
                  <input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => handleChange("totalQuestions", e.target.value)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value)
                      if (!val || val < 1) handleChange("totalQuestions", 1)
                      else if (val > 50) handleChange("totalQuestions", 50)
                    }}
                    placeholder="e.g. 10"
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Max 50 questions per generation</p>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </Label>
                  <div className="relative">
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleChange("difficulty", e.target.value)}
                      className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none appearance-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Average">Average</option>
                      <option value="Hard">Hard</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Progress UI */}
            {loading && total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 py-4"
              >
                <div className="text-center space-y-1">
                  <p className="text-gray-500 text-sm">Generating contest questions</p>
                  <p className="text-4xl font-bold text-indigo-600">
                    {progress}
                    <span className="text-xl text-gray-400 font-medium"> / {total}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {progress === 0
                      ? "Thinking hard..."
                      : progress === total
                        ? "Finalizing!"
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
                  onClick={generateContestQuestions}
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

export default ContestAI