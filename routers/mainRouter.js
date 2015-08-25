var router = require('express').Router();
var model = require('../model/index')();

function getContent(userInfo, callback) {
	'use strict';
	model.checkMain(userInfo, function(err, userChecks){
		if (err) return callback(err, null);
		return callback(null, userChecks);
	});
}

router.post('/enter', function(req, res) {
	'use strict';
	var usrInf = {};
	if ((req.body.mail).length && (req.body.pwd).length) {
		usrInf = {
			mail: req.body.mail,
			pwd: req.body.pwd,
			ip: req.connection.remoteAddress
		};
		getContent(usrInf, function(err, userChecks) {
			if (err) res.render('errors', err);
			res.cookie('teamUser', { items: [usrInf.mail, usrInf.pwd] }, 
					{ maxAge: 30 * 24 * 60 * 60 * 1000, signed: true });
			res.render('user_detail', { user: userChecks.user, stats: userChecks.stats });
		});
	}else {
		res.render('login');
	}
});

router.get('/enter', function(req, res) {
	'use strict';
	var usrInf = {};
  if (req.userCookie) {
  	usrInf = {
  		mail: req.userCookie.items[0], 
  		pwd: req.userCookie.items[1],
  		ip: req.connection.remoteAddress
  	};
  	getContent(usrInf, function(err, userChecks) {
  		if (err) res.render('errors', err);
  		res.render('user_detail', { user: userChecks.user, stats: userChecks.stats });
  	});
  }else {
		res.render('login');
	}
});

router.post('/exit', function(req, res) {
	'use strict';
	if (req.signedCookies.teamUser) {
		if (req.userCookie) delete req.userCookie;
		res.clearCookie('teamUser');
	}
	res.redirect('/');
});

module.exports = router;

/*
router.post('/enter', function(req, res) {
	'use strict';
	var userInfo = {};

  if (req.userCookie) {
  	userInfo = {
  		mail: req.userCookie.items[0], 
  		pwd: req.userCookie.items[1],
  		ip: req.connection.remoteAddress
  	};
  }else if ((req.body.mail).length && (req.body.pwd).length) {
		userInfo = {
			mail: req.body.mail,
			pwd: req.body.pwd,
			ip: req.connection.remoteAddress
		};
	}else {
		res.render('login');
	}

	if (userInfo.mail.length) {
		model.checkMain(userInfo, function(err, userChecks){
			if (err) {
				res.render('errors', err);
			}else {
				res.cookie('teamUser', { items: [req.body.mail, req.body.pwd] }, 
				{
					maxAge: 30 * 24 * 60 * 60 * 1000,
					signed: true
				});
				res.render('user_detail', { user: userChecks.user, stats: userChecks.stats });
			}
		});
	}else {
		res.render('login');
	}
 */