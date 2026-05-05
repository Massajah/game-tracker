import { useEffect, useState } from "react";

function GameDetailsModal({ game, details, loading, onClose, saveGameReview }) {
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (game) {
      setRating(game.userRating ?? "");
      setNotes(game.notes ?? "");
    }
  }, [game]);

  if (!game) return null;

  const isCompleted = game.status === "completed";

  const handleSave = async () => {
  setIsSaving(true);
  setSaveMessage("");

  const result = await saveGameReview(
    game._id,
    isCompleted ? rating : game.userRating,
    notes
  );

  if (result.success) {
    setSaveMessage("Review saved successfully");
  } else {
    setSaveMessage(result.message || "Failed to save review");
  }

  setIsSaving(false);

  setTimeout(() => {
    setSaveMessage("");
  }, 2500);
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="game-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ✕
        </button>

        {game.image && (
          <img
            src={game.image}
            alt={game.title}
            className="game-modal-image"
          />
        )}

        <div className="game-modal-content">
          <h2 className="game-modal-title">{game.title}</h2>

          <div className="game-modal-status-row">
            <span className={`status-badge status-${game.status}`}>
              {game.status}
            </span>
          </div>

          {loading ? (
            <p>Loading details...</p>
          ) : details ? (
            <div className="game-modal-details">
              {details.released && (
                <p>
                  <strong>Released:</strong> {details.released}
                </p>
              )}

              {details.metacritic && (
                <p>
                  <strong>Metacritic:</strong> {details.metacritic}
                </p>
              )}

              {details.genres?.length > 0 && (
                <p>
                  <strong>Genres:</strong>{" "}
                  {details.genres.map((genre) => genre.name).join(", ")}
                </p>
              )}

              {details.platforms?.length > 0 && (
                <p>
                  <strong>Platforms:</strong>{" "}
                  {details.platforms
                    .map((platform) => platform.platform.name)
                    .join(", ")}
                </p>
              )}

              {details.description_raw && (
                <div className="game-modal-description">
                  <strong>Description:</strong>
                  <p>{details.description_raw}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No extra details available.</p>
          )}

          <div className="review-section">
            <h3>Your Review</h3>

            {isCompleted ? (
              <div className="review-field">
                <label htmlFor="rating">Rating (1-10)</label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">No rating</option>
                  {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="review-rating-hint">
                You can rate games after completing them.
              </p>
            )}

            <div className="review-field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your thoughts about this game..."
                rows="5"
              />
            </div>

            <div className="save-message-area">
              {saveMessage && (
                <div
                  className={`save-message-box ${
                    saveMessage.includes("Failed") ? "error" : "success"
                  }`}
                >
                {saveMessage}
            </div>
              )}
            </div>

            <button
              className="save-review-button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetailsModal;
