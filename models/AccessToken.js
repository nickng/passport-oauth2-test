var mongoose = require('mongoose');

var AccessTokenSchema = new mongoose.Schema({
    token: String
  , userID: String
  , clientID: String
});

module.exports = mongoose.model('AccessToken', AccessTokenSchema);
