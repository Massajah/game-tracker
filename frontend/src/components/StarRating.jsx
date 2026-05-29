import { useState } from "react";

const MIN_RATING = 0.5;
const MAX_RATING = 10;
const RATING_STEP = 0.5;
const STAR_COUNT = 10;

function clampRating(value) {
  return Math.min(MAX_RATING, Math.max(MIN_RATING, value));
}

function normalizeRating(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return clampRating(Math.round(numericValue / RATING_STEP) * RATING_STEP);
}

function formatRating(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getStarFill(starIndex, rating) {
  if (!rating) {
    return 0;
  }

  const filledAmount = rating - (starIndex - 1);

  if (filledAmount >= 1) {
    return 100;
  }

  if (filledAmount >= RATING_STEP) {
    return 50;
  }

  return 0;
}

function StarRating({
  value,
  onChange,
  onClear,
  label = "Rating",
  labelledBy,
  disabled = false,
}) {
  const [hoverRating, setHoverRating] = useState(null);
  const selectedRating = normalizeRating(value);
  const previewRating = hoverRating ?? selectedRating;

  const getRatingFromPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerOffset = event.clientX - rect.left;
    const rawRating = (pointerOffset / rect.width) * STAR_COUNT;
    const steppedRating = Math.ceil(rawRating / RATING_STEP) * RATING_STEP;

    return clampRating(steppedRating);
  };

  const updateRatingFromPointer = (event) => {
    if (disabled) return;

    setHoverRating(getRatingFromPointer(event));
  };

  const handleClick = (event) => {
    if (disabled) return;

    onChange(getRatingFromPointer(event));
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    const currentRating = selectedRating ?? MIN_RATING;
    let nextRating = null;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      nextRating = clampRating(currentRating + RATING_STEP);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      nextRating = clampRating(currentRating - RATING_STEP);
    }

    if (event.key === "Home") {
      nextRating = MIN_RATING;
    }

    if (event.key === "End") {
      nextRating = MAX_RATING;
    }

    if ((event.key === "Backspace" || event.key === "Delete") && onClear) {
      event.preventDefault();
      setHoverRating(null);
      onClear();
      return;
    }

    if (nextRating !== null) {
      event.preventDefault();
      setHoverRating(nextRating);
      onChange(nextRating);
    }
  };

  const selectedText = selectedRating
    ? `${formatRating(selectedRating)} / ${MAX_RATING}`
    : "No rating";

  return (
    <div className="star-rating">
      <div
        className="star-rating-stars"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        aria-valuemin={MIN_RATING}
        aria-valuemax={MAX_RATING}
        aria-valuenow={selectedRating ?? MIN_RATING}
        aria-valuetext={
          selectedRating
            ? `${formatRating(selectedRating)} out of ${MAX_RATING}`
            : "No rating"
        }
        aria-disabled={disabled}
        onMouseMove={updateRatingFromPointer}
        onMouseLeave={() => setHoverRating(null)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: STAR_COUNT }, (_, index) => {
          const starIndex = index + 1;
          const fill = getStarFill(starIndex, previewRating);

          return (
            <span className="star-rating-star-shell" key={starIndex}>
              <span className="star-rating-star" aria-hidden="true">
                <span className="star-rating-star-base" />
                <span
                  className="star-rating-star-fill"
                  style={{ "--star-fill": `${fill}%` }}
                />
              </span>
            </span>
          );
        })}
      </div>

      <div className="star-rating-meta">
        <span className="star-rating-value">{selectedText}</span>

        {selectedRating && onClear && !disabled && (
          <button
            className="star-rating-clear"
            type="button"
            onClick={() => {
              setHoverRating(null);
              onClear();
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default StarRating;
