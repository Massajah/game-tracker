import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import GameDetailsModal from "./components/GameDetailsModal";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import StatusPage from "./pages/StatusPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

const ProtectedRoute = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [games, setGames] = useState([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("wishlist");
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [appMessage, setAppMessage] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const getAuthConfig = useCallback(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const fetchGames = useCallback(async () => {
    if (!token) {
      setGames([]);
      return;
    }

    const res = await axios.get(`${process.env.REACT_APP_API_URL}/games`, getAuthConfig());
    setGames(res.data);
  }, [getAuthConfig, token]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (!appMessage) return;

    const timer = setTimeout(() => {
      setAppMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [appMessage]);

  const addGame = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setAppMessage({
        type: "error",
        text: "Please enter a game title.",
      });
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/games`,
        {
          title: trimmedTitle,
          status,
        },
        getAuthConfig()
      );

      setTitle("");
      setStatus("wishlist");
      await fetchGames();

      setAppMessage({
        type: "success",
        text: `${trimmedTitle} added to ${status}.`,
      });
    } catch (error) {
      setAppMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to add game.",
      });
    }
  };

  const addFromAPI = async (game, selectedStatus) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/games`,
        {
          title: game.name,
          rawgId: game.id,
          image: game.background_image,
          status: selectedStatus,
          released: game.released || null,
          metacritic: game.metacritic || null,
          genres: game.genres?.map((genre) => genre.name) || [],
          platforms: game.platforms?.map((p) => p.platform.name) || [],
        },
        getAuthConfig()
      );

      await fetchGames();

      return { success: true };
    } catch (error) {
      if (error.response?.status === 409) {
        return {
          success: false,
          message: "Game already exists in your list",
        };
      }

      return {
        success: false,
        message: "Failed to add game",
      };
    }
  };

  const updateStatus = async (id, newStatus) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/games/${id}`,
      {
        status: newStatus,
      },
      getAuthConfig()
    );
    fetchGames();
  };

  const deleteGame = async (id) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/games/${id}`, getAuthConfig());
    fetchGames();
  };

  const openGameDetails = async (game) => {
    setSelectedGame(game);
    setGameDetails(null);

    if (!game.rawgId) return;

    try {
      setDetailsLoading(true);

      const res = await axios.get(
        `https://api.rawg.io/api/games/${game.rawgId}?key=${process.env.REACT_APP_RAWG_API_KEY}`
      );

      setGameDetails(res.data);
    } catch {
      setGameDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeGameDetails = () => {
    setSelectedGame(null);
    setGameDetails(null);
    setDetailsLoading(false);
  };

  const saveGameReview = async (id, userRating, notes) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/games/${id}`,
        {
          userRating,
          notes,
        },
        getAuthConfig()
      );

      setGames((prevGames) =>
        prevGames.map((game) => (game._id === id ? res.data : game))
      );
      setSelectedGame(res.data);

      return { success: true };
    } catch {
      return {
        success: false,
        message: "Failed to save review",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const stats = useMemo(() => {
    const ratedGames = games.filter((game) => game.userRating);

    return {
      total: games.length,
      wishlist: games.filter((game) => game.status === "wishlist").length,
      backlog: games.filter((game) => game.status === "backlog").length,
      playing: games.filter((game) => game.status === "playing").length,
      completed: games.filter((game) => game.status === "completed").length,
      averageRating:
        ratedGames.length > 0
          ? (
            ratedGames.reduce((sum, game) => sum + game.userRating, 0) /
            ratedGames.length
          ).toFixed(1)
          : "-",
    };
  }, [games]);

  return (
    <div className={isAuthPage ? "auth-layout" : "app-layout"}>
      {!isAuthPage && (
        <Sidebar
          user={user}
          logout={logout}
          stats={stats}
          theme={theme}
          setTheme={setTheme}
        />
      )}

      <main className={isAuthPage ? "auth-main" : "main-content"}>
        {!isAuthPage && (
          <>
            <Header />

            <div className="top-bar">
              <SearchBar
                addFromAPI={addFromAPI}
                games={games}
                manualTitle={title}
                setManualTitle={setTitle}
                manualStatus={status}
                setManualStatus={setStatus}
                addManualGame={addGame}
                deleteGame={deleteGame}
                openGameDetails={openGameDetails}
                appMessage={appMessage}
                setAppMessage={setAppMessage}
              />
            </div>
          </>
        )}

        <Routes>
          <Route
            path="/login"
            element={<LoginPage setUser={setUser} setToken={setToken} />}
          />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute token={token}>
                <HomePage
                  games={games}
                  openGameDetails={openGameDetails}
                  fetchGames={fetchGames}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute token={token}>
                <StatusPage
                  title="Wishlist"
                  status="wishlist"
                  games={games}
                  updateStatus={updateStatus}
                  deleteGame={deleteGame}
                  openGameDetails={openGameDetails}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/backlog"
            element={
              <ProtectedRoute token={token}>
                <StatusPage
                  title="Backlog"
                  status="backlog"
                  games={games}
                  updateStatus={updateStatus}
                  deleteGame={deleteGame}
                  openGameDetails={openGameDetails}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/playing"
            element={
              <ProtectedRoute token={token}>
                <StatusPage
                  title="Playing"
                  status="playing"
                  games={games}
                  updateStatus={updateStatus}
                  deleteGame={deleteGame}
                  openGameDetails={openGameDetails}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/completed"
            element={
              <ProtectedRoute token={token}>
                <StatusPage
                  title="Completed"
                  status="completed"
                  games={games}
                  updateStatus={updateStatus}
                  deleteGame={deleteGame}
                  openGameDetails={openGameDetails}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <GameDetailsModal
        game={selectedGame}
        details={gameDetails}
        loading={detailsLoading}
        onClose={closeGameDetails}
        saveGameReview={saveGameReview}
        addFromAPI={addFromAPI}
      />
    </div>
  );
}

export default App;
