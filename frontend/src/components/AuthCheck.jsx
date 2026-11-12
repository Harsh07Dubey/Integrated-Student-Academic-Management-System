
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function AuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/auth/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Session validation failed:", error);
      }
    };

    validateSession();
  }, [navigate]);

  return null;
}

export default AuthCheck;
