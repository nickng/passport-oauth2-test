/**
 * Password authentication.
 */

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('./models/User');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
  function(email, password, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, { message: "Username invalid." }); }
      return user.authenticate(password, done);
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, {id: user._id, email: user.email, name: user.name.full, affiliation: user.affiliation});
});

passport.deserializeUser(function(user, done) {
  User.findById(user.id, function(err, user) {
    done(err, user);
  });
});
