"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getManagersAndUsers,blockOrUnblockUser } from "../../../../services/operations/profileAPI"
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
} from "lucide-react"
import { toast } from "react-hot-toast"

const UserDetails = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCountry, setFilterCountry] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [blockingId, setBlockingId] = useState(null)
  const [sortField, setSortField] = useState("fullName")
  const [sortOrder, setSortOrder] = useState("asc")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)

        const response = await getManagersAndUsers()

        // Filter for users only (not managers)
        const filtered = response.filter(user => user.role === "user")
        setUsers(filtered)
        setError(null)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to fetch users.")
        toast.error("Failed to fetch users.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
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
       setUsers(prev =>
         prev.map(user =>
           user.email === email ? { ...user, isBlocked: newStatus } : user
         )
       )
       toast.success(response.message || `User has been ${newStatus ? 'blocked' : 'unblocked'} successfully`)
     }
 
     if (!isSuccess) {
       console.warn("Unexpected block/unblock response:", response)
     }
 
   } catch (err) {
     console.error("Error updating user status:", err)
     toast.error(err.message || "Failed to update user status")
   } finally {
     setBlockingId(null)
   }
 }
 
  // Sort users
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCountry = filterCountry === "all" || user.country === filterCountry
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !user.isBlocked) ||
        (filterStatus === "blocked" && user.isBlocked)
      return matchesSearch && matchesCountry && matchesStatus
    })
    .sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

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
  const countries = ["all", ...new Set(users.map((user) => user.country))]

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const SortableHeader = ({ field, children }) => (
    <th
      className="px-3 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field &&
          (sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </div>
    </th>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading users...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Users</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">User Details</h1>
                <p className="text-green-100">Manage and monitor all users in the system</p>
              </div>
              <div className="flex items-center space-x-4 text-white">
                <Users className="w-6 h-6" />
                <span className="text-lg font-semibold">{users.length} Total Users</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200"
                />
              </div>

              {/* Country Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200 bg-white min-w-[200px]"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country === "all" ? "All Countries" : country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-4 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200 bg-white min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Results count and stats */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedUsers.length} of {users.length} users
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Active: {users.filter((u) => !u.isBlocked).length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Blocked: {users.filter((u) => u.isBlocked).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            {filteredAndSortedUsers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <SortableHeader field="fullName">User</SortableHeader>
                    <SortableHeader field="email">Email</SortableHeader>
                    <SortableHeader field="country">Country</SortableHeader>
                    <SortableHeader field="role">Role</SortableHeader>
                    <SortableHeader field="mobile">Mobile</SortableHeader>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredAndSortedUsers.map((user, index) => (
                      <motion.tr
                        key={user.email}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${
                          user.isBlocked ? "bg-red-50/30" : ""
                        }`}
                      >
                        {/* User Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                              <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  user.isBlocked ? "bg-red-500" : "bg-green-500"
                                }`}
                              ></div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">Joined {formatDate(user.createdAt)}</div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-900">{user.email}</span>
                          </div>
                        </td>

                        {/* Country */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-900">{user.country}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-900">{user.mobile}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => toggleBlockStatus(user.email, user.role, user.isBlocked)}
                            disabled={blockingId === user.email}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                              user.isBlocked
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {blockingId === user.email ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                {user.isBlocked ? (
                                  <>
                                    <Shield className="w-4 h-4" />
                                    <span>Unblock</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldOff className="w-4 h-4" />
                                    <span>Block</span>
                                  </>
                                )}
                              </>
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Users Found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterCountry !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No users are currently registered in the system."}
                </p>
                {(searchTerm || filterCountry !== "all" || filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setFilterCountry("all")
                      setFilterStatus("all")
                    }}
                    className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4">
            {filteredAndSortedUsers.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredAndSortedUsers.map((user, index) => (
                    <motion.div
                      key={user.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className={`bg-white rounded-2xl border-2 p-4 shadow-sm transition-all duration-300 ${
                        user.isBlocked ? "border-red-200 bg-red-50/30" : "border-gray-200"
                      }`}
                    >
                      {/* User Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                user.isBlocked ? "bg-red-500" : "bg-green-500"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                            <p className="text-sm text-gray-500">Joined {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </div>

                      {/* User Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{user.mobile}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{user.country}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900">Last active: {formatDate(user.lastActive)}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => toggleBlockStatus(user.email, user.role, user.isBlocked)}
                        disabled={blockingId === user.email}
                        className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                          user.isBlocked
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {blockingId === user.email ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            {user.isBlocked ? (
                              <>
                                <Shield className="w-4 h-4" />
                                <span>Unblock User</span>
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-4 h-4" />
                                <span>Block User</span>
                              </>
                            )}
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Users Found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterCountry !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No users are currently registered in the system."}
                </p>
                {(searchTerm || filterCountry !== "all" || filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setFilterCountry("all")
                      setFilterStatus("all")
                    }}
                    className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default UserDetails
