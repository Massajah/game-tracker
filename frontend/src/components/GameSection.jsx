import GameCard from "./GameCard";

function GameSection({
  id,
  title,
  games,
  updateStatus,
  deleteGame,
  onGameClick,
  controls,
  emptyText = "No games yet",
}) {
  return (
    <section className="game-section" id={id}>
      <h2 className="section-title">{title}</h2>
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
