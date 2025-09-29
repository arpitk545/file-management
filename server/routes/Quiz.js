const express = require("express");
const router = express.Router();
const {createRegions, getAllRegions,updateRegionByName,deleteRegionByName,createQuizQuestion,
    getAllQuizQuestions,extractQuestionsFromFile,getAllQuizzesWithCategoryAndQuestions,
    getQuizById,updateQuizById,deleteQuizById,updateApprovalStatusById,deleteQuizByTitle,
    submitGeneratedQuiz,getGeneratedQuizResult,submitquiz,getQuizResult,
    getQuestionById,updateQuestionById,deleteQuestionByText,submitQuestionReport,
    
} = require("../controllers/Quiz");
const {createQuizWithGeneratedQuestion} = require("../controllers/AIQuiz");
const upload = require("../config/multer");
const {authenticate } =require("../middleware/auth")

router.post("/creat-quiz-regions", createRegions);
router.get("/get-all-quiz-regions", getAllRegions);
router.patch("/update-quiz-region/:name", updateRegionByName);
router.delete("/delete-quiz-region/:name", deleteRegionByName);
router.post("/create-quiz-question", createQuizQuestion);
router.get("/get-all-quiz-questions",getAllQuizzesWithCategoryAndQuestions);
router.post("/get-all-questions",getAllQuizQuestions);
router.post("/extract-questions", extractQuestionsFromFile);
router.get("/get-quiz/:id", getQuizById);
router.patch("/update-quiz/:id", updateQuizById);
router.delete("/delete-quiz/:id", deleteQuizById);
router.patch("/update-approval-status/:id", updateApprovalStatusById);
router.delete("/delete-quiz-by-title/:quizTitle", deleteQuizByTitle);
router.post("/submit-report", submitQuestionReport);

//these three routes where the admin and the manager will update the quiz bank questions
router.get("/get-quizbank-questions/:questionId",getQuestionById)
router.put("/question/:questionId",updateQuestionById)
router.delete("/question/text/:text",deleteQuestionByText)

//create quiz with AI 
router.post("/create-quiz-with-ai", createQuizWithGeneratedQuestion);
router.post("/submit-quiz",authenticate ,submitGeneratedQuiz);
router.get("/get-ai-result", authenticate, getGeneratedQuizResult);
router.post('/:quizId/submit', authenticate, submitquiz)
router.get('/result/:resultId', authenticate, getQuizResult);

module.exports = router;