const {Enrollment,ContestAttempt} = require('../models/User/contestenrollment');
const User = require('../models/auth');
const Profile = require('../models/profile');
const Contest = require('../models/Contest');

exports.enrollUserInContest = async (req, res) => {
  try {
     const userId = req.user.id || req.user._id;
    const { contestId } = req.params;
    const { school, class: className, phoneNumber, status } = req.body;

   const user = await User.findById(userId);
       if (!user) {
         return res.status(404).json({ message: 'User not found' });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    const profile = await Profile.findOne({ user:userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    const hasPreviousEnrollment = await Enrollment.exists({ user: userId });

    const alreadyEnrolled = await Enrollment.exists({ user: userId, contest: contestId });
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "User already enrolled in this contest" });
    }

    const enrollment = new Enrollment({
      user:userId,
      contest: contest._id,
      email: user.email,
      fullName: profile.fullName,
      profileImage: profile.profileImage,
      school,
      class: className,
      phoneNumber,
      status,
      isFirstContest: !hasPreviousEnrollment,
    });

    await enrollment.save();

    return res.status(201).json({
      success: true,
      message: "User enrolled in contest successfully",
      data: enrollment
    });

  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({ success: false, message: "Server error during enrollment" });
  }
};

 //get all enrollment student list based on the id
 exports.getEnrolledStudentsByContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    // Step 1: Validate contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    // Step 2: Fetch all enrollments for this contest
    const enrollments = await Enrollment.find({ contest: contestId })
      .populate("user", "email") 
      .sort({ createdAt: -1 }); 

    return res.status(200).json({
      success: true,
      message: "Enrolled students fetched successfully",
      enrollments,
    });
  } catch (err) {
    console.error("Fetch Enrollment Error:", err);
    res.status(500).json({ success: false, message: "Server error fetching enrollments" });
  }
};

// Update Enrollment Status
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true }
    );

    if (!updatedEnrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Enrollment status updated to ${status}`,
      data: updatedEnrollment
    });

  } catch (err) {
    console.error("Update Enrollment Status Error:", err);
    res.status(500).json({ success: false, message: "Server error while updating status" });
  }
};

//submit contest
exports.submitContestAttempt = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id; 
    const { answers } = req.body;

    // Step 1: Check Enrollment & Status
    const enrollment = await Enrollment.findOne({ user: userId, contest: contestId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "User not enrolled in this contest." });
    }

    // if (enrollment.status !== "Present") {
    //   return res.status(403).json({ success: false, message: "You must be marked Present to attempt this contest." });
    // }

    // Step 2: Prevent Multiple Attempts
    const alreadyAttempted = await ContestAttempt.findOne({ user: userId, contest: contestId });
    if (alreadyAttempted) {
      return res.status(400).json({ success: false, message: "You have already attempted this contest." });
    }

    // Step 3: Get contest & grade answers
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found." });
    }

    let score = 0;
    answers.forEach((ans) => {
      const question = contest.questions[ans.questionIndex];
      if (question && question.correctAnswer === ans.selectedOption) {
        score += 1;
      }
    });

    // Step 4: Save Attempt
    const attempt = await ContestAttempt.create({
      user: userId,
      contest: contestId,
      answers,
      score
    });

    return res.status(200).json({
      success: true,
      message: "Contest submitted successfully.",
      data: { score, total: contest.questions.length }
    });

  } catch (error) {
    console.error("Contest Submission Error:", error);
    res.status(500).json({ success: false, message: "Error submitting contest." });
  }
};
// Get Contest Result with Detailed Stats
exports.getContestResult = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    // 1. Get Attempt
    const attempt = await ContestAttempt.findOne({ user: userId, contest: contestId });
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Result not found. You may not have attempted the contest.",
      });
    }

    // 2. Get Contest Details
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found." });
    }

    const totalQuestions = contest.questions.length;
    const correctAnswers = attempt.score;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const timeTakenMs = new Date(attempt.updatedAt) - new Date(attempt.createdAt);
    const timeTaken = Math.ceil(timeTakenMs / 60000); 

    return res.status(200).json({
      success: true,
      message: "Result fetched successfully.",
      data: {
        score: correctAnswers,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        scorePercentage,
        timeTaken,
        totalTime: contest.duration || null,
        examType:contest.examType || null,
        specificClass:contest.specificClass ||null,
        chapter:contest.chapter ||null,
        subject: contest.subject || null,
        class: contest.class || null,
        answers: attempt.answers,
        submittedAt: attempt.createdAt,
      },
    });

  } catch (error) {
    console.error("Get Contest Result Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching contest result.",
    });
  }
};
 
// Check Enrollment & Attempt Status for a User in a Contest
exports.checkUserEnrollmentAndAttempt = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    // 1. Check Enrollment
    const enrollment = await Enrollment.findOne({ user: userId, contest: contestId });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "User is not enrolled in this contest.",
        enrolled: false,
        attempted: false,
      });
    }

    // 2. Check if user has attempted the contest
    const attempt = await ContestAttempt.findOne({ user: userId, contest: contestId });

    return res.status(200).json({
      success: true,
      message: "Enrollment and attempt status fetched successfully.",
      data: {
        enrolled: true,
        attempted: !!attempt,
        attemptDetails: attempt || null,
        enrollmentStatus: enrollment.status || "Unknown",
      },
    });
  } catch (error) {
    console.error("Check Enrollment and Attempt Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking enrollment and attempt status.",
    });
  }
};

exports.getAllContestAttemptResults = async (req, res) => {
  try {
    const { contestId } = req.params;

    // Step 1: Validate and get the contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found." });
    }

    const totalQuestions = contest.questions?.length || 0;

    // Step 2: Get all attempts for the contest
    const attempts = await ContestAttempt.find({ contest: contestId })
      .populate("user", "email") // populate user email
      .lean(); // convert to plain JS object

    // Step 3: Add full name and totalQuestions to each result
    const results = await Promise.all(attempts.map(async (attempt) => {
      const profile = await Profile.findOne({ user: attempt.user._id }).lean();
      return {
        name: profile?.fullName || "N/A",
        image:profile?. profileImage || "N/A",
        email: attempt.user.email,
        score: attempt.score,
        totalQuestions,
        submittedAt: attempt.createdAt
      };
    }));

    return res.status(200).json({
      success: true,
      message: "Attempted students fetched successfully.",
      data: results,
    });

  } catch (err) {
    console.error("Get All Contest Attempt Results Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching contest attempt results.",
    });
  }
};
