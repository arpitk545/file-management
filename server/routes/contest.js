const express =require('express')
const router = express.Router();
const{authenticate} =require("../middleware/auth");

const {createContest,getAllContests,deleteContestByTitle,getContestById,changeContestStatusById,
updateContest,deleteContest,generateContestQuestions,
} =require('../controllers/Contest');

const { enrollUserInContest, updateEnrollmentStatus,submitContestAttempt,
    getEnrolledStudentsByContest,getContestResult,checkUserEnrollmentAndAttempt,getAllContestAttemptResults,
 } = require('../controllers/studentEnrollment');

router.post('/create-contest',createContest);
router.get('/get-all-contests',getAllContests);
router.delete('/delete-contest',deleteContestByTitle);
router.get('/get-contest/:id',getContestById);
router.patch('/contests/:id/status', changeContestStatusById);
router.patch('/update-contests/:id', updateContest);
router.delete('/delete-contest/:id', deleteContest);
router.post('/contest/generate', generateContestQuestions);

//Student Enrollment
router.post('/enroll/:contestId',authenticate, enrollUserInContest);
router.patch("/enrollment/:enrollmentId/status", updateEnrollmentStatus);
router.post("/contest/:contestId/submit", authenticate, submitContestAttempt);
router.get('/contest/:contestId/enrollments', getEnrolledStudentsByContest);
router.get('/contest/:contestId/result', authenticate, getContestResult);
router.get("/:contestId/check-enrollment",authenticate,checkUserEnrollmentAndAttempt);
router.get("/contest/:contestId/results",authenticate,getAllContestAttemptResults);
module.exports = router;
