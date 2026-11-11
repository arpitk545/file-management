const Contest = require("../models/Contest");
const {uploadImageToCloudinary, deleteImageFromCloudinary} = require("../config/cloudinary");
const fs = require("fs");

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
      duration,
      description,
      status,
      author,
      passcode,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Contest title is required." });
    }

    // Check duplicate title upfront
    const existing = await Contest.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A contest with this title already exists. Please choose a different title.",
      });
    }

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
      if (thumbnailFile.tempFilePath && fs.existsSync(thumbnailFile.tempFilePath)) {
        try {
          thumbnailUrl = await uploadImageToCloudinary(thumbnailFile.tempFilePath, "contests/thumbnails", 800, 80);
          if (fs.existsSync(thumbnailFile.tempFilePath)) {
            fs.unlinkSync(thumbnailFile.tempFilePath);
          }
        } catch (thumbErr) {
          console.error("Contest thumbnail upload warning:", thumbErr);
        }
      }
    }

    // Format & normalize questions so schema validations always pass
    const formattedQuestions = await Promise.all(
      questions.map(async (q) => {
        let imageUrl = q.image;

        // If image is a file object (from multer or similar)
        if (q.image && typeof q.image !== "string" && q.image.tempFilePath) {
          if (fs.existsSync(q.image.tempFilePath)) {
            try {
              imageUrl = await uploadImageToCloudinary(q.image.tempFilePath, "contests/questions", 800, 80);
              if (fs.existsSync(q.image.tempFilePath)) {
                fs.unlinkSync(q.image.tempFilePath);
              }
            } catch (imgErr) {
              console.error("Contest question image upload warning:", imgErr);
            }
          }
        }

        // Normalize options: can be array of strings or object { A: ..., B: ... }
        let optionsArray = [];
        if (Array.isArray(q.options)) {
          optionsArray = q.options.map((opt) => (opt !== null && opt !== undefined ? String(opt) : ""));
        } else if (q.options && typeof q.options === "object") {
          optionsArray = [
            String(q.options.A || ""),
            String(q.options.B || ""),
            String(q.options.C || ""),
            String(q.options.D || ""),
          ];
          if (q.options.E) optionsArray.push(String(q.options.E));
        }

        // Schema requires 4 to 5 options
        while (optionsArray.length < 4) {
          optionsArray.push(`Option ${String.fromCharCode(65 + optionsArray.length)}`);
        }
        if (optionsArray.length > 5) {
          optionsArray = optionsArray.slice(0, 5);
        }

        // Normalize correct answer
        let ans = (q.correctAnswer || "A").trim().toUpperCase();
        if (!["A", "B", "C", "D", "E"].includes(ans)) {
          ans = "A";
        }

        return {
          topic: q.topic || chapter || subject || "General",
          questionType: q.questionType || q.difficulty || "Average",
          image: typeof imageUrl === "string" ? imageUrl : "",
          question: q.question || q.text || "Question prompt",
          options: optionsArray,
          correctAnswer: ans,
        };
      })
    );

    // Parse dates and duration safely
    let cleanStartTime = undefined;
    if (startTime && String(startTime).trim() !== "") {
      const parsed = new Date(startTime);
      if (!isNaN(parsed.getTime())) cleanStartTime = parsed;
    }

    let cleanDeadline = undefined;
    if (deadline && String(deadline).trim() !== "") {
      const parsed = new Date(deadline);
      if (!isNaN(parsed.getTime())) cleanDeadline = parsed;
    }

    let cleanDuration = undefined;
    if (duration !== undefined && duration !== "" && !isNaN(Number(duration))) {
      cleanDuration = Number(duration);
    }

    const cleanDescription = description && description.trim()
      ? description.trim()
      : `${title.trim()} Contest guidelines and overview.`;

    const contest = new Contest({
      title: title.trim(),
      region: region || "",
      description: cleanDescription,
      status: status || "Approved",
      startTime: cleanStartTime,
      deadline: cleanDeadline,
      duration: cleanDuration,
      examType: examType || "",
      specificClass: specificClass || "",
      subject: subject || "",
      chapter: chapter || "",
      prize: prize || "",
      thumbnail: thumbnailUrl || "",
      questions: formattedQuestions,
      author: author || req.user?.name || "Organizer",
      passcode: passcode || "",
    });

    await contest.save();
    return res.status(201).json({ success: true, data: contest });
  } catch (err) {
    console.error("Create Contest Error:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A contest with this title already exists. Please choose a different title.",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message || "Server error" });
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
        if (fs.existsSync(q.image.tempFilePath)) {
          try {
            newImageUrl = await uploadImageToCloudinary(q.image.tempFilePath, "contests/questions", 800, 80);
            if (fs.existsSync(q.image.tempFilePath)) {
              fs.unlinkSync(q.image.tempFilePath);
            }
          } catch (imgErr) {
            console.error("Update question image error:", imgErr);
          }
        }

        // Delete old image from cloudinary if exists
        const oldImageUrl = existingContest.questions[index]?.image;
        if (oldImageUrl && typeof oldImageUrl === 'string') {
          const publicId = getPublicIdFromUrl(oldImageUrl);
          if (publicId) {
            await deleteImageFromCloudinary(publicId);
          }
        }
      }

      // Normalize options
      let optionsArray = [];
      if (Array.isArray(q.options)) {
        optionsArray = q.options.map((opt) => (opt !== null && opt !== undefined ? String(opt) : ""));
      } else if (q.options && typeof q.options === "object") {
        optionsArray = [
          String(q.options.A || ""),
          String(q.options.B || ""),
          String(q.options.C || ""),
          String(q.options.D || ""),
        ];
        if (q.options.E) optionsArray.push(String(q.options.E));
      }

      while (optionsArray.length < 4) {
        optionsArray.push(`Option ${String.fromCharCode(65 + optionsArray.length)}`);
      }
      if (optionsArray.length > 5) {
        optionsArray = optionsArray.slice(0, 5);
      }

      let ans = (q.correctAnswer || "A").trim().toUpperCase();
      if (!["A", "B", "C", "D", "E"].includes(ans)) {
        ans = "A";
      }

      return {
        topic: q.topic || existingContest.chapter || "General",
        questionType: q.questionType || q.difficulty || "Average",
        image: typeof newImageUrl === "string" ? newImageUrl : "",
        question: q.question || q.text || "Question prompt",
        options: optionsArray,
        correctAnswer: ans,
      };
    }));

    // Update contest fields
    if (title && title.trim()) existingContest.title = title.trim();
    if (region !== undefined) existingContest.region = region;
    if (examType !== undefined) existingContest.examType = examType;
    if (specificClass !== undefined) existingContest.specificClass = specificClass;
    if (subject !== undefined) existingContest.subject = subject;
    if (chapter !== undefined) existingContest.chapter = chapter;
    if (prize !== undefined) existingContest.prize = prize;

    if (deadline && String(deadline).trim() !== "") {
      const parsed = new Date(deadline);
      if (!isNaN(parsed.getTime())) existingContest.deadline = parsed;
    }
    if (startTime && String(startTime).trim() !== "") {
      const parsed = new Date(startTime);
      if (!isNaN(parsed.getTime())) existingContest.startTime = parsed;
    }
    if (duration !== undefined && duration !== "" && !isNaN(Number(duration))) {
      existingContest.duration = Number(duration);
    }
    if (description && description.trim()) {
      existingContest.description = description.trim();
    }
    if (status) existingContest.status = status;
    existingContest.questions = updatedQuestions;
    existingContest.thumbnail = thumbnailUrl;

    await existingContest.save();

    return res.status(200).json({ success: true, data: existingContest });
  } catch (err) {
    console.error("Update Contest Error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message || "Server error" });
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
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const axios = require('axios');


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

// Generate prompt for contest questions
const generateContestPrompt = ({ 
  language, 
  examType, 
  specificClass, 
  subject, 
  chapter, 
  difficulty,
  count = 5
}) => {
  const lang = Array.isArray(language) ? language[0] : (language || "English");
  const chap = Array.isArray(chapter) ? chapter[0] : (chapter || "");

  const nonEnglishNote = lang && lang.toLowerCase() !== "english"
    ? `Only return output in ${lang}. Do not use English.\n`
    : "";

  return `
You are an expert question setter for competitive engineering CONTESTS and OLYMPIADS.

Generate exactly ${count} UNIQUE contest-level multiple-choice question(s) with:
- Exactly four options labeled A, B, C, D
- One correct answer only per question
- Challenging distractors suitable for a contest
- Difficulty: ${difficulty}

Context:
- Language: ${lang}
- Exam Type: ${examType}
- Class: ${specificClass}
- Subject: ${subject}
- Chapter / Topic: ${chap}

${nonEnglishNote}

Rules:
1. Distribute correct answers across A, B, C, and D.
2. Include a concise explanation for the correct option.
3. Include relevant topic tags.

Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences:
[
  {
    "question": "Full contest question text",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "answer": "B",
    "explanation": "Brief explanation",
    "tags": ["tag1", "tag2"]
  }
]
`;
};

// Parse response supporting JSON array or formatted text fallback
const parseContestResponse = (responseText) => {
  try {
    let cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0]);
      if (parsedJson.question || parsedJson.text) {
        return [{
          question: parsedJson.question || parsedJson.text,
          options: parsedJson.options || {},
          answer: parsedJson.correctAnswer || parsedJson.answer || '',
          explanation: parsedJson.explanation || '',
          tags: parsedJson.tags || []
        }];
      }
    }
  } catch (_) {}

  // Plain text fallback parser
  const lines = responseText.split('\n').filter(Boolean);
  const qText = lines.find(line => line.startsWith("Question:"))?.replace("Question:", "").trim();
  const options = {};
  ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
    const optionLine = lines.find(l => l.startsWith(`${letter}:`));
    if (optionLine) options[letter] = optionLine.replace(`${letter}:`, "").trim();
  });
  const answer = lines.find(line => line.startsWith("Answer:"))?.replace("Answer:", "").trim();
  const explanation = lines.find(line => line.startsWith("Explanation:"))?.replace("Explanation:", "").trim();
  const tagsLine = lines.find(line => line.startsWith("Tags:"));
  const tags = tagsLine ? tagsLine.replace("Tags:", "").trim().split(',').map(tag => tag.trim()) : [];

  if (qText && answer && Object.keys(options).length >= 4) {
    return [{ question: qText, options, answer, explanation, tags }];
  }

  return [];
};

// Hash function
const hashQuestion = (questionText) => crypto.createHash('sha256').update(questionText || Math.random().toString()).digest('hex');

// Generate contest questions via OpenRouter using NVIDIA free model
exports.createContestWithAI = async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "OpenRouter API key not configured" });
    }

    const { language, examType, specificClass, subject, chapter, difficulty, totalQuestions = 5 } = req.body;
    const targetCount = parseInt(totalQuestions) || 5;

    const questions = [];
    const localHashes = new Set();
    let attempts = 0;
    const maxAttempts = 3;
    const FREE_NVIDIA_MODELS = [
      "nvidia/nemotron-3-super-120b-a12b:free",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "nvidia/nemotron-3.5-lightning:free"
    ];

    while (questions.length < targetCount && attempts < maxAttempts) {
      const currentModel = FREE_NVIDIA_MODELS[attempts % FREE_NVIDIA_MODELS.length];
      attempts++;
      const remainingNeeded = targetCount - questions.length;
      const prompt = generateContestPrompt({
        language,
        examType,
        specificClass,
        subject,
        chapter,
        difficulty,
        count: remainingNeeded
      });

      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: currentModel,
            messages: [
              {
                role: "system",
                content: "You must respond ONLY with a valid JSON array. No markdown fences, no explanations."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7
          },
          {
            headers: { 
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://file-management-rosy.vercel.app/",
              "X-Title": "Contest Generator"
            },
            timeout: 30000
          }
        );

        const responseText = response.data?.choices?.[0]?.message?.content;
        if (!responseText) continue;

        const parsedItems = parseContestResponse(responseText);
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) continue;

        for (const item of parsedItems) {
          const text = item.question || item.text;
          const options = item.options || {};
          const ans = item.answer || item.correctAnswer;

          if (!text || !ans || !options.A || !options.B || !options.C || !options.D) {
            continue;
          }

          const hash = hashQuestion(text);
          if (existingHashes.has(hash) || localHashes.has(hash)) continue;

          localHashes.add(hash);
          existingHashes.add(hash);

          questions.push({
            question: text,
            text: text,
            options: options,
            correctAnswer: ans,
            explanation: item.explanation || "",
            difficulty,
            tags: item.tags || [],
            metadata: {
              language,
              examType,
              specificClass,
              subject,
              chapter
            }
          });

          if (questions.length >= targetCount) break;
        }
      } catch (err) {
        console.error("OpenRouter Contest Error:", err?.response?.data || err.message);
      }
    }

    saveHashesToFile();

    if (questions.length === 0) {
      return res.status(500).json({ success: false, error: "No unique questions could be generated via OpenRouter" });
    }

    res.status(200).json({
      success: true,
      message: `Successfully generated ${questions.length} unique question(s).`,
      questions,
      data: questions
    });

  } catch (error) {
    console.error("Server Error in createContestWithAI:", error);
    res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
  }
};

// Main controller function (mapped to /contest/contest/generate)
exports.generateContestQuestions = exports.createContestWithAI;