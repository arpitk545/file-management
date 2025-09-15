
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROLE_TYPES } from "../../lib/constants";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      switch (user.role) {
        case ROLE_TYPES.ADMIN:
          navigate("/admin/dashboard");
          break;
        case ROLE_TYPES.MANAGER:
          navigate("/manager/dashboard");
          break;
        case ROLE_TYPES.USER:
          navigate("/user/dashboard");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, navigate]);

  return null; 
}
