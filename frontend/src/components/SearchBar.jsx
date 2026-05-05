import { useEffect, useState, useRef } from "react";
import axios from "axios";

function SearchBar({
  addFromAPI,
  games,
  manualTitle,
  setManualTitle,
  manualStatus,
  setManualStatus,
  addManualGame,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("wishlist");
  const [justAddedGameId, setJustAddedGameId] = useState(null);
  const [justAddedStatus, setJustAddedStatus] = useState("");
  const [message, setMessage] = useState("");
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
      } catch (error) {
        console.error("Search error:", error);
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

  const handleAddGame = async (game) => {
  const result = await addFromAPI(game, selectedStatus);

  if (result?.success) {
    setJustAddedGameId(game.id);
    setJustAddedStatus(selectedStatus);

    setTimeout(() => {
      setJustAddedGameId(null);
      setJustAddedStatus("");
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
  return games.find((g) => g.rawgId === rawgId);
};

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

  return (
    <div className="search-area" ref={searchRef}>
      <div className="search-bar-row">
        <div className="search-bar-wrapper">
          <input
            className="search-input"
            type="text"
            placeholder="Search games..."
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
    <button
      key={game.id}
      className={`search-result-item ${alreadyAdded || justAdded ? "disabled" : ""}`}
      onClick={() => !alreadyAdded && !justAdded && handleAddGame(game)}
      disabled={alreadyAdded || justAdded}
    >
      {game.background_image && (
        <img
          src={game.background_image}
          alt={game.name}
          className="search-result-image"
        />
      )}

      <div className="search-result-info">
        <span className="search-result-title">{game.name}</span>

        {justAdded ? (
  <span className="search-result-added">
    Added to {formatStatus(justAddedStatus)}
  </span>
) : alreadyAdded ? (
  <span className="search-result-added">
    Already added ({formatStatus(existingGame.status)})
  </span>
) : (
  game.released && (
    <span className="search-result-meta">{game.released}</span>
  )
)}

      </div>
    </button>
  );
})
              )}
            </div>
          )}
        </div>

        <select
          className="search-status-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="wishlist">Wishlist</option>
          <option value="backlog">Backlog</option>
          <option value="playing">Playing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {message && <p className="search-message">{message}</p>}

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
    </div>
  );
}

export default SearchBar;
