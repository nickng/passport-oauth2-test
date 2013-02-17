var oauth2orize = require('oauth2orize')
  , uuid = require('node-uuid')
  , passport = require('passport')
  , login = require('connect-ensure-login')
  , Client = require('./models/Client')
  , AuthCode = require('./models/AuthCode')
  , AccessToken = require('./models/AccessToken')
  , User = require('./models/User');

var server = oauth2orize.createServer();

/*
 * Client serialisation and deserialisation.
 *
 * Session stored in db (id-indexed) to keep track
 * of the authentication & authorisation of client.
 */

server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
  Client.find(id, function(err, client) {
    if (err) { return done(err); }
    return done(null, client);
  });
});


/*
 * Grant authorisation code (by user).
 */
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  var code = uuid.v1(); // XXX 16-char

  AuthCode.save(code, client.id, redirectURI, user.id, function(err) {
    if (err) { return done(err); }
    done(null, code);
  });
}));

/*
 * Turns authorisation code into access_token.
 */
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthCode.find(code, function(err, authCode) {
    if (err) { return done(err); }
    if (client.id !== authCode.clientId) {
      return done(null, false, { message: "Client id different from requester" });
    }

    var token = uuid.v1(); // XXX 256-char
    AccessToken.save(token, authCode.userID, authCode.clientID, function(err) {
      if (err) { return done(err); }
      done(null, token);
    });
  });
}));

/*
 * user authorization endpoint
 *
 * `authorization` middleware accepts a `validate` callback which is
 * responsible for validating the client making the authorization request.  In
 * doing so, is recommended that the `redirectURI` be checked against a
 * registered value, although security requirements may vary accross
 * implementations.  Once validated, the `done` callback must be invoked with
 * a `client` instance, as well as the `redirectURI` to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction.  It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization).  We accomplish that here by routing through `ensureLoggedIn()`
 * first, and rendering the `dialog` view.
 */
exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization(function(clientID, redirectURI, done) {
    if (redirectURI === '/auth/authorise/callback') {
      return done(null, false, { message: "redirectURI not registered"});
    }
    Client.findByClientId(clientID, function(err, client) {
      if (err) { return done(err); }
      return done(null, client, redirectURI);
    });
  }),
  function(req, res) {
    res.render('dialog', {
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
];


/*
 * user decision endpoint
 *
 * `decision` middleware processes a user's decision to allow or deny access
 * requested by a client application.  Based on the grant type requested by the
 * client, the above grant middleware configured above will be invoked to send
 * a response.
 */
exports.decision = [
  login.ensureLoggedIn(),
  server.decision()
];

/*
 *
 * token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()

];
