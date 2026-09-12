"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  BookOpen,
  MessageSquare,
  Send,
  ArrowLeft,
  Calendar,
  Tag,
  Users,
  Plus,
  X,
  ChevronDown,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  Layers,
  Loader2,
  Trash2,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getallqnadabyId, addQuestionToQanda, getAllQuestionTypes } from "../../../../services/operations/qandA";
import QuestionEditor from "./questionseditor";
import AnswerEditor from "./AnswerEditor";

export default function AddQandaQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [qandaData, setQandaData] = useState(null);
  const [questions, setQuestions] = useState([{ question: "", answer: "", questiontype: "" }]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [isQuestionTypesLoading, setIsQuestionTypesLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(Array(questions.length).fill(false));

  const [questionImages, setQuestionImages] = useState([null]);
  const [answerImages, setAnswerImages] = useState([null]);

  const addButtonRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchQandAById(id);
    }
    fetchQuestionTypes();
  }, [id]);

  const fetchQandAById = async (qandaId) => {
    setIsFetching(true);
    try {
      const response = await getallqnadabyId(qandaId);
      if (response.success) {
        setQandaData(response.data);
        setQuestions([{ question: "", answer: "", questiontype: "" }]);
        setDropdownOpen([false]);
        setQuestionImages([null]);
        setAnswerImages([null]);
      } else {
        toast.error("Failed to fetch Q&A details");
      }
    } catch (error) {
      console.error("Error fetching Q&A by ID:", error);
      toast.error("Failed to fetch Q&A details");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchQuestionTypes = async () => {
    setIsQuestionTypesLoading(true);
    try {
      const response = await getAllQuestionTypes();
      if (response.data) {
        setQuestionTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching question types:", error);
      toast.error("Failed to load question types");
    } finally {
      setIsQuestionTypesLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionImageChange = (index, file) => {
    const newImages = [...questionImages];
    newImages[index] = file || null;
    setQuestionImages(newImages);
  };

  const handleAnswerImageChange = (index, file) => {
    const newImages = [...answerImages];
    newImages[index] = file || null;
    setAnswerImages(newImages);
  };

  const clearQuestionImage = (index) => {
    const newImages = [...questionImages];
    newImages[index] = null;
    setQuestionImages(newImages);
  };

  const clearAnswerImage = (index) => {
    const newImages = [...answerImages];
    newImages[index] = null;
    setAnswerImages(newImages);
  };

  const addQuestionField = () => {
    setQuestions([...questions, { question: "", answer: "", questiontype: "" }]);
    setDropdownOpen([...dropdownOpen, false]);
    setQuestionImages([...questionImages, null]);
    setAnswerImages([...answerImages, null]);

    setTimeout(() => {
      if (addButtonRef.current) {
        addButtonRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const removeQuestionField = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);

      const newDropdownOpen = dropdownOpen.filter((_, i) => i !== index);
      setDropdownOpen(newDropdownOpen);

      const newQuestionImages = questionImages.filter((_, i) => i !== index);
      setQuestionImages(newQuestionImages);

      const newAnswerImages = answerImages.filter((_, i) => i !== index);
      setAnswerImages(newAnswerImages);
    }
  };

  const toggleDropdown = (index) => {
    const newDropdownOpen = [...dropdownOpen];
    newDropdownOpen[index] = !newDropdownOpen[index];
    setDropdownOpen(newDropdownOpen);
  };

  const selectQuestionType = (index, type) => {
    handleQuestionChange(index, "questiontype", type);
    const newDropdownOpen = [...dropdownOpen];
    newDropdownOpen[index] = false;
    setDropdownOpen(newDropdownOpen);
  };

  // Helper function to strip HTML tags for validation
  const stripHtml = (html) => {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i = 0; i < questions.length; i++) {
      const questionText = stripHtml(questions[i].question);
      const answerText = stripHtml(questions[i].answer);

      if (!questionText.trim()) {
        toast.error(`Please enter question ${i + 1}`);
        return;
      }
      if (!answerText.trim()) {
        toast.error(`Please enter answer ${i + 1}`);
        return;
      }
      if (!questions[i].questiontype.trim()) {
        toast.error(`Please select question type for question ${i + 1}`);
        return;
      }
    }

    if (!id || !qandaData) {
      toast.error("No Q&A selected");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();

      formData.append(
        "questions",
        JSON.stringify(
          questions.map((q) => ({
            question: q.question,
            answer: q.answer,
            questiontype: q.questiontype.trim(),
          }))
        )
      );

      questionImages.forEach((file) => {
        if (file) {
          formData.append("questionImages", file);
        }
      });

      answerImages.forEach((file) => {
        if (file) {
          formData.append("answerImages", file);
        }
      });

      const response = await addQuestionToQanda(id, formData);

      if (response.success) {
        toast.success(`Successfully added ${questions.length} question(s)!`);
        setQuestions([{ question: "", answer: "", questiontype: "" }]);
        setDropdownOpen([false]);
        setQuestionImages([null]);
        setAnswerImages([null]);
        navigate("/view-qa");
      } else {
        throw new Error(response.message || "Failed to add questions");
      }
    } catch (error) {
      console.error("Error adding questions:", error);
      toast.error(error.message || "Failed to add questions");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-sm max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Chapter Information...</h3>
          <p className="text-xs text-[#555a6a]">Fetching academic context &amp; existing items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/view-qa")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Q&amp;A List</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              QUESTION COMPOSER
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              ADMIN &amp; MANAGER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <Layers className="w-3.5 h-3.5 text-[#4262ff]" />
              <span>{qandaData?.questions?.length || 0} Questions Already In Chapter</span>
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Add Questions &amp; Answers
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Compose questions, detailed step-by-step solutions, and associate question formats for chapter:{" "}
            <strong className="text-[#1c1c1e]">{qandaData?.chapterName || "N/A"}</strong>
          </p>
        </div>

        {/* Chapter Context & Classification Banner (Lavender Miro Card) */}
        <div className="bg-[#f5f3ff] rounded-2xl border border-[#ddd6fe] p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#ddd6fe]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#4262ff] text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
                Target Chapter Context
              </h2>
            </div>
            <span className="text-xs font-bold text-[#4262ff] bg-white px-3 py-1 rounded-full border border-[#ddd6fe]">
              Active Target
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Region</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {qandaData?.category?.region || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Exam Type</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {qandaData?.category?.examType || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Class</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {qandaData?.category?.specificClass || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe]">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Subject</span>
              <strong className="text-xs sm:text-sm text-[#1c1c1e] truncate block">
                {qandaData?.category?.subject || "—"}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#ddd6fe] sm:col-span-2">
              <span className="text-[11px] font-bold text-[#555a6a] uppercase block">Chapter Title</span>
              <strong className="text-xs sm:text-sm text-[#4262ff] truncate block">
                {qandaData?.chapterName || "—"}
              </strong>
            </div>
          </div>

          {qandaData?.tags && qandaData.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="font-bold text-[#555a6a]">Tags:</span>
              {qandaData.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe] font-semibold text-[11px]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Question Builder Form */}
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {questions.map((q, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm hover:border-[#1c1c1e] transition-colors"
            >
              {/* Question Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#1c1c1e]">
                      Question Item #{index + 1}
                    </h3>
                    <p className="text-xs text-[#555a6a]">
                      Define the question statement, type classification, and complete solution.
                    </p>
                  </div>
                </div>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestionField(index)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fbd4d4] hover:bg-[#f8bebe] text-[#800000] text-xs font-bold transition-all"
                    title="Remove this question item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Question Type & Image Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Question Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                    Question Type *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(index)}
                      className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold flex items-center justify-between focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
                    >
                      <span className={q.questiontype ? "text-[#1c1c1e]" : "text-[#8e92a0]"}>
                        {q.questiontype || "Select question type..."}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#555a6a] transition-transform ${
                          dropdownOpen[index] ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownOpen[index] && (
                      <div className="absolute z-20 w-full mt-1.5 bg-white border border-[#c7cad5] rounded-xl shadow-lg max-h-56 overflow-auto divide-y divide-[#f7f8fa] p-1">
                        {isQuestionTypesLoading ? (
                          <div className="px-3 py-2 text-xs text-[#555a6a]">Loading types...</div>
                        ) : questionTypes.length > 0 ? (
                          questionTypes.map((type, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectQuestionType(index, type.name)}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-[#fffdf5] hover:text-[#1c1c1e] text-xs sm:text-sm font-semibold text-[#555a6a] rounded-lg transition-colors"
                            >
                              {type.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-[#555a6a]">No types found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {q.questiontype && (
                    <span className="text-[11px] font-bold text-[#187574] inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {q.questiontype}
                    </span>
                  )}
                </div>

                {/* Question Image Dropzone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                    Question Diagram / Image (Optional)
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 px-3.5 h-11 min-h-[44px] rounded-xl border border-dashed border-[#c7cad5] bg-[#fffdf5] hover:bg-white hover:border-[#1c1c1e] cursor-pointer text-xs font-semibold text-[#555a6a] transition-all">
                      <ImageIcon className="w-4 h-4 text-[#4262ff] flex-shrink-0" />
                      <span className="truncate flex-1">
                        {questionImages[index]?.name || "Attach question image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleQuestionImageChange(index, e.target.files?.[0] || null)
                        }
                      />
                    </label>

                    {questionImages[index] && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8]">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#c7cad5] flex-shrink-0">
                          <img
                            src={URL.createObjectURL(questionImages[index])}
                            alt="Question preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-semibold text-[#1c1c1e] truncate flex-1">
                          {questionImages[index].name}
                        </p>
                        <button
                          type="button"
                          onClick={() => clearQuestionImage(index)}
                          className="p-1 text-[#800000] hover:bg-[#fbd4d4] rounded-full transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Image Dropzone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                    Solution Diagram / Image (Optional)
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 px-3.5 h-11 min-h-[44px] rounded-xl border border-dashed border-[#c7cad5] bg-[#fffdf5] hover:bg-white hover:border-[#1c1c1e] cursor-pointer text-xs font-semibold text-[#555a6a] transition-all">
                      <ImageIcon className="w-4 h-4 text-[#187574] flex-shrink-0" />
                      <span className="truncate flex-1">
                        {answerImages[index]?.name || "Attach solution image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleAnswerImageChange(index, e.target.files?.[0] || null)
                        }
                      />
                    </label>

                    {answerImages[index] && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8]">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#c7cad5] flex-shrink-0">
                          <img
                            src={URL.createObjectURL(answerImages[index])}
                            alt="Answer preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-semibold text-[#1c1c1e] truncate flex-1">
                          {answerImages[index].name}
                        </p>
                        <button
                          type="button"
                          onClick={() => clearAnswerImage(index)}
                          className="p-1 text-[#800000] hover:bg-[#fbd4d4] rounded-full transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Rich Question Text Editor */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Question Statement *
                </label>
                <div className="rounded-xl border border-[#c7cad5] overflow-hidden bg-white focus-within:border-[#1c1c1e] focus-within:ring-2 focus-within:ring-[#ffd02f]/30">
                  <QuestionEditor
                    content={q.question}
                    onChange={(value) => handleQuestionChange(index, 'question', value)}
                    placeholder="Enter question statement, formula, or problem description..."
                  />
                </div>
              </div>

              {/* Rich Answer Text Editor */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Step-by-Step Answer &amp; Explanation *
                </label>
                <div className="rounded-xl border border-[#c7cad5] overflow-hidden bg-white focus-within:border-[#1c1c1e] focus-within:ring-2 focus-within:ring-[#ffd02f]/30">
                  <AnswerEditor
                    content={q.answer}
                    onChange={(value) => handleQuestionChange(index, 'answer', value)}
                    placeholder="Enter comprehensive answer, derivation, and notes for students..."
                  />
                </div>
              </div>

            </div>
          ))}

          {/* Add Another Question Trigger */}
          <div ref={addButtonRef} className="flex justify-center pt-2">
            <button
              type="button"
              onClick={addQuestionField}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#c7cad5] hover:border-[#1c1c1e] hover:bg-[#f7f8fa] text-[#1c1c1e] text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#4262ff]" />
              <span>Add Another Question Block</span>
            </button>
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[#555a6a]">
                Ready to submit: <strong>{questions.length}</strong> new question{questions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/view-qa')}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] text-xs sm:text-sm font-bold transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  questions.some(q => {
                    const questionText = stripHtml(q.question);
                    const answerText = stripHtml(q.answer);
                    return !questionText.trim() || !answerText.trim() || !q.questiontype.trim();
                  })
                }
                className="w-full sm:w-auto h-12 min-h-[48px] px-8 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-gray-100 disabled:border disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#1c1c1e] font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1e]" />
                    <span>Saving {questions.length} Question{questions.length !== 1 ? 's' : ''}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#1c1c1e]" />
                    <span>Add {questions.length} Question{questions.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}