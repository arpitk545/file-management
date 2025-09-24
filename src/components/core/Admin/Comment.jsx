"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { MessageCircle, Check, X, Trash2, Clock, Calendar, Star, User } from "lucide-react"
import { getAllComments, changeCommentStatus, deleteComment } from "../../../services/operations/commentAPI"
import toast from "react-hot-toast"

const Comment = () => {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      try {
        const res = await getAllComments()
        console.log("res",res)
        setLoading(false)
        if (res?.success) {
          const commentList = res.comments?.comments
          setComments(Array.isArray(commentList) ? commentList : [])
        } else {
          toast.error("Failed to load comments")
        }
      } catch (error) {
        setLoading(false)
        toast.error("Error loading comments")
      }
    }
    fetchComments()
  }, [])

  const [processingComments, setProcessingComments] = useState(new Set())
  const [processingAction, setProcessingAction] = useState({})

  const filteredComments = Array.isArray(comments)
    ? comments.filter((comment) => {
        const statusMatch = selectedFilter === "all" || comment.status === selectedFilter
        const categoryMatch = selectedCategory === "all" || comment.category === selectedCategory
        return statusMatch && categoryMatch
      })
    : []

  const handleStatusChange = async (comment, newStatus) => {
    const identifier = `${comment.userProfile?.email}-${comment.content}`
    try {
      setProcessingAction((prev) => ({ ...prev, [identifier]: newStatus }))
      setProcessingComments((prev) => new Set(prev).add(identifier))
      const response = await changeCommentStatus({
        name: comment.userProfile?.name,
        email: comment.userProfile?.email,
        content: comment.content,
        status: newStatus,
        category: comment.category,
      })
      if (response?.comment) {
        setComments((prev) =>
          prev.map((c) =>
            c.userProfile?.email === comment.userProfile?.email && c.content === comment.content
              ? { ...c, status: newStatus }
              : c,
          ),
        )
        toast.success(`Comment ${newStatus} successfully`)
      } else {
        toast.error(`Failed to ${newStatus} comment`)
      }
    } catch (error) {
      toast.error(`Error updating comment status: ${error.message}`)
    } finally {
      setProcessingComments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(identifier)
        return newSet
      })
      setProcessingAction((prev) => {
        const newState = { ...prev }
        delete newState[identifier]
        return newState
      })
    }
  }

  const handleDelete = async (comment) => {
    const identifier = `${comment.userProfile?.name}-${comment.content}`
    try {
      setProcessingAction((prev) => ({ ...prev, [identifier]: "delete" }))
      setProcessingComments((prev) => new Set(prev).add(identifier))
      const response = await deleteComment({
        name: comment.userProfile?.name,
        email: comment.userProfile?.email,
        content: comment.content,
        category: comment.category,
      })
      if (response?.success) {
        setComments((prev) =>
          prev.filter((c) => !(c.userProfile?.name === comment.userProfile?.name && c.content === comment.content)),
        )
        toast.success("Comment deleted successfully")
      } else {
        toast.error("Failed to delete comment")
      }
    } catch (error) {
      toast.error(`Error deleting comment: ${error.message}`)
    } finally {
      setProcessingComments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(identifier)
        return newSet
      })
      setProcessingAction((prev) => {
        const newState = { ...prev }
        delete newState[identifier]
        return newState
      })
    }
  }

  const handleApprove = (comment) => handleStatusChange(comment, "approved")
  const handleReject = (comment) => handleStatusChange(comment, "rejected")

  const getCategoryColor = (category) => {
    switch (category) {
      case "Article":
        return "bg-blue-100 text-blue-800"
      case "File":
        return "bg-green-100 text-green-800"
      case "Quiz":
        return "bg-purple-100 text-purple-800"
      case "Contest":
        return "bg-orange-100 text-orange-800"
      case "AIQuiz":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAvatarGradient = (initials) => {
    const gradients = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
    ]
    const index = initials?.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center  mb-4 md:mb-8"
        >
          <h1 className=" text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 md:mb-4">
            Comment Management
          </h1>
          <p className="text-sm md:text-lg text-gray-600">Review and moderate user comments</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-xl border-0 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-lg">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 hover:border-blue-300 cursor-pointer font-medium text-sm md:text-base"
                  >
                    <option value="all">All Comments ({comments.length})</option>
                    <option value="pending">Pending ({comments.filter((c) => c.status === "pending").length})</option>
                    <option value="approved">
                      Approved ({comments.filter((c) => c.status === "approved").length})
                    </option>
                    <option value="rejected">
                      Rejected ({comments.filter((c) => c.status === "rejected").length})
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Filter by Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 hover:border-blue-300 cursor-pointer font-medium text-sm md:text-base"
                  >
                    <option value="all">All Categories</option>
                    <option value="Article">Post</option>
                    <option value="File">File</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Contest">Contest</option>
                    <option value="AIQuiz">AIQuiz</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Badge
                  variant="outline"
                  className="text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 font-semibold"
                >
                  {filteredComments.length} comments found
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-yellow-50 to-lime-50 border-yellow-200 text-yellow-700 font-semibold"
                >
                  {comments.filter((c) => c.status === "pending").length} Pending Comments
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-emerald-50 to-green-50 border-green-200 text-emerald-700 font-semibold"
                >
                  {comments.filter((c) => c.status === "approved").length} Approved Comments
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-red-50 to-pink-100 border-pink-200 text-red-700 font-semibold"
                >
                  {comments.filter((c) => c.status === "rejected").length} Rejected found
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-xl rounded-xl md:rounded-2xl border-0 bg-white/90 backdrop-blur-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                <div className="p-1 md:p-2 bg-white/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  Comments
                  <span className="ml-1 md:ml-2 text-blue-100 text-sm md:text-base">({filteredComments.length})</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12 md:py-20">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600">Loading comments...</p>
                </div>
              ) : filteredComments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 md:py-20"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-8 h-8 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">No Comments Found! 📝</h3>
                  <p className="text-sm md:text-xl text-gray-500 mb-1 md:mb-2">
                    No comments match your current filters.
                  </p>
                </motion.div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <AnimatePresence mode="popLayout">
                    {filteredComments.map((comment, index) => {
                      const identifier = `${comment.userProfile?.email}-${comment.content}`
                      const isProcessing = processingComments.has(identifier)
                      const currentAction = processingAction[identifier]
                      return (
                        <motion.div
                          key={identifier}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: 20,
                            height: 0,
                            marginTop: 0,
                            marginBottom: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                          }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                          }}
                          className="p-4 md:p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                        >
                          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <div className="flex-shrink-0 flex sm:flex-col items-center gap-3">
                              {comment.userProfile?.avatar ? (
                                <img
                                  src={comment.userProfile.avatar || "/placeholder.svg"}
                                  alt={comment.userProfile.name}
                                  className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover shadow-lg ring-2 sm:ring-4 ring-white"
                                />
                              ) : (
                                <div
                                  className={`w-10 h-10 md:w-14 md:h-14 rounded-full ${getAvatarGradient(comment.userProfile?.initials)} flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg ring-2 sm:ring-4 ring-white`}
                                >
                                  {comment.userProfile?.initials}
                                </div>
                              )}
                              <div className="flex sm:hidden items-center gap-1">
                                {comment.status !== "approved" && (
                                  <Button
                                    onClick={() => handleApprove(comment)}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-1 md:p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                  >
                                    {isProcessing && currentAction === "approved" ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3 md:w-4 md:h-4" />
                                    )}
                                  </Button>
                                )}
                                {comment.status !== "rejected" && (
                                  <Button
                                    onClick={() => handleReject(comment)}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-1 md:p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                  >
                                    {isProcessing && currentAction === "rejected" ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <X className="w-3 h-3 md:w-4 md:h-4" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleDelete(comment)}
                                  disabled={isProcessing}
                                  size="sm"
                                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white p-1 md:p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                  {isProcessing && currentAction === "delete" ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 md:mb-3 gap-2">
                                <div>
                                  <h4 className="text-base md:text-lg font-bold text-gray-900">
                                    {comment.userProfile?.name}
                                  </h4>
                                  <p className="text-xs md:text-sm text-gray-500 font-medium">
                                    {comment.userProfile?.email}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <User className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 font-medium">
                                      {comment.title || "Unknown User"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                  <Badge
                                    className={`${getCategoryColor(comment.category)} text-xs font-semibold px-2 py-0.5 md:px-3 md:py-1`}
                                  >
                                    {comment.category === "Article" ? "Post" : comment.category}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-semibold px-2 py-0.5 md:px-3 md:py-1 ${
                                      comment.status === "pending"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : comment.status === "approved"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                                  >
                                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                                    {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 border border-gray-100">
                                <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">
                                  {comment.content}
                                </p>
                              </div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-500">
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="font-medium">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                                    <span className="font-medium">{comment.rating}/5</span>
                                  </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-1 md:gap-2">
                                  {comment.status !== "approved" && (
                                    <Button
                                      onClick={() => handleApprove(comment)}
                                      disabled={isProcessing}
                                      size="sm"
                                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                      {isProcessing && currentAction === "approved" ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3 md:w-4 md:h-4" />
                                      )}
                                      <span className="ml-1 md:ml-2 text-xs md:text-sm font-semibold">Approve</span>
                                    </Button>
                                  )}
                                  {comment.status !== "rejected" && (
                                    <Button
                                      onClick={() => handleReject(comment)}
                                      disabled={isProcessing}
                                      size="sm"
                                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                      {isProcessing && currentAction === "rejected" ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <X className="w-3 h-3 md:w-4 md:h-4" />
                                      )}
                                      <span className="ml-1 md:ml-2 text-xs md:text-sm font-semibold">Reject</span>
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleDelete(comment)}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                  >
                                    {isProcessing && currentAction === "delete" ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                    )}
                                    <span className="ml-1 md:ml-2 text-xs md:text-sm font-semibold">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {filteredComments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-xl md:rounded-2xl">
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-5 h-5 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">{filteredComments.length}</h3>
                    <p className="text-xs md:text-sm text-gray-600 font-medium">Total Comments</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-5 h-5 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
                      {filteredComments.length > 0
                        ? (filteredComments.reduce((sum, c) => sum + c.rating, 0) / filteredComments.length).toFixed(1)
                        : "0.0"}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 font-medium">Avg Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Clock className="w-5 h-5 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
                      {comments.filter((c) => c.status === "pending").length}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 font-medium">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Comment
