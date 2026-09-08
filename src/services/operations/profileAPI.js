import { apiConnector } from "../apiconnector";
import {upsertProfileAPI , getMyProfileAPI,updateProfileAPI,getManagersAndUsersAPI,blockOrUnblockUserAPI} from "../apis";

// Upsert profile
export const upsertProfile = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("POST", upsertProfileAPI, data,{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    });
    return response.data;
  } catch (error) {
    console.error("Error upserting profile:", error);
    throw error;
  }
}

// Get my profile
export const getMyProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("GET", getMyProfileAPI, null, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}
// Update profile
export const updateProfile = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("PUT", updateProfileAPI, data, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
// Get managers and users
export const getManagersAndUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("GET", getManagersAndUsersAPI, null, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching managers and users:", error);
    throw error;
  }
}
// Block or unblock user
export const blockOrUnblockUser = async ({ email, role, block }) => {
  try {
    const token = localStorage.getItem("token");

    const response = await apiConnector(
      "PATCH",
     blockOrUnblockUserAPI, 
      { email, role, block },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error blocking or unblocking user:", error);
    throw error;
  }
};
