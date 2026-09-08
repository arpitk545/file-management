import { apiConnector } from "../apiconnector";
import { createQuizRegionAPI,getAllQuizRegionAPI,updateQuizRegionAPI,deleteQuizRegionAPI,
  createQuizQuestionAPI, getAllQuizQuestionsAPI,extractQuestionsFromFileAPI,getAllQuizAPI,
  getQuizByIdAPI,updateQuizByIdAPI,deleteQuizByIdAPI,updateApprovalStatusByIdAPI, createQuizWithAIAPI,
  deleteQuizByTitleAPI,submitAiQuizAPI,getQuizSubmissionAPI,submitQuizAPI,getQuizSubmissionByIdAPI,
  getQuizbankquestion, updatequizbankquestion,deletequizbankquestion,submitQuestionReportAPI,
 } from "../apis";

//create quiz region
export const createQuizRegion = async (data) => {
  try {
    const response = await apiConnector("POST",createQuizRegionAPI, data);
    return response.data;
  } catch (error) {
    console.error("Error creating quiz region:", error);
    throw error;
  }
}
//get quiz bank question for the update

export const getQuizBankQuestion = async (questionId) => {
  try {
    const response = await apiConnector("GET", getQuizbankquestion(questionId));
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz bank question:", error);
    throw error;
  }
};
//delete quiz baank questions 
export const deleteQuizBankQuestion = async (text) => {
  try {
    const response = await apiConnector("DELETE", deletequizbankquestion(text));
    return response.data;
  } catch (error) {
    console.error("Error deleting quiz bank question:", error);
    throw error;
  }
};

//update quiz bank questions 
export const updateQuizBankQuestion = async (questionId, data) => {
  try {
    const response = await apiConnector("PUT", updatequizbankquestion(questionId), data);
    return response.data;
  } catch (error) {
    console.error("Error updating quiz bank question:", error);
    throw error;
  }
};
//get all quiz regions
export const getAllQuizRegions = async () => {
    try {
            const response = await apiConnector("GET", getAllQuizRegionAPI, null, {
            "Content-Type": "application/json"
            });
            return response.data;
            } catch (error) {
            console.error("Error in get region API:", error);
            throw error;
    }
}

export const updateQuizRegion = async (name, updateData) => {
  try {
    const response = await apiConnector(
      "PATCH",
      updateQuizRegionAPI(name),
      updateData,
      {
        "Content-Type": "application/json",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in update region API:", error);
    throw error;
  }
};


//delete quiz region by name
export const deleteQuizRegion = async (name) => {
  try {
    const response = await apiConnector("DELETE", deleteQuizRegionAPI(name));
    return response.data;
  } catch (error) {
    console.error("Error in delete region API:", error);
    throw error;
  }
}
//create quiz question
export const createQuizQuestion = async (data) => {
  try {
    const response = await apiConnector("POST", createQuizQuestionAPI, data);
    return response.data;
  } catch (error) {
    console.error("Error creating quiz question:", error);
    throw error;
  }
}

//get all quiz questions
export const getAllQuizQuestions = async (category) => {
  try {
    const response = await apiConnector(
      "POST",
      getAllQuizQuestionsAPI,
      category,
      {
        "Content-Type": "application/json"
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in get all quiz questions API:", error);
    throw error;
  }
}
//delete quiz by title
export const deleteQuizByTitle = async (quizTitle) => {
  try {
    const response = await apiConnector("DELETE",deleteQuizByTitleAPI(quizTitle));
    return response.data;
  } catch (error) {
    console.error("Error in deleting quiz by title API:", error);
    throw error;
  }
}

//get all quizzes with category and questions
export const getAllQuizzesWithCategoryAndQuestions = async () => {
  try {
    const response = await apiConnector("GET", getAllQuizAPI);
    return response.data;
  } catch (error) {
    console.error("Error in fetching all quizzes API:", error);
    throw error;
  }
}
//extract questions from file
export const extractQuestionsFromFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiConnector("POST", extractQuestionsFromFileAPI, formData, {
      "Content-Type": "multipart/form-data"
    });
    return response.data;
  } catch (error) {
    console.error("Error extracting questions from file:", error);
    throw error;
  }
}
//get quiz by id
export const getQuizById = async (id) => {
  try {
    const response = await apiConnector("GET", getQuizByIdAPI(id));
    return response.data;
  } catch (error) {
    console.error("Error in fetching quiz by ID API:", error);
    throw error;
  }
}
//update quiz by id
export const updateQuizById = async (id, data) => {
  try {
    const response = await apiConnector("PATCH", updateQuizByIdAPI(id), data, {
      "Content-Type": "application/json"
    });
    return response.data;
  } catch (error) {
    console.error("Error in updating quiz by ID API:", error);
    throw error;
  }
}
//delete quiz by id
export const deleteQuizById = async (id) => {
  try {
    const response = await apiConnector("DELETE", deleteQuizByIdAPI(id));
    return response.data;
  } catch (error) {
    console.error("Error in deleting quiz by ID API:", error);
    throw error;
  }
}
export const updateApprovalStatusById = async (id, status) => {
  try {
    const response = await apiConnector(
      "PATCH",
      updateApprovalStatusByIdAPI(id),
      { approvalStatus: status },
      {
        "Content-Type": "application/json"
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in updating approval status by ID API:", error);
    throw error;
  }
};

//create quiz with AI generated questions
export const createQuizWithGeneratedQuestion = async (data) => {
  try {
    const response = await apiConnector("POST", createQuizWithAIAPI, data, {
      "Content-Type": "application/json"
    });
    return response.data;
  } catch (error) {
    console.error("Error creating quiz with AI generated questions:", error);
    throw error;
  }
}

//submit ai quiz 
export const submitAiQuiz = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("POST", submitAiQuizAPI, data, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });

    return response.data;
  } catch (error) {
    console.error("Error submitting AI-generated quiz:", error?.response?.data || error);
    throw error;
  }
};

//get result of the ai quiz
export const getQuizSubmission = async (resultId = null) => {
  try {
    const token = localStorage.getItem("token");

    const queryParams = resultId ? { resultId } : {};

    const response = await apiConnector("GET", getQuizSubmissionAPI, queryParams, {
      Authorization: `Bearer ${token}`,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching AI-generated quiz result:", error?.response?.data || error);
    throw error;
  }
};

//submit quiz of the instructor
export const submitQuiz = async (quizId, data) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiConnector(
      "POST",
      submitQuizAPI(quizId),
      data,
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error submitting quiz:", error?.response?.data || error);
    throw error;
  }
};
//get result
export const getQuizSubmissionById = async (resultId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiConnector(
      "GET",
      getQuizSubmissionByIdAPI(resultId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching quiz result:", error?.response?.data || error);
    throw error;
  }
};

//submit question report
export const submitQuestionReport = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const response = await apiConnector("POST", submitQuestionReportAPI, data, {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    });

    return response.data;
  } catch (error) {
    console.error("Error submitting question report:", error?.response?.data || error);
    throw error;
  }
};