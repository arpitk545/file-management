"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Loader2,
  Mail,
  Phone,
  School,
  User,
  GraduationCap,
  ArrowLeft,
} from "lucide-react"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { getStudentEnrollmentList, markStudentAttendance } from "../../../../services/operations/contestAPI"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../../ui/dialog"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"

export default function ShowStudentEnroll() {
  const { contestId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [loadingStatus, setLoadingStatus] = useState({ id: null, action: null })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await getStudentEnrollmentList(contestId)
        if (res.success) {
          setStudents(res.enrollments || [])
        } else {
          toast.error(res.message || "Failed to fetch students")
        }
      } catch (err) {
        toast.error("Error loading enrollments")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [contestId])

  // Mark student present or absent
  const handleStatusToggle = async (enrollmentId, newStatus) => {
    setLoadingStatus({ id: enrollmentId, action: newStatus })
    try {
      const res = await markStudentAttendance(enrollmentId, newStatus)
      if (res.success) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === enrollmentId ? { ...student, status: newStatus } : student
          )
        )
        toast.success(`Student marked as ${newStatus}!`)
      } else {
        toast.error(`Update failed: ${res.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to update student status:", error)
      toast.error("Failed to update status. Please try again.")
    } finally {
      setLoadingStatus({ id: null, action: null })
    }
  }

  const handleViewDetails = (student) => {
    setSelectedStudentDetails(student)
    setShowDetailsModal(true)
  }

  const filteredStudents = useMemo(() => {
    let filtered = students.filter(
      (student) =>
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.school?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterStatus !== "All") {
      filtered = filtered.filter((student) => student.status === filterStatus)
    }

    return filtered
  }, [students, searchTerm, filterStatus])

  const presentCount = useMemo(
    () => students.filter((s) => s.status === "Present").length,
    [students]
  )
  const absentCount = useMemo(
    () => students.filter((s) => s.status === "Absent").length,
    [students]
  )

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6">
        {/* Navigation & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/filter-contest")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c7cad5] bg-white text-xs font-semibold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors mb-4 shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contests
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#c7cad5]">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
                  STUDENT REGISTRY
                </span>
                <span className="px-3 py-1 bg-[#ffd8f4] text-[#86296b] text-[11px] font-bold uppercase tracking-wider rounded-full">
                  ATTENDANCE ROSTER
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
                Enrolled Students
              </h1>
              <p className="text-sm sm:text-base text-[#6a6d7c] mt-1">
                Manage attendance verification and student information for contest participants.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-white border border-[#c7cad5] rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ebecf0] flex items-center justify-center text-[#1c1c1e]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a6d7c]">Total</p>
                  <p className="text-base font-extrabold text-[#1c1c1e] leading-none">{students.length}</p>
                </div>
              </div>

              <div className="bg-white border border-[#c7cad5] rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#c3faf5] flex items-center justify-center text-[#187574]">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#187574]">Present</p>
                  <p className="text-base font-extrabold text-[#187574] leading-none">{presentCount}</p>
                </div>
              </div>

              <div className="bg-white border border-[#c7cad5] rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#fbd4d4] flex items-center justify-center text-[#800000]">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#800000]">Absent</p>
                  <p className="text-base font-extrabold text-[#800000] leading-none">{absentCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-[#c7cad5] p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6d7c]" />
            <Input
              type="text"
              placeholder="Search by student name, email, or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#f7f8fa] border border-[#c7cad5] rounded-lg focus:bg-white focus:border-[#1c1c1e] transition-colors"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Label htmlFor="status-filter" className="sr-only">
              Filter by Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                id="status-filter"
                className="w-full sm:w-[190px] h-10 border border-[#c7cad5] bg-white rounded-lg text-xs font-semibold text-[#1c1c1e] shadow-none"
              >
                <Filter className="w-3.5 h-3.5 mr-2 text-[#6a6d7c]" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#c7cad5] text-xs font-medium">
                <SelectItem value="All">All Statuses ({students.length})</SelectItem>
                <SelectItem value="Present">Present ({presentCount})</SelectItem>
                <SelectItem value="Absent">Absent ({absentCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#c7cad5] overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#1c1c1e] mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">Loading enrollments...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e6e8ec]">
                <thead className="bg-[#f0f1f4]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Student
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Contact
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Class & School
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Attendance Status
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e6e8ec]">
                  {filteredStudents.map((student) => {
                    const isPresent = student.status === "Present"
                    const isAbsent = student.status === "Absent"
                    const isUpdating = loadingStatus.id === student._id

                    return (
                      <tr key={student._id} className="hover:bg-[#f7f8fa] transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.fullName || "Student")}`}
                              alt={student.fullName}
                              width={40}
                              height={40}
                              className="rounded-full w-10 h-10 object-cover border border-[#c7cad5] bg-[#ebecf0]"
                            />
                            <div>
                              <p className="text-sm font-bold text-[#1c1c1e]">{student.fullName || "Unnamed Student"}</p>
                              <p className="text-xs text-[#6a6d7c]">ID: {student._id?.slice(-6) || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs font-medium text-[#1c1c1e]">{student.email || "No email"}</p>
                          <p className="text-[11px] text-[#6a6d7c]">{student.phoneNumber || "No phone"}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-[#1c1c1e]">
                            Class: {student.class || "N/A"}
                          </p>
                          <p className="text-[11px] text-[#6a6d7c] truncate max-w-[200px]" title={student.school}>
                            {student.school || "No school specified"}
                          </p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex rounded-lg border border-[#c7cad5] overflow-hidden p-0.5 bg-[#f0f1f4]" role="group">
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(student._id, "Present")}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                                isPresent
                                  ? "bg-[#c3faf5] text-[#187574] shadow-xs"
                                  : "text-[#6a6d7c] hover:bg-white hover:text-[#1c1c1e]"
                              } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              {isUpdating && loadingStatus.action === "Present" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(student._id, "Absent")}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                                isAbsent
                                  ? "bg-[#fbd4d4] text-[#800000] shadow-xs"
                                  : "text-[#6a6d7c] hover:bg-white hover:text-[#1c1c1e]"
                              } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              {isUpdating && loadingStatus.action === "Absent" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="px-3 py-1.5 rounded-lg border border-[#c7cad5] bg-white text-xs font-bold text-[#1c1c1e] hover:bg-[#ffd02f] transition-all shadow-2xs"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-[#fff4c4] text-[#1c1c1e] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#c7cad5]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1c1c1e] mb-1">No students found</h3>
              <p className="text-xs text-[#6a6d7c] max-w-sm mx-auto">
                {searchTerm || filterStatus !== "All"
                  ? "No enrolled students matched your active filter or search query. Try clearing filters."
                  : "No students have registered or enrolled in this contest yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudentDetails && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-[460px] p-6 bg-white border border-[#c7cad5] rounded-2xl shadow-xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-black uppercase tracking-wider rounded-full">
                  PARTICIPANT PROFILE
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full ${
                    selectedStudentDetails.status === "Present"
                      ? "bg-[#c3faf5] text-[#187574]"
                      : selectedStudentDetails.status === "Absent"
                      ? "bg-[#fbd4d4] text-[#800000]"
                      : "bg-[#ebecf0] text-[#6a6d7c]"
                  }`}
                >
                  {selectedStudentDetails.status || "Unverified"}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-[#1c1c1e] flex items-center gap-2">
                {selectedStudentDetails.fullName || "Student Details"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6a6d7c]">
                Verified registration details submitted for this contest.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3">
              <div className="flex items-center gap-4 p-3 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl">
                <img
                  src={selectedStudentDetails.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedStudentDetails.fullName || "Student")}`}
                  alt={selectedStudentDetails.fullName}
                  width={64}
                  height={64}
                  className="rounded-xl w-16 h-16 object-cover border border-[#c7cad5] bg-white"
                />
                <div>
                  <p className="text-sm font-extrabold text-[#1c1c1e]">{selectedStudentDetails.fullName}</p>
                  <p className="text-xs text-[#6a6d7c]">Student ID: {selectedStudentDetails._id?.slice(-8) || "N/A"}</p>
                  <p className="text-xs font-semibold text-[#187574] mt-0.5">Status: {selectedStudentDetails.status || "Not Marked"}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e6e8ec] bg-white">
                  <Mail className="w-4 h-4 text-[#6a6d7c] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a6d7c]">Email Address</p>
                    <p className="font-semibold text-[#1c1c1e]">{selectedStudentDetails.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e6e8ec] bg-white">
                  <Phone className="w-4 h-4 text-[#6a6d7c] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a6d7c]">Phone Number</p>
                    <p className="font-semibold text-[#1c1c1e]">{selectedStudentDetails.phoneNumber || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e6e8ec] bg-white">
                  <GraduationCap className="w-4 h-4 text-[#6a6d7c] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a6d7c]">Grade / Class</p>
                    <p className="font-semibold text-[#1c1c1e]">{selectedStudentDetails.class || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e6e8ec] bg-white">
                  <School className="w-4 h-4 text-[#6a6d7c] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a6d7c]">School / Institution</p>
                    <p className="font-semibold text-[#1c1c1e]">{selectedStudentDetails.school || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <button className="w-full sm:w-auto px-5 py-2 bg-[#1c1c1e] text-white hover:bg-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                  Close Profile
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}