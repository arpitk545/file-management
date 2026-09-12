"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, User, Lock, Mail, ArrowLeft, LogIn } from "lucide-react" 
import toast from "react-hot-toast"
import { login } from "../../../services/operations/authAPI"
import { googleLogin } from "../../../services/operations/googleauth"

export default function Login() {
  const [formData, setFormData] = useState({
    role: "user",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const toastId = toast.loading("Logging in...")

    try {
      const result = await login(formData)

      if (result?.success) {
        localStorage.setItem("token", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))

        toast.dismiss(toastId)
        toast.success("Login successful!")

        const role = result.user.role

        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "/admin/dashboard"
          } else if (role === "manager") {
            window.location.href = "/manager/dashboard"
          } else if (role === "user") {
            window.location.href = "/user/dashboard"
          } else {
            window.location.href = "/"
          }
        }, 200)
      } else {
        toast.dismiss(toastId)
        toast.error(result?.message || "Login failed")
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error.message || "Login error"
      toast.dismiss(toastId)
      toast.error(errorMessage)
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Browser back to home 
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault()
      navigate("/", { replace: true }) 
    }

    window.addEventListener("popstate", handleBackButton)
    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center w-full">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-xs font-bold shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
            AUTH PORTAL
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center mx-auto shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1c1c1e]">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[#555a6a]">
              Sign in to access your dashboard and study resources
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["admin", "manager", "user"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                    className={`h-11 min-h-[44px] rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center ${
                      formData.role === role
                        ? "bg-[#1c1c1e] text-[#ffd02f] border-[#1c1c1e] shadow-sm"
                        : "bg-[#f7f8fa] border-[#c7cad5] text-[#555a6a] hover:bg-white hover:text-[#1c1c1e]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full h-11 min-h-[44px] pl-10 pr-4 bg-[#fffdf5] border border-[#c7cad5] rounded-xl focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all text-sm font-semibold text-[#1c1c1e]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-bold text-[#4262ff] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full h-11 min-h-[44px] pl-10 pr-11 bg-white border border-[#c7cad5] rounded-xl focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all text-sm font-semibold text-[#1c1c1e]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555a6a] hover:text-[#1c1c1e] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 min-h-[48px] bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-[#f7f8fa] text-[#1c1c1e] font-extrabold text-sm rounded-full shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#1c1c1e]" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#e0e2e8]"></div>
            <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-wider text-[#555a6a]">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[#e0e2e8]"></div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => googleLogin(formData.role || "user")}
            className="w-full h-12 min-h-[48px] flex items-center justify-center gap-3 bg-white border border-[#c7cad5] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] text-[#1c1c1e] font-bold text-sm rounded-full shadow-sm transition-all active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3">
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h146.9c-6.4 34-25.3 62.8-53.9 82.1v68.2h87.1c51-47 80.4-116.2 80.4-195.2z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-87.1-68.2c-24.2 16.2-55.3 25.8-91 25.8-69.9 0-129.2-47.1-150.4-110.5H32.9v69.4C77.5 475.6 167.3 544.3 272 544.3z"
              />
              <path
                fill="#FBBC04"
                d="M121.6 325.9c-10.4-30.8-10.4-64.2 0-94.9V161.6H32.9c-34 68-34 150.7 0 218.7l88.7-54.4z"
              />
              <path
                fill="#EA4335"
                d="M272 107.7c39.5-.6 77.5 13.9 106.4 40.7l79.4-79.4C411.1 24.5 343.5 0 272 0 167.3 0 77.5 68.7 32.9 161.6l88.7 69.4C142.8 154.8 202.1 107.7 272 107.7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Register Link */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-[#555a6a]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[#4262ff] hover:underline font-bold"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}