import { useState, useRef,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Edit, MapPin, Mail, Phone, Calendar, User, Shield } from 'lucide-react'
import { getMyProfile } from "../../../services/operations/profileAPI"
import countries from "i18n-iso-countries";
import { parsePhoneNumber } from 'libphonenumber-js';
import "i18n-iso-countries/langs/en.json";
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('');
  const [offset, setOffset] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile()
        setUserData(response) // Update user data from API
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])
//Handling the timezone and offset
 useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get timezone offset in hours and minutes
    const date = new Date();
    const offsetMinutes = -date.getTimezoneOffset(); // In minutes
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
    const formattedOffset = `UTC${sign}${hours}:${minutes}`;

    setTimezone(tz);
    setOffset(formattedOffset);
  }, []);

  //to show the country name and flag
  useEffect(() => {
  if (userData?.country) {
    const code = countries.getAlpha2Code(userData.country, 'en');
    if (code) {
      setUserData(prev => ({
        ...prev,
        countryCode: code.toLowerCase(), 
      }));
    }
  }
}, [userData?.country]);

//Showing the phone number in international format
useEffect(() => {
  if (userData?.mobile) {
    try {
      const phoneNumber = parsePhoneNumber(userData.mobile);
      const countryCode = phoneNumber?.country?.toLowerCase(); // e.g. 'in'
      if (countryCode) {
        setUserData(prev => ({
          ...prev,
          countryCode: countryCode,
          country: phoneNumber.country, 
        }));
      }
    } catch (err) {
      console.warn('Could not parse phone number:', err);
    }
  }
}, [userData?.mobile]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          profileImage: e.target.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }
const getRoleBadgeColor = (role) => {

  if (!role || typeof role !== "string") {
    return "bg-gray-100 text-gray-800 border-gray-200";
  }

  switch (role.toLowerCase()) {
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "manager":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatAccountCreated = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  const calculateAgeFromDate = (dateString) => {
  if (!dateString) return 'N/A';

  const createdDate = new Date(dateString);
  const now = new Date();

  let years = now.getFullYear() - createdDate.getFullYear();
  let months = now.getMonth() - createdDate.getMonth();
  let days = now.getDate() - createdDate.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); // days in previous month
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
};
if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-100 opacity-30"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-100 opacity-30"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-blue-100/50">
                <img
                  src={userData?.profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110 group-hover:opacity-100 opacity-90"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            {/* Profile Summary */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">{userData?.fullName}</h1>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRoleBadgeColor(userData?.user.role)} shadow-sm`}>
                 {userData?.user.role? userData.user.role.charAt(0).toUpperCase() + userData.user.role.slice(1): ""}

                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">{userData?.user.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">{userData?.mobile}</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center md:justify-start">
                <button 
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</p>
                  <p className="font-medium text-gray-800">{userData?.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</p>
                  <p className="font-medium text-gray-800">{formatDate(userData?.dob)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</p>
                <p className="font-medium text-gray-800 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span>{userData?.address}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</p>
                <p className="font-medium text-gray-800">{userData?.user.role? userData.user.role.charAt(0).toUpperCase() + userData.user.role.slice(1): ""}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Created</p>
                <p className="font-medium text-gray-800">{formatAccountCreated(userData?.user.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-gray-800">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-500" />
                  <span>{userData?.user.email}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span>{userData?.mobile}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Country</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <img
                   src={`https://flagcdn.com/w40/${userData?.countryCode}.png`}
                   alt={`${userData?.country} flag`}
                   className="w-4 h-3 rounded-sm object-cover"
                  />
                  <span>{userData?.country}</span>
                </p>
              </div>
            </div>
          </div>

          {/* System Information Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                System Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</p>
                <p className="font-medium text-gray-800">{userData?.lastLogin ? formatDate(userData.lastLogin) : 'No last login'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Age</p>
                <p className="font-medium text-gray-800">{calculateAgeFromDate(userData?.user.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Timezone</p>
                <p className="font-medium text-gray-800">{offset} ({timezone})</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}