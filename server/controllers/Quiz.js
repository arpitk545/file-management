const {QuizRegion,Quiz} = require("../models/Quiz");
const fs = require('fs/promises');
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Result = require("../models/Result");
const UserResult =require("../models/User/quizResult")
const mongoose = require('mongoose');
const { uploadImageToCloudinary,deleteImageFromCloudinary  } = require('../config/cloudinary');

// Create multiple regions
exports.createRegions = async (req, res) => {
  try {
    const regionsData = req.body;

    if (!Array.isArray(regionsData) || regionsData.length === 0) {
      return res.status(400).json({ error: "No regions provided." });
    }

    const createdRegions = await QuizRegion.insertMany(regionsData);

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
exports.getAllRegions = async (req, res) => {
  try {
    const regions = await QuizRegion.find();
    return res.status(200).json({ data: regions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return res.status(500).json({ error: "Failed to fetch regions." });
  }
};

// DELETE a region by name
exports.deleteRegionByName = async (req, res) => {
  try {
    const { name } = req.params; 

    if (!name) {
      return res.status(400).json({ error: "Region name is required." });
    }

    const deletedRegion = await QuizRegion.findOneAndDelete({ name });

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
exports.updateRegionByName = async (req, res) => {
  try {
      const name = decodeURIComponent(req.params.name);
    const { updatedData } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name are required." });
    }
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "No data provided for update." });
    }

    const updatedRegion = await QuizRegion.findOneAndUpdate(
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

exports.createQuizQuestion = async (req, res) => {
  try {
    const { category, questions } = req.body;

    if (!category || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Category and questions array are required." });
    }

    if (req.files && req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail;
      const thumbnailUrl = await uploadImageToCloudinary(thumbnailFile.tempFilePath, 'quiz/thumbnails');
      category.thumbnailimage = thumbnailUrl;
      fs.unlinkSync(thumbnailFile.tempFilePath);
    }


    if (req.files && req.files.questionImages) {
      const questionImages = Array.isArray(req.files.questionImages)
        ? req.files.questionImages
        : [req.files.questionImages];
      for (let i = 0; i < questionImages.length && i < questions.length; i++) {
        const file = questionImages[i];
        const imageUrl = await uploadImageToCloudinary(file.tempFilePath, 'quiz/questions');
        questions[i].image = imageUrl;
        fs.unlinkSync(file.tempFilePath);
      }
    }

    const isQuizBank = category.quizType === "quizbank";

    const query = isQuizBank
      ? {
          "category.region": category.region,
          "category.examType": category.examType,
          "category.specificClass": category.specificClass,
          "category.subject": category.subject,
          "category.chapter": category.chapter,
          "category.quizType": "quizbank",
        }
      : { category };

    const existingQuiz = await Quiz.findOne(query);

    if (existingQuiz) {
      existingQuiz.questions.push(...questions);
      await existingQuiz.save();

      return res.status(200).json({
        message: `${questions.length} questions added to existing quiz.`,
        data: existingQuiz,
      });
    } else {
      const newQuiz = new Quiz({ category, questions });
      await newQuiz.save();

      return res.status(201).json({
        message: `New quiz created with ${questions.length} questions.`,
        data: newQuiz,
      });
    }
  } catch (error) {
    console.error("Error creating or updating quiz:", error);
    res.status(500).json({ error: "Failed to create or update quiz." });
  }
};

//this all three update get and the delete for the quiz bank where the admin or manager will do this 
// 1. Get question by question ID
exports.getQuestionById = async (req, res) => {
  const { questionId } = req.params

  try {
    const quiz = await Quiz.findOne({ "questions._id": questionId })

    if (!quiz) return res.status(404).json({ error: "Question not found" })

    const question = quiz.questions.id(questionId);

    const questionWithCategory = {
      ...question.toObject(),
      category: quiz.category
    };
    res.status(200).json({ question:questionWithCategory })
    
  } catch (err) {
    console.error("Error fetching question:", err)
    res.status(500).json({ error: "Server error" })
  }
}

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


// 2. Update question by question ID
exports.updateQuestionById = async (req, res) => {
  const { questionId } = req.params;
  const updatedData = req.body;

  try {
    const quiz = await Quiz.findOne({ "questions._id": questionId });

    if (!quiz) return res.status(404).json({ error: "Question not found" });

    const question = quiz.questions.id(questionId);
    if (!question) return res.status(404).json({ error: "Question not found in quiz" });

    // Handle new image upload and delete old one if present
    if (req.files?.image) {
      const file = req.files.image;

      // Extract publicId from existing URL if exists
      if (question.image) {
        const publicId = extractPublicIdFromUrl(question.image);
        if (publicId) await deleteImageFromCloudinary(publicId);
      }

      const newImageUrl = await uploadImageToCloudinary(file.tempFilePath, "quiz/questions");
      updatedData.image = newImageUrl;
      fs.unlinkSync(file.tempFilePath);
    }

    // Apply updated fields
    Object.assign(question, updatedData);
    await quiz.save();

    res.status(200).json({ message: "Question updated", question });
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 3. Delete question by question text
exports.deleteQuestionByText = async (req, res) => {
  const { text } = req.params

  try {
    const quiz = await Quiz.findOne({ "questions.text": text })

    if (!quiz) return res.status(404).json({ error: "Question not found" })

    const originalLength = quiz.questions.length

    quiz.questions = quiz.questions.filter(q => q.text !== text)

    if (quiz.questions.length === originalLength) {
      return res.status(404).json({ error: "No matching question to delete" })
    }

    await quiz.save()
    res.status(200).json({ message: "Question deleted successfully" })
  } catch (err) {
    console.error("Error deleting question:", err)
    res.status(500).json({ error: "Server error" })
  }
}

//get all quiz questions
exports.getAllQuizzesWithCategoryAndQuestions = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}); 

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: "No quizzes found." });
    }

    return res.status(200).json({
      message: "All quizzes fetched successfully.",
      data: quizzes,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({ error: "Failed to fetch quizzes." });
  }
};

// Get all quiz questions filtered by category.
exports.getAllQuizQuestions = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ error: "Category is required in request body." });
    }

    const quiz = await Quiz.findOne({
      "category.region": category.region,
      "category.examType": category.examType,
      "category.specificClass": category.specificClass,
      "category.subject": category.subject,
      "category.chapter": category.chapter
    });

    if (!quiz) {
      return res.status(404).json({ error: "No quiz found for this category." });
    }

    res.status(200).json({ data: quiz.questions });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ error: "Failed to fetch quiz questions." });
  }
}

//Delete the quiz using the Title 
exports.deleteQuizByTitle = async (req, res) => {
  try {
    const { quizTitle } = req.params;

    if (!quizTitle) {
      return res.status(400).json({ error: "quizTitle is required in the URL parameter." });
    }

    const deletedQuiz = await Quiz.findOneAndDelete({ "category.quizTitle": quizTitle });

    if (!deletedQuiz) {
      return res.status(404).json({ error: "Quiz not found with the given title." });
    }

    return res.status(200).json({
      message: `Quiz with title "${quizTitle}" has been deleted.`,
      data: deletedQuiz,
    });

  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Failed to delete quiz." });
  }
};

const extractQuestions = (text) => {
  const questionBlocks = text.split(/\n\s*\n/);
  const questions = [];

  questionBlocks.forEach(block => {
    const trimmed = block.trim();

    const questionRegex = /^([\s\S]*?\?)\s*A\.\s*(.*?)\s*B\.\s*(.*?)\s*C\.\s*(.*?)\s*D\.\s*(.*?)\s*Answer:\s*([ABCD])/m;
    const questionMatch = trimmed.match(questionRegex);

    if (!questionMatch) return;

    const [, questionText, A, B, C, D, correctAnswer] = questionMatch;

    const metaStart = questionMatch.index + questionMatch[0].length;
    const metaText = trimmed.slice(metaStart).trim();
    const metaLines = metaText.split('\n').filter(l => l.trim() !== '');

    const metaObj = {
      tags: [],
      difficulty: "Easy" 
    };

    metaLines.forEach(line => {
      const [key, ...rest] = line.split(':');
      if (!key || rest.length === 0) return;

      const value = rest.join(':').trim();

      switch (key.trim().toLowerCase()) {
        case 'tags':
          metaObj.tags = value.split(',').map(t => t.trim());
          break;
        case 'difficulty':
          if (["Easy", "Average", "Hard"].includes(value)) {
            metaObj.difficulty = value;
          }
          break;
        default:
          break;
      }
    });

    questions.push({
      text: questionText.trim(),
      options: {
        A: A.trim(),
        B: B.trim(),
        C: C.trim(),
        D: D.trim(),
      },
      correctAnswer,
      difficulty: metaObj.difficulty,
      tags: metaObj.tags,
    });
  });

  return questions;
};

exports.extractQuestionsFromFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;

    let textContent = "";

    if (file.mimetype === "application/pdf") {
      // Read the temp file from disk
      const fileBuffer = await fs.readFile(file.tempFilePath);
      const pdfData = await pdfParse(fileBuffer);
      textContent = pdfData.text;
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // For docx, same thing: read from tempFilePath
      const fileBuffer = await fs.readFile(file.tempFilePath);
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      textContent = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const questions = extractQuestions(textContent);

    if (!questions.length) {
      return res.status(400).json({ error: "No valid questions found" });
    }

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("Parse error:", err);
    return res.status(500).json({ error: "Failed to parse file" });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(200).json({ data: quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
};

// Update quiz by ID
exports.updateQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, questions } = req.body;

    if (category === undefined && questions === undefined) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    // Find quiz by ID
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Update fields if provided
    if (category) quiz.category = category;
    if (questions && Array.isArray(questions)) {
      quiz.questions = questions;
    }

    await quiz.save();

    res.status(200).json({ message: "Quiz updated", data: quiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

// Delete quiz by ID
exports.deleteQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Quiz.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};

//change the status of quiz question
exports.updateApprovalStatusById = async (req, res) => {
  try {
    const { id } = req.params;  // quiz/question id
    const { approvalStatus } = req.body;

    // Validate approvalStatus
    const validStatuses = ['Waiting for Approval', 'Approved', 'Rejected'];
    if (!approvalStatus || !validStatuses.includes(approvalStatus)) {
      return res.status(400).json({ error: "Invalid or missing approvalStatus" });
    }

    // Find quiz by id
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    // Update approval status
    quiz.category.approvalStatus = approvalStatus;

    await quiz.save();

    res.status(200).json({ message: `Approval status updated to '${approvalStatus}'`, data: quiz });
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({ error: "Failed to update approval status" });
  }
};

//this is controller where the user will submit the ai generated quiz questions

exports.submitGeneratedQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { metadata, questions, timeTaken } = req.body;

    if (!metadata || !Array.isArray(questions) || typeof timeTaken !== "number") {
      return res.status(400).json({ message: "Invalid submission data" });
    }

    let correctCount = 0;
    let incorrectAnswers = [];

    questions.forEach((q) => {
      if (q.isCorrect) {
        correctCount++;
      } else {
        incorrectAnswers.push({
          questionText: q.questionText,
          userAnswer: q.userAnswer,
          correctAnswer: q.correctAnswer,
        });
      }
    });

    const result = await Result.create({
      userId,
      metadata,
      totalQuestions: questions.length,
      correctCount,
      timeTaken,
      questions,
      incorrectAnswers,
    });

    res.status(200).json({
      message: "Result saved successfully",
      result,
    });
  } catch (err) {
    console.error("Error saving quiz result:", err);
    res.status(500).json({ message: "Failed to save result" });
  }
};

//get result 
exports.getGeneratedQuizResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resultId } = req.query;

    let result;

    // If resultId is passed, fetch specific result
    if (resultId) {
      result = await Result.findOne({ _id: resultId, userId });

      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

    } else {
      // Otherwise, fetch all results for the user
      result = await Result.find({ userId }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      message: "Result(s) fetched successfully",
      result,
    });

  } catch (err) {
    console.error("Error fetching quiz result:", err);
    res.status(500).json({ message: "Failed to fetch result" });
  }
};

//this is the controller where user will attempt the quiz of the instructor
exports.submitquiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const { answers, timeTaken } = req.body
    const userId = req.user.id 

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Invalid submission data" })
    }

    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" })
    }

    let score = 0
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = answers.find(a => a.questionIndex === index)
      const correctOption = question.correctAnswer

      const isCorrect = userAnswer?.selectedOption === correctOption
      if (isCorrect) score++

      return {
        questionId:question.id,
        question:question.text,
        selected: userAnswer?.selectedOption || null,
        correct: correctOption,
        isCorrect,
      }
    })

    const correctAnswers = score
    const incorrectAnswers = quiz.questions.length - score

    const result = await UserResult.create({
      user: userId,
      quiz: quizId,
      score,
      total: quiz.questions.length,
      timeTaken,
      correctAnswers,
      incorrectAnswers,
      details: detailedResults
    })

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        resultId: result._id,
        score,
        correctAnswers,
        incorrectAnswers,
        total: quiz.questions.length
      }
    })
  } catch (err) {
    console.error("Error in submitContest:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

//submit result
exports.getQuizResult = async (req, res) => {
  try {
    const { resultId } = req.params
    const userId = req.user.id
    if (!resultId || !mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing result ID" });
    }

    const result = await UserResult.findById(resultId).populate({
      path: 'quiz',
      select: 'category quizTitle',
    })

    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" })
    }
    if (result.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to result" })
    }

    res.status(200).json({
      success: true,
      data: {
        resultId: result._id,
        quizTitle: result.quiz?.category?.quizTitle || "Quiz",
        score: result.score,
        total: result.total,
        timeTaken: result.timeTaken,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        details: result.details,
       quiz: result.quiz?._id,
      }
    })
  } catch (err) {
    console.error("Error in getQuizResult:", err)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

//submit the report for the question

exports.submitQuestionReport = async (req, res) => {
  try {
    const { quizId, questionId, description, submittedBy } = req.body;
    if (!quizId) {
      return res.status(400).json({ success: false, message: "Missing quizId." });
    }
    if (!questionId) {
      return res.status(400).json({ success: false, message: "Missing questionId." });
    }
    if (!description) {
      return res.status(400).json({ success: false, message: "Missing report description." });
    }
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    const question = quiz.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    question.reports = question.reports || [];
    question.reports.push({
      description,
      submittedAt: new Date(),
      submittedBy,
    });

    await quiz.save();

    res.status(200).json({ success: true, message: "Report submitted successfully." });

  } catch (err) {
    console.error("Error submitting report:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
