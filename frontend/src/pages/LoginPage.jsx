import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function LoginPage({ setUser, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      navigate("/");
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
        <h1>Login</h1>
        <p>Welcome back to GameTracker.</p>

        {successMessage && <div className="auth-success">{successMessage}</div>}
        {error && <div className="auth-error">{error}</div>}

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
          placeholder="Your password"
          required
        />

        <button type="submit">Login</button>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
    </div>
  );
}

export default LoginPage;
