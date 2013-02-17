/**
 * OAuth2 Token authentication.
 */

var passport = require('passport')
  , BearerStrategy = require('passport-http-bearer').Strategy
  , AccessToken = require('./models/AccessToken')
  , User = require('./models/User');

/**
 * BearerStrategy authenticates users based on an access token.
 * The access token is associated to a user with an authorised
 * client application (web/mobile app), for making requests on
 * behalf of the authorising user.
 */
passport.user(new BearerStrategy(
  function(accessToken, done) {
    console.log('access_token=' + accessToken);
    AccessToken.find(accessToken, function(err, token) {
      if (err) { return done(err); }
      if (!token) { return done(null, false, { message: 'access_token invalid' }); }

      User.find(token.userId, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'No user associated to access_token' }); }

        var info = { scope: '*' }; // TODO Change me to limit permission (from database)
        done(null, user, info);
      });
    });
  }));
