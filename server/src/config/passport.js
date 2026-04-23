import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from './env.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              user.profilePicture = user.profilePicture || profile.photos?.[0]?.value;
              await user.save();
            }
          } else {
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              profilePicture: profile.photos?.[0]?.value || '',
              authProvider: 'google',
            });
          }

          return done(null, user);
        } catch (err) {
          logger.error('Google OAuth error:', err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default configurePassport;
