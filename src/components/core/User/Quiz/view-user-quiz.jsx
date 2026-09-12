"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  FileText,
  CheckCircle2,
  Edit,
  Play,
  Layers,
  MapPin,
  Award,
  Loader2,
  Image as ImageIcon,
  Maximize2,
  X,
  Check,
  AlertCircle,
  HelpCircle,
  Hash,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronRight
} from "lucide-react"
import toast from "react-hot-toast"
import {
  getQuizById,
  getAllQuizzesWithCategoryAndQuestions
} from "../../../../services/operations/quizAPI"

export default function ViewUserQuiz() {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Get requested quiz ID from location state or URL params (/view-all-user-quiz/:quizId or :id)
  const requestedQuizId = location.state?.quizId || params.quizId || params.id

  // Initial state can use passed quiz object from filter-user-quiz for instant rendering
  const [quiz, setQuiz] = useState(location.state?.quiz?.rawQuiz || location.state?.quiz || null)
  const [isLoading, setIsLoading] = useState(!quiz)
  const [lightboxImage, setLightboxImage] = useState(null) // { url, title, type }

  useEffect(() => {
    let isMounted = true

    const fetchTargetQuiz = async () => {
      try {
        // If we already have the quiz with populated questions, avoid full screen spinner
        if (quiz && quiz.questions && quiz.questions.length > 0 && !requestedQuizId) {
          setIsLoading(false)
          return
        }

        if (!quiz) {
          setIsLoading(true)
        }

        if (requestedQuizId) {
          try {
            const singleRes = await getQuizById(requestedQuizId)
            const quizData = singleRes?.quiz || singleRes?.data
            if (quizData && isMounted) {
              setQuiz(quizData)
              setIsLoading(false)
              return
            }
          } catch (err) {
            console.warn("Could not load quiz by id directly, checking full list:", err)
          }

          // Fallback: search in all quizzes list
          const allRes = await getAllQuizzesWithCategoryAndQuestions()
          const allList = allRes?.quizzes || allRes?.data || []
          const found = allList.find((q) => q._id === requestedQuizId)
          if (found && isMounted) {
            setQuiz(found)
            setIsLoading(false)
            return
          }
        }

        // If no ID or quiz found, try getting the most recent quiz
        const allRes = await getAllQuizzesWithCategoryAndQuestions()
        const allList = allRes?.quizzes || allRes?.data || []
        if (allList.length > 0 && isMounted) {
          setQuiz(allList[0])
        }
      } catch (error) {
        console.error("Error loading quiz:", error)
        toast.error("Failed to load quiz details")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchTargetQuiz()

    return () => {
      isMounted = false
    }
  }, [requestedQuizId])

  // Helper to check if string looks like an image URL or base64 data
  const isImageString = (val) => {
    if (!val || typeof val !== "string") return false
    return (
      val.startsWith("data:image/") ||
      val.startsWith("blob:") ||
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(val)
    )
  }

  // Open Lightbox
  const handleOpenLightbox = (url, title = "Diagram View", type = "Diagram") => {
    if (!url) return
    setLightboxImage({ url, title, type })
  }

  // Close Lightbox
  const handleCloseLightbox = () => {
    setLightboxImage(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans w-full">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse border border-[#c7cad5]">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">
          Loading Quiz Details & Diagrams...
        </p>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans w-full">
        <div className="bg-white rounded-3xl border border-[#c7cad5] p-6 sm:p-12 max-w-lg w-full shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#fff8e0] border border-[#fde89c] text-[#746019] flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">No Quiz Selected</h2>
          <p className="text-xs sm:text-sm text-[#6a6d7c] leading-relaxed">
            Please select a quiz from your assessments directory to inspect questions, diagrams, and answer keys.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => navigate("/filter-user-quiz")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Quizzes</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Normalized Quiz fields
  const title = quiz.category?.quizTitle || quiz.quizTitle || quiz.title || "Untitled Assessment"
  const description = quiz.category?.description || quiz.description || "No description provided for this academic assessment."
  const thumbnail = quiz.category?.thumbnailimage || quiz.thumbnailimage || ""
  const region = quiz.category?.region || quiz.region || "General"
  const examType = quiz.category?.examType || quiz.examType || "Comprehensive"
  const specificClass = quiz.category?.specificClass || quiz.specificClass || "All Levels"
  const subject = quiz.category?.subject || quiz.subject || "General Study"
  const chapter = quiz.category?.chapter || quiz.chapter || "Full Syllabus"
  const duration = quiz.category?.duration || quiz.duration || 60
  const totalQuestions = quiz.questions?.length || quiz.category?.totalQuestions || 0
  const author = quiz.category?.author || quiz.author || "Educator"
  const passcode = quiz.category?.passcode || quiz.passcode || ""
  const approvalStatus = quiz.category?.approvalStatus || quiz.approvalStatus || "Approved"
  const questionsList = quiz.questions || quiz.rawQuiz?.questions || []
  const formattedDate = quiz.createdAt
    ? new Date(quiz.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Academic Suite"

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 xl:px-12 w-full font-sans overflow-x-hidden">
      {/* 100% Full Width Container - No max-w limitation */}
      <div className="w-full space-y-5 sm:space-y-7">

        {/* Top Sticky Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-[#c7cad5] w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate("/filter-user-quiz")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors text-xs font-bold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Quizzes</span>
            </button>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#ffd02f] text-[#1c1c1e] shadow-2xs border border-[#e5ba2a]">
              QUIZ INSPECTION
            </span>

            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                approvalStatus === "Approved"
                  ? "bg-[#c3faf5] text-[#187574] border-[#9eece4]"
                  : approvalStatus === "Rejected"
                  ? "bg-[#fbd4d4] text-[#800000] border-[#f8b4b4]"
                  : "bg-[#fff8e0] text-[#746019] border-[#fde89c]"
              }`}
            >
              {approvalStatus}
            </span>
          </div>

          {/* Action CTAs - Responsive on Mobile */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={() => navigate(`/edit-user-quiz/${quiz._id}`)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#c7cad5] hover:bg-[#ebecf0] text-xs font-bold text-[#1c1c1e] transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-[#555a6a]" />
              <span>Edit Quiz</span>
            </button>
            <button
              onClick={() => navigate(`/play-quiz/${quiz._id}`)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#ffd02f] fill-[#ffd02f]" />
              <span>Start Assessment</span>
            </button>
          </div>
        </div>

        {/* Hero Assessment Overview Banner Card - Full Width */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#c7cad5] shadow-sm p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 text-left w-full">
          <div className="flex flex-col-reverse lg:flex-row gap-5 lg:gap-8 lg:items-start justify-between w-full">
            <div className="space-y-3 flex-1 min-w-0">
              {/* Category Badges Strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#fff8e0] text-[#746019] border border-[#fde89c]">
                  <MapPin className="w-3 h-3 text-[#746019]" />
                  <span>{region}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  <Layers className="w-3 h-3 text-[#187574]" />
                  <span>{subject}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#ebe8ff] text-[#371796] border border-[#d8d2ff]">
                  <Award className="w-3 h-3 text-[#371796]" />
                  <span>{examType}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#f7f8fa] text-[#555a6a] border border-[#c7cad5]">
                  <FileText className="w-3 h-3" />
                  <span>Class: {specificClass}</span>
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1c1c1e] tracking-tight leading-snug break-words">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm text-[#555a6a] leading-relaxed mt-2 max-w-5xl break-words">
                  {description}
                </p>
              </div>

              {/* Author, Chapter & Date Metadata */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#6a6d7c] font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8e91a0]" />
                  <span>Author: <strong className="text-[#1c1c1e]">{author}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#8e91a0]" />
                  <span>Chapter: <strong className="text-[#1c1c1e]">{chapter}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8e91a0]" />
                  <span>Created: <strong className="text-[#1c1c1e]">{formattedDate}</strong></span>
                </span>
              </div>
            </div>

            {/* Optional Thumbnail Image */}
            {thumbnail && (
              <div className="w-full lg:w-72 h-44 sm:h-52 lg:h-44 flex-shrink-0 bg-[#f7f8fa] rounded-2xl border border-[#c7cad5] overflow-hidden p-2 flex items-center justify-center relative group">
                <img
                  src={thumbnail}
                  alt={title}
                  className="max-h-full max-w-full object-contain object-center rounded-xl cursor-pointer transition-transform group-hover:scale-[1.02]"
                  onClick={() => handleOpenLightbox(thumbnail, title, "Cover Thumbnail")}
                />
                <button
                  onClick={() => handleOpenLightbox(thumbnail, title, "Cover Thumbnail")}
                  className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#1c1c1e]/85 text-white flex items-center gap-1 shadow-sm backdrop-blur-xs hover:bg-[#1c1c1e] transition-all cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>View Cover</span>
                </button>
              </div>
            )}
          </div>

          {/* 4-Tile Metric Strip - 2 cols on mobile, 4 cols on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 border-t border-[#e6e8ec] w-full">
            <div className="p-3 sm:p-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl sm:rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6a6d7c] block">
                Total Questions
              </span>
              <span className="text-base sm:text-lg font-black text-[#1c1c1e] mt-0.5 block">
                {questionsList.length} Items
              </span>
            </div>

            <div className="p-3 sm:p-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl sm:rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6a6d7c] block">
                Duration Limit
              </span>
              <span className="text-base sm:text-lg font-black text-[#1c1c1e] mt-0.5 block">
                {duration} Minutes
              </span>
            </div>

            <div className="p-3 sm:p-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl sm:rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6a6d7c] block">
                Access Passcode
              </span>
              <span className="text-base sm:text-lg font-black text-[#1c1c1e] mt-0.5 block truncate">
                {passcode ? (
                  <span className="inline-flex items-center gap-1 text-[#187574] font-mono">
                    <Lock className="w-3.5 h-3.5" />
                    {passcode}
                  </span>
                ) : (
                  <span className="text-[#6a6d7c] font-normal text-xs sm:text-sm">Public / Free</span>
                )}
              </span>
            </div>

            <div className="p-3 sm:p-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl sm:rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6a6d7c] block">
                Diagrams Attached
              </span>
              <span className="text-base sm:text-lg font-black text-[#187574] mt-0.5 block">
                {questionsList.filter((q) => q.image || q.questionImage || q.diagram || q.imageUrl).length} Questions
              </span>
            </div>
          </div>
        </div>

        {/* Section Heading Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 w-full">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#1c1c1e] tracking-tight">
              Questions, Diagrams & Verified Solutions
            </h2>
            <p className="text-xs sm:text-sm text-[#6a6d7c] mt-0.5">
              Review each individual question statement, associated diagrams/figures, options, verified answer keys, and solution notes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#c7cad5] text-[#1c1c1e] shadow-2xs">
              {questionsList.length} Questions in Suite
            </span>
          </div>
        </div>

        {/* Questions Suite - Full Width */}
        {questionsList.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#c7cad5] shadow-sm p-8 sm:p-12 text-center text-[#6a6d7c] space-y-3 w-full">
            <AlertCircle className="w-8 h-8 text-[#8e91a0] mx-auto" />
            <p className="text-sm font-bold text-[#1c1c1e]">No Questions Found</p>
            <p className="text-xs max-w-sm mx-auto">
              This quiz does not currently have any questions attached. You can edit this quiz to add questions with diagrams.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate(`/edit-user-quiz/${quiz._id}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold shadow-sm cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Add Questions Now</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 w-full">
            {questionsList.map((q, idx) => {
              // Extract question-level diagram
              const questionDiagram = q.image || q.questionImage || q.diagram || q.imageUrl || null
              // Extract solution / note
              const solutionNote = q.note || q.explanation || q.solution || ""
              // Extract answer diagram
              const answerDiagram = q.answerImage || q.solutionImage || q.diagramAnswer || null

              // Options handling
              let optionsEntries = []
              if (q.options) {
                if (Array.isArray(q.options)) {
                  optionsEntries = q.options.map((optVal, oIdx) => [
                    String.fromCharCode(65 + oIdx),
                    optVal
                  ])
                } else if (typeof q.options === "object") {
                  optionsEntries = Object.entries(q.options)
                }
              }

              return (
                <div
                  key={q._id || idx}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-[#c7cad5] shadow-sm p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 text-left transition-all hover:border-[#1c1c1e]/40 w-full"
                >
                  {/* Question Header Card */}
                  <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-[#f0f1f4] w-full">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#ffd02f] text-[#1c1c1e] font-black text-xs sm:text-sm flex items-center justify-center border border-[#e5ba2a] shadow-2xs shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#1c1c1e] block">
                          Question {idx + 1}
                        </span>
                        {q.tags && q.tags.length > 0 && (
                          <span className="text-[11px] text-[#6a6d7c] font-medium">
                            Tags: {q.tags.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {q.difficulty && (
                        <span
                          className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            q.difficulty === "Easy"
                              ? "bg-[#c3faf5] text-[#187574] border-[#9eece4]"
                              : q.difficulty === "Hard"
                              ? "bg-[#fbd4d4] text-[#800000] border-[#f8b4b4]"
                              : "bg-[#fff8e0] text-[#746019] border-[#fde89c]"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      )}
                      {questionDiagram && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ebe8ff] text-[#371796] border border-[#d8d2ff]">
                          <ImageIcon className="w-3 h-3" />
                          <span>Diagram</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="space-y-3 w-full">
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-[#1c1c1e] leading-relaxed break-words">
                      {q.text || q.questionText || q.question || "Untitled question statement"}
                    </p>

                    {/* QUESTION DIAGRAM / IMAGE */}
                    {questionDiagram && (
                      <div className="pt-2 w-full">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1c1c1e]">
                            <ImageIcon className="w-3.5 h-3.5 text-[#187574]" />
                            <span>Question Diagram / Schematic</span>
                          </span>
                          <button
                            onClick={() => handleOpenLightbox(questionDiagram, `Question #${idx + 1} Diagram`, "Question Figure")}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#187574] hover:underline cursor-pointer"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Enlarge</span>
                          </button>
                        </div>

                        <div className="w-full max-h-72 sm:max-h-96 md:max-h-[480px] bg-[#f0f1f4] rounded-xl sm:rounded-2xl overflow-hidden border border-[#c7cad5] flex items-center justify-center p-2 sm:p-4 relative group shadow-2xs">
                          <img
                            src={questionDiagram}
                            alt={`Question ${idx + 1} diagram`}
                            className="max-h-64 sm:max-h-88 md:max-h-[450px] max-w-full object-contain object-center rounded-lg sm:rounded-xl cursor-pointer transition-transform group-hover:scale-[1.01]"
                            onClick={() => handleOpenLightbox(questionDiagram, `Question #${idx + 1} Diagram`, "Question Figure")}
                          />
                          <button
                            onClick={() => handleOpenLightbox(questionDiagram, `Question #${idx + 1} Diagram`, "Question Figure")}
                            className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold bg-[#1c1c1e]/90 text-white flex items-center gap-1.5 shadow-md backdrop-blur-xs hover:bg-[#1c1c1e] transition-all cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Full Resolution</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MCQ Options A, B, C, D */}
                  {optionsEntries.length > 0 && (
                    <div className="space-y-2.5 sm:space-y-3 pt-2 w-full">
                      <span className="text-xs font-black uppercase tracking-wider text-[#6a6d7c] block">
                        Answer Options & Verified Key:
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                        {optionsEntries.map(([optKey, optVal]) => {
                          const isCorrect = String(q.correctAnswer).trim().toUpperCase() === String(optKey).trim().toUpperCase()
                          const isOptImage = isImageString(optVal)

                          return (
                            <div
                              key={optKey}
                              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between gap-2.5 w-full ${
                                isCorrect
                                  ? "bg-[#c3faf5]/60 border-[#187574] text-[#1c1c1e] shadow-xs"
                                  : "bg-[#f7f8fa] border-[#c7cad5] text-[#1c1c1e]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                                    isCorrect
                                      ? "bg-[#187574] text-white shadow-2xs"
                                      : "bg-white border border-[#c7cad5] text-[#1c1c1e]"
                                  }`}
                                >
                                  {optKey}
                                </span>

                                <div className="flex-1 min-w-0">
                                  {isOptImage ? (
                                    <div className="space-y-2">
                                      <span className="text-xs font-semibold text-[#6a6d7c] block">
                                        Option Image ({optKey}):
                                      </span>
                                      <div className="max-h-44 sm:max-h-48 w-full bg-white rounded-xl border border-[#c7cad5] p-2 flex items-center justify-center overflow-hidden">
                                        <img
                                          src={optVal}
                                          alt={`Option ${optKey}`}
                                          className="max-h-36 sm:max-h-40 max-w-full object-contain cursor-pointer"
                                          onClick={() => handleOpenLightbox(optVal, `Question #${idx + 1} - Option ${optKey}`, "Option Diagram")}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs sm:text-sm font-semibold leading-relaxed break-words block">
                                      {optVal || `Option ${optKey}`}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isCorrect && (
                                <div className="pt-2 border-t border-[#9eece4] flex items-center justify-between gap-1 text-[11px] font-black text-[#187574]">
                                  <span className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#187574]" />
                                    <span>Verified Correct Answer</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[#187574] text-white text-[10px] uppercase tracking-wider font-bold">
                                    Key: {optKey}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* SOLUTION NOTE & EXPLANATION DIAGRAM */}
                  {(solutionNote || answerDiagram) && (
                    <div className="p-3.5 sm:p-5 bg-[#fff8e0]/70 border border-[#fde89c] rounded-xl sm:rounded-2xl space-y-2.5 sm:space-y-3 w-full">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#746019]">
                          <Sparkles className="w-4 h-4 text-[#746019]" />
                          <span>Detailed Solution & Explanation Note</span>
                        </span>
                        {q.correctAnswer && (
                          <span className="text-[11px] font-bold text-[#746019]">
                            Correct Option: <strong>{q.correctAnswer}</strong>
                          </span>
                        )}
                      </div>

                      {solutionNote && (
                        <p className="text-xs sm:text-sm text-[#5a480d] leading-relaxed font-medium break-words">
                          {solutionNote}
                        </p>
                      )}

                      {/* ANSWER / SOLUTION DIAGRAM */}
                      {answerDiagram && (
                        <div className="pt-2 space-y-1.5 w-full">
                          <span className="text-xs font-bold text-[#746019] block">
                            Solution Diagram / Derivation Figure:
                          </span>
                          <div className="max-h-64 sm:max-h-80 md:max-h-[400px] w-full bg-white rounded-xl border border-[#fde89c] p-2 sm:p-3 flex items-center justify-center overflow-hidden relative group">
                            <img
                              src={answerDiagram}
                              alt={`Question ${idx + 1} solution diagram`}
                              className="max-h-56 sm:max-h-72 md:max-h-[380px] max-w-full object-contain cursor-pointer"
                              onClick={() => handleOpenLightbox(answerDiagram, `Question #${idx + 1} Solution Diagram`, "Solution Figure")}
                            />
                            <button
                              onClick={() => handleOpenLightbox(answerDiagram, `Question #${idx + 1} Solution Diagram`, "Solution Figure")}
                              className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#1c1c1e]/85 text-white flex items-center gap-1 shadow-sm hover:bg-[#1c1c1e] cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Enlarge Solution</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Footer CTAs - Full Width & Mobile Responsive */}
        <div className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#c7cad5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="space-y-0.5 text-left">
            <h3 className="text-sm font-extrabold text-[#1c1c1e]">
              Ready to Practice or Test this Assessment?
            </h3>
            <p className="text-xs text-[#6a6d7c]">
              Launch the interactive quiz player or adjust questions in the quiz builder editor.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => navigate("/filter-user-quiz")}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-white border border-[#c7cad5] hover:bg-[#ebecf0] text-xs font-bold text-[#1c1c1e] transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              Back to My Quizzes
            </button>
            <button
              onClick={() => navigate(`/play-quiz/${quiz._id}`)}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-[#ffd02f] fill-[#ffd02f]" />
              <span>Launch Quiz</span>
            </button>
          </div>
        </div>

      </div>

      {/* DIAGRAM LIGHTBOX MODAL - Fully Mobile Responsive */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
          onClick={handleCloseLightbox}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl border border-[#c7cad5] max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#c7cad5] flex items-center justify-between gap-3 bg-[#f7f8fa]">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e] border border-[#e5ba2a] shrink-0">
                  {lightboxImage.type || "Diagram"}
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#1c1c1e] truncate">
                  {lightboxImage.title}
                </h4>
              </div>

              <button
                onClick={handleCloseLightbox}
                className="w-8 h-8 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close image preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Body with High-Contrast Canvas */}
            <div className="flex-1 p-2 sm:p-4 md:p-6 bg-[#f0f1f4] flex items-center justify-center overflow-auto min-h-[220px] sm:min-h-[320px]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] sm:max-h-[78vh] max-w-full object-contain rounded-xl shadow-md border border-[#c7cad5] bg-white p-2"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-[#c7cad5] bg-white flex items-center justify-between text-xs text-[#6a6d7c]">
              <span className="text-[11px] sm:text-xs">High resolution diagram inspection</span>
              <button
                onClick={handleCloseLightbox}
                className="px-4 py-1.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
