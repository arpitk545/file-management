// ==================== Base URL ====================
export const BASE_URL = process.env.REACT_APP_BASE_URL;

// ==================== Auth APIs ====================
export const signupAPI = `${BASE_URL}/auth/signup`;
export const loginAPI = `${BASE_URL}/auth/login`;
export const logoutAPI = `${BASE_URL}/auth/logout`;
export const changePasswordAPI = `${BASE_URL}/auth/change-password`;
export const forgotPasswordAPI = `${BASE_URL}/auth/forgot-password`;
export const googleauthAPI ="http://localhost:4000/auth/google";
// ==================== Article & Region APIs ====================
export const createRegionAPI = `${BASE_URL}/articles/create-region`;
export const getAllRegionsAPI = `${BASE_URL}/articles/all-regions`;
export const updateRegionAPI = (name) => `${BASE_URL}/articles/update-region/${encodeURIComponent(name)}`;
export const deleteRegionAPI = (name) => `${BASE_URL}/articles/delete-region/${encodeURIComponent(name)}`;

export const createArticleAPI = `${BASE_URL}/articles/create-article`;
export const getAllArticlesAPI = `${BASE_URL}/articles/all-articles`;
export const getArticleByIdAPI = (id) => `${BASE_URL}/articles/article/${id}`;
export const updateArticleStatusAPI = (id) => `${BASE_URL}/articles/${id}/status`;
export const updateArticleAPI = (id) => `${BASE_URL}/articles/update-article/${id}`;
export const deleteArticleAPI = (id) => `${BASE_URL}/articles/delete-article/${id}`;
export const deleteArticleByTitleAPI = (title) => `${BASE_URL}/articles/delete-article-by-title/${encodeURIComponent(title)}`;

// ==================== File APIs ====================
export const CreateFileRegionAPI = `${BASE_URL}/files/create-file-region`;
export const getAllFileRegionAPI = `${BASE_URL}/files/get-all-region`;
export const updateFileRegionAPI = (name) => `${BASE_URL}/files/update-details/${encodeURIComponent(name)}`;
export const deleteFileRegionAPI = (name) => `${BASE_URL}/files/delete-details/${encodeURIComponent(name)}`;

export const createFileAPI = `${BASE_URL}/files/create-file`;
export const getAllFileAPI = `${BASE_URL}/files/get-all-file`;
export const getAllUserFileAPI = `${BASE_URL}/files/get-user-file`;
export const deleteBytitleAPI = (fileTitle) => `${BASE_URL}/files/title/${encodeURIComponent(fileTitle)}`;
export const updateFileStatusAPI = (id) => `${BASE_URL}/files/update-status/${id}`;
export const deleteFileByTitleAPI = (fileTitle) => `${BASE_URL}/files/title/${encodeURIComponent(fileTitle)}`;
export const getFileByIdAPI = (id) => `${BASE_URL}/files/get-file/${id}`;
export const updateFileAPI = (id) => `${BASE_URL}/files/update/${id}`;
export const deleteFileAPI = (id) => `${BASE_URL}/files/delete/${id}`;

// ==================== Quiz APIs ====================
export const createQuizRegionAPI = `${BASE_URL}/quiz/creat-quiz-regions`;
export const getAllQuizRegionAPI = `${BASE_URL}/quiz/get-all-quiz-regions`;
export const updateQuizRegionAPI = (name) => `${BASE_URL}/quiz/update-quiz-region/${encodeURIComponent(name)}`;
export const deleteQuizRegionAPI = (name) => `${BASE_URL}/quiz/delete-quiz-region/${encodeURIComponent(name)}`;

export const createQuizQuestionAPI = `${BASE_URL}/quiz/create-quiz-question`;
export const deleteQuizByTitleAPI = (quizTitle) => `${BASE_URL}/quiz/delete-quiz-by-title/${encodeURIComponent(quizTitle)}`;
export const getAllQuizQuestionsAPI = `${BASE_URL}/quiz/get-all-questions`;
export const extractQuestionsFromFileAPI = `${BASE_URL}/quiz/extract-questions`;
export const getAllQuizAPI = `${BASE_URL}/quiz/get-all-quiz-questions`;
export const getQuizbankquestion = (questionId) => `${BASE_URL}/quiz/get-quizbank-questions/${questionId}`;
export const updatequizbankquestion = (questionId) => `${BASE_URL}/quiz/question/${questionId}`;
export const deletequizbankquestion = (text) => `${BASE_URL}/quiz/question/text/${encodeURIComponent(text)}`;
export const getQuizByIdAPI = (id) => `${BASE_URL}/quiz/get-quiz/${id}`;
export const updateQuizByIdAPI = (id) => `${BASE_URL}/quiz/update-quiz/${id}`;
export const deleteQuizByIdAPI = (id) => `${BASE_URL}/quiz/delete-quiz/${id}`;
export const updateApprovalStatusByIdAPI = (id) => `${BASE_URL}/quiz/update-approval-status/${id}`;
export const createQuizWithAIAPI = `${BASE_URL}/quiz/create-quiz-with-ai`;
export const submitAiQuizAPI = `${BASE_URL}/quiz/submit-quiz`;
export const getQuizSubmissionAPI = `${BASE_URL}/quiz/get-ai-result`;
export const submitQuizAPI = (quizId) => `${BASE_URL}/quiz/${quizId}/submit`;
export const getQuizSubmissionByIdAPI = (resultId) => `${BASE_URL}/quiz/result/${resultId}`;
export const submitQuestionReportAPI = `${BASE_URL}/quiz/submit-report`;

// ==================== Question Type APIs ====================
export const createQuestionTypeRegionAPI = `${BASE_URL}/quiz/create-questiontype-regions`;
export const getAllQuestionTypeRegionAPI = `${BASE_URL}/quiz/get-all-questiontype-regions`;
export const updateQuestionTypeRegionAPI = (name) =>
  `${BASE_URL}/quiz/update-questiontype-region/${encodeURIComponent(name)}`;
export const deleteQuestionTypeRegionAPI = (name) =>
  `${BASE_URL}/quiz/delete-questiontype-region/${encodeURIComponent(name)}`;

export const createQAndAAPI = `${BASE_URL}/quiz/create-qanda`;
export const getAllQAndAAPI = `${BASE_URL}/quiz/get-all-qanda`;
export const getMyCreatedQAndAAPI = `${BASE_URL}/quiz/get-my-qanda`;
export const getQAndAByIdAPI = (id) => `${BASE_URL}/quiz/get-qnda/${id}`;
export const addQuestionToQandaAPI = (id) => `${BASE_URL}/quiz/add-questions/${id}`;
export const updateQAndAAPI = (id) => `${BASE_URL}/quiz/qanda/${id}`;
export const deleteQAndAAPI = (id) => `${BASE_URL}/quiz/delete/qanda/${id}`;
export const reportQuestionAPI = (qandaId, questionId) =>
  `${BASE_URL}/quiz/report-question/${qandaId}/${questionId}`;
export const reportAnswerAPI = (qandaId, questionId) =>
  `${BASE_URL}/quiz/report-answer/${qandaId}/${questionId}`;
export const updateReportStatusAPI = (qandaId, questionId) =>
  `${BASE_URL}/quiz/qanda/${qandaId}/question/${questionId}/report`;

export const createQuestionTypeAPI = `${BASE_URL}/quiz/question-type`;
export const getAllQuestionTypeAPI = `${BASE_URL}/quiz/get-all-question-type`;
export const updateQuestionTypeAPI = (id) => `${BASE_URL}/quiz/update-questiontype/${id}`;
export const deleteQuestionTypeAPI = (id) => `${BASE_URL}/quiz/delete-questiontype/${id}`;

// ==================== Profile APIs ====================
export const upsertProfileAPI = `${BASE_URL}/profile/create-profile`;
export const getMyProfileAPI = `${BASE_URL}/profile/my-profile`;
export const updateProfileAPI = `${BASE_URL}/profile/update-profile`;
export const getManagersAndUsersAPI = `${BASE_URL}/profile/managers-and-users`;
export const blockOrUnblockUserAPI = `${BASE_URL}/profile/block-or-unblock-user`;

// ==================== Pages APIs ====================
export const getAboutUsAPI = `${BASE_URL}/pages/get-about-us`;
export const updateAboutUsAPI = `${BASE_URL}/pages/update-about-us`;
export const getContactUsAPI = `${BASE_URL}/pages/get-contact-us`;
export const updateContactUsAPI = `${BASE_URL}/pages/update-contact-us`;
export const submitContactMessageAPI = `${BASE_URL}/pages/submit-contact-form`;
export const getsubmittedContactMessagesAPI = `${BASE_URL}/pages/get-contact-messages`;
export const deleteContactByEmailAPI = (email) => `${BASE_URL}/pages/delete-contact-by-email/${encodeURIComponent(email)}`;
export const getDisclaimerAPI = `${BASE_URL}/pages/get-disclaimer`;
export const updateDisclaimerAPI = `${BASE_URL}/pages/update-disclaimer`;
export const getPrivacyPolicyAPI = `${BASE_URL}/pages/get-privacy-policy`;
export const updatePrivacyPolicyAPI = `${BASE_URL}/pages/update-privacy-policy`;

// ==================== Comment APIs ====================
export const createCommentAPI = `${BASE_URL}/comments/create/comment`;
export const getAllCommentsAPI = `${BASE_URL}/comments/all/comment`;
export const getAllCommentbyIdAPI = (refId) => `${BASE_URL}/comments/comments/${refId}`;
export const changeCommentStatusAPI = `${BASE_URL}/comments/change-status/comment`;
export const deleteCommentAPI = (name, content, email) => 
  `${BASE_URL}/comments/delete/comment/${encodeURIComponent(name)}/${encodeURIComponent(content)}/${encodeURIComponent(email)}`;

// ==================== Contest APIs ====================
export const createContestAPI = `${BASE_URL}/contest/create-contest`;
export const getAllContestAPI = `${BASE_URL}/contest/get-all-contests`;
export const deleteContestAPI = `${BASE_URL}/contest/delete-contest`;
export const getContestByIdAPI = (id) => `${BASE_URL}/contest/get-contest/${id}`;
export const changeStatusContestAPI = (id) => `${BASE_URL}/contest/contests/${id}/status`;
export const updateContestByIdAPI = (id) => `${BASE_URL}/contest/update-contests/${id}`;
export const deleteContsetByIdAPI = (id) => `${BASE_URL}/contest/delete-contests/${id}`;
export const ContestEnrollmentAPI = (contestId) => `${BASE_URL}/contest/enroll/${contestId}`;
export const MarkPresentAPI = (enrollmentId) => `${BASE_URL}/contest/enrollment/${enrollmentId}/status`;
export const getContestEnrollmentAPI = (contestId) => `${BASE_URL}/contest/contest/${contestId}/enrollments`;
export const attemptContestAPI = (contestId) => `${BASE_URL}/contest/contest/${contestId}/submit`;
export const getContestSubmissionAPI = (contestId) => `${BASE_URL}/contest/contest/${contestId}/result`;
export const checkStatusStudentAPI = (contestId) => `${BASE_URL}/contest/${contestId}/check-enrollment`;
export const getallStudentResultAPI = (contestId) => `${BASE_URL}/contest/contest/${contestId}/results`;
export const createcontestAIquestionsAPI = `${BASE_URL}/contest/contest/generate`;
