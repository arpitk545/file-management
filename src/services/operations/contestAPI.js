import { apiConnector } from "../apiconnector";
import { createContestAPI,getAllContestAPI,deleteContestAPI, getContestByIdAPI,changeStatusContestAPI,
  updateContestByIdAPI, deleteContsetByIdAPI,ContestEnrollmentAPI,getContestEnrollmentAPI,MarkPresentAPI,
   attemptContestAPI,getContestSubmissionAPI,checkStatusStudentAPI,getallStudentResultAPI,createcontestAIquestionsAPI,
 } from "../apis";

// create contest
export const createContest = async (contestData) => {
  try {
    const response = await apiConnector("POST", createContestAPI, contestData, {});

    if (response?.data?.success) {
      return response.data;
    } else {
      throw new Error(response?.data?.message || "Failed to create contest");
    }
  } catch (error) {
    console.error("Create Contest Error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};
// get all contests
export const getAllContest = async () => {
  try {
    const response = await apiConnector("GET", getAllContestAPI, null, {});

    if (response?.data?.success) {
      return response.data;
    } else {
      throw new Error(response?.data?.message || "Failed to fetch contests");
    }
  } catch (error) {
    console.error("Get All Contests Error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};

// delete contest by title
export const deleteContestByTitle = async (title) => {
  try {
    const response = await apiConnector("DELETE", `${deleteContestAPI}/${title}`, null, {});

    if (response?.data?.success) {
      return response.data;
    } else {
      throw new Error(response?.data?.message || "Failed to delete contest");
    }
  } catch (error) {
    console.error("Delete Contest Error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};

//Get all contest by id
export const getContestById = async (id) => {
    try {
        const response = await apiConnector("GET",getContestByIdAPI(id));
        return response.data;
    } catch (error) {
        console.error("Error in fetching Contest by ID API:", error);
        throw error;
    }
};

//Update status of the contest
export const updateApprovalStatus = async (id, status) => {
  try {
    const response = await apiConnector("PATCH", changeStatusContestAPI(id), {
      status, 
    });

    if (response?.data?.success) {
      return response.data;
    } else {
      throw new Error(response?.data?.message || "Failed to update approval status");
    }
  } catch (error) {
    console.error("Update Approval Status Error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};

// Update contest by ID
export const updateContest = async (id, data) => {
  try {
    const response = await apiConnector("PATCH", updateContestByIdAPI(id), data, {
      "Content-Type": "application/json",
    });
    return response;
  } catch (error) {
    console.error("Error updating contest:", error);
    throw error;
  }
};

// Delete contest by ID
export const deleteContest = async (id) => {
  try {
    const response = await apiConnector("DELETE",  deleteContsetByIdAPI(id));
    return response;
  } catch (error) {
    console.error("Error deleting contest:", error);
    throw error;
  }
};
// Contest Enrollment API Call
export const enrollInContest = async (contestId, enrollmentData) => {
  const url = ContestEnrollmentAPI(contestId);

  try {
    const token = localStorage.getItem("token");
    
    // Ensure token is present
    if (!token) {
      return { success: false, message: "User is not authenticated" };
    }

    const response = await apiConnector("POST", url, enrollmentData, {
      Authorization: `Bearer ${token}`,
    });

    if (response.data?.success) {
      console.log("Enrollment successful:", response.data.message);
      return { success: true, data: response.data.data };
    } else {
      console.error("Enrollment failed:", response.data?.message);
      return { success: false, message: response.data?.message };
    }

  } catch (error) {
    console.error("Error enrolling in contest:", error);
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred during enrollment",
    };
  }
};

//get student enrollment list 
export const getStudentEnrollmentList = async (contestId) => {
  try {
    const response = await apiConnector("GET", getContestEnrollmentAPI(contestId));

    if (response?.data?.success) {
      return {
        success: true,
        enrollments: response.data.enrollments,
      };
    } else {
      return {
        success: false,
        message: response?.data?.message || "Failed to fetch enrollments",
      };
    }
  } catch (error) {
    console.error("getStudentEnrollmentList Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Server error while fetching enrollments",
    };
  }
};

export const markStudentAttendance = async (enrollmentId, status) => {
  try {
    const response = await apiConnector("PATCH", MarkPresentAPI(enrollmentId), {
      status, 
    });

    if (response?.data?.success) {
      return {
        success: true,
        message: response.data.message,
        updatedEnrollment: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response?.data?.message || "Failed to update attendance",
      };
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Server error while updating attendance",
    };
  }
};

//Attempt Contest
export const submitContest = async (contestId, answers) => {
  try {
     const token = localStorage.getItem("token");
    const response = await apiConnector("POST",attemptContestAPI(contestId),answers,{
       "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }                  
    );

    if (response?.data?.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Submission failed",
      };
    }
  } catch (error) {
    console.error("Submit Contest Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Server error during contest submission",
    };
  }
};

// Get contest result
export const getContestResult = async (contestId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiConnector(
      "GET",
      getContestSubmissionAPI(contestId),
      null, 
      {
        "Authorization": `Bearer ${token}`,
      }
    );

    if (response?.data?.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response?.data?.message || "Failed to fetch contest result",
      };
    }
  } catch (error) {
    console.error("Get Contest Result Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Server error while fetching contest result",
    };
  }
};

//check the status
export const checkContestAttempt = async (contestId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiConnector(
      "GET",
     checkStatusStudentAPI(contestId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response?.data?.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch status",
      };
    }
  } catch (error) {
    console.error("Error checking student contest status:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message || "Server error while checking status",
    };
  }
};

//get all contest result
export const getallContestResult = async (contestId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiConnector(
      "GET",
      getallStudentResultAPI(contestId),
      null, 
      {
        "Authorization": `Bearer ${token}`,
      }
    );

    if (response?.data?.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response?.data?.message || "Failed to fetch contest result",
      };
    }
  } catch (error) {
    console.error("Get Contest Result Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Server error while fetching contest result",
    };
  }
};

//create contest with AI generated questions
export const createContestWithAI = async (data) => {
  try {
    const response = await apiConnector("POST",createcontestAIquestionsAPI, data, {
      "Content-Type": "application/json"
    });
    return response.data;
  } catch (error) {
    console.error("Error creating quiz with AI generated questions:", error);
    throw error;
  }
}
