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
    rawgId: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: "",
  },
  userRating: {
      type: Number,
      min: 1,
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

module.exports = mongoose.model("Game", gameSchema);