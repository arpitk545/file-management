"use client"
import { Label } from "../../../ui/label"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { School, Users, Phone, Award, CheckCircle, Loader2, X, Play } from "lucide-react"
import { enrollInContest, checkContestAttempt } from "../../../../services/operations/contestAPI"

// Reusable input component
const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-blue-600" />}
      {label}
    </Label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
    />
  </div>
)

const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
      <Award className="w-4 h-4 text-blue-600" />
      {label}
    </Label>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      <span className="ml-3 text-sm font-medium text-gray-900">{checked ? "Yes" : "No"}</span>
    </label>
  </div>
)

export default function ContestEnrollment() {
  const { contestId } = useParams()
  const navigate = useNavigate()

  const reduxUser = useSelector((state) => state.auth.user)
  const storedUser = reduxUser || JSON.parse(localStorage.getItem("user"))
  const email = storedUser?.email

  const [school, setSchool] = useState("")
  const [className, setClassName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isFirstContest, setIsFirstContest] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check enrollment status on component mount
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const response = await checkContestAttempt(contestId)
        if (response.success) {
          setEnrollmentStatus(response.data)
        } else {
          //toast.error(response.message || "Failed to check enrollment status")
        }
      } catch (error) {
        console.error("Error checking enrollment:", error)
       // toast.error("Failed to check enrollment status")
      } finally {
        setIsLoading(false)
      }
    }

    checkEnrollment()
  }, [contestId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!email) {
      toast.error("User email not found. Please log in again.")
      setIsSubmitting(false)
      return
    }

    const enrollmentData = {
      // email,
      school,
      class: className,
      phoneNumber,
      status:"Absent",
    }

    try {
      const result = await enrollInContest(contestId, enrollmentData)

      if (result.success) {
        toast.success("Enrolled successfully!")
        setEnrollmentStatus({
          ...enrollmentStatus,
          enrolled: true,
          enrollmentStatus: "Absent"
        })
      } else {
        toast.error(result.message || "Failed to enroll")
      }
    } catch (error) {
      toast.error("Something went wrong while enrolling")
      console.error("Enrollment error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const handleStartContest = () => {
    navigate(`/attempt-contest/${contestId}`)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-blue-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700">Checking enrollment status...</p>
        </div>
      </div>
    )
  }

  // If already enrolled, show start contest button
  if (enrollmentStatus?.enrolled) {
    return (
      <div className="fixed inset-0 overflow-auto flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full bg-white p-8 shadow-xl rounded-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Ready to Start</h2>
            <p className="mt-2 text-sm text-gray-600">
              You're already enrolled in this contest.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Enrollment Confirmed</h3>
              <p className="text-gray-600">
                {enrollmentStatus.attempted
                  ? "You've already attempted this contest."
                  : "You can now start the contest whenever you're ready."}
              </p>
            </div>

            <button
              onClick={handleStartContest}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 rounded-none"
            >
              <Play className="h-5 w-5 mr-3" />
              {enrollmentStatus.attempted ? "View Contest" : "Start Contest"}
            </button>

            <button
              onClick={handleCancel}
              className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-200 rounded-none"
            >
              <X className="h-5 w-5 mr-3" />
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show enrollment form if not enrolled
  return (
    <div className="fixed inset-0 overflow-auto flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white p-8 shadow-xl rounded-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Enroll in Contest</h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill out your details to join the contest.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <ModernInput
            label="School"
            placeholder="Enter your school name"
            value={school}
            onChange={setSchool}
            icon={School}
          />
          <ModernInput
            label="Class"
            placeholder="Enter your class (e.g., 10th Grade, B.Tech CSE)"
            value={className}
            onChange={setClassName}
            icon={Users}
          />
          <ModernInput
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={setPhoneNumber}
            icon={Phone}
          />

          <ToggleSwitch label="Is this your first contest?" checked={isFirstContest} onChange={setIsFirstContest} />

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors duration-200 rounded-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Submit
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-200 rounded-none"
            >
              <X className="h-5 w-5 mr-3" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
