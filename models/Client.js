var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
    id: String
  , name: String
  , clientID: String
  , clientSecret: String
});

module.exports = mongoose.model('Client', ClientSchema);
