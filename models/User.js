var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: { type: String, unique: true }
  , password: String
  , name: {
        first: String
      , last: String
    }
  , affiliation: String
  , submissions: [{ type: mongoose.Schema.ObjectId, ref: 'Submission' }]
  , active: Boolean
});

module.exports = mongoose.model('User', UserSchema);
