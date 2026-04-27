require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const Game = require("./models/Game");
const gameRoutes = require("./routes/gameRoutes");
const cors = require("cors");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/ai", aiRoutes);
app.use("/games", gameRoutes);

// connect database
connectDB();

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(5000, () => console.log("Server running"));

// TEST endpoint
app.post("/games", async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});