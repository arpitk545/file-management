import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import LandingPage from "./landingpage";
import Banner from "./components/common/banner";
import Documentation from "./components/pages/Documentation";
import Disclaimer from "./components/pages/Disclaimer";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import TermsConditionPage from "./components/pages/Terms-condition";
import Articles from "./components/pages/Articles";
import Contest from "./components/pages/Contest";
import Profile from "./components/core/Profile/profile";
import Settings from "./components/core/Profile/settings";
import AboutUs from "./components/pages/About-us";
import ContactUs from "./components/pages/contact-us";
import GetMessage from "./components/core/Admin/pages/GetMessages";
import NotFoundPage from "./components/common/Error";
import { ROLE_TYPES } from "./lib/constants";

// Auth pages
import Login from "./components/core/Auth/Login";
import Signup from "./components/core/Auth/Signup";
import OAuthHandler from "./services/operations/googleauth";
import Logout from "./components/core/Auth/logout";
import ForgotPassword from "./components/core/Auth/ForgotPassword";
import DashboardRedirect from "./components/common/DashboardRedirect";
import CreateProfile from "./components/core/Profile/CreateProfile";
// Admin
import AdminDashboard from "./components/core/Admin/AdminDashboard";
import Register from "./components/core/Admin/managerregister";
import ArticlesNews from "./components/core/Admin/Articles-news";
import Comment from "./components/core/Admin/Comment";
import FilterContest from "./components/core/Admin/filter-contest";
import FilterFile from "./components/core/Admin/filter-File";
import CreateArticles from "./components/core/Admin/createArticles";
import EditArticles from "./components/core/Admin/edit-articles";
import CreateFile from "./components/core/Admin/createFile";
import CreateQuizs from "./components/core/Admin/Quiz/CreateQuiz";
import QuizBank from "./components/core/Admin/Quiz/QuizBank";
import EditAboutUs from "./components/core/Admin/pages/edit-About-us";
import EditContactUs from "./components/core/Admin/pages/edit-contact-us";
import EditDisclaimer from "./components/core/Admin/pages/edit-disclaimer";
import EditPrivacyPolicy from "./components/core/Admin/pages/edit-privacy-policy";
import Regio from "./components/core/Admin/pages/Region";
import EditRegion from "./components/core/Admin/Articles/edit-region";
import ApproveArticles from "./components/core/Admin/Approve-articles";
import EditFile from "./components/core/Admin/File/edit-file";
import ViewFile from "./components/core/Admin/File/view-file";
import FilteruserFile from "./components/core/Admin/File/useruploadfile";
import ViewQuiz from "./components/core/Admin/Quiz/view-quiz";
import ShowQuestions from "./components/core/Admin/Quiz/Show-questions";
import UpdateQuiz from "./components/core/Admin/Quiz/update-quiz";

//Admin File 
import FileRegion from "./components/core/Admin/File/Create-Region";
import EditFileRegion from "./components/core/Admin/File/Edit-FileRegion";
//Admin Quiz
import QuizRegion from "./components/core/Admin/Quiz/QuizRegion";
import EditQuizRegion from "./components/core/Admin/Quiz/Edit-QuizRegion";
import UpdateQuizBank from "./components/core/Admin/Quiz/updatequizbank";
import ReportQuiz from "./components/core/Admin/Quiz/Report-quiz";
//Admin Q & A 
import QandARegion from "./components/core/Admin/questionAnswerType/create-regions";
import EditQandARegion from "./components/core/Admin/questionAnswerType/edit-regions";
import CreateQandA from "./components/core/Admin/questionAnswerType/createqanda";
import ViewQandA from "./components/core/Admin/questionAnswerType/filterqanda";
import AddQandaQuestions from "./components/core/Admin/questionAnswerType/addqandquestions";
import ListQuestions from "./components/core/Admin/questionAnswerType/List";
import EditQandA from "./components/core/Admin/questionAnswerType/Editqanda";
import ShowReport from "./components/core/Admin/questionAnswerType/showreports";
import QuestionTypeManager from "./components/core/Admin/questionAnswerType/createquestiontype";
import EditQuestionType from "./components/core/Admin/questionAnswerType/editquestiontype";

//Admin User Details 
import ManagerDetails from "./components/core/Admin/UserDetails/manager";
import UserDetails from "./components/core/Admin/UserDetails/user";
// Manager
import ManagerDashboard from "./components/core/Manager/Dashboard";
import CreateContest from "./components/core/Manager/CreateContest";
import ViewContest from "./components/core/Manager/Contest/viewContest";
import EditContest from "./components/core/Manager/Contest/Edit-contest";
import ShowALLResult from "./components/core/Manager/Contest/showALlResult";
import ShowStudentEnroll from "./components/core/Manager/Contest/ShowStudentEnroll";
import UploadFiles from "./components/core/Manager/UploadFiles";
// User
import UserDashboard from "./components/core/User/Dashboard";
import BuildContest from "./components/core/User/Contest/createcontest";
import ContestDetails from "./components/core/User/Contest/Contest-Details";
import ContestEnrollment from "./components/core/User/Contest/Enrollment";
import CreateQuiz from "./components/core/User/CreateQuiz";
import  BuildQuiz from "./components/core/User/Quiz/create-quiz";
import ReviewQuiz from "./components/core/User/Quiz/review-answer";
import Attempt from "./components/core/User/Attempt";
import AttemptContest from "./components/core/User/Contest/Attempt-Contest";
import Leaderboard from "./components/core/User/Contest/Leaderboard";
import AllPost from "./components/core/User/post/allPost";
import UserPostView from "./components/core/User/post/UserPostView";
import Result from "./components/core/User/Result";
import UserFileView from "./components/core/User/File/UserFileView";
import FileView from "./components/core/User/File/FileView";
import AIResult from "./components/core/User/AIQuizResult";
import QuizDetails from "./components/core/User/Quiz/viewQuiz";
import PlayQuiz from "./components/core/User/Quiz/Attemptquiz";
import FilterUserQuiz from "./components/core/User/Quiz/filter-user-quiz";
import ViewUserQuiz from "./components/core/User/Quiz/view-user-quiz";
import EditQuiz from "./components/core/User/Quiz/edit-user-quiz";
import UserQuizResult from "./components/core/User/Quiz/viewUserResult"
import CreateFiles from "./components/core/User/File/uploaduserfile";
import FilterFiles from "./components/core/User/File/filterfile";
import ViewFiles from "./components/core/User/File/uploadfileview";
import EditFiles from "./components/core/User/File/update-deletefile";

//user q and a
import UploadQandAWithQuestions from "./components/core/User/questionandanswertype/uploadqanda";
import ShowqnadaQuestions from "./components/core/User/questionandanswertype/showquestions";
import ViewMyQandA from "./components/core/User/questionandanswertype/viewqanda";
import ViewsubmittedQandA from "./components/core/Admin/questionAnswerType/submittedqanda";
import UserListQuestions from "./components/core/User/questionandanswertype/userList";

import "./App.css";

function App() {
  const { user } = useSelector((state) => state.profile);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-condition" element={<TermsConditionPage />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/contest" element={<Contest />} />
        <Route path="/advertisements" element={<Banner />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/create-region" element={<Regio/>}/>
        <Route path="/edit-region" element={<EditRegion />} />
        <Route path="/create-profile" element={<CreateProfile />} />

        {/* File Admin Routes */}
        <Route path="/create-file-region" element={<FileRegion />} />
        <Route path="/edit-file-region" element={<EditFileRegion />} />

        {/* Quiz Admin Routes */}
        <Route path="/create-quiz-region" element={<QuizRegion />} />
        <Route path="/edit-quiz-region" element={<EditQuizRegion />} />
        <Route path="/report-quiz" element={<ReportQuiz />} />
        {/* Admin user details Routes */}
        <Route path="/manager-details" element={<ManagerDetails />} />
        <Route path="/user-details" element={<UserDetails />} />
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="/manager/dashboard" element={<ManagerDashboard />} /> */}
        {/* <Route path="/user/dashboard" element={<UserDashboard />} /> */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        {/* <Route path="/dashboard" element={<ManagerDashboard />} />
        <Route path="/dashboard" element={<UserDashboard />} /> */}
        <Route path="/register" element={<Register />} />

       {user?.role === ROLE_TYPES.ADMIN && (
       <>
       <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/articles/news" element={<ArticlesNews  />} />
        <Route path="/filter-contest" element={<FilterContest />} />
        
        {/* File Admin Routes */}
        <Route path="/create-file-region" element={<FileRegion />} />
        <Route path="/edit-file-region" element={<EditFileRegion />} />
        <Route path="/filter-file" element={<FilterFile />} />
        <Route path="/user-uploaded-file" element={<FilteruserFile/>}/>
        <Route path="/comments" element={<Comment />} />
        <Route path="/create-articles" element={<CreateArticles />} />
        <Route path="/approve-articles/:id" element={<ApproveArticles />} />
        <Route path="/edit-articles/:id" element={<EditArticles />} />
        <Route path="/create-file" element={<CreateFile />} />
        <Route path="/create-quizs" element={<CreateQuizs />} />
        <Route path="/quiz-bank" element={<QuizBank />} />
        <Route path="/update-quizbank/:questionId" element={<UpdateQuizBank/>}/>
        <Route path="/edit-about-us" element={<EditAboutUs />} />
        <Route path="/edit-contact-us" element={<EditContactUs />} />
        <Route path="/edit-disclaimer" element={<EditDisclaimer />} />
        <Route path="/edit-privacy-policy" element={<EditPrivacyPolicy />} />
        <Route path="/view-file/:id" element={<ViewFile />} />
        <Route path="/edit-file/:id" element={<EditFile />} />
        <Route path="/view-quiz" element={<ViewQuiz />} />
        <Route path="/show-questions/:id" element={<ShowQuestions />} />
        <Route path="/update-quiz/:id" element={<UpdateQuiz />} />
        <Route path="/get-messages" element={<GetMessage />} />
        {/* contest route */}
           <Route path="/create-contests" element={<CreateContest/>}/>
           <Route path="/view-contest/:id" element={<ViewContest/>}/>
            <Route path="/show-all-result/:id" element={<ShowALLResult/>}/>
           <Route path="/edit-contest/:id" element={<EditContest/>}/>
            <Route path="/filter-contest" element={<FilterContest />} />
            <Route path="/Enroll-Students/:contestId" element={<ShowStudentEnroll/>}/>
        {/* Q & A Admin Routes */}
        <Route path="/create-qa-region" element={<QandARegion />} />
        <Route path="/edit-qa-region" element={<EditQandARegion />} />
        <Route path="/create-qa" element={<CreateQandA />} />
        <Route path="/view-qa" element={<ViewQandA />} />
        <Route path="/create-qanda/:id" element={<AddQandaQuestions />} />
        <Route path="/qanda-detail/:id" element={<ListQuestions />} />
        <Route path="/edit-qanda/:id" element={<EditQandA />} />
        <Route path="/qa-reports" element={<ShowReport />} />
        <Route path="/submitted-qa" element={<ViewsubmittedQandA />} />
        <Route path="/create-question-type" element={<QuestionTypeManager />} />
        <Route path="/edit-question-type" element={<EditQuestionType />} />
       
       </>
       )}

        {user?.role === ROLE_TYPES.MANAGER && (
          <>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/articles/news" element={<ArticlesNews  />} />
           <Route path="/create-articles" element={<CreateArticles />} />
           <Route path="/approve-articles/:id" element={<ApproveArticles />} />
           <Route path="/edit-articles/:id" element={<EditArticles />} />
           
            {/* File manager Routes */}
            <Route path="/create-file" element={<CreateFile />} />
            <Route path="/create-file-region" element={<FileRegion />} />
            <Route path="/edit-file-region" element={<EditFileRegion />} />
            <Route path="/filter-file" element={<FilterFile />} />
             <Route path="/user-uploaded-file" element={<FilteruserFile/>}/>
           <Route path="/view-file/:id" element={<ViewFile />} />
           <Route path="/edit-file/:id" element={<EditFile />} />
           <Route path="/create-quizs" element={<CreateQuizs />} />
           <Route path="/quiz-bank" element={<QuizBank />} />
            <Route path="/update-quizbank/:questionId" element={<UpdateQuizBank/>}/>
           <Route path="/view-quiz" element={<ViewQuiz />} />
           <Route path="/show-questions/:id" element={<ShowQuestions />} />
           <Route path="/update-quiz/:id" element={<UpdateQuiz />} />
           <Route path="/comments" element={<Comment />} />
           <Route path="/create-contests" element={<CreateContest/>}/>
           <Route path="/view-contest/:id" element={<ViewContest/>}/>
           <Route path="/show-all-result/:id" element={<ShowALLResult/>}/>
           <Route path="/edit-contest/:id" element={<EditContest/>}/>
            <Route path="/filter-contest" element={<FilterContest />} />
            <Route path="/Enroll-Students/:contestId" element={<ShowStudentEnroll/>}/>
            <Route path="/upload-files" element={<UploadFiles />} />
            <Route path="/get-messages" element={<GetMessage />} />
            <Route path="/edit-about-us" element={<EditAboutUs />} />
           <Route path="/edit-contact-us" element={<EditContactUs />} />
           <Route path="/edit-disclaimer" element={<EditDisclaimer />} />
            <Route path="/edit-privacy-policy" element={<EditPrivacyPolicy />} />

          {/* Q & A Manager Routes */}
        <Route path="/create-qa-region" element={<QandARegion />} />
        <Route path="/edit-qa-region" element={<EditQandARegion />} />
        <Route path="/create-qa" element={<CreateQandA />} />
        <Route path="/view-qa" element={<ViewQandA />} />
        <Route path="/create-qanda/:id" element={<AddQandaQuestions />} />
        <Route path="/qanda-detail/:id" element={<ListQuestions />} />
        <Route path="/edit-qanda/:id" element={<EditQandA />} />
        <Route path="/qa-reports" element={<ShowReport />} />
        <Route path="/submitted-qa" element={<ViewsubmittedQandA />} />
          </>
        )}
        {user?.role === ROLE_TYPES.USER && (
          <>
          
          <Route path="/Contest-Details" element={< ContestDetails/>}/>
          <Route path="/Contest-Enrollment/:contestId" element={<ContestEnrollment/>}/>
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/build-quiz" element={<BuildQuiz />} />
          <Route path="/view-all-user-quiz" element={<ViewUserQuiz/>}/>
          <Route path="/review-answer/:resultId" element={<ReviewQuiz />} />
          <Route path="/view-quiz" element={<ViewQuiz />} />
          <Route path="/edit-user-quiz" element={<EditQuiz />} />
          <Route path="/build-contest" element={<BuildContest/>}/>
          <Route path="/filter-user-quiz" element={<FilterUserQuiz/>}/>
          <Route path="/attempt" element={<Attempt />} />
          <Route path="/attempt-contest/:contestId" element={< AttemptContest/>}/>
          <Route path="/result/:contestId" element={<Result />} />
          <Route path="/leaderboard/:contestId" element={< Leaderboard/>}/>
          <Route path="/user-all-post-view" element={<AllPost />} />
          {/* <Route path="/post-view/" element={< UserPostView/>} /> */}
          <Route path="/post-view/:articleId" element={< UserPostView/>} />
          <Route path="/user-upload-file" element={<CreateFiles/>}/>
          <Route path="/filter-user-file" element={<FilterFiles/>}/>
          <Route path="/view-user-file/:id" element={<ViewFiles/>}/>
          <Route path="/file-view" element={< UserFileView  />} />
          <Route path="/show-file/:id" element={<FileView />} />
            <Route path="/edit-user-file/:id" element={<EditFiles />} />
          <Route path="/get-ai-result" element={<AIResult/>}/>
          <Route path="/play-quiz/:quizId" element={<PlayQuiz/>}/>
          <Route path="/quiz-result/:resultId" element={<UserQuizResult />}/>

           {/* Q & A User Routes */}
        <Route path="/upload-q-and-a" element={<UploadQandAWithQuestions />} />
        <Route path="/create-qanda/:id" element={<AddQandaQuestions />} />
        <Route path="/view-all-q-and-a" element={<ShowqnadaQuestions />}/>
        <Route path="/view-your-q-and-a" element={<ViewMyQandA />} />
        <Route path="/edit-qanda/:id" element={<EditQandA />} />
        <Route path="/user-qanda-detail/:id" element={<UserListQuestions/>}/>
          </>
          
        )}

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
         <Route path="/post-view/:articleId" element={< UserPostView/>} />
         <Route path="/play-quiz/:quizId" element={<PlayQuiz/>}/>
          <Route path="/view-user-quiz" element={<QuizDetails/>}/>
        <Route path="/show-file/:id" element={<FileView />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="*" element={< NotFoundPage/>}/>
        <Route path="/oauth" element={<OAuthHandler />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
