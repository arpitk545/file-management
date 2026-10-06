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
const adRoutes = require('./routes/ad');

dotenv.config();
require("./controllers/passport");
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to database
database.connect();

// CORS setup for specified allowed origins - MUST be first middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://file-management-rosy.vercel.app',
  'https://clys.in',
  'https://clys.in/',
  'https://www.clys.in',
  'https://www.clys.in/'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

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
// app.use(passport.initialize());
// Static folder for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

// API Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/files',fileRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/profile', ProfileRoutes);
app.use('/api/v1/pages', PagesRoutes);
app.use('/api/v1/comments', CommentRoutes);
app.use('/api/v1/contest',contestRoutes);
app.use('/api/v1/ad', adRoutes);
app.use("/", require("./routes/google"));


// Start server
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
