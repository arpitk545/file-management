"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { upsertProfile } from "../../../services/operations/profileAPI"
import { User, Phone, MapPin, Calendar, Upload, CheckCircle, X, Loader2, ChevronDown, Camera, ChevronUp } from "lucide-react"

const CreateProfile = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    country: "",
    gender: "",
    dob: "",
    address: "",
    profileImage: null,
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [genderOpen, setGenderOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "India",
    "Brazil",
    "South Africa",
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          profileImage: "Image size should be less than 2MB",
        })
        return
      }

      setFormData({
        ...formData,
        profileImage: file,
      })

      // Create image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Clear error
      if (errors.profileImage) {
        setErrors({
          ...errors,
          profileImage: "",
        })
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          profileImage: "Image size should be less than 2MB",
        })
        return
      }

      setFormData({
        ...formData,
        profileImage: file,
      })

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      if (errors.profileImage) {
        setErrors({
          ...errors,
          profileImage: "",
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    // Validate mobile
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required"
    } else {
      const mobile = formData.mobile.trim()
     // const digitsOnly = mobile.replace(/\D/g, "")
      const validMobilePattern = /^(\+91)?\d{10}$/
      if (!validMobilePattern.test(mobile)) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number, optionally prefixed with +91"
      }
    }

    // Validate country
    if (!formData.country) {
      newErrors.country = "Please select your country"
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = "Please select your gender"
    }

    // Validate date of birth
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required"
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    // Validate profile image
    if (!formData.profileImage) {
      newErrors.profileImage = "Profile image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }
    setIsSubmitting(true)

    try {
      // Prepare form data for multipart/form-data request
      const profileData = new FormData()
      profileData.append("fullName", formData.fullName)
      profileData.append("mobile", formData.mobile)
      profileData.append("country", formData.country)
      profileData.append("gender", formData.gender)
      profileData.append("dob", formData.dob)
      profileData.append("address", formData.address)
      profileData.append("profileImage", formData.profileImage)
      const response = await upsertProfile(profileData)

      if (response?.success) {
        toast.success("Profile created successfully!")
        navigate("/dashboard")
      } else {
        throw new Error(response?.message || "Failed to create profile")
      }

    } catch (error) {
      console.error("Error creating profile:", error)
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectGender = (gender) => {
    setFormData({
      ...formData,
      gender,
    })
    setGenderOpen(false)

    if (errors.gender) {
      setErrors({
        ...errors,
        gender: "",
      })
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const floatingBubbleVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    },
  }

  return (
    <div className="fixed inset-0 overflow-auto py-4 px-2 sm:px-4 flex justify-center items-start bg-gradient-to-br from-slate-50 to-cyan-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-gradient-to-r from-teal-300/20 to-cyan-300/20 blur-3xl"
          variants={floatingBubbleVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-[15%] w-72 h-72 rounded-full bg-gradient-to-r from-emerald-300/20 to-blue-300/20 blur-3xl"
          variants={floatingBubbleVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-[60%] w-48 h-48 rounded-full bg-gradient-to-r from-blue-300/20 to-indigo-300/20 blur-3xl"
          variants={floatingBubbleVariants}
          animate="animate"
          transition={{ delay: 0.5 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-2 sm:max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50"
      >
        {/* Profile Image Upload Section - Top Center */}
        <motion.div
          className="flex flex-col items-center justify-center pt-6 pb-4 px-4 sm:px-8 sm:pt-10 sm:pb-6 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative group" onDragOver={handleDragOver} onDrop={handleDrop}>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center cursor-pointer overflow-hidden
                ${
                  imagePreview
                    ? "border-4 border-emerald-400 shadow-lg shadow-emerald-200/50"
                    : "border-4 border-dashed border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50 transition-all duration-300"
                }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />

              {imagePreview ? (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Profile Preview"
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-500">Upload Photo</span>
                </div>
              )}
            </div>

            {/* Overlay with edit icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>

            {/* Remove button if image exists */}
            {imagePreview && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  setFormData({ ...formData, profileImage: null })
                  fileInputRef.current.value = ""
                }}
                className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </motion.button>
            )}
          </div>

          <motion.p
            className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {imagePreview ? "Looking good! Click to change" : "Drag & drop or click to upload"}
          </motion.p>

          {errors.profileImage && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs sm:text-sm text-red-500 text-center"
            >
              {errors.profileImage}
            </motion.p>
          )}
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Full Name */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3 sm:py-3.5 pt-5 sm:pt-6 rounded-lg sm:rounded-xl border-2 ${
                    errors.fullName ? "border-red-300 bg-red-50" : "border-gray-200"
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/60 backdrop-blur-sm transition-all duration-200 placeholder-transparent`}
                  placeholder="Full Name"
                />
                <label
                  htmlFor="fullName"
                  className="absolute left-4 top-1.5 sm:top-2 text-xs font-medium text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
                >
                  Full Name
                </label>
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              {errors.fullName && <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.fullName}</p>}
            </motion.div>

            {/* Mobile */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3 sm:py-3.5 pt-5 sm:pt-6 rounded-lg sm:rounded-xl border-2 ${
                    errors.mobile ? "border-red-300 bg-red-50" : "border-gray-200"
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/60 backdrop-blur-sm transition-all duration-200 placeholder-transparent`}
                  placeholder="Mobile Number"
                />
                <label
                  htmlFor="mobile"
                  className="absolute left-4 top-1.5 sm:top-2 text-xs font-medium text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
                >Mobile Number</label>
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              {errors.mobile && <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.mobile}</p>}
            </motion.div>

            {/* Country */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3 sm:py-3.5 pt-5 sm:pt-6 rounded-lg sm:rounded-xl border-2 appearance-none ${
                    errors.country ? "border-red-300 bg-red-50" : "border-gray-200"
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/60 backdrop-blur-sm transition-all duration-200`}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <label htmlFor="country" className="absolute left-4 top-1.5 sm:top-2 text-xs font-medium text-gray-500">
                  Country
                </label>
                <MapPin className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.country && <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.country}</p>}
            </motion.div>

            {/* Date of Birth */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3 sm:py-3.5 pt-5 sm:pt-6 rounded-lg sm:rounded-xl border-2 ${
                    errors.dob ? "border-red-300 bg-red-50" : "border-gray-200"
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/60 backdrop-blur-sm transition-all duration-200`}
                />
                <label htmlFor="dob" className="absolute left-4 top-1.5 sm:top-2 text-xs font-medium text-gray-500">
                  Date of Birth
                </label>
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              {errors.dob && <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.dob}</p>}
            </motion.div>

            {/* Gender - Custom Dropdown */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setGenderOpen(!genderOpen)}
                  className={`w-full px-4 py-3 sm:py-4 text-left rounded-lg sm:rounded-xl border-2 ${
                    errors.gender
                      ? "border-red-300 bg-red-50"
                      : formData.gender
                        ? "border-teal-200 bg-teal-50"
                        : "border-gray-200 bg-white/60"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200`}
                >
                  <span className="absolute left-4 top-1.5 sm:top-2 text-xs font-medium text-gray-500">Gender</span>
                  <span className={`block pt-3 ${formData.gender ? "text-gray-900" : "text-gray-400"}`}>
                    {formData.gender || "Select your gender"}
                  </span>
                  {genderOpen ? (
                    <ChevronUp className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-200" />
                  )}
                </button>

                <AnimatePresence>
                  {genderOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 mt-1 w-full bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      {["Male", "Female", "Other"].map((gender) => (
                        <div
                          key={gender}
                          onClick={() => selectGender(gender)}
                          className={`px-4 py-2 sm:py-3 cursor-pointer hover:bg-teal-50 transition-colors ${
                            formData.gender === gender ? "bg-teal-50 text-teal-700" : ""
                          }`}
                        >
                          {gender}
                          {formData.gender === gender && (
                            <CheckCircle className="inline-block ml-2 h-3 w-3 sm:h-4 sm:w-4 text-teal-500" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {errors.gender && <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.gender}</p>}
            </motion.div>

            {/* Address */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`peer w-full px-4 py-3 sm:py-3.5 pt-5 sm:pt-6 rounded-lg sm:rounded-xl border-2 ${
                    errors.address ? "border-red-300 bg-red-50" : "border-gray-200"
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/60 backdrop-blur-sm transition-all duration-200 placeholder-transparent`}
                  placeholder="Address"
                />
                <label
                  htmlFor="address"
                  className="absolute left-4 top-1.5 sm:top-2 text-xs font-medium text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
                >
                  Address
                </label>
              </div>
              {errors.address && <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.address}</p>}
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div 
            variants={itemVariants} 
            className="mt-6 sm:mt-8"
            whileHover={{ scale: isMobile ? 1 : 1.01 }} 
            whileTap={{ scale: isMobile ? 0.98 : 0.99 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Creating Profile...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Create Profile</span>
                </div>
              )}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default CreateProfile