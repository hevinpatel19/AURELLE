const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = require('../models/User'); // Path to your User model
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  // 1. Local Strategy (for logging in with email/password)
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          // 'done' is a passport callback (error, user, info)
          return done(null, false, { message: 'That email is not registered' });
        }

        // Check the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user); // Success! Return the user
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  // 2. JWT Strategy (for protecting routes)
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.JWT_SECRET; // From your .env file

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // jwt_payload contains the { user: { id: ... } } we sent
        const user = await User.findById(jwt_payload.user.id).select('-password');
        if (user) {
          return done(null, user); // Success! Attach user to req (req.user)
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};