"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Plus, X, ImageIcon, FileText, MapPin, MessageSquare, ArrowLeft, Sparkles } from "lucide-react"
import { getAllRegionsWithStructure, createArticle } from "../../../services/operations/articelsAPI"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import ArticlesEditor from "../Admin/Articles/articles-editor"

const TAG_COLOR_PALETTES = [
  { bg: "bg-[#fff4c4]", text: "text-[#746019]", border: "border-[#fde89c]" }, // Yellow
  { bg: "bg-[#c3faf5]", text: "text-[#187574]", border: "border-[#9eece4]" }, // Teal
  { bg: "bg-[#ffd8f4]", text: "text-[#86296b]", border: "border-[#f3bee5]" }, // Rose
  { bg: "bg-[#ffe6cd]", text: "text-[#7c3a00]", border: "border-[#fcd0a1]" }, // Orange
  { bg: "bg-[#f5f3ff]", text: "text-[#4262ff]", border: "border-[#ddd6fe]" }, // Blue
]

const CreateArticles = () => {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [articleData, setArticleData] = useState({
    title: "",
    tags: [],
    content: "",
    thumbnail: null,
    images: [],
    commentsEnabled: true,
    status: "draft",
  })
  const [imageBlocks, setImageBlocks] = useState([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [contentParts, setContentParts] = useState([{ type: "text", content: "", id: Date.now() }])
  const [regionsData, setRegionsData] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getAllRegionsWithStructure()
        setRegionsData(data.regions || data || [])
      } catch (err) {
        console.error("Failed loading regions:", err)
        toast.error("Failed to load regions data")
      }
    }
    fetchRegions()
  }, [])

  const getCategoriesForRegion = (regionId) => {
    const region = regionsData.find((r) => r._id === regionId)
    return region ? region.category : []
  }

  const getSubcategoriesForCategory = (regionId, categoryId) => {
    const region = regionsData.find((r) => r._id === regionId)
    if (!region) return []

    const category = region.category.find((cat) => cat._id === categoryId)
    return category ? category.subCategory : []
  }

  const handleRegionChange = (e) => {
    const regionId = e.target.value
    const region = regionsData.find((r) => r._id === regionId)
    setSelectedRegion(region || null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    if (!selectedRegion) return

    const category = selectedRegion.category.find((cat) => cat._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
  }

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value
    if (!selectedRegion || !selectedCategory) return

    const subcategory = selectedCategory.subCategory.find((sub) => sub._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
  }

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !articleData.tags.includes(tagInput.trim())) {
      setArticleData({
        ...articleData,
        tags: [...articleData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setArticleData({
      ...articleData,
      tags: articleData.tags.filter((tag) => tag !== tagToRemove),
    })
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
    setImageBlocks([...imageBlocks, newBlock])
  }

  const removeImageBlock = (id) => {
    setImageBlocks(imageBlocks.filter((block) => block.id !== id))
  }

  const handleFileUpload = (file, blockId = null) => {
    if (blockId) {
      setImageBlocks(imageBlocks.map((block) => (block.id === blockId ? { ...block, [blockId]: file, image: file } : block)))
    } else {
      setArticleData({ ...articleData, thumbnail: file })
    }
  }

  const handleEditorContentChange = (content) => {
    setArticleData({ ...articleData, content })
  }

  const handleSubmit = async () => {
    if (!selectedRegion || !selectedCategory || !selectedSubcategory || !articleData.title.trim()) {
      toast.error("Please fill in all required fields (Region, Category, Subcategory, and Title)")
      return
    }

    setIsSubmitting(true)
    try {
      const combinedContent = contentParts
        .map((part) => {
          if (part.type === "text") {
            return part.content
          } else if (part.type === "image" && part.content) {
            return `[IMAGE:${part.content.name}]`
          }
          return ""
        })
        .join("\n\n")

      const finalContent = articleData.content || combinedContent

      const formData = new FormData()
      formData.append("region", selectedRegion.name)
      formData.append("category", selectedCategory.name)
      formData.append("subCategory", selectedSubcategory.name)
      formData.append("title", articleData.title.trim())
      formData.append("tags", articleData.tags.join(","))
      formData.append("content", finalContent)
      formData.append("status", "approved")
      formData.append("commentsEnabled", articleData.commentsEnabled)

      if (articleData.thumbnail) {
        formData.append("thumbnail", articleData.thumbnail)
      }

      contentParts
        .filter((part) => part.type === "image" && part.content)
        .forEach((part) => {
          formData.append(`images`, part.content)
        })

      imageBlocks
        .filter((block) => block.image)
        .forEach((block) => {
          formData.append(`images`, block.image)
        })

      const response = await createArticle(formData)
      if (response.success) {
        toast.success("Post created successfully!")
        navigate("/articles/news")
        resetForm()
      } else {
        throw new Error(response.message || "Failed to create Post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error(error.message || "An error occurred while creating the post")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedRegion(null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setArticleData({
      title: "",
      tags: [],
      content: "",
      thumbnail: null,
      images: [],
      commentsEnabled: true,
      status: "draft",
    })
    setContentParts([{ type: "text", content: "", id: Date.now() }])
    setImageBlocks([])
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
            <p className="text-xs text-[#187574] mt-0.5">Drag & drop or click to browse image</p>
          </div>
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
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              POST STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              NEW ARTICLE
            </span>
          </div>
          <button
            onClick={() => navigate("/articles/news")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <span>View All Posts</span>
            <Sparkles className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Create Post
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Share your knowledge with the world through structured regions and categories.
          </p>
        </div>

        {/* Details Card: Lavender / Blue Palette */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Taxonomy Details</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Region (Yellow tint accent) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                1. Select Region <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRegion?._id || ""}
                onChange={handleRegionChange}
                className="w-full h-11 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm"
              >
                <option value="">Choose region...</option>
                {regionsData.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category (Teal tint accent) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                2. Select Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory?._id || ""}
                onChange={handleCategoryChange}
                disabled={!selectedRegion}
                className={`w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all text-sm ${
                  !selectedRegion ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose category...</option>
                {selectedRegion &&
                  getCategoriesForRegion(selectedRegion._id).map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Subcategory (Rose tint accent) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">
                3. Select Subcategory <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubcategory?._id || ""}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                className={`w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#86296b] transition-all text-sm ${
                  !selectedCategory ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose subcategory...</option>
                {selectedRegion &&
                  selectedCategory &&
                  getSubcategoriesForCategory(selectedRegion._id, selectedCategory._id).map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Upload Article Card (when subcategory selected) */}
        <AnimatePresence>
          {selectedSubcategory && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#0fbcb0]" />
                  <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">Post Content & Media</h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
                  Step 2 of 2
                </span>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                    Post Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={articleData.title}
                    onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                    placeholder="Enter an engaging post title..."
                    className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-semibold"
                  />
                </div>

                {/* Thumbnail */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                    Post Cover Thumbnail
                  </label>
                  <FileUploadArea onFileSelect={handleFileUpload} placeholder="Upload cover thumbnail" />
                  {articleData.thumbnail && (
                    <div className="mt-3 p-3 bg-[#c3faf5]/30 border border-[#9eece4] rounded-xl relative flex items-center gap-3">
                      <img
                        src={URL.createObjectURL(articleData.thumbnail)}
                        alt="Thumbnail Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-[#9eece4]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1c1c1e] truncate">{articleData.thumbnail.name}</p>
                        <p className="text-xs text-[#187574]">Cover image ready</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setArticleData({ ...articleData, thumbnail: null })}
                        className="p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Tags (Multicolor Pills) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Tags & Keywords</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Enter a tag and press Enter"
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

                  {articleData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {articleData.tags.map((tag, index) => {
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

                {/* Content Editor */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                    Post Content <span className="text-red-500">*</span>
                  </label>
                  <div className="rounded-xl border border-[#c7cad5] overflow-hidden bg-white focus-within:border-2 focus-within:border-[#4262ff]">
                    <ArticlesEditor
                      content={articleData.content}
                      onChange={handleEditorContentChange}
                      placeholder="Write your Post content here..."
                    />
                  </div>
                </div>

                {/* Comments Toggle (Orange Light Accent) */}
                <div className="flex items-center justify-between p-4 bg-[#ffe6cd]/30 rounded-xl border border-[#fcd0a1]">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-[#7c3a00]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#1c1c1e]">Reader Comments</h4>
                      <p className="text-xs text-[#7c3a00]">Allow community readers to comment on this Post</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={articleData.commentsEnabled}
                      onChange={() =>
                        setArticleData({
                          ...articleData,
                          commentsEnabled: !articleData.commentsEnabled,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1c1c1e]"></div>
                  </label>
                </div>

                {/* Additional Images Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-[#86296b]" />
                    <span>{showImageUpload ? "Hide Additional Images" : "Add Additional Images"}</span>
                  </button>
                </div>

                {/* Additional Images Section (Rose Tint) */}
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
                          <span>Add Image</span>
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
                            <FileUploadArea onFileSelect={handleFileUpload} placeholder="Upload image" blockId={block.id} />
                            {block.image && (
                              <div className="p-2 bg-[#ffd8f4]/30 rounded-lg flex items-center gap-2">
                                <img
                                  src={URL.createObjectURL(block.image)}
                                  alt={block.image.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                                <span className="text-xs font-medium text-[#1c1c1e] truncate">{block.image.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Bar */}
        {selectedSubcategory && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] rounded-full font-extrabold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#1c1c1e]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish Post</span>
                  <Sparkles className="w-4 h-4 text-[#1c1c1e]" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/articles/news")}
              className="px-8 py-3.5 bg-white border border-[#c7cad5] text-[#1c1c1e] rounded-full hover:bg-[#f7f8fa] font-semibold text-sm transition-all shadow-sm"
            >
              Cancel Post
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateArticles