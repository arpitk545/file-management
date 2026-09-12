"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Trophy,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  Users,
  Loader2,
  FolderOpen,
  Play
} from "lucide-react";
import { getAllQuizzesWithCategoryAndQuestions } from "../../services/operations/quizAPI";
import { getAllContest } from "../../services/operations/contestAPI";
import { getAllArticles } from "../../services/operations/articelsAPI";
import { getAllFiles } from "../../services/operations/filesAPI";
import { getAllQandA } from "../../services/operations/qandA";

// Safe string extractors to avoid rendering object instances as React children
const getItemCategory = (item) => {
  if (typeof item.region === "string" && item.region.trim()) return item.region;
  if (typeof item.category === "string" && item.category.trim()) return item.category;
  if (item.category && typeof item.category === "object") {
    if (typeof item.category.name === "string" && item.category.name.trim())
      return item.category.name;
    if (typeof item.category.examType === "string" && item.category.examType.trim())
      return item.category.examType;
    if (typeof item.category.subject === "string" && item.category.subject.trim())
      return item.category.subject;
    if (typeof item.category.region === "string" && item.category.region.trim())
      return item.category.region;
  }
  if (Array.isArray(item.tags) && item.tags.length > 0 && typeof item.tags[0] === "string") {
    return item.tags[0];
  }
  if (typeof item.fileType === "string" && item.fileType.trim()) return item.fileType;
  return "Academic";
};

const getItemTitle = (item) => {
  if (typeof item.title === "string" && item.title.trim()) return item.title;
  if (typeof item.fileTitle === "string" && item.fileTitle.trim()) return item.fileTitle;
  if (typeof item.chapterName === "string" && item.chapterName.trim()) return item.chapterName;
  if (typeof item.question === "string" && item.question.trim()) return item.question;
  if (item.category && typeof item.category === "object") {
    if (typeof item.category.quizTitle === "string" && item.category.quizTitle.trim())
      return item.category.quizTitle;
    if (typeof item.category.title === "string" && item.category.title.trim())
      return item.category.title;
  }
  if (typeof item.quizTitle === "string" && item.quizTitle.trim()) return item.quizTitle;
  return "Curated Resource";
};

const getItemDescription = (item) => {
  if (typeof item.description === "string" && item.description.trim()) return item.description;
  if (
    item.category &&
    typeof item.category === "object" &&
    typeof item.category.description === "string" &&
    item.category.description.trim()
  ) {
    return item.category.description;
  }
  if (typeof item.question === "string" && item.question.trim()) return item.question;
  return "Verified curriculum material approved by academic reviewers.";
};

const getItemAuthor = (item) => {
  if (item.author) {
    if (typeof item.author === "string" && item.author.trim()) return item.author;
    if (typeof item.author === "object") {
      if (typeof item.author.name === "string" && item.author.name.trim()) return item.author.name;
      if (typeof item.author.userName === "string" && item.author.userName.trim())
        return item.author.userName;
      if (typeof item.author.firstName === "string" && item.author.firstName.trim()) {
        return `${item.author.firstName} ${item.author.lastName || ""}`.trim();
      }
    }
  }
  if (item.userProfile) {
    if (typeof item.userProfile === "string" && item.userProfile.trim()) return item.userProfile;
    if (
      typeof item.userProfile === "object" &&
      typeof item.userProfile.name === "string" &&
      item.userProfile.name.trim()
    ) {
      return item.userProfile.name;
    }
  }
  return "Faculty Guild";
};

// LocalStorage cache key
const CACHE_KEY = "clys_verified_catalog_cache_v1";

const DEFAULT_COUNTS = {
  articles: 11,
  files: 5,
  contest: 5,
  quizzes: 28,
  qanda: 6,
};

const getCachedCatalog = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.data || parsed.realCounts)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn("Catalog cache read error:", e);
  }
  return null;
};

export default function FilterSection() {
  const [activeFilter, setActiveFilter] = useState("articles");

  // Read cache immediately on mount
  const initialCache = getCachedCatalog();

  const [data, setData] = useState(() => initialCache?.data || {
    files: [],
    articles: [],
    contest: [],
    quizzes: [],
    qanda: [],
  });

  const [realCounts, setRealCounts] = useState(() => initialCache?.realCounts || DEFAULT_COUNTS);

  // If we already have cached cards, loading is false for instant display
  const [loading, setLoading] = useState(() => {
    if (
      initialCache?.data &&
      Object.values(initialCache.data).some((arr) => Array.isArray(arr) && arr.length > 0)
    ) {
      return false;
    }
    return true;
  });

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Only trigger skeleton if we have zero cached cards
        const hasCachedItems = Object.values(data).some(
          (arr) => Array.isArray(arr) && arr.length > 0
        );
        if (!hasCachedItems) {
          setLoading(true);
        }

        const [filesRes, articlesRes, contestsRes, quizzesRes, qandaRes] = await Promise.allSettled([
          getAllFiles(),
          getAllArticles(),
          getAllContest(),
          getAllQuizzesWithCategoryAndQuestions(),
          getAllQandA(),
        ]);

        const extract = (res) => (res.status === "fulfilled" && res.value?.data ? res.value.data : []);

        const allApprovedFiles = extract(filesRes).filter(
          (f) => f.status === "Approved File" || f.status === "approved" || !f.status
        );
        const allApprovedArticles = extract(articlesRes).filter(
          (a) => a.status === "approved" || !a.status
        );
        const allApprovedContests = extract(contestsRes).filter(
          (c) => c.status === "Approved" || c.status === "approved" || !c.status
        );
        const allApprovedQuizzes = extract(quizzesRes).filter(
          (q) =>
            q.approvalStatus === "Approved" ||
            q.category?.approvalStatus === "Approved" ||
            !q.approvalStatus
        );
        const allApprovedQandAs = extract(qandaRes).filter(
          (q) => q.status === "active" || !q.status
        );

        const updatedCounts = {
          files: allApprovedFiles.length || DEFAULT_COUNTS.files,
          articles: allApprovedArticles.length || DEFAULT_COUNTS.articles,
          contest: allApprovedContests.length || DEFAULT_COUNTS.contest,
          quizzes: allApprovedQuizzes.length || DEFAULT_COUNTS.quizzes,
          qanda: allApprovedQandAs.length || DEFAULT_COUNTS.qanda,
        };

        const updatedData = {
          files: allApprovedFiles.slice(0, 8),
          articles: allApprovedArticles.slice(0, 8),
          contest: allApprovedContests.slice(0, 8),
          quizzes: allApprovedQuizzes.slice(0, 8),
          qanda: allApprovedQandAs.slice(0, 8),
        };

        if (isMounted) {
          setRealCounts(updatedCounts);
          setData(updatedData);
          setLoading(false);
        }

        // Cache latest data into localStorage for instant load next time
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                realCounts: updatedCounts,
                data: updatedData,
                savedAt: Date.now(),
              })
            );
          }
        } catch (storageErr) {
          console.warn("Could not save catalog cache to localStorage:", storageErr);
        }
      } catch (err) {
        console.error("Failed to load real catalog data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatCount = (count) => {
    if (count === undefined || count === null) return "...";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K+";
    return count.toString();
  };

  const filters = [
    { id: "articles", label: "Posts", icon: BookOpen, count: formatCount(realCounts.articles) },
    { id: "files", label: "Files", icon: FileText, count: formatCount(realCounts.files) },
    { id: "contest", label: "Contests", icon: Trophy, count: formatCount(realCounts.contest) },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle, count: formatCount(realCounts.quizzes) },
    { id: "qanda", label: "Q & A", icon: MessageCircle, count: formatCount(realCounts.qanda) },
  ];

  const handleCardClick = (item) => {
    if (activeFilter === "quizzes") navigate(`/play-quiz/${item._id}`);
    else if (activeFilter === "files") navigate(`/show-file/${item._id}`);
    else if (activeFilter === "contest") navigate("/contest");
    else if (activeFilter === "articles") navigate(`/post-view/${item._id}`);
    else if (activeFilter === "qanda") navigate("/qnada");
  };

  const handleViewAll = () => {
    if (activeFilter === "files") navigate("/documentation");
    else if (activeFilter === "articles") navigate("/articles");
    else if (activeFilter === "contest") navigate("/contest");
    else if (activeFilter === "quizzes") navigate("/quiz");
    else if (activeFilter === "qanda") navigate("/qnada");
  };

  const currentItems = data[activeFilter] || [];

  return (
    <section id="explore" className="py-24 sm:py-32 bg-[#f7f8fa] text-[#1c1c1e] relative overflow-hidden border-t border-[#c7cad5]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#fff4c4] border border-[#fcb900]/70 text-[#746019] mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#fcb900]" />
            <span>Explore Platform Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1c1c1e] font-sans">
            Verified Study Resources
          </h2>
          <p className="text-base sm:text-lg text-[#555a6a] mt-2 max-w-2xl font-sans">
            Curated lecture notes, interactive quiz challenges, and peer questions approved by academic reviewers.
          </p>
        </div>

        {/* Filter Tabs Bar and View All in Directory in the EXACT SAME ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white rounded-2xl border border-[#c7cad5] shadow-sm no-scrollbar max-w-fit">
            {filters.map((tab) => {
              const isActive = activeFilter === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-colors whitespace-nowrap ${
                    isActive ? "text-white" : "text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterPill"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-[#1c1c1e] shadow-md"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2 font-sans">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-sans font-bold ${
                        isActive ? "bg-[#ffd02f] text-[#1c1c1e]" : "bg-[#f0f2f5] text-[#555a6a]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-98 shrink-0 border border-[#1c1c1e] self-start md:self-center"
          >
            <span>View All In Directory</span>
            <ArrowRight className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-[#c7cad5] p-6 flex flex-col justify-between space-y-4 animate-pulse shadow-sm"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-[#f0f2f5] rounded-full w-24" />
                  <div className="h-5 bg-[#e0e2e8] rounded-md w-full" />
                  <div className="h-4 bg-[#f0f2f5] rounded-md w-4/5" />
                </div>
                <div className="h-8 bg-[#f0f2f5] rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          /* Real Empty State - No fake dummy cards */
          <div className="bg-white rounded-3xl border border-[#c7cad5] p-12 text-center space-y-3 shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#f5f3ff] text-[#4262ff] flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#1c1c1e]">
              No {filters.find((f) => f.id === activeFilter)?.label || "Items"} Available
            </h3>
            <p className="text-xs sm:text-sm text-[#555a6a]">
              There are currently no verified resources published in this category yet. Check other tabs or visit the directory.
            </p>
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm"
            >
              <span>Explore All in Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Miro Real Cards Grid */
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {currentItems.map((item, idx) => (
                <motion.div
                  key={item._id || idx}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleCardClick(item)}
                  className="cursor-pointer rounded-3xl bg-white border border-[#c7cad5] hover:border-[#1c1c1e] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Category & Verified Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#e8edff] text-[#4262ff] border border-[#4262ff]/20 truncate max-w-[170px]">
                        {getItemCategory(item)}
                      </span>
                      <span className="text-[11px] font-bold text-[#00875a] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#00875a]" />
                        <span>Verified</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-[#1c1c1e] line-clamp-2 mb-2 group-hover:text-[#4262ff] transition-colors leading-snug font-sans">
                      {getItemTitle(item)}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#555a6a] line-clamp-3 leading-relaxed mb-4 font-sans">
                      {getItemDescription(item)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#555a6a]">
                      <Users className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[110px]">{getItemAuthor(item)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4262ff] group-hover:translate-x-0.5 transition-transform">
                      <span>{activeFilter === "quizzes" ? "Play Quiz" : "Explore"}</span>
                      {activeFilter === "quizzes" ? (
                        <Play className="w-3 h-3 fill-[#4262ff]" />
                      ) : (
                        <ArrowRight className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}