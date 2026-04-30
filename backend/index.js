require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const gameRoutes = require("./routes/gameRoutes");
const cors = require("cors");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/ai", aiRoutes);
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);

// connect database
connectDB();

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(5000, () => console.log("Server running"));
