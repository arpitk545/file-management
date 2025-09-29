"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { getallContestResult } from "../../../../services/operations/contestAPI"

function formatTimestamp(ts) {
  if (!ts) return "—"
  try {
    const d = new Date(ts)
    const date = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    const time = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
    return `${date} · ${time}`
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
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
}

function PodiumUser({ user, place, heightClass }) {
  const crown = place === 1
  return (
    <motion.div
      variants={item}
      className={`flex flex-col items-center justify-end text-center`}
      aria-label={`${place} place`}
    >
      <div className="relative">
        {crown && (
          <motion.div
            initial={{ rotate: -10, y: -10, opacity: 0 }}
            animate={{ rotate: 0, y: -18, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2"
            aria-hidden
          >
            <span className="inline-block text-[24px]">👑</span>
          </motion.div>
        )}
        <img
          src={user.image || "/placeholder.svg"}
          alt={`${user.name} avatar`}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-cyan-400/70 shadow-lg"
          crossOrigin="anonymous"
        />
      </div>
      <div className="mt-3 w-full">
        <div className="font-semibold text-black text-sm sm:text-base truncate px-2" title={user.name}>
          {user.name}
        </div>
        <div className="text-xs text-black/70 truncate px-2" title={user.email}>
          {user.email}
        </div>
      </div>
      <div
        className={`mt-3 w-16 sm:w-20 md:w-24 rounded-t-md bg-gradient-to-t from-cyan-400/80 to-cyan-300/80 shadow-md ${heightClass}`}
        title={`Score: ${user.score}`}
        aria-label={`Podium height for ${user.name}`}
      />
      <div className="mt-2 text-xs sm:text-sm font-medium text-black">
        {user.score} pts
        {user.totalQuestions ? (
          <span className="text-black/60">{` • ${percent(user.score, user.totalQuestions)}%`}</span>
        ) : null}
      </div>
    </motion.div>
  )
}

function TableRow({ user, index }) {
  return (
    <motion.tr variants={item} className="border-b border-cyan-100/60 hover:bg-cyan-50/50 transition-colors">
      <td className="px-2 sm:px-3 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="w-6 text-center font-semibold text-black/80 text-sm sm:text-base">{index + 1}</span>
          <img
            src={user.image || "/placeholder.svg"}
            alt={`${user.name} avatar`}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-1 ring-cyan-200"
            crossOrigin="anonymous"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-black text-sm sm:text-base truncate">{user.name}</div>
            <div className="text-xs text-black/60 truncate">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-2 sm:px-3 py-2 sm:py-3 text-black text-sm sm:text-base">{user.score}</td>
      <td className="px-2 sm:px-3 py-2 sm:py-3 text-black text-sm sm:text-base">
        {user.totalQuestions ? `${percent(user.score, user.totalQuestions)}%` : "—"}
      </td>
      <td className="px-2 sm:px-3 py-2 sm:py-3 text-black/80 text-xs sm:text-sm">
        {formatTimestamp(user.submittedAt)}
      </td>
    </motion.tr>
  )
}

export default function Leaderboard() {
  const {contestId} = useParams() 
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

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
  const sorted = [...normalized].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    // tie-breaker: earlier submission ranks higher
    return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0)
  })

  const top = sorted.slice(0, 3)
  // Display order: [2nd, 1st, 3rd]
  const podiumOrder = [top[1], top[0], top[2]].filter(Boolean)
  const rest = sorted.slice(3)

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={container}
      className="fixed inset-0 overflow-auto bg-gradient-to-b from-cyan-50 to-white"
      role="main"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
        {/* Header + Back */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-black shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            aria-label="Go back"
            type="button"
          >
            <span aria-hidden>←</span>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="relative text-center flex-1 mx-4">
            <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-cyan-200/60 to-transparent rounded-full" />
            <h1 className="text-balance text-xl sm:text-2xl lg:text-3xl font-bold text-black">Contest Leaderboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              {results.length} participant{results.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="w-12 sm:w-auto opacity-0 pointer-events-none">
            {/* Spacer for balance */}
          </div>
        </div>

        {/* Podium */}
        <motion.section
          variants={item}
          className="relative mb-6 sm:mb-8 rounded-xl border border-cyan-200/70 bg-white/90 p-4 sm:p-5 shadow-lg"
          aria-label="Top 3 podium"
        >
          <div className="absolute inset-x-0 -top-4 sm:-top-6 mx-auto h-12 sm:h-16 max-w-md rounded-full bg-gradient-to-r from-cyan-200/50 to-transparent blur-2xl -z-10" />
          {podiumOrder.length > 0 ? (
            <div className="grid grid-cols-3 items-end gap-3 sm:gap-4">
              {/* 2nd */}
              <PodiumUser user={podiumOrder[0]} place={podiumOrder.length > 1 ? 2 : 1} heightClass="h-20 sm:h-24" />
              {/* 1st */}
              {podiumOrder[1] ? <PodiumUser user={podiumOrder[1]} place={1} heightClass="h-28 sm:h-32 lg:h-36" /> : null}
              {/* 3rd */}
              {podiumOrder[2] ? <PodiumUser user={podiumOrder[2]} place={3} heightClass="h-16 sm:h-20" /> : <div />}
            </div>
          ) : (
            <div className="py-8 text-center text-black/70">No results yet.</div>
          )}
        </motion.section>

        {/* Rest of the leaderboard */}
        <AnimatePresence>
          {rest.length > 0 ? (
            <motion.section
              variants={item}
              className="rounded-xl border border-cyan-200/70 bg-white/90 p-3 sm:p-4 shadow-lg"
              aria-label="Remaining participants"
            >
              {/* Table for md+ */}
              <div className="hidden md:block overflow-x-auto">
                <motion.table
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full table-auto border-collapse min-w-[600px]"
                >
                  <thead>
                    <tr className="bg-cyan-50/70 text-left">
                      <th className="px-3 py-3 text-sm font-semibold text-black">Rank</th>
                      <th className="px-3 py-3 text-sm font-semibold text-black">User</th>
                      <th className="px-3 py-3 text-sm font-semibold text-black">Score</th>
                      <th className="px-3 py-3 text-sm font-semibold text-black">Accuracy</th>
                      <th className="px-3 py-3 text-sm font-semibold text-black">Submitted</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={container} initial="hidden" animate="show">
                    {rest.map((u, i) => (
                      <TableRow key={`${u.email}-${i}`} user={u} index={i + 4 - 1} />
                    ))}
                  </motion.tbody>
                </motion.table>
              </div>

              {/* Cards for mobile */}
              <div className="space-y-3 md:hidden">
                {rest.map((u, i) => (
                  <motion.div
                    key={`${u.email}-${i}`}
                    variants={item}
                    className="rounded-lg border border-cyan-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-6 text-center font-semibold text-black/80 text-sm">{i + 4}</span>
                        <img
                          src={u.image || "/placeholder.svg"}
                          alt={`${u.name} avatar`}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-cyan-200 flex-shrink-0"
                          crossOrigin="anonymous"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-black text-sm">{u.name}</div>
                          <div className="truncate text-xs text-black/60">{u.email}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-black text-sm">{u.score} pts</div>
                        <div className="text-xs text-black/60">
                          {u.totalQuestions ? `${percent(u.score, u.totalQuestions)}%` : "—"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-black/70">Submitted: {formatTimestamp(u.submittedAt)}</div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              variants={item}
              className="rounded-xl border border-cyan-200/70 bg-white/90 p-6 text-center"
            >
              <p className="text-black/70">No other participants to display.</p>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty state when no results */}
        {results.length === 0 && !loading && (
          <motion.section
            variants={item}
            className="rounded-xl border border-cyan-200/70 bg-white/90 p-8 text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold text-black mb-2">No Results Yet</h2>
            <p className="text-black/70 mb-4">Be the first to participate in this contest!</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-white font-medium hover:bg-cyan-600 transition-colors"
            >
              Go Back
            </button>
          </motion.section>
        )}
      </div>
    </motion.main>
  )
}