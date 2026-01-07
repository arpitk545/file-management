const {questionTypeRegion,QandA,QuestionType} = require("../models/questionType");
const fs = require('fs');
const { uploadImageToCloudinary,deleteImageFromCloudinary  } = require('../config/cloudinary');
const mongoose =require('mongoose');

// Helper to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url) {
  try {
    const parts = url.split("/");
    const fileWithExtension = parts[parts.length - 1];
    const publicId = fileWithExtension.substring(0, fileWithExtension.lastIndexOf("."));
    return parts.slice(-2, -1) + "/" + publicId;
  } catch (err) {
    console.error("Failed to extract public ID:", err);
    return null;
  }
}

// Create multiple regions
exports.createquestionTypeRegions = async (req, res) => {
  try {
    const regionsData = req.body;

    if (!Array.isArray(regionsData) || regionsData.length === 0) {
      return res.status(400).json({ error: "No regions provided." });
    }

    const createdRegions = await questionTypeRegion.insertMany(regionsData);

    return res.status(201).json({
      message: "Regions created successfully",
      data: createdRegions,
    });
  } catch (error) {
    console.error("Error creating regions:", error);
    return res.status(500).json({ error: "Failed to create regions." });
  }
};

// Get all regions
exports.getAllquestionTypeRegions = async (req, res) => {
  try {
    const regions = await questionTypeRegion.find();
    return res.status(200).json({ data: regions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return res.status(500).json({ error: "Failed to fetch regions." });
  }
};

// DELETE a region by name
exports.deletequestionTypeRegionByName = async (req, res) => {
  try {
    const { name } = req.params; 

    if (!name) {
      return res.status(400).json({ error: "Region name is required." });
    }

    const deletedRegion = await questionTypeRegion.findOneAndDelete({ name });

    if (!deletedRegion) {
      return res.status(404).json({ error: "No region found with that name." });
    }

    res.status(200).json({ message: `Region deleted successfully.` });
  } catch (error) {
    console.error("Error deleting region:", error);
    res.status(500).json({ error: "Server error during deletion." });
  }
};

// UPDATE a region by name
exports.updatequestionTypeRegionByName = async (req, res) => {
  try {
      const name = decodeURIComponent(req.params.name);
    const { updatedData } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name are required." });
    }
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "No data provided for update." });
    }

    const updatedRegion = await questionTypeRegion.findOneAndUpdate(
      { name },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedRegion) {
      return res.status(404).json({ error: "No region found with that name." });
    }

    res.status(200).json({ message: `Region updated successfully.`, data: updatedRegion });
  } catch (error) {
    console.error("Error updating region:", error);
    res.status(500).json({ error: "Server error during update." });
  }
};
//create question type
exports.createQuestionType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question type name is required"
      });
    }

    const existing = await QuestionType.findOne({
      name: name.trim()
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Question type already exists"
      });
    }

    const questionType = await QuestionType.create({
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      message: "Question type created successfully",
      data: questionType
    });
  } catch (error) {
    console.error("Create QuestionType error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create question type",
      error: error.message
    });
  }
};

exports.getAllQuestionTypes = async (req, res) => {
  try {
    const questionTypes = await QuestionType.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questionTypes.length,
      data: questionTypes
    });
  } catch (error) {
    console.error("Get QuestionTypes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question types",
      error: error.message
    });
  }
};


exports.updateQuestionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question type name is required"
      });
    }

    const duplicate = await QuestionType.findOne({
      name: name.trim(),
      _id: { $ne: id }
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Question type with this name already exists"
      });
    }

    const updated = await QuestionType.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Question type not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Question type updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Update QuestionType error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question type",
      error: error.message
    });
  }
};
  
exports.deleteQuestionType = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await QuestionType.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Question type not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Question type deleted successfully"
    });
  } catch (error) {
    console.error("Delete QuestionType error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question type",
      error: error.message
    });
  }
};

// Create Q&A without initial question/answer
exports.createQandA = async (req, res) => {
  try {
   let { category, chapterName, tags, status } = req.body;

   if (typeof category === "string") {
    category = JSON.parse(category);
   }
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let thumbnailUrl;

    // Upload thumbnail if provided
    if (req.files?.thumbnail) {
      const thumbnailFile = req.files.thumbnail;
      thumbnailUrl = await uploadImageToCloudinary(
        thumbnailFile.tempFilePath,
        "quiz/thumbnails"
      );
      fs.unlinkSync(thumbnailFile.tempFilePath);
    }

    // Initialize new Q&A
    const newQandA = new QandA({
      user: userId,
      category: {
        region: category.region,
        examType: category.examType,
        specificClass: category.specificClass,
        subject: category.subject,
      },
      chapterName,
      tags,
      status: status || "active",
      roles: [userRole],
      questions: [],
      thumbnail: thumbnailUrl || null,
    });

    const savedQandA = await newQandA.save();

    res.status(201).json({
      success: true,
      message: "Q&A created successfully",
      data: savedQandA,
    });
  } catch (error) {
    console.error("Error creating Q&A:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Q&A",
      error: error.message,
    });
  }
};

//get all Q and A 
exports.getAllQandA = async (req, res) => {
  try {
    const allQandA = await QandA.find().sort({ createdAt: -1 })
    .populate({
        path: 'questions.questionReports.reportedBy',
        select: 'fullName', 
        model: 'Profile'
      })
      .populate({
        path: 'questions.answerReports.reportedBy',
        select: 'fullName',
        model: 'Profile'
      }); 
    res.status(200).json({
      success: true,
      count: allQandA.length,
      data: allQandA
    });
  } catch (error) {
    console.error("Error fetching Q&A:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all Q&A",
      error: error.message
    });
  }
};
//get Q and A by user id

exports.getMyCreatedQandA = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const qandAList = await QandA.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: qandAList.length,
      data: qandAList,
    });
  } catch (error) {
    console.error("Error fetching user's Q&A:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user's Q&A",
      error: error.message,
    });
  }
};

//get by id 

exports.getQandAById = async (req, res) => {
  try {
    const { id } = req.params;
    const qandA = await QandA.findById(id);

    if (!qandA) {
      return res.status(404).json({ success: false, message: 'Q&A not found' });
    }

    res.status(200).json({
      success: true,
      data: qandA
    });
  } catch (error) {
    console.error("Error fetching Q&A by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Q&A",
      error: error.message
    });
  }
};

exports.addQuestionToQanda = async (req, res) => {
  try {
    const { id } = req.params;
    let { questions } = req.body;

    // Parse questions if sent as string
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Q&A ID' 
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Questions array is required' 
      });
    }

    const qanda = await QandA.findById(id);
    if (!qanda) {
      return res.status(404).json({ 
        success: false, 
        message: 'Q&A not found' 
      });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.question || !q.answer || !q.question.trim() || !q.answer.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: `Question, answer, and question type are required for item ${i + 1}` 
        });
      }

      // Handle question image if provided
      let questionImageUrl = null;
      if (req.files?.questionImages) {
        const filesArray = Array.isArray(req.files.questionImages)
          ? req.files.questionImages
          : [req.files.questionImages];

        if (filesArray[i]) {
          questionImageUrl = await uploadImageToCloudinary(
            filesArray[i].tempFilePath,
            'quiz/questions'
          );
          fs.unlinkSync(filesArray[i].tempFilePath);
        }
      }
      // Handle answer image if provided
      let answerImageUrl = null;
      if (req.files?.answerImages) {
        const filesArray = Array.isArray(req.files.answerImages)
          ? req.files.answerImages
          : [req.files.answerImages];
      
        if (filesArray[i]) {
          answerImageUrl = await uploadImageToCloudinary(
            filesArray[i].tempFilePath,
            'quiz/answers'
          );
          fs.unlinkSync(filesArray[i].tempFilePath);
        }
      }

      // Add question with optional image
      qanda.questions.push({
        question: q.question.trim(),
        answer: q.answer.trim(),
        questiontype: q.questiontype?.trim() || 'General',
        questionImage: questionImageUrl,
        answerImage: answerImageUrl,
      });
    }

    qanda.updatedAt = Date.now();
    const updatedQanda = await qanda.save();

    res.status(200).json({
      success: true,
      message: 'Questions added successfully',
      data: updatedQanda
    });

  } catch (error) {
    console.error('Error adding questions to Q&A:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add questions', 
      error: error.message 
    });
  }
};

//update QandA by id
exports.updateQandA = async (req, res) => {
  try {
    const { id } = req.params;
    let { category, chapterName, status, tags, questions } = req.body;

    // Parse questions if sent as string (multipart/form-data)
    if (typeof questions === "string") {
      questions = JSON.parse(questions);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Q&A ID",
      });
    }

    const qanda = await QandA.findById(id);
    if (!qanda) {
      return res.status(404).json({
        success: false,
        message: "Q&A not found",
      });
    }

    /* ---------------- CATEGORY ---------------- */
    if (category) {
      if (category.region) qanda.category.region = category.region;
      if (category.examType) qanda.category.examType = category.examType;
      if (category.specificClass) qanda.category.specificClass = category.specificClass;
      if (category.subject) qanda.category.subject = category.subject;
    }

    if (chapterName) qanda.chapterName = chapterName;
    if (status) qanda.status = status;
    if (tags) qanda.tags = tags;

    /* ---------------- QUESTIONS ---------------- */
    if (Array.isArray(questions)) {
      const questionImageFiles = req.files?.questionImages
        ? Array.isArray(req.files.questionImages)
          ? req.files.questionImages
          : [req.files.questionImages]
        : [];

      const answerImageFiles = req.files?.answerImages
        ? Array.isArray(req.files.answerImages)
          ? req.files.answerImages
          : [req.files.answerImages]
        : [];

      for (let i = 0; i < questions.length; i++) {
        const incomingQ = questions[i];
        const existingQ = qanda.questions[i];

        let questionImageUrl = existingQ?.questionImage || null;
        let answerImageUrl = existingQ?.answerImage || null;

        /* ---- QUESTION IMAGE ---- */
        if (questionImageFiles[i]) {
          if (questionImageUrl) {
            const oldId = extractPublicIdFromUrl(questionImageUrl);
            if (oldId) await deleteImageFromCloudinary(oldId);
          }

          questionImageUrl = await uploadImageToCloudinary(
            questionImageFiles[i].tempFilePath,
            "quiz/questions"
          );
          fs.unlinkSync(questionImageFiles[i].tempFilePath);
        }

        /* ---- ANSWER IMAGE ---- */
        if (answerImageFiles[i]) {
          if (answerImageUrl) {
            const oldId = extractPublicIdFromUrl(answerImageUrl);
            if (oldId) await deleteImageFromCloudinary(oldId);
          }

          answerImageUrl = await uploadImageToCloudinary(
            answerImageFiles[i].tempFilePath,
            "quiz/answers"
          );
          fs.unlinkSync(answerImageFiles[i].tempFilePath);
        }

        /* ---- UPDATE QUESTION ---- */
        if (existingQ) {
          existingQ.question = incomingQ.question?.trim();
          existingQ.answer = incomingQ.answer?.trim();
          existingQ.questiontype = incomingQ.questiontype || existingQ.questiontype;
          existingQ.questionImage = questionImageUrl;
          existingQ.answerImage = answerImageUrl;
        }
      }
    }

    /* ---------------- THUMBNAIL ---------------- */
    if (req.files?.thumbnail) {
      const file = req.files.thumbnail;

      if (qanda.thumbnail) {
        const publicId = extractPublicIdFromUrl(qanda.thumbnail);
        if (publicId) await deleteImageFromCloudinary(publicId);
      }

      const thumbnailUrl = await uploadImageToCloudinary(
        file.tempFilePath,
        "quiz/thumbnails"
      );

      qanda.thumbnail = thumbnailUrl;
      fs.unlinkSync(file.tempFilePath);
    }

    qanda.updatedAt = Date.now();
    await qanda.save();

    res.status(200).json({
      success: true,
      message: "Q&A updated successfully",
      data: qanda,
    });
  } catch (error) {
    console.error("Error updating Q&A:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update Q&A",
      error: error.message,
    });
  }
};

//delete q and a 
exports.deleteQandA = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Q&A ID"
      });
    }

    const qanda = await QandA.findById(id);

    if (!qanda) {
      return res.status(404).json({
        success: false,
        message: "Q&A not found"
      });
    }

    // Ownership check
    const isCreator = qanda.user.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this Q&A"
      });
    }

    // Delete thumbnail from Cloudinary if exists
    if (qanda.thumbnail) {
      const publicId = extractPublicIdFromUrl(qanda.thumbnail);
      if (publicId) {
        await deleteImageFromCloudinary(publicId);
      }
    }

    // Delete question images from Cloudinary if exists
    if (Array.isArray(qanda.questions)) {
      for (const q of qanda.questions) {
        if (q.image) {
          const publicId = extractPublicIdFromUrl(q.image);
          if (publicId) {
            await deleteImageFromCloudinary(publicId);
          }
        }
      }
    }

    // Delete the Q&A document
    await QandA.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Q&A deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting Q&A:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Q&A",
      error: error.message
    });
  }
};

//report question or answer 

exports.reportQuestion = async (req, res) => {
  try {
    const { qandaId, questionId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: "Reason and description are required"
      });
    }

    const qanda = await QandA.findById(qandaId);
    if (!qanda) {
      return res.status(404).json({ success: false, message: "Q&A not found" });
    }

    const question = qanda.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // Create new report
    const newReport = {
      reason,
      description,
      reportedBy: userId,
      reportstatus: 'Pending'
    };

    // Add report to questionReports array
    question.questionReports.push(newReport);
    
    // IMPORTANT: Update the questionReportStatus to "reported"
    question.questionReportStatus = 'reported';

    // Save changes
    qanda.markModified('questions');
    await qanda.save();

    res.status(200).json({
      success: true,
      message: "Question reported successfully",
      data: question
    });

  } catch (error) {
    console.error("Error reporting question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report question",
      error: error.message
    });
  }
};

//  REPORT AN ANSWER

exports.reportAnswer = async (req, res) => {
  try {
    const { qandaId, questionId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: "Reason and description are required"
      });
    }

    const qanda = await QandA.findById(qandaId);
    if (!qanda) {
      return res.status(404).json({ success: false, message: "Q&A not found" });
    }

    const question = qanda.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // Create new report
    const newReport = {
      reason,
      description,
      reportedBy: userId,
      reportstatus: 'Pending'
    };

    // Add report to answerReports array
    question.answerReports.push(newReport);
    
    // IMPORTANT: Update the answerReportStatus to "reported"
    question.answerReportStatus = 'reported';

    // Save changes
    qanda.markModified('questions');
    await qanda.save();

    res.status(200).json({
      success: true,
      message: "Answer reported successfully",
      data: question
    });

  } catch (error) {
    console.error("Error reporting answer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report answer",
      error: error.message
    });
  }
};


exports.updateReportStatus = async (req, res) => {
  try {
    const { qandaId, questionId } = req.params;
    const { type, reportstatus, reportshow } = req.body;

    if (!['question', 'answer'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be 'question' or 'answer'"
      });
    }

    const qanda = await QandA.findById(qandaId);
    if (!qanda) {
      return res.status(404).json({ success: false, message: "Q&A not found" });
    }

    const question = qanda.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    //UPDATE QUESTION ONLY
    if (type === 'question') {
      if (reportstatus) {
        question.questionReportStatus = reportstatus;

        if (reportstatus === 'resolved') {
          question.questionReports.forEach(r => {
            r.reportstatus = 'Resolved';
          });
        }
      }

      if (reportshow) {
        question.questionReportShow = reportshow;
      }
    }

    //UPDATE ANSWER ONLY
    if (type === 'answer') {
      if (reportstatus) {
        question.answerReportStatus = reportstatus;

        if (reportstatus === 'resolved') {
          question.answerReports.forEach(r => {
            r.reportstatus = 'Resolved';
          });
        }
      }

      if (reportshow) {
        question.answerReportShow = reportshow;
      }
    }
    qanda.markModified('questions');
    await qanda.save();

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: question
    });

  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update report status",
      error: error.message
    });
  }
};
