"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { useNavigate } from "react-router-dom"
import { FileText, BookOpen, Trophy, Clock, Users, Eye, Calendar, Award, HelpCircle, Tag, Folder, MessageCircle } from "lucide-react"
import { getAllQuizzesWithCategoryAndQuestions } from "../../services/operations/quizAPI"
import { getAllContest } from "../../services/operations/contestAPI"
import { getAllArticles } from "../../services/operations/articelsAPI"
import { getAllFiles } from "../../services/operations/filesAPI"
import { getAllQandA } from "../../services/operations/qandA"

export default function FilterSection({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState("files")
  const [loading, setLoading] = useState(true)
  const [renderKey, setRenderKey] = useState(0) // force re-render after data loads
  const [data, setData] = useState({
    files: [],
    articles: [],
    contest: [],
    quizzes: [],
    qanda: []
  })
  // Real counts for each category
  const [realCounts, setRealCounts] = useState({
    files: 0,
    articles: 0,
    contest: 0,
    quizzes: 0,
    qanda: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [filesRes, articlesRes, contestsRes, quizzesRes, qandaRes] = await Promise.all([
          getAllFiles(),
          getAllArticles(),
          getAllContest(),
          getAllQuizzesWithCategoryAndQuestions(),
          getAllQandA()
        ])

        const allApprovedFiles = (filesRes?.data || []).filter(file => file.status === "Approved File")
        const allApprovedArticles = (articlesRes?.data || []).filter(article => article.status === "approved")
        const allApprovedContests = (contestsRes?.data || []).filter(contest => contest.status === "Approved")
        const allApprovedQuizzes = (quizzesRes?.data || []).filter(quiz =>
          (quiz.approvalStatus === "Approved" || quiz.category?.approvalStatus === "Approved") &&
          quiz.category?.quizType === "createquiz"
        )
        const allApprovedQandAs = (qandaRes?.data || []).filter(q => q.status === "active")

        // Set real counts for display in filter tabs
        setRealCounts({
          files: allApprovedFiles.length,
          articles: allApprovedArticles.length,
          contest: allApprovedContests.length,
          quizzes: allApprovedQuizzes.length,
          qanda: allApprovedQandAs.length
        })

        // Slice to 4 for display
        const approvedFiles = allApprovedFiles.slice(0, 4)
        const approvedArticles = allApprovedArticles.slice(0, 4)
        const approvedContests = allApprovedContests.slice(0, 4)
        const approvedQuizzes = allApprovedQuizzes.slice(0, 4)
        const approvedQandAs = allApprovedQandAs.slice(0, 4)

        setData({
          files: approvedFiles,
          articles: approvedArticles,
          contest: approvedContests,
          quizzes: approvedQuizzes,
          qanda: approvedQandAs
        })
        // bump renderKey so AnimatePresence sees a new key for the default "files" tab
        setRenderKey(k => k + 1)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format count for display (e.g., "1.2K" for large numbers)
  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K+"
    }
    return count.toString()
  }

  const filters = [
    { id: "articles", label: "Posts", icon: BookOpen, count: formatCount(realCounts.articles) },
    { id: "files", label: "Files", icon: FileText, count: formatCount(realCounts.files) },
    { id: "contest", label: "Contests", icon: Trophy, count: formatCount(realCounts.contest) },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle, count: formatCount(realCounts.quizzes) },
    { id: "qanda", label: "Q & A", icon: MessageCircle, count: formatCount(realCounts.qanda) }
  ]

  const handleViewAll = () => {
    if (activeFilter === "files") navigate("/documentation")
    else if (activeFilter === "articles") navigate("/articles")
    else if (activeFilter === "contest") navigate("/contest")
    else if (activeFilter === "quizzes") navigate("/view-user-quiz")
    else if (activeFilter === "qanda") {
      // Q&A: no login check - direct navigation
      navigate("/qnada")
    }
  }

  const handleCardClick = (item) => {
    if (activeFilter === "quizzes") navigate(`/play-quiz/${item._id}`)
    else if (activeFilter === "files") navigate(`/show-file/${item._id}`)
    else if (activeFilter === "articles") navigate(`/post-view/${item._id}`)
    else if (activeFilter === "contest") {
      const token = localStorage.getItem("token")
      if (!token) navigate("/login", { state: { from: `/Contest-Enrollment/${item._id}` } })
      else navigate(`/Contest-Enrollment/${item._id}`)
    }
    else if (activeFilter === "qanda") {
      // Q&A: no login check - direct navigation
      navigate(`/user-qanda-detail/${item._id}`)
    }
  }

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-6 w-48 h-12 mx-auto animate-pulse" />
            <div className="h-10 w-3/4 mx-auto bg-gray-200 rounded-lg mb-4 animate-pulse" />
            <div className="h-6 w-1/2 mx-auto bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-gray-100 rounded-2xl p-1 inline-flex gap-1 flex-nowrap">
              {filters.map((filter) => (
                <div key={filter.id} className="px-3 sm:px-4 py-2 rounded-xl w-20 h-9 bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-5 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-4 animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-white via-blue-100 to-purple-200 relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 md:px-6 py-2 md:py-3 mb-5 md:mb-6"
          >
            <Eye className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-semibold text-sm md:text-base">Explore Resources</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-6">
            Discover Amazing{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Content
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Browse through our extensive collection of study materials, insightful articles, and challenging contests
            curated by experts and fellow students.
          </p>
        </motion.div>

        {/* Filter Tabs — scrollable on very small screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8 md:mb-12 overflow-x-auto pb-2 scrollbar-hide"
        >
          <div className="bg-gray-100 rounded-2xl md:rounded-3xl p-1 md:p-2 inline-flex shadow-inner flex-nowrap">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold transition-all duration-300 flex items-center gap-1.5 m-0.5 md:m-1 flex-shrink-0 ${
                  activeFilter === filter.id
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <filter.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{filter.label}</span>
                <span className="hidden sm:inline text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {filter.count}
                </span>
                {activeFilter === filter.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl md:rounded-2xl opacity-10"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Grid — key includes renderKey so files show on first load */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeFilter}-${renderKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8"
          >
            {data[activeFilter]?.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">
                No content available yet.
              </div>
            ) : (
              data[activeFilter]?.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => handleCardClick(item)}
                >
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-white to-gray-50 group-hover:from-purple-50 group-hover:to-pink-50 h-full">
                    <CardContent className="p-5 md:p-8 relative h-full flex flex-col">
                      {/* Category Badge */}
                      <motion.div
                        className="absolute top-3 right-3 md:top-4 md:right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold max-w-[120px] truncate"
                        whileHover={{ scale: 1.1 }}
                      >
                        {item.category?.region || item.region || item.examType || item.category?.examType || "Quiz"}
                      </motion.div>

                      {/* FILES */}
                      {activeFilter === "files" && (
                        <>
                          <div className="flex items-center justify-between mb-4 md:mb-6 mt-1">
                            <motion.div
                              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                              whileHover={{ rotate: 5 }}
                            >
                              <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </motion.div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-2 truncate max-w-[100px]">{item.category1}</span>
                          </div>
                          <h3 className="font-bold text-base md:text-xl text-gray-900 mb-3 md:mb-4 group-hover:text-purple-600 transition-colors duration-300 pr-8 line-clamp-2">
                            {item.fileTitle}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs sm:text-sm text-gray-600 mt-auto">
                            <div className="flex items-center">
                              <FileText className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.fileType} • {item.category2}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                            {item.category2 && (
                              <div className="flex items-center">
                                <Folder className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{item.category3}</span>
                              </div>
                            )}
                            {item.category4 && (
                              <div className="flex items-center">
                                <Folder className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{item.category3}</span>
                              </div>
                            )}
                            {item.category5 && (
                              <div className="flex items-center">
                                <Folder className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{item.category4}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* ARTICLES */}
                      {activeFilter === "articles" && (
                        <>
                          <div className="flex items-center justify-between mb-4 md:mb-6 mt-1">
                            <motion.div
                              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                              whileHover={{ rotate: 5 }}
                            >
                              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </motion.div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-2 truncate max-w-[100px]">{item.category || "0"}</span>
                          </div>
                          <h3 className="font-bold text-base md:text-xl text-gray-900 mb-3 md:mb-4 group-hover:text-purple-600 transition-colors duration-300 pr-8 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs sm:text-sm text-gray-600 mt-auto">
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">By {item.author?.username || "Admin"}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {Math.ceil(item.content?.length / 1000) || 5} min read
                            </div>
                            <div className="flex items-center">
                              <Tag className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.subCategory}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </>
                      )}

                      {/* CONTEST */}
                      {activeFilter === "contest" && (
                        <>
                          <div className="flex items-center justify-between mb-4 md:mb-6 mt-1">
                            <motion.div
                              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                              whileHover={{ rotate: 5 }}
                            >
                              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </motion.div>
                            <div
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                item.difficulty === "Easy"
                                  ? "bg-green-100 text-green-600"
                                  : item.difficulty === "Medium"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                              }`}
                            >
                              {item.examType}
                            </div>
                          </div>
                          <h3 className="font-bold text-base md:text-xl text-gray-900 mb-3 md:mb-4 group-hover:text-purple-600 transition-colors duration-300 pr-8 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs sm:text-sm text-gray-600 mt-auto">
                            <div className="flex items-center">
                              <Trophy className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {item.questions?.length || 0} questions
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.specificClass}</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.chapter}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {item.duration || "30 min"}
                            </div>
                          </div>
                        </>
                      )}

                      {/* QUIZZES */}
                      {activeFilter === "quizzes" && (
                        <>
                          <div className="flex items-center justify-between mb-4 md:mb-6 mt-1">
                            <div className="flex flex-row gap-2 items-center min-w-0">
                              <motion.div
                                className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                                whileHover={{ rotate: 5 }}
                              >
                                <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                              </motion.div>
                              <span className="text-sm sm:text-base md:text-lg font-bold text-purple-600 truncate">
                                Click to play quiz
                              </span>
                            </div>
                            <div
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ml-2 ${
                                item.difficulty === "Easy"
                                  ? "bg-green-100 text-green-600"
                                  : item.difficulty === "Medium"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                              }`}
                            >
                              {item.category?.examType}
                            </div>
                          </div>
                          <h3 className="font-bold text-base md:text-xl text-gray-900 mb-3 md:mb-4 group-hover:text-purple-600 transition-colors duration-300 pr-8 line-clamp-2">
                            {item.category?.quizTitle}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs sm:text-sm text-gray-600 mt-auto">
                            <div className="flex items-center">
                              <HelpCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {item.questions?.length || 0} questions
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.category?.specificClass}</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.category?.subject}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {item.category?.duration || "10 min"} limit
                            </div>
                          </div>
                        </>
                      )}

                      {/* Q&A - No login required */}
                      {activeFilter === "qanda" && (
                        <>
                          <div className="flex items-center justify-between mb-4 md:mb-6 mt-1">
                            <div className="flex flex-row gap-2 items-center min-w-0">
                              <motion.div
                                className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                                whileHover={{ rotate: 5 }}
                              >
                                <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                              </motion.div>
                              {/* <span className="text-sm sm:text-base md:text-lg font-bold text-purple-600 truncate">
                                Click to view Q&A
                              </span> */}
                            </div>
                            <div
                              className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ml-2 bg-blue-100 text-blue-600"
                            >
                              {item.category?.examType || "General"}
                            </div>
                          </div>
                          <h3 className="font-bold text-base md:text-xl text-gray-900 mb-3 md:mb-4 group-hover:text-purple-600 transition-colors duration-300 pr-8 line-clamp-2">
                            {item.chapterName || "Untitled Q&A"}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs sm:text-sm text-gray-600 mt-auto">
                            <div className="flex items-center">
                              <HelpCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {item.questions?.length || 0} questions
                            </div>
                            <div className="flex items-center">
                              <Folder className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.category?.region}</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.category?.subject}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{item.category?.specificClass}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Hover Overlay */}
                      <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl pointer-events-none" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-8 md:mt-12"
        >
          <motion.button
            onClick={handleViewAll}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group text-sm md:text-base"
          >
            View All {filters.find((f) => f.id === activeFilter)?.label}
            <motion.span
              className="ml-2 inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}