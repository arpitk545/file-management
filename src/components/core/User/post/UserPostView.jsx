"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Share2,
  Star,
  X,
  Copy,
  PhoneIcon as Whatsapp,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Calendar,
  Layers,
  MapPin,
  Tag,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleById, getAllArticles } from "../../../../services/operations/articelsAPI";
import { createComment, getAllCommentsById } from "../../../../services/operations/commentAPI";
import toast from "react-hot-toast";

// Format HTML content to apply rich text styles (alignments, links, images) directly onto elements
const formatHtmlContent = (htmlContent) => {
  if (!htmlContent) return "";

  let formatted = htmlContent;

  // 1. Format hyperlinks: ensure target="_blank", rel="noopener noreferrer", and blue underlined styling
  formatted = formatted.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!/target=/i.test(newAttrs)) {
      newAttrs += ' target="_blank" rel="noopener noreferrer"';
    }
    if (/style="/i.test(newAttrs)) {
      newAttrs = newAttrs.replace(
        /style="([^"]*)"/i,
        'style="$1; color: #4262ff; text-decoration: underline; font-weight: 600; cursor: pointer;"'
      );
    } else {
      newAttrs += ' style="color: #4262ff; text-decoration: underline; font-weight: 600; cursor: pointer;"';
    }
    return `<a ${newAttrs.trim()}>`;
  });

  // 2. Format Quill alignment classes directly into inline text-align styles
  formatted = formatted
    .replace(/(<[a-z0-9]+[^>]*class="[^"]*?\bql-align-center\b[^"]*")/gi, (match) => {
      if (/style="/i.test(match)) {
        return match.replace(/style="([^"]*)"/i, 'style="$1; text-align: center;"');
      }
      return `${match} style="text-align: center;"`;
    })
    .replace(/(<[a-z0-9]+[^>]*class="[^"]*?\bql-align-right\b[^"]*")/gi, (match) => {
      if (/style="/i.test(match)) {
        return match.replace(/style="([^"]*)"/i, 'style="$1; text-align: right;"');
      }
      return `${match} style="text-align: right;"`;
    })
    .replace(/(<[a-z0-9]+[^>]*class="[^"]*?\bql-align-justify\b[^"]*")/gi, (match) => {
      if (/style="/i.test(match)) {
        return match.replace(/style="([^"]*)"/i, 'style="$1; text-align: justify;"');
      }
      return `${match} style="text-align: justify;"`;
    });

  // 3. Format images: responsive, rounded corners, inline-block
  formatted = formatted.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (/style="/i.test(newAttrs)) {
      newAttrs = newAttrs.replace(
        /style="([^"]*)"/i,
        'style="$1; display: inline-block; max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1rem 0;"'
      );
    } else {
      newAttrs += ' style="display: inline-block; max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1rem 0;"';
    }
    return `<img ${newAttrs.trim()}>`;
  });

  return formatted;
};

const UserPostView = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [professionText, setProfessionText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      try {
        setLoading(true);
        const articleResponse = await getArticleById(articleId);
        if (articleResponse?.success && articleResponse?.article) {
          setArticle(articleResponse.article);
        } else {
          toast.error("Failed to fetch post");
          navigate("/user-all-post-view");
          return;
        }

        const commentsResponse = await getAllCommentsById(articleId);
        if (commentsResponse?.success) {
          const approvedComments = (commentsResponse.comments || []).filter(
            (comment) => comment.status === "approved"
          );
          const formatted = approvedComments.map((comment) => ({
            id: comment._id,
            content: comment.content,
            createdAt: comment.createdAt,
            userName: comment.userProfile?.name || "Anonymous",
            userAvatar: comment.userProfile?.avatar,
            initials: comment.userProfile?.initials || "",
            title: comment.title || "",
            rating: comment.rating || 0,
          }));
          setComments(formatted);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading article or comments");
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticleAndComments();
    }
  }, [articleId, navigate]);

  // Fetch all articles for related posts
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const response = await getAllArticles();
        if (response?.success) {
          const approvedArticles = (response.data || []).filter(
            (art) => art.status === "approved"
          );
          setAllArticles(approvedArticles);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };
    fetchAllArticles();
  }, []);

  // Filter related articles
  useEffect(() => {
    if (article && allArticles.length > 0) {
      const related = allArticles
        .filter(
          (art) =>
            art._id !== article._id &&
            (art.category === article.category || art.region === article.region)
        )
        .slice(0, 4);
      setRelatedArticles(related);
    }
  }, [article, allArticles]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim() || userRating === 0) return;

    setIsSubmittingComment(true);

    try {
      const response = await createComment({
        content: commentText.trim(),
        title: professionText.trim(),
        rating: userRating,
        category: "Article",
        refId: articleId,
      });

      if (response?.success) {
        if (response.comment?.status === "approved") {
          setComments((prev) => [...prev, response.comment]);
        } else {
          toast.success("Comment submitted for review. It will appear once approved.");
        }

        setCommentText("");
        setProfessionText("");
        setUserRating(0);
      } else {
        toast.error(response?.message || "Failed to submit comment.");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast.error("Error submitting comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleBack = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.history.back();
    } else {
      navigate("/user-all-post-view");
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    const articleLink = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(articleLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Clipboard access not supported in this browser.");
    }
  };

  const handleRelatedArticleClick = (relId) => {
    navigate(`/post-view/${relId}`);
    window.scrollTo(0, 0);
  };

  const shareLink = window.location.href;
  const shareTitle = article?.title || "Check out this article!";

  const contentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  if (loading && !article) {
    return <div className="min-h-screen bg-[#f7f8fa] w-full" />;
  }

  if (!article) {
    return (
      <div className="fixed inset-0 bg-[#f7f8fa] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-[#eef0f3] shadow-sm text-center max-w-sm w-full">
          <p className="text-base font-bold text-[#1c1c1e] mb-2">Article Not Found</p>
          <p className="text-xs text-[#6a6d7c] mb-6">The requested article could not be retrieved.</p>
          <button
            onClick={handleBack}
            className="w-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  const thumbnailSrc = Array.isArray(article.thumbnail)
    ? article.thumbnail[0]
    : article.thumbnail;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e8ec]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Posts</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#ffd02f] text-[#1c1c1e] shadow-2xs">
              STUDENT ARTICLES
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              COMMUNITY POST
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Share2 className="w-4 h-4 text-[#ffd02f]" />
            <span>Share Post</span>
          </button>
        </div>

        {/* Main Article Content Card */}
        <AnimatePresence mode="wait">
          <motion.article
            key={article._id}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-6 sm:p-10 text-left w-full space-y-6"
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {article.region && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#fff4c4] text-[#746019] border border-[#fde89c]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{article.region}</span>
                </span>
              )}
              {article.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{article.category}</span>
                </span>
              )}
              {article.subCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#fbd4d4]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{article.subCategory}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1c1c1e] leading-tight tracking-tight">
              {article.title || "Untitled Article"}
            </h1>

            {/* Publication Date */}
            {article.date && (
              <div className="flex items-center gap-2 text-xs text-[#6a6d7c] font-medium pb-2 border-b border-[#e6e8ec]">
                <Calendar className="w-4 h-4 text-[#187574]" />
                <span>
                  Published on{" "}
                  {new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}

            {/* Complete Image Fit for Main Thumbnail - Full width container */}
            {thumbnailSrc && (
              <div className="w-full h-72 sm:h-96 md:h-[500px] bg-[#f0f1f4] rounded-2xl overflow-hidden border border-[#c7cad5] flex items-center justify-center p-3 sm:p-6 my-6">
                <img
                  src={thumbnailSrc}
                  alt={article.title || "Article thumbnail"}
                  className="w-full h-full object-contain object-center rounded-xl"
                />
              </div>
            )}

            {/* Formatted Article Content */}
            {article.content && (
              <div
                className="prose prose-base sm:prose-lg max-w-none text-[#2c2c34] leading-relaxed py-4 text-left prose-headings:font-bold prose-headings:text-[#1c1c1e] prose-a:text-[#4262ff] prose-a:underline prose-a:font-semibold prose-img:rounded-xl prose-img:my-4"
                dangerouslySetInnerHTML={{
                  __html: formatHtmlContent(article.content),
                }}
              />
            )}

            {/* Additional Images: Complete Image Fit */}
            {article.image && article.image.length > 0 && (
              <div className="pt-6 border-t border-[#e6e8ec]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6a6d7c] mb-4">
                  Visual References & Media
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {article.image.map((imgSrc, index) => (
                    <div
                      key={index}
                      className="rounded-2xl overflow-hidden bg-[#f0f1f4] border border-[#c7cad5] p-2.5 flex items-center justify-center h-60"
                    >
                      <img
                        src={imgSrc || "/placeholder.svg"}
                        alt={`${article.title} reference ${index + 1}`}
                        className="w-full h-full object-contain object-center rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Share Action */}
            <div className="flex items-center justify-between pt-6 border-t border-[#e6e8ec]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffd02f]" />
                <span className="text-xs font-semibold text-[#6a6d7c]">Verified Post</span>
              </div>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#ffd02f]" />
                <span>Share Post</span>
              </button>
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Related Posts Section */}
        {relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-6 sm:p-8 w-full space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#e6e8ec] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#c3faf5] border border-[#9eece4] flex items-center justify-center text-[#187574]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">Related Posts</h2>
                  <p className="text-xs text-[#6a6d7c]">Explore more insightful study articles</p>
                </div>
              </div>
              <span className="text-xs text-[#8e91a0] font-semibold">
                {relatedArticles.length} {relatedArticles.length === 1 ? "article" : "articles"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedArticles.map((relatedArticle) => {
                const relThumbnail = Array.isArray(relatedArticle.thumbnail)
                  ? relatedArticle.thumbnail[0]
                  : relatedArticle.thumbnail;

                return (
                  <div
                    key={relatedArticle._id}
                    onClick={() => handleRelatedArticleClick(relatedArticle._id)}
                    className="bg-white rounded-2xl border border-[#c7cad5] hover:border-[#1c1c1e] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Image Fit Container */}
                      <div className="w-full h-44 bg-[#f0f1f4] p-2.5 flex items-center justify-center overflow-hidden border-b border-[#e6e8ec]">
                        {relThumbnail ? (
                          <img
                            src={relThumbnail}
                            alt={relatedArticle.title || "Related thumbnail"}
                            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#6a6d7c] bg-[#f7f8fa]">
                            <BookOpen className="w-6 h-6 text-[#ffd02f] mb-1" />
                            <span className="text-[10px] font-bold uppercase">Article</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        {relatedArticle.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4] inline-block">
                            {relatedArticle.category}
                          </span>
                        )}
                        <h3 className="text-xs font-bold text-[#1c1c1e] line-clamp-2 leading-snug group-hover:text-[#4262ff] transition-colors">
                          {relatedArticle.title}
                        </h3>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-[#e6e8ec] bg-[#fafbfc] text-[11px] font-bold text-[#1c1c1e] flex items-center justify-between">
                      <span>Read article</span>
                      <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-6 sm:p-8 space-y-6 w-full"
        >
          <div className="flex items-center justify-between border-b border-[#e6e8ec] pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">
                Discussion & Feedback ({comments?.length || 0})
              </h2>
              <p className="text-xs text-[#6a6d7c]">Share your feedback and rating with the community</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fff8e0] text-[#746019] border border-[#fde89c]">
              Community Reviews
            </span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profession Input */}
              <div>
                <label
                  htmlFor="profession"
                  className="block text-xs font-bold uppercase tracking-wider text-[#6a6d7c] mb-1.5"
                >
                  Your Profession / Role
                </label>
                <input
                  id="profession"
                  type="text"
                  className="w-full h-11 px-3.5 border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                  placeholder="e.g., Student, Educator, Researcher"
                  value={professionText}
                  onChange={(e) => setProfessionText(e.target.value)}
                />
              </div>

              {/* Rating */}
              <div>
                <label
                  htmlFor="rating"
                  className="block text-xs font-bold uppercase tracking-wider text-[#6a6d7c] mb-1.5"
                >
                  Article Rating (1–5 Stars)
                </label>
                <div className="h-11 flex items-center gap-1.5 px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 cursor-pointer transition-colors ${
                        star <= userRating
                          ? "fill-[#ffd02f] text-[#ffd02f]"
                          : "text-[#c7cad5] hover:text-[#ffd02f]"
                      }`}
                      onClick={() => setUserRating(star)}
                    />
                  ))}
                  {userRating > 0 && (
                    <span className="ml-2 text-xs font-bold text-[#1c1c1e]">{userRating}/5</span>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label
                htmlFor="comment"
                className="block text-xs font-bold uppercase tracking-wider text-[#6a6d7c] mb-1.5"
              >
                Your Thoughts
              </label>
              <textarea
                id="comment"
                className="w-full p-3.5 border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all resize-y min-h-[100px]"
                placeholder="Share your feedback, insights, or questions about this article..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={!commentText.trim() || userRating === 0 || isSubmittingComment}
              className="inline-flex items-center gap-2 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmittingComment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#ffd02f]" />
                  <span>Submit Comment</span>
                </>
              )}
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-3 pt-3">
            {comments?.length > 0 ? (
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-[#fafbfc] rounded-2xl border border-[#c7cad5] flex items-start gap-3.5"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#c7cad5] flex items-center justify-center bg-white text-xs font-bold text-[#1c1c1e] flex-shrink-0">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar || "/placeholder.svg"}
                          alt={comment.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.userName?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                        <p className="font-bold text-xs text-[#1c1c1e]">{comment.userName}</p>
                        {comment.createdAt && (
                          <span className="text-[11px] text-[#8e91a0]">
                            {new Date(comment.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {comment.title && (
                        <p className="text-[11px] font-semibold text-[#187574] mb-1">{comment.title}</p>
                      )}

                      {comment.rating > 0 && (
                        <div className="flex items-center gap-0.5 text-[#ffd02f] mb-2">
                          {Array.from({ length: comment.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-[#2c2c34] leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center text-[#8e91a0] py-8 bg-[#fafbfc] rounded-2xl border border-dashed border-[#c7cad5]">
                <p className="text-sm font-semibold text-[#1c1c1e]">No comments yet</p>
                <p className="text-xs text-[#8e91a0] mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Modal with Miro Design */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              className="bg-white rounded-3xl border border-[#eef0f3] shadow-2xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-[#8e91a0] hover:text-[#1c1c1e] hover:bg-[#f0f1f5] transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffd02f]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Share Article
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1c1c1e] mb-5">Spread the Knowledge</h3>

              {/* Social Channels */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-2.5 rounded-2xl hover:bg-[#f7f8fa] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#c3faf5] flex items-center justify-center text-[#187574] mb-1">
                    <Whatsapp size={20} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#555a6a]">WhatsApp</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-2.5 rounded-2xl hover:bg-[#f7f8fa] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#e1f0ff] flex items-center justify-center text-[#2a41b6] mb-1">
                    <Facebook size={20} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#555a6a]">Facebook</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-2.5 rounded-2xl hover:bg-[#f7f8fa] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f0f1f5] flex items-center justify-center text-[#1c1c1e] mb-1">
                    <Twitter size={20} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#555a6a]">Twitter</span>
                </a>

                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-2.5 rounded-2xl hover:bg-[#f7f8fa] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#e1f0ff] flex items-center justify-center text-[#2a41b6] mb-1">
                    <Linkedin size={20} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#555a6a]">LinkedIn</span>
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-2.5 rounded-2xl hover:bg-[#f7f8fa] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#fde0f0] flex items-center justify-center text-[#86296b] mb-1">
                    <Mail size={20} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#555a6a]">Email</span>
                </a>
              </div>

              {/* Copy URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">
                  Direct Link
                </label>
                <div className="flex items-center border border-[#c7cad5] rounded-full overflow-hidden bg-[#f7f8fa] p-1">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 px-3.5 py-1.5 bg-transparent text-xs text-[#1c1c1e] focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      copied
                        ? "bg-[#187574] text-white"
                        : "bg-[#1c1c1e] hover:bg-[#2c2c34] text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserPostView;