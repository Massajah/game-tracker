import { useEffect, useRef, useState } from "react";
import { getOptimizedImage } from "../utils/images";
import StarRating from "./StarRating";
import StatusBadge, { statusConfig } from "./StatusBadge";
import getErrorMessage from "../utils/errors";
import { FaTimes } from "react-icons/fa";

function GameDetailsModal({
  game,
  details,
  loading,
  onClose,
  saveGameReview,
  addFromAPI,
}) {
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addingStatus, setAddingStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const [previewAddedStatus, setPreviewAddedStatus] = useState(null);
  const addInFlightRef = useRef(false);
  const modalGameKeyRef = useRef(null);
  const messageTimerRef = useRef(null);

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
    if (!game) {
      modalGameKeyRef.current = null;
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }
      setModalMessage(null);
      setPreviewAddedStatus(null);
      return;
    }

    const modalGameKey = `${game.isPreview ? "preview" : "library"}-${game._id || game.rawgId
      }`;

    if (modalGameKeyRef.current !== modalGameKey) {
      modalGameKeyRef.current = modalGameKey;
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }
      setModalMessage(null);
      setPreviewAddedStatus(
        game.existingStatus
          ? { gameKey: modalGameKey, status: game.existingStatus }
          : null
      );
    }

    setRating(game.userRating ?? "");
    setNotes(game.notes ?? "");
    setIsAdding(false);
    setAddingStatus(null);
    addInFlightRef.current = false;
  }, [game]);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  if (!game) return null;

  const currentModalGameKey = `${game.isPreview ? "preview" : "library"}-${game._id || game.rawgId
    }`;
  const currentPreviewStatus = game.isPreview
    ? game.existingStatus ||
    (previewAddedStatus?.gameKey === currentModalGameKey
      ? previewAddedStatus.status
      : null)
    : null;

  const clearModalMessage = () => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }

    setModalMessage(null);
  };

  const showModalMessage = (message) => {
    clearModalMessage();
    setModalMessage(message);

    if (message.type === "success") {
      messageTimerRef.current = setTimeout(() => {
        setModalMessage(null);
        messageTimerRef.current = null;
      }, 2800);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    clearModalMessage();

    const result = await saveGameReview(
      game._id,
      isCompleted ? rating : game.userRating,
      notes
    );

    if (result.success) {
      showModalMessage({
        type: "success",
        text: "Review saved successfully.",
      });
    } else {
      showModalMessage({
        type: "error",
        text: result.message || "Failed to save review",
      });
    }

    setIsSaving(false);
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
    clearModalMessage();

    try {
      const result = await addFromAPI(previewGameForAdd, selectedStatus);

      if (result?.success) {
        const statusLabel = statusConfig[selectedStatus]?.label || selectedStatus;

        setPreviewAddedStatus({
          gameKey: currentModalGameKey,
          status: selectedStatus,
        });
        showModalMessage({
          type: "success",
          text: `${game.title} added to ${statusLabel}.`,
        });
        return;
      }

      showModalMessage({
        type: "error",
        text: result?.message || "Failed to add game",
      });
    } catch (error) {
      showModalMessage({
        type: "error",
        text: getErrorMessage(error, "Failed to add game"),
      });
    } finally {
      addInFlightRef.current = false;
      setIsAdding(false);
      setAddingStatus(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="game-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <FaTimes />
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
                  <span className="review-field-label" id="review-rating-label">
                    Rating
                  </span>
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    onClear={() => setRating("")}
                    labelledBy="review-rating-label"
                  />
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

              <button
                className="save-review-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Review"}
              </button>
            </div>
          )}

          {game.isPreview && currentPreviewStatus && (
            <div className="preview-add-section">
              <p className="preview-add-text">Already in your library:</p>
              <StatusBadge status={currentPreviewStatus} />
            </div>
          )}

          {game.isPreview && !currentPreviewStatus && (
            <div className="preview-add-section">
              <p className="preview-add-text">Add this game to your library:</p>

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

          <div className="save-message-area">
            {modalMessage && (
              <div className={`save-message-box ${modalMessage.type}`}>
                {modalMessage.text}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default GameDetailsModal;
