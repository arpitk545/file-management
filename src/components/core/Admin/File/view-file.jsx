"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FileText, Tag, BookOpen, Eye, Download, ArrowLeft, CheckCircle, XCircle, Home } from "lucide-react"
import { getFileById, updateFileStatus } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"

const MiroLoader = ({ message = "Loading file details..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

const ViewFile = () => {
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchFileData = async () => {
      setLoading(true)
      try {
        const response = await getFileById(id)
        if (response?.success) {
          setFileData(response.file)
        } else {
          toast.error("Failed to fetch file")
        }
      } catch (error) {
        toast.error("Error loading file")
      } finally {
        setLoading(false)
      }
    }
    fetchFileData()
  }, [id])

  const handlePublish = async () => {
    try {
      setPublishing(true)
      await updateFileStatus(id, "Approved File")
      setFileData((prev) => ({ ...prev, status: "Approved File" }))
      toast.success("File approved successfully!")
      navigate("/filter-file")
    } catch (error) {
      toast.error("Failed to approve file")
    } finally {
      setPublishing(false)
    }
  }

  const handleReject = async () => {
    try {
      setRejecting(true)
      await updateFileStatus(id, "Rejected File")
      setFileData((prev) => ({ ...prev, status: "Rejected File" }))
      toast.success("File rejected successfully!")
      navigate("/filter-file")
    } catch (error) {
      toast.error("Failed to reject file")
    } finally {
      setRejecting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const viewFileInGoogleDocs = () => {
    if (!fileData?.fileUrl) return
    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileData.fileUrl)}&embedded=true`
    window.open(googleDocsViewerUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <MiroLoader message="Retrieving file document..." />
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-6 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#fbd4d4] flex items-center justify-center text-red-500">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">File Not Found</h2>
        <p className="text-sm text-[#555a6a]">The requested document does not exist or has been removed.</p>
        <button
          onClick={() => navigate("/filter-file")}
          className="px-6 py-2.5 rounded-full bg-[#1c1c1e] text-white text-sm font-bold shadow-sm"
        >
          Back to Files
        </button>
      </div>
    )
  }

  const fileNameWithoutExt = fileData.fileName?.replace(/\.[^/.]+$/, "") || "downloaded-file"
  const extension = fileData.fileType?.toLowerCase() || "pdf"
  const downloadName = `${fileNameWithoutExt}.${extension}`

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Posts Pattern) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/filter-file")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Repository</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              FILE STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              DOCUMENT INSPECTOR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                fileData.status === "Approved File"
                  ? "bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
                  : fileData.status === "Rejected File"
                    ? "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
                    : "bg-[#fff8e0] text-[#746019] border border-[#fde89c]"
              }`}
            >
              {fileData.status || "Waiting for Approval"}
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            {fileData.fileTitle}
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Published by {fileData.fileCreatorName || "Admin"} • {fileData.region || "No Region"} • Added {formatDate(fileData.createdAt)}
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          {/* File Document Preview */}
          {fileData.fileUrl && (
            <div className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px]">
              {fileData.imageUrl ? (
                <img
                  src={fileData.imageUrl || "/placeholder.svg"}
                  alt={fileData.fileTitle || "File preview"}
                  className="object-contain max-h-64 max-w-full rounded-xl shadow-xs border border-[#e0e2e8] mb-4 bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#c7cad5] flex items-center justify-center text-[#555a6a] mb-4 shadow-xs">
                  <FileText className="w-8 h-8" />
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={viewFileInGoogleDocs}
                  className="px-6 py-2.5 bg-[#4262ff] hover:bg-[#3451e0] text-white font-bold rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open in Document Viewer</span>
                </button>
                <a
                  href={fileData.fileUrl}
                  download={downloadName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-bold rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          )}

          {/* Description */}
          {fileData.fileDescription && (
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#1c1c1e] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4262ff]" />
                <span>Description & Overview</span>
              </h3>
              <div className="bg-[#f7f8fa] rounded-xl p-4 sm:p-6 border border-[#e0e2e8]">
                <div
                  className="text-[#1c1c1e] text-sm leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: fileData.fileDescription }}
                />
              </div>
            </div>
          )}

          {/* Taxonomy & Metadata Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
              Taxonomy Classification & Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#e0e2e8]">
                <span className="text-xs text-[#555a6a] font-medium block">Region</span>
                <span className="font-bold text-sm text-[#1c1c1e]">{fileData.region || "—"}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#e0e2e8]">
                <span className="text-xs text-[#555a6a] font-medium block">Category 1</span>
                <span className="font-bold text-sm text-[#1c1c1e]">{fileData.category1 || "—"}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#e0e2e8]">
                <span className="text-xs text-[#555a6a] font-medium block">Category 2</span>
                <span className="font-bold text-sm text-[#1c1c1e]">{fileData.category2 || "—"}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#e0e2e8]">
                <span className="text-xs text-[#555a6a] font-medium block">Category 3</span>
                <span className="font-bold text-sm text-[#1c1c1e]">{fileData.category3 || "—"}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {fileData.tags?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {fileData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#c3faf5] text-[#187574] border border-[#9eece4] px-3 py-1 rounded-full text-xs font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Moderation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#e0e2e8] justify-end">
            {fileData.status !== "Approved File" && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full sm:w-auto px-8 py-3 bg-[#0fbcb0] hover:bg-[#0da69b] text-white font-bold rounded-full text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{publishing ? "Approving..." : "Approve File"}</span>
              </button>
            )}
            {fileData.status !== "Rejected File" && (
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="w-full sm:w-auto px-8 py-3 bg-[#fbd4d4] hover:bg-[#f8b4b4] text-[#800000] border border-[#e3c5c5] font-bold rounded-full text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>{rejecting ? "Rejecting..." : "Reject File"}</span>
              </button>
            )}
            <button
              onClick={() => navigate("/filter-file")}
              className="w-full sm:w-auto px-8 py-3 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-bold rounded-full text-sm shadow-sm transition-all active:scale-95"
            >
              Back to Repository
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewFile
