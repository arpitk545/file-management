// src/pages/OAuthHandler.jsx

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../../components/slices/authSlice";
import toast from "react-hot-toast";
import {jwtDecode} from "jwt-decode"; 
import { googleauthAPI } from "../apis";
import { ROLE_TYPES } from "../../lib/constants";

// This is a pure function for redirecting to Google OAuth URL
export const googleLogin = (role = "user") => {
  const redirectUrl = `${googleauthAPI}?state=${role}`;
  window.location.href = redirectUrl;
};

const OAuthHandler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");
    const email = params.get("email");

    const handleOAuthLogin = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.isBlocked) {
            toast.error("You are blocked by the admin.");
            navigate("/login");
            return;
          }

          dispatch(setToken(token));
          dispatch(setUser(decoded));
          localStorage.setItem("token", token);

          toast.success("Login successful");

          // Role based navigation
          const role = decoded.role;

          if (role === ROLE_TYPES.ADMIN) {
            window.location.href = "/admin/dashboard";
          } else if (role === ROLE_TYPES.MANAGER) {
            window.location.href = "/manager/dashboard";
          } else if (role === ROLE_TYPES.USER) {
            window.location.href = "/user/dashboard";
          } else {
            window.location.href = "/";
          }
        } catch (err) {
          console.error("Token decoding failed:", err);
          toast.error("Invalid token");
          navigate("/login");
        }
      } else if (email) {
        navigate(`/complete-registration?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(error || "OAuth failed or was cancelled.");
        navigate("/login");
      }
    };

    handleOAuthLogin();
  }, [location, dispatch, navigate]);

  return <div className="text-white">Processing OAuth Login...</div>;
};

export default OAuthHandler;
