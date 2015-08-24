var express = require('express');
var swig = require('swig');
var bodyParser  = require("body-parser");
var cookieParser = require('cookie-parser');

var mainController = require('./routers/mainRouter');
var conf = require('./conf/config');

var app = express();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

app.use(express.static(__dirname + '/assets'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(conf.secret));

app.use(function(req, res, next) {
  if (req.signedCookies.teamUser) {
  	req.userCookie = req.signedCookies.teamUser;
  }
  next();
});

app.get('/', function(req, res, next) {
	if (req.userCookie) {
		res.redirect('/team/enter');
	}else {
		res.render('login');
	}
});
app.use('/team', mainController);


var port = normalizePort(process.env.PORT || '3090');

app.listen(port, function() {
  console.log("Server listening on http://localhost:3090");
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
