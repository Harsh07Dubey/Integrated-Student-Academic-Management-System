
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setCreating(true);

    try {
      const response = await fetch(`${API_URL}/api/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_name: className,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create class");
      }

      setMessage(`Class created! Class code: ${data.class.class_code}`);
      setClassName("");
      await fetchClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="teacher-dashboard">
      <aside className="teacher-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">IS</div>
          <span>ISAMS</span>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

        <button
            className="sidebar-link active"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth"})}
        >
            Dashboard
        </button>

        <button
            className="sidebar-link"
            onClick={() =>
                document.getElementById("my-classes")?.scrollIntoView({
                    behavior: "smooth",
                })
            }
        >
            My Classes
        </button>

        <div className="sidebar-bottom">
          <div className="teacher-profile">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || "T"}
            </div>
            <div>
              <strong>{user?.name}</strong>
              <small>Teacher</small>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="teacher-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">TEACHER PORTAL</p>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>

          <div className="header-avatar">
            {user?.name?.charAt(0).toUpperCase() || "T"}
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <span>YOUR ACADEMIC WORKSPACE</span>
            <h2>Manage your classes with ease.</h2>
            <p>Create classes and share the class code with your students.</p>
          </div>
          <div className="welcome-icon">📚</div>
        </section>

        <section className="teacher-stats">
          <div className="stat-card">
            <span>Total Classes</span>
            <h2>{classes.length}</h2>
          </div>
          <div className="stat-card">
            <span>Total Students</span>
            <h2>
              {classes.reduce(
                (total, item) => total + Number(item.student_count || 0),
                0
              )}
            </h2>
          </div>
        </section>

        <section className="create-class-section">
          <div className="section-heading">
            <div>
              <h2>Create a Class</h2>
              <p>Set up a new class for your students.</p>
            </div>
          </div>

          <form className="create-class-form" onSubmit={handleCreateClass}>
            <input
              type="text"
              placeholder="Enter class name (e.g. DBMS - Semester 5)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              maxLength={150}
              required
            />

            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "+ Create Class"}
            </button>
          </form>

          {error && <div className="message error">{error}</div>}
          {message && <div className="message success">{message}</div>}
        </section>

        <section className="classes-section" id="my-classes">
          <div className="section-heading">
            <div>
              <h2>My Classes</h2>
              <p>Manage your created classes.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading classes...</p>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <span>📚</span>
              <h3>No classes yet</h3>
              <p>Create your first class to get started.</p>
            </div>
          ) : (
            <div className="class-grid">
              {classes.map((item) => (
                <div className="class-card" key={item.id}>
                  <div className="class-card-top">
                    <span className="class-icon">📖</span>
                    <span className="class-count">
                      {item.student_count || 0} Students
                    </span>
                  </div>

                  <h3>{item.class_name}</h3>

                  <p className="class-code-label">CLASS CODE</p>
                  <div className="class-code">{item.class_code}</div>

                  <button
                    className="view-students-button"
                    onClick={() =>
                      navigate(`/teacher/classes/${item.id}/students`)
                    }
                  >
                    View Students →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TeacherDashboard;
