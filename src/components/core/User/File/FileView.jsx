"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  X,
  Copy,
  Star,
  Send,
  WheatIcon as Whatsapp,
} from "lucide-react"
import { getFileById, getAllFiles } from "../../../../services/operations/filesAPI"
import { createComment, getAllComments } from "../../../../services/operations/commentAPI"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"

export default function UserFileView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [fileLoading, setFileLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [professionText, setProfessionText] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [approvedComments, setApprovedComments] = useState([])
  const [file, setFile] = useState(null)
  const [relatedFiles, setRelatedFiles] = useState([])
  const [relatedFilesLoading, setRelatedFilesLoading] = useState(false)
  const [allFiles, setAllFiles] = useState([])

  useEffect(() => {
    const fetchFileData = async () => {
      setFileLoading(true)
      try {
        const fileResponse = await getFileById(id)
        if (fileResponse?.success) {
          setFile(fileResponse.file)
        } else {
          toast.error("Failed to fetch file")
        }
      } catch (error) {
        console.error("Error loading file:", error)
        toast.error("Error loading file")
      } finally {
        setFileLoading(false)
      }
    }

    const fetchComments = async () => {
      setCommentsLoading(true)
      try {
        const commentsResponse = await getAllComments()
        if (commentsResponse?.success) {
          const filtered = commentsResponse.comments.comments
            .filter((comment) => comment.status === "approved" && comment.category === "File" && comment.refId === id)
            .map((comment) => ({
              id: comment._id,
              content: comment.content,
              createdAt: comment.createdAt,
              userName: comment.userProfile?.name || "Anonymous",
              userAvatar: comment.userProfile?.avatar,
              initials: comment.userProfile?.initials || "",
              title: comment.title || "",
              rating: comment.rating || 0,
            }))
          setApprovedComments(filtered)
        } else {
          toast.error("Failed to fetch comments")
        }
      } catch (error) {
        console.error("Error loading comments:", error)
        toast.error("Error loading comments")
      } finally {
        setCommentsLoading(false)
      }
    }

    if (id) {
      fetchFileData()
      fetchComments()
    }
  }, [id])

  useEffect(() => {
    const fetchRelatedFiles = async () => {
      if (!file) return
      setRelatedFilesLoading(true)
      try {
        // Fetch all files from backend using proper API
        const filesResponse = await getAllFiles()
        if (filesResponse?.data) {
          setAllFiles(filesResponse.data)

          // Filter related files by region and matching categories
          const related = filesResponse.data
            .filter(
              (f) =>
                f._id !== file._id &&
                f.region === file.region &&
                (f.category1 === file.category1 ||
                  f.category2 === file.category2 ||
                  f.category3 === file.category3 ||
                  f.category4 === file.category4 ||
                  f.category5 === file.category5),
            )
            .slice(0, 6)
          setRelatedFiles(related)
        }
      } catch (error) {
        console.error("Error fetching related files:", error)
        toast.error("Failed to load related files")
      } finally {
        setRelatedFilesLoading(false)
      }
    }

    fetchRelatedFiles()
  }, [file])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return toast.error("Please write a comment")
    if (userRating === 0) return toast.error("Please provide a rating")

    setIsSubmittingComment(true)
    try {
      const commentPayload = {
        content: commentText,
        title: professionText.trim(),
        rating: userRating,
        category: "File",
        refId: id,
      }
      const res = await createComment(commentPayload)
      if (res?.success) {
        toast.success("Comment submitted for review!")
        setCommentText("")
        setProfessionText("")
        setUserRating(0)
        // Refresh comments after submission
        const commentsResponse = await getAllComments()
        if (commentsResponse?.success) {
          const filtered = commentsResponse.comments.comments
            .filter((comment) => comment.status === "approved" && comment.category === "File" && comment.refId === id)
            .map((comment) => ({
              id: comment._id,
              content: comment.content,
              createdAt: comment.createdAt,
              userName: comment.userProfile?.name || "Anonymous",
              userAvatar: comment.userProfile?.avatar,
              initials: comment.userProfile?.initials || "",
              title: comment.title || "",
              rating: comment.rating || 0,
            }))
          setApprovedComments(filtered)
        }
      } else {
        toast.error("Failed to submit comment")
      }
    } catch (error) {
      console.error("Comment error:", error)
      toast.error("Error submitting comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const viewFileInGoogleDocs = () => {
    if (!file?.fileUrl) {
      toast.error("File URL not available")
      return
    }
    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.fileUrl)}&embedded=true`
    window.open(googleDocsViewerUrl, "_blank")
  }

  const handleDownload = () => {
    if (!file?.fileUrl) {
      toast.error("File URL not available")
      return
    }
    const fileNameWithoutExt = file.fileName?.replace(/\.[^/.]+$/, "") || "downloaded-file"
    const extension = file.fileType?.toLowerCase() || "pdf"
    const downloadName = `${fileNameWithoutExt}.${extension}`
    const link = document.createElement("a")
    link.href = file.fileUrl
    link.download = downloadName
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = () => {
    setShowShareModal(true)
    setCopied(false)
  }

  const handleCopyLink = () => {
    const fileLink = window.location.href
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fileLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Clipboard access not supported in this browser.")
    }
  }

  const shareLink = window.location.href
  const shareTitle = file?.fileTitle || "Check out this file!"

  const prevFile = currentFileIndex > 0 ? currentFileIndex - 1 : null
  const nextFile = currentFileIndex < 1 ? currentFileIndex + 1 : null

  if (fileLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading file details...</p>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">File not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-blue-50 to-gray-100 p-4 md:p-8">
      <motion.div
        className="max-w-screen-lg mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top Section: Single Rectangular Thumbnail */}
        <div className="mb-8">
          <div className="w-full max-h-[400px] flex items-center justify-center bg-gray-100 rounded-xl shadow-lg overflow-hidden">
            <img
              src={file?.imageUrl[0] || "/placeholder.svg"}
              alt={`${file?.fileTitle} thumbnail`}
              className="w-auto max-w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        </div>
        {/* Title Section */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center md:text-left">
          {file?.fileTitle}
        </h1>
        {/* Meta Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Creator:</span> {file?.fileCreatorName}
          </div>
          {/* Share Button moved to the right bottom of the card as requested */}
          <div className="flex justify-end">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md"
            >
              <Share2 className="w-5 h-5" />
              <span>Share File</span>
            </button>
          </div>
        </div>
        {/* Description Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Description</h2>
          <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: file?.fileDescription }} />
        </div>
        {/* Region Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Region</h2>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
              {file?.region || "Not specified"}
            </span>
          </div>
        </div>
        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {file?.category1 && (
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                Category 1: {file.category1}
              </span>
            )}
            {file?.category2 && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                Category 2: {file.category2}
              </span>
            )}
            {file?.category3 && (
              <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                Category 3: {file.category3}
              </span>
            )}
            {file?.category4 && (
              <span className="bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                Category 4: {file.category4}
              </span>
            )}
            {file?.category5 && (
              <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                Category 5: {file.category5}
              </span>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={viewFileInGoogleDocs}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full px-6 py-3 shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>View File</span>
            </div>
          </button>
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full px-6 py-3 shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>Download File</span>
            </div>
          </button>
        </div>
        {/* Navigation Section
        <div className="flex justify-between items-center mb-12">
          {prevFile !== null ? (
            <button
              onClick={() => setCurrentFileIndex(prevFile)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full px-4 py-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous File</span>
            </button>
          ) : (
            <span className="w-28"></span>
          )}
          {nextFile !== null ? (
            <button
              onClick={() => setCurrentFileIndex(nextFile)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full px-4 py-2"
            >
              <span>Next File</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <span className="w-28"></span>
          )}
        </div> */}

        {/* Related Files Section */}
        {relatedFiles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Files</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedFiles.map((relatedFile) => (
                <motion.div
                  key={relatedFile._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                  whileHover={{ translateY: -4 }}
                >
                  {/* File Thumbnail */}
                  <div className="w-full h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={relatedFile?.imageUrl?.[0] || "/placeholder.svg"}
                      alt={relatedFile?.fileTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{relatedFile?.fileTitle}</h3>
                    <p className="text-xs text-gray-600 mb-3">By {relatedFile?.fileCreatorName}</p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {relatedFile?.category1 && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {relatedFile.category1}
                        </span>
                      )}
                      {relatedFile?.category2 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {relatedFile.category2}
                        </span>
                      )}
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() => navigate(`/show-file/${relatedFile._id}`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div>
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
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {/* Comments Display */}
          <div className="space-y-6">
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <AnimatePresence>
                {approvedComments.length > 0 ? (
                  approvedComments.map((comment) => (
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
                        <div className="flex justify-between items-start mb-1">
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
                        {/* Title (profession) placed here between name and rating */}
                        {comment.title && <p className="text-sm text-gray-600 mb-1">{comment.title}</p>}
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
        </div>
      </motion.div>

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
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Share File</h3>

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
                <label className="block text-sm font-semibold text-gray-700">File Link</label>
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
