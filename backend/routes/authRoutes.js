const express = require("express");
const {
  register,
  login,
  demoLogin,
  googleLogin,
  updateProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/google", googleLogin);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
