const passport = require('passport');

// This part is correct
const protect = passport.authenticate('jwt', { session: false });

// VVVV --- THIS IS THE FIX --- VVVV
const isAdmin = (req, res, next) => {
  // Check 'role' instead of 'isAdmin'
  if (req.user && req.user.role === 'admin') { 
    next(); // Yes, they are an admin. Proceed.
  } else {
    // No, they are not. Deny access.
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
// ^^^^ --- THIS IS THE FIX --- ^^^^

module.exports = { protect, isAdmin };