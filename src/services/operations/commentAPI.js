import { apiConnector } from "../apiconnector";
import {createCommentAPI,getAllCommentbyIdAPI , getAllCommentsAPI, changeCommentStatusAPI, deleteCommentAPI} from "../apis";

// Create a new comment
export const createComment = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("POST",createCommentAPI, data,{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
}

//get all comment by id
export const getAllCommentsById = async (refId) => {
  try {
    const response = await apiConnector("GET", getAllCommentbyIdAPI(refId));
    
    return {
      success: true,
      comments: response?.data?.data || [],
    };
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Unable to fetch comments",
      error,
    };
  }
};

//get comment 
export const getAllComments = async () => {
  try {
    const response = await apiConnector("GET", getAllCommentsAPI);
    return { success: true, comments: response.data };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};

export const changeCommentStatus = async (data) => {
  try {
    const response = await apiConnector("PUT",changeCommentStatusAPI, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
}
export const deleteComment = async ({ name, content, email }) => {
  try {
    const url = deleteCommentAPI(name, content, email);
    const response = await apiConnector("DELETE", url);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};