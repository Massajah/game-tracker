import { useEffect, useState } from "react";
import logo from "../assets/GT_logo.png";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaHeart,
  FaBook,
  FaGamepad,
  FaTrophy,
  FaCog,
} from "react-icons/fa";

function Sidebar({ user, logout, stats, theme, setTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  return (
    <>
      <div className="mobile-topbar">
        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-controls="app-sidebar"
          aria-expanded={mobileMenuOpen}
        >
          <FaBars aria-hidden="true" />
        </button>

        <div className="mobile-logo">
          <div className="logo-mark"><img src={logo} alt="GameTracker" /></div>
          <span>GameTracker</span>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}

      <aside
        className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
        id="app-sidebar"
      >
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-mark"><img src={logo} alt="GameTracker" /></div>

            <div>
              <h2>GameTracker</h2>
              <p>Personal game library</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" onClick={closeMobileMenu}>
              <FaHome />
              <span>Home</span>
            </NavLink>
            <NavLink to="/wishlist" onClick={closeMobileMenu}>
              <FaHeart />
              <span>Wishlist</span>
            </NavLink>
            <NavLink to="/backlog" onClick={closeMobileMenu}>
              <FaBook />
              <span>Backlog</span>
            </NavLink>
            <NavLink to="/playing" onClick={closeMobileMenu}>
              <FaGamepad />
              <span>Playing</span>
            </NavLink>
            <NavLink to="/completed" onClick={closeMobileMenu}>
              <FaTrophy />
              <span>Completed</span>
            </NavLink>
          </nav>

          {stats && (
            <div className="sidebar-stats">
              <h3>Library Overview</h3>

              <div className="sidebar-stat-main">
                <strong>{stats.total}</strong>
                <span>Total games</span>
              </div>

              <div className="sidebar-stat-grid">
                <div>
                  <strong>{stats.wishlist}</strong>
                  <span>Wishlist</span>
                </div>

                <div>
                  <strong>{stats.backlog}</strong>
                  <span>Backlog</span>
                </div>

                <div>
                  <strong>{stats.playing}</strong>
                  <span>Playing</span>
                </div>

                <div>
                  <strong>{stats.completed}</strong>
                  <span>Completed</span>
                </div>
              </div>

              <div className="sidebar-rating">
                <span>Avg rating</span>
                <strong>{stats.averageRating}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-bottom">

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-settings-link ${isActive ? "active" : ""}`
            }
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>

          <div className="sidebar-footer">
            {user && (
              <div className="sidebar-user">
                <span className="sidebar-user-label">Signed in as</span>
                <strong>{user.username}</strong>
              </div>
            )}

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
