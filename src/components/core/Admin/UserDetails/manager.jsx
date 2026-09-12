"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { getManagersAndUsers, blockOrUnblockUser } from "../../../../services/operations/profileAPI"
import {
  Search,
  Filter,
  Users,
  Shield,
  ShieldOff,
  Mail,
  Phone,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowLeft,
  RefreshCw,
  UserCheck
} from "lucide-react"
import { toast } from "react-hot-toast"

const MiroLoader = ({ message = "Loading manager directory..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

const ManagerDetails = () => {
  const navigate = useNavigate()
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCountry, setFilterCountry] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [blockingId, setBlockingId] = useState(null)
  const [sortField, setSortField] = useState("fullName")
  const [sortOrder, setSortOrder] = useState("asc")

  const fetchManagers = async () => {
    try {
      setLoading(true)
      const response = await getManagersAndUsers()
      const filtered = response.filter((user) => user.role === "manager")
      setManagers(filtered)
      setError(null)
    } catch (err) {
      console.error("Error fetching managers:", err)
      setError("Failed to fetch managers.")
      toast.error("Failed to fetch managers.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchManagers()
  }, [])

  const toggleBlockStatus = async (email, role, isCurrentlyBlocked) => {
    try {
      setBlockingId(email)
      const newStatus = !isCurrentlyBlocked
      const response = await blockOrUnblockUser({ email, role, block: newStatus })

      const isSuccess =
        response.success ||
        (typeof response.message === "string" &&
          response.message.toLowerCase().includes("has been"))

      if (isSuccess) {
        setManagers((prev) =>
          prev.map((user) =>
            user.email === email ? { ...user, isBlocked: newStatus } : user
          )
        )
        toast.success(response.message || `Manager has been ${newStatus ? "blocked" : "unblocked"} successfully`)
      }

      if (!isSuccess) {
        console.warn("Unexpected block/unblock response:", response)
      }
    } catch (err) {
      console.error("Error updating manager status:", err)
      toast.error(err.message || "Failed to update manager status")
    } finally {
      setBlockingId(null)
    }
  }

  // Sort managers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Filter and sort managers
  const filteredAndSortedManagers = managers
    .filter((user) => {
      const matchesSearch =
        (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCountry = filterCountry === "all" || user.country === filterCountry
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !user.isBlocked) ||
        (filterStatus === "blocked" && user.isBlocked)
      return matchesSearch && matchesCountry && matchesStatus
    })
    .sort((a, b) => {
      let aValue = a[sortField] || ""
      let bValue = b[sortField] || ""

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // Get unique countries for filter
  const countries = ["all", ...new Set(managers.map((user) => user.country).filter(Boolean))]

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const SortableHeader = ({ field, children, align = "text-left" }) => (
    <th
      className={`px-4 sm:px-6 py-3.5 ${align} text-xs font-bold text-[#555a6a] uppercase tracking-wider cursor-pointer hover:text-[#1c1c1e] hover:bg-[#ebedf2] transition-colors select-none`}
      onClick={() => handleSort(field)}
    >
      <div className={`inline-flex items-center gap-1.5 ${align === "text-right" ? "justify-end" : ""}`}>
        <span>{children}</span>
        {sortField === field && (
          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#1c1c1e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#1c1c1e]" />
        )}
      </div>
    </th>
  )

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar */}
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
              MANAGER MANAGEMENT
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              MANAGER DIRECTORY
            </span>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <UserCheck className="w-3.5 h-3.5 text-[#187574]" />
              <span>{managers.length} Registered Managers</span>
            </span>
            <button
              onClick={fetchManagers}
              className="p-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all shadow-sm active:scale-95"
              title="Refresh Managers"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Manager Directory & Access Control
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Inspect managerial team profiles, oversee system permissions, and toggle access authorization.
          </p>
        </div>

        {/* Search & Filter Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555a6a] w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search managers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 min-h-[44px] pl-10 pr-4 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] placeholder-[#555a6a] hover:border-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
              />
            </div>

            {/* Country Filter */}
            <div className="relative min-w-[180px]">
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 pr-9 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#f4fbfb] text-[#1c1c1e] hover:border-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === "all" ? "All Countries" : country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[150px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 pr-9 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fbf9fe] text-[#1c1c1e] hover:border-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
            </div>
          </div>

          {/* Counts and stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#e0e2e8] text-xs">
            <span className="font-semibold text-[#555a6a]">
              Showing <strong className="text-[#1c1c1e]">{filteredAndSortedManagers.length}</strong> of{" "}
              <strong className="text-[#1c1c1e]">{managers.length}</strong> managers
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c3faf5] border border-[#9eece4] text-[#187574] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#187574]" />
                Active: {managers.filter((u) => !u.isBlocked).length}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fbd4d4] border border-[#e3c5c5] text-[#800000] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#800000]" />
                Blocked: {managers.filter((u) => u.isBlocked).length}
              </span>
              {(searchTerm || filterCountry !== "all" || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setFilterCountry("all")
                    setFilterStatus("all")
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#f7f8fa] hover:bg-[#ebedf2] border border-[#c7cad5] text-xs font-bold text-[#555a6a] hover:text-[#1c1c1e] transition-all ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <MiroLoader message="Fetching managers from system..." />
        ) : error ? (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#fbd4d4] border border-[#e3c5c5] flex items-center justify-center mx-auto text-[#800000]">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1c1c1e]">Error Loading Managers</h3>
              <p className="text-xs sm:text-sm text-[#555a6a] max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchManagers}
              className="px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold transition-all shadow-sm active:scale-98"
            >
              Try Again
            </button>
          </div>
        ) : filteredAndSortedManagers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#fff8e0] border border-[#fde89c] flex items-center justify-center mx-auto text-[#746019]">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1c1c1e]">No managers found</h3>
              <p className="text-xs sm:text-sm text-[#555a6a] max-w-md mx-auto">
                {searchTerm || filterCountry !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search query or filter selection."
                  : "No managers are currently registered in the system."}
              </p>
            </div>
            {(searchTerm || filterCountry !== "all" || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilterCountry("all")
                  setFilterStatus("all")
                }}
                className="px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e] hover:bg-[#f7f8fa]"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-[#c7cad5] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f7f8fa] border-b border-[#e0e2e8]">
                    <tr>
                      <SortableHeader field="fullName">Manager</SortableHeader>
                      <SortableHeader field="email">Email</SortableHeader>
                      <SortableHeader field="country">Country</SortableHeader>
                      <SortableHeader field="role">Role</SortableHeader>
                      <SortableHeader field="mobile">Mobile</SortableHeader>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-[#555a6a] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-[#555a6a] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e2e8]">
                    <AnimatePresence>
                      {filteredAndSortedManagers.map((user) => (
                        <motion.tr
                          key={user.email}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-[#fbfbfd] transition-colors ${
                            user.isBlocked ? "bg-[#fffafa]" : ""
                          }`}
                        >
                          {/* Manager Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={user.avatar || "/placeholder.svg"}
                                  alt={user.fullName || "Manager"}
                                  className="w-9 h-9 rounded-full object-cover border border-[#c7cad5]"
                                />
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                    user.isBlocked ? "bg-[#800000]" : "bg-[#187574]"
                                  }`}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-[#1c1c1e] truncate">
                                  {user.fullName || "Unnamed Manager"}
                                </div>
                                <div className="text-xs text-[#555a6a]">
                                  Joined {formatDate(user.createdAt)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1c1e]">
                              <Mail className="w-3.5 h-3.5 text-[#4262ff]" />
                              <span className="truncate max-w-[200px]">{user.email}</span>
                            </div>
                          </td>

                          {/* Country */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] text-xs font-semibold text-[#1c1c1e]">
                              <MapPin className="w-3 h-3 text-[#555a6a]" />
                              <span>{user.country || "Not specified"}</span>
                            </span>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] text-xs font-bold text-[#4262ff] capitalize">
                              {user.role || "manager"}
                            </span>
                          </td>

                          {/* Mobile */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-semibold text-[#555a6a]">
                              {user.mobile || "—"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                user.isBlocked
                                  ? "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
                                  : "bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
                              }`}
                            >
                              {user.isBlocked ? "Blocked" : "Active"}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => toggleBlockStatus(user.email, user.role, user.isBlocked)}
                              disabled={blockingId === user.email}
                              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.isBlocked
                                  ? "bg-[#c3faf5] hover:bg-[#a6f5ed] border border-[#9eece4] text-[#187574]"
                                  : "bg-[#fbd4d4] hover:bg-[#f9a9a9] border border-[#e3c5c5] text-[#800000]"
                              }`}
                            >
                              {blockingId === user.email ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>Updating...</span>
                                </>
                              ) : user.isBlocked ? (
                                <>
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>Unblock</span>
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="w-3.5 h-3.5" />
                                  <span>Block Manager</span>
                                </>
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              <AnimatePresence>
                {filteredAndSortedManagers.map((user) => (
                  <motion.div
                    key={user.email}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-white rounded-2xl border border-[#c7cad5] p-4 space-y-3.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.fullName || "Manager"}
                            className="w-10 h-10 rounded-full object-cover border border-[#c7cad5]"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              user.isBlocked ? "bg-[#800000]" : "bg-[#187574]"
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-[#1c1c1e] truncate">
                            {user.fullName || "Unnamed Manager"}
                          </h3>
                          <p className="text-xs text-[#555a6a]">
                            Joined {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                          user.isBlocked
                            ? "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
                            : "bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#e0e2e8] text-xs">
                      <div className="flex items-center gap-2 text-[#1c1c1e] font-semibold">
                        <Mail className="w-3.5 h-3.5 text-[#4262ff] flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.mobile && (
                        <div className="flex items-center gap-2 text-[#555a6a]">
                          <Phone className="w-3.5 h-3.5 text-[#187574] flex-shrink-0" />
                          <span>{user.mobile}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[#555a6a]">
                        <MapPin className="w-3.5 h-3.5 text-[#e5484d] flex-shrink-0" />
                        <span>{user.country || "Country not specified"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#555a6a]">
                        <User className="w-3.5 h-3.5 text-[#4262ff] flex-shrink-0" />
                        <span className="capitalize">Role: {user.role || "manager"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBlockStatus(user.email, user.role, user.isBlocked)}
                      disabled={blockingId === user.email}
                      className={`w-full h-11 min-h-[44px] rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.isBlocked
                          ? "bg-[#c3faf5] hover:bg-[#a6f5ed] border border-[#9eece4] text-[#187574]"
                          : "bg-[#fbd4d4] hover:bg-[#f9a9a9] border border-[#e3c5c5] text-[#800000]"
                      }`}
                    >
                      {blockingId === user.email ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Updating status...</span>
                        </>
                      ) : user.isBlocked ? (
                        <>
                          <Shield className="w-4 h-4" />
                          <span>Unblock</span>
                        </>
                      ) : (
                        <>
                          <ShieldOff className="w-4 h-4" />
                          <span>Block Manager</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ManagerDetails
