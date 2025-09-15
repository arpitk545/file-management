"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { useNavigate } from "react-router-dom"
import { FileText, BookOpen, Trophy, Clock,  Users, Eye, Calendar, Award, HelpCircle, Tag, Folder } from "lucide-react"
import { getAllQuizzesWithCategoryAndQuestions } from "../../services/operations/quizAPI"
import { getAllContest } from "../../services/operations/contestAPI"
import { getAllArticles } from "../../services/operations/articelsAPI"
import { getAllFiles } from "../../services/operations/filesAPI" 
//import toast from "react-hot-toast"

export default function FilterSection({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState("files")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    files: [],
    articles: [],
    contest: [],
    quizzes: []
  })
  const navigate = useNavigate()

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [filesRes, articlesRes, contestsRes, quizzesRes] = await Promise.all([
          getAllFiles(),
          getAllArticles(),
          getAllContest(),
          getAllQuizzesWithCategoryAndQuestions()
        ])

        // Process files data
        const approvedFiles = (filesRes?.data || [])
          .filter(file => file.status === "Approved File")
          .slice(0, 4) 

        // Process articles data
        const approvedArticles = (articlesRes?.data || [])
          .filter(article => article.status === "approved")
          .slice(0, 4)

        // Process contests data
        const approvedContests = (contestsRes?.data || [])
          .filter(contest => contest.status === "Approved")
          .slice(0, 4)

        const approvedQuizzes = (quizzesRes?.data || [])
           .filter(quiz =>(quiz.approvalStatus === "Approved" || quiz.category?.approvalStatus === "Approved") &&
            quiz.category?.quizType === "createquiz" 
           )
           .slice(0, 4); 


        setData({
          files: approvedFiles,
          articles: approvedArticles,
          contest: approvedContests,
          quizzes: approvedQuizzes
        })

      } catch (error) {
        console.error("Failed to fetch data:", error)
        //toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filters = [
    { id: "articles", label: "Posts", icon: BookOpen, count: "1.2K+" },
    { id: "files", label: "Files", icon: FileText, count: "2.5K+" },
    { id: "contest", label: "Contests", icon: Trophy, count: "500+" },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle, count: "300+" }
  ]

  const handleViewAll = () => {
  const token = localStorage.getItem("token")

  if (activeFilter === "files") {
    navigate("/documentation")
  } else if (activeFilter === "articles") {
    navigate("/articles")
  } else if (activeFilter === "contest") {
    navigate("/contest")
  } else if (activeFilter === "quizzes") {
      navigate("/view-user-quiz")
  }
}

if (loading) {
  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-6 w-48 h-12 mx-auto animate-pulse"></div>
          <div className="h-12 w-3/4 mx-auto bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 w-1/2 mx-auto bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="flex justify-center mb-8 md:mb-12 px-4">
          <div className="bg-gray-100 rounded-2xl p-1 inline-flex shadow-inner">
            {filters.map((filter) => (
              <div key={filter.id} className="px-6 py-3 rounded-xl m-1 w-24 h-10 bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="group cursor-pointer">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6 md:p-8 relative">
                  <div className="absolute top-4 right-4 w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View More Button Skeleton */}
        <div className="text-center mt-8 md:mt-12">
          <div className="inline-block w-32 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
  return (
    <section className="py-12 md:py-20  bg-gradient-to-br from-white via-blue-100 to-purple-200 relative overflow-hidden">
      {/* Background Elements */}
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
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 md:px-6 py-2 md:py-3 mb-6"
          >
            <Eye className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-semibold text-sm md:text-base">Explore Resources</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
            Discover Amazing{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Content
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Browse through our extensive collection of study materials, insightful articles, and challenging contests
            curated by experts and fellow students.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8 md:mb-12 px-4"
        >
          <div className="bg-gray-100 rounded-2xl md:rounded-3xl p-1 md:p-2 inline-flex flex-wrap justify-center shadow-inner max-w-full">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 m-1 ${
                  activeFilter === filter.id
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <filter.icon className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm">{filter.label}</span>
                <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
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

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {data[activeFilter]?.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group cursor-pointer"
                onClick={() => {
                   const token = localStorage.getItem("token")
                  if (activeFilter === "quizzes") {
                    navigate(`/play-quiz/${item._id}`)
                  } else if (activeFilter === "files") {
                    navigate(`/show-file/${item._id}`)
                  } else if (activeFilter === "articles") {
                    navigate(`/post-view/${item._id}`)
                  } else if (activeFilter === "contest") {
                    if(!token){
                    navigate("/login", { state: { from: `/Contest-Enrollment/${item._id}` } })
                    }
                  }
                }}
              >
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-white to-gray-50 group-hover:from-purple-50 group-hover:to-pink-50">
                  <CardContent className="p-6 md:p-8 relative">
                    {/* Category Badge */}
                    <motion.div
                      className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold"
                      whileHover={{ scale: 1.1 }}
                    >
                      {item.category?.region || item.region || item.examType || "Quiz"}
                    </motion.div>

                    {activeFilter === "files" && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <motion.div
                            className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: 5 }}
                          >
                            <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </motion.div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold text-gray-700">{item.category1}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                          {item.fileTitle}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            {item.fileType} • {item.category2}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                           {item.category2 && (
                               <div className="flex items-center">
                                 <Folder className="h-4 w-4 mr-2" />
                                 {item.category3}
                               </div>
                             )}
                           
                             {/* Category 3 */}
                             {item.category4 && (
                               <div className="flex items-center">
                                 <Folder className="h-4 w-4 mr-2" />
                                 {item.category3}
                               </div>
                             )}
                           
                             {/* Category 4 */}
                             {item.category5 && (
                               <div className="flex items-center">
                                 <Folder className="h-4 w-4 mr-2" />
                                 {item.category4}
                               </div>
                             )}
                        </div>
                      </>
                    )}

                    {activeFilter === "articles" && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <motion.div
                            className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: 5 }}
                          >
                            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </motion.div>
                          <div className="flex items-center space-x-1">
                            {/* <Eye className="h-4 w-4 text-blue-500" /> */}
                            <span className="text-sm font-semibold text-gray-700">{item.category || "0"}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            By {item.author?.username || "Admin"}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {Math.ceil(item.content?.length / 1000) || 5} min read
                          </div>
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2" />
                            {item.subCategory}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </>
                    )}

                    {activeFilter === "contest" && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <motion.div
                            className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: 5 }}
                          >
                            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </motion.div>
                          <div
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${
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
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 mr-2" />
                            {item.questions?.length || 0} questions
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {item.specificClass} 
                          </div>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-2" />
                            {item.chapter}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {item.duration || "30 min"}
                          </div>
                        </div>
                      </>
                    )}

                    {activeFilter === "quizzes" && (
                      <>
                        <div className="flex items-center justify-between mb-6">
                         <div className="flex flex-row gap-2 items-center">
                      <motion.div
                        className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </motion.div>
                      <span className="text-base sm:text-lg md:text-2xl font-bold text-purple-600 whitespace-nowrap">
                        Click to play quiz
                      </span>
                    </div>
                      <div
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              item.difficulty === "Easy"
                                ? "bg-green-100 text-green-600"
                                : item.difficulty === "Medium"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {item.category.examType}
                          </div>
                        </div>
                        {/* Rest of your quiz card content remains unchanged */}
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                          {item.category.quizTitle}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            {item.questions?.length || 0} questions
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {item.category.specificClass}
                          </div>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-2" />
                            {item.category.subject}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {item.category.duration || "10 min"} limit
                          </div>
                        </div>
                      </>
                    )}
                  {/* Hover Effect Overlay */}
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}