
import { Navigate } from "react-router-dom";
import AuthCheck from "./AuthCheck";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return user.role === "STUDENT"
      ? <Navigate to="/student-dashboard" replace />
      : <Navigate to="/teacher-dashboard" replace />;
  }

  return (
    <>
      <AuthCheck />
      {children}
    </>
  );
}

export default ProtectedRoute;
