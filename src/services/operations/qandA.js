import { apiConnector } from "../apiconnector";
import {createQuestionTypeRegionAPI ,getAllQuestionTypeRegionAPI, getMyCreatedQAndAAPI,
updateQuestionTypeRegionAPI,deleteQuestionTypeRegionAPI,createQAndAAPI,getAllQAndAAPI,
getQAndAByIdAPI,addQuestionToQandaAPI,updateQAndAAPI,deleteQAndAAPI,reportQuestionAPI,reportAnswerAPI,
 updateReportStatusAPI,
 createQuestionTypeAPI,
 getAllQuestionTypeAPI,
 updateQuestionTypeAPI,
 deleteQuestionTypeAPI

} from "../apis";


export const createQAndARegion = async (data) => {
  try {
    const response = await apiConnector("POST",createQuestionTypeRegionAPI, data);
    return response.data;
  } catch (error) {
    console.error("Error creating quiz region:", error);
    throw error;
  }
}

//get all qandq regions
export const getAllQandARegions = async () => {
    try {
            const response = await apiConnector("GET", getAllQuestionTypeRegionAPI, null, {
            "Content-Type": "application/json"
            });
            return response.data;
            } catch (error) {
            console.error("Error in get region API:", error);
            throw error;
    }
}

export const updateQandARegion = async (name, updateData) => {
    try {
    const response = await apiConnector(
      "PATCH",
      updateQuestionTypeRegionAPI(name),
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

//delete qandA region by name
export const deleteQandARegion = async (name) => {
  try {
    const response = await apiConnector("DELETE", deleteQuestionTypeRegionAPI(name));
    return response.data;
  } catch (error) {
    console.error("Error in delete region API:", error);
   throw error;
  }
}
//create question type
export const createQuestionType = async (data) => {
  try {
    const response = await apiConnector("POST", createQuestionTypeAPI, data,{
        "Content-Type": "application/json",
    });
    return response.data;
  }
    catch (error) {
    console.error("Error creating Question Type :", error);
    throw error;
  }
}
//get all question types
export const getAllQuestionTypes = async () => {
  try {
    const response = await apiConnector("GET", getAllQuestionTypeAPI, null, {
      "Content-Type": "application/json",
    });
    return response.data;
  }
    catch (error) {
    console.error("Error in get all Question Types API:", error);
    throw error;
  }
}
//update question type by id
export const updateQuestionType = async (id, data) => {
  try {
    const response = await apiConnector("PUT", updateQuestionTypeAPI(id), data,{
        "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error updating Question Type :", error);
    throw error;
  }
}
//delete question type by id
export const deleteQuestionType = async (id) => {
  try {
    const response = await apiConnector("DELETE", deleteQuestionTypeAPI(id),{
        "Content-Type": "application/json",
    });
    return response.data;
  }
    catch (error) {
    console.error("Error deleting Question Type :", error);
    throw error;
  }
}

//create QandA
export const createQandA = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("POST", createQAndAAPI, data,{
        "Authorization": `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating QandA :", error);
    throw error;
  }
}
//get all QandA
export const getAllQandA = async () => {
  try {
    const response = await apiConnector("GET", getAllQAndAAPI, null, {
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error in get all QandA API:", error);
    throw error;
  }
}
//get my created QandA
export const getMyCreatedQandA = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await apiConnector("GET", getMyCreatedQAndAAPI, null, {
          // "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        });
        return response.data;
      } catch (error) {
        console.error("Error in get my created QandA API:", error);
        throw error;
      }
}

//get all qanda by id 
export const getallqnadabyId =async (id)=>{
    try {
        const response = await apiConnector("GET",getQAndAByIdAPI(id), null, {
          "Content-Type": "application/json",
        });
        return response.data;
      } catch (error) {
        console.error("Error in get QandA by id API:", error);
        throw error;
      }
}

//add question to QandA
export const addQuestionToQanda = async (id, data) => {
  try {
    const response = await apiConnector("POST",addQuestionToQandaAPI(id), data,{
       "Content-Type": "multipart/form-data",
    });
    return response.data;
  } catch (error) {
    console.error("Error adding question to QandA :", error);
    throw error;
  }
}

//update QandA by id
export const updateQandA = async (id, data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("PUT", updateQAndAAPI(id), data,{
        // "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating QandA :", error);
    throw error;
  }
}
//delete QandA by id
export const deleteQandA = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("DELETE",  deleteQAndAAPI(id),{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting QandA :", error);
    throw error;
  }
}

//report question
export const reportQuestion = async (qandaId,questionId, data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("POST", reportQuestionAPI(qandaId,questionId), data,{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error reporting question :", error);
    throw error;
  }
}

//report answer
export const reportAnswer = async (qandaId, questionId, data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("POST", reportAnswerAPI(qandaId, questionId), data,{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error reporting answer :", error);
    throw error;
  }
}

//update report status
export const updateReportStatus = async (qandaId, questionId, data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("PATCH", updateReportStatusAPI(qandaId, questionId), data,{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating report status :", error);
    throw error;
  }
}