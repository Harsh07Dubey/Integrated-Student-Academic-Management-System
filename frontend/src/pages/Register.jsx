import AuthLayout from "../components/AuthLayout";
import { authRequest } from "../authRequest";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
      await authRequest("register", form, "Registration failed");

      navigate("/login", { replace: true, state: { email: form.email, registered: true } });
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" description="Choose your role and enter your account details.">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            name="name"
            autoComplete="name"
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
            autoComplete="new-password"
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

        {error && <div className="message error" role="alert">{error}</div>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="switch-auth">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

    </AuthLayout>
  );
}

export default Register;
