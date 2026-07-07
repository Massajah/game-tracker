const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ensureDemoAccount } = require("../utils/demoAccount");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (userId) => {
  // Keep the JWT payload minimal; the client stores display profile data separately.
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const toAuthUser = (user, extra = {}) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  ...extra,
});

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      token,
      user: toAuthUser(user),
    });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: toAuthUser(user),
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
};

exports.demoLogin = async (req, res) => {
  try {
    const user = await ensureDemoAccount();
    const token = createToken(user._id);

    res.json({
      token,
      user: toAuthUser(user, { isDemo: true }),
    });
  } catch {
    res.status(500).json({ error: "Demo login failed" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, email, name } = payload;

    if (!email) {
      return res.status(400).json({ error: "Google account email not found" });
    }

    // Link existing email/password accounts to Google instead of creating duplicates.
    let user = await User.findOne({
      $or: [{ googleId: sub }, { email }],
    });

    if (!user) {
      user = await User.create({
        username: name || email.split("@")[0],
        email,
        googleId: sub,
        authProvider: "google",
      });
    } else if (!user.googleId) {
      user.googleId = sub;
      user.authProvider = user.authProvider || "google";
      await user.save();
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: toAuthUser(user),
    });
  } catch {
    res.status(401).json({ error: "Google login failed" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 2) {
      return res.status(400).json({
        error: "Username must be at least 2 characters",
      });
    }

    const trimmedUsername = username.trim();

    // Exclude the current account so saving an unchanged username is allowed.
    const existingUser = await User.findOne({
      username: trimmedUsername,
      _id: { $ne: req.user.userId },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Username is already taken",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username: trimmedUsername },
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    res.json({
      user: toAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update profile",
    });
  }
};
