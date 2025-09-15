"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Edit, Trash2, ArrowLeft, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { GetFileRegion, getAllFiles, deleteFileByTitle } from "../../../services/operations/filesAPI"
import toast from "react-hot-toast"

const FilterFile = () => {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])
  const [category1Options, setCategory1Options] = useState([])
  const [category2Options, setCategory2Options] = useState([])
  const [category3Options, setCategory3Options] = useState([])
  const [category4Options, setCategory4Options] = useState([])
  const [category5Options, setCategory5Options] = useState([])

  const [formData, setFormData] = useState({
    region: "",
    regionId: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    status: "",
  })

  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [filterValues, setFilterValues] = useState({
    region: "",
    regionId: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    status: "",
  })

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await GetFileRegion()
        const data = response?.data || []
        console.log("Region data:", data)
        setRegions(data)

         setRegionOptions(data.map(region => ({
          name: region.name,     
           id: region._id         
          })))


      } catch (error) {
        console.error("Failed to fetch file region data:", error)
        toast.error("Failed to load region data")
      }
    }
    fetchOptions()
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

  // Update category options when region changes
  useEffect(() => {
    if (formData.regionId) {
      const selectedRegion = regions.find(r => r._id === formData.regionId)
      if (selectedRegion) {
        // Reset all categories when region changes
        setFormData(prev => ({
          ...prev,
          category1: "",
          category2: "",
          category3: "",
          category4: "",
          category5: ""
        }))

        // Set category1 options
        const cat1Options = selectedRegion.category1?.map(cat => cat.name) || []
        setCategory1Options(cat1Options)
        setCategory2Options([])
        setCategory3Options([])
        setCategory4Options([])
        setCategory5Options([])
      }
    }
  }, [formData.regionId, regions])

  // Update category2 options when category1 changes
  useEffect(() => {
    if (formData.regionId && formData.category1) {
      const selectedRegion = regions.find(r => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find(cat => cat.name === formData.category1)
        const cat2Options = selectedCat1?.category2?.map(cat => cat.name) || []
        setCategory2Options(cat2Options)
        setCategory3Options([])
        setCategory4Options([])
        setCategory5Options([])
      }
    }
  }, [formData.category1, formData.regionId, regions])

  // Update category3 options when category2 changes
  useEffect(() => {
    if (formData.regionId && formData.category1 && formData.category2) {
      const selectedRegion = regions.find(r => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find(cat => cat.name === formData.category1)
        const selectedCat2 = selectedCat1?.category2?.find(cat => cat.name === formData.category2)
        const cat3Options = selectedCat2?.category3?.map(cat => cat.name) || []
        setCategory3Options(cat3Options)
        setCategory4Options([])
        setCategory5Options([])
      }
    }
  }, [formData.category2, formData.category1, formData.regionId, regions])

  // Update category4 options when category3 changes
  useEffect(() => {
    if (formData.regionId && formData.category1 && formData.category2 && formData.category3) {
      const selectedRegion = regions.find(r => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find(cat => cat.name === formData.category1)
        const selectedCat2 = selectedCat1?.category2?.find(cat => cat.name === formData.category2)
        const selectedCat3 = selectedCat2?.category3?.find(cat => cat.name === formData.category3)
        const cat4Options = selectedCat3?.category4?.map(cat => cat.name) || []
        setCategory4Options(cat4Options)
        setCategory5Options([])
      }
    }
  }, [formData.category3, formData.category2, formData.category1, formData.regionId, regions])

  // Update category5 options when category4 changes
  useEffect(() => {
    if (formData.regionId && formData.category1 && formData.category2 && formData.category3 && formData.category4) {
      const selectedRegion = regions.find(r => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find(cat => cat.name === formData.category1)
        const selectedCat2 = selectedCat1?.category2?.find(cat => cat.name === formData.category2)
        const selectedCat3 = selectedCat2?.category3?.find(cat => cat.name === formData.category3)
        const selectedCat4 = selectedCat3?.category4?.find(cat => cat.name === formData.category4)
        const cat5Options = selectedCat4?.category5?.map(cat => cat.name) || []
        setCategory5Options(cat5Options)
      }
    }
  }, [formData.category4, formData.category3, formData.category2, formData.category1, formData.regionId, regions])

  useEffect(() => {
  const fetchFiles = async () => {
    try {
      const response = await getAllFiles()
      const filteredFiles = (response?.data || []).filter(file => file.role !== "user")
      setFiles(filteredFiles)
    } catch (error) {
      console.error("Error fetching files:", error)
    }
  }

  fetchFiles()
}, [])

  const handleInputChange = (e) => {
  const { name, value } = e.target

  if (name === "region") {
    const selectedOption = regionOptions.find(opt => opt.id === value)
    setFormData(prev => ({
      ...prev,
      region: selectedOption?.name || "",
      regionId: selectedOption?.id || "",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: ""
    }))
    setFilterValues(prev => ({
      ...prev,
      region: selectedOption?.name || "",
      regionId: selectedOption?.id || "",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: ""
    }))
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setFilterValues(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: "",
    }))
  }
}


  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesRegion = !filterValues.region || 
        (file.region === filterValues.region && file.regionId === filterValues.regionId)
      const matchesCategory1 = !filterValues.category1 || file.category1.includes(filterValues.category1)
      const matchesCategory2 = !filterValues.category2 || file.category2.includes(filterValues.category2)
      const matchesCategory3 = !filterValues.category3 || file.category3.includes(filterValues.category3)
      const matchesCategory4 =
        !filterValues.category4 || (file.category4 && file.category4.includes(filterValues.category4))
      const matchesCategory5 =
        !filterValues.category5 || (file.category5 && file.category5.includes(filterValues.category5))
      const matchesStatus = !filterValues.status || file.status === filterValues.status

      return (
        matchesRegion &&
        matchesCategory1 &&
        matchesCategory2 &&
        matchesCategory3 &&
        matchesCategory4 &&
        matchesCategory5 &&
        matchesStatus
      )
    })
  }, [files, filterValues])

  const handleEdit = (file) => {
    const selectedRegion = regionOptions.find(opt => opt.name === file.region)
    setFormData({
      region: file.region,
      regionId: selectedRegion?.id || "",
      category1: file.category1,
      category2: file.category2,
      category3: file.category3,
      category4: file.category4 || "",
      category5: file.category5 || "",
      status: file.status || "",
    })
    setFilterValues({
      region: file.region,
      regionId: selectedRegion?.id || "",
      category1: file.category1,
      category2: file.category2,
      category3: file.category3,
      category4: file.category4 || "",
      category5: file.category5 || "",
      status: file.status || "",
    })
    setErrors({})
  }

  const handleDelete = async (fileTitle) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this file?")
      if (!confirm) return
      await deleteFileByTitle(fileTitle)
      setFiles((prev) => prev.filter((file) => file.fileTitle !== fileTitle))
      toast.success(`Deleted File successfully!`)
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast.error(`Failed to delete File. Please try again.`)
    }
  }

  const clearFilters = () => {
    setFormData({
      region: "",
      regionId: "",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
      status: "",
    })
    setFilterValues({
      region: "",
      regionId: "",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
      status: "",
    })
    setErrors({})
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Waiting for Approval":
        return "bg-yellow-100 text-yellow-800"
      case "Approved File":
        return "bg-green-100 text-green-800"
      case "Rejected File":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
  

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4 sm:p-6 lg:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
        {/* Main Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">File Management</h1>
                <p className="text-green-100 text-sm sm:text-base">Manage files by region and categories</p>
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
              <h2 className="text-xl font-bold text-gray-800">Add/Filter Files</h2>
              {(filterValues.region ||
                filterValues.category1 ||
                filterValues.category2 ||
                filterValues.category3 ||
                filterValues.category4 ||
                filterValues.category5 ||
                filterValues.status) && (
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
                {/* Status Field */}
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="Waiting for Approval">Waiting for Approval</option>
                    <option value="Approved File">Approved File</option>
                    <option value="Rejected File">Rejected File</option>
                  </select>
                </div>
                {/* Region Field */}
                <div className="space-y-2">
                  <label htmlFor="region" className="block text-sm font-semibold text-gray-700">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                      errors.region
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 focus:border-green-500 bg-white"
                    }`}
                  >
                    <option value="">Select Region</option>
                    {regionOptions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.region}
                    </motion.p>
                  )}
                </div>
                {/* Category 1 Field */}
                <div className="space-y-2">
                  <label htmlFor="category1" className="block text-sm font-semibold text-gray-700">
                    Category 1 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category1"
                    name="category1"
                    value={formData.category1}
                    onChange={handleInputChange}
                    disabled={!formData.regionId}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                      errors.category1
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 focus:border-green-500 bg-white"
                    } ${!formData.regionId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select Category 1</option>
                    {category1Options.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category1 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.category1}
                    </motion.p>
                  )}
                </div>
                {/* Category 2 Field */}
                <div className="space-y-2">
                  <label htmlFor="category2" className="block text-sm font-semibold text-gray-700">
                    Category 2 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category2"
                    name="category2"
                    value={formData.category2}
                    onChange={handleInputChange}
                    disabled={!formData.category1}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                      errors.category2
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 focus:border-green-500 bg-white"
                    } ${!formData.category1 ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select Category 2</option>
                    {category2Options.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category2 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.category2}
                    </motion.p>
                  )}
                </div>
                {/* Category 3 Field */}
                <div className="space-y-2">
                  <label htmlFor="category3" className="block text-sm font-semibold text-gray-700">
                    Category 3 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category3"
                    name="category3"
                    value={formData.category3}
                    onChange={handleInputChange}
                    disabled={!formData.category2}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                      errors.category3
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 focus:border-green-500 bg-white"
                    } ${!formData.category2 ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select Category 3</option>
                    {category3Options.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category3 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.category3}
                    </motion.p>
                  )}
                </div>
                {/* Category 4 Field (Optional) */}
                <div className="space-y-2">
                  <label htmlFor="category4" className="block text-sm font-semibold text-gray-700">
                    Category 4 (Optional)
                  </label>
                  <select
                    id="category4"
                    name="category4"
                    value={formData.category4}
                    onChange={handleInputChange}
                    disabled={!formData.category3}
                    className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 ${
                      !formData.category3 ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  >
                    <option value="">Select Category 4 (Optional)</option>
                    {category4Options.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Category 5 Field (Optional) */}
                <div className="space-y-2">
                  <label htmlFor="category5" className="block text-sm font-semibold text-gray-700">
                    Category 5 (Optional)
                  </label>
                  <select
                    id="category5"
                    name="category5"
                    value={formData.category5}
                    onChange={handleInputChange}
                    disabled={!formData.category4}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                      !formData.category4 ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    } border-gray-200 hover:border-gray-300 focus:border-green-500`}
                  >
                    <option value="">Select Category 5 (Optional)</option>
                    {category5Options.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* File List */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                File List ({filteredFiles.length})
                {filteredFiles.length !== files.length && (
                  <span className="text-sm font-normal text-gray-500 ml-2">(filtered from {files.length})</span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-gray-500">
                <Search className="w-4 h-4" />
                <span className="text-sm">Live filtering active</span>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="min-w-full rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category 1
                      </th>
                      <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category 2
                      </th>
                      <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category 3
                      </th>
                      <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="w-[12%] px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredFiles.map((file, index) => (
                        <motion.tr
                          key={file._id || file.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900">
                            {file.region || "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">{file.category1 || "—"}</td>
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">{file.category2 || "—"}</td>
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">{file.category3 || "—"}</td>
                          <td className="px-4 py-3 whitespace-normal">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}
                            >
                              {file.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-normal text-sm text-gray-700 break-words">
                            {file.fileTitle}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/view-file/${file._id || file.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View File"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  handleEdit(file)
                                  navigate(`/edit-file/${file._id || file.id}`)
                                }}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                title="Edit File"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(file.fileTitle)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete File"
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
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file._id || file.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{file.fileTitle}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)} shrink-0`}
                        >
                          {file.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-700">
                          <div className="font-medium">Region:</div>
                          <div>{file.region}</div>
                        </div>
                        <div className="text-gray-700">
                          <div className="font-medium">Category 1:</div>
                          <div>{file.category1}</div>
                        </div>
                        <div className="text-gray-700">
                          <div className="font-medium">Category 2:</div>
                          <div>{file.category2}</div>
                        </div>
                        <div className="text-gray-700">
                          <div className="font-medium">Category 3:</div>
                          <div>{file.category3}</div>
                        </div>
                        {file.category4 && (
                          <div className="text-gray-700">
                            <div className="font-medium">Category 4:</div>
                            <div>{file.category4}</div>
                          </div>
                        )}
                        {file.category5 && (
                          <div className="text-gray-700">
                            <div className="font-medium">Category 5:</div>
                            <div>{file.category5}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/view-file/${file._id || file.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            handleEdit(file)
                            navigate(`/edit-file/${file._id || file.id}`)
                          }}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(file.fileTitle)}
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

            {filteredFiles.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-600">
                  {files.length === 0 ? "Add your first file to get started." : "Try adjusting your filter criteria."}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FilterFile 