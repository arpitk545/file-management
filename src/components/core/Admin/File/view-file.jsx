"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { FileText, Calendar, Tag, MapPin, Layers, Clock, BookOpen, Eye, Download, X } from "lucide-react"
import { getFileById, updateFileStatus } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"

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
      toast.success("File published successfully!")
      navigate("/filter-file")
      const updatedData = await getFileById(id)
      setFileData(updatedData?.file)
    } catch (error) {
      toast.error("Failed to publish file. Please try again.")
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
      const updatedData = await getFileById(id)
      setFileData(updatedData?.file)
    } catch (error) {
      toast.error("Failed to reject file. Please try again.")
    } finally {
      setRejecting(false)
    }
  }

  const handleCancel = () => {
    window.history.back()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const viewFileInGoogleDocs = () => {
    if (!fileData?.fileUrl) return
    const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileData.fileUrl)}&embedded=true`
    window.open(googleDocsViewerUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading file details...</p>
        </div>
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">File not found</p>
        </div>
      </div>
    )
  }

  const fileNameWithoutExt = fileData.fileName?.replace(/\.[^/.]+$/, "") || "downloaded-file"
  const extension = fileData.fileType?.toLowerCase() || "pdf"
  const downloadName = `${fileNameWithoutExt}.${extension}`

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{fileData.fileTitle}</h1>
                <div className="flex items-center space-x-4 bg-white/10 rounded-2xl p-3 sm:p-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 bg-blue-500 flex items-center justify-center text-white font-bold">
                    {fileData.fileCreatorName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base">
                      {fileData.fileCreatorName || "Unknown Creator"}
                    </h3>
                    <p className="text-blue-100 text-xs sm:text-sm">{fileData.region || "No region specified"}</p>
                  </div>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-blue-100 text-sm">
                  <Clock size={14} className="inline mr-1" />
                  {formatDate(fileData.createdAt)}
                </p>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      fileData.status === "Approved File"
                        ? "bg-green-100 text-green-800"
                        : fileData.status === "Rejected File"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {fileData.status || "Unknown Status"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            {fileData.fileUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="bg-gray-100 w-full h-48 border sm:h-64 rounded-2xl shadow-lg flex items-center justify-center">
                  {fileData.imageUrl ? (
                    <img
                      src={fileData.imageUrl || "/placeholder.svg"}
                      alt={fileData.fileTitle || "File preview"}
                      className="object-contain max-h-full max-w-full rounded-2xl"
                    />
                  ) : (
                    <FileText className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border p-3 sm:p-4 rounded-2xl">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <MapPin className="text-blue-600" size={18} />
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">
                    Region: {fileData.region || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border p-3 sm:p-4 rounded-2xl">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <Layers className="text-purple-600" size={18} />
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Categories</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  {fileData.category1 && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Category 1: {fileData.category1}
                    </span>
                  )}
                  {fileData.category2 && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Category 2: {fileData.category2}
                    </span>
                  )}
                  {fileData.category3 && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Category 3: {fileData.category3}
                    </span>
                  )}
                  {fileData.category4 && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Category 4: {fileData.category4}
                    </span>
                  )}
                  {fileData.category5 && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Category 5: {fileData.category5}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-2xl border">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <Calendar className="text-green-600" size={18} />
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Year & Type</span>
                </div>
                <div className="space-y-1">
                 <p className="text-green-800 font-medium text-sm sm:text-base">
                    Year: {Array.isArray(fileData.additionalYears)
                      ? fileData.additionalYears.join(', ')
                      : fileData.additionalYears || "—"}
                  </p>
                  <p className="text-green-700 text-sm sm:text-sm">Type: {fileData.fileType || "—"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg sm:text-xl flex items-center">
                <BookOpen className="mr-2 text-purple-600" size={20} />
                File Description
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-inner">
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm sm:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: fileData.fileDescription }}
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-400">
              <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <FileText className="mr-2" size={18} />
                File Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">File Name</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{fileData.fileTitle || "—"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Comment Status</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                    {fileData.showCommentBox ? "Yes" : "No" || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Academic Year</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                   {Array.isArray(fileData.additionalAcademicYears)
                     ? fileData.additionalAcademicYears.join(', ')
                     : fileData.additionalAcademicYears || "—"}
                 </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Upload Method</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base capitalize">
                    {fileData.uploadMethod || "—"}
                  </p>
                </div>
              </div>
              {fileData.fileUrl && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={viewFileInGoogleDocs}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Eye size={16} />
                    View File
                  </button>
                  <a
                    href={fileData.fileUrl}
                    download={downloadName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              )}
            </div>
            {fileData.tags?.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Tag className="mr-2" size={18} />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {fileData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200">
              {fileData.status === "Approved File" ? (
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className={`flex-1 h-12 sm:h-14 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-base sm:text-lg rounded-2xl
                                hover:from-red-700 hover:to-rose-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg
                                flex items-center justify-center space-x-2 ${rejecting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {rejecting ? (
                    <span>Rejecting...</span>
                  ) : (
                    <>
                      <X size={18} />
                      <span>Reject File</span>
                    </>
                  )}
                </button>
              ) : fileData.status === "Rejected File" ? (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className={`flex-1 h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-base sm:text-lg rounded-2xl
                   hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg
                  flex items-center justify-center space-x-2 ${publishing ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {publishing ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <BookOpen size={18} />
                      <span>Publish File</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className={`flex-1 h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-base sm:text-lg rounded-2xl
                  hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg
                  flex items-center justify-center space-x-2 ${publishing ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {publishing ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <BookOpen size={18} />
                      <span>Publish File</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleCancel}
                className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-base sm:text-lg rounded-2xl
                 hover:from-gray-600 hover:to-gray-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg
                flex items-center justify-center"
              >
                Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ViewFile
