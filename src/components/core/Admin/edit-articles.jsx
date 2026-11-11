"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Plus, X, ImageIcon, FileText, MapPin, Trash2, Save, ArrowLeft, Sparkles, Home } from "lucide-react"
import { getArticleById, updateArticle, deleteArticle, getAllRegionsWithStructure } from "../../../services/operations/articelsAPI"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import ArticlesEditor from "../Admin/Articles/articles-editor"

const TAG_COLOR_PALETTES = [
  { bg: "bg-[#fff4c4]", text: "text-[#746019]", border: "border-[#fde89c]" }, // Yellow
  { bg: "bg-[#c3faf5]", text: "text-[#187574]", border: "border-[#9eece4]" }, // Teal
  { bg: "bg-[#ffd8f4]", text: "text-[#86296b]", border: "border-[#f3bee5]" }, // Rose
  { bg: "bg-[#ffe6cd]", text: "text-[#7c3a00]", border: "border-[#fcd0a1]" }, // Orange
  { bg: "bg-[#f5f3ff]", text: "text-[#4262ff]", border: "border-[#ddd6fe]" }, // Blue
]

const EditArticles = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

  const [article, setArticle] = useState({
    title: "",
    tags: [],
    content: "",
    thumbnail: null,
    commentsEnabled: true,
    status: "draft",
  })

  const [imageBlocks, setImageBlocks] = useState([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tagInput, setTagInput] = useState("")

  // Load regions
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await getAllRegionsWithStructure()
        setRegions(response?.regions || response || [])
      } catch (error) {
        console.error("Error loading regions:", error)
        toast.error("Failed to load regions data")
      }
    }
    loadRegions()
  }, [])

  // Load article
  useEffect(() => {
    const loadArticleData = async () => {
      setIsLoading(true)
      try {
        const response = await getArticleById(id)
        const articleData = response?.article || response

        if (!articleData) {
          toast.error("Post not found")
          navigate("/articles/news")
          return
        }

        if (articleData.region) {
          const regionObj = regions.find((r) => r._id === articleData.region || r.name === articleData.region)
          if (regionObj) {
            setSelectedRegion(regionObj)

            if (articleData.category) {
              const categoryObj = regionObj.category?.find(
                (c) => c._id === articleData.category || c.name === articleData.category
              )
              if (categoryObj) {
                setSelectedCategory(categoryObj)

                if (articleData.subCategory) {
                  const subcategoryObj = categoryObj.subCategory?.find(
                    (sc) => sc._id === articleData.subCategory || sc.name === articleData.subCategory
                  )
                  if (subcategoryObj) {
                    setSelectedSubcategory(subcategoryObj)
                  }
                }
              }
            }
          }
        }

        setArticle({
          title: articleData.title || "",
          tags: articleData.tags || [],
          content: articleData.content || "",
          thumbnail: articleData.thumbnail?.[0] || null,
          commentsEnabled: articleData.commentsEnabled ?? true,
          status: articleData.status || "draft",
        })

        const initialImageBlocks =
          articleData.images?.map((img, index) => ({
            id: Date.now() + index,
            image: img,
          })) || []
        setImageBlocks(initialImageBlocks)
      } catch (error) {
        console.error("Error loading Post:", error)
        toast.error("Failed to load Post data")
      } finally {
        setIsLoading(false)
      }
    }

    if (id && regions.length > 0) {
      loadArticleData()
    }
  }, [id, regions, navigate])

  const handleRegionChange = (e) => {
    const regionId = e.target.value
    const region = regions.find((r) => r._id === regionId)
    setSelectedRegion(region || null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    if (!selectedRegion) return
    const category = selectedRegion.category?.find((c) => c._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
  }

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value
    if (!selectedCategory) return
    const subcategory = selectedCategory.subCategory?.find((sc) => sc._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
  }

  // Tag management
  const addTag = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim()
      setArticle((prev) => {
        if (prev.tags.includes(newTag)) return prev
        return {
          ...prev,
          tags: [...prev.tags, newTag],
        }
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setArticle((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }))
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const addImageBlock = () => {
    const newBlock = {
      id: Date.now(),
      image: null,
    }
    setImageBlocks((prev) => [...prev, newBlock])
  }

  const removeImageBlock = (blockId) => {
    setImageBlocks((prev) => prev.filter((b) => b.id !== blockId))
  }

  const handleFileUpload = (file, blockId = null) => {
    if (blockId) {
      setImageBlocks((prev) =>
        prev.map((block) => (block.id === blockId ? { ...block, [blockId]: file, image: file } : block))
      )
    } else {
      setArticle((prev) => ({ ...prev, thumbnail: file }))
    }
  }

  const handleEditorContentChange = (content) => {
    setArticle((prev) => ({ ...prev, content }))
  }

  const handleUpdate = async () => {
    if (!selectedRegion || !selectedCategory || !selectedSubcategory || !article.title.trim()) {
      toast.error("Please fill in all required fields (Region, Category, Subcategory, and Title)")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("id", id)
      formData.append("region", selectedRegion.name)
      formData.append("category", selectedCategory.name)
      formData.append("subCategory", selectedSubcategory.name)
      formData.append("title", article.title.trim())
      formData.append("tags", article.tags.join(","))
      formData.append("content", article.content)
      formData.append("status", article.status)
      formData.append("commentsEnabled", article.commentsEnabled)

      if (article.thumbnail && typeof article.thumbnail !== "string") {
        formData.append("thumbnail", article.thumbnail)
      }

      imageBlocks
        .filter((block) => block.image && typeof block.image !== "string")
        .forEach((block) => {
          formData.append("images", block.image)
        })

      const response = await updateArticle(id, formData)
      if (response.success) {
        toast.success("Post updated successfully!")
        navigate("/articles/news")
      } else {
        throw new Error(response.message || "Failed to update Post")
      }
    } catch (error) {
      console.error("Error updating Post:", error)
      toast.error(error.message || "An error occurred while updating the Post")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this Post permanently?")) return

    setIsDeleting(true)
    try {
      const response = await deleteArticle(id)
      if (response.success) {
        toast.success("Post deleted successfully!")
        navigate("/articles/news")
      } else {
        throw new Error(response.message || "Failed to delete Post")
      }
    } catch (error) {
      console.error("Error deleting Post:", error)
      toast.error(error.message || "Failed to delete Post")
    } finally {
      setIsDeleting(false)
    }
  }

  const FileUploadArea = ({ onFileSelect, placeholder = "Upload file", blockId = null }) => {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDrop = (e) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onFileSelect(files[0], blockId)
      }
    }

    const handleFileInput = (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        onFileSelect(files[0], blockId)
      }
    }

    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragOver
            ? "border-[#0fbcb0] bg-[#c3faf5]/30"
            : "border-[#0fbcb0]/50 bg-[#c3faf5]/10 hover:border-[#0fbcb0] hover:bg-[#c3faf5]/25"
        }`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#9eece4] flex items-center justify-center text-[#187574] shadow-xs">
            <Upload className="w-6 h-6 text-[#0fbcb0]" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-[#1c1c1e]">{placeholder}</p>
            <p className="text-xs text-[#187574] mt-0.5">Drag & drop or click to replace image</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#ffd02f] border-t-[#1c1c1e] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#555a6a]">Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        {/* Header Bar */}
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
              onClick={() => navigate("/articles/news")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Posts</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              EDIT POST
            </span>
          </div>
          <button
            onClick={() => navigate(`/approve-articles/${id}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <span>Review Mode</span>
            <Sparkles className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Post
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Modify post category, region, content, cover image, or publication status
          </p>
        </div>

        {/* Post Details (Lavender / Blue Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Category & Region Selection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">Region</label>
              <select
                value={selectedRegion?._id || ""}
                onChange={handleRegionChange}
                className="w-full h-11 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm"
              >
                <option value="">Choose region</option>
                {regions.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">Category</label>
              <select
                value={selectedCategory?._id || ""}
                onChange={handleCategoryChange}
                disabled={!selectedRegion}
                className="w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all text-sm disabled:opacity-50"
              >
                <option value="">Choose category</option>
                {selectedRegion?.category?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">Subcategory</label>
              <select
                value={selectedSubcategory?._id || ""}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                className="w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#86296b] transition-all text-sm disabled:opacity-50"
              >
                <option value="">Choose subcategory</option>
                {selectedCategory?.subCategory?.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content & Metadata Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#e0e2e8]">
            <FileText className="w-5 h-5 text-[#0fbcb0]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">Post Content & Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Post Title</label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => {
                  const val = e.target.value
                  setArticle((prev) => ({ ...prev, title: val }))
                }}
                placeholder="Post title..."
                className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-semibold"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">Cover Thumbnail</label>
              <FileUploadArea onFileSelect={handleFileUpload} placeholder="Change cover thumbnail" />

              {article.thumbnail && (
                <div className="mt-3 p-3 bg-[#c3faf5]/30 border border-[#9eece4] rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        typeof article.thumbnail === "string"
                          ? article.thumbnail
                          : URL.createObjectURL(article.thumbnail)
                      }
                      alt="Thumbnail Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-[#9eece4] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1c1c1e] truncate">
                        {typeof article.thumbnail === "string" ? "Current Cover Image" : article.thumbnail.name}
                      </p>
                      <p className="text-xs text-[#187574]">Ready to update</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArticle((prev) => ({ ...prev, thumbnail: null }))}
                    className="p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Tags & Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Type tag and press Enter"
                  className="flex-1 h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="h-12 px-6 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-sm transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {article.tags.map((tag, index) => {
                    const palette = TAG_COLOR_PALETTES[index % TAG_COLOR_PALETTES.length]
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${palette.bg} ${palette.text} border ${palette.border}`}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="p-0.5 hover:bg-black/10 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Editor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Post Content</label>
              <div className="rounded-xl border border-[#c7cad5] overflow-hidden bg-white focus-within:border-2 focus-within:border-[#4262ff]">
                <ArticlesEditor
                  content={article.content}
                  onChange={handleEditorContentChange}
                  placeholder="Update post content..."
                />
              </div>
            </div>

            {/* Status & Comments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#fff8e0]/40 rounded-xl border border-[#fde89c] space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                  Publication Status
                </label>
                <select
                  value={article.status}
                  onChange={(e) => setArticle({ ...article, status: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-[#fde89c] rounded-xl text-sm font-bold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ffd02f]"
                >
                  <option value="draft">Draft (Waiting for Approval)</option>
                  <option value="approved">Approved (Live)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="p-4 bg-[#ffe6cd]/30 rounded-xl border border-[#fcd0a1] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1c1c1e]">Reader Comments</h4>
                  <p className="text-xs text-[#7c3a00]">Allow reader interactions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={article.commentsEnabled}
                    onChange={() =>
                      setArticle({
                        ...article,
                        commentsEnabled: !article.commentsEnabled,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1c1c1e]"></div>
                </label>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="px-5 py-2.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#86296b]" />
                <span>{showImageUpload ? "Hide Gallery Images" : "Manage Additional Images"}</span>
              </button>
            </div>

            {/* Gallery Images Section */}
            <AnimatePresence>
              {showImageUpload && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-[#ffd8f4]/20 rounded-xl border border-[#f3bee5] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#86296b]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#86296b]">
                        Gallery Blocks ({imageBlocks.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addImageBlock}
                      className="px-3.5 py-1.5 rounded-full bg-[#86296b] text-white hover:bg-[#6e2257] text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slot</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {imageBlocks.map((block, index) => (
                      <div key={block.id} className="p-3 bg-white rounded-xl border border-[#f3bee5] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1c1c1e]">Image {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeImageBlock(block.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <FileUploadArea onFileSelect={handleFileUpload} placeholder="Upload or replace image" blockId={block.id} />
                        {block.image && (
                          <div className="p-2 bg-[#ffd8f4]/30 rounded-lg flex items-center gap-2">
                            <img
                              src={typeof block.image === "string" ? block.image : URL.createObjectURL(block.image)}
                              alt="Gallery Preview"
                              className="w-12 h-12 rounded object-cover"
                            />
                            <span className="text-xs font-medium text-[#1c1c1e] truncate">
                              {typeof block.image === "string" ? "Stored Image" : block.image.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-3 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] text-[#600000] border border-[#e3c5c5] font-bold text-sm transition-all disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/articles/news")}
            className="px-6 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-semibold text-sm transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-full bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Post...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#ffd02f]" />
                <span>Update Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditArticles