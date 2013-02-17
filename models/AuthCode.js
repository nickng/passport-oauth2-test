var mongoose = require('mongoose');

var AuthCodeSchema = new mongoose.Schema({
    code: String
  , clientID: String
  , redirectURI: String
  , userID: String
});

module.exports = mongoose.model('AuthCode', AuthCodeSchema);
