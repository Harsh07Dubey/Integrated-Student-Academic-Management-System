
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store authentication details
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on user role
      if (data.user.role === "STUDENT") {
        navigate("/student-dashboard");
      } else if (data.user.role === "TEACHER") {
        navigate("/teacher-dashboard");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Invalid user role");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left branding panel */}
      <section className="brand-panel">
        <div className="brand-content">
          <div className="brand-logo">IS</div>
          <h1>ISAMS</h1>

          <h2>
            Your Academic Journey,
            <br />
            Organized.
          </h2>

          <p>
            A smarter way to manage classes, learning resources,
            attendance and academic progress.
          </p>

          <div className="brand-decoration">
            <span>LEARN</span>
            <span>CONNECT</span>
            <span>GROW</span>
          </div>
        </div>

        <div className="brand-footer">
          Integrated Student Academic Management System
        </div>
      </section>

      {/* Right login form */}
      <section className="form-panel">
        <div className="auth-form-wrapper">
          <div className="mobile-logo">
            <div className="brand-logo">IS</div>
            <span>ISAMS</span>
          </div>

          <div className="form-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="message error">
                {error}
              </div>
            )}

            <button
              className="auth-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              <span>→</span>
            </button>
          </form>

          <p className="switch-auth">
            Don't have an account?{" "}
            <Link to="/register">Create account</Link>
          </p>

          <p className="form-note">
            Secure academic access powered by ISAMS
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
