import { useEffect, useRef, useState } from "react";
import { getOptimizedImage } from "../utils/images";
import StatusBadge, { statusConfig } from "./StatusBadge";

function GameDetailsModal({
  game,
  details,
  loading,
  onClose,
  saveGameReview,
  addFromAPI,
  onAddSuccess,
}) {
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addingStatus, setAddingStatus] = useState(null);
  const [addMessage, setAddMessage] = useState("");
  const addInFlightRef = useRef(false);

  const isCompleted = game?.status === "completed";

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
      setSaveMessage("");
      setAddMessage("");
      setIsAdding(false);
      setAddingStatus(null);
      addInFlightRef.current = false;
    }
  }, [game]);

  if (!game) return null;

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

  const previewGameForAdd = {
    name: game.title,
    id: game.rawgId,
    background_image: game.image,
    released: game.released || null,
    metacritic: game.metacritic || null,
    genres: game.genres?.map((genre) =>
      typeof genre === "string" ? { name: genre } : genre
    ) || [],
    platforms:
      game.platforms?.map((platform) =>
        typeof platform === "string"
          ? { platform: { name: platform } }
          : platform
      ) || [],
  };

  const handlePreviewAdd = async (selectedStatus) => {
    if (addInFlightRef.current) return;

    addInFlightRef.current = true;
    setIsAdding(true);
    setAddingStatus(selectedStatus);
    setAddMessage("");

    try {
      const result = await addFromAPI(previewGameForAdd, selectedStatus);

      if (result?.success) {
        const statusLabel = statusConfig[selectedStatus]?.label || selectedStatus;

        onAddSuccess?.(`${game.title} added to ${statusLabel}`);
        onClose();
        return;
      }

      setAddMessage(result?.message || "Failed to add game");
    } catch {
      setAddMessage("Failed to add game");
    } finally {
      addInFlightRef.current = false;
      setIsAdding(false);
      setAddingStatus(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="game-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          x
        </button>

        {game.image && (
          <img
            src={getOptimizedImage(game.image)}
            alt={game.title}
            className="game-modal-image"
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="game-modal-content">
          <h2 className="game-modal-title">{game.title}</h2>

          {!game.isPreview && (
            <div className="game-modal-status-row">
              <span className={`status-badge status-${game.status}`}>
                {game.status}
              </span>
            </div>
          )}

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

          {!game.isPreview && (
            <div className="review-section">
              <h3>Your Review</h3>

              {isCompleted ? (
                <div className="review-field">
                  <label htmlFor="rating">Rating (1-10)</label>
                  <select
                    id="rating"
                    value={rating}
                    onChange={(e) =>
                      setRating(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  >
                    <option value="">No rating</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
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
                    className={`save-message-box ${saveMessage.includes("Failed") ? "error" : "success"
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
          )}

          {game.isPreview && game.existingStatus && (
            <div className="preview-add-section">
              <p className="preview-add-text">Already in your library:</p>
              <StatusBadge status={game.existingStatus} />
            </div>
          )}

          {game.isPreview && !game.existingStatus && (
            <div className="preview-add-section">
              <p className="preview-add-text">Add this game to your library:</p>

              <div className="save-message-area">
                {addMessage && (
                  <div className="save-message-box error">
                    {addMessage}
                  </div>
                )}
              </div>

              <div className="preview-add-actions">
                {["wishlist", "backlog", "playing", "completed"].map((status) => {
                  const config = statusConfig[status];

                  return (
                    <button
                      key={status}
                      type="button"
                      className={`preview-add-button ${config.className}`}
                      onClick={() => handlePreviewAdd(status)}
                      disabled={isAdding}
                    >
                      {config.icon}
                      <span>
                        {addingStatus === status ? "Adding..." : config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default GameDetailsModal;
