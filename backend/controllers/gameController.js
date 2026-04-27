const Game = require("../models/Game");

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGame = async (req, res) => {
  try {
    const { title, status, rawgId, image } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    let existingGame = null;

    if (rawgId) {
      existingGame = await Game.findOne({ rawgId });
    } else {
      existingGame = await Game.findOne({
        title: title.trim(),
      });
    }

    if (existingGame) {
      return res.status(409).json({
        error: "Game already exists in your list",
      });
    }

    const game = new Game({
      title: title.trim(),
      status,
      rawgId: rawgId || null,
      image: image || "",
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

    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Game deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};