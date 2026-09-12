"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  Eye, 
  HelpCircle, 
  Sparkles, 
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Layers,
  GraduationCap,
  RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAllQandARegions, getAllQandA } from "../../services/operations/qandA";

export default function Qanda() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [filters, setFilters] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  });
  const [qandas, setQandas] = useState([]);
  const [regionsData, setRegionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Q&A and regions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [qandaRes, regionsRes] = await Promise.all([
          getAllQandA(),
          getAllQandARegions(),
        ]);

        const activeQandAs = (qandaRes?.data || []).filter(
          (q) => q.status === "active"
        );
         
        setQandas(activeQandAs);
        setRegionsData(regionsRes?.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load Q&A data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Navigation handlers
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

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name === "region") {
        newFilters.examType = "";
        newFilters.specificClass = "";
        newFilters.subject = "";
        newFilters.chapter = "";
        setCurrentStep(2);
      } else if (name === "examType") {
        newFilters.specificClass = "";
        newFilters.subject = "";
        newFilters.chapter = "";
        setCurrentStep(3);
      } else if (name === "specificClass") {
        newFilters.subject = "";
        newFilters.chapter = "";
        setCurrentStep(4);
      } else if (name === "subject") {
        newFilters.chapter = "";
        setCurrentStep(5);
      } else if (name === "chapter") {
        setCurrentStep(6);
      }
      return newFilters;
    });
  };

  const getExamTypes = () => {
    if (!filters.region) return [];
    const selectedRegion = regionsData.find(
      (region) => region.name === filters.region || region._id === filters.region
    );
    return selectedRegion?.examTypes?.map((type) => type.name) || [];
  };

  const getSpecificClasses = () => {
    if (!filters.region || !filters.examType) return [];
    const selectedRegion = regionsData.find(
      (region) => region.name === filters.region || region._id === filters.region
    );
    const selectedExamType = selectedRegion?.examTypes?.find(
      (et) => et.name === filters.examType
    );
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || [];
  };

  const getSubjects = () => {
    if (!filters.region || !filters.examType || !filters.specificClass) return [];
    const selectedRegion = regionsData.find(
      (region) => region.name === filters.region || region._id === filters.region
    );
    const selectedExamType = selectedRegion?.examTypes?.find(
      (et) => et.name === filters.examType
    );
    const selectedSpecificClass = selectedExamType?.specificClasses?.find(
      (sc) => sc.name === filters.specificClass
    );
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || [];
  };

  const getChapters = () => {
    if (!filters.region || !filters.examType || !filters.specificClass || !filters.subject) return [];
    const selectedRegion = regionsData.find(
      (region) => region.name === filters.region || region._id === filters.region
    );
    const selectedExamType = selectedRegion?.examTypes?.find(
      (et) => et.name === filters.examType
    );
    const selectedSpecificClass = selectedExamType?.specificClasses?.find(
      (sc) => sc.name === filters.specificClass
    );
    const selectedSubject = selectedSpecificClass?.subjects?.find(
      (sub) => sub.name === filters.subject
    );
    return selectedSubject?.chapters?.map((ch) => ch.name) || [];
  };

  const resetFilters = () => {
    setCurrentStep(1);
    setFilters({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    });
  };

  const areFiltersActive = () => {
    return (
      filters.region !== "" ||
      filters.examType !== "" ||
      filters.specificClass !== "" ||
      filters.subject !== "" ||
      filters.chapter !== ""
    );
  };

  const getQandasToDisplay = () => {
    if (!areFiltersActive() && qandas.length > 0) {
      return qandas;
    }
    
    let selectedRegionName = filters.region;
    if (filters.region) {
      const selectedRegion = regionsData.find(
        (r) => r._id === filters.region || r.name === filters.region
      );
      selectedRegionName = selectedRegion?.name || filters.region;
    }
    
    return qandas.filter((qanda) => {
      const category = qanda.category || {};
      if (filters.region && category.region !== selectedRegionName) return false;
      if (filters.examType && category.examType !== filters.examType) return false;
      if (filters.specificClass && category.specificClass !== filters.specificClass) return false;
      if (filters.subject && category.subject !== filters.subject) return false;
      if (filters.chapter && qanda.chapterName !== filters.chapter) return false;
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#ffd02f] border-t-[#1c1c1e] animate-spin mb-4" />
        <p className="text-[#1c1c1e] font-semibold text-lg">Loading Q & A Knowledge Bank...</p>
        <p className="text-[#6b6f7e] text-sm mt-1">Fetching interactive curricula and question modules</p>
      </div>
    );
  }

  const qandasToRender = getQandasToDisplay();

  const stepLabels = [
    { num: 1, title: "Region", key: "region", color: "bg-[#c3faf5] text-[#187574]" },
    { num: 2, title: "Exam Type", key: "examType", color: "bg-[#f5f3ff] text-[#4262ff]" },
    { num: 3, title: "Class", key: "specificClass", color: "bg-[#ffd8f4] text-[#86296b]" },
    { num: 4, title: "Subject", key: "subject", color: "bg-[#fff8e0] text-[#746019]" },
    { num: 5, title: "Chapter", key: "chapter", color: "bg-[#ffe6cd] text-[#c05621]" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 xl:px-12 font-sans">
      {/* Top Banner */}
      <div className="w-full bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                <Sparkles className="w-3.5 h-3.5" />
                Miro Visual Knowledge Bank
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff] border border-[#e0e2e8]">
                {qandas.length} Total Chapters
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#c3faf5] text-[#187574]">
                Interactive Taxonomy
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              Q &amp; A Study Repository
            </h1>
            <p className="text-[#555a6a] text-sm sm:text-base max-w-3xl leading-relaxed">
              Explore syllabus-aligned question sets, detailed solutions, and past exam modules curated across regions and subjects.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
            {areFiltersActive() && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#c7cad5] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1c1c1e] hover:bg-[#2c2c34] shadow-xs active:scale-98 transition-all whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>

        {/* Step Flow Indicator */}
        <div className="mt-6 pt-6 border-t border-[#e0e2e8]">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {stepLabels.map((step) => {
              const isSelected = !!filters[step.key];
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? "border-[#4262ff] bg-[#f5f3ff] ring-2 ring-[#4262ff]/20"
                      : isSelected
                      ? "border-[#c7cad5] bg-white"
                      : "border-[#e0e2e8] bg-[#f7f8fa] opacity-75"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? "bg-[#00b473] text-white"
                        : isCurrent
                        ? "bg-[#4262ff] text-white"
                        : "bg-[#e0e2e8] text-[#555a6a]"
                    }`}
                  >
                    {isSelected ? "✓" : step.num}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-[#1c1c1e] truncate">{step.title}</p>
                    <p className="text-[11px] text-[#6b6f7e] truncate">
                      {filters[step.key] || "Select"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Miro Smart Filters Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 shadow-xs sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ffd02f] flex items-center justify-center text-[#1c1c1e] font-bold">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1c1c1e]">Guided Filter</h2>
                  <p className="text-xs text-[#6b6f7e]">Step {currentStep} of 5</p>
                </div>
              </div>
              {areFiltersActive() && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#4262ff] hover:underline"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Dynamic Step Panels */}
            <AnimatePresence mode="wait">
              {/* Step 1: Region */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#187574] bg-[#c3faf5] px-2.5 py-0.5 rounded-md">
                      Step 1: Region
                    </span>
                    <span className="text-xs text-[#6b6f7e]">{regionsData.length} available</span>
                  </div>
                  <p className="text-xs text-[#555a6a]">Select educational board or geographic state:</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {regionsData.map((region) => {
                      const isSelected = filters.region === region.name;
                      return (
                        <button
                          key={region._id || region.name}
                          onClick={() => handleFilterChange("region", region.name)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-[#c3faf5] border-[#0fbcb0] text-[#187574] font-bold shadow-sm"
                              : "bg-[#f7f8fa] hover:bg-white border-[#e0e2e8] text-[#1c1c1e]"
                          }`}
                        >
                          <span>{region.name}</span>
                          <ChevronRight className="w-4 h-4 text-[#6b6f7e]" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Exam Type */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#4262ff] bg-[#f5f3ff] px-2.5 py-0.5 rounded-md">
                      Step 2: Exam Type
                    </span>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-[#6b6f7e] hover:text-[#1c1c1e]"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#f7f8fa] rounded-lg border border-[#e0e2e8] text-xs">
                    <span className="text-[#6b6f7e]">Selected Region: </span>
                    <span className="font-bold text-[#1c1c1e]">{filters.region || "None"}</span>
                  </div>
                  <p className="text-xs text-[#555a6a]">Select exam track or syllabus:</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {getExamTypes().map((exam) => {
                      const isSelected = filters.examType === exam;
                      return (
                        <button
                          key={exam}
                          onClick={() => handleFilterChange("examType", exam)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-[#f5f3ff] border-[#4262ff] text-[#4262ff] font-bold shadow-sm"
                              : "bg-[#f7f8fa] hover:bg-white border-[#e0e2e8] text-[#1c1c1e]"
                          }`}
                        >
                          <span>{exam}</span>
                          <ChevronRight className="w-4 h-4 text-[#6b6f7e]" />
                        </button>
                      );
                    })}
                    {getExamTypes().length === 0 && (
                      <div className="p-4 text-center text-xs text-[#8e91a0]">
                        No exam types configured for this region.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Class */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#86296b] bg-[#ffd8f4] px-2.5 py-0.5 rounded-md">
                      Step 3: Class / Standard
                    </span>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-semibold text-[#6b6f7e] hover:text-[#1c1c1e]"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#f7f8fa] rounded-lg border border-[#e0e2e8] text-xs space-y-1">
                    <div><span className="text-[#6b6f7e]">Region: </span><span className="font-semibold text-[#1c1c1e]">{filters.region}</span></div>
                    <div><span className="text-[#6b6f7e]">Exam: </span><span className="font-semibold text-[#1c1c1e]">{filters.examType}</span></div>
                  </div>
                  <p className="text-xs text-[#555a6a]">Select student class or grade level:</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {getSpecificClasses().map((cls) => {
                      const isSelected = filters.specificClass === cls;
                      return (
                        <button
                          key={cls}
                          onClick={() => handleFilterChange("specificClass", cls)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-[#ffd8f4] border-[#e3c5c5] text-[#86296b] font-bold shadow-sm"
                              : "bg-[#f7f8fa] hover:bg-white border-[#e0e2e8] text-[#1c1c1e]"
                          }`}
                        >
                          <span>{cls}</span>
                          <ChevronRight className="w-4 h-4 text-[#6b6f7e]" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Subject */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#746019] bg-[#fff8e0] px-2.5 py-0.5 rounded-md">
                      Step 4: Subject
                    </span>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-semibold text-[#6b6f7e] hover:text-[#1c1c1e]"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#f7f8fa] rounded-lg border border-[#e0e2e8] text-xs space-y-1">
                    <div><span className="text-[#6b6f7e]">Class: </span><span className="font-semibold text-[#1c1c1e]">{filters.specificClass}</span></div>
                  </div>
                  <p className="text-xs text-[#555a6a]">Select academic subject:</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {getSubjects().map((sub) => {
                      const isSelected = filters.subject === sub;
                      return (
                        <button
                          key={sub}
                          onClick={() => handleFilterChange("subject", sub)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-[#fff8e0] border-[#ffd02f] text-[#746019] font-bold shadow-sm"
                              : "bg-[#f7f8fa] hover:bg-white border-[#e0e2e8] text-[#1c1c1e]"
                          }`}
                        >
                          <span>{sub}</span>
                          <ChevronRight className="w-4 h-4 text-[#6b6f7e]" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Chapter / Overview */}
              {currentStep >= 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#c05621] bg-[#ffe6cd] px-2.5 py-0.5 rounded-md">
                      Step 5: Chapter Filter
                    </span>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="text-xs font-semibold text-[#6b6f7e] hover:text-[#1c1c1e]"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="p-3 bg-[#f7f8fa] rounded-xl border border-[#e0e2e8] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b6f7e]">Region:</span>
                      <span className="font-semibold text-[#1c1c1e]">{filters.region || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b6f7e]">Exam:</span>
                      <span className="font-semibold text-[#1c1c1e]">{filters.examType || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b6f7e]">Class:</span>
                      <span className="font-semibold text-[#1c1c1e]">{filters.specificClass || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b6f7e]">Subject:</span>
                      <span className="font-semibold text-[#1c1c1e]">{filters.subject || "—"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#555a6a]">Specific Chapter (Optional):</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    <button
                      onClick={() => handleFilterChange("chapter", "")}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold ${
                        !filters.chapter ? "bg-[#ffd02f] text-[#1c1c1e] border-[#fcb900]" : "bg-white border-[#e0e2e8] text-[#555a6a]"
                      }`}
                    >
                      All Chapters in {filters.subject}
                    </button>
                    {getChapters().map((ch) => (
                      <button
                        key={ch}
                        onClick={() => handleFilterChange("chapter", ch)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                          filters.chapter === ch
                            ? "bg-[#ffe6cd] border-[#fcb900] text-[#c05621] font-bold"
                            : "bg-white hover:bg-[#f7f8fa] border-[#e0e2e8] text-[#1c1c1e]"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Summary Pill */}
            <div className="mt-6 pt-4 border-t border-[#e0e2e8] text-center">
              <span className="text-xs text-[#555a6a]">
                Showing <strong className="text-[#1c1c1e]">{qandasToRender.length}</strong> matching chapters
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Q&A Packages Grid */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1c1c1e]">
                Available Study Sets
              </h2>
              <p className="text-xs sm:text-sm text-[#6b6f7e]">
                {areFiltersActive()
                  ? `Filtered results (${qandasToRender.length} found)`
                  : `Showing all active curriculum chapters (${qandasToRender.length})`}
              </p>
            </div>
            {areFiltersActive() && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#c7cad5] hover:bg-white text-[#1c1c1e] self-start sm:self-auto"
              >
                Clear all filters
              </button>
            )}
          </div>

          {qandasToRender.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {qandasToRender.map((qanda, index) => (
                <motion.div
                  key={qanda._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white border border-[#c7cad5] hover:border-[#1c1c1e] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Thumbnail or Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      {qanda.thumbnail ? (
                        <img
                          src={qanda.thumbnail}
                          alt={qanda.chapterName}
                          className="w-14 h-14 rounded-xl object-cover border border-[#e0e2e8] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#ffd02f] flex items-center justify-center text-[#1c1c1e] shrink-0 shadow-sm">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c3faf5] text-[#187574]">
                          {qanda.category?.region || "Region"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#4262ff]">
                          {qanda.category?.examType || "Exam"}
                        </span>
                      </div>
                    </div>

                    {/* Chapter Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e] mb-2 group-hover:text-[#4262ff] transition-colors line-clamp-2">
                      {qanda.chapterName || "Untitled Chapter"}
                    </h3>

                    {/* Meta details */}
                    <div className="flex items-center gap-4 text-xs text-[#6b6f7e] mb-4">
                      <span className="inline-flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#ffd02f]" />
                        <strong className="text-[#1c1c1e]">{qanda.questions?.length || 0}</strong> questions
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#4262ff]" />
                        {qanda.category?.specificClass || "General"}
                      </span>
                      {qanda.category?.subject && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-[#00b473]" />
                          {qanda.category?.subject}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {qanda.tags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(Array.isArray(qanda.tags)
                          ? qanda.tags
                          : qanda.tags.split(",")
                        )
                          .slice(0, 3)
                          .map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]"
                            >
                              #{typeof tag === "string" ? tag.trim() : tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* View Button CTA */}
                  <div className="pt-4 border-t border-[#eef0f3]">
                    <button
                      onClick={() => navigate(`/user-qanda-detail/${qanda._id}`)}
                      className="w-full py-2.5 px-4 rounded-full font-bold text-sm bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] shadow-sm flex items-center justify-center gap-2 transition-all group-hover:scale-[1.01]"
                    >
                      <Eye className="w-4 h-4" />
                      Explore Questions ({qanda.questions?.length || 0})
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#e0e2e8] rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#fff4c4] text-[#746019] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1c1c1e] mb-1">No Active Q & A Chapters Found</h3>
              <p className="text-sm text-[#6b6f7e] max-w-md mx-auto mb-6">
                No chapters match your currently selected filters. Clear your filters or explore other subjects.
              </p>
              {areFiltersActive() && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#1c1c1e] text-white hover:bg-[#2c2c34] transition-all"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}