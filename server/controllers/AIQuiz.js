const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();

const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

const HASH_FILE = path.join(__dirname, "question-hashes.json");

let existingHashes = new Set();

if (fs.existsSync(HASH_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(HASH_FILE, "utf-8"));
    existingHashes = new Set(saved);
  } catch (_) {}
}

const saveHashesToFile = () => {
  try {
    fs.writeFileSync(
      HASH_FILE,
      JSON.stringify([...existingHashes]),
      "utf-8"
    );
  } catch (_) {}
};

const hashQuestion = (questionText) =>
  crypto.createHash("sha256").update(questionText).digest("hex");

const generatePrompt = ({
  region,
  language,
  examType,
  specificClass,
  subject,
  chapter,
  difficulty,
  count = 5
}) => {
  const lang = Array.isArray(language) ? language[0] : language;
  const chap = Array.isArray(chapter) ? chapter[0] : chapter;

  const nonEnglishNote =
    lang && lang.toLowerCase() !== "english"
      ? `Do NOT use English. Respond strictly in ${lang}.`
      : "";

  return `
You are a professional exam setter for competitive engineering exams like GATE.

Generate exactly ${count} UNIQUE multiple-choice question(s) with:
- Exactly four options labeled A, B, C, D
- One correct answer only per question
- No ambiguity
- Difficulty: ${difficulty}

Context:
- Language: ${lang}
- Exam Type: ${examType}
- Class: ${specificClass}
- Subject: ${subject}
- Chapter: ${chap}
${region ? `- Region: ${region}` : ""}

${nonEnglishNote}

IMPORTANT: 
1. Generate completely UNIQUE questions. Do NOT repeat any questions.
2. Vary the correct answers — do NOT make all answers "A".
3. Distribute correct answers across A, B, C, and D roughly equally.

Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences:
[
  {
    "question": "Full question text here",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "answer": "B",
    "tags": ["tag1"]
  }
]
`;
};

exports.createQuizWithGeneratedQuestion = async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "API key not configured in environment variables"
      });
    }

    const {
      language,
      region,
      examType,
      specificClass,
      subject,
      chapter,
      difficulty,
      totalQuestions = 5
    } = req.body;

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
      const prompt = generatePrompt({
        language,
        region,
        examType,
        specificClass,
        subject,
        chapter,
        difficulty,
        count: remainingNeeded
      });

      let response;
      try {
        response = await axios.post(
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
              "X-Title": "Quiz Generator"
            },
            timeout: 30000
          }
        );
      } catch (e) {
        console.error(`OpenRouter error with model ${currentModel}:`, e?.response?.data || e.message);
        continue;
      }

      const raw = response?.data?.choices?.[0]?.message?.content;
      if (!raw) continue;

      let parsed = null;
      try {
        let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
        const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          parsed = JSON.parse(arrayMatch[0]);
        } else {
          const singleMatch = cleaned.match(/\{[\s\S]*\}/);
          if (singleMatch) {
            parsed = [JSON.parse(singleMatch[0])];
          }
        }
      } catch (parseErr) {
        console.error("Error parsing OpenRouter response:", parseErr.message);
        continue;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) continue;

      for (const item of parsed) {
        const qText = item.question || item.text;
        const opts = item.options;
        const ans = item.answer || item.correctAnswer;

        if (
          !qText ||
          !opts ||
          !ans ||
          !opts.A ||
          !opts.B ||
          !opts.C ||
          !opts.D
        ) {
          continue;
        }

        const hash = hashQuestion(qText);
        if (existingHashes.has(hash) || localHashes.has(hash)) {
          continue;
        }

        existingHashes.add(hash);
        localHashes.add(hash);

        questions.push({
          text: qText,
          question: qText,
          options: opts,
          correctAnswer: ans,
          difficulty,
          tags: item.tags || []
        });

        if (questions.length >= targetCount) break;
      }
    }

    saveHashesToFile();

    if (questions.length === 0) {
      return res.status(500).json({
        success: false,
        error: "No unique questions could be generated via OpenRouter"
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully generated ${questions.length} question(s)`,
      questions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: err.message
    });
  }
};
