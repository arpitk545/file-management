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
      status: status || "Approved",
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