"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit, Trash2, Filter, ArrowLeft, Plus, List, CheckCircle, Ban, Upload, FileEdit, PenTool, X } from "lucide-react";
import { getAllQandARegions, getAllQandA, deleteQandA, updateQandA } from "../../../../services/operations/qandA";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    deactivate: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-slate-100 text-slate-800"}`}
    >
      {status}
    </span>
  );
};

// Modal Component for changing chapter name
const ChangeChapterModal = ({ isOpen, onClose, qanda, onUpdate }) => {
  const [chapterName, setChapterName] = useState(qanda?.chapterName || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (qanda) {
      setChapterName(qanda.chapterName || "");
    }
  }, [qanda]);

  const handleUpdate = async () => {
    if (!chapterName.trim()) {
      toast.error("Chapter name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await onUpdate(qanda._id, { chapterName: chapterName.trim() });
      toast.success("Chapter name updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update chapter name");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Change Chapter Name</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Previous Chapter Name:
            </label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
              {qanda?.chapterName || "No chapter name"}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              New Chapter Name:
            </label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new chapter name"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Chapter"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ViewQandA() {
  const navigate = useNavigate();
  const [qandas, setQandas] = useState([]);
  const [filteredQandas, setFilteredQandas] = useState([]);
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    status: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQanda, setSelectedQanda] = useState(null);

  const statuses = ["active", "deactivate"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch regions data
        const regionsResponse = await getAllQandARegions();
        setRegions(regionsResponse?.data || []);

        // Fetch Q&A data
        const qandaResponse = await getAllQandA();
        const allQandas = qandaResponse?.data || [];
        setQandas(allQandas);
        setFilteredQandas(allQandas);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load Q&A data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.region) {
      const region = regions.find((r) => r.name === formData.region);
      setSelectedRegion(region);
      setExamTypes(region?.examTypes?.map((t) => t.name) || []);
    } else {
      setExamTypes([]);
      setClasses([]);
      setSubjects([]);
    }
  }, [formData.region, regions]);

  useEffect(() => {
    if (formData.examType && selectedRegion) {
      const selectedExamType = selectedRegion.examTypes.find(
        (et) => et.name === formData.examType
      );
      const classList = selectedExamType?.specificClasses?.map((c) => c.name) || [];
      setClasses(classList);
    } else {
      setClasses([]);
      setSubjects([]);
    }
  }, [formData.examType, selectedRegion]);

  useEffect(() => {
    if (formData.examType && formData.specificClass && selectedRegion) {
      const selectedExamType = selectedRegion.examTypes.find(
        (et) => et.name === formData.examType
      );
      const selectedClass = selectedExamType?.specificClasses?.find(
        (cls) => cls.name === formData.specificClass
      );
      const subjectList = selectedClass?.subjects?.map((s) => s.name) || [];
      setSubjects(subjectList);
    } else {
      setSubjects([]);
    }
  }, [formData.examType, formData.specificClass, selectedRegion]);

  // Add useEffect to trigger filtering when formData changes
  useEffect(() => {
    filterQandas();
  }, [formData, qandas]);

  const filterQandas = () => {
    let filtered = [...qandas];

    if (formData.region) {
      filtered = filtered.filter((qanda) => 
        qanda.category?.region?.toLowerCase() === formData.region.toLowerCase()
      );
    }

    if (formData.examType) {
      filtered = filtered.filter((qanda) => 
        qanda.category?.examType?.toLowerCase() === formData.examType.toLowerCase()
      );
    }

    if (formData.specificClass) {
      filtered = filtered.filter((qanda) => 
        qanda.category?.specificClass?.toLowerCase() === formData.specificClass.toLowerCase()
      );
    }

    if (formData.subject) {
      filtered = filtered.filter((qanda) => 
        qanda.category?.subject?.toLowerCase() === formData.subject.toLowerCase()
      );
    }

    if (formData.chapter) {
      filtered = filtered.filter((qanda) => 
        qanda.chapterName?.toLowerCase() === formData.chapter.toLowerCase()
      );
    }

    if (formData.status) {
      filtered = filtered.filter((qanda) => 
        qanda.status?.toLowerCase() === formData.status.toLowerCase()
      );
    }

    setFilteredQandas(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "region" && { examType: "", specificClass: "", subject: "", chapter: "" }),
      ...(name === "examType" && { specificClass: "", subject: "", chapter: "" }),
      ...(name === "specificClass" && { subject: "", chapter: "" }),
      ...(name === "subject" && { chapter: "" }),
    }));
  };

  const handleAdd = (qanda) => {
    navigate(`/create-qanda/${qanda._id}`);
  };

  const handleView = (qanda) => {
    navigate(`/qanda-detail/${qanda._id}`);
  };

  const handleEdit = (qanda) => {
    navigate(`/edit-qanda/${qanda._id}`);
  };

  const handleChangeChapter = (qanda) => {
    setSelectedQanda(qanda);
    setModalOpen(true);
  };

  const handleUpdateChapter = async (id, data) => {
    try {
      await updateQandA(id, data);
      // Update local state
      setQandas(prev => prev.map(q => 
        q._id === id ? { ...q, chapterName: data.chapterName } : q
      ));
      // Reload window after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (qanda) => {
    if (!window.confirm("Are you sure you want to delete this Q&A?")) return;

    try {
      await deleteQandA(qanda._id);
      setQandas((qandas) => qandas.filter((q) => q._id !== qanda._id));
      window.location.reload();
      toast.success("Q&A deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete Q&A.");
    }
  };

  const handleStatusChange = async (qanda) => {
    const newStatus = qanda.status === "active" ? "deactivate" : "active";

    if (!window.confirm(`Are you sure you want to ${newStatus} this Q&A?`)) return;
    try {
      await updateQandA(qanda._id, { status: newStatus });

      setQandas((prev) =>
        prev.map((q) =>
          q._id === qanda._id ? { ...q, status: newStatus } : q
        )
      );
      window.location.reload();
      toast.success(`Q&A ${newStatus}d successfully!`);
    } catch (error) {
      console.error("Status change error:", error);
      toast.error("Failed to change Q&A status.");
    }
  };

  const clearFilters = () => {
    setFormData({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
      status: "",
    });
  };

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
  };

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
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 sm:p-6 lg:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
        {/* Main Card - Changed BG Color */}
        <motion.div
          variants={cardVariants}
          className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl shadow-xl border border-indigo-100 overflow-hidden"
        >
          {/* Header - Changed BG Color */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Q&A Management</h1>
                <p className="text-indigo-100 text-sm sm:text-base">View and manage all Q&As in your system</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </motion.button>
            </div>
          </div>

          {/* Form Section - Changed BG Color */}
          <div className="p-6 sm:p-8 border-b border-indigo-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Filter Q&As</h2>
              {(formData.region ||
                formData.examType ||
                formData.specificClass ||
                formData.subject ||
                formData.chapter ||
                formData.status) && (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition-all duration-200"
                  >
                    <option value="">All Status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter Field - Moved after Status */}
                <div className="space-y-2">
                  <label htmlFor="chapter" className="block text-sm font-semibold text-gray-700">
                    Chapter
                  </label>
                  <select
                    id="chapter"
                    name="chapter"
                    value={formData.chapter}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition-all duration-200"
                  >
                    <option value="">All Chapters</option>
                    {Array.from(new Set(qandas.map(q => q.chapterName).filter(Boolean))).map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region Field */}
                <div className="space-y-2">
                  <label htmlFor="region" className="block text-sm font-semibold text-gray-700">
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition-all duration-200"
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Type Field */}
                <div className="space-y-2">
                  <label htmlFor="examType" className="block text-sm font-semibold text-gray-700">
                    Exam Type
                  </label>
                  <select
                    id="examType"
                    name="examType"
                    value={formData.examType}
                    onChange={handleInputChange}
                    disabled={!formData.region}
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Types</option>
                    {examTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Field */}
                <div className="space-y-2">
                  <label htmlFor="specificClass" className="block text-sm font-semibold text-gray-700">
                    Class
                  </label>
                  <select
                    id="specificClass"
                    name="specificClass"
                    value={formData.specificClass}
                    onChange={handleInputChange}
                    disabled={!formData.examType}
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    disabled={!formData.specificClass}
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Q&A List - Changed BG Color */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Q&A List ({filteredQandas.length})
                {filteredQandas.length !== qandas.length && (
                  <span className="text-sm font-normal text-gray-500 ml-2">(filtered from {qandas.length})</span>
                )}
              </h2>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <span className="text-gray-600 text-lg">Loading Q&As...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table - Chapter column moved after Status */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          S.No
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Status
                        </th>
                        {/* <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Chapter
                        </th> */}
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Region
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Exam Type
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Class
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Subject
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Questions
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Date
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Uploader
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {filteredQandas.map((qanda, index) => (
                          <motion.tr
                            key={qanda._id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            custom={index}
                            className="hover:bg-green-50 transition-colors duration-200"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <StatusBadge status={qanda.status || "active"} />
                            </td>
                            {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center font-semibold">
                              {qanda.chapterName || "—"}
                            </td> */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                              {qanda.category?.region || "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                              {qanda.category?.examType || "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                              {qanda.category?.specificClass || "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                              {qanda.category?.subject || "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                              {qanda?.questions?.length || 0}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                              {qanda?.createdAt
                                ? new Date(qanda.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                  })
                                : "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                {qanda.roles && qanda.roles.length > 0 ? (
                                  qanda.roles.map((role, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                                    >
                                      {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleAdd(qanda)}
                                  className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-lg transition-all duration-200"
                                  title="Add New Q&A"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleView(qanda)}
                                  className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all duration-200"
                                  title="List of Q&A"
                                >
                                  <List className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleStatusChange(qanda)}
                                  className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 rounded-lg transition-all duration-200"
                                  title={qanda.status === "active" ? "Deactivate" : "Activate"}
                                >
                                  {qanda.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(qanda)}
                                  className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all duration-200"
                                  title="Edit Q&A"
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(qanda)}
                                  className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 rounded-lg transition-all duration-200"
                                  title="Delete Q&A"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleChangeChapter(qanda)}
                                  className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 rounded-lg"
                                  title="Change Chapter"
                                >
                                  <FileEdit className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  <AnimatePresence>
                    {filteredQandas.map((qanda, index) => (
                      <motion.div
                        key={qanda._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">S.No: {index + 1}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={qanda.status || "active"} />
                                <span className="text-xs text-gray-500">
                                  {qanda.createdAt
                                    ? new Date(qanda.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric"
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700">
                              <div className="font-medium">Uploader:</div>
                              <div className="flex gap-1">
                                {qanda.roles && qanda.roles.length > 0 ? (
                                  qanda.roles.map((role, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                                    >
                                      <Upload className="w-3 h-3" />
                                      {role}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-500">—</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {/* <div className="text-gray-700">
                              <div className="font-medium">Chapter:</div>
                              <div className="text-center font-semibold text-blue-600">{qanda.chapterName || "—"}</div>
                            </div> */}
                            <div className="text-gray-700">
                              <div className="font-medium">Questions:</div>
                              <div className="text-center">{qanda?.questions?.length || 0}</div>
                            </div>
                            <div className="text-gray-700">
                              <div className="font-medium">Region:</div>
                              <div className="text-center">{qanda.category?.region || "—"}</div>
                            </div>
                            <div className="text-gray-700">
                              <div className="font-medium">Exam Type:</div>
                              <div className="text-center">{qanda.category?.examType || "—"}</div>
                            </div>
                            <div className="text-gray-700">
                              <div className="font-medium">Class:</div>
                              <div className="text-center">{qanda.category?.specificClass || "—"}</div>
                            </div>
                            <div className="text-gray-700">
                              <div className="font-medium">Subject:</div>
                              <div className="text-center">{qanda.category?.subject || "—"}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-1 pt-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleAdd(qanda)}
                              className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-lg"
                              title="Add New Q&A"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleView(qanda)}
                              className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-lg"
                              title="List of Q&A"
                            >
                              <List className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusChange(qanda)}
                              className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 rounded-lg"
                              title={qanda.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {qanda.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(qanda)}
                              className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-lg"
                              title="Edit Q&A"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(qanda)}
                              className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 rounded-lg"
                              title="Delete Q&A"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleChangeChapter(qanda)}
                              className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 rounded-lg"
                              title="Change Chapter"
                            >
                              <FileEdit className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* No Results State */}
            {!isLoading && filteredQandas.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Q&As found</h3>
                <p className="text-gray-600">
                  {qandas.length === 0
                    ? "Create your first Q&A to get started."
                    : "Try adjusting your filter criteria."}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Modal for changing chapter name */}
      <ChangeChapterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        qanda={selectedQanda}
        onUpdate={handleUpdateChapter}
      />
    </div>
  );
}