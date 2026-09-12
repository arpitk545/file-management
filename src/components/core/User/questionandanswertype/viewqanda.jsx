"use client";

import { useState, useEffect } from "react";
import { 
  Edit, 
  Trash2, 
  Filter, 
  ArrowLeft, 
  Plus, 
  List, 
  RotateCcw, 
  BookOpen, 
  Sparkles
} from "lucide-react";
import { getAllQandARegions, getMyCreatedQandA, deleteQandA } from "../../../../services/operations/qandA";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ViewMyQandA() {
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

  const statuses = ["active", "deactivate"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [regionsResponse, qandaResponse] = await Promise.all([
          getAllQandARegions(),
          getMyCreatedQandA(),
        ]);
        setRegions(regionsResponse?.data || []);
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
      setSelectedRegion(null);
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
        (c) => c.name === formData.specificClass
      );
      const subjectList = selectedClass?.subjects?.map((s) => s.name) || [];
      setSubjects(subjectList);
    } else {
      setSubjects([]);
    }
  }, [formData.specificClass, formData.examType, selectedRegion]);

  useEffect(() => {
    let filtered = [...qandas];

    if (formData.region) {
      filtered = filtered.filter((q) => q.category?.region === formData.region);
    }
    if (formData.examType) {
      filtered = filtered.filter((q) => q.category?.examType === formData.examType);
    }
    if (formData.specificClass) {
      filtered = filtered.filter((q) => q.category?.specificClass === formData.specificClass);
    }
    if (formData.subject) {
      filtered = filtered.filter((q) => q.category?.subject === formData.subject);
    }
    if (formData.chapter) {
      filtered = filtered.filter((q) => q.chapterName === formData.chapter);
    }
    if (formData.status) {
      filtered = filtered.filter((q) => q.status === formData.status);
    }

    setFilteredQandas(filtered);
  }, [formData, qandas]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "region") {
        updated.examType = "";
        updated.specificClass = "";
        updated.subject = "";
      } else if (name === "examType") {
        updated.specificClass = "";
        updated.subject = "";
      } else if (name === "specificClass") {
        updated.subject = "";
      }
      return updated;
    });
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

  const areFiltersActive = Boolean(
    formData.region ||
    formData.examType ||
    formData.specificClass ||
    formData.subject ||
    formData.chapter ||
    formData.status
  );

  const handleAdd = (qanda) => {
    navigate(`/create-qanda/${qanda._id}`);
  };

  const handleView = (qanda) => {
    navigate(`/user-qanda-detail/${qanda._id}`);
  };

  const handleEdit = (qanda) => {
    if (qanda.status === "active") {
      toast.error("Active Q&A cannot be edited directly.");
      return;
    }
    navigate(`/edit-qanda/${qanda._id}`);
  };

  const handleDelete = async (qanda) => {
    if (qanda.status === "active") {
      toast.error("Active Q&A cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete chapter "${qanda.chapterName}"?`)) {
      return;
    }
    try {
      await deleteQandA(qanda._id);
      setQandas((prev) => prev.filter((item) => item._id !== qanda._id));
      toast.success("Q&A chapter deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete Q&A chapter.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-[#1c1c1e] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                <Sparkles className="w-3.5 h-3.5" />
                Student Workspace
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                {qandas.length} Created Sets
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              My Q & A Question Sets
            </h1>
            <p className="text-[#555a6a] text-sm sm:text-base max-w-2xl leading-relaxed">
              Track and manage all question packages you have authored. Add questions, preview solutions, or view moderation status.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
            <button
              onClick={() => navigate("/upload-q-and-a")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Q & A Set
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-white hover:bg-[#f7f8fa] border border-[#c7cad5] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#c3faf5] text-[#187574] flex items-center justify-center font-bold">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1c1c1e]">Filter My Sets</h2>
              <p className="text-xs text-[#6b6f7e]">Filter by board, exam, grade, or chapter</p>
            </div>
          </div>
          {areFiltersActive && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#4262ff] bg-[#f5f3ff] hover:bg-[#ebe8ff] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Status */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#555a6a] mb-1 block">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#4262ff]"
            >
              <option value="">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#187574] mb-1 block">
              Region
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#0fbcb0]"
            >
              <option value="">All Regions</option>
              {regions.map((reg) => (
                <option key={reg._id || reg.name} value={reg.name}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#4262ff] mb-1 block">
              Exam Type
            </label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleInputChange}
              disabled={!formData.region}
              className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#4262ff] disabled:opacity-50"
            >
              <option value="">All Exams</option>
              {examTypes.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#86296b] mb-1 block">
              Class
            </label>
            <select
              name="specificClass"
              value={formData.specificClass}
              onChange={handleInputChange}
              disabled={!formData.examType}
              className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#86296b] disabled:opacity-50"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#746019] mb-1 block">
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              disabled={!formData.specificClass}
              className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#ffd02f] disabled:opacity-50"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#c05621] mb-1 block">
              Chapter
            </label>
            <select
              name="chapter"
              value={formData.chapter}
              onChange={handleInputChange}
              className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#c05621]"
            >
              <option value="">All Chapters</option>
              {Array.from(new Set(qandas.map((q) => q.chapterName).filter(Boolean))).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Cards Display */}
      <div className="w-full bg-white border border-[#e0e2e8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eef0f3]">
          <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
            Authored Chapters ({filteredQandas.length})
            {filteredQandas.length !== qandas.length && (
              <span className="text-xs font-normal text-[#6b6f7e] ml-2">
                (filtered from {qandas.length} total)
              </span>
            )}
          </h2>
          <span className="text-xs text-[#6b6f7e]">
            {filteredQandas.reduce((acc, curr) => acc + (curr.questions?.length || 0), 0)} total questions
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#ffd02f] border-t-[#1c1c1e] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#1c1c1e]">Loading your Q & A sets...</p>
          </div>
        ) : filteredQandas.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e0e2e8] bg-[#f7f8fa] text-[11px] font-bold uppercase tracking-wider text-[#555a6a]">
                    <th className="py-3 px-4 text-center w-12">#</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Chapter Title</th>
                    <th className="py-3 px-4">Taxonomy</th>
                    <th className="py-3 px-4 text-center">Questions</th>
                    <th className="py-3 px-4 text-center">Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f3] text-sm">
                  {filteredQandas.map((qanda, idx) => {
                    const isActive = qanda.status === "active";
                    return (
                      <tr key={qanda._id} className="hover:bg-[#fafbfc] transition-colors">
                        <td className="py-3.5 px-4 text-center text-xs font-bold text-[#6b6f7e]">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-[#e6f9f0] text-[#00875a]"
                                : "bg-[#fbd4d4] text-[#800000]"
                            }`}
                          >
                            {isActive ? "Active" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {qanda.thumbnail ? (
                              <img
                                src={qanda.thumbnail}
                                alt={qanda.chapterName}
                                className="w-10 h-10 rounded-lg object-cover border border-[#e0e2e8] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#fff8e0] text-[#746019] flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#1c1c1e] line-clamp-1">{qanda.chapterName || "—"}</p>
                              {qanda.tags && (
                                <p className="text-xs text-[#8e91a0] truncate max-w-xs">
                                  {Array.isArray(qanda.tags) ? qanda.tags.join(", ") : qanda.tags}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#c3faf5] text-[#187574]">
                              {qanda.category?.region || "—"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#f5f3ff] text-[#4262ff]">
                              {qanda.category?.examType || "—"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ffd8f4] text-[#86296b]">
                              {qanda.category?.specificClass || "—"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#fff8e0] text-[#746019]">
                              {qanda.category?.subject || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff]">
                            {qanda.questions?.length || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-[#6b6f7e]">
                          {qanda.createdAt
                            ? new Date(qanda.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Add Question Button */}
                            <button
                              onClick={() => handleAdd(qanda)}
                              className="p-2 rounded-lg bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm transition-all"
                              title="Add Question to this Chapter"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* View Button */}
                            <button
                              onClick={() => handleView(qanda)}
                              className="p-2 rounded-lg bg-[#4262ff] hover:bg-[#2a41b6] text-white shadow-sm transition-all"
                              title="View & Inspect Questions"
                            >
                              <List className="w-4 h-4" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(qanda)}
                              disabled={isActive}
                              className={`p-2 rounded-lg border transition-all ${
                                isActive
                                  ? "border-[#e0e2e8] bg-[#f7f8fa] text-[#a5a8b5] cursor-not-allowed"
                                  : "border-[#c7cad5] bg-white text-[#1c1c1e] hover:bg-[#f7f8fa]"
                              }`}
                              title={isActive ? "Active chapters cannot be edited" : "Edit Chapter & Questions"}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(qanda)}
                              disabled={isActive}
                              className={`p-2 rounded-lg border transition-all ${
                                isActive
                                  ? "border-[#e0e2e8] bg-[#f7f8fa] text-[#a5a8b5] cursor-not-allowed"
                                  : "border-[#ffc6c6] bg-[#fbd4d4] text-[#991b1b] hover:bg-[#ff9999]"
                              }`}
                              title={isActive ? "Active chapters cannot be deleted" : "Delete Chapter"}
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

            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4">
              {filteredQandas.map((qanda, idx) => {
                const isActive = qanda.status === "active";
                return (
                  <div
                    key={qanda._id}
                    className="p-4 border border-[#e0e2e8] rounded-xl bg-white shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#6b6f7e] uppercase">#{idx + 1}</span>
                        <h4 className="text-base font-bold text-[#1c1c1e] line-clamp-2">
                          {qanda.chapterName || "—"}
                        </h4>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                          isActive
                            ? "bg-[#e6f9f0] text-[#00875a]"
                            : "bg-[#fbd4d4] text-[#800000]"
                        }`}
                      >
                        {isActive ? "Active" : "Draft"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#c3faf5] text-[#187574]">
                        {qanda.category?.region || "—"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#f5f3ff] text-[#4262ff]">
                        {qanda.category?.examType || "—"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ffd8f4] text-[#86296b]">
                        {qanda.category?.specificClass || "—"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#fff8e0] text-[#746019]">
                        {qanda.category?.subject || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#6b6f7e] pt-2 border-t border-[#eef0f3]">
                      <span>{qanda.questions?.length || 0} Questions</span>
                      <span>
                        {qanda.createdAt ? new Date(qanda.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <button
                        onClick={() => handleAdd(qanda)}
                        className="py-2 px-2 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                      <button
                        onClick={() => handleView(qanda)}
                        className="py-2 px-2 bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm"
                      >
                        <List className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(qanda)}
                        disabled={isActive}
                        className={`py-2 px-2 border font-bold text-xs rounded-lg flex items-center justify-center gap-1 ${
                          isActive
                            ? "bg-[#f7f8fa] text-[#a5a8b5] border-[#e0e2e8] cursor-not-allowed"
                            : "bg-white text-[#1c1c1e] border-[#c7cad5]"
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(qanda)}
                        disabled={isActive}
                        className={`py-2 px-2 border font-bold text-xs rounded-lg flex items-center justify-center gap-1 ${
                          isActive
                            ? "bg-[#f7f8fa] text-[#a5a8b5] border-[#e0e2e8] cursor-not-allowed"
                            : "bg-[#fbd4d4] text-[#991b1b] border-[#ffc6c6]"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-[#f5f3ff] text-[#4262ff] flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1c1c1e] mb-1">No Q & A Sets Found</h3>
            <p className="text-xs text-[#6b6f7e] max-w-sm mx-auto mb-5">
              {qandas.length === 0
                ? "You haven't authored any Q&A chapters yet. Create your first module to get started!"
                : "No chapters match your selected filters. Reset filters to see all your authored sets."}
            </p>
            {qandas.length === 0 ? (
              <button
                onClick={() => navigate("/upload-q-and-a")}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm transition-all"
              >
                + Create Your First Set
              </button>
            ) : (
              <button
                onClick={clearFilters}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1c1c1e] text-white hover:bg-[#2c2c34] transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}