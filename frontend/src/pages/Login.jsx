import AuthLayout from "../components/AuthLayout";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = "";

function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    email: state?.email || "",
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
    <AuthLayout title="Sign in" description="Use your email and password to access ISAMS.">
      {state?.registered && <p className="message success" role="status">Account created. Sign in to continue.</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
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
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <div className="message error" role="alert">
            {error}
          </div>
        )}

        <button
          className="auth-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="switch-auth">
        Don't have an account?{" "}
        <Link to="/register">Create account</Link>
      </p>

    </AuthLayout>
  );
}

export default Login;
