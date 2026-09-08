"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { getQuizSubmission } from "../../../services/operations/quizAPI";
import { createComment, getAllComments } from "../../../services/operations/commentAPI"; 
import { Trophy, Target, CheckCircle, XCircle, Clock, Star, TrendingUp, Award, Home, RotateCcw, Send } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function AIResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [resultLoading, setResultLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState(""); 
  const [professionText, setProfessionText] = useState(""); 
  const [userRating, setUserRating] = useState(0); 
  const [isSubmittingComment, setIsSubmittingComment] = useState(false); 
  const [approvedComments, setApprovedComments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  // Load timeLeft from localStorage on initial render
  useEffect(() => {
    const savedTime = localStorage.getItem('aiQuizResultTimeout');
    if (savedTime) {
      const remainingTime = Math.max(0, Math.floor((parseInt(savedTime) - Date.now()) / 1000));
      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
      } else {
        localStorage.removeItem('aiQuizResultTimeout');
      }
    }
  }, []);

  // Update localStorage and countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem('aiQuizResultTimeout');
      return;
    }

    localStorage.setItem('aiQuizResultTimeout', (Date.now() + timeLeft * 1000).toString());
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          localStorage.removeItem('aiQuizResultTimeout');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const fetchData = async () => {
      setResultLoading(true);
      try {
        // Fetch quiz submission result
        const res = await getQuizSubmission();
        if (res?.result) {
          const resultData = Array.isArray(res.result) ? res.result[0] : res.result;
          setResult(resultData);

          // Calculate score percentage for animation
          const scorePercentage = Math.round((resultData.correctCount / resultData.questions.length) * 100);
          setAnimatedScore(0);
          setTimeout(() => {
            const increment = scorePercentage / 50;
            let currentScore = 0;
            const interval = setInterval(() => {
              currentScore = Math.min(currentScore + increment, scorePercentage);
              setAnimatedScore(currentScore);
              if (currentScore >= scorePercentage) {
                clearInterval(interval);
              }
            }, 20);
            return () => clearInterval(interval);
          }, 500);
        } else {
          toast.error("No result found");
          return;
        }
      } catch (err) {
        console.error("Error fetching quiz result:", err);
      } finally {
        setResultLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        // Fetch comments for AIQuiz category
        const commentsRes = await getAllComments();
        if (commentsRes?.success) {
          const filteredComments = commentsRes.comments.comments
            .filter((comment) => comment.status === "approved" && comment.category === "AIQuiz")
            .map((comment) => ({
              id: comment._id,
              content: comment.content,
              createdAt: comment.createdAt,
              userName: comment.userProfile?.name || "Anonymous",
              userAvatar: comment.userProfile?.avatar,
              initials: comment.userProfile?.initials || "",
              title: comment.title || "",
              rating: comment.rating || 0,
            }));

          setApprovedComments(filteredComments);
        } else {
          toast.error("Failed to fetch comments");
        }
      } catch (err) {
        console.error("Error fetching quiz comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, []);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
  
    if (!commentText.trim()) {
      toast.error("Please write a comment");
      return;
    }
    if (userRating === 0) {
      toast.error("Please provide a rating");
      return;
    }
  
    setIsSubmittingComment(true);
  
    try {
      const commentPayload = {
        content: commentText.trim(),
        title: professionText.trim(),
        rating: userRating,
        category: "AIQuiz",
        refId: result._id,
      };
  
      const res = await createComment(commentPayload);
  
      if (res?.success) {
        toast.success("Comment submitted for review!");
        setCommentText("");
        setProfessionText("");
        setUserRating(0);
      } else {
        toast.error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Comment submission error:", error);
      toast.error("Error submitting comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/create-quiz", { replace: true }); 
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleRetakeQuiz = () => {
    navigate("/create-quiz");
  };

  const getPerformanceData = (percentage) => {
    if (percentage >= 90) {
      return {
        label: "Excellent",
        color: "from-green-500 to-emerald-600",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: Trophy,
        message: "Outstanding performance! You've mastered this topic.",
        emoji: "🏆",
      };
    } else if (percentage >= 70) {
      return {
        label: "Good",
        color: "from-blue-500 to-cyan-600",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: Award,
        message: "Great job! You have a solid understanding.",
        emoji: "🎯",
      };
    } else if (percentage >= 50) {
      return {
        label: "Average",
        color: "from-yellow-500 to-orange-600",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        icon: TrendingUp,
        message: "Good effort! Keep practicing to improve.",
        emoji: "📈",
      };
    } else {
      return {
        label: "Poor",
        color: "from-red-500 to-pink-600",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: RotateCcw,
        message: "Don't give up! Practice more and try again.",
        emoji: "💪",
      };
    }
  };

  // Ensure result is not null before accessing its properties
  const scorePercentage = result ? Math.round((result.correctCount / result.questions?.length) * 100) : 0;
  const performance = getPerformanceData(scorePercentage);
  const PerformanceIcon = performance.icon;
  const incorrectCount = result ? result.questions?.length - result.correctCount : 0;

  if (resultLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading your results...</h2>
          <p className="text-gray-600">Please wait while we process your quiz performance</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Result Found</h2>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* Yellow Session Timeout Box */}
      {timeLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Kindly review your result</p>
                <p className="text-xs mt-1">Session TimeOut - {formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
          >
            <PerformanceIcon className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            Quiz Results
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-lg"
          >
            {result.metadata?.examType} • {result.metadata?.specificClass} • {result.metadata?.subject}
          </motion.p>
        </div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden mb-8">
            <CardHeader className={`bg-gradient-to-r ${performance.color} text-white p-8`}>
              <CardTitle className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-4xl">{performance.emoji}</span>
                  <div>
                    <h2 className="text-3xl font-bold">{performance.label}</h2>
                    <p className="text-white/90 text-lg">{performance.message}</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Score Circle */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                  className="relative w-48 h-48"
                >
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      className={`${performance.textColor.replace("text-", "text-")}`}
                      initial={{ strokeDasharray: "251.2 251.2", strokeDashoffset: "251.2" }}
                      animate={{
                        strokeDashoffset: `${251.2 - (animatedScore / 100) * 251.2}`,
                      }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      style={{ strokeDasharray: "251.2 251.2" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">{Math.round(animatedScore)}%</div>
                      <div className="text-gray-600 font-medium">Score</div>
                    </div>
                  </div>
                </motion.div>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-center p-4 bg-blue-50 rounded-2xl"
                >
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-800">{result.questions.length}</div>
                  <div className="text-blue-600 font-medium">Total Questions</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center p-4 bg-green-50 rounded-2xl"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-800">{result.correctCount}</div>
                  <div className="text-green-600 font-medium">Correct</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-center p-4 bg-red-50 rounded-2xl"
                >
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-800">{incorrectCount}</div>
                  <div className="text-red-600 font-medium">Incorrect</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="text-center p-4 bg-purple-50 rounded-2xl"
                >
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-800">{result.timeTaken}m</div>
                  <div className="text-purple-600 font-medium">Time Taken</div>
                </motion.div>
              </div>
              {/* Performance Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center mb-8"
              >
                <Badge
                  className={`${performance.bgColor} ${performance.textColor} text-lg px-6 py-2 rounded-full font-semibold`}
                >
                  <Star className="w-5 h-5 mr-2" />
                  {performance.label} Performance
                </Badge>
              </motion.div>
              {/* Additional Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Quiz Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">Accuracy Rate</div>
                    <div className="text-xl font-bold text-gray-800">{scorePercentage}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time Efficiency</div>
                    <div className="text-xl font-bold text-gray-800">
                      {Math.round((result.timeTaken / result.metadata?.duration) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Questions/Min</div>
                    <div className="text-xl font-bold text-gray-800">
                      {(result.questions.length / result.timeTaken).toFixed(1)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Button
            onClick={handleBackToDashboard}
            className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            onClick={handleRetakeQuiz}
            variant="outline"
            className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Attempt Another
          </Button>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments ({approvedComments.length})</h2>
          
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="mb-8 space-y-4">
            {/* Profession Input */}
            <div>
              <label htmlFor="profession" className="block text-sm font-semibold text-gray-700 mb-1">
                Profession
              </label>
              <input
                id="profession"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Your profession (e.g., Student, Teacher)"
                value={professionText}
                onChange={(e) => setProfessionText(e.target.value)}
              />
            </div>

            {/* Rating Input */}
            <div>
              <label htmlFor="rating" className="block text-sm font-semibold text-gray-700 mb-1">
                Rating (1-5 Stars)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= userRating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[80px]"
              placeholder="Write your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            ></textarea>
            <button
              type="submit"
              disabled={!commentText.trim() || userRating === 0 || isSubmittingComment}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 min-w-[150px] justify-center">
                {isSubmittingComment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Comment</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Comments Display */}
          <div className="space-y-6">
            {commentsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading comments...</span>
              </div>
            ) : (
              <AnimatePresence>
                {approvedComments?.length > 0 ? (
                  approvedComments?.map((comment) => (
                    <motion.div
                      key={comment.id}
                      className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-300 flex items-center justify-center bg-blue-100 text-blue-600 font-semibold flex-shrink-0">
                        {comment.userAvatar ? (
                          <img
                            src={comment.userAvatar || "/placeholder.svg"}
                            alt={comment.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          comment.userName?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-gray-900">{comment.userName}</p>
                          {comment.createdAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        {comment.title && (
                          <p className="text-sm text-blue-600 mb-1">{comment.title}</p>
                        )}
                        {comment.rating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm mb-2">
                            {Array.from({ length: comment.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                            {Array.from({ length: 5 - comment.rating }).map((_, i) => (
                              <Star key={i + comment.rating} className="w-4 h-4 text-gray-300" />
                            ))}
                          </div>
                        )}
                        <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 italic">No comments yet. Be the first to comment!</p>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}