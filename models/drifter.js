var mongoose = require('./db.js');

var model = mongoose.model('bottle', new mongoose.Schema({
  fromuser: {type: String, required: true},
  touser: {type: String},
  content: {type: String},
  createtime: {type: Date, required: true},
  messages: {type: Array},
  picktime: {type: Date}
}));

var drifter = {};

drifter.save = function(bottle, callback) {
  model.create(bottle, function(err, ret) {
    if (err) return callback(err);
    return callback(null, ret);
  });
};

drifter.getAll = function(query, callback) {
  model.find(query, null,{sort:{picktime: -1}}, function(err, bottles) {
    if (err) return callback(err);
    return callback(null, bottles);
  });
};

drifter.createMessage = function(info, callback) {
  model.update({_id: require('mongodb').ObjectId(info.bottleid)}, {$push: {messages: {"type": info.type, msg: info.content, replytime: Date.now()}}}, function(err, bottle) {
    if (err) return callback(err);
    callback(null, bottle);
  });
};

module.exports = drifter;

