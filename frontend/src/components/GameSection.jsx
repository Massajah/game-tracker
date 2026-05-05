import GameCard from "./GameCard";

function GameSection({ id, title, games, updateStatus, deleteGame, onGameClick }) {
  return (
    <section className="game-section" id={id}>
      <h2 className="section-title">{title}</h2>

      {games.length === 0 ? (
        <p className="empty-text">No games yet</p>
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