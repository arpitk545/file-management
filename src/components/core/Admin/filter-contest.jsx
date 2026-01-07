"use client"
import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Trophy,  Edit, Trash2, ArrowLeft, Eye,ChevronDown,Archive, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getAllQuizRegions } from "../../../services/operations/quizAPI"
import { getAllContest, deleteContestByTitle } from "../../../services/operations/contestAPI"

const FilterContest = () => {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [contests, setContests] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [filterValues, setFilterValues] = useState({
    status: "",
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })

  // Fetch regions and contests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch regions
        const regionsResponse = await getAllQuizRegions()
        setRegions(regionsResponse?.data || [])
        
        // Fetch contests
        const contestsResponse = await getAllContest()
        setContests(contestsResponse?.data || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  //back to the dashboard
    useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/dashboard", { replace: true }); 
    };
  
    window.addEventListener("popstate", handleBackButton);
  
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  // Get selected region
  const selectedRegion = regions.find(region => region._id === filterValues.region)

  // Get dropdown options from fetched data
  const statusOptions = ["Approved", "Waiting for Approval", "Rejected Contest"]
  
  const regionOptions = useMemo(() => {
    return regions.map(region => ({
      name: region.name,
      value: region._id
    }))
  }, [regions])

  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map(type => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !filterValues.examType) return []
    const selectedExamType = selectedRegion.examTypes.find(et => et.name === filterValues.examType)
    return selectedExamType?.specificClasses?.map(cls => cls.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegion || !filterValues.examType || !filterValues.specificClass) return []
    const selectedExamType = selectedRegion.examTypes.find(et => et.name === filterValues.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filterValues.specificClass)
    return selectedSpecificClass?.subjects?.map(subject => subject.name) || []
  }

  const getChapters = () => {
    if (!selectedRegion || !filterValues.examType || !filterValues.specificClass || !filterValues.subject) return []
    const selectedExamType = selectedRegion.examTypes.find(et => et.name === filterValues.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find(sc => sc.name === filterValues.specificClass)
    const selectedSubject = selectedSpecificClass?.subjects.find(sub => sub.name === filterValues.subject)
    return selectedSubject?.chapters?.map(ch => ch.name) || []
  }

  // Filter contests based on dropdown selections
  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const matchesStatus = !filterValues.status || contest.status === filterValues.status
      const matchesRegion = !filterValues.region || contest.region === filterValues.region
      const matchesExamType = !filterValues.examType || contest.examType === filterValues.examType
      const matchesSpecificClass = !filterValues.specificClass || contest.specificClass === filterValues.specificClass
      const matchesSubject = !filterValues.subject || contest.subject === filterValues.subject
      const matchesChapter = !filterValues.chapter || contest.chapter === filterValues.chapter

      return matchesStatus && matchesRegion && matchesExamType && matchesSpecificClass && matchesSubject && matchesChapter
    })
  }, [contests, filterValues])

  const handleFilterChange = (name, value) => {
    if (name === "region") {
      setFilterValues(prev => ({
        ...prev,
        region: value,
        examType: "",
        specificClass: "",
        subject: "",
        chapter: ""
      }))
    } else if (name === "examType") {
      setFilterValues(prev => ({
        ...prev,
        examType: value,
        specificClass: "",
        subject: "",
        chapter: ""
      }))
    } else if (name === "specificClass") {
      setFilterValues(prev => ({
        ...prev,
        specificClass: value,
        subject: "",
        chapter: ""
      }))
    } else if (name === "subject") {
      setFilterValues(prev => ({
        ...prev,
        subject: value,
        chapter: ""
      }))
    } else {
      setFilterValues(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleEdit = (contest) => {
    navigate(`/edit-contest/${contest._id}`)
  }
  const handlechangeStatus =(contest) =>{
    navigate(`/enroll-Students/${contest._id}`)
  }
  const showallresult =(contest) =>{
    navigate(`/show-all-result/${contest._id}`)
  }

  const handleDelete = async (contest) => {
    if (window.confirm(`Are you sure you want to delete "${contest.title}"?`)) {
      try {
        setIsLoading(true)
        await deleteContestByTitle(contest.title)
        setContests(prev => prev.filter(c => c._id !== contest._id))
      } catch (error) {
        console.error("Failed to delete contest:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleView = (contest) => {
    navigate(`/view-contest/${contest._id}`)
  }

  const clearFilters = () => {
    setFilterValues({
      status: "",
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Waiting for Approval":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Rejected Contest":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const CustomSelect = ({ label, value, onChange, options, placeholder, name }) => (
    <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white appearance-none transition-all duration-200"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.name || option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
          {/* Filter Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Contest Management</h1>
                  <p className="text-orange-100 text-sm sm:text-base">Filter and manage contests by various criteria</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 self-start sm:self-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </motion.button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filter Contests</h2>
                {Object.values(filterValues).some((value) => value) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 self-start sm:self-center"
                  >
                    <Filter className="w-4 h-4" />
                    Clear Filters
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <CustomSelect
                  label="Status"
                  name="status"
                  value={filterValues.status}
                  onChange={handleFilterChange}
                  options={statusOptions}
                  placeholder="Select status"
                />
                <CustomSelect
                  label="Region"
                  name="region"
                  value={filterValues.region}
                  onChange={handleFilterChange}
                  options={regionOptions}
                  placeholder="Select region"
                />
                <CustomSelect
                  label="Exam Type"
                  name="examType"
                  value={filterValues.examType}
                  onChange={handleFilterChange}
                  options={getExamTypes()}
                  placeholder="Select exam type"
                />
                <CustomSelect
                  label="Specific Class"
                  name="specificClass"
                  value={filterValues.specificClass}
                  onChange={handleFilterChange}
                  options={getSpecificClasses()}
                  placeholder="Select class"
                />
                <CustomSelect
                  label="Subject"
                  name="subject"
                  value={filterValues.subject}
                  onChange={handleFilterChange}
                  options={getSubjects()}
                  placeholder="Select subject"
                />
                <CustomSelect
                  label="Chapter"
                  name="chapter"
                  value={filterValues.chapter}
                  onChange={handleFilterChange}
                  options={getChapters()}
                  placeholder="Select chapter"
                />
              </div>
            </div>
          </motion.div>

          {/* Contest List Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                  Contest List ({filteredContests.length})
                  {filteredContests.length !== contests.length && (
                    <span className="text-sm font-normal text-gray-500 ml-2">(filtered from {contests.length})</span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <Search className="w-4 h-4" />
                  <span className="text-sm">Live filtering active</span>
                </div>
              </div>

              {/* Contest List */}
              <div className="space-y-4 sm:space-y-6">
                <AnimatePresence>
                  {filteredContests.map((contest, index) => (
                    <motion.div
                      key={contest._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-800 rounded-full text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{contest.title}</h3>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(contest.status)}`}>
                              {contest.status}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-2">{contest.description ||"A fun and competitive quiz to test your knowledge and win exciting prizes."}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
    
                              <span className="text-gray-600 flex-shrink-0">Region:</span>
                              <span className="font-medium text-gray-900 truncate">{contest.region}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-600 flex-shrink-0">Exam:</span>
                              <span className="font-medium text-gray-900 truncate">{contest.examType}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-600 flex-shrink-0">Class:</span>
                              <span className="font-medium text-gray-900 truncate">{contest.specificClass}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-600 flex-shrink-0">Subject:</span>
                              <span className="font-medium text-gray-900 truncate">{contest.subject}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-600 flex-shrink-0">Chapter:</span>
                              <span className="font-medium text-gray-900 truncate">{contest.chapter}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              <span className="text-gray-600 flex-shrink-0">Prize:</span>
                              <span className="font-medium text-green-600 truncate">₹{contest.prize}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                            
                              <span className="text-gray-600 flex-shrink-0">Deadline:</span>
                              <span className="font-medium text-gray-900 truncate">
                                {new Date(contest.deadline).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                             
                              <span className="text-gray-600 flex-shrink-0">Start Time:</span>
                              <span className="font-medium text-gray-900 truncate">
                                {contest.startTime ? new Date(contest.startTime).toLocaleString() : "Not set"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center gap-2 flex-shrink-0 self-start lg:self-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleView(contest)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all duration-200"
                            title="View Contest"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(contest)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200"
                            title="Edit Contest"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => showallresult(contest)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200"
                            title="Contest Result"
                          >
                          <TrendingUp className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(contest)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200"
                            title="Delete Contest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                           <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlechangeStatus(contest)}
                            className="p-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-600 rounded-lg transition-all duration-200"
                            title="See Status"
                          >
                            <Archive className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredContests.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No contests found</h3>
                  <p className="text-gray-600">
                    {contests.length === 0
                      ? "No contests available at the moment."
                      : "Try adjusting your filter criteria to see more results."}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default FilterContest