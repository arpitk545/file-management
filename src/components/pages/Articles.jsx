"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Filter,
  Eye,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Search,
  Loader2
} from "lucide-react";
import {
  getAllArticles,
  getAllRegionsWithStructure
} from "../../services/operations/articelsAPI";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Articles() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allArticles, setAllArticles] = useState([]);
  const [regionStructure, setRegionStructure] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getAllArticles();
        if (response?.success) {
          const approvedArticles = (response.data || []).filter(
            (article) => article.status === "approved" || !article.status
          );
          setAllArticles(approvedArticles);
        } else {
          toast.error("Failed to fetch articles");
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast.error("Error loading articles");
      }
    };
    fetchArticles();
  }, []);

  // Fetch region structure with categories and subcategories
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getAllRegionsWithStructure();
        if (response?.regions?.length > 0) {
          setRegionStructure(response.regions);
        } else if (Array.isArray(response)) {
          setRegionStructure(response);
        }
      } catch (error) {
        console.error("Error fetching region structure:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setCurrentStep(2);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setCurrentStep(3);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  const resetFilters = () => {
    setCurrentStep(1);
    setSelectedRegion(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSearchQuery("");
  };

  const areFiltersActive = () => {
    return (
      selectedRegion !== null ||
      selectedCategory !== null ||
      selectedSubCategory !== null ||
      searchQuery.trim() !== ""
    );
  };

  const getFilteredArticles = () => {
    return allArticles.filter((article) => {
      if (selectedRegion && article.region !== selectedRegion.name) return false;
      if (selectedCategory && article.category !== selectedCategory.name) return false;
      if (selectedSubCategory && article.subCategory !== selectedSubCategory.name)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = article.title?.toLowerCase().includes(q);
        const contentMatch = article.content?.toLowerCase().includes(q);
        const authorMatch = (
          article.author?.username ||
          article.author?.name ||
          ""
        )
          .toLowerCase()
          .includes(q);
        if (!titleMatch && !contentMatch && !authorMatch) return false;
      }
      return true;
    });
  };

  const articlesToRender = getFilteredArticles();

  const handleArticleClick = (articleId) => {
    navigate(`/post-view/${articleId}`);
  };

  const categories = selectedRegion ? selectedRegion.category || [] : [];
  const subCategories = selectedCategory ? selectedCategory.subCategory || [] : [];

  const stepItems = [
    { num: 1, title: "Region", value: selectedRegion?.name },
    { num: 2, title: "Category", value: selectedCategory?.name },
    { num: 3, title: "Subcategory", value: selectedSubCategory?.name },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-xs max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Articles...</h3>
          <p className="text-xs text-[#555a6a]">Fetching academic repository</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-8">

        {/* Miro Top Navigation Bar */}
        <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
                  <BookOpen className="w-3.5 h-3.5" />
                  KNOWLEDGE REPOSITORY
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  PUBLICATIONS &amp; ARTICLES
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1c1c1e] tracking-tight">
                Educational Posts &amp; Research
              </h1>
              <p className="text-sm sm:text-base text-[#555a6a] max-w-2xl">
                Discover verified articles, in-depth academic guides, and research publications authored by faculty &amp; researchers.
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stepItems.map((step) => {
                const isSelected = !!step.value;
                const isCurrent = currentStep === step.num;
                return (
                  <button
                    key={step.num}
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? "border-[#4262ff] bg-[#f5f3ff] ring-2 ring-[#4262ff]/20"
                        : isSelected
                        ? "border-[#c7cad5] bg-white"
                        : "border-[#e0e2e8] bg-[#f7f8fa] opacity-75"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
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
                      <p className="text-xs font-bold text-[#1c1c1e]">{step.title}</p>
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
                    <h2 className="text-base font-bold text-[#1c1c1e]">Smart Filters</h2>
                    <p className="text-xs text-[#555a6a]">Narrow down publications</p>
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
                  placeholder="Search articles by title or keyword..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#c7cad5] rounded-xl text-xs font-medium text-[#1c1c1e] focus:outline-hidden focus:border-[#4262ff] transition-colors"
                />
              </div>

              {/* Dynamic Filter Steps */}
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
                        {regionStructure.length} available
                      </span>
                    </div>
                    <p className="text-xs text-[#555a6a]">Select primary curriculum territory:</p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {regionStructure.map((region) => {
                        const isSelected = selectedRegion?.name === region.name;
                        return (
                          <button
                            key={region._id || region.name}
                            onClick={() => handleRegionSelect(region)}
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
                              {region.category?.length || 0}
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
                        Step 2: Category
                      </span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Change Region
                      </button>
                    </div>
                    <p className="text-xs text-[#555a6a]">
                      Categories in <strong>{selectedRegion?.name}</strong>:
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {categories.length > 0 ? (
                        categories.map((category) => {
                          const isSelected = selectedCategory?.name === category.name;
                          return (
                            <button
                              key={category._id || category.name}
                              onClick={() => handleCategorySelect(category)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "bg-[#c3faf5] border-[#0fbcb0] font-bold text-[#187574] shadow-2xs"
                                  : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                              }`}
                            >
                              <span className="text-xs font-medium text-[#1c1c1e] truncate">
                                {category.name}
                              </span>
                              <span className="text-xs font-bold text-[#555a6a] bg-white px-2 py-0.5 rounded-full border border-[#e0e2e8]">
                                {category.subCategory?.length || 0}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#555a6a] p-3 text-center">
                          No categories configured for this region.
                        </div>
                      )}
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
                        Step 3: Subcategory
                      </span>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold text-[#4262ff] hover:underline"
                      >
                        Change Category
                      </button>
                    </div>
                    <p className="text-xs text-[#555a6a]">
                      Subcategories in <strong>{selectedCategory?.name}</strong>:
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {subCategories.length > 0 ? (
                        subCategories.map((subCategory) => {
                          const isSelected =
                            selectedSubCategory?.name === subCategory.name;
                          return (
                            <button
                              key={subCategory._id || subCategory.name}
                              onClick={() => handleSubCategorySelect(subCategory)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "bg-[#ffd8f4] border-[#86296b] font-bold text-[#86296b] shadow-2xs"
                                  : "bg-[#f7f8fa] border-[#e0e2e8] hover:bg-white hover:border-[#c7cad5]"
                              }`}
                            >
                              <span className="text-xs font-medium text-[#1c1c1e] truncate">
                                {subCategory.name}
                              </span>
                              {isSelected && <CheckCircle className="w-4 h-4 text-[#86296b]" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#555a6a] p-3 text-center">
                          No granular subcategories configured.
                        </div>
                      )}
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
                        {selectedRegion.name}
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="px-2 py-0.5 rounded-md bg-[#c3faf5] text-[#187574] border border-[#9eece4] font-medium text-xs">
                        {selectedCategory.name}
                      </span>
                    )}
                    {selectedSubCategory && (
                      <span className="px-2 py-0.5 rounded-md bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5] font-medium text-xs">
                        {selectedSubCategory.name}
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

          {/* Right Side: Articles Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                  Published Articles
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd02f] text-[#1c1c1e]">
                  {articlesToRender.length}
                </span>
              </div>
              <span className="text-xs text-[#555a6a]">
                Showing peer-reviewed educational posts
              </span>
            </div>

            {articlesToRender.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#fff4c4] text-[#746019] flex items-center justify-center mx-auto">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1c1c1e]">
                    No Articles Found
                  </h3>
                  <p className="text-xs text-[#555a6a] max-w-sm mx-auto">
                    {areFiltersActive()
                      ? "No published articles match your current filters. Try selecting a broader category or region."
                      : "There are currently no approved articles published yet. Check back soon!"}
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
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {articlesToRender.map((article, index) => (
                  <motion.div
                    key={article._id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    onClick={() => handleArticleClick(article._id)}
                    className="bg-white rounded-2xl border border-[#c7cad5] hover:border-[#1c1c1e] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
                  >
                    {/* Top Row: Badges & Views */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.region && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                            {article.region}
                          </span>
                        )}
                        {article.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
                            {article.category}
                          </span>
                        )}
                        {article.subCategory && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
                            {article.subCategory}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#555a6a]">
                        <Eye className="w-4 h-4 text-[#4262ff]" />
                        <span>{article.views || 0} reads</span>
                      </div>
                    </div>

                    {/* Article Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-[#1c1c1e] group-hover:text-[#4262ff] transition-colors leading-snug">
                      {article.title}
                    </h3>

                    {/* Content Preview */}
                    <div
                      className="text-xs sm:text-sm text-[#555a6a] line-clamp-3 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          article.content?.replace(/<[^>]+>/g, " ").substring(0, 180) +
                          (article.content?.length > 180 ? "..." : "")
                      }}
                    />

                    {/* Footer Row: Meta details & CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f0f2f5]">
                      <div className="flex items-center gap-4 text-xs text-[#555a6a] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#187574]" />
                          <span>By {article.author?.username || "Faculty Staff"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#746019]" />
                          <span>{Math.ceil((article.content?.length || 500) / 800) || 3} min read</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#86296b]" />
                          <span>
                            {article.createdAt
                              ? new Date(article.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              : "Recent"}
                          </span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArticleClick(article._id);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-2xs group-hover:shadow-xs self-start sm:self-auto active:scale-98 whitespace-nowrap shrink-0"
                      >
                        <span className="whitespace-nowrap">Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
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
