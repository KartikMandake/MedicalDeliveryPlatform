const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "966623745791-30evi0do388badtun0p2li9oqdrn0imc.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const picture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

        // Save or find user in PostgreSQL
        let user = await User.findOne({ where: { email } });

        if (!user) {
          // Check if Google ID exists
          user = await User.findOne({ where: { googleId: profile.id } });
        }

        if (user) {
          // Update user if they don't have googleId or their profile picture changed
          user.googleId = profile.id;
          if (picture) user.profilePic = picture;
          await user.save();
          return done(null, user);
        } else {
          // Do NOT create an account automatically.
          // Instruct them to sign up first.
          return done(null, false, { message: 'not_found' });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
