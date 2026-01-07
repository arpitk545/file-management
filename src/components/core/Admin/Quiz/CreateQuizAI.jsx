"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Bot, Sparkles, X } from "lucide-react"
import { createQuizWithGeneratedQuestion } from "../../../../services/operations/quizAPI"
import toast from "react-hot-toast"

const QuizAI = ({ 
  isOpen, 
  onClose, 
  onQuestionGenerated,
  quizData 
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    language: "English",
    totalQuestions: 1,
    difficulty: "Average"
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

const generateQuestions = async () => {
  if (!quizData.region || !quizData.examType || !quizData.specificClass || !quizData.subject || !quizData.chapter) {
    toast.error("Please complete all category fields first");
    return;
  }

  try {
    setLoading(true);

    const data = {
      language: formData.language,
      region:quizData.region,
      examType: quizData.examType,
      specificClass: quizData.specificClass,
      subject: quizData.subject,
      chapter: quizData.chapter,
      quizTitle: quizData.quizTitle || "AI Generated Quiz",
      duration: quizData.duration || 30,
      author: quizData.author || "AI Generator",
      totalQuestions: formData.totalQuestions || 5,
      difficulty: formData.difficulty || "Average",
    };

    const response = await createQuizWithGeneratedQuestion(data);

    if (response.questions?.length > 0) {
      response.questions.forEach((question) => {
        onQuestionGenerated({
          text: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          difficulty: question.difficulty,
          tags: question.tags || [],
        });
      });

      toast.success(`Generated ${response.questions.length} question(s)`);
      onClose();
    } else {
      console.error("No questions returned by AI:", response);
      toast.error("No questions were generated");
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    toast.error("Failed to generate questions: " + (error.message || "Server error"));
  } finally {
    setLoading(false);
  }
};

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
                AI Question Generator
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Language</Label>
                <Input
                  type="text"
                  value={formData.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  placeholder="e.g. Kannada, English"
                  className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                
                  
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.totalQuestions}
                  onChange={(e) => handleChange("totalQuestions", Math.min(100, Math.max(0, parseInt(e.target.value) )))}
                  className="h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</Label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                  className="w-full h-10 px-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Average">Average</option>
                  <option value="Hard">Hard</option>
                </select>
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
                onClick={generateQuestions}
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

export default QuizAI