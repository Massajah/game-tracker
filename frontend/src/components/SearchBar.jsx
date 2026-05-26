import { useEffect, useRef, useState } from "react";
import axios from "axios";
import StatusBadge, { statusConfig } from "./StatusBadge";
import { getOptimizedImage } from "../utils/images";

function SearchBar({
  addFromAPI,
  games,
  manualTitle,
  setManualTitle,
  manualStatus,
  setManualStatus,
  addManualGame,
  deleteGame,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [justAddedGameId, setJustAddedGameId] = useState(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [message, setMessage] = useState("");
  const [openAddMenuId, setOpenAddMenuId] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (search.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `https://api.rawg.io/api/games?key=${process.env.REACT_APP_RAWG_API_KEY}&search=${encodeURIComponent(search)}`
        );

        setResults(res.data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddGame = async (game, status) => {
    const result = await addFromAPI(game, status);

    if (result?.success) {
      setJustAddedGameId(game.id);
      setMessage("");

      setTimeout(() => {
        setJustAddedGameId(null);
      }, 2500);

      setTimeout(() => {
        setSearch("");
      }, 2000);
    } else if (result?.message) {
      setMessage(result.message);
    } else {
      setMessage("Something went wrong");
    }
  };

  const getExistingGame = (rawgId) => {
    return games.find((game) => game.rawgId === rawgId);
  };

  const handleRemoveGame = async (gameId) => {
  try {
    await deleteGame(gameId);
    setMessage("");
  } catch (error) {
    setMessage("Failed to remove game");
  }
};

  return (
    <div className="search-area" ref={searchRef}>
      <div className="search-bar-row">
        <div className="search-bar-wrapper">
          <h3 className="search-heading">Add games to your library</h3>
          <input
            className="search-input"
            type="text"
            placeholder="Search games from RAWG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {(loading || results.length > 0) && (
            <div className="search-results">
              {loading ? (
                <div className="search-result-item">Searching...</div>
              ) : (
                results.slice(0, 8).map((game) => {
                  const existingGame = getExistingGame(game.id);
                  const alreadyAdded = Boolean(existingGame);
                  const justAdded = justAddedGameId === game.id;

                  return (
                    <div
                      key={game.id}
                      className={`search-result-item ${alreadyAdded || justAdded ? "disabled" : ""
                        }`}
                     
                      disabled={alreadyAdded || justAdded}
                    >
                      {game.background_image && (
                        <img
                          src={getOptimizedImage(game.background_image)}
                          alt={game.name}
                          className="search-result-image"
                          loading="lazy"
                          decoding="async"
                        />
                      )}

                      <div className="search-result-info">
                        <span className="search-result-title">{game.name}</span>

                        {justAdded ? (
  <span className="search-result-added">
    Added to <StatusBadge status={existingGame.status} />
  </span>
) : alreadyAdded ? (
  <div className="search-result-existing">
    <span className="search-result-added">
      Already in <StatusBadge status={existingGame.status} />
    </span>

    <button
      type="button"
      className="search-result-remove-button"
      onClick={(e) => {
        e.stopPropagation();
        handleRemoveGame(existingGame._id);
      }}
    >
      Remove
    </button>
  </div>
) : (
  game.released && (
    <span className="search-result-meta">
      {game.released}
    </span>
  )
)}
                        {!alreadyAdded && !justAdded && (
  <div className="search-result-actions-container">
  <button
    type="button"
    className="search-result-add-toggle"
    onClick={(e) => {
      e.stopPropagation();
      setOpenAddMenuId(openAddMenuId === game.id ? null : game.id);
    }}
  >
    + Add
  </button>

  {openAddMenuId === game.id && (
    <div className="search-result-actions">
      {["wishlist", "backlog", "playing", "completed"].map((status) => {
        const config = statusConfig[status];

        return (
          <button
            key={status}
            type="button"
            className={`search-result-action-button ${config.className}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddGame(game, status);
              setOpenAddMenuId(null);
            }}
          >
            {config.icon}
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  )}
</div>
)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {message && <p className="search-message">{message}</p>}

<button
  type="button"
  className="manual-toggle-button"
  onClick={() => setShowManualAdd(!showManualAdd)}
>
  {showManualAdd
    ? "Hide manual add ▲"
    : "Can't find your game? Add manually ▼"}
</button>

{showManualAdd && (
      <div className="add-game-panel">
        <input
          className="add-game-input"
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          placeholder="Add game manually"
        />

        <select
          className="add-game-select"
          value={manualStatus}
          onChange={(e) => setManualStatus(e.target.value)}
        >
          <option value="wishlist">Wishlist</option>
          <option value="backlog">Backlog</option>
          <option value="playing">Playing</option>
          <option value="completed">Completed</option>
        </select>

        <button className="add-game-button" onClick={addManualGame}>
          Add
        </button>
      </div>
      )}
    </div>
  );
}

export default SearchBar;
