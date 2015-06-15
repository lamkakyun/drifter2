var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash')
var mongoStore = require('connect-mongo')(session);

var settings = require('./settings.js');
var router = require('./routes/router.js');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', require('jade').__express);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {maxAge: 1000 * 60 * 24 * 30},
  resave: true,
  saveUninitialized: true,
  store: new mongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));

app.use(router);

app.use(function(req, res, next) {
  res.render('error');
  next();
});

app.listen(8000);

