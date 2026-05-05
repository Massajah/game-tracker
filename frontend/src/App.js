import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import SearchBar from "./components/SearchBar";
import GameDetailsModal from "./components/GameDetailsModal";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import StatusPage from "./pages/StatusPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

useEffect(() => {
  document.body.className = theme;
  localStorage.setItem("theme", theme);
}, [theme]);

  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const getAuthConfig = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);

  const fetchGames = useCallback(async () => {
    if (!token) {
      setGames([]);
      return;
    }

    const res = await axios.get("http://localhost:5000/games", getAuthConfig());
    setGames(res.data);
  }, [getAuthConfig, token]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);


  const addGame = async () => {
    if (!title.trim()) return;

    await axios.post(
      "http://localhost:5000/games",
      {
        title,
        status,
      },
      getAuthConfig()
    );

    setTitle("");
    setStatus("wishlist");
    fetchGames();
  };

  const addFromAPI = async (game, selectedStatus) => {
    try {
      await axios.post(
        "http://localhost:5000/games",
        {
          title: game.name,
          rawgId: game.id,
          image: game.background_image,
          status: selectedStatus,
        },
        getAuthConfig()
      );

      fetchGames();

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
      `http://localhost:5000/games/${id}`,
      {
        status: newStatus,
      },
      getAuthConfig()
    );
    fetchGames();
  };

  const deleteGame = async (id) => {
    await axios.delete(`http://localhost:5000/games/${id}`, getAuthConfig());
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
  } catch (error) {
    console.error("Failed to fetch game details:", error);
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
      `http://localhost:5000/games/${id}`,
      {
        userRating,
        notes,
      },
      getAuthConfig()
    );

    setGames((prevGames) =>
      prevGames.map((game) =>
        game._id === id ? res.data : game
      )
    );

    setSelectedGame(res.data);

    return { success: true };
  } catch (error) {
    console.error("Failed to save review:", error);
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

  const stats = {
  total: games.length,
  wishlist: games.filter((game) => game.status === "wishlist").length,
  backlog: games.filter((game) => game.status === "backlog").length,
  playing: games.filter((game) => game.status === "playing").length,
  completed: games.filter((game) => game.status === "completed").length,
  averageRating:
    games.filter((game) => game.userRating).length > 0
      ? (
          games
            .filter((game) => game.userRating)
            .reduce((sum, game) => sum + game.userRating, 0) /
          games.filter((game) => game.userRating).length
        ).toFixed(1)
      : "-",
};

  return (
  <div className={isAuthPage ? "auth-layout" : "app-layout"}>
  {!isAuthPage && 
    <Sidebar 
      user={user} 
      logout={logout} 
      stats={stats}
      theme={theme}
      setTheme={setTheme}
    />}

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
            />
          </div>
        </>
      )}

      <Routes>

      <Route 
        path="/login" 
        element={<LoginPage setUser={setUser} setToken={setToken} />} />

      <Route
      path="/register"
      element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute token={token}>
            <HomePage
              games={games}
              openGameDetails={openGameDetails}
              fetchGames={fetchGames}
              token={token}
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
    />
  </div>
);
}

export default App;
