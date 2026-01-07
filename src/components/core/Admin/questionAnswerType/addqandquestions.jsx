"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Target, BookOpen, MessageSquare, Send, ArrowLeft, Calendar, Tag, Users, Plus, X, ChevronDown, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getallqnadabyId, addQuestionToQanda, getAllQuestionTypes } from "../../../../services/operations/qandA";

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

  // Separate images for question and answer
  const [questionImages, setQuestionImages] = useState([null]);
  const [answerImages, setAnswerImages] = useState([null]);

  // Ref for scrolling to the bottom
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
    
    // Scroll to the bottom after adding a new question
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        toast.error(`Please enter question ${i + 1}`);
        return;
      }
      if (!questions[i].answer.trim()) {
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
            question: q.question.trim(),
            answer: q.answer.trim(),
            questiontype: q.questiontype.trim(),
          }))
        )
      );

      // Add question images
      questionImages.forEach((file) => {
        if (file) {
          formData.append("questionImages", file);
        }
      });

      // Add answer images
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
      <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-gray-600 text-lg">Loading Q&A details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }} 
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Add Questions to Q&A</h1>
              <p className="text-gray-600 text-lg">Add multiple questions to existing Q&A chapters</p>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl overflow-visible mb-8 rounded-none">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-none">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7" />
                Add Questions to Q&A
                <span className="text-blue-200 text-sm bg-white/20 px-2 py-1 rounded-none">
                  {qandaData?.questions?.length || 0} existing questions
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                {/* Desktop Q&A details (region, exam type, etc.) */}
                <div className="hidden lg:block">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Q&A Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-none">
                          <span className="text-sm font-medium text-blue-800 w-24">Region:</span>
                          <span className="text-sm font-semibold text-gray-800 flex-1">{qandaData?.category?.region || "N/A"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-none">
                          <span className="text-sm font-medium text-green-800 w-24">Exam Type:</span>
                          <span className="text-sm font-semibold text-gray-800 flex-1">{qandaData?.category?.examType || "N/A"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 border border-purple-200 rounded-none">
                          <span className="text-sm font-medium text-purple-800 w-24">Class:</span>
                          <span className="text-sm font-semibold text-gray-800 flex-1">{qandaData?.category?.specificClass || "N/A"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-none">
                          <span className="text-sm font-medium text-amber-800 w-24">Subject:</span>
                          <span className="text-sm font-semibold text-gray-800 flex-1">{qandaData?.category?.subject || "N/A"}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-none">
                          <span className="text-sm font-medium text-rose-800 w-24">Chapter:</span>
                          <span className="text-sm font-semibold text-gray-800 flex-1">{qandaData?.chapterName || "N/A"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-none">
                          <Tag className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-800">Tags:</span>
                          <div className="flex flex-wrap gap-1">
                            {qandaData?.tags?.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-none">
                                {tag}
                              </span>
                            )) || "No tags"}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-none">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-800">Roles:</span>
                          <div className="flex flex-wrap gap-1">
                            {qandaData?.roles?.map((role, index) => (
                              <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-none">
                                {role}
                              </span>
                            )) || "No roles"}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-none">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-800">Created:</span>
                          <span className="text-sm text-gray-600">
                            {qandaData?.createdAt ? new Date(qandaData.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Q&A details */}
                <div className="lg:hidden space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Q&A Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-none">
                      <span className="text-sm font-medium text-blue-800">Region:</span>
                      <span className="text-sm font-semibold text-gray-800 ml-2">{qandaData?.category?.region || "N/A"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-none">
                      <span className="text-sm font-medium text-green-800">Exam Type:</span>
                      <span className="text-sm font-semibold text-gray-800 ml-2">{qandaData?.category?.examType || "N/A"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 border border-purple-200 rounded-none">
                      <span className="text-sm font-medium text-purple-800">Class:</span>
                      <span className="text-sm font-semibold text-gray-800 ml-2">{qandaData?.category?.specificClass || "N/A"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-none">
                      <span className="text-sm font-medium text-amber-800">Subject:</span>
                      <span className="text-sm font-semibold text-gray-800 ml-2">{qandaData?.category?.subject || "N/A"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-none">
                      <span className="text-sm font-medium text-rose-800">Chapter:</span>
                      <span className="text-sm font-semibold text-gray-800 ml-2">{qandaData?.chapterName || "N/A"}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-none">
                      <Tag className="w-4 h-4 text-indigo-600 mt-1" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-indigo-800 block mb-1">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {qandaData?.tags?.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-none">
                              {tag}
                            </span>
                          )) || "No tags"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-none">
                      <Users className="w-4 h-4 text-emerald-600 mt-1" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-emerald-800 block mb-1">Roles:</span>
                        <div className="flex flex-wrap gap-1">
                          {qandaData?.roles?.map((role, index) => (
                            <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-none">
                              {role}
                            </span>
                          )) || "No roles"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-none">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Created:</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {qandaData?.createdAt ? new Date(qandaData.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Add Questions & Answers</h3>
                </div>

                {questions.map((q, index) => (
                  <div key={index} className="space-y-6 p-6 border-2 border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Question {index + 1}
                      </h4>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionField(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-md"
                          title="Remove this question"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Three-in-one row: Question Type, Question Image, Answer Image */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Question Type (Left) */}
                      <div className="space-y-2">
                        <label htmlFor={`question-type-${index}`} className="text-sm font-medium text-gray-700">
                          Question Type *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleDropdown(index)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-md font-medium text-left flex justify-between items-center hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                          >
                            <span className={q.questiontype ? "text-gray-800" : "text-gray-400"}>
                              {q.questiontype || "Select question type"}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen[index] ? "transform rotate-180" : ""}`} />
                          </button>
                          
                          {dropdownOpen[index] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                              {isQuestionTypesLoading ? (
                                <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                              ) : questionTypes.length > 0 ? (
                                questionTypes.map((type, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => selectQuestionType(index, type.name)}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-b-0"
                                  >
                                    {type.name}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">No question types available</div>
                              )}
                            </div>
                          )}
                        </div>
                        {q.questiontype && (
                          <p className="text-xs text-green-600 mt-1">
                            Selected: <span className="font-semibold">{q.questiontype}</span>
                          </p>
                        )}
                      </div>

                      {/* Question Image (Middle) */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Question Image (optional)
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 px-3 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50 text-sm text-gray-700">
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                            <span className="truncate flex-1">
                              {questionImages[index]?.name || "Choose question image"}
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

                          {/* Question image preview */}
                          {questionImages[index] && (
                            <div className="flex items-center gap-2">
                              <div className="relative w-12 h-12 border border-gray-200 overflow-hidden rounded-md">
                                <img
                                  src={URL.createObjectURL(questionImages[index])}
                                  alt="Question preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => clearQuestionImage(index)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                                  title="Remove question image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 truncate">
                                  {questionImages[index].name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Answer Image (Right) */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Answer Image (optional)
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 px-3 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-green-400 hover:bg-green-50 text-sm text-gray-700">
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                            <span className="truncate flex-1">
                              {answerImages[index]?.name || "Choose answer image"}
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

                          {/* Answer image preview */}
                          {answerImages[index] && (
                            <div className="flex items-center gap-2">
                              <div className="relative w-12 h-12 border border-gray-200 overflow-hidden rounded-md">
                                <img
                                  src={URL.createObjectURL(answerImages[index])}
                                  alt="Answer preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => clearAnswerImage(index)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                                  title="Remove answer image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 truncate">
                                  {answerImages[index].name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Question Input */}
                    <div className="space-y-2">
                      <label htmlFor={`question-${index}`} className="text-sm font-medium text-gray-700">
                        Question *
                      </label>
                      <textarea
                        id={`question-${index}`}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                        placeholder="Enter your question here..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-md font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none bg-white"
                        required
                      />
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-2">
                      <label htmlFor={`answer-${index}`} className="text-sm font-medium text-gray-700">
                        Answer *
                      </label>
                      <textarea
                        id={`answer-${index}`}
                        value={q.answer}
                        onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                        placeholder="Enter the answer here..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-md font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none bg-white"
                        required
                      />
                    </div>
                  </div>
                ))}

                {/* Add Another Question Button - Below all questions */}
                <div ref={addButtonRef} className="flex justify-center">
                  <button
                    type="button"
                    onClick={addQuestionField}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Question
                  </button>
                </div>

                {/* Bottom actions - Right aligned */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/view-qa')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-md hover:bg-gray-100 transition-all duration-200 border border-gray-300 order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Q&A List
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-600 text-center sm:text-right">
                      {questions.length} question{questions.length !== 1 ? 's' : ''} ready to add
                    </span>
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        questions.some(q => !q.question.trim() || !q.answer.trim() || !q.questiontype.trim())
                      }
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-8 py-3 rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding {questions.length} question{questions.length !== 1 ? 's' : ''}...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Add {questions.length} Question{questions.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}