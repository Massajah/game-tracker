import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaList, FaStar, FaRobot } from "react-icons/fa";

function LoginPage({ setUser, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const googleButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
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
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoogleResponse = useCallback(
    async (response) => {
      try {
        setError("");

        const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Google login failed");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        navigate("/");
      } catch {
        setError("Google login failed. Please try again.");
      }
    },
    [navigate, setUser, setToken]
  );

  useEffect(() => {
    let intervalId;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        locale: "en",
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: googleButtonRef.current.offsetWidth,
      });

      clearInterval(intervalId);
    };

    renderGoogleButton();

    intervalId = setInterval(renderGoogleButton, 300);

    return () => clearInterval(intervalId);
  }, [handleGoogleResponse]);

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-badge">GameTracker</div>
        <h1>
          Track your games. <span>Find what to play next.</span>
        </h1>
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
          <h1 className="auth-title">Login</h1>
          <div className="auth-subtitle">
  <span>Welcome back!</span>
  <span>Sign in to continue your game journey.</span>
</div>

          {successMessage && (
            <div className="auth-success">{successMessage}</div>
          )}
          {error && <div className="auth-error">{error}</div>}

          <div className="google-login-wrapper">
            <div ref={googleButtonRef}></div>
          </div>

          <div className="auth-divider">
            <span>or</span>
          </div>

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
