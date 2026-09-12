"use client"

import { useState, useMemo, useEffect } from "react"
import { Edit, Trash2, ArrowLeft, Search, Filter, Eye, Plus, RefreshCw, Sparkles } from "lucide-react"
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

  const fetchArticles = async () => {
    try {
      const response = await getAllArticles()
      if (response?.success) {
        setArticles(response.data || [])
      } else {
        console.error("Failed to fetch Posts:", response?.message)
      }
    } catch (error) {
      console.error("Error fetching Posts:", error)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getAllRegionsWithStructure()
        setRegionsData(data?.regions || data || [])
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
    setFormData((prev) => ({
      ...prev,
      region: region?.name || "",
      category: "",
      subCategory: "",
    }))
    setFilterValues((prev) => ({
      ...prev,
      region: region?.name || "",
      category: "",
      subCategory: "",
    }))
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    if (!selectedRegion) return

    const category = selectedRegion.category.find((cat) => cat._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
    setFormData((prev) => ({
      ...prev,
      category: category?.name || "",
      subCategory: "",
    }))
    setFilterValues((prev) => ({
      ...prev,
      category: category?.name || "",
      subCategory: "",
    }))
  }

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value
    if (!selectedRegion || !selectedCategory) return

    const subcategory = selectedCategory.subCategory.find((sub) => sub._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
    setFormData((prev) => ({
      ...prev,
      subCategory: subcategory?.name || "",
    }))
    setFilterValues((prev) => ({
      ...prev,
      subCategory: subcategory?.name || "",
    }))
  }

  const formatStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "Waiting for Approval"
      case "approved":
        return "Approved Post"
      case "rejected":
        return "Rejected Post"
      default:
        return status || "Unknown"
    }
  }

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const displayStatus = formatStatus(article.status)
      const matchesStatus =
        filterValues.status === "All Posts" || displayStatus === filterValues.status

      const matchesDate =
        !filterValues.date ||
        (article.date && new Date(article.date).toISOString().split("T")[0] === filterValues.date)

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
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFilterValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFilterValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleDelete = async (title) => {
    const trimmedTitle = title.trim()
    const confirmDelete = window.confirm(`Are you sure you want to delete post "${title}"?`)
    if (!confirmDelete) return

    try {
      await deleteArticleByTitle(title)
      setArticles((prev) => prev.filter((article) => article.title.trim() !== trimmedTitle))
      toast.success("Post deleted successfully.")
    } catch (error) {
      toast.error("Failed to delete Post.")
      console.error("Error deleting Post:", error)
    }
  }

  const clearFilters = () => {
    setFormData({ status: "All Posts", date: "", region: "", category: "", subCategory: "" })
    setFilterValues({ status: "All Posts", date: "", region: "", category: "", subCategory: "" })
    setSelectedRegion(null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const getStatusBadge = (status) => {
    const formatted = formatStatus(status)
    switch (formatted) {
      case "Approved Post":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
            ● Approved
          </span>
        )
      case "Waiting for Approval":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fff4c4] text-[#746019] border border-[#fde89c]">
            ⏳ In Review
          </span>
        )
      case "Rejected Post":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fbd4d4] text-[#600000] border border-[#f9a9a9]">
            ✕ Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {formatted}
          </span>
        )
    }
  }

  const hasActiveFilters =
    filterValues.status !== "All Posts" ||
    filterValues.date ||
    filterValues.region ||
    filterValues.category ||
    filterValues.subCategory

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
              <span>Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              POSTS REPOSITORY
            </span>
          </div>
          <button
            onClick={() => navigate("/create-articles")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Posts
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Manage your posts and news content across all regional channels
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#4262ff]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Filter Posts</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffe6cd] text-[#7c3a00] border border-[#fcd0a1] text-xs font-bold hover:bg-[#fcd0a1] transition-colors"
              >
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Status (Yellow Accent) */}
            <div className="space-y-1 p-2.5 rounded-xl bg-[#fff8e0]/40 border border-[#fde89c]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full h-10 px-2.5 bg-white border border-[#fde89c] rounded-lg text-sm text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#ffd02f]"
              >
                <option value="All Posts">All Posts</option>
                <option value="Waiting for Approval">Waiting for Approval</option>
                <option value="Approved Post">Approved Post</option>
                <option value="Rejected Post">Rejected Post</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1 p-2.5 rounded-xl bg-[#fafbfc] border border-[#e0e2e8]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleDateChange}
                className="w-full h-10 px-2.5 bg-white border border-[#c7cad5] rounded-lg text-sm text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff]"
              />
            </div>

            {/* Region (Blue Accent) */}
            <div className="space-y-1 p-2.5 rounded-xl bg-[#f5f3ff]/50 border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">Region</label>
              <select
                value={selectedRegion?._id || ""}
                onChange={handleRegionChange}
                className="w-full h-10 px-2.5 bg-white border border-[#ddd6fe] rounded-lg text-sm text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff]"
              >
                <option value="">All Regions</option>
                {regionsData.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category (Teal Accent) */}
            <div className="space-y-1 p-2.5 rounded-xl bg-[#c3faf5]/30 border border-[#9eece4]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">Category</label>
              <select
                value={selectedCategory?._id || ""}
                onChange={handleCategoryChange}
                disabled={!selectedRegion}
                className={`w-full h-10 px-2.5 bg-white border border-[#9eece4] rounded-lg text-sm text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#0fbcb0] ${
                  !selectedRegion ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Categories</option>
                {selectedRegion &&
                  getCategoriesForRegion(selectedRegion._id).map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Subcategory (Rose Accent) */}
            <div className="space-y-1 p-2.5 rounded-xl bg-[#ffd8f4]/25 border border-[#f3bee5]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">Subcategory</label>
              <select
                value={selectedSubcategory?._id || ""}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                className={`w-full h-10 px-2.5 bg-white border border-[#f3bee5] rounded-lg text-sm text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#86296b] ${
                  !selectedCategory ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Subcategories</option>
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

        {/* Posts List Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                Posts List
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#ffd02f] text-[#1c1c1e]">
                {filteredArticles.length}
              </span>
              {filteredArticles.length !== articles.length && (
                <span className="text-xs text-[#555a6a]">
                  (filtered from {articles.length})
                </span>
              )}
            </div>
            <button
              onClick={fetchArticles}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#555a6a] hover:text-[#1c1c1e] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh list</span>
            </button>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-[#fff8e0] rounded-full flex items-center justify-center mx-auto text-[#746019]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1c1c1e]">No Posts found</h3>
              <p className="text-xs sm:text-sm text-[#555a6a]">
                {articles.length === 0 ? "Add your first article to get started." : "Try adjusting your filter criteria."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full table-fixed text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fafbfc] border-b border-[#e0e2e8] text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      <th className="w-[10%] px-4 py-3">Date</th>
                      <th className="w-[15%] px-4 py-3">Region</th>
                      <th className="w-[15%] px-4 py-3">Category</th>
                      <th className="w-[15%] px-4 py-3">Subcategory</th>
                      <th className="w-[16%] px-4 py-3">Status</th>
                      <th className="w-[18%] px-4 py-3">Title</th>
                      <th className="w-[11%] px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f2f5] text-sm">
                    {filteredArticles.map((article) => (
                      <tr key={article._id} className="hover:bg-[#f7f8fa] transition-colors">
                        <td className="px-4 py-3 text-xs text-[#555a6a] whitespace-nowrap">
                          {article.date ? new Date(article.date).toISOString().split("T")[0] : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1c1c1e] truncate">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#fff8e0] text-[#746019] border border-[#fde89c] text-xs font-bold truncate max-w-full">
                            {article.region || "Global"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#555a6a] truncate">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#c3faf5] text-[#187574] border border-[#9eece4] text-xs font-bold truncate max-w-full">
                            {article.category || "General"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#555a6a] truncate">
                          {article.subCategory ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5] text-xs font-bold truncate max-w-full">
                              {article.subCategory}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(article.status)}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#1c1c1e] truncate" title={article.title}>
                          {article.title}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => navigate(`/approve-articles/${article._id}`)}
                              className="p-1.5 rounded-full bg-[#f5f3ff] text-[#4262ff] hover:bg-[#4262ff] hover:text-white transition-all shadow-xs"
                              title="Review / View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/edit-articles/${article._id}`)}
                              className="p-1.5 rounded-full bg-[#c3faf5] text-[#187574] hover:bg-[#0fbcb0] hover:text-white transition-all shadow-xs"
                              title="Edit Post"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(article.title)}
                              className="p-1.5 rounded-full bg-[#fbd4d4] text-[#600000] hover:bg-red-600 hover:text-white transition-all shadow-xs"
                              title="Delete Post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {filteredArticles.map((article) => (
                  <div
                    key={article._id}
                    className="bg-white border border-[#e0e2e8] rounded-xl p-4 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-[#1c1c1e] line-clamp-2">{article.title}</h3>
                      <div className="shrink-0">{getStatusBadge(article.status)}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                      <span className="px-2 py-0.5 rounded bg-[#fff8e0] text-[#746019] font-bold border border-[#fde89c]">
                        {article.region || "Global"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#c3faf5] text-[#187574] font-bold border border-[#9eece4]">
                        {article.category || "General"}
                      </span>
                      {article.subCategory && (
                        <span className="px-2 py-0.5 rounded bg-[#ffd8f4] text-[#86296b] font-bold border border-[#f3bee5]">
                          {article.subCategory}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f0f2f5]">
                      <span className="text-xs text-[#555a6a]">
                        {article.date ? new Date(article.date).toISOString().split("T")[0] : ""}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/approve-articles/${article._id}`)}
                          className="px-3 py-1 rounded-full bg-[#f5f3ff] text-[#4262ff] text-xs font-bold border border-[#ddd6fe]"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => navigate(`/edit-articles/${article._id}`)}
                          className="px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574] text-xs font-bold border border-[#9eece4]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article.title)}
                          className="p-1 rounded-full text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticlesNews