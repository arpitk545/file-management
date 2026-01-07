"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, ArrowLeft, Share2, Star, X, Copy, PhoneIcon as Whatsapp, Facebook, Twitter, Linkedin, Mail } from 'lucide-react'
import { useParams, useNavigate } from "react-router-dom"
import { getArticleById, getAllArticles } from "../../../../services/operations/articelsAPI"
import { createComment, getAllCommentsById } from "../../../../services/operations/commentAPI"
import toast from "react-hot-toast"

const UserPostView = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [professionText, setProfessionText] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [comments, setComments] = useState([])
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false) 
  const [copied, setCopied] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [allArticles, setAllArticles] = useState([])

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      try {
        setLoading(true)
        const articleResponse = await getArticleById(articleId)
        if (articleResponse?.success && articleResponse?.article) {
          setArticle(articleResponse.article)
        } else {
          toast.error("Failed to fetch posts")
          navigate("/user-all-post-view")
          return
        }

        const commentsResponse = await getAllCommentsById(articleId)
        if (commentsResponse.success) {
          const approvedComments = commentsResponse.comments.filter(
            (comment) => comment.status === "approved"
          )
          const formatted = approvedComments.map((comment) => ({
            id: comment._id,
            content: comment.content,
            createdAt: comment.createdAt,
            userName: comment.userProfile?.name || "Anonymous",
            userAvatar: comment.userProfile?.avatar,
            initials: comment.userProfile?.initials || "",
            title: comment.title || "",
            rating: comment.rating || 0,
          }))
          setComments(formatted)
        } else {
          toast.error("Failed to load comments")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error loading article or comments")
      } finally {
        setLoading(false)
      }
    }
    if (articleId) {
      fetchArticleAndComments()
    } else {
      console.warn("No article ID provided to fetch.")
    }
  }, [articleId, navigate])

  // Fetch all articles for related posts
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const response = await getAllArticles()
        if (response.success) {
          const approvedArticles = response.data.filter((article) => article.status === "approved")
          setAllArticles(approvedArticles)
        }
      } catch (error) {
        console.error("Error fetching articles:", error)
      }
    }
    fetchAllArticles()
  }, [])

  // Filter related articles based on current article's category
  useEffect(() => {
    if (article && allArticles.length > 0) {
      const related = allArticles
        .filter(art => 
          art._id !== article._id && // Exclude current article
          (art.category === article.category || art.region === article.region)
        )
        .slice(0, 4) // Limit to 4 related articles
      setRelatedArticles(related)
    }
  }, [article, allArticles])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!commentText.trim() || userRating === 0) return

    setIsSubmittingComment(true)

    try {
      const response = await createComment({
        content: commentText.trim(),
        title: professionText.trim(),
        rating: userRating,
        category: "Article",
        refId: articleId,
      })

      if (response?.success) {
        if (response.comment.status === "approved") {
          setComments((prev) => [...prev, response.comment])
        } else {
          toast.success("Comment submitted for review. It will appear once approved.")
        }

        setCommentText("")
        setProfessionText("")
        setUserRating(0)
      } else {
        toast.error(response?.message || "Failed to submit comment.")
        console.error("Failed to submit comment:", response)
      }
    } catch (err) {
      console.error("Error submitting comment:", err)
      toast.error("Error submitting comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleBack = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.history.back();
    } else {
      navigate("/user-all-post-view");
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
    setCopied(false) 
  }

  const handleCopyLink = () => {
    const articleLink = window.location.href
    if (navigator.clipboard) {
      navigator.clipboard.writeText(articleLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) 
    } else {
      toast.error("Clipboard access not supported in this browser.")
    }
  }

  const handleRelatedArticleClick = (articleId) => {
    navigate(`/post-view/${articleId}`)
    // Scroll to top when navigating to new article
    window.scrollTo(0, 0)
  }

  const shareLink = window.location.href
  const shareTitle = article?.title || "Check out this article!"

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading your Posts...</h2>
          <p className="text-gray-600">Please wait while we process your Posts</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Article not found</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Back to Posts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-blue-50 to-gray-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </motion.button>

        {/* Main Article Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={article._id}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 relative"
          >
            {/* Article Meta Information */}
            <div className="flex flex-wrap gap-2 mb-4">
              {article.region && (
                <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  {article.region}
                </span>
              )}
              {article.category && (
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {article.category}
                </span>
              )}
              {article.subCategory && (
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  {article.subCategory}
                </span>
              )}
            </div>
            {/* Article Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{article.title}</h1>
            {/* Article Date */}
            {article.date && (
              <p className="text-gray-500 mb-6">
                Published on{" "}
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            {/* Thumbnail */}
            {article.thumbnail && article.thumbnail.length > 0 && (
              <img
                src={article.thumbnail[0] || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl mb-6 shadow-md"
              />
            )}
            {/* Article Content */}
            {article.content && (
              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
            {/* Additional Images */}
            {article.image && article.image.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {article.image?.map((imgSrc, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow-md">
                    <img
                      src={imgSrc || "/placeholder.svg"}
                      alt={`${article.title} image ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            {/* Share Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200"
              >
                <Share2 className="w-4 h-4" />
                Share Post
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Related Posts Section */}
        {relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {relatedArticles.map((relatedArticle, index) => (
                  <motion.div
                    key={relatedArticle._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    onClick={() => handleRelatedArticleClick(relatedArticle._id)}
                  >
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={relatedArticle.thumbnail?.[0] || "/placeholder.svg"}
                        alt={relatedArticle.title || "Article thumbnail"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-sm font-semibold text-left leading-tight line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {relatedArticle.region && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                            {relatedArticle.region}
                          </span>
                        )}
                        {relatedArticle.category && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            {relatedArticle.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Comment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments ({comments?.length})</h2>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your profession (e.g., Teacher, Student)"
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
                {[1, 2, 3, 4, 5]?.map((star) => (
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[120px]"
              placeholder="Write your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            ></textarea>
            <button
              type="submit"
              disabled={!commentText.trim() || userRating === 0 || isSubmittingComment}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
            </button>
          </form>

          {/* Display Comments */}
          <div className="space-y-6 pt-4">
            {comments?.length > 0 ? (
              <AnimatePresence>
                {comments?.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-300 flex items-center justify-center bg-purple-100 text-purple-600 font-semibold flex-shrink-0">
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
                        <p className="text-sm text-gray-600 mb-1">{comment.title}</p>
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
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">No comments yet.</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Share Article</h3>

              {/* Social Media Icons */}
              <div className="flex justify-center gap-6 mb-8">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-gray-600 hover:text-green-500 transition-colors"
                >
                  <Whatsapp size={36} className="text-green-500" />
                  <span className="text-xs mt-1">WhatsApp</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Facebook size={36} className="text-blue-600" />
                  <span className="text-xs mt-1">Facebook</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-gray-600 hover:text-blue-400 transition-colors"
                >
                  <Twitter size={36} className="text-blue-400" />
                  <span className="text-xs mt-1">Twitter</span>
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-gray-600 hover:text-blue-700 transition-colors"
                >
                  <Linkedin size={36} className="text-blue-700" />
                  <span className="text-xs mt-1">LinkedIn</span>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Mail size={36} className="text-red-500" />
                  <span className="text-xs mt-1">Email</span>
                </a>
              </div>

              {/* Link Input and Copy Button */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Article Link</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 p-3 bg-gray-50 text-gray-700 text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 flex items-center gap-2 transition-colors duration-200 ${
                      copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Copy size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserPostView