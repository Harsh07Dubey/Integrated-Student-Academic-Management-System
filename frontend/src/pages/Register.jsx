
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="brand-panel">
        <div className="brand-content">
          <div className="brand-logo">IS</div>
          <h1>ISAMS</h1>
          <h2>Start Your Academic<br />Journey Here.</h2>
          <p>
            Join your academic community, access learning
            resources and stay connected with your classes.
          </p>
          <div className="brand-decoration">
            <span>LEARN</span>
            <span>CONNECT</span>
            <span>GROW</span>
          </div>
        </div>
        <div className="brand-footer">Integrated Student Academic Management System</div>
      </section>

      <section className="form-panel">
        <div className="auth-form-wrapper">
          <div className="mobile-logo">
            <div className="brand-logo">IS</div>
            <span>ISAMS</span>
          </div>

          <div className="form-heading">
            <span className="eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Fill in your details to join the academic platform.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

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
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Register as</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            {error && <div className="message error">{error}</div>}

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
              <span>→</span>
            </button>
          </form>

          <p className="switch-auth">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="form-note">Secure academic access powered by ISAMS</p>
        </div>
      </section>
    </div>
  );
}

export default Register;
