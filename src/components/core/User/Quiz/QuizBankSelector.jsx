"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  X,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Image as ImageIcon,
  StickyNote,
  Tag,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import toast from "react-hot-toast"

export default function QuizBankSelector({
  questions = [],
  onAddQuestion,
  onClose,
  existingQuestions = [],
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxImage, setLightboxImage] = useState(null)

  if (!questions || questions.length === 0) {
    return null
  }

  const currentQ = questions[currentIndex] || {}
  const total = questions.length

  // Check if current question is already added to quiz
  const isAlreadyAdded = existingQuestions.some((q) => {
    const qText = (q.text || q.question || "").trim().toLowerCase()
    const curText = (currentQ.text || currentQ.question || "").trim().toLowerCase()
    return qText && curText && qText === curText
  })

  const handleAdd = () => {
    if (!currentQ) return

    // Normalizing question format to match Quiz question schema
    const formatted = {
      id: Date.now() + Math.random(),
      text: currentQ.text || currentQ.question || "",
      image: currentQ.image || currentQ.questionImage || "",
      note: currentQ.note || currentQ.answer || "",
      options: currentQ.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: currentQ.correctAnswer || currentQ.answer || "A",
      difficulty: currentQ.difficulty || "Average",
      tags: Array.isArray(currentQ.tags) ? currentQ.tags : [],
    }

    if (onAddQuestion) {
      onAddQuestion(formatted)
    }

    toast.success(`Question ${currentIndex + 1} added to quiz!`)

    // Move to next question automatically if available
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      toast("You reached the end of the question bank.", { icon: "ℹ️" })
    }
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(total - 1, prev + 1))
  }

  const difficultyColors = {
    Easy: "bg-[#e6f4ea] text-[#137333] border-[#ceead6]",
    Average: "bg-[#fef7e0] text-[#b06000] border-[#feefc3]",
    Hard: "bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]",
  }

  const currentDiff = currentQ.difficulty || "Average"
  const diffClass = difficultyColors[currentDiff] || difficultyColors.Average

  return (
    <div className="w-full bg-[#f5f3ff] border-2 border-[#ddd6fe] rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm relative transition-all">
      {/* Lightbox Modal for Question Diagram */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={lightboxImage}
                alt="Diagram Preview"
                className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#ddd6fe]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-[#4262ff] text-white flex items-center justify-center shadow-xs">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
                Quiz Bank Review
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#4262ff] border border-[#ddd6fe]">
                Question {currentIndex + 1} of {total}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${diffClass}`}>
                {currentDiff}
              </span>
            </div>
            <p className="text-[11px] text-[#555a6a]">
              Review questions individually and pick the ones you want in your quiz.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-[#fafbfc] border border-[#c7cad5] text-xs font-semibold text-[#1c1c1e] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-[#fafbfc] border border-[#c7cad5] text-xs font-semibold text-[#1c1c1e] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <span>Skip</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
              isAlreadyAdded
                ? "bg-[#00b473] hover:bg-[#009e64] text-white"
                : "bg-[#1c1c1e] hover:bg-[#2c2c34] text-white"
            }`}
          >
            {isAlreadyAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added (+ Add Again)</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Quiz</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#fbd4d4] border border-[#c7cad5] text-[#555a6a] hover:text-[#600000] flex items-center justify-center transition-colors cursor-pointer shadow-xs ml-1"
              title="Close Quiz Bank"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-white/70 h-1.5 rounded-full overflow-hidden border border-[#ddd6fe]">
        <div
          className="bg-gradient-to-r from-[#4262ff] to-[#0fbcb0] h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Main Question Preview Card */}
      <div className="bg-white rounded-xl border border-[#ddd6fe] p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Question Text */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#4262ff] shrink-0">
              Q{currentIndex + 1}.
            </span>
            <p className="text-sm sm:text-base font-semibold text-[#1c1c1e] leading-relaxed flex-1">
              {currentQ.text || currentQ.question || "No question text provided."}
            </p>
          </div>

          {/* Diagram / Image Preview if available */}
          {currentQ.image && (
            <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-[#c7cad5] bg-[#fafbfc] group max-w-xs">
              <img
                src={currentQ.image}
                alt={`Question ${currentIndex + 1} Diagram`}
                className="max-h-40 w-auto object-contain p-2"
              />
              <button
                type="button"
                onClick={() => setLightboxImage(currentQ.image)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer gap-1.5 text-xs font-semibold"
              >
                <Maximize2 className="w-4 h-4" />
                <span>View Full Diagram</span>
              </button>
            </div>
          )}
        </div>

        {/* Options Grid (A, B, C, D) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {["A", "B", "C", "D"].map((key) => {
            const optVal = currentQ.options?.[key] || ""
            const isCorrect = (currentQ.correctAnswer || currentQ.answer) === key

            return (
              <div
                key={key}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 transition-all ${
                  isCorrect
                    ? "bg-[#e6f4ea] border-[#34a853] text-[#137333] shadow-xs"
                    : "bg-[#f7f8fa] border-[#e0e2e8] text-[#1c1c1e]"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCorrect
                      ? "bg-[#34a853] text-white"
                      : "bg-[#e0e2e8] text-[#555a6a]"
                  }`}
                >
                  {key}
                </span>
                <span className="flex-1 font-medium pt-0.5 leading-snug">
                  {optVal || <span className="text-[#a5a8b5] italic">Option empty</span>}
                </span>
                {isCorrect && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#34a853]/20 text-[#137333]">
                    Correct
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Explanatory Note / Solution if available */}
        {currentQ.note && (
          <div className="p-3 bg-[#fff8e0] border border-[#fde89c] rounded-xl text-xs text-[#746019] flex items-start gap-2">
            <StickyNote className="w-4 h-4 shrink-0 mt-0.5 text-[#b8860b]" />
            <div>
              <strong className="font-bold block">Solution / Note:</strong>
              <p className="mt-0.5 leading-relaxed">{currentQ.note}</p>
            </div>
          </div>
        )}

        {/* Tags if available */}
        {Array.isArray(currentQ.tags) && currentQ.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag className="w-3.5 h-3.5 text-[#8e91a0]" />
            {currentQ.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[11px] bg-[#f7f8fa] border border-[#e0e2e8] text-[#555a6a]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#555a6a] gap-2 pt-1">
        <div className="flex items-center gap-2">
          {isAlreadyAdded ? (
            <span className="flex items-center gap-1.5 text-[#00b473] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>This question is currently in your quiz.</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#555a6a]">
              <AlertCircle className="w-3.5 h-3.5 text-[#8e91a0]" />
              <span>Click "Add to Quiz" to include this question.</span>
            </span>
          )}
        </div>
        <div className="text-[11px] text-[#8e91a0]">
          Total questions in your quiz: <strong className="text-[#1c1c1e]">{existingQuestions.length}</strong>
        </div>
      </div>
    </div>
  )
}

