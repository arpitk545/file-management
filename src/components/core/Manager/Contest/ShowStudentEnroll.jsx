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
import { useParams } from "react-router-dom"

export default function ShowStudentEnroll() {
  const { contestId} = useParams();
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [loadingStatus, setLoadingStatus] = useState({ id: null, action: null })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getStudentEnrollmentList(contestId)
        if (res.success) {
          setStudents(res.enrollments)
        } else {
          toast.error(res.message || "Failed to fetch students")
        }
      } catch (err) {
        toast.error("Error loading enrollments")
        console.error(err)
      }
    }
    fetchData()
  }, [contestId])
//Mark student presnt and the absent;

  const handleStatusToggle = async (enrollmentId, newStatus) => {
  setLoadingStatus({ id: enrollmentId, action: newStatus });
  try {
    const res = await markStudentAttendance(enrollmentId, newStatus);  
    if (res.success) {
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === enrollmentId ? { ...student, status: newStatus } : student
        )
      );
      toast.success(`Student status updated to ${newStatus}!`);
    } else {
      toast.error(`Update failed for student ${enrollmentId}: ${res.message}`);
    }
  } catch (error) {
    console.error("Failed to update student status:", error);
    toast.error("Failed to update status. Please try again.");
  } finally {
    setLoadingStatus({ id: null, action: null });
  }
};


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

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Enrolled Students</h1>
          <p className="text-base sm:text-lg text-gray-600">Manage attendance and details for contest participants.</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Label htmlFor="status-filter" className="sr-only">
              Filter by Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                id="status-filter"
                className="w-full sm:w-[180px] h-10 border border-gray-300 rounded-lg shadow-sm"
              >
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Image
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Full Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Class
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    School
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={student.profileImage || "/placeholder.svg"}
                          alt={student.fullName}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.school}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(student._id, "Present")}
                            disabled={loadingStatus.id === student._id}
                            className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-md transition-all duration-200
                              ${
                                student.status === "Present"
                                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }
                              ${loadingStatus.id === student._id ? "opacity-70 cursor-not-allowed" : ""}
                            `}
                          >
                            {loadingStatus.id === student._id && loadingStatus.action === "Present" ? (
                              <Loader2 className="w-4 h-4 inline-block animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 inline-block mr-1" />
                            )}{" "}
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(student._id, "Absent")}
                            disabled={loadingStatus.id === student._id}
                            className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-md transition-all duration-200
                              ${
                                student.status === "Absent"
                                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }
                              ${loadingStatus.id === student._id ? "opacity-70 cursor-not-allowed" : ""}
                            `}
                          >
                            {loadingStatus.id === student._id && loadingStatus.action === "Absent" ? (
                              <Loader2 className="w-4 h-4 inline-block animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 inline-block mr-1" />
                            )}{" "}
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500 text-base">
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudentDetails && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-[425px] p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-600" />
                {selectedStudentDetails.fullName}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Full details for {selectedStudentDetails.fullName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentDetails.profileImage || "/placeholder.svg"}
                  alt={selectedStudentDetails.fullName}
                  width={80}
                  height={80}
                  className="rounded-full object-cover border-2 border-indigo-200"
                />
                <div>
                  <p className="text-lg font-semibold text-gray-800">{selectedStudentDetails.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedStudentDetails.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{selectedStudentDetails.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{selectedStudentDetails.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{selectedStudentDetails.class}</span>
              </div>
              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{selectedStudentDetails.school}</span>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                  Close
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}