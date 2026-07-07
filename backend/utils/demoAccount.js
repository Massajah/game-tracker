const bcrypt = require("bcryptjs");
const Game = require("../models/Game");
const User = require("../models/User");

const getDemoCredentials = () => ({
  email: process.env.DEMO_EMAIL || "demo@gametracker.app",
  password: process.env.DEMO_PASSWORD || "Demo123!",
  username: process.env.DEMO_USERNAME || "DemoUser",
});

const DEMO_GAMES = [
  {
    title: "Disco Elysium: Final Cut",
    status: "completed",
    rawgId: 545015,
    image:
      "https://media.rawg.io/media/games/0af/0afe9e8ace196123d8c7cf22172cec63.jpg",
    released: "2021-03-30",
    metacritic: 90,
    genres: ["RPG", "Adventure"],
    platforms: [
      "PC",
      "PlayStation 5",
      "PlayStation 4",
      "Xbox Series S/X",
      "Xbox One",
      "Nintendo Switch",
    ],
    userRating: 9.5,
    notes:
      "Outstanding writing and worldbuilding. Best fit when I want choices, investigation, and a strange mood that sticks around.",
  },
  {
    title: "The Witcher 3: Wild Hunt",
    status: "completed",
    rawgId: 3328,
    image:
      "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
    released: "2015-05-18",
    metacritic: 92,
    genres: ["Action", "RPG"],
    platforms: [
      "PC",
      "PlayStation 5",
      "PlayStation 4",
      "Xbox Series S/X",
      "Xbox One",
      "Nintendo Switch",
    ],
    userRating: 9.0,
    notes:
      "Huge open world with strong quests and memorable characters. Great benchmark for story-rich RPG recommendations.",
  },
  {
    title: "Portal 2",
    status: "completed",
    rawgId: 4200,
    image:
      "https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg",
    released: "2011-04-18",
    metacritic: 95,
    genres: ["Shooter", "Puzzle"],
    platforms: ["PC", "PlayStation 3", "Xbox 360", "Linux", "macOS"],
    userRating: 8.5,
    notes:
      "Sharp puzzles, perfect pacing, and funny writing. I like recommendations with clever mechanics and compact design.",
  },
  {
    title: "Celeste",
    status: "completed",
    rawgId: 22121,
    image:
      "https://media.rawg.io/media/games/594/59487800889ebac294c7c2c070d02356.jpg",
    released: "2018-01-25",
    metacritic: 91,
    genres: ["Platformer", "Indie"],
    platforms: [
      "PC",
      "PlayStation 4",
      "Xbox One",
      "Nintendo Switch",
      "Linux",
      "macOS",
    ],
    userRating: 8.0,
    notes:
      "Demanding but fair. Loved the movement, music, and emotional arc, especially when the challenge teaches without overexplaining.",
  },
  {
    title: "Hades",
    status: "playing",
    rawgId: 274755,
    image:
      "https://media.rawg.io/media/games/1f4/1f47a270b8f241e4676b14d39ec620f7.jpg",
    released: "2020-09-17",
    metacritic: 93,
    genres: ["Action", "RPG", "Indie"],
    platforms: [
      "PC",
      "PlayStation 5",
      "PlayStation 4",
      "Xbox Series S/X",
      "Xbox One",
      "Nintendo Switch",
      "iOS",
      "macOS",
    ],
    notes:
      "Current comfort run game. Fast combat, strong builds, and character moments make short sessions feel productive.",
  },
  {
    title: "Hollow Knight",
    status: "playing",
    rawgId: 9767,
    image:
      "https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg",
    released: "2017-02-23",
    metacritic: 88,
    genres: ["Action", "Platformer", "Indie"],
    platforms: [
      "PC",
      "PlayStation 4",
      "Xbox One",
      "Nintendo Switch",
      "Linux",
      "macOS",
    ],
    notes:
      "Exploring slowly. I like the atmosphere, map discovery, and boss fights that ask for pattern learning.",
  },
  {
    title: "Elden Ring",
    status: "backlog",
    rawgId: 326243,
    image:
      "https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg",
    released: "2022-02-25",
    metacritic: 95,
    genres: ["Action", "RPG"],
    platforms: [
      "PC",
      "PlayStation 5",
      "PlayStation 4",
      "Xbox Series S/X",
      "Xbox One",
    ],
    notes:
      "Waiting for a long weekend. Looks like a good fit for exploration, buildcrafting, and big discovery moments.",
  },
  {
    title: "Outer Wilds",
    status: "backlog",
    rawgId: 58764,
    image:
      "https://media.rawg.io/media/games/9f4/9f418898f5415668ca47b5f4ab1ecfeb.jpg",
    released: "2019-05-29",
    metacritic: 84,
    genres: ["Adventure", "Puzzle", "Indie"],
    platforms: [
      "PC",
      "PlayStation 5",
      "PlayStation 4",
      "Xbox Series S/X",
      "Xbox One",
      "Nintendo Switch",
    ],
    notes:
      "Backlog priority because mystery-driven exploration sounds ideal after finishing heavier RPGs.",
  },
  {
    title: "Slay the Spire",
    status: "backlog",
    rawgId: 28121,
    image:
      "https://media.rawg.io/media/games/f52/f5206d55f918edf8ee07803101106fa6.jpg",
    released: "2019-01-22",
    metacritic: 86,
    genres: ["Strategy", "Card", "Indie"],
    platforms: [
      "PC",
      "PlayStation 4",
      "Xbox One",
      "Nintendo Switch",
      "iOS",
      "Android",
      "Linux",
      "macOS",
    ],
    notes:
      "Good candidate for repeatable strategy sessions and variety between larger story games.",
  },
  {
    title: "Baldur's Gate III",
    status: "wishlist",
    rawgId: 324997,
    image:
      "https://media.rawg.io/media/games/699/69907ecf13f172e9e144069769c3be73.jpg",
    released: "2023-08-03",
    metacritic: 97,
    genres: ["RPG", "Strategy"],
    platforms: ["PC", "PlayStation 5", "Xbox Series S/X", "macOS"],
    notes:
      "Wishlist pick for deep party choices, tactical combat, and reactive storytelling.",
  },
  {
    title: "Cyberpunk 2077",
    status: "wishlist",
    rawgId: 41494,
    image:
      "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg",
    released: "2020-12-10",
    metacritic: 73,
    genres: ["Action", "RPG"],
    platforms: [
      "PC",
      "PlayStation 5",
      "PlayStation 4",
      "Xbox Series S/X",
      "Xbox One",
    ],
    notes:
      "Interested in the city, builds, and narrative quests after the major updates.",
  },
  {
    title: "Stardew Valley",
    status: "wishlist",
    rawgId: 654,
    image:
      "https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg",
    released: "2016-02-25",
    metacritic: 89,
    genres: ["RPG", "Simulation", "Indie"],
    platforms: [
      "PC",
      "PlayStation 4",
      "Xbox One",
      "Nintendo Switch",
      "iOS",
      "Android",
      "Linux",
      "macOS",
    ],
    notes:
      "Wishlist option for a quieter game with progression, routines, and flexible session length.",
  },
];

const resetDemoLibrary = async (userId) => {
  const seedRawgIds = DEMO_GAMES.map((game) => game.rawgId);

  // Demo data is restored on login instead of making the whole account read-only.
  await Game.deleteMany({
    userId,
    rawgId: { $nin: seedRawgIds },
  });

  await Game.bulkWrite(
    DEMO_GAMES.map((game) => {
      const resetFields = {
        userRating: null,
        notes: "",
        ...game,
        userId,
      };

      return {
        updateOne: {
          filter: {
            userId,
            rawgId: game.rawgId,
          },
          update: {
            $set: resetFields,
          },
          upsert: true,
        },
      };
    })
  );
};

const ensureDemoAccount = async () => {
  const { email, password, username } = getDemoCredentials();
  const hashedPassword = await bcrypt.hash(password, 10);

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      username,
      email,
      password: hashedPassword,
      authProvider: "local",
    });
  } else {
    user.username = username;
    user.password = hashedPassword;
    user.authProvider = "local";
    await user.save();
  }

  await resetDemoLibrary(user._id);

  return user;
};

module.exports = {
  ensureDemoAccount,
};
