require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/ai", aiRoutes);
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(5000);
