const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Path to hash file (to prevent repeated questions)
const HASH_FILE = path.join(__dirname, 'question-hashes.json');
let existingHashes = new Set();

if (fs.existsSync(HASH_FILE)) {
  const saved = JSON.parse(fs.readFileSync(HASH_FILE, 'utf-8'));
  existingHashes = new Set(saved);
}

const saveHashesToFile = () => {
  fs.writeFileSync(HASH_FILE, JSON.stringify([...existingHashes]), 'utf-8');
};

// Prompt generator
const generatePrompt = ({ region, language, examType, specificClass, subject, chapter, difficulty }) => {
  // Support single or array language
  const lang = Array.isArray(language) ? language[0] : language;
  const chap = Array.isArray(chapter) ? chapter[0] : chapter;

  const nonEnglishNote =
    lang && typeof lang === 'string' && lang.toLowerCase() !== "english"
      ? `Only return output in ${lang}. Do not use English at all.\n`
      : "";

  return `
Generate a unique multiple-choice question with four options and one correct answer for the following:

- Language: ${lang}
- Exam Type: ${examType}
- Class: ${specificClass}
- Subject: ${subject}
- Chapter: ${chap}
- Difficulty: ${difficulty}

${nonEnglishNote}

Format:
Question: <question text>
Options:
A: <option A>
B: <option B>
C: <option C>
D: <option D>
Answer: <correct option - A/B/C/D>
Tags: <comma-separated tags>
  `;
};

const parseGeminiResponse = (responseText) => {
  const lines = responseText.split('\n').filter(Boolean);
  const text = lines.find(line => line.startsWith("Question:"))?.replace("Question:", "").trim();
  const options = {
    A: lines.find(l => l.startsWith("A:"))?.replace("A:", "").trim(),
    B: lines.find(l => l.startsWith("B:"))?.replace("B:", "").trim(),
    C: lines.find(l => l.startsWith("C:"))?.replace("C:", "").trim(),
    D: lines.find(l => l.startsWith("D:"))?.replace("D:", "").trim(),
  };
  const correctAnswer = lines.find(line => line.startsWith("Answer:"))?.replace("Answer:", "").trim();
  const tagsLine = lines.find(line => line.startsWith("Tags:"));
  const tags = tagsLine ? tagsLine.replace("Tags:", "").trim().split(',').map(tag => tag.trim()) : [];

  return { text, options, correctAnswer, tags };
};

const hashQuestion = (questionText) => crypto.createHash('sha256').update(questionText).digest('hex');

exports.createQuizWithGeneratedQuestion = async (req, res) => {
  try {
    const {
      language,
      region,
      examType,
      specificClass,
      subject,
      chapter,
      difficulty ,
      totalQuestions = 5
    } = req.body;

    const questions = [];
    const localHashes = new Set();
    let attempts = 0;
    const maxAttempts = totalQuestions * 4;

    while (questions.length < totalQuestions && attempts < maxAttempts) {
      const prompt = generatePrompt({ language, examType, specificClass, subject, chapter, difficulty });
      const result = await model.generateContent(prompt);
      const responseText = result?.response?.text();

      if (!responseText) {
        attempts++;
        continue;
      }

      const parsed = parseGeminiResponse(responseText);
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
        difficulty,
        tags: parsed.tags,
      });

      attempts++;
    }

    saveHashesToFile(); 

    if (questions.length === 0) {
      return res.status(500).json({ error: 'No unique questions could be generated.' });
    }

    res.status(200).json({
      message: `Successfully generated ${questions.length} unique question(s).`,
      questions,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
