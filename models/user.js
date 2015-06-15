var mongoose = require('./db.js');

var model = mongoose.model('user', new mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String},
  sex: {type: Number, default: 1},
  createtime: {type: Date, default: Date.now}
}));

var user = {};

// user.getAll = function(callback) {
//   model.find({}, function(err, users) {
//     if (err) return callback(err);
//     callback(null, users);
//   });
// };

user.getOne = function(query, callback) {
  model.findOne(query, function(err, user) {
    if (err) return callback(err);
    return callback(null, user);
  });
};

user.save = function(user, callback) {
  model.create(user, function(err, user) {
    if (err) return callback(err);
    return callback(null, user);
  });
};

module.exports = user;
