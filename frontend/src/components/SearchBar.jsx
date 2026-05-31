import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import StatusBadge, { statusConfig } from "./StatusBadge";
import { getOptimizedImage } from "../utils/images";
import { FaSearch } from "react-icons/fa";
import getErrorMessage from "../utils/errors";

const normalize = (text = "") =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

const sortResults = (results, query) => {
  const normalizedQuery = normalize(query);

  return [...results].sort((a, b) => {
    const score = (game) => {
      const name = normalize(game.name);
      let points = 0;

      if (name === normalizedQuery) points += 100000;
      if (name.includes(normalizedQuery)) points += 50000;

      const queryWords = normalizedQuery.match(/[a-z0-9]+/g) || [];
      queryWords.forEach((word) => {
        if (word.length >= 3 && name.includes(word)) {
          points += 5000;
        }
      });

      points += Math.min(game.added || 0, 20000);
      points += (game.metacritic || 0) * 100;

      return points;
    };

    return score(b) - score(a);
  });
};

function SearchBar({
  addFromAPI,
  games,
  manualTitle,
  setManualTitle,
  manualStatus,
  setManualStatus,
  addManualGame,
  deleteGame,
  openGameDetails,
  appMessage,
  setAppMessage,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [justAddedGameId, setJustAddedGameId] = useState(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [message, setMessage] = useState("");
  const [openAddMenuId, setOpenAddMenuId] = useState(null);
  const searchRef = useRef(null);

  const fetchSearchResults = useCallback(async (query) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      const searchRawg = async (searchTerm) => {
        const res = await axios.get(
          `https://api.rawg.io/api/games?key=${process.env.REACT_APP_RAWG_API_KEY
          }&search=${encodeURIComponent(searchTerm)}&page_size=20`
        );

        return res.data.results || [];
      };

      let results = await searchRawg(trimmedQuery);

      if (trimmedQuery.includes(" ")) {
        const firstWord = trimmedQuery.split(" ")[0];
        const fallbackResults = await searchRawg(firstWord);

        const mergedResults = [...results, ...fallbackResults];

        const uniqueResults = Array.from(
          new Map(mergedResults.map((game) => [game.id, game])).values()
        );

        results = uniqueResults;
      }

      setResults(sortResults(results, trimmedQuery));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSearchResults(search);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search, fetchSearchResults]);

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
      setMessage("Failed to add game.");
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
      setMessage(
        getErrorMessage(error, "Failed to remove game.")
      );
    }
  };

  const createPreviewGame = (game) => {
    const existingGame = getExistingGame(game.id);

    return {
      title: game.name,
      image: game.background_image || null,
      rawgId: game.id,
      released: game.released || null,
      rating: null,
      status: null,
      existingStatus: existingGame?.status || null,
      genres: game.genres?.map((genre) => genre.name) || [],
      platforms: game.platforms?.map((p) => p.platform.name) || [],
      description: game.description_raw || "",
      isPreview: true,
    };
  };

  return (
    <div className="search-area" ref={searchRef}>
      <div className="search-bar-row">
        <div className="search-bar-wrapper">
          <h3 className="search-heading">Add games to your library</h3>
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  fetchSearchResults(search);
                }
              }}
              placeholder="Search games..."
              className="search-input"
            />
          </div>

          {loading && (
            <div className="search-results">
              <div className="search-result-item">Searching...</div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results">
              {results.slice(0, 15).map((game) => {
                const existingGame = getExistingGame(game.id);
                const alreadyAdded = Boolean(existingGame);
                const justAdded = justAddedGameId === game.id;



                return (
                  <div
                    key={game.id}
                    className={`search-result-item ${alreadyAdded || justAdded ? "disabled" : ""
                      }`}
                    onClick={() => openGameDetails(createPreviewGame(game))}
                  ><div className="search-result-main">
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
                              className={`search-result-add-toggle ${openAddMenuId === game.id ? "open" : ""
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenAddMenuId(openAddMenuId === game.id ? null : game.id);
                              }}
                            >
                              {openAddMenuId === game.id ? "X Close" : "+ Add"}
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
                  </div>
                );
              })}

            </div>
          )}
          {!loading &&
            search.trim().length >= 2 &&
            results.length === 0 && (
              <div className="search-empty-message">
                No games found. Try another search term or add it manually.
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

      {
        showManualAdd && (
          <>
            <div className="add-game-panel">
              <input
                className="add-game-input"
                value={manualTitle}
                onChange={(e) => {
                  setManualTitle(e.target.value);
                  setAppMessage?.(null);
                }}
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

            {appMessage && (
              <div className={`app-message ${appMessage.type}`}>
                {appMessage.text}
              </div>
            )}
          </>
        )
      }
    </div >
  );
}

export default SearchBar;
