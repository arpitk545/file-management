const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const pdfParse = require("pdf-parse");
const cookieParser = require('cookie-parser');

const database = require('./config/database');
const userRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const fileRoutes =require('./routes/file');
const quizRoutes = require('./routes/Quiz');
const contestRoutes =require('./routes/contest');
const ProfileRoutes = require('./routes/profile');
const PagesRoutes = require('./routes/pages');
const CommentRoutes = require('./routes/comment');

dotenv.config();
require("./controllers/passport");
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to database
database.connect();

// Body parsers for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// File upload middleware (for multipart/form-data)
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
}));

// CORS setup for specified allowed origins;
const allowedOrigins = [
  'http://localhost:3000',
  'https://file-management-rosy.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
// app.use(passport.initialize());
// Static folder for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/files',fileRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/profile', ProfileRoutes);
app.use('/api/v1/pages', PagesRoutes);
app.use('/api/v1/comments', CommentRoutes);
app.use('/api/v1/contest',contestRoutes);
app.use("/", require("./routes/google"));


// Start server
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
