
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Student Dashboard</h1>
      <h2>Welcome, {user?.name}!</h2>
      <p>You are logged in as a Student.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default StudentDashboard;
