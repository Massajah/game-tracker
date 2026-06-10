import { useCallback, useEffect, useMemo, useState } from "react";
import GameSection from "../components/GameSection";

const SORT_OPTIONS = [
  { value: "recentlyAdded", label: "Recently added" },
  { value: "titleAsc", label: "Title A-Z" },
  { value: "titleDesc", label: "Title Z-A" },
  { value: "releaseNewest", label: "Release date: Newest first" },
  { value: "releaseOldest", label: "Release date: Oldest first" },
  { value: "metacriticHigh", label: "Metacritic: High to low" },
  { value: "metacriticLow", label: "Metacritic: Low to high" },
];

const DEFAULT_SORT = "recentlyAdded";

const COMPLETED_SORT_OPTIONS = [
  ...SORT_OPTIONS,
  { value: "ratingHigh", label: "Your rating: High to low" },
  { value: "ratingLow", label: "Your rating: Low to high" },
];

// Filters accept both stored string values and richer RAWG-shaped objects.
const getListValues = (game, key) => {
  if (!Array.isArray(game?.[key])) return [];

  return game[key]
    .map((item) => {
      if (typeof item === "string") return item;
      if (item?.name) return item.name;
      if (item?.platform?.name) return item.platform.name;
      return "";
    })
    .map((value) => value.trim())
    .filter(Boolean);
};

const getOptions = (games, key) =>
  [...new Set(games.flatMap((game) => getListValues(game, key)))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));

const parseDate = (value) => {
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const compareNullable = (a, b, direction, compareValues) => {
  // Missing values always sort last, regardless of ascending or descending mode.
  const aMissing = a === null || a === undefined || a === "";
  const bMissing = b === null || b === undefined || b === "";

  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  return direction * compareValues(a, b);
};

const compareTitle = (a, b, direction = 1) =>
  compareNullable(a?.title || "", b?.title || "", direction, (left, right) =>
    left.localeCompare(right)
  );

const sortGames = (games, sortBy) => {
  const sortedGames = [...games];

  sortedGames.sort((a, b) => {
    let result = 0;

    switch (sortBy) {
      case "titleAsc":
        result = compareTitle(a, b, 1);
        break;
      case "titleDesc":
        result = compareTitle(a, b, -1);
        break;
      case "releaseNewest":
        result = compareNullable(
          parseDate(a.released),
          parseDate(b.released),
          -1,
          (left, right) => left - right
        );
        break;
      case "releaseOldest":
        result = compareNullable(
          parseDate(a.released),
          parseDate(b.released),
          1,
          (left, right) => left - right
        );
        break;
      case "metacriticHigh":
        result = compareNullable(
          parseNumber(a.metacritic),
          parseNumber(b.metacritic),
          -1,
          (left, right) => left - right
        );
        break;
      case "metacriticLow":
        result = compareNullable(
          parseNumber(a.metacritic),
          parseNumber(b.metacritic),
          1,
          (left, right) => left - right
        );
        break;
      case "ratingHigh":
        result = compareNullable(
          parseNumber(a.userRating),
          parseNumber(b.userRating),
          -1,
          (left, right) => left - right
        );
        break;
      case "ratingLow":
        result = compareNullable(
          parseNumber(a.userRating),
          parseNumber(b.userRating),
          1,
          (left, right) => left - right
        );
        break;
      case "recentlyAdded":
      default:
        result = compareNullable(
          parseDate(a.createdAt),
          parseDate(b.createdAt),
          -1,
          (left, right) => left - right
        );
        break;
    }

    return result || compareTitle(a, b, 1);
  });

  return sortedGames;
};

function StatusPage({
  title,
  status,
  games,
  updateStatus,
  deleteGame,
  openGameDetails,
}) {
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const resetFilters = useCallback(() => {
    setSortBy(DEFAULT_SORT);
    setSelectedGenre("All");
    setSelectedPlatform("All");
  }, []);

  useEffect(() => {
    resetFilters();
    setMobileFiltersOpen(false);
  }, [resetFilters, status]);

  const statusGames = useMemo(
    () => games.filter((game) => game.status === status),
    [games, status]
  );

  const genreOptions = useMemo(
    () => getOptions(statusGames, "genres"),
    [statusGames]
  );
  const platformOptions = useMemo(
    () => getOptions(statusGames, "platforms"),
    [statusGames]
  );

  const filteredGames = useMemo(() => {
    const visibleGames = statusGames.filter((game) => {
      const genreMatches =
        selectedGenre === "All" ||
        getListValues(game, "genres").includes(selectedGenre);
      const platformMatches =
        selectedPlatform === "All" ||
        getListValues(game, "platforms").includes(selectedPlatform);

      return genreMatches && platformMatches;
    });

    return sortGames(visibleGames, sortBy);
  }, [selectedGenre, selectedPlatform, sortBy, statusGames]);

  const sortOptions =
    status === "completed" ? COMPLETED_SORT_OPTIONS : SORT_OPTIONS;

  const filterPanelId = `${status}-filters-panel`;

  const filterToggleButton = (
    <button
      type="button"
      className="mobile-filter-toggle"
      onClick={() => setMobileFiltersOpen((open) => !open)}
      aria-expanded={mobileFiltersOpen}
      aria-controls={filterPanelId}
    >
      Filters {mobileFiltersOpen ? "▲" : "▼"}
    </button>
  );

  const controls = (
    <div className="status-filters">
      <div
        id={filterPanelId}
        className={`status-filter-panel ${mobileFiltersOpen ? "is-open" : ""}`}
      >
        <div className="library-controls" aria-label={`${title} filters`}>
          <label className="library-control">
            <span>Sort by</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="library-control">
            <span>Genre</span>
            <select
              value={selectedGenre}
              onChange={(event) => setSelectedGenre(event.target.value)}
            >
              <option value="All">All</option>
              {genreOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="library-control">
            <span>Platform</span>
            <select
              value={selectedPlatform}
              onChange={(event) => setSelectedPlatform(event.target.value)}
            >
              <option value="All">All</option>
              {platformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="secondary-button status-reset-filters"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <GameSection
      id={status}
      title={title}
      status={status}
      games={filteredGames}
      updateStatus={updateStatus}
      deleteGame={deleteGame}
      onGameClick={openGameDetails}
      controls={controls}
      filterToggleButton={filterToggleButton}
      emptyText={
        statusGames.length === 0
          ? "No games yet"
          : "No games match the selected filters."
      }
    />
  );
}

export default StatusPage;
