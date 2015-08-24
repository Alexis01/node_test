var router = require('express').Router();
var model = require('../model/index')();

router.all('/enter', function(req, res) {
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
		model.checkIn(userInfo, function(err, userChecks){
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
