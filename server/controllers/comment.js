const Article = require('../models/articles');
const {CreateFile,FileRegion} =require('../models/file');
const Comment = require('../models/comment');
const User = require('../models/auth');
const Profile = require('../models/profile');
const mongoose = require('mongoose');

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0]?.toUpperCase())
    .join('');
}
//create the commment 

exports.createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, rating, status, category, refId, title } = req.body;

    const validCategories = ['Article', 'File', 'Quiz', 'Contest', 'AIQuiz'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (!refId) {
      return res.status(400).json({ message: 'refId is required' });
    }

    // Validate Article
    if (category === 'Article') {
      const article = await Article.findById(refId);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      if (!article.commentsEnabled) {
        return res.status(403).json({ message: 'Comments are disabled for this article' });
      }
    }

    // Validate File
    if (category === 'File') {
      const file = await CreateFile.findById(refId);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      if (!file.showCommentBox) {
        return res.status(403).json({ message: 'Comments are disabled for this file' });
      }
    }

    // Validate user (optional but good to keep)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Just store references, not duplicated user data
    const commentData = {
      user: userId,
      content,
      rating,
      status,
      category,
      refId,
      title
    };

    const savedComment = await new Comment(commentData).save();

    return res.status(201).json({ success: true, comment: savedComment });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create comment', error });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .populate('user') 
      .lean();

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        try {
          const profile = await Profile.findOne({ user: comment.user._id }).lean();

          return {
            title: comment.title,
            content: comment.content,
            rating: comment.rating,
            status: comment.status,
            category: comment.category,
            refId: comment.refId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            __v: comment.__v,
            userProfile: {
              name: profile?.fullName || "Unknown",
              initials: profile?.fullName ? getInitials(profile.fullName) : "U",
              avatar:profile?.profileImage,
              email: comment.user?.email || "N/A"
            }
          };
        } catch (err) {
          console.error("Error enriching comment:", comment._id, err);
          return null;
        }
      })
    );

    const filteredComments = enrichedComments.filter(Boolean);

    res.status(200).json({
      success: true,
      comments: filteredComments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments"
    });
  }
};


exports.getCommentsByRefId = async (req, res) => {
  try {
    const { refId } = req.params;

    // Find all comments that match refId only
    const comments = await Comment.find({ refId })
      .populate('user', 'email') 
      .lean();

    //fetch profile data
    const commentsWithProfile = await Promise.all(comments.map(async (comment) => {
      const profile = await Profile.findOne({ user: comment.user._id }).lean();
      return {
        ...comment,
        userProfile: {
          name: profile?.fullName || 'N/A',
          avatar: profile?.profileImage || null,
          initials: profile ? getInitials(profile.fullName) : 'NA',
          email: comment.user.email,
        },
      };
    }));

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: commentsWithProfile,
    });

  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching comments",
    });
  }
};

//change the status 
exports.changeCommentStatus = async (req, res) => {
  try {
    const { name, email, content, category, status } = req.body;

    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (!name || !email || !content || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    //Find the comment using user._id
    const updated = await Comment.findOneAndUpdate(
      {
        user: user._id,
        content,
        category,
      },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Comment not found for status update' });
    }

    res.json({ success: true, message: `Comment marked as ${status}`, comment: updated });

  } catch (error) {
    console.error("Error updating comment status:", error);
    res.status(500).json({ message: 'Failed to update comment status', error });
  }
};

//delete the comment
exports.deleteComment = async (req, res) => {
  try {
    const { name, email, content } = req.body;

    if (!name || !email || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    //Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    //Find and delete comment by user, content
    const deleted = await Comment.findOneAndDelete({
      user: user._id,
      content,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Comment not found for deletion' });
    }

    res.json({ success: true, message: 'Comment deleted', comment: deleted });

  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: 'Failed to delete comment', error });
  }
};
