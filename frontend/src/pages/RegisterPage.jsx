import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaList, FaStar, FaRobot } from "react-icons/fa";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-badge">GameTracker</div>
        <h1>Track your games. Find what to play next.</h1>
        <p>
          Build your personal game library, manage your backlog, rate completed
          games, and get AI-powered recommendations.
        </p>

        <div className="auth-features">
          <div className="auth-feature">
            <FaList className="feature-icon" />
    <span>Organize wishlist, backlog and completed games</span>
          </div>
          <div className="auth-feature">
            <FaStar className="feature-icon" />
    <span>Rate and review your completed games</span>
            </div>
          <div className="auth-feature">
            <FaRobot className="feature-icon" />
    <span>Get AI-powered game suggestions</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <img
  src="/logo192.png"
  alt="GameTracker logo"
  className="auth-logo"
/>
          <h1 className="auth-title">Create account</h1>
          <div className="auth-subtitle">
  <span>Welcome!</span>
  <span>Create account to start building your library.</span>
</div>

          {error && <div className="auth-error">{error}</div>}

          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />

          <button type="submit">Register</button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
