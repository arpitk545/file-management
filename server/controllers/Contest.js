const Contest = require("../models/Contest");
const {uploadImageToCloudinary, deleteImageFromCloudinary} = require("../config/cloudinary");

exports.createContest = async (req, res) => {
  try {
    const {
      title,
      region,
      examType,
      specificClass,
      subject,
      chapter,
      prize,
      deadline,
      startTime,
      description,
      status,
      author,
      passcode,
    } = req.body;

    let { questions } = req.body;

    // Parse questions if sent as string
    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid JSON in questions" });
      }
    }

    // Ensure questions is an array
    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "Questions must be an array" });
    }

    // Upload thumbnail if available
    let thumbnailUrl = null;
    if (req.files?.thumbnail) {
      const thumbnailFile = req.files.thumbnail;
      thumbnailUrl = await uploadImageToCloudinary(thumbnailFile.tempFilePath, "contests/thumbnails", 800, 80);
      fs.unlinkSync(thumbnailFile.tempFilePath);
    }

    // Upload each question image if needed
    const formattedQuestions = await Promise.all(
      questions.map(async (q) => {
        let imageUrl = q.image;

        // If image is a file object (from multer or similar)
        if (q.image && typeof q.image !== "string" && q.image.tempFilePath) {
          imageUrl = await uploadImageToCloudinary(q.image.tempFilePath, "contests/questions", 800, 80);
          fs.unlinkSync(q.image.tempFilePath);
        }

        return {
          ...q,
          image: imageUrl
        };
      })
    );

    const contest = new Contest({
      title,
      region,
      description,
      status,
      startTime,
      examType,
      specificClass,
      subject,
      chapter,
      prize,
      deadline,
      thumbnail: thumbnailUrl,
      questions: formattedQuestions,
      author,
      passcode,
    });

    await contest.save();
    return res.status(201).json({ success: true, data: contest });
  } catch (err) {
    console.error("Create Contest Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all contests
exports.getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ createdAt: -1 }); 
    return res.status(200).json({ success: true, data: contests });
  } catch (err) {
    console.error("Get All Contests Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete a contest by title
exports.deleteContestByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    const deleted = await Contest.findOneAndDelete({ title });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    return res.status(200).json({ success: true, message: "Contest deleted successfully" });
  } catch (err) {
    console.error("Delete Contest Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a contest by ID
exports.getContestById = async (req, res) => {
  try {
    const contestId = req.params.id;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    return res.status(200).json({ success: true, data: contest });
  } catch (err) {
    console.error("Get Contest Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Change the status of a contest by ID
exports.changeContestStatusById = async (req, res) => {
  try {
    const { id } = req.params;         
    const { status } = req.body;    

    // Check for valid status
    const allowedStatuses = ["Approved", "Waiting for Approval", "Rejected Contest"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`
      });
    }

    // Find and update contest
    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      { status },
      { new: true } 
    );

    if (!updatedContest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedContest,
      message: "Contest status updated successfully"
    });
  } catch (err) {
    console.error("Change Contest Status Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Helper to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  if (uploadIndex === -1) return null;
  const publicIdParts = parts.slice(uploadIndex + 1);
  const publicIdFull = publicIdParts.join('/').split('.')[0];
  return publicIdFull;
};

exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      title,
      region,
      examType,
      specificClass,
      subject,
      chapter,
      prize,
      deadline,
      startTime,
      duration,
      description,
      status,
      questions,
    } = req.body;

    // Parse questions if sent as string
    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid JSON in questions" });
      }
    }

    // Validate questions is an array
    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "Questions must be an array" });
    }

    const existingContest = await Contest.findById(id);
    if (!existingContest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    // Handle thumbnail update if a new one is uploaded
    let thumbnailUrl = existingContest.thumbnail;
    if (req.files?.thumbnail) {
      if (thumbnailUrl) {
        const publicId = getPublicIdFromUrl(thumbnailUrl);
        if (publicId) {
          await deleteImageFromCloudinary(publicId);
        }
      }

      const thumbnailFile = req.files.thumbnail;
      thumbnailUrl = await uploadImageToCloudinary(thumbnailFile.tempFilePath, "contests/thumbnails", 800, 80);
      fs.unlinkSync(thumbnailFile.tempFilePath);
    }

    // Update questions, upload images for new files and delete old images if replaced
    const updatedQuestions = await Promise.all(questions.map(async (q, index) => {
      let newImageUrl = q.image;

      // If q.image is a new uploaded file (not string)
      if (q.image && typeof q.image !== 'string' && q.image.tempFilePath) {
        // Upload new image
        newImageUrl = await uploadImageToCloudinary(q.image.tempFilePath, "contests/questions", 800, 80);
        fs.unlinkSync(q.image.tempFilePath);

        // Delete old image from cloudinary if exists
        const oldImageUrl = existingContest.questions[index]?.image;
        if (oldImageUrl && typeof oldImageUrl === 'string') {
          const publicId = getPublicIdFromUrl(oldImageUrl);
          if (publicId) {
            await deleteImageFromCloudinary(publicId);
          }
        }
      }

      return {
        ...q,
        image: newImageUrl
      };
    }));

    // Update contest fields
    existingContest.title = title || existingContest.title;
    existingContest.region = region || existingContest.region;
    existingContest.examType = examType || existingContest.examType;
    existingContest.specificClass = specificClass || existingContest.specificClass;
    existingContest.subject = subject || existingContest.subject;
    existingContest.chapter = chapter || existingContest.chapter;
    existingContest.prize = prize || existingContest.prize;
    existingContest.deadline = deadline || existingContest.deadline;
    existingContest.startTime = startTime || existingContest.startTime;
    existingContest.duration = duration || existingContest.duration;
    existingContest.description = description || existingContest.description;
    existingContest.status = status || existingContest.status;
    existingContest.questions = updatedQuestions;
    existingContest.thumbnail = thumbnailUrl;

    await existingContest.save();

    return res.status(200).json({ success: true, data: existingContest });
  } catch (err) {
    console.error("Update Contest Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    // Delete all images from Cloudinary for this contest's questions
    for (const q of contest.questions) {
      if (q.image && typeof q.image === 'string') {
        const publicId = getPublicIdFromUrl(q.image);
        if (publicId) {
          await deleteImageFromCloudinary(publicId);
        }
      }
    }

    // Delete contest document from DB
    await Contest.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Contest deleted successfully" });
  } catch (err) {
    console.error("Delete Contest Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//create contest via AI 
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Question hash tracking
const HASH_FILE = path.join(__dirname, 'contest-hashes.json');
let existingHashes = new Set();

if (fs.existsSync(HASH_FILE)) {
  const saved = JSON.parse(fs.readFileSync(HASH_FILE, 'utf-8'));
  existingHashes = new Set(saved);
}

const saveHashesToFile = () => {
  fs.writeFileSync(HASH_FILE, JSON.stringify([...existingHashes]), 'utf-8');
};

// Generate prompt with 5 options (A-E)
const generateContestPrompt = ({ 
  language, 
  examType, 
  specificClass, 
  subject, 
  chapter, 
  difficulty 
}) => {
  const lang = Array.isArray(language) ? language[0] : language;
  const chap = Array.isArray(chapter) ? chapter[0] : chapter;

  const nonEnglishNote = lang.toLowerCase() !== "english"
    ? `Only return output in ${lang}. Do not use English.\n`
    : "";

  return `
Generate a unique contest question with five options (A-E) for:

Language: ${lang}
Exam Type: ${examType}
Class: ${specificClass}
Subject: ${subject}
Chapter: ${chap}
Difficulty: ${difficulty}

${nonEnglishNote}
Format exactly like this:
Question: <question text>
Options:
A: <option A> 
B: <option B>
C: <option C>
D: <option D>
E: <option E>
Answer: <correct option letter A-E>
Explanation: <brief explanation>
Tags: <comma-separated tags>
  `;
};

// Parse response with 5 options
const parseContestResponse = (responseText) => {
  const lines = responseText.split('\n').filter(Boolean);
  
  const result = {
    text: lines.find(line => line.startsWith("Question:"))?.replace("Question:", "").trim(),
    options: {},
    correctAnswer: '',
    explanation: '',
    tags: []
  };

  ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
    const optionLine = lines.find(l => l.startsWith(`${letter}:`));
    if (optionLine) result.options[letter] = optionLine.replace(`${letter}:`, "").trim();
  });

  result.correctAnswer = lines.find(line => line.startsWith("Answer:"))?.replace("Answer:", "").trim();
  result.explanation = lines.find(line => line.startsWith("Explanation:"))?.replace("Explanation:", "").trim();
  
  const tagsLine = lines.find(line => line.startsWith("Tags:"));
  if (tagsLine) result.tags = tagsLine.replace("Tags:", "").trim().split(',').map(tag => tag.trim());

  return result;
};

// Hash function
const hashQuestion = (questionText) => crypto.createHash('sha256').update(questionText).digest('hex');

// Generate contest questions
exports.createContestWithAI = async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "OpenRouter API key not configured" });
    }

    const { language, examType, specificClass, subject, chapter, difficulty, totalQuestions = 5 } = req.body;

    const questions = [];
    const localHashes = new Set();
    let attempts = 0;
    const maxAttempts = totalQuestions * 5;

    while (questions.length < totalQuestions && attempts < maxAttempts) {
      const prompt = generateContestPrompt({ language, examType, specificClass, subject, chapter, difficulty });

      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "meta-llama/Llama-70b-instruct:latest",
            messages: [{ role: "user", content: prompt }]
          },
          {
            headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` }
          }
        );

        const responseText = response.data?.choices?.[0]?.message?.content;

        if (!responseText) {
          attempts++;
          continue;
        }

        const parsed = parseContestResponse(responseText);

        if (!parsed.text || !parsed.correctAnswer) {
          attempts++;
          continue;
        }

        const hash = hashQuestion(parsed.text);
        if (existingHashes.has(hash) || localHashes.has(hash)) {
          attempts++;
          continue;
        }

        localHashes.add(hash);
        existingHashes.add(hash);

        questions.push({
          text: parsed.text,
          options: parsed.options,
          correctAnswer: parsed.correctAnswer,
          explanation: parsed.explanation,
          difficulty,
          tags: parsed.tags,
        });

        attempts++;
      } catch (err) {
        console.error("OpenRouter Error:", err.message);
        attempts++;
      }
    }

    saveHashesToFile();

    if (questions.length === 0) {
      return res.status(500).json({ error: "No unique questions could be generated." });
    }

    res.status(200).json({
      message: `Successfully generated ${questions.length} unique question(s).`,
      questions
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// Main controller function
exports.generateContestQuestions = async (req, res) => {
  try {
    const { 
      language = "English",
      examType,
      specificClass,
      subject,
      chapter,
      difficulty = "Average",
      totalQuestions = 5
    } = req.body;

    // Validate required fields
    if (!examType || !specificClass || !subject || !chapter) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['examType', 'specificClass', 'subject', 'chapter']
      });
    }

    const questions = [];
    const localHashes = new Set();
    let attempts = 0;
    const maxAttempts = totalQuestions * 3; // Prevent infinite loops

    while (questions.length < totalQuestions && attempts < maxAttempts) {
      attempts++;

      try {
        const prompt = generateContestPrompt({
          language,
          examType,
          specificClass,
          subject,
          chapter,
          difficulty
        });

        const result = await model.generateContent(prompt);
        const responseText = result?.response?.text();
        if (!responseText) continue;

        const parsed = parseContestResponse(responseText);
        
        // Validate response
        if (!parsed.text || !parsed.correctAnswer || Object.keys(parsed.options).length < 5) {
          continue;
        }

        // Check for duplicates
        const hash = hashQuestion(parsed.text);
       if (existingHashes.has(hash)) {
           continue;
        }


        // Add to results
        existingHashes.add(hash);
        localHashes.add(hash);

        questions.push({
          question: parsed.text,
          options: parsed.options,
          correctAnswer: parsed.correctAnswer,
          explanation: parsed.explanation,
          difficulty,
          tags: parsed.tags,
          metadata: {
            language,
            examType,
            specificClass,
            subject,
            chapter
          }
        });
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error.message);
        continue;
      }
    }

    // Save new hashes
    saveHashesToFile();

    if (questions.length === 0) {
      return res.status(500).json({
        error: 'Failed to generate questions',
        attemptsMade: attempts,
        suggestions: [
          'Try adjusting the difficulty level',
          'Provide more specific chapter details',
          'Try a different language'
        ]
      });
    }

    res.status(200).json({
      success: true,
      generated: questions.length,
      attempts: attempts,
      questions: questions,
      parameters: {
        language,
        examType,
        specificClass,
        subject,
        chapter,
        difficulty
      }
    });

  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};