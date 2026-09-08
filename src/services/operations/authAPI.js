import { apiConnector } from "../apiconnector";
import { signupAPI,loginAPI,changePasswordAPI,forgotPasswordAPI } from "../apis";
import { setToken, setUser } from "../../components/slices/authSlice";
import { toast } from "react-hot-toast";

export const singup =async (formData)=>{
    try{
        const response =await apiConnector("POST",signupAPI,formData,{
            "Content-Type": "application/json"
        });
        return response.data;
    }catch(error){
        console.error("Error in signup API:", error);
        throw error;
    }
}

//login api response 

export const login =async (formData)=>{
    try{
        const response =await apiConnector("POST",loginAPI,formData,{
            "Content-Type": "application/json"
        });
        return response.data;
    }catch(error){
        console.error("Error in login API:", error);
        throw error;
    }
}
//change password api response
export const changePassword = async (formData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await apiConnector("POST", changePasswordAPI, formData, {
         Authorization: `Bearer ${token}`,   
        "Content-Type": "application/json",
        });
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
}

//forgot password api response
export const forgotPasswordNew = async (formData) => {
    try {
        const response = await apiConnector("POST", forgotPasswordAPI, formData, {
        "Content-Type": "application/json",
        });
        return response.data;
    } catch (error) {
        console.error("Error in forgot password API:", error);
        throw error;
    }
}

//logout api response 
export function logout(navigate) {
    return (dispatch) => {
      dispatch(setToken(null))
      dispatch(setUser(null))
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      toast.success("Logged Out")
      navigate("/")
    }
  }
