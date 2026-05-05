import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ user, logout, stats, theme, setTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="mobile-topbar">
        <div className="mobile-logo">
          <div className="logo-mark">GT</div>
          <span>GameTracker</span>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(true)}
        >
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-mark">GT</div>

            <div>
              <h2>GameTracker</h2>
              <p>Personal game library</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" onClick={closeMobileMenu}>Home</NavLink>
            <NavLink to="/wishlist" onClick={closeMobileMenu}>Wishlist</NavLink>
            <NavLink to="/backlog" onClick={closeMobileMenu}>Backlog</NavLink>
            <NavLink to="/playing" onClick={closeMobileMenu}>Playing</NavLink>
            <NavLink to="/completed" onClick={closeMobileMenu}>Completed</NavLink>
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
                <span>⭐ Avg rating</span>
                <strong>{stats.averageRating}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="theme-toggle">
            <span className="theme-toggle-label">Appearance</span>

            <div className="theme-options">
              <button
                className={theme === "light" ? "active" : ""}
                onClick={() => setTheme("light")}
              >
                Light
              </button>

              <button
                className={theme === "dark" ? "active" : ""}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="sidebar-footer">
            {user && (
              <div className="sidebar-user">
                <span className="sidebar-user-label">Signed in as</span>
                <strong>{user.username}</strong>
              </div>
            )}

            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;