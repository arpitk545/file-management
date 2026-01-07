require("dotenv").config();

const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
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
  difficulty
}) => {
  const lang = Array.isArray(language) ? language[0] : language;
  const chap = Array.isArray(chapter) ? chapter[0] : chapter;

  const nonEnglishNote =
    lang && lang.toLowerCase() !== "english"
      ? `Do NOT use English. Respond strictly in ${lang}.`
      : "";

  return `
You are a professional exam setter for competitive engineering exams like GATE.

Create ONE UNIQUE multiple-choice question with:
- Exactly four options (A, B, C, D)
- One correct answer only
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

Respond ONLY with valid JSON in this exact format:
{
  "question": "string",
  "options": {
    "A": "string",
    "B": "string",
    "C": "string",
    "D": "string"
  },
  "answer": "A | B | C | D",
  "tags": ["string", "string"]
}
`;
};

exports.createQuizWithGeneratedQuestion = async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
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

    const questions = [];
    const localHashes = new Set();
    let attempts = 0;
    const maxAttempts = totalQuestions * 4;

    while (questions.length < totalQuestions && attempts < maxAttempts) {
      const prompt = generatePrompt({
        language,
        region,
        examType,
        specificClass,
        subject,
        chapter,
        difficulty
      });

      let response;
      try {
        response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
              {
                role: "system",
                content: "Respond ONLY with valid JSON. No explanations."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.8
          },
          {
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://file-management-rosy.vercel.app/",
              "X-Title": "Quiz Generator"
            }
          }
        );
      } catch (_) {
        attempts++;
        continue;
      }

      const raw = response?.data?.choices?.[0]?.message?.content;

      if (!raw) {
        attempts++;
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        attempts++;
        continue;
      }

      if (
        !parsed.question ||
        !parsed.options ||
        !parsed.answer ||
        !parsed.options.A ||
        !parsed.options.B ||
        !parsed.options.C ||
        !parsed.options.D
      ) {
        attempts++;
        continue;
      }

      const hash = hashQuestion(parsed.question);
      if (existingHashes.has(hash) || localHashes.has(hash)) {
        attempts++;
        continue;
      }

      existingHashes.add(hash);
      localHashes.add(hash);

      questions.push({
        text: parsed.question,
        options: parsed.options,
        correctAnswer: parsed.answer,
        difficulty,
        tags: parsed.tags || []
      });

      attempts++;
    }

    saveHashesToFile();

    if (questions.length === 0) {
      return res.status(500).json({
        error: "No unique questions could be generated"
      });
    }

    res.status(200).json({
      message: `Successfully generated ${questions.length} question(s)`,
      questions
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message
    });
  }
};
