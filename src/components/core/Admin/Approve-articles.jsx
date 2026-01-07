"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Check,
  X,
  MapPin,
  FileText,
  Tag,
  Calendar,
  User,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { getArticleById, updateArticleStatus } from "../../../services/operations/articelsAPI";

const ApproveArticles = () => {
  const [currentArticle, setCurrentArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const response = await getArticleById(id);
        if (response?.success) {
          setCurrentArticle(response.article);
        } else {
          toast.error("Failed to fetch article");
        }
      } catch (error) {
        toast.error("Error loading article");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const updateStatus = async (newStatus) => {
    if (!currentArticle) return;
   setLoadingAction(newStatus);

    try {
      const response = await updateArticleStatus(currentArticle._id, newStatus); 

      if (response?.success) {
        setCurrentArticle(response.article);
        toast.success(`Article ${newStatus} successfully!`);
        // Redirect back after approval/rejection
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(response?.message || "Failed to update article status");
      }
    } catch (error) {
      console.error(`Error updating article status to ${newStatus}:`, error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApprove = () => updateStatus("approved");
  const handleReject = () => updateStatus("rejected");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading post for review...</p>
        </div>
      </div>
    );
  }

  if (!currentArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">post not found</h3>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
     
      <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Review Post
              </h1>
              {/* <p className="text-gray-600 text-lg"></p> */}
            </motion.div>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          {/* Article Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
          >
            {/* Article Header */}
            <div className="p-8 border-b border-gray-100">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentArticle.title}</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Region:</span>
                      <span className="font-semibold text-gray-900">{currentArticle.region}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="font-semibold text-gray-900">{currentArticle.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Subcategory:</span>
                      <span className="font-semibold text-gray-900">{currentArticle.subCategory}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      <User className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-gray-600">Post status:</span>
                      <span className="font-semibold text-gray-900">{currentArticle.status || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-600">Submitted:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(currentArticle.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-indigo-500" />
                      <span className="text-sm text-gray-600">Comments:</span>
                      <span
                        className={`font-semibold ${
                          currentArticle.commentsEnabled ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {currentArticle.commentsEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentArticle.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Article Thumbnail */}
            {currentArticle.thumbnail && currentArticle.thumbnail.length > 0 && (
              <div className="px-8 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Post Thumbnail</h3>
                <div className="rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={currentArticle.thumbnail[0]}
                    alt={currentArticle.title}
                    className="max-w-full max-h-96 object-contain"
                    style={{ maxHeight: "24rem" }}
                  />
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Post Content</h3>
              <div
                 className="prose prose-lg max-w-none text-gray-700"
                 dangerouslySetInnerHTML={{ __html: currentArticle.content }}
              />

              {/* Additional Images */}
              {currentArticle.image && currentArticle.image.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentArticle.image.map((image, index) => (
                      <div key={index} className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`View ${index + 1}`}
                          className="max-w-full max-h-64 object-contain"
                          style={{ maxHeight: "16rem" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <button
              onClick={handleApprove}
              disabled={loadingAction !== null}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loadingAction === "approved" ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6" />
                  Approve Post
                </div>
              )}
            </button>

            <button
              onClick={handleReject}
              disabled={loadingAction !== null}
              className="px-12 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loadingAction === "rejected"  ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <X className="w-6 h-6" />
                  Reject Post
                </div>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ApproveArticles;