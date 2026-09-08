"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { getQuizSubmissionById,submitQuestionReport } from "../../../../services/operations/quizAPI";

import { 
  CheckCircle, 
  XCircle,  
  AlertCircle, 
  Flag, 
  Home, 
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ReviewQuiz() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [reportText, setReportText] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchQuizResult = async () => {
      setLoading(true);
      try {
        const res = await getQuizSubmissionById(resultId);
        if (res?.data) {
          setResult(res.data);
        } else {
          toast.error("No quiz result found");
          //navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching quiz result:", err);
        toast.error("Failed to load quiz results");
        //navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResult();
  }, [resultId, navigate]);

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    if (result?.details) {
      setCurrentQuestionIndex(prev => Math.min(result.details.length - 1, prev + 1));
    }
  };

  const handleOpenReport = (question) => {
     console.log("Reporting questionId:", question.questionId); 
    setSelectedQuestionId(question.questionId);
    setReportText("");
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) {
      toast.error("Please enter a report description");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const data = {
        questionId: selectedQuestionId,
        description: reportText.trim(),
        category: "Question",
       quizId: result?.quiz, 
      };

      const res = await submitQuestionReport(data);
      if (res?.success) {
        toast.success("Report submitted successfully!");
        setShowReportModal(false);
        setReportText("");
        setSelectedQuestionId(null);
      } else {
        toast.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Error submitting report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getOptionVariant = (option, question) => {
    if (option === question.correct) {
      return "success"; // Green for correct answer
    }
    if (option === question.selected && option !== question.correct) {
      return "destructive"; // Red for wrong selected answer
    }
    if (option === question.selected && question.isCorrect) {
      return "success"; // Green for correct selected answer
    }
    return "outline"; // Default for other options
  };

  const getOptionIcon = (option, question) => {
    if (option === question.correct) {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (option === question.selected && option !== question.correct) {
      return <XCircle className="w-4 h-4" />;
    }
    return null;
  };

  const getOptionTextColor = (option, question) => {
    if (option === question.correct) {
      return "text-green-600";
    }
    if (option === question.selected && option !== question.correct) {
      return "text-red-600";
    }
    return "text-gray-700";
  };

  const getQuestionStatus = (question) => {
    if (question.isCorrect) {
      return {
        text: "Correct",
        variant: "success",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    } else if (question.selected) {
      return {
        text: "Incorrect",
        variant: "destructive",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      };
    } else {
      return {
        text: "Not Attempted",
        variant: "secondary",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading quiz review...</h2>
          <p className="text-gray-600">Please wait while we load your results</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Result Found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = result.details?.[currentQuestionIndex];
  const questionStatus = currentQuestion ? getQuestionStatus(currentQuestion) : null;

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-gray-800">Report Question</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the issue
                  </label>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Please describe the issue with this question (e.g., incorrect answer, unclear wording, etc.)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[120px]"
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setShowReportModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReport}
                    disabled={!reportText.trim() || isSubmittingReport}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {isSubmittingReport ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Quiz Review
          </h1>
          <p className="text-gray-600 text-lg">{result.quizTitle}</p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{result.score || 0}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{result.correctAnswers || 0}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-2xl font-bold text-red-600">{result.incorrectAnswers || 0}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{result.timeTaken ? `${result.timeTaken}m` : '--'}</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        {result.details && result.details.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center mb-6"
          >
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {result.details.length}
            </div>
            
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === result.details.length - 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`backdrop-blur-xl bg-white/90 border-2 ${questionStatus.borderColor} shadow-2xl rounded-2xl overflow-hidden mb-6`}>
              <CardHeader className={`${questionStatus.bgColor} p-6`}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <Badge 
                    variant={questionStatus.variant}
                    className={`${questionStatus.color} font-semibold`}
                  >
                    {questionStatus.text}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Question Text */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    {currentQuestion.question}
                  </h3>
                  
                  {/* Options */}
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div
                        key={option}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          getOptionVariant(option, currentQuestion) === 'success'
                            ? 'border-green-500 bg-green-50'
                            : getOptionVariant(option, currentQuestion) === 'destructive'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`font-semibold ${getOptionTextColor(option, currentQuestion)}`}>
                              {option}.
                            </span>
                            <span className={getOptionTextColor(option, currentQuestion)}>
                              {currentQuestion[`option${option}`] || `Option ${option}`}
                            </span>
                          </div>
                          {getOptionIcon(option, currentQuestion)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation and Report Button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <strong>Your answer:</strong> {currentQuestion.selected || 'Not attempted'} | 
                    <strong> Correct answer:</strong> {currentQuestion.correct}
                  </div>
                  
                  <Button
                    onClick={() => handleOpenReport(currentQuestion)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Flag className="w-4 h-4" />
                    Report Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Question Progress */}
        {result.details && result.details.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Questions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {result.details.map((question, index) => {
                const status = getQuestionStatus(question);
                return (
                  <button
                    key={question._id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                      currentQuestionIndex === index
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    } ${status.bgColor} ${status.borderColor}`}
                  >
                    <div className={`font-semibold ${status.color}`}>
                      Q{index + 1}
                    </div>
                    <div className={`text-xs mt-1 ${status.color}`}>
                      {status.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => navigate("/dashboard")}
            className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            onClick={() => navigate("/view-user-quiz")}
            variant="outline"
            className="h-12 px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl"
          >
            Attempt Another Quiz
          </Button>
        </motion.div>
      </div>
    </div>
  );
}