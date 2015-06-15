/** 
 * @file db.js
 * @Synopsis  数据库操作的基类
 * @author Mathias Lorente
 * @version 0.0.1
 * @date 2015-06-12
 */

var mongoose = require('mongoose');
var settings = require('../settings.js');

mongoose.connect('mongodb://' + settings.host + ":" + settings.port + "/" + settings.db);

module.exports = mongoose;
