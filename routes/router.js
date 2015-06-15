var express = require('express');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var router = express.Router();
var user = require('../models/user.js');
var drifter = require('../models/drifter.js');
var common = require('../common/common.js');
var redis = require('../models/redis.js');

router.get('/', function(req, res) {

  // console.log(req.session.user._id)
  if (req.session.user) {
    res.render('../views/index.html', {
      title: '欢迎来到梦幻漂流瓶首页',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString(),
    });
  } else {
    req.flash('error', '请先登录');
    res.redirect('/login');
  }
});

router.get('/login', function(req, res) {
  res.render('login', {
    title: '梦幻漂流瓶登录',
    success: req.flash('success').toString(),
    error: req.flash('error').toString(),
  });
});

router.post('/login', function(req, res) {
  if (!req.body.name || !req.body.password) {
    req.flash('error', '登录信息不完整');
    return res.redirect('/login');
  }

  user.getOne({name: req.body.name}, function(err, ret) {
    if (err) {
      req.flash('error', '登录失败');
      return res.redirect('/login');
    }
    if (!ret) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (ret.password != md5.update(req.body.password).digest('hex')) {
      req.flash('error', '密码错误');
      return res.redirect('/login');
    }
    req.session.user = ret;
    req.flash('success', '登录成功');
    return res.redirect('/')
  });


});

router.get('/reg', function(req, res) {
  res.render('reg', {
    title: '梦幻漂流瓶注册',
    success: req.flash('success').toString(),
    error: req.flash('error').toString(),
  });
});

router.post('/reg', function(req, res) {
  if (!req.body.name || !req.body.password || !req.body.repassword || !req.body.email) {
    req.flash('error', '注册信息不完整');
    return res.redirect('/reg');
  }

  if (req.body.password != req.body.repassword) {
    req.flash('error', '密码不一致');
    return res.redirect('/reg');
  }

  user.getOne({name: req.body.name}, function(err, ret) {
    if (err) {
      req.flash('error', '注册失败');
      return res.redirect('/reg');
    }
    if (ret) {
      req.flash('error', '用户已存在');
      return res.redirect('/reg');
    }

    req.body.password = md5.update(req.body.password).digest('hex');

    user.save(req.body, function(err, user) {
      if (err) {
        req.flash('error', '注册失败');
        return res.redirect('/reg');
      }

      req.session.user = user;
      req.flash('success', '注册成功');
      return res.redirect('/');
    });
  });


});

router.get('/logout', function(req, res) {
  if (!req.session.user) {
    req.flash('error', '已登出');
    return res.redirect('/login');
  }

  req.session.user = null;
  req.flash('success', '登出成功');
  return res.redirect('/login');
});


router.get('/throw', common.checkLogin);
router.get('/throw', function(req, res) {
  // if (!req.session.user) {
  //   req.flash('error', '请先登录');
  //   return res.redirect('/login');
  // }
  res.render('throw', {
    title: '扔漂流瓶',
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});


router.post('/throw', common.checkLogin);
router.post('/throw', function(req, res) {

  // if (!req.session.user) {
  //   req.flash('error', '请先登录');
  //   return res.redirect('/login');
  // }

  if (!req.body.content) {
    req.flash('error', '内容不能为空');
    return res.redirect('/throw');
  }

  var bottle = {
    fromuser: req.session.user._id,
    content: req.body.content,
    createtime: Date.now()
  }

  redis.throwBottle(bottle, function(result) {
    if (result.code === 0) {
      req.flash('error', result.msg);
      return res.redirect('/throw');
    } 
    req.flash('success', result.msg);
    return res.redirect('/throw');
  });

});

router.get('/pick', common.checkLogin);
router.get('/pick', function(req, res) {
  res.render('pick', {
    user: req.session.user,
    title: '捡漂流瓶',
    success: req.flash('success').toString(),
    error: req.flash('error').toString(),
  });
});

router.post('/pick', common.checkLogin);
router.post('/pick', function(req, res) {
  var type = req.body.type;
  redis.pickBottle(req.body, function(result) {
    // console.log(result)
    if (result.code == 0) {
      req.flash('error', result.msg);
      return res.redirect('back');
    }
  
    var bottle = result.msg;
    bottle.picktime = Date.now();
    bottle.touser = req.body.userid;

    drifter.save(bottle, function(err, ret) {
      if (err) {
        req.flash('error', '操作失败');
        return res.redirect('back');
      }
      req.flash('success', '捡到一个漂流瓶');
      return res.redirect('/pick');
    });

  });
});


router.get('/bottles', common.checkLogin);
router.get('/bottles', function(req, res) {
  var query = {touser: req.session.user._id};
  drifter.getAll(query, function(err, bottles){
  
    res.render('bottles', {
      title: '我的漂流瓶',
      bottles: bottles,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString(),
      type: 1
    });
  });
});

router.post('/reply', common.checkLogin);
router.post('/reply', function(req, res) {
  if (req.body.content.trim() == "") {
    req.flash('error', '回复内容不能为空');
    return res.redirect('back');
  }
  var info = {
    bottleid: req.body.bottleId,
    type: req.body.type,
    content: req.body.content
  };

  drifter.createMessage(info, function(err, bottle) {
    if (err) {
      req.flash('error', '回复失败');
      return res.redirect('back');
    }

    req.flash('success', '回复成功');
    return res.redirect('back');
  });
});

router.get('/bottles2', common.checkLogin);
router.get('/bottles2', function(req, res) {
  drifter.getAll({fromuser: req.session.user._id, messages: {$ne: null}}, function(err, bottles) {
    if (err) {
      req.flash('error', '操作失败');
      return res.redirect('back');
    } 
    req.flash('success', '收到了回复')
    res.render('bottles', {
      title: '收到的漂流瓶',
      bottles: bottles,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString(),
      type: 0
    });
  });
});

module.exports = router;


