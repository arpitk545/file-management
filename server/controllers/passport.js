const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/auth');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const callbackURL =
  process.env.MODE === 'production'
    ? 'https://file-management-rcnk.onrender.com/api/v1/auth/google/callback'
    : 'http://localhost:4000/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CILENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (user) {
          const token = jwt.sign(
            {
              id: user._id,
              email: user.email,
              role: user.role,
              isBlocked: user.isBlocked,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return done(null, {
            token,
            email: user.email,
            role: user.role,
          });
        }

        const dummyPassword = Math.random().toString(36).slice(-8);

        const newUser = new User({
          email,
          password: dummyPassword,
          role: 'user',
          isBlocked: false,
        });

        await newUser.save();

        const token = jwt.sign(
          {
            id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            isBlocked: newUser.isBlocked,
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        return done(null, {
          token,
          email: newUser.email,
          role: newUser.role,
        });
      } catch (err) {
        console.error('Google OAuth error:', err);
        return done(err);
      }
    }
  )
);
