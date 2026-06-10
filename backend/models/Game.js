const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["wishlist", "backlog", "playing", "completed"],
      default: "wishlist",
    },
    // Null identifies manually added games that do not have a RAWG match.
    rawgId: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    released: {
      type: String,
      default: null,
    },
    metacritic: {
      type: Number,
      default: null,
    },
    genres: {
      type: [String],
      default: [],
    },
    platforms: {
      type: [String],
      default: [],
    },
    userRating: {
      type: Number,
      min: 0.5,
      max: 10,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

gameSchema.index(
  { userId: 1, rawgId: 1 },
  {
    unique: true,
    partialFilterExpression: { rawgId: { $type: "number" } },
  }
);

module.exports = mongoose.model("Game", gameSchema);
