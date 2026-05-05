import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
      const res = await fetch("http://localhost:5000/auth/register", {
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
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-hero">
      <div className="auth-hero-badge">🎮 GameTracker</div>
      <h1>Track your games. Find what to play next.</h1>
      <p>
        Build your personal game library, manage your backlog, rate completed
        games, and get AI-powered recommendations.
      </p>

      <div className="auth-features">
        <div className="auth-feature">✓ Organize wishlist, backlog and completed games</div>
        <div className="auth-feature">✓ Rate and review your completed games</div>
        <div className="auth-feature">✓ Get AI-powered game suggestions</div>
      </div>
    </div>

    <div className="auth-form-side">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Start tracking your game library.</p>

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
