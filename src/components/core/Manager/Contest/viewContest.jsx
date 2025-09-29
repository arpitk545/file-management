"use client"
import { useState, useEffect } from "react"
import {
  Trophy,
  MapPin,
  BookOpen,
  Users,
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Award,
  FileText,
  Timer,
  ImageIcon
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { getContestById, updateApprovalStatus } from "../../../../services/operations/contestAPI"

const ViewContest = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [contestDetails, setContestDetails] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return;
    const fetchContestData = async () => {
      setLoading(true);
      try {
        const response = await getContestById(id);
        if (response?.success && response?.data) {
          setContestDetails(response.data);
          setQuestions(response.data.questions || []);
        } else {
          toast.error(response?.message || "Failed to fetch contest details");
        }
      } catch {
        toast.error("Failed to fetch contest details");
      } finally {
        setLoading(false);
      }
    };
    fetchContestData();
  }, [id]);

  // back to the dashboard
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/filter-contest", { replace: true });
    };
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const response = await updateApprovalStatus(id, "Approved")
      if (response.success) {
        toast.success("Contest Published Successfully!")
      } else {
        toast.error(response.message || "Failed to publish contest")
      }
    } catch (error) {
      toast.error("Failed to publish contest")
      console.error(error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const response = await updateApprovalStatus(id, "Rejected Contest")
      if (response.success) {
        toast.success("Contest Rejected successfully")
      } else {
        toast.error(response.message || "Failed to reject contest")
      }
    } catch (error) {
      toast.error("Failed to reject contest")
      console.error(error)
    } finally {
      setIsRejecting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!contestDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contest not found</h2>
          <button
            onClick={() => navigate("/filter-contest")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Contests</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Contest Details</h1>
                  <p className="text-blue-100 text-sm sm:text-base">Review and manage contest information</p>
                </div>
                <button
                  onClick={() => navigate("/filter-contest")}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 self-start sm:self-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Contests</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contest Information Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                Contest Information
              </h2>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {/* Thumbnail */}
              {contestDetails.thumbnail && (
                <div className="mb-6 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Contest Thumbnail</h3>
                  </div>
                  <div className="w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                    <img
                      src={contestDetails.thumbnail || "/placeholder.svg"}
                      alt="Contest thumbnail"
                      className="w-full h-40 object-contain object-center"
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-700">Title</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 ml-8">{contestDetails.title}</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-700">Description</h3>
                </div>
                <p className="text-gray-800 text-base sm:text-lg leading-relaxed ml-8">
                  {contestDetails.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Region</h3>
                  </div>
                  <p className="text-gray-900 font-medium ml-8">{contestDetails.region}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Exam Type</h3>
                  </div>
                  <p className="text-gray-900 font-medium ml-8">{contestDetails.examType}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Specific Class</h3>
                  </div>
                  <p className="text-gray-900 font-medium ml-8">{contestDetails.specificClass}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Subject</h3>
                  </div>
                  <p className="text-gray-900 font-medium ml-8">{contestDetails.subject}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Chapter</h3>
                  </div>
                  <p className="text-gray-900 font-medium ml-8">{contestDetails.chapter}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Prize</h3>
                  </div>
                  <p className="text-green-600 font-bold text-lg ml-8">{contestDetails.prize}</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Deadline</h3>
                  </div>
                  <p className="text-gray-900 font-medium ml-8">
                    {new Date(contestDetails.deadline).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Timer className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-700">Start Time</h3>
                  </div>
                  <p className="text-gray-900 font-medium ml-8">
                    {new Date(contestDetails.startTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
                Contest Questions ({questions.length})
              </h2>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id || `${index}`} className="border-b border-gray-200 pb-8 last:border-b-0">
                    {/* Question Number and Text */}
                    <div className="mb-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 text-base sm:text-lg font-medium leading-relaxed">
                            {question.question}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Image (if present) */}
                    {question.image && (
                      <div className="ml-12 mb-4 w-full">
                        <div className="w-full rounded-2xl overflow-hidden border-2  border-gray-200 shadow-sm">
                          <img
                            src={question.image || "/placeholder.svg"}
                            alt={`Question ${index + 1} diagram`}
                            className="w-full h-40 object-contain object-center"
                          />
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    <div className="ml-12 mb-4">
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(question.options).map(([key, value], optionIndex) => (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                              key === question.correctAnswer
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                  key === question.correctAnswer
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-300 text-gray-700"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="text-gray-800 font-medium">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="ml-12">
                      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg ">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold">Correct Answer: {question.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button
                onClick={handlePublish}
                disabled={isPublishing || isRejecting}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
              >
                {isPublishing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Publish Contest</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReject}
                disabled={isPublishing || isRejecting}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
              >
                {isRejecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Reject Contest</span>
                  </>
                )}
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default ViewContest
