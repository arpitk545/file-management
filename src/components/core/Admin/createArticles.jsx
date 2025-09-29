"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Plus, X, ImageIcon, FileText, MapPin,  MessageSquare } from "lucide-react"
import { getAllRegionsWithStructure, createArticle } from "../../../services/operations/articelsAPI"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import ArticlesEditor from "../Admin/Articles/articles-editor"

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
        setRegionsData(data.regions || data)
      } catch (err) {
        console.error("Failed loading regions:", err)
        toast.error("Failed to load regions data")
      }
    }
    fetchRegions()
  }, [])

  const getCategoriesForRegion = (regionId) => {
    const region = regionsData.find(r => r._id === regionId)
    return region ? region.category : []
  }

  const getSubcategoriesForCategory = (regionId, categoryId) => {
    const region = regionsData.find(r => r._id === regionId)
    if (!region) return []
    
    const category = region.category.find(cat => cat._id === categoryId)
    return category ? category.subCategory : []
  }

  const handleRegionChange = (e) => {
    const regionId = e.target.value
    const region = regionsData.find(r => r._id === regionId)
    setSelectedRegion(region || null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    if (!selectedRegion) return
    
    const category = selectedRegion.category.find(cat => cat._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
  }

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value
    if (!selectedRegion || !selectedCategory) return
    
    const subcategory = selectedCategory.subCategory.find(sub => sub._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
  }

  // Tag management functions
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

  // Content management functions
  const addContentPart = (type, afterId = null) => {
    const newPart = {
      type,
      content: type === "text" ? "" : null,
      id: Date.now(),
    }

    if (afterId) {
      const index = contentParts.findIndex((part) => part.id === afterId)
      const newParts = [...contentParts]
      newParts.splice(index + 1, 0, newPart)
      setContentParts(newParts)
    } else {
      setContentParts([...contentParts, newPart])
    }
  }

  const updateContentPart = (id, content) => {
    setContentParts(contentParts.map((part) => (part.id === id ? { ...part, content } : part)))
  }

  // const removeContentPart = (id) => {
  //   if (contentParts.length > 1) {
  //     setContentParts(contentParts.filter((part) => part.id !== id))
  //   }
  // }

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

  const updateImageBlock = (id, field, value) => {
    setImageBlocks(imageBlocks.map((block) => (block.id === id ? { ...block, [field]: value } : block)))
  }

  const handleFileUpload = (file, blockId = null) => {
    if (blockId) {
      updateImageBlock(blockId, "image", file)
    } else {
      setArticleData({ ...articleData, thumbnail: file })
    }
  }

  // const handleContentImageUpload = (file, partId) => {
  //   updateContentPart(partId, file)
  // }

  const handleEditorContentChange = (content) => {
    setArticleData({ ...articleData, content })
  }

  const handleSubmit = async () => {
    if (!selectedRegion || !selectedCategory || !selectedSubcategory || !articleData.title) {
      toast.error("Please fill in all required fields")
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
      formData.append("title", articleData.title)
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

  const FileUploadArea = ({ onFileSelect, placeholder = "Upload file", blockId = null, partId = null }) => {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDrop = (e) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        if (partId) {
          onFileSelect(files[0], partId)
        } else {
          onFileSelect(files[0], blockId)
        }
      }
    }

    const handleFileInput = (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        if (partId) {
          onFileSelect(files[0], partId)
        } else {
          onFileSelect(files[0], blockId)
        }
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
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{placeholder}</p>
            <p className="text-sm text-gray-500 mt-1">Drag & drop or click to browse</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Post
          </h1>
          <p className="text-gray-600 text-lg">Share your knowledge with the world</p>
        </motion.div>

        {/* Selection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Post Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Region</label>
              <select
                value={selectedRegion?._id || ""}
                onChange={handleRegionChange}
                className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium"
              >
                <option value="">Choose region</option>
                {regionsData.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Category</label>
              <select
                value={selectedCategory?._id || ""}
                onChange={handleCategoryChange}
                disabled={!selectedRegion}
                className={`w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium ${
                  !selectedRegion ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Choose category</option>
                {selectedRegion &&
                  getCategoriesForRegion(selectedRegion._id).map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Subcategory</label>
              <select
                value={selectedSubcategory?._id || ""}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                className={`w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium ${
                  !selectedCategory ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Choose subcategory</option>
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
        </motion.div>

        {/* Upload Article Card */}
        <AnimatePresence>
          {selectedSubcategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Post</h2>
              </div>

              <div className="grid gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Post Title</label>
                  <input
                    type="text"
                    value={articleData.title}
                    onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                    placeholder="Enter your Post title"
                    className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Post Thumbnail</label>
                  <FileUploadArea onFileSelect={handleFileUpload} placeholder="Upload thumbnail image" />
                  {articleData.thumbnail && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl relative">
                      <p className="text-sm text-green-700 font-medium">✓ {articleData.thumbnail.name}</p>
                      <img
                        src={URL.createObjectURL(articleData.thumbnail)}
                        alt="Thumbnail Preview"
                        className="mt-2 rounded-md max-h-40"
                      />
                      <button
                       type="button"
                        onClick={() => setArticleData({ ...articleData, thumbnail: null })}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-200">
                         <X className="w-4 h-4 text-red-600" />
                        </button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Enter a tag and press Enter"
                      className="flex-1 h-12 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {articleData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {articleData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="w-4 h-4 bg-blue-200 hover:bg-blue-300 rounded-full flex items-center justify-center transition-colors duration-200"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Post Content</label>
                  <ArticlesEditor
                    content={articleData.content}
                    onChange={handleEditorContentChange}
                    placeholder="Write your Post content here..."
                  />
                </div>

                {/* Additional Images */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Additional Images
                  </button>
                </div>

                {/* Comments Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Comments</h4>
                      <p className="text-sm text-gray-500">Allow readers to comment on this Post</p>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Image Upload Section */}
                <AnimatePresence>
                  {showImageUpload && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Additional Images</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowImageUpload(false)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>

                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={addImageBlock}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                          Add Image
                        </button>
                      </div>

                      <div className="grid gap-4">
                        <AnimatePresence>
                          {imageBlocks.map((block, index) => (
                            <motion.div
                              key={block.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="p-4 bg-white rounded-xl border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-md font-medium text-gray-900">Additional Image {index + 1}</h4>
                                <button
                                  type="button"
                                  onClick={() => removeImageBlock(block.id)}
                                  className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                                >
                                  <X className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                              <FileUploadArea
                                onFileSelect={handleFileUpload}
                                placeholder="Upload image"
                                blockId={block.id}
                              />
                              {block.image && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                                  <p className="text-sm text-green-700 font-medium">✓ {block.image.name}</p>
                                  <img
                                  src={URL.createObjectURL(block.image)}
                                   alt={block.image.name}
                                  className="mt-2 max-w-full h-auto rounded-lg"
                                 />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <AnimatePresence>
          {selectedSubcategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </div>
                ) : (
                  "Publish Post"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/articles/news")}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
              >
                Cancel Post
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CreateArticles