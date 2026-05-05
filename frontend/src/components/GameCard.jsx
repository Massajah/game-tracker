function GameCard({ game, updateStatus, deleteGame, onClick }) {
  return (
    <div className="game-card" onClick={() => onClick(game)}> 
      {game.image && (
        <img
          src={game.image}
          alt={game.title}
          className="game-card-image"
        />
      )}

      <div className="game-card-content">
        <h3 className="game-card-title">{game.title}</h3>
        <p className="game-card-status">{game.status}</p>

        {game.status === "completed" && game.userRating && (
          <p className="game-card-rating">⭐ {game.userRating}/10</p>
        )}

        <div className="game-card-actions" onClick={(e) => e.stopPropagation()}>
          <select
            value={game.status}
            onChange={(e) => updateStatus(game._id, e.target.value)}
          >
            <option value="wishlist">Wishlist</option>
            <option value="backlog">Backlog</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
          </select>

          <button onClick={() => deleteGame(game._id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default GameCard;
