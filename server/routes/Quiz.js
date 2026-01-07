const express = require("express");
const router = express.Router();
const {createRegions, getAllRegions,updateRegionByName,deleteRegionByName,createQuizQuestion,
    getAllQuizQuestions,extractQuestionsFromFile,getAllQuizzesWithCategoryAndQuestions,
    getQuizById,updateQuizById,deleteQuizById,updateApprovalStatusById,deleteQuizByTitle,
    submitGeneratedQuiz,getGeneratedQuizResult,submitquiz,getQuizResult,
    getQuestionById,updateQuestionById,deleteQuestionByText,submitQuestionReport,
    
} = require("../controllers/Quiz");
const {createQuizWithGeneratedQuestion} = require("../controllers/AIQuiz");

const {createquestionTypeRegions,getAllquestionTypeRegions,deletequestionTypeRegionByName,
    updatequestionTypeRegionByName,createQandA,getAllQandA,getQandAById,getMyCreatedQandA,
    addQuestionToQanda, updateQandA,deleteQandA,reportQuestion,reportAnswer,updateReportStatus,
     createQuestionType,updateQuestionType,deleteQuestionType,getAllQuestionTypes
  } = require("../controllers/questiontype");


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

//question answer type routes 
router.post("/create-questiontype-regions",createquestionTypeRegions);
router.get("/get-all-questiontype-regions", getAllquestionTypeRegions);
router.patch("/update-questiontype-region/:name",updatequestionTypeRegionByName);
router.delete("/delete-questiontype-region/:name",deletequestionTypeRegionByName);
router.post("/create-qanda",authenticate, createQandA);
router.get("/get-all-qanda", getAllQandA);
router.get("/get-my-qanda",authenticate, getMyCreatedQandA);
router.get("/get-qnda/:id",getQandAById );
router.post("/add-questions/:id",addQuestionToQanda);
router.put("/qanda/:id", authenticate, updateQandA);
router.delete("/delete/qanda/:id", authenticate,deleteQandA);
router.post("/report-question/:qandaId/:questionId", authenticate, reportQuestion);
router.post("/report-answer/:qandaId/:questionId", authenticate, reportAnswer);
router.patch("/qanda/:qandaId/question/:questionId/report",authenticate,updateReportStatus);
router.post("/question-type", createQuestionType);
router.get("/get-all-question-type", getAllQuestionTypes);
router.put("/update-questiontype/:id", updateQuestionType);
router.delete("/delete-questiontype/:id", deleteQuestionType);


module.exports = router;