const express = require('express');
const passport = require('../auth/google');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Step 1: Redirect to Google
router.get(
  '/',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Callback
router.get(
  '/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      if (err) return res.redirect(`${clientUrl}/login?error=server_error`);
      if (!user) {
        if (info && info.message === 'not_found') {
          return res.redirect(`${clientUrl}/register?error=google_not_found`);
        }
        return res.redirect(`${clientUrl}/login?error=auth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const user = req.user;

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Redirect to frontend
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/login-success?token=${token}`);
  }
);

module.exports = router;
