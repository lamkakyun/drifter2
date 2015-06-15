var redis = require('redis');
var client0 = redis.createClient();
var client1 = redis.createClient();
var client2 = redis.createClient();

client0.auth('123', function(err) {
  console.log(err?err:'auth success');
});

client1.auth('123', function(err) {
  console.log(err?err:'auth success');
});

client2.auth('123', function(err) {
  console.log(err?err:'auth success');
});

var pExpireTime = 1000 * 24 * 60 * 60;

exports.throwBottle = function(bottle, callback) {
  client1.SELECT(1, function() {
    client1.GET(bottle.fromuser, function(err, ret) {
      if (err) return callback({code: 0, msg: '操作失败'});
      if (ret >= 10) {
        return callback({code: 0, msg: '你今天扔漂流瓶的次数用完了'});
      }

      client1.INCR(bottle.fromuser, function() {
        client1.TTL(bottle.fromuser, function(err, ttl) {
          if (ttl === -1) {
            var _d = new Date();
            var today = new Date(_d.getFullYear() + '-' + (_d.getMonth() + 1) + '-' + _d.getDate() + " 00:00:00");
            var leftTime = pExpireTime - Date.now() + today.getTime();
            client1.PEXPIRE(bottle.fromuser, leftTime);
          }
        });
      });

      
      client0.SELECT(0, function() {
        var bottleId = Math.random().toString(16);
        client0.HMSET(bottleId, bottle, function(err, result) {
          if (err) {
            return callback({code: 0, msg: '操作失败'});
          }

          callback({code: 1, msg: '操作成功'});
          client0.EXPIRE(bottleId, pExpireTime);
        });
      });

    });
  });

};

exports.pickBottle = function(info, callback) {
  client2.SELECT(2, function() {
    client2.GET(info.userid, function(err, ret) {
      if (err) {
        return callback({code: 0, msg: '操作失败'});
      }
      if (ret >= 10) {
        return callback({code: 0, msg: '你今天捡漂流瓶的次数用完'});
      }

      client2.INCR(info.userid, function() {
        client2.TTL(info.userid, function(err, ttl) {
          if (ttl === -1) {
            var _d = new Date();
            var today = new Date(_d.getFullYear() + '-' + (_d.getMonth() + 1) + '-' + _d.getDate() + " 00:00:00");
            var leftTime = pExpireTime - Date.now() + today.getTime();
            client2.PEXPIRE(info.userid, leftTime);
          }
        });
      });

      if (Math.random() <= 0.2) {
        return callback({code: 0, msg: '海星'});
      }

      client0.SELECT(0, function() {
        client0.RANDOMKEY(function(err, bottleId) {
          if (err) {
            return callback({code: 0, msg: '操作失败'});
          }

          client0.HGETALL(bottleId, function(err, bottle) {
            if (err) {
              return callback({code: 0, msg: '操作失败'});
            }
            client0.DEL(bottleId);
            return callback({code: 1, msg: bottle});
          });
        });
      });

    });
  });
};
