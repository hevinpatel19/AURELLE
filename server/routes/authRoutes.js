const express = require('express');
const router = express.Router();

// VVV CRITICAL: IMPORT MUST MATCH EXPORT VVV
const { register, login } = require('../controllers/authController');

// Debug check (Optional: Prints to terminal to prove they are loaded)
if (!register || !login) {
  console.error("FATAL ERROR: Auth Controller functions not loaded. Check exports in authController.js");
}

// 1. Register Route
router.post('/register', register); 

// 2. Login Route
router.post('/login', login);

module.exports = router;