import { BookOpen, CalendarDays, ClipboardCheck, GraduationCap } from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load classes");
      }

      setClasses(Array.isArray(data.classes) ? data.classes : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setJoining(true);

    try {
      const response = await fetch(`${API_URL}/api/classes/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_code: classCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to join class");
      }

      setMessage(data.message || "Successfully joined class!");
      setClassCode("");
      await fetchClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };


  return (
    <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">STUDENT PORTAL</p>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>

          <div className="header-avatar">
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <h2>Your classes and schedule</h2>
            <p>Access your classes and stay connected with your teachers.</p>
          </div>
          <GraduationCap className="welcome-icon" size={50} aria-hidden="true" />
        </section>

        <nav className="dashboard-shortcuts" aria-label="Quick actions">
          <button onClick={() => navigate("/timetable")}><CalendarDays size={19} /> Timetable</button>
          <button onClick={() => navigate("/attendance")}><ClipboardCheck size={19} /> Attendance</button>
        </nav>

        <section className="teacher-stats">
          <div className="stat-card">
            <span>Enrolled Classes</span>
            <h2>{classes.length}</h2>
          </div>

        </section>

        <section className="create-class-section">
          <div className="section-heading">
            <div>
              <h2>Join a Class</h2>
              <p>Enter the class code shared by your teacher.</p>
            </div>
          </div>

          <form className="create-class-form" onSubmit={handleJoinClass}>
            <input
              type="text"
              aria-label="Class code"
              placeholder="Enter class code (e.g. B39EEBD2)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              maxLength={20}
              required
            />

            <button type="submit" disabled={joining}>
              {joining ? "Joining..." : "Join Class"}
            </button>
          </form>

          {error && <div className="message error">{error}</div>}
          {message && <div className="message success">{message}</div>}
        </section>

        <section className="classes-section" id="student-classes">
          <div className="section-heading">
            <div>
              <h2>My Classes</h2>
              <p>All your enrolled classes in one place.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading classes...</p>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={30} aria-hidden="true" />
              <h3>No classes joined yet</h3>
              <p>Enter a class code above to join your first class.</p>
            </div>
          ) : (
            <div className="class-grid">
              {classes.map((item) => (
                <div className="class-card" key={item.id}>
                  <div className="class-card-top">
                    <BookOpen className="class-icon" size={21} aria-hidden="true" />
                    <span className="class-count">Enrolled</span>
                  </div>

                  <h3>{item.class_name}</h3>

                  <p className="class-code-label">TEACHER</p>
                  <div className="student-teacher-name">
                    {item.teacher_name || "Teacher"}
                  </div>

                  <p className="class-code-label">CLASS CODE</p>
                  <div className="class-code">{item.class_code}</div>
                </div>
              ))}
            </div>
          )}
        </section>
    </div>
  );
}

export default StudentDashboard;
