const Game = require("../models/Game");

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGame = async (req, res) => {
  try {
    const {
      title,
      status,
      rawgId,
      image,
      released,
      metacritic,
      genres,
      platforms
    } = req.body;
    const { userId } = req.user;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    let existingGame = null;

    // RAWG-backed games dedupe by external id; manual entries fall back to title per user.
    if (rawgId) {
      existingGame = await Game.findOne({ rawgId, userId });
    } else {
      existingGame = await Game.findOne({
        title: title.trim(),
        userId,
      });
    }

    if (existingGame) {
      return res.status(409).json({
        error: "Game already exists in your list",
      });
    }

    const game = new Game({
      userId,
      title: title.trim(),
      status,
      rawgId: rawgId || null,
      image: image || "",
      released: released || null,
      metacritic: metacritic || null,
      genres: genres || [],
      platforms: platforms || [],
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { status, userRating, notes } = req.body;
    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (userRating !== undefined) {
      updateData.userRating = userRating === "" ? null : userRating;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Include userId in the selector so a valid game id cannot cross account boundaries.
    const updatedGame = await Game.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedGame) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    // Delete by both id and owner for the same isolation guarantee as updates.
    const deletedGame = await Game.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deletedGame) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Game deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
