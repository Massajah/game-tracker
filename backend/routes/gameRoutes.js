const express = require("express");
const {
  getGames,
  createGame,
  updateGame,
  deleteGame,
} = require("../controllers/gameController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Every game endpoint is protected and scoped to the authenticated user.
router.use(authMiddleware);

router.get("/", getGames);
router.post("/", createGame);
router.put("/:id", updateGame);
router.delete("/:id", deleteGame);

module.exports = router;
