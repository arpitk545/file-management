"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  FileText,
  Calendar,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Search,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllFiles, GetFileRegion } from "../../services/operations/filesAPI";
import toast from "react-hot-toast";

export default function Documentation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategory1, setSelectedCategory1] = useState("");
  const [selectedCategory2, setSelectedCategory2] = useState("");
  const [selectedCategory3, setSelectedCategory3] = useState("");
  const [selectedCategory4, setSelectedCategory4] = useState("");
  const [selectedCategory5, setSelectedCategory5] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch regions and files on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [regionResponse, filesResponse] = await Promise.all([
          GetFileRegion(),
          getAllFiles(),
        ]);
        setRegions(regionResponse?.data || []);
        const approvedFiles = (filesResponse?.data || []).filter(
          (f) => f.status === "Approved File" || f.status === "approved" || !f.status
        );
        setAllFiles(approvedFiles);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load study files");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Category cascade helpers
  const getCategory1Options = () => {
    if (!selectedRegion) return [];
    const region = regions.find((r) => r.name === selectedRegion);
    return region?.category1?.map((cat) => cat.name) || [];
  };

  const getCategory2Options = () => {
    if (!selectedRegion || !selectedCategory1) return [];
    const region = regions.find((r) => r.name === selectedRegion);
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1);
    return category1?.category2?.map((cat) => cat.name) || [];
  };

  const getCategory3Options = () => {
    if (!selectedRegion || !selectedCategory1 || !selectedCategory2) return [];
    const region = regions.find((r) => r.name === selectedRegion);
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1);
    const category2 = category1?.category2?.find((cat) => cat.name === selectedCategory2);
    return category2?.category3?.map((cat) => cat.name) || [];
  };

  const getCategory4Options = () => {
    if (!selectedRegion || !selectedCategory1 || !selectedCategory2 || !selectedCategory3)
      return [];
    const region = regions.find((r) => r.name === selectedRegion);
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1);
    const category2 = category1?.category2?.find((cat) => cat.name === selectedCategory2);
    const category3 = category2?.category3?.find((cat) => cat.name === selectedCategory3);
    return category3?.category4?.map((cat) => cat.name) || [];
  };

  const getCategory5Options = () => {
    if (
      !selectedRegion ||
      !selectedCategory1 ||
      !selectedCategory2 ||
      !selectedCategory3 ||
      !selectedCategory4
    )
      return [];
    const region = regions.find((r) => r.name === selectedRegion);
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1);
    const category2 = category1?.category2?.find((cat) => cat.name === selectedCategory2);
    const category3 = category2?.category3?.find((cat) => cat.name === selectedCategory3);
    const category4 = category3?.category4?.find((cat) => cat.name === selectedCategory4);
    return category4?.category5?.map((cat) => cat.name) || [];
  };

  const handleRegionSelect = (regionName) => {
    setSelectedRegion(regionName);
    setSelectedCategory1("");
    setSelectedCategory2("");
    setSelectedCategory3("");
    setSelectedCategory4("");
    setSelectedCategory5("");
    setCurrentStep(2);
  };

  const handleCategory1Select = (catName) => {
    setSelectedCategory1(catName);
    setSelectedCategory2("");
    setSelectedCategory3("");
    setSelectedCategory4("");
    setSelectedCategory5("");
    setCurrentStep(3);
  };

  const handleCategory2Select = (catName) => {
    setSelectedCategory2(catName);
    setSelectedCategory3("");
    setSelectedCategory4("");
    setSelectedCategory5("");
    setCurrentStep(4);
  };

  const handleCategory3Select = (catName) => {
    setSelectedCategory3(catName);
    setSelectedCategory4("");
    setSelectedCategory5("");
    setCurrentStep(5);
  };

  const handleCategory4Select = (catName) => {
    setSelectedCategory4(catName);
    setSelectedCategory5("");
    setCurrentStep(6);
  };

  const handleCategory5Select = (catName) => {
    setSelectedCategory5(catName);
  };

  const resetFilters = () => {
    setCurrentStep(1);
    setSelectedRegion("");
    setSelectedCategory1("");
    setSelectedCategory2("");
    setSelectedCategory3("");
    setSelectedCategory4("");
    setSelectedCategory5("");
    setSearchQuery("");
  };

  const areFiltersActive = () => {
    return (
      selectedRegion !== "" ||
      selectedCategory1 !== "" ||
      selectedCategory2 !== "" ||
      selectedCategory3 !== "" ||
      selectedCategory4 !== "" ||
      selectedCategory5 !== "" ||
      searchQuery.trim() !== ""
    );
  };

  const getFilteredFiles = () => {
    return allFiles.filter((file) => {
      if (selectedRegion && file.region !== selectedRegion) return false;
      if (selectedCategory1 && file.category1 !== selectedCategory1) return false;
      if (selectedCategory2 && file.category2 !== selectedCategory2) return false;
      if (selectedCategory3 && file.category3 !== selectedCategory3) return false;
      if (selectedCategory4 && file.category4 !== selectedCategory4) return false;
      if (selectedCategory5 && file.category5 !== selectedCategory5) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = file.fileTitle?.toLowerCase().includes(q);
        const descMatch = file.fileDescription?.toLowerCase().includes(q);
        const typeMatch = file.fileType?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !typeMatch) return false;
      }
      return true;
    });
  };

  const filesToRender = getFilteredFiles();

  const handleFileClick = (fileId) => {
    navigate(`/show-file/${fileId}`);
  };

  const stepItems = [
    { num: 1, title: "Region", value: selectedRegion },
    { num: 2, title: "Level 1", value: selectedCategory1 },
    { num: 3, title: "Level 2", value: selectedCategory2 },
    { num: 4, title: "Level 3", value: selectedCategory3 },
    { num: 5, title: "Level 4", value: selectedCategory4 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-xs max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Study Vault...</h3>
          <p className="text-xs text-[#555a6a]">Fetching course materials &amp; papers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-8">

        {/* Top Header Navigation Banner */}
        <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                  <FileText className="w-3.5 h-3.5" />
                  STUDY VAULT
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  DOCUMENTATION ARCHIVE
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1c1c1e] tracking-tight">
                Course Materials &amp; Study Files
              </h1>
              <p className="text-sm sm:text-base text-[#555a6a] max-w-2xl">
                Browse verified lecture notes, question blueprints, reference guides, and syllabus documents.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap self-start md:self-center">
              {areFiltersActive() && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#b8860b] bg-[#fffdf5] border border-[#fde89c] hover:bg-[#fef9c3] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1c1c1e] hover:bg-[#2c2c34] shadow-xs transition-all active:scale-98 whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>

          {/* Step Flow Indicator */}
          <div className="mt-6 pt-6 border-t border-[#e0e2e8]">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {stepItems.map((step) => {
                const isSelected = !!step.value;
                const isCurrent = currentStep === step.num;
                return (
                  <button
                    key={step.num}
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
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
                          ? "bg-[#187574] text-white"
                          : isCurrent
                          ? "bg-[#4262ff] text-white"
                          : "bg-[#e0e2e8] text-[#555a6a]"
                      }`}
                    >
                      {isSelected ? "✓" : step.num}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-xs font-bold text-[#1c1c1e] truncate">{step.title}</p>
                      <p className="text-xs text-[#555a6a] truncate">
                        {step.value || "All / Any"}
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
          
          {/* Left Side: Guided Smart Filter Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 shadow-xs sticky top-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ffd02f] flex items-center justify-center text-[#1c1c1e] font-bold">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1c1c1e]">Guided Filters</h2>
                    <p className="text-xs text-[#555a6a]">Narrow down study files</p>
                  </div>
                </div>
                {areFiltersActive() && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-[#4262ff] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#555a6a] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files by title, format..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#c7cad5] rounded-xl text-xs font-medium text-[#1c1c1e] focus:outline-hidden focus:border-[#4262ff] transition-colors"
                />
              </div>

              {/* Dynamic Steps */}
              <AnimatePresence mode="wait">
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
                      <span className="text-xs text-[#555a6a]">
                        {regions.length} available
                      </span>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {regions.map((region) => {
                        const isSelected = selectedRegion === region.name;
                        return (
                          <button
                            key={region._id || region.name}
                            onClick={() => handleRegionSelect(region.name)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "bg-[#fff8e0] border-[#ffd02f] font-bold shadow-2xs"
                                : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                            }`}
                          >
                            <span className="text-xs font-medium text-[#1c1c1e] truncate">
                              {region.name}
                            </span>
                            <span className="text-xs font-bold text-[#555a6a] bg-white px-2 py-0.5 rounded-full border border-[#e0e2e8]">
                              {region.category1?.length || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

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
                        Step 2: Level 1
                      </span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Change Region
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {getCategory1Options().map((cat) => {
                        const isSelected = selectedCategory1 === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => handleCategory1Select(cat)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "bg-[#c3faf5] border-[#0fbcb0] font-bold text-[#187574] shadow-2xs"
                                : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                            }`}
                          >
                            <span className="text-xs font-medium text-[#1c1c1e] truncate">
                              {cat}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

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
                        Step 3: Level 2
                      </span>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Back
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {getCategory2Options().map((cat) => {
                        const isSelected = selectedCategory2 === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => handleCategory2Select(cat)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "bg-[#ffd8f4] border-[#86296b] font-bold text-[#86296b] shadow-2xs"
                                : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                            }`}
                          >
                            <span className="text-xs font-medium text-[#1c1c1e] truncate">
                              {cat}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {currentStep >= 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#746019] bg-[#fff8e0] px-2.5 py-0.5 rounded-md">
                        Further Sub-Levels
                      </span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Reset Steps
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {getCategory3Options().map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategory3Select(cat)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5] text-left transition-all"
                        >
                          <span className="text-xs font-medium text-[#1c1c1e] truncate">
                            {cat}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Criteria Box */}
              {areFiltersActive() && (
                <div className="p-3.5 bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-[#555a6a] uppercase tracking-wider text-[10px] block">
                    Active Filters
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRegion && (
                      <span className="px-2 py-0.5 rounded-md bg-[#fff8e0] text-[#746019] border border-[#fde89c] font-medium text-xs">
                        {selectedRegion}
                      </span>
                    )}
                    {selectedCategory1 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#c3faf5] text-[#187574] border border-[#9eece4] font-medium text-xs">
                        {selectedCategory1}
                      </span>
                    )}
                    {selectedCategory2 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5] font-medium text-xs">
                        {selectedCategory2}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#c7cad5] text-[#1c1c1e] font-medium text-xs">
                        "{searchQuery}"
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Files Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                  Available Study Files
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd02f] text-[#1c1c1e]">
                  {filesToRender.length}
                </span>
              </div>
              <span className="text-xs text-[#555a6a]">
                Showing approved course resources
              </span>
            </div>

            {filesToRender.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#fff4c4] text-[#746019] flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1c1c1e]">
                    No Files Found
                  </h3>
                  <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
                    {areFiltersActive()
                      ? "No approved course files match your current filters. Try changing your filters."
                      : "There are currently no approved files in the repository yet. Check back soon!"}
                  </p>
                </div>
                {areFiltersActive() && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filesToRender.map((file, index) => (
                  <motion.div
                    key={file._id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    onClick={() => handleFileClick(file._id)}
                    className="bg-white rounded-2xl border border-[#c7cad5] hover:border-[#1c1c1e] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
                          {file.fileType || "PDF"}
                        </span>
                        {file.fileSize && (
                          <span className="text-xs font-semibold text-[#555a6a]">
                            {file.fileSize}
                          </span>
                        )}
                      </div>

                      {/* File Title */}
                      <h3 className="text-base font-bold text-[#1c1c1e] group-hover:text-[#4262ff] transition-colors leading-snug line-clamp-2">
                        {file.fileTitle || "Study Document"}
                      </h3>

                      {/* Excerpt */}
                      {file.fileDescription && (
                        <p className="text-xs text-[#555a6a] line-clamp-2 leading-relaxed">
                          {file.fileDescription.replace(/<[^>]+>/g, " ")}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {file.region && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#c3faf5] text-[#187574]">
                            {file.region}
                          </span>
                        )}
                        {file.category1 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#ffd8f4] text-[#86296b]">
                            {file.category1}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-3 border-t border-[#f0f2f5] flex items-center justify-between">
                      <span className="text-xs text-[#555a6a] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {file.createdAt
                          ? new Date(file.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : "Verified"}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileClick(file._id);
                        }}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-2xs group-hover:shadow-xs active:scale-98"
                      >
                        <span>Access File</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
