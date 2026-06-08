import GameCard from "./GameCard";
import StatusBadge from "./StatusBadge";

function GameSection({
  id,
  title,
  status,
  games,
  updateStatus,
  deleteGame,
  onGameClick,
  controls,
  filterToggleButton,
  emptyText = "No games yet",
}) {
  return (
    <section className="game-section" id={id}>
      <div className="page-title-status">
        {status ? (
          <StatusBadge status={status} />
        ) : (
          <h2>{title}</h2>
        )}
        {filterToggleButton}
      </div>

      {controls}

      {games.length === 0 ? (
        <p className="empty-text">{emptyText}</p>
      ) : (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              updateStatus={updateStatus}
              deleteGame={deleteGame}
              onClick={onGameClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default GameSection;
