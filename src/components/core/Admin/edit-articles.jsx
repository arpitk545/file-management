"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Plus, X, ImageIcon, FileText, MapPin, Trash2, Save, ToggleLeft, ToggleRight } from "lucide-react"
import { getArticleById, updateArticle, deleteArticle, getAllRegionsWithStructure } from "../../../services/operations/articelsAPI"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import ArticlesEditor from "../Admin/Articles/articles-editor"

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
    status: "draft"
  })
  
  const [imageBlocks, setImageBlocks] = useState([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tagInput, setTagInput] = useState("")

  // Load regions data
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

  // Load article data
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

        // Set region, category, subcategory from existing data
        if (articleData.region) {
          const regionObj = regions.find(r => r._id === articleData.region || r.name === articleData.region)
          if (regionObj) {
            setSelectedRegion(regionObj)
            
            if (articleData.category) {
              const categoryObj = regionObj.category?.find(c => 
                c._id === articleData.category || c.name === articleData.category
              )
              if (categoryObj) {
                setSelectedCategory(categoryObj)
                
                if (articleData.subCategory) {
                  const subcategoryObj = categoryObj.subCategory?.find(sc => 
                    sc._id === articleData.subCategory || sc.name === articleData.subCategory
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
          status: articleData.status || "draft"
        })

        // Set image blocks
        const initialImageBlocks = articleData.images?.map((img, index) => ({
          id: Date.now() + index,
          image: img
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

  const handleRegionChange = (regionId) => {
    const region = regions.find(r => r._id === regionId)
    setSelectedRegion(region || null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleCategoryChange = (categoryId) => {
    if (!selectedRegion) return
    const category = selectedRegion.category?.find(c => c._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
  }

  const handleSubcategoryChange = (subcategoryId) => {
    if (!selectedCategory) return
    const subcategory = selectedCategory.subCategory?.find(sc => sc._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
  }

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !article.tags.includes(tagInput.trim())) {
      setArticle({
        ...article,
        tags: [...article.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setArticle({
      ...article,
      tags: article.tags.filter(tag => tag !== tagToRemove),
    })
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  // Image management
  const addImageBlock = () => {
    const newBlock = {
      id: Date.now(),
      image: null,
    }
    setImageBlocks([...imageBlocks, newBlock])
  }

  const removeImageBlock = (id) => {
    setImageBlocks(imageBlocks.filter(block => block.id !== id))
  }

  const handleFileUpload = (file, blockId = null) => {
    if (blockId) {
      setImageBlocks(imageBlocks.map(block => 
        block.id === blockId ? { ...block, image: file } : block
      ))
    } else {
      setArticle({ ...article, thumbnail: file })
    }
  }

  // Toggles
  const toggleComments = () => {
    setArticle({
      ...article,
      commentsEnabled: !article.commentsEnabled
    })
  }

  const handleStatusChange = (e) => {
    setArticle({
      ...article,
      status: e.target.value
    })
  }

  // Form submission
  const handleUpdate = async () => {
    if (!selectedRegion || !selectedCategory || !selectedSubcategory || !article.title) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("id", id)
      formData.append("region", selectedRegion.name)
      formData.append("category", selectedCategory.name)
      formData.append("subCategory", selectedSubcategory.name)
      formData.append("title", article.title)
      formData.append("tags", article.tags.join(","))
      formData.append("content", article.content)
      formData.append("status", article.status)
      formData.append("commentsEnabled", article.commentsEnabled)

      if (article.thumbnail && typeof article.thumbnail !== 'string') {
        formData.append("thumbnail", article.thumbnail)
      }

      imageBlocks
        .filter(block => block.image && typeof block.image !== 'string')
        .forEach(block => {
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
    if (!window.confirm("Are you sure you want to delete this Post?")) return

    setIsDeleting(true)
    try {
      const response = await deleteArticle(id)
      if (response.success) {
        toast.success("Post deleted successfully!")
        navigate("/articles/news")
      } else {
        throw new Error(response.message || "Failed to deletePost")
      }
    } catch (error) {
      console.error("Error deleting Post:", error)
      toast.error(error.message || "An error occurred while deleting the Post")
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Post...</p>
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
            Edit Article
          </h1>
          <p className="text-gray-600 text-lg">Update your Post content</p>
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
            {/* Region Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Region</label>
              <select
                value={selectedRegion?._id || ""}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
              <select
                value={selectedCategory?._id || ""}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={!selectedRegion}
                className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:bg-gray-100"
              >
                <option value="">Select Category</option>
                {selectedRegion?.category?.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Subcategory</label>
              <select
                value={selectedSubcategory?._id || ""}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!selectedCategory}
                className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:bg-gray-100"
              >
                <option value="">Select Subcategory</option>
                {selectedCategory?.subCategory?.map(subcategory => (
                  <option key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
        
        {/* Edit Article Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Post</h2>
          </div>

          <div className="grid gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Post Title</label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                placeholder="Enter your Post title"
                className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Post Thumbnail</label>
              <FileUploadArea onFileSelect={handleFileUpload} placeholder="Upload thumbnail image" />
              {article.thumbnail && (
                <div className="mt-3">
                  <img
                    src={
                      typeof article.thumbnail === 'string'
                        ? article.thumbnail
                        : URL.createObjectURL(article.thumbnail)
                    }
                    alt="Thumbnail Preview"
                    className="w-full max-w-xs rounded-xl border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Status and Comments Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                <select
                  value={article.status}
                  onChange={handleStatusChange}
                  className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Comments</label>
                <div className="flex items-center gap-4 h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl">
                  <button
                    type="button"
                    onClick={toggleComments}
                    className="flex items-center gap-2"
                  >
                    {article.commentsEnabled ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-700">
                      {article.commentsEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tags with Multiple Selection */}
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

              {/* Display Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
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

            {/* Rich Text Editor for Article Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Article Content</label>
              <ArticlesEditor
                content={article.content}
                onChange={(content) => setArticle({ ...article, content })}
                placeholder="Write your Post content here..."
              />
            </div>

            {/* Dynamic Content Parts - Keep for backward compatibility */}
            {/* <div className="space-y-4">
              {contentParts.map((part, index) => (
                <div key={part.id} className="relative">
                  {part.type === "text" ? (
                    <div className="relative">
                      <textarea
                        value={part}
                        onChange={(e) => updateContentPart(part.id, e.target.value)}
                        placeholder="Additional text content..."
                        rows={4}
                        className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 resize-none"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => addContentPart("image", part.id)}
                          className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                          title="Add image below"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        {contentParts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContentPart(part.id)}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                            title="Delete this section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Image {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeContentPart(part.id)}
                          className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                      <FileUploadArea
                        onFileSelect={handleContentImageUpload}
                        placeholder="Upload content image"
                        partId={part.id}
                      />
                      {part.content && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-sm text-green-700 font-medium">
                            {typeof part.content === 'string' 
                              ? `✓ Image uploaded` 
                              : `✓ ${part.content.name}`}
                          </p>
                        </div>
                      )}
                      <div className="mt-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => addContentPart("text", part.id)}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200"
                        >
                          Add text below
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div> */}

            {/* Add Images Section - Below Content */}
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

            {/* Additional Image Upload Section */}
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
                            <div className="mt-3">
                              <img
                                src={
                                  typeof block.image === 'string'
                                    ? block.image
                                    : URL.createObjectURL(block.image)
                                }
                                alt={`Additional Image ${index + 1}`}
                                className="w-full max-w-xs rounded-xl border border-gray-300"
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

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Save className="w-5 h-5" />
                Update Post
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-2xl hover:from-gray-600 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isDeleting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                Delete Post
              </div>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default EditArticles