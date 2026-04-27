const express = require("express");
const OpenAI = require("openai");

const router = express.Router();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/recommendations", async (req, res) => {
  try {
    const { games, randomSeed, recentAIRecommendations } = req.body;

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


const prompt = `
You are a video game recommendation assistant.

User preferences:
Completed: ${completed.join(", ") || "none"}
Playing: ${playing.join(", ") || "none"}
Backlog/Wishlist: ${[...backlog, ...wishlist].join(", ") || "none"}

Do NOT recommend these games:
${allOwnedOrTracked.join(", ") || "none"}

Do NOT recommend any of these recent AI suggestions:
${recentAIRecommendations.join(", ") || "none"}

Recommend exactly 1 new game not in the lists above.

Recommend exactly 1 new game not in the list above.

Base it on:
- the user's highest rated completed games
- similar genres, gameplay, difficulty, and vibe
- games that would make sense based on the user's current library

Return ONLY valid JSON like this:
{
  "title": "game title",
  "reason": "1-2 short sentences",
  "confidence": 7
}

The confidence value must be a number from 5 to 10.
Use the score based on fit:
5-6 = uncertain match
7-8 = good match
9-10 = excellent match

Do not always use the same score.

Use seed ${randomSeed} for variation.
Avoid recommending the same popular games repeatedly. Prefer variety when possible.
Keep it concise.
`;

    const response = await client.responses.create({
  model: "gpt-5.2",
  input: prompt,
});

const text = response.output_text;

let recommendation;

try {
      recommendation = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse AI response:", text);

      return res.status(500).json({
        error: "Failed to parse AI response",
      });
    }

    res.json({ recommendation });
  } catch (error) {
    console.error("AI recommendation error:", error);

    res.status(500).json({
      error: "Failed to generate recommendation",
    });
  }
});

module.exports = router;