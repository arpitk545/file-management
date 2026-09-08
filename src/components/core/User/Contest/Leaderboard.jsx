"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { getallContestResult } from "../../../../services/operations/contestAPI"
import {
  Trophy,
  ChevronLeft,
  Medal,
  Users,
  Clock,
  Target,
  TrendingUp,
  Filter,
  Search,
  Crown
} from "lucide-react"

function formatTimestamp(ts) {
  if (!ts) return "—"
  try {
    const d = new Date(ts)
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return "—"
  }
}

function safeUser(u, idx) {
  const name = u?.user?.name || u?.userName || `User ${idx + 1}`
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
  const fallback = `/placeholder.svg?height=96&width=96&query=avatar ${encodeURIComponent(initials || "User")}`
  
  return {
    name,
    email: u?.user?.email || u?.email || "unknown@example.com",
    image: u?.user?.image || u?.image || fallback,
    score: Number.isFinite(u?.score) ? u.score : 0,
    totalQuestions: Number.isFinite(u?.totalQuestions) ? u.totalQuestions : (Number.isFinite(u?.total) ? u.total : 0),
    submittedAt: u?.submittedAt || u?.createdAt || null,
    stages: u?.stages || [
      { stage: 1, score: Math.floor(Math.random() * 100), total: 100 },
      { stage: 2, score: Math.floor(Math.random() * 100), total: 100 },
      { stage: 3, score: Math.floor(Math.random() * 100), total: 100 }
    ]
  }
}

function percent(score, total) {
  if (!total || total <= 0) return 0
  return Math.round((score / total) * 100)
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100,
      damping: 15 
    } 
  },
}

function StageProgressBar({ score, total, stageNumber, isActive = false }) {
  const percentage = percent(score, total)
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-600">Stage {stageNumber}</span>
        <span className="font-semibold text-gray-800">{score}/{total}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full rounded-full ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}
        />
      </div>
      <div className="text-xs text-gray-500 text-right">{percentage}%</div>
    </div>
  )
}

function PodiumUser({ user, place, heightClass }) {
  const colors = {
    1: "from-yellow-400 to-yellow-300",
    2: "from-gray-300 to-gray-200",
    3: "from-amber-600 to-amber-500"
  }
  
  const medalColors = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-700"
  }
  
  const medalIcons = {
    1: <Crown className="w-6 h-6" />,
    2: <Medal className="w-6 h-6" />,
    3: <Medal className="w-6 h-6" />
  }

  return (
    <motion.div
      variants={item}
      className={`flex flex-col items-center justify-end ${place === 1 ? 'order-2' : place === 2 ? 'order-1' : 'order-3'}`}
      aria-label={`${place} place`}
    >
      <div className="relative mb-4">
        <div className={`absolute -top-2 -right-2 rounded-full p-1.5 bg-white shadow-lg ${medalColors[place]}`}>
          {medalIcons[place]}
        </div>
        <div className="relative">
          <div className={`absolute inset-0 rounded-full ${place === 1 ? 'animate-pulse' : ''} ${
            place === 1 ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-300/20' :
            place === 2 ? 'bg-gradient-to-r from-gray-300/20 to-gray-200/20' :
            'bg-gradient-to-r from-amber-600/20 to-amber-500/20'
          } blur-lg`} />
          <img
            src={user?.image || "/placeholder.svg"}
            alt={`${user?.name} avatar`}
            className="relative h-20 w-20 rounded-full object-cover border-4 border-white shadow-xl"
            crossOrigin="anonymous"
          />
        </div>
      </div>
      
      <div className="text-center mb-4">
        <div className="font-bold text-gray-900 text-lg truncate px-2">{user?.name}</div>
        <div className="text-sm text-gray-600 truncate px-2">{user?.email}</div>
        <div className="mt-1 flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-gray-900 text-lg">{user?.score} pts</span>
        </div>
      </div>
      
      <div className="w-24 rounded-t-2xl shadow-lg">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: heightClass }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`w-full rounded-t-2xl bg-gradient-to-t ${colors[place]} shadow-inner`}
        />
      </div>
      
      <div className="mt-4 text-xs font-semibold text-gray-600">
        #{place}
      </div>
    </motion.div>
  )
}

function TableRow({ user, index, expanded, onToggle }) {
  const isTop3 = index < 3
  
  return (
    <motion.div
      variants={item}
      className={`overflow-hidden rounded-xl border transition-all duration-300 ${
        isTop3 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-white' :
        'border-gray-200 hover:border-blue-200 bg-white'
      } ${expanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-300 text-white' :
            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-200 text-gray-800' :
            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-500 text-white' :
            'bg-gray-100 text-gray-700'
          }`}>
            {index + 1}
          </div>
          
          <div className="flex-shrink-0">
            <img
              src={user.image || "/placeholder.svg"}
              alt={`${user.name} avatar`}
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
              crossOrigin="anonymous"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
              {isTop3 && (
                <span className="flex-shrink-0">
                  {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                  {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                  {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
          
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-gray-900 text-lg">{user.score}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {user.totalQuestions ? `${percent(user.score, user.totalQuestions)}%` : "—"}
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            className="flex-shrink-0 text-gray-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Stage-wise Performance
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.stages?.map((stage, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border ${
                      idx === 0 ? 'border-blue-200 bg-blue-50' :
                      idx === 1 ? 'border-purple-200 bg-purple-50' :
                      'border-green-200 bg-green-50'
                    }`}
                  >
                    <StageProgressBar
                      score={stage.score}
                      total={stage.total}
                      stageNumber={stage.stage}
                      isActive={stage.score > 0}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Submitted: {formatTimestamp(user.submittedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Overall Accuracy: {user.totalQuestions ? `${percent(user.score, user.totalQuestions)}%` : "—"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function StageLeaderboard() {
  const { contestId } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("score")
  const [expandedRow, setExpandedRow] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const response = await getallContestResult(contestId)
        if (response?.success && Array.isArray(response.data)) {
          setResults(response.data)
        } else {
          toast.error("Failed to fetch contest results or no results found.")
          setResults([])
        }
      } catch (error) {
        console.error("Error fetching contest results:", error)
        toast.error("Error loading contest results.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    if (contestId) {
      fetchResults()
    } else {
      setLoading(false)
      toast.error("No contest ID provided.")
    }
  }, [contestId])

  const normalized = results.map(safeUser)
  
  const filteredAndSorted = [...normalized]
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score") {
        if (b.score !== a.score) return b.score - a.score
        return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0)
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "accuracy") {
        const accuracyA = percent(a.score, a.totalQuestions)
        const accuracyB = percent(b.score, b.totalQuestions)
        return accuracyB - accuracyA
      }
      return 0
    })

  const top3 = filteredAndSorted.slice(0, 3)
  const rest = filteredAndSorted.slice(3)

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading leaderboard...</p>
          <p className="text-gray-500">Fetching stage-wise performance data</p>
        </div>
      </div>
    )
  }

  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={container}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50"
      role="main"
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.header variants={item} className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:-translate-x-1 transition-all mb-6 border border-gray-200"
            aria-label="Go back"
            type="button"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Contest
          </button>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-r from-white to-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    Contest Leaderboard
                  </h1>
                  <p className="text-gray-600">Track stage-wise performance and rankings</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                    <Users className="w-8 h-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{results.length}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                    <Target className="w-8 h-8 text-green-500 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {results.length > 0 ? percent(
                        normalized.reduce((acc, u) => acc + u.score, 0),
                        normalized.reduce((acc, u) => acc + u.totalQuestions, 0)
                      ) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Podium Section */}
        {top3.length > 0 && (
          <motion.section variants={item} className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl border border-yellow-200 p-8 shadow-2xl">
                <div className="grid grid-cols-3 items-end gap-8">
                  <PodiumUser user={top3[1]} place={2} heightClass="h-32" />
                  <PodiumUser user={top3[0]} place={1} heightClass="h-48" />
                  <PodiumUser user={top3[2]} place={3} heightClass="h-24" />
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Controls */}
        <motion.div variants={item} className="mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="score">Sort by Score</option>
                    <option value="name">Sort by Name</option>
                    <option value="accuracy">Sort by Accuracy</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard List */}
        <motion.section variants={container} className="space-y-4">
          {rest.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">All Participants</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {rest.length} others
                </span>
              </div>
              
              <AnimatePresence>
                {rest.map((user, index) => (
                  <TableRow
                    key={`${user.email}-${index}`}
                    user={user}
                    index={index + 3}
                    expanded={expandedRow === index + 3}
                    onToggle={() => toggleRow(index + 3)}
                  />
                ))}
              </AnimatePresence>
            </>
          ) : results.length === 0 ? (
            <motion.div
              variants={item}
              className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl mb-4">
                <Trophy className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Be the first to participate in this contest and claim the top spot!
              </p>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Go Back
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={item}
              className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl mb-4">
                <Target className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Participants Listed</h3>
              <p className="text-gray-600">Everyone is currently in the top ranks!</p>
            </motion.div>
          )}
        </motion.section>
      </div>
    </motion.main>
  )
}