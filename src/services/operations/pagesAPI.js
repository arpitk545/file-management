import { apiConnector } from "../apiconnector";
import { getAboutUsAPI, updateAboutUsAPI,getContactUsAPI,updateContactUsAPI
, submitContactMessageAPI,getsubmittedContactMessagesAPI,deleteContactByEmailAPI
, getDisclaimerAPI, updateDisclaimerAPI,getPrivacyPolicyAPI,updatePrivacyPolicyAPI
} from "../apis";

// Get About Us content
export const getAboutUs = async () => {
  try {
    const response = await apiConnector("GET", getAboutUsAPI, null, {
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching About Us content:", error);
    throw error;
  }
}

// Update About Us content
export const updateAboutUs = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("PUT", updateAboutUsAPI, data, {
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating About Us content:", error);
    throw error;
  }
}

// Get Contact Us content
export const getContactUs = async () => {
  try {
    const response = await apiConnector("GET", getContactUsAPI, null, {
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Contact Us content:", error);
    throw error;
  }
}

// Update Contact Us content
export const updateContactUs = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("PUT", updateContactUsAPI, data, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating Contact Us content:", error);
    throw error;
  }
}

// submit contact form
export const submitContactForm = async (data) => {
  try {
    const response = await apiConnector("POST",  submitContactMessageAPI, data, {
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
}
// Get contact messages
export const getContactMessages = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("GET",getsubmittedContactMessagesAPI, null, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    throw error;
  }
}
// Delete contact message by email
export const deleteContactByEmail = async (email) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("DELETE", deleteContactByEmailAPI(email), {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting contact message:", error);
    throw error;
  }
}
//get disclaimer
export const getDisclaimer = async () => {
  try {
    const response = await apiConnector("GET", getDisclaimerAPI , null, {
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching disclaimer:", error);
    throw error;
  }
}
// Update disclaimer
export const updateDisclaimer = async (data) => {
    try {
        const token = localStorage.getItem("token");
        const response = await apiConnector("PUT",updateDisclaimerAPI, data, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating disclaimer:", error);
        throw error;
    }
}

//get privacy policy
export const getPrivacyPolicy = async () => {
  try {
    const response = await apiConnector("GET", getPrivacyPolicyAPI, null, {
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    throw error;
  }
}
//update privacy policy
export const updatePrivacyPolicy = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("PUT", updatePrivacyPolicyAPI, data, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating privacy policy:", error);
    throw error;
  }
}
