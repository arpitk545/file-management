"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowLeft,
  Plus,
  List,
  CheckCircle,
  Ban,
  Upload,
  FileEdit,
  X,
  Search,
  BookOpen,
  Layers,
  RotateCcw,
  Loader2,
  FolderPlus,
  UserCheck
} from "lucide-react";
import { getAllQandARegions, getAllQandA, deleteQandA, updateQandA } from "../../../../services/operations/qandA";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
        isActive
          ? "bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
          : "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#187574]" : "bg-[#800000]"}`} />
      <span>{isActive ? "Active" : "Deactivated"}</span>
    </span>
  );
};

// Miro Modal Component for changing chapter name
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
    <div className="fixed inset-0 z-50 bg-[#1c1c1e]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl border border-[#c7cad5] w-full max-w-md p-6 sm:p-7 shadow-xl space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
              <FileEdit className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
              Rename Chapter
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#f7f8fa] text-[#555a6a] hover:text-[#1c1c1e] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
              Current Chapter Name
            </label>
            <div className="p-3 bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl text-xs sm:text-sm font-semibold text-[#1c1c1e]">
              {qanda?.chapterName || "No chapter name assigned"}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
              New Chapter Title *
            </label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
              placeholder="Enter new chapter name..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e0e2e8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isLoading || !chapterName.trim()}
              className="h-11 px-5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Chapter Name"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ViewsubmittedQandA() {
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
  const [searchQuery, setSearchQuery] = useState("");
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

        // Filter Q&As to only show those with "user" role
        const userQandas = allQandas.filter(qanda =>
          qanda.roles && qanda.roles.includes("user")
        );

        setQandas(userQandas);
        setFilteredQandas(userQandas);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load submitted Q&A data");
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

  useEffect(() => {
    filterQandas();
  }, [formData, searchQuery, qandas]);

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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((qanda) =>
        (qanda.chapterName && qanda.chapterName.toLowerCase().includes(q)) ||
        (qanda.category?.subject && qanda.category.subject.toLowerCase().includes(q)) ||
        (qanda.category?.examType && qanda.category.examType.toLowerCase().includes(q)) ||
        (qanda.category?.region && qanda.category.region.toLowerCase().includes(q)) ||
        (qanda.category?.specificClass && qanda.category.specificClass.toLowerCase().includes(q))
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
      setQandas(prev => prev.map(q =>
        q._id === id ? { ...q, chapterName: data.chapterName } : q
      ));
      toast.success("Chapter name updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update chapter name");
    }
  };

  const handleDelete = async (qanda) => {
    if (!window.confirm(`Are you sure you want to delete "${qanda.chapterName || 'this Q&A set'}"?`)) return;

    try {
      await deleteQandA(qanda._id);
      setQandas((prev) => prev.filter((q) => q._id !== qanda._id));
      toast.success("Q&A deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete Q&A.");
    }
  };

  const handleStatusChange = async (qanda) => {
    const newStatus = qanda.status === "active" ? "deactivate" : "active";

    try {
      await updateQandA(qanda._id, { status: newStatus });
      setQandas((prev) =>
        prev.map((q) =>
          q._id === qanda._id ? { ...q, status: newStatus } : q
        )
      );
      toast.success(`Q&A set is now ${newStatus === "active" ? "Active" : "Deactivated"}!`);
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
    setSearchQuery("");
  };

  const hasActiveFilters = Boolean(
    formData.region ||
    formData.examType ||
    formData.specificClass ||
    formData.subject ||
    formData.chapter ||
    formData.status ||
    searchQuery
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              USER SUBMISSIONS
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              COMMUNITY CONTRIBUTIONS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <UserCheck className="w-3.5 h-3.5 text-[#4262ff]" />
              <span>{filteredQandas.length} User Submissions</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            User-Submitted Question &amp; Answer Sets
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Review community contributed Q&amp;A packages uploaded by students, verify answers, and activate for curriculum publication.
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                <Filter className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
                Filter &amp; Search Submissions
              </h2>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#800000] bg-[#fbd4d4] hover:bg-[#f8bebe] transition-colors self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-[#555a6a] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapter, subject, uploader, exam..."
                className="w-full h-11 min-h-[44px] pl-10 pr-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all placeholder-[#8e92a0]"
              />
            </div>

            <div>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "active" ? "● Active Only" : "○ Deactivated Only"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Region</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
              >
                <option value="">All Regions</option>
                {regions.map((r) => (
                  <option key={r._id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Exam Type</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                disabled={!formData.region}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50"
              >
                <option value="">All Exam Types</option>
                {examTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Class</label>
              <select
                name="specificClass"
                value={formData.specificClass}
                onChange={handleInputChange}
                disabled={!formData.examType}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                disabled={!formData.specificClass}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50"
              >
                <option value="">All Subjects</option>
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
            <p className="text-sm font-bold text-[#1c1c1e]">Loading Submitted Q&amp;As...</p>
            <p className="text-xs text-[#555a6a]">Filtering community contributions</p>
          </div>
        ) : filteredQandas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-3 shadow-sm">
            <UserCheck className="w-10 h-10 text-[#8e92a0] mx-auto" />
            <h3 className="text-base font-bold text-[#1c1c1e]">No User-Submitted Q&amp;As Found</h3>
            <p className="text-xs text-[#555a6a]">
              No packages have been submitted by students under these filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] text-xs font-bold hover:bg-[#f7f8fa]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-[#c7cad5] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f7f8fa] border-b border-[#e0e2e8] text-[11px] font-bold uppercase tracking-wider text-[#555a6a]">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Chapter &amp; Topic</th>
                      <th className="py-3.5 px-4">Classification</th>
                      <th className="py-3.5 px-4 text-center">Questions</th>
                      <th className="py-3.5 px-4">Uploader Role</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e2e8] text-sm">
                    {filteredQandas.map((qanda, index) => {
                      const questionCount = qanda?.questions?.length || 0;
                      return (
                        <tr key={qanda._id} className="hover:bg-[#fffdf5] transition-colors">
                          <td className="py-4 px-4 text-center font-bold text-xs text-[#555a6a]">
                            {index + 1}
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <StatusBadge status={qanda.status || "active"} />
                          </td>

                          <td className="py-4 px-4 min-w-[200px]">
                            <div className="space-y-0.5">
                              <p className="font-bold text-[#1c1c1e] flex items-center gap-2">
                                <span>{qanda.chapterName || "Untitled Chapter"}</span>
                                <button
                                  type="button"
                                  onClick={() => handleChangeChapter(qanda)}
                                  className="text-[#555a6a] hover:text-[#1c1c1e] p-1 hover:bg-[#f7f8fa] rounded-md transition-colors"
                                  title="Rename chapter"
                                >
                                  <FileEdit className="w-3.5 h-3.5" />
                                </button>
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap text-xs">
                              {qanda.category?.region && (
                                <span className="font-semibold px-2 py-0.5 rounded-full bg-[#c3faf5] text-[#187574]">
                                  {qanda.category.region}
                                </span>
                              )}
                              {qanda.category?.examType && (
                                <span className="font-semibold px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#4262ff]">
                                  {qanda.category.examType}
                                </span>
                              )}
                              {qanda.category?.specificClass && (
                                <span className="font-semibold px-2 py-0.5 rounded-full bg-[#ffd8f4] text-[#86296b]">
                                  {qanda.category.specificClass}
                                </span>
                              )}
                              {qanda.category?.subject && (
                                <span className="font-semibold px-2 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e]">
                                  {qanda.category.subject}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#f7f8fa] border border-[#c7cad5] text-[#1c1c1e]">
                              {questionCount} Questions
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
                              <Upload className="w-3 h-3" />
                              <span>Student / User</span>
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#555a6a]">
                            {qanda?.createdAt
                              ? new Date(qanda.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })
                              : "—"}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* Add Questions to this chapter */}
                              <button
                                type="button"
                                onClick={() => handleAdd(qanda)}
                                className="p-2 rounded-none bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] transition-colors border border-[#e5bc29]"
                                title="Add Question to Chapter"
                              >
                                <Plus className="w-4 h-4" />
                              </button>

                              {/* View Questions */}
                              <button
                                type="button"
                                onClick={() => handleView(qanda)}
                                className="p-2 rounded-none bg-[#4262ff] hover:bg-[#3350e0] text-white transition-colors"
                                title="View Questions"
                              >
                                <List className="w-4 h-4" />
                              </button>

                              {/* Status Toggle */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(qanda)}
                                className={`p-2 rounded-none border transition-colors ${
                                  qanda.status === "active"
                                    ? "bg-white border-[#c7cad5] text-[#800000] hover:bg-[#fbd4d4]"
                                    : "bg-white border-[#c7cad5] text-[#187574] hover:bg-[#c3faf5]"
                                }`}
                                title={qanda.status === "active" ? "Deactivate set" : "Activate set"}
                              >
                                {qanda.status === "active" ? (
                                  <Ban className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>

                              {/* Rename Chapter */}
                              <button
                                type="button"
                                onClick={() => handleChangeChapter(qanda)}
                                className="p-2 rounded-none bg-[#fff8e0] border border-[#fde89c] text-[#746019] hover:bg-[#fff4c4] transition-colors"
                                title="Change Chapter Name"
                              >
                                <FileEdit className="w-4 h-4" />
                              </button>

                              {/* Edit Details */}
                              <button
                                type="button"
                                onClick={() => handleEdit(qanda)}
                                className="p-2 rounded-none bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] transition-colors"
                                title="Edit taxonomy & info"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDelete(qanda)}
                                className="p-2 rounded-none bg-[#fbd4d4] border border-[#e3c5c5] text-[#800000] hover:bg-[#ffc6c6] transition-colors"
                                title="Delete Q&A set"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3.5">
              {filteredQandas.map((qanda, index) => {
                const questionCount = qanda?.questions?.length || 0;
                return (
                  <div key={qanda._id} className="bg-white rounded-2xl border border-[#c7cad5] p-5 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#555a6a]">#{index + 1}</span>
                          <StatusBadge status={qanda.status || "active"} />
                        </div>
                        <h3 className="text-base font-bold text-[#1c1c1e]">
                          {qanda.chapterName || "Untitled Chapter"}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChangeChapter(qanda)}
                        className="p-2 rounded-none bg-[#fff8e0] text-[#746019] border border-[#fde89c] hover:bg-[#fff4c4] transition-colors"
                        title="Change Chapter Name"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      {qanda.category?.region && (
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-[#c3faf5] text-[#187574]">
                          {qanda.category.region}
                        </span>
                      )}
                      {qanda.category?.examType && (
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#4262ff]">
                          {qanda.category.examType}
                        </span>
                      )}
                      {qanda.category?.specificClass && (
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-[#ffd8f4] text-[#86296b]">
                          {qanda.category.specificClass}
                        </span>
                      )}
                      {qanda.category?.subject && (
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e]">
                          {qanda.category.subject}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#555a6a] pt-1 border-t border-[#e0e2e8]">
                      <span>Questions: <strong>{questionCount}</strong></span>
                      <span className="font-bold text-[#86296b]">User Submission</span>
                    </div>

                    {/* Mobile Actions Bar - Icon Only rounded-none */}
                    <div className="flex items-center justify-end gap-1 pt-3 border-t border-[#e0e2e8] flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAdd(qanda)}
                        className="p-2 rounded-none bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] transition-colors border border-[#e5bc29]"
                        title="Add Question to Chapter"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleView(qanda)}
                        className="p-2 rounded-none bg-[#4262ff] hover:bg-[#3350e0] text-white transition-colors"
                        title="View Questions"
                      >
                        <List className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(qanda)}
                        className={`p-2 rounded-none border transition-colors ${
                          qanda.status === "active"
                            ? "bg-white border-[#c7cad5] text-[#800000] hover:bg-[#fbd4d4]"
                            : "bg-white border-[#c7cad5] text-[#187574] hover:bg-[#c3faf5]"
                        }`}
                        title={qanda.status === "active" ? "Deactivate set" : "Activate set"}
                      >
                        {qanda.status === "active" ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChangeChapter(qanda)}
                        className="p-2 rounded-none bg-[#fff8e0] border border-[#fde89c] text-[#746019] hover:bg-[#fff4c4] transition-colors"
                        title="Change Chapter Name"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(qanda)}
                        className="p-2 rounded-none bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] transition-colors"
                        title="Edit taxonomy & info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(qanda)}
                        className="p-2 rounded-none bg-[#fbd4d4] border border-[#e3c5c5] text-[#800000] hover:bg-[#ffc6c6] transition-colors"
                        title="Delete Q&A set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      <ChangeChapterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        qanda={selectedQanda}
        onUpdate={handleUpdateChapter}
      />
    </div>
  );
}