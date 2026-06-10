const express = require("express");
const OpenAI = require("openai");
const Game = require("../models/Game");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/recommendations", authMiddleware, async (req, res) => {
  try {
    const {
      randomSeed,
      recentAIRecommendations = [],
      selectedPlatforms = [],
    } = req.body;

    const games = await Game.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    const completed = games
      .filter((game) => game.status === "completed")
      .map((game) => `${game.title} (${game.userRating || "no rating"}/10)`);

    const playing = games
      .filter((game) => game.status === "playing")
      .map((game) => game.title);

    const backlog = games
      .filter((game) => game.status === "backlog")
      .map((game) => game.title);

    const wishlist = games
      .filter((game) => game.status === "wishlist")
      .map((game) => game.title);

    const allOwnedOrTracked = games.map((game) => game.title);

    // The prompt is the full recommendation contract; the model has no app-side memory.
    const prompt = `
You are a video game recommendation assistant.

User preferences:
Completed: ${completed.join(", ") || "none"}
Playing: ${playing.join(", ") || "none"}
Backlog/Wishlist: ${[...backlog, ...wishlist].join(", ") || "none"}
Owned platforms:
${selectedPlatforms?.length > 0
        ? selectedPlatforms.join(", ")
        : "none"
      }

Do NOT recommend these games:
${allOwnedOrTracked.join(", ") || "none"}

Do NOT recommend any of these recent AI suggestions:
${recentAIRecommendations.join(", ") || "none"}

Recommend exactly 1 new game not in the lists above.

If the user has selected owned platforms, prefer games available on those platforms.
Do not strictly limit recommendations to those platforms unless there is a clearly good match.

Base it on:
- the user's highest rated completed games
- similar genres, gameplay, difficulty, and vibe
- games that would make sense based on the user's current library

Return ONLY valid JSON like this:
{
  "title": "game title",
  "reason": "1-2 short sentences",
  "confidence": number from 5 to 10
}

Confidence scoring rules:

- Do not default to 8.
- Avoid returning the same confidence score repeatedly.
- Use the full range from 5 to 10.

Score meanings:
5-6 = experimental recommendation
7 = good recommendation
8 = strong recommendation
9 = excellent recommendation
10 = near-perfect recommendation

A score of 10 should be used occasionally when a recommendation is an exceptionally strong match.

Do not assume that every recommendation is a 9.
Use the entire range from 7 to 10 for good recommendations.

Choose the confidence score independently for each recommendation rather than reusing previous scores.

Use seed ${randomSeed} for variation.
Avoid recommending the same popular games repeatedly. Prefer variety when possible.
Keep it concise.
`;

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: prompt,
    });

    let recommendation;

    try {
      // Keep the API response strict so the React card can render deterministic fields.
      recommendation = JSON.parse(response.output_text);
    } catch {
      return res.status(500).json({
        error: "Failed to parse AI response",
      });
    }

    res.json({ recommendation });
  } catch {
    res.status(500).json({
      error: "Failed to generate recommendation",
    });
  }
});

module.exports = router;
