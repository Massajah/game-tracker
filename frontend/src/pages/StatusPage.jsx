import GameSection from "../components/GameSection";

function StatusPage({ title, status, games, updateStatus, deleteGame, openGameDetails }) {
  const filteredGames = games.filter((game) => game.status === status);

  return (
    <GameSection
      id={status}
      title={title}
      games={filteredGames}
      updateStatus={updateStatus}
      deleteGame={deleteGame}
      onGameClick={openGameDetails}
    />
  );
}

export default StatusPage;