import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { logout } from "../services/operations/authAPI";

export const useAutoLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            dispatch(logout(navigate));
          }
        } catch (error) {
          console.error("Invalid token:", error);
          dispatch(logout(navigate));
        }
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dispatch, navigate]);
};
