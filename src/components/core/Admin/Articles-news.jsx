"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, Trash2, ArrowLeft, Search, Filter, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { getAllArticles, getAllRegionsWithStructure, deleteArticleByTitle } from "../../../services/operations/articelsAPI"

const ArticlesNews = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    status: "All Posts",
    date: "",
    region: "",
    category: "",
    subCategory: "",
  })
  const [articles, setArticles] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [filterValues, setFilterValues] = useState({
    status: "All Posts",
    date: "",
    region: "",
    category: "",
    subCategory: "",
  })

  const [regionsData, setRegionsData] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getAllArticles()
        if (response.success) {
          setArticles(response.data)
        } else {
          console.error("Failed to fetch Posts:", response.message)
        }
      } catch (error) {
        console.error("Error fetching Posts:", error)
      }
    }

    fetchArticles()
  }, [])

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

  //back to the dashboard
  useEffect(() => {
  const handleBackButton = (event) => {
    event.preventDefault();
    navigate("/dashboard", { replace: true }); 
  };

  window.addEventListener("popstate", handleBackButton);

  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
}, [navigate]);

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
    setFormData(prev => ({
      ...prev,
      region: region?.name || "",
      category: "",
      subCategory: ""
    }))
    setFilterValues(prev => ({
      ...prev,
      region: region?.name || "",
      category: "",
      subCategory: ""
    }))
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    if (!selectedRegion) return
    
    const category = selectedRegion.category.find(cat => cat._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
    setFormData(prev => ({
      ...prev,
      category: category?.name || "",
      subCategory: ""
    }))
    setFilterValues(prev => ({
      ...prev,
      category: category?.name || "",
      subCategory: ""
    }))
  }

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value
    if (!selectedRegion || !selectedCategory) return
    
    const subcategory = selectedCategory.subCategory.find(sub => sub._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
    setFormData(prev => ({
      ...prev,
      subCategory: subcategory?.name || ""
    }))
    setFilterValues(prev => ({
      ...prev,
      subCategory: subcategory?.name || ""
    }))
  }

  const formatStatus = (status) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "Waiting for Approval"
      case "approved":
        return "Approved Post"
      case "rejected":
        return "Rejected Post"
      default:
        return status
    }
  }

  // Filter articles based on form input values
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const displayStatus = formatStatus(article.status)
      const matchesStatus =
        filterValues.status === "All Posts" || displayStatus === filterValues.status

      const matchesDate =
        !filterValues.date || 
        new Date(article.date).toISOString().split('T')[0] === filterValues.date

      const matchesRegion =
        !filterValues.region ||
        (article.region?.toLowerCase() ?? "").includes(filterValues.region.toLowerCase())

      const matchesCategory =
        !filterValues.category ||
        (article.category?.toLowerCase() ?? "").includes(filterValues.category.toLowerCase())

      const matchesSubCategory =
        !filterValues.subCategory ||
        (article.subCategory?.toLowerCase() ?? "").includes(filterValues.subCategory.toLowerCase())

      return (
        matchesStatus &&
        matchesDate &&
        matchesRegion &&
        matchesCategory &&
        matchesSubCategory
      )
    })
  }, [articles, filterValues])

  const handleStatusChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEdit = (article) => {
    const region = regionsData.find(r => r.name === article.region)
    const category = region?.category.find(c => c.name === article.category)
    const subcategory = category?.subCategory.find(s => s.name === article.subCategory)
    
    setSelectedRegion(region || null)
    setSelectedCategory(category || null)
    setSelectedSubcategory(subcategory || null)
    
    setFormData({
      status: article.status,
      date: article.date,
      region: article.region,
      category: article.category,
      subCategory: article.subCategory,
    })
    
    setFilterValues({
      status: article.status,
      date: article.date,
      region: article.region,
      category: article.category,
      subCategory: article.subCategory,
    })
    setEditingId(article._id)
    setErrors({})
    navigate(`/edit-articles/${article._id}`)
  }

  const handleDelete = async (title) => {
    const trimmedTitle = title.trim();
    const confirmDelete = window.confirm(`Are you sure you want to delete this Post "${title}"?`);
    if (!confirmDelete) return;
    
    try {
      await deleteArticleByTitle(title);
      setArticles((prev) => prev.filter((article) => article.title.trim() !== trimmedTitle));
      toast.success("Post deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete Post.");
      console.error("Error deleting Post:", error);
    }
  };

  const clearFilters = () => {
    setFormData({ status: "All Posts", date: "", region: "", category: "", subCategory: "" })
    setFilterValues({ status: "All Posts", date: "", region: "", category: "", subCategory: "" })
    setSelectedRegion(null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setEditingId(null)
    setErrors({})
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved Post":
        return "bg-green-100 text-green-800"
      case "Waiting for Approval":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected Post":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 p-4 sm:p-6 lg:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
        {/* Main Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Posts</h1>
                <p className="text-purple-100 text-sm sm:text-base">Manage your posts and news content</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </motion.button>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Add/Filter Posts</h2>
              {(filterValues.status !== "All Articles" || filterValues.date || filterValues.region || filterValues.category || filterValues.subCategory) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </motion.button>
              )}
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Status Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleStatusChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200"
                  >
                    <option value="All Posts">All Posts</option>
                    <option value="Waiting for Approval">Waiting for Approval</option>
                    <option value="Approved Post">Approved Post</option>
                    <option value="Rejected Post">Rejected Post</option>
                  </select>
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200"
                  />
                </div>

                {/* Region Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="region" className="block text-sm font-semibold text-gray-700">
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={selectedRegion?._id || ""}
                    onChange={handleRegionChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200"
                  >
                    <option value="">Select Region</option>
                    {regionsData.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={selectedCategory?._id || ""}
                    onChange={handleCategoryChange}
                    disabled={!selectedRegion}
                    className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200 ${
                      !selectedRegion ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select Category</option>
                    {selectedRegion &&
                      getCategoriesForRegion(selectedRegion._id).map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Subcategory Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="subCategory" className="block text-sm font-semibold text-gray-700">
                    Subcategory
                  </label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={selectedSubcategory?._id || ""}
                    onChange={handleSubcategoryChange}
                    disabled={!selectedCategory}
                    className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all duration-200 ${
                      !selectedCategory ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select Subcategory</option>
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
            </form>
          </div>

          {/* Articles List */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Posts List ({filteredArticles.length})
                {filteredArticles.length !== articles.length && (
                  <span className="text-sm font-normal text-gray-500 ml-2">(filtered from {articles.length})</span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-gray-500">
                <Search className="w-4 h-4" />
                <span className="text-sm">Manage your content</span>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="min-w-full rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Subcategory
                      </th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="w-[20%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredArticles.map((article, index) => (
                        <motion.tr
                          key={article._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">
                            {new Date(article.date).toISOString().split("T")[0]}
                          </td>
                          <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900">
                            {article.region || "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">
                            {article.category || "_"}
                          </td>
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">
                            {article.subCategory || "_"}
                          </td>
                          <td className="px-4 py-3 whitespace-normal">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formatStatus(article.status))}`}>
                              {formatStatus(article.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700 break-words">
                            {article.title}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/approve-articles/${article._id}`)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                title="View article"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(article)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Edit article"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(article.title)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              <AnimatePresence>
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(formatStatus(article.status))} shrink-0`}>
                          {formatStatus(article.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-700">
                          <div className="font-medium">Region:</div>
                          <div>{article.region}</div>
                        </div>
                        <div className="text-gray-700">
                          <div className="font-medium">Category:</div>
                          <div>{article.category}</div>
                        </div>
                        <div className="text-gray-700">
                          <div className="font-medium">Subcategory:</div>
                          <div>{article.subCategory}</div>
                        </div>
                        <div className="text-gray-700">
                          <div className="font-medium">Date:</div>
                          <div>{new Date(article.date).toISOString().split("T")[0]}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-1 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/approve-articles/${article._id}`)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(article)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(article.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredArticles.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts found</h3>
                <p className="text-gray-600">
                  {articles.length === 0
                    ? "Add your first article to get started."
                    : "Try adjusting your filter criteria."}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ArticlesNews