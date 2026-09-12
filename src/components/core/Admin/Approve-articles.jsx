"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
  Check,
  X,
  MapPin,
  FileText,
  Tag,
  Calendar,
  User,
  MessageCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { getArticleById, updateArticleStatus } from "../../../services/operations/articelsAPI"

const ApproveArticles = () => {
  const [currentArticle, setCurrentArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true)
      try {
        const response = await getArticleById(id)
        if (response?.success) {
          setCurrentArticle(response.article)
        } else {
          toast.error("Failed to fetch post")
        }
      } catch (error) {
        toast.error("Error loading post")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  const updateStatus = async (newStatus) => {
    if (!currentArticle) return
    setLoadingAction(newStatus)

    try {
      const response = await updateArticleStatus(currentArticle._id, newStatus)

      if (response?.success) {
        setCurrentArticle(response.article)
        toast.success(`Post ${newStatus} successfully!`)
        setTimeout(() => navigate(-1), 1200)
      } else {
        toast.error(response?.message || "Failed to update post status")
      }
    } catch (error) {
      console.error(`Error updating post status to ${newStatus}:`, error)
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleApprove = () => updateStatus("approved")
  const handleReject = () => updateStatus("rejected")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#ffd02f] border-t-[#1c1c1e] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#555a6a]">Loading post for review...</p>
        </div>
      </div>
    )
  }

  if (!currentArticle) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#fbd4d4] text-[#600000] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#1c1c1e]">Post Not Found</h3>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-semibold transition-all shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Posts</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              REVIEW POST
            </span>
          </div>
          <button
            onClick={() => navigate(`/edit-articles/${currentArticle._id}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-semibold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <span>Edit Post</span>
            <Sparkles className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Review Post
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Inspect post content, taxonomy, and media before deciding approval
          </p>
        </div>

        {/* Article Details Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-8 space-y-6 w-full">
          {/* Post Header */}
          <div className="pb-4 border-b border-[#e0e2e8]">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1e]">{currentArticle.title}</h2>
          </div>

          {/* Miro 6-Pastel Info Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Region (Blue) */}
            <div className="p-3.5 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff]">Region</span>
              <p className="text-sm font-extrabold text-[#1c1c1e] truncate">{currentArticle.region || "Global"}</p>
            </div>

            {/* Category (Teal) */}
            <div className="p-3.5 rounded-xl bg-[#c3faf5] border border-[#9eece4] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#187574]">Category</span>
              <p className="text-sm font-extrabold text-[#1c1c1e] truncate">{currentArticle.category || "General"}</p>
            </div>

            {/* Subcategory (Rose) */}
            <div className="p-3.5 rounded-xl bg-[#ffd8f4] border border-[#f3bee5] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86296b]">Subcategory</span>
              <p className="text-sm font-extrabold text-[#1c1c1e] truncate">{currentArticle.subCategory || "—"}</p>
            </div>

            {/* Status (Yellow) */}
            <div className="p-3.5 rounded-xl bg-[#fff8e0] border border-[#fde89c] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#746019]">Status</span>
              <p className="text-sm font-extrabold text-[#1c1c1e] truncate">{currentArticle.status || "Draft"}</p>
            </div>

            {/* Submitted Date (Orange) */}
            <div className="p-3.5 rounded-xl bg-[#ffe6cd] border border-[#fcd0a1] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7c3a00]">Date</span>
              <p className="text-sm font-extrabold text-[#1c1c1e] truncate">
                {currentArticle.date ? new Date(currentArticle.date).toLocaleDateString() : "—"}
              </p>
            </div>

            {/* Comments (Mint/Teal) */}
            <div className="p-3.5 rounded-xl bg-[#c3faf5]/60 border border-[#9eece4] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#187574]">Comments</span>
              <p className="text-sm font-extrabold text-[#1c1c1e]">
                {currentArticle.commentsEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          {/* Tags */}
          {currentArticle.tags && currentArticle.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Tags</span>
              <div className="flex flex-wrap gap-2">
                {currentArticle.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fff4c4] text-[#746019] border border-[#fde89c]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Thumbnail */}
          {currentArticle.thumbnail && currentArticle.thumbnail.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Cover Thumbnail</span>
              <div className="rounded-xl overflow-hidden bg-[#fafbfc] border border-[#e0e2e8] p-2 flex items-center justify-center">
                <img
                  src={currentArticle.thumbnail[0]}
                  alt={currentArticle.title}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Post Content</span>
            <div
              className="prose prose-lg max-w-none text-[#1c1c1e] p-5 bg-[#fafbfc] rounded-xl border border-[#e0e2e8]"
              dangerouslySetInnerHTML={{ __html: currentArticle.content }}
            />
          </div>

          {/* Additional Images */}
          {currentArticle.image && currentArticle.image.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86296b]">
                Gallery Images ({currentArticle.image.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentArticle.image.map((img, index) => (
                  <div key={index} className="rounded-xl overflow-hidden bg-[#fafbfc] border border-[#e0e2e8] p-2">
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="max-w-full max-h-64 object-contain mx-auto rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Decision Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={handleApprove}
            disabled={loadingAction !== null}
            className="px-10 py-3.5 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {loadingAction === "approved" ? (
              <span>Processing...</span>
            ) : (
              <>
                <Check className="w-5 h-5 text-[#ffd02f]" />
                <span>Approve Post</span>
              </>
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={loadingAction !== null}
            className="px-10 py-3.5 bg-[#fbd4d4] hover:bg-[#f9a9a9] text-[#600000] border border-[#e3c5c5] rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingAction === "rejected" ? (
              <span>Processing...</span>
            ) : (
              <>
                <X className="w-5 h-5" />
                <span>Reject Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApproveArticles