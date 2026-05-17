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
  emptyText = "No games yet",
}) {
  return (
    <section className="game-section" id={id}>
      {status ? (
  <div className="page-title-status">
    <StatusBadge status={status} />
  </div>
) : (
  <h2>{title}</h2>
)}
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
