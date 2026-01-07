"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Bot, Sparkles, X, ChevronDown } from "lucide-react"
import { createContestWithAI } from "../../../../services/operations/contestAPI"
import toast from "react-hot-toast"

const ContestAI = ({ 
  isOpen, 
  onClose, 
  onQuestionsGenerated,
  contestData 
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    language: "English",
    totalQuestions: 5,
    difficulty: "Average"
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
const generateContestQuestions = async () => {
  if (!contestData?.region || !contestData?.examType || !contestData?.specificClass || 
      !contestData?.subject || !contestData?.chapter) {
    toast.error("Please complete all contest category fields first")
    return
  }

  try {
    setLoading(true)

    const payload = {
      language: formData.language,
      examType: contestData.examType,
      specificClass: contestData.specificClass,
      subject: contestData.subject,
      chapter: contestData.chapter,
      difficulty: formData.difficulty,
      totalQuestions: formData.totalQuestions
    }

    const response = await createContestWithAI(payload)
    console.log("AI Response:", response)

    if (response.success && response.questions?.length > 0) {
      const formattedQuestions = response.questions.map((question, index) => ({
        id: Date.now() + index, // More reliable than Math.random()
        topic: contestData.chapter || "",
        questionType: question.difficulty || formData.difficulty || "Average",
        image: null,
        question: question.question || "", 
        options: [
          question.options?.A || "", 
          question.options?.B || "",
          question.options?.C || "",
          question.options?.D || "",
          question.options?.E || ""
        ],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        // Include metadata if needed
        metadata: question.metadata || {
          language: formData.language,
          examType: contestData.examType,
          specificClass: contestData.specificClass,
          subject: contestData.subject,
          chapter: contestData.chapter
        }
      }))

      onQuestionsGenerated(formattedQuestions)
      toast.success(`Successfully generated ${formattedQuestions.length} questions!`)
      onClose()
    } else {
      toast.error(response.message || "The AI couldn't generate questions. Please try again.")
    }
  } catch (error) {
    console.error("Contest AI Generation Error:", error)
    toast.error(error.response?.data?.message || "Failed to generate questions. Please check your connection.")
  } finally {
    setLoading(false)
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
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
                <Bot className="w-5 h-5" />
                Contest AI Generator
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </Label>
                <div className="relative">
                  <input
                    value={formData.language}
                    type="text"
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 appearance-none"
                  >
                    {/* <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option> */}
                  </input>
        
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions (1-100)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.totalQuestions}
               onChange={(e) => {const value = Number(e.target.value);
                if (!value || value <= 0 || isNaN(value)) {
                handleChange("totalQuestions", undefined); 
                } else {
                handleChange("totalQuestions", Math.min(100, value));
                }
                }}
                  className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </Label>
                <div className="relative">
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 appearance-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Average">Average</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={generateContestQuestions}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl flex items-center gap-2"
              >
                {loading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ContestAI