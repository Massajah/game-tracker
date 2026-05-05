import { useEffect, useMemo, useRef, useState } from "react";

function HomePage({ games, openGameDetails, fetchGames, token }) {
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [recentAIRecommendations, setRecentAIRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAddingAIRecommendation, setIsAddingAIRecommendation] = useState(false);
  const [isAIRecommendationAdded, setIsAIRecommendationAdded] = useState(false);
  const [aiAddFeedback, setAiAddFeedback] = useState(null);
  const aiAddFeedbackTimerRef = useRef(null);

  const playingGames = games
    .filter((game) => game.status === "playing")
    .slice(0, 4);

  const recentGames = [...games]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const topRatedGames = [...games]
    .filter((game) => game.userRating)
    .sort((a, b) => b.userRating - a.userRating)
    .slice(0, 4);

  const backlogGames = useMemo(
    () => games.filter((game) => game.status === "backlog"),
    [games]
  );

  const [randomBacklogGame, setRandomBacklogGame] = useState(null);

  useEffect(() => {
    return () => {
      if (aiAddFeedbackTimerRef.current) {
        clearTimeout(aiAddFeedbackTimerRef.current);
      }
    };
  }, []);

  const showAIAddFeedback = (type, message) => {
    if (aiAddFeedbackTimerRef.current) {
      clearTimeout(aiAddFeedbackTimerRef.current);
    }

    setAiAddFeedback({ type, message });
    aiAddFeedbackTimerRef.current = setTimeout(() => {
      setAiAddFeedback(null);
      aiAddFeedbackTimerRef.current = null;
    }, 2800);
  };

  useEffect(() => {
    if (backlogGames.length > 0) {
      const randomIndex = Math.floor(Math.random() * backlogGames.length);
      setRandomBacklogGame(backlogGames[randomIndex]);
    } else {
      setRandomBacklogGame(null);
    }
  }, [backlogGames]);

  const pickAnotherBacklogGame = () => {
    if (backlogGames.length === 0) return;

    if (backlogGames.length === 1) {
      setRandomBacklogGame(backlogGames[0]);
      return;
    }

    let nextGame = randomBacklogGame;

    while (nextGame?._id === randomBacklogGame?._id) {
      const randomIndex = Math.floor(Math.random() * backlogGames.length);
      nextGame = backlogGames[randomIndex];
    }

    setRandomBacklogGame(nextGame);
  };

  const getAIRecommendations = async () => {
  try {
    setAiLoading(true);
    setAiAddFeedback(null);
    setIsAIRecommendationAdded(false);

    const res = await fetch("http://localhost:5000/ai/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        games,
        randomSeed: Date.now(),
        recentAIRecommendations,
      }),
    });

    const data = await res.json();

setAiRecommendation(data.recommendation);

setRecentAIRecommendations((prev) => {
  const newTitle = data.recommendation?.title;

  if (!newTitle) return prev;

  return [newTitle, ...prev.filter((title) => title !== newTitle)].slice(0, 3);
});
  } catch (error) {
    console.error("AI error:", error);
    setAiRecommendation({
      title: "Error",
      reason: "Failed to load recommendation.",
      confidence: null,
    });
  } finally {
    setAiLoading(false);
  }
};

const addAIRecommendationToWishlist = async () => {
  if (!aiRecommendation?.title) return;

  try {
    setIsAddingAIRecommendation(true);
    setAiAddFeedback(null);

    const rawgRes = await fetch(
      `https://api.rawg.io/api/games?key=${process.env.REACT_APP_RAWG_API_KEY}&search=${encodeURIComponent(
        aiRecommendation.title
      )}`
    );

    const rawgData = await rawgRes.json();

    const game =
      rawgData.results?.find(
        (result) =>
          result.name.toLowerCase() === aiRecommendation.title.toLowerCase()
      ) || rawgData.results?.[0];

    if (!game) {
      showAIAddFeedback("error", "Game not found from RAWG.");
      return;
    }

    const response = await fetch("http://localhost:5000/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title: game.name,
        rawgId: game.id,
        image: game.background_image,
        status: "wishlist",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        showAIAddFeedback("error", "This game is already in your library.");
      } else {
        showAIAddFeedback("error", data.error || "Failed to add game.");
      }
      return;
    }

    showAIAddFeedback("success", `✓ ${game.name} added to wishlist`);
    setIsAIRecommendationAdded(true);
    await fetchGames();
  } catch (error) {
    console.error("Failed to add AI recommendation:", error);
    showAIAddFeedback("error", "Something went wrong while adding the game.");
  } finally {
    setIsAddingAIRecommendation(false);
  }
};

  return (
    <div className="home-page">
      <section className="page-section">
        <h2 className="section-title">Continue Playing</h2>

        {playingGames.length === 0 ? (
          <p className="empty-text">No games currently being played.</p>
        ) : (
          <div className="game-grid">
            {playingGames.map((game) => (
              <div
                key={game._id}
                className="home-mini-card"
                onClick={() => openGameDetails(game)}
              >
                {game.image && (
                  <img
                    src={game.image}
                    alt={game.title}
                    className="home-mini-card-image"
                  />
                )}

                <div className="home-mini-card-content">
                  <h3>{game.title}</h3>
                  <p>{game.status}</p>
                  {game.userRating && (
                    <span className="home-rating">⭐ {game.userRating}/10</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="home-two-column">
        <section className="dashboard-panel recommendations-panel">
          <h2 className="section-title">Recommendations</h2>

          <div className="sub-panel">
            <div className="sub-panel-header">
              <h3 className="sub-panel-title">From Your Backlog</h3>

              <button
                className="secondary-button"
                onClick={pickAnotherBacklogGame}
                disabled={!randomBacklogGame}
              >
                Pick another
              </button>
            </div>

            {!randomBacklogGame ? (
              <p className="empty-text">No backlog games yet.</p>
            ) : (
              <div
  className="featured-backlog-card"
  onClick={() => openGameDetails(randomBacklogGame)}
>
  {randomBacklogGame.image && (
    <img
      src={randomBacklogGame.image}
      alt={randomBacklogGame.title}
      className="featured-backlog-image"
    />
  )}

  <div className="featured-backlog-overlay">
    <span className="dashboard-widget-label">Tonight's pick</span>
    <h3>{randomBacklogGame.title}</h3>
    <p>{randomBacklogGame.status}</p>
  </div>
</div>
            )}
          </div>

          <div className="sub-panel">
  <div className="sub-panel-header">
    <h3 className="sub-panel-title">From AI</h3>

    <button
      className="secondary-button"
      onClick={getAIRecommendations}
      disabled={aiLoading}
    >
      {aiLoading ? "Thinking..." : aiRecommendation ? "Get new" : "Get recommendation"}
    </button>
  </div>

  {!aiRecommendation && !aiLoading && (
    <div className="ai-placeholder compact">
      <p className="ai-placeholder-icon">🤖</p>
      <div>
        <h3>AI recommendations</h3>
        <p>Get a personalized game suggestion based on your library.</p>
      </div>
    </div>
  )}

  {aiLoading && <p className="empty-text">Generating recommendation...</p>}

  {aiRecommendation && !aiLoading && (
    <div className="ai-recommendation-card">
      <div className="ai-recommendation-header">
        <span className="ai-badge">AI Pick</span>

        {aiRecommendation.confidence && (
          <span className="ai-confidence">
            Match: {aiRecommendation.confidence}/10
          </span>
        )}
      </div>

      <h3>{aiRecommendation.title}</h3>
      <p>{aiRecommendation.reason}</p>

      <button
        className="primary-button"
        onClick={addAIRecommendationToWishlist}
        disabled={isAddingAIRecommendation || isAIRecommendationAdded}
      >
        {isAddingAIRecommendation
          ? "Adding..."
          : isAIRecommendationAdded
          ? "Added to wishlist"
          : "Add to wishlist"}
      </button>
      {aiAddFeedback && (
        <div className={`ai-add-message ${aiAddFeedback.type}`}>
          {aiAddFeedback.message}
        </div>
      )}
    </div>
  )}
</div>
          
        </section>

        <section className="dashboard-panel">
          <h2 className="section-title">Top Rated</h2>

          {topRatedGames.length === 0 ? (
            <p className="empty-text">No rated games yet.</p>
          ) : (
            <div className="top-rated-list">
              {topRatedGames.map((game) => (
                <div
                  key={game._id}
                  className="top-rated-item"
                  onClick={() => openGameDetails(game)}
                >
                  {game.image && (
                    <img
                      src={game.image}
                      alt={game.title}
                      className="top-rated-item-image"
                    />
                  )}

                  <div className="top-rated-item-content">
                    <h3>{game.title}</h3>
                    <p>{game.status}</p>
                  </div>

                  <div className="top-rated-score">⭐ {game.userRating}/10</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="page-section">
        <h2 className="section-title">Recently Added</h2>

        {recentGames.length === 0 ? (
          <p className="empty-text">No games added yet.</p>
        ) : (
          <div className="game-grid">
            {recentGames.map((game) => (
              <div
                key={game._id}
                className="home-mini-card"
                onClick={() => openGameDetails(game)}
              >
                {game.image && (
                  <img
                    src={game.image}
                    alt={game.title}
                    className="home-mini-card-image"
                  />
                )}

                <div className="home-mini-card-content">
                  <h3>{game.title}</h3>
                  <p>{game.status}</p>
                  {game.userRating && (
                    <span className="home-rating">⭐ {game.userRating}/10</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
