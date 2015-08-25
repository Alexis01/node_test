var mdbClient = require('mongodb').MongoClient;
var config = require('../conf/config');

module.exports = function ring() {
	'use strict';
	var errMsg = 'Error: data base connection fail!';

	function toDateInt(tS) {
		try {
			if (isNaN(tS)) { // String
				return Date.parse(tS);
			}else {
				var d = new Date(tS); // Integer
				return Date.parse( 
					Date(d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear())
					);
			}
		}catch(err) {
			return -1;
		}
	}

	return {
		checkMain: function(userInfo, callback) {
			mdbClient.connect(config.UrlMongo, function(err, db) {
				if (err) {
					return callback({message: errMsg, err: err}, null);
				} 
				var teamUsers = require('./users')(db);
				var teamChecks = require('./checks')(db);

				teamUsers.getUser(userInfo, function(err, user) {
					if (err) {
						errMsg = 'You are not a team user.';
						return callback({message: errMsg, err: err}, null);
					}else {
						var dataArray = [];
						user.ip = userInfo.ip;
						var checkBtn = -1;
						// Searches last date checkin and compared with the current
						teamChecks.getCheck(user, { time_in: -1 }, function(err, lastCheckIn) {
							var now = toDateInt(new Date(Date.now()));
							var lcki = toDateInt(lastCheckIn.time_in);
							if (lcki < now) {
								checkBtn = 0; // SET checkBtn to CHECK-IN
							}else {
								user.checkin = lcki;
							}
							// Searches last date checkout and compared with the current
							teamChecks.getCheck(user, { time_out: -1 }, function(err, lastCheckOut) {
								var lcko = toDateInt(lastCheckOut.time_out);
								if (lcko < now) {
									checkBtn = 1; // SET checkBtn TO CHECK-OUT
								}else {
									user.checkout = lcko;
								}						
								if (checkBtn !== 0 || checkBtn !== 1) checkBtn = 2; // SET checkBtn TO DISALLOW
								user.checkBtn = checkBtn;
								dataArray.push(user);

								teamChecks.getStats(dataArray[0]._id, function(err, statsArr) {
									if (err) {
										errMsg= 'Fail searching statistics';
										return callback({message: errMsg, err: err});
									}else {
										// var date = new Date( Date.now());
										// var stringDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
										var userCheck = {
											name: dataArray[0].name,
											checkBtn: dataArray[0].checkBtn,
											timeIn: (checkBtn > -1)? new Date(lastCheckIn.time_in).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") : null,
											timeOut: (checkBtn > 0)? new Date(lastCheckOut.time_out).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") : null,
											useIp: user.ip,
											dateIn: (checkBtn > -1)? lcki : null,
											dateOut: (checkBtn > 0)? lcko : null,
											possibleOutHour: new Date(Date.now() + (9*60*60*1000)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")
										};
										db.close();
										return callback(null, {user: userCheck, stats: statsArr});
									}
								});
							});
						});
					}
				});
			});
		},
		checkIn: function(userInfo, callback) {
			mdbClient.connect(config.UrlMongo, function(err, db) {
				if (err) {
					return callback({message: errMsg, err: err}, null);
				} 
				var teamUsers = require('./users')(db);
				var teamChecks = require('./checks')(db);

				teamUsers.getUser(userInfo, function(err, user) {
					if (err) {
						errMsg = 'You are not a team user.';
						return callback({message: errMsg, err: err}, null);
					}else {
						teamChecks.setCheck(user, function(err, check) {
							if (err) return callback(err, null);
							
							teamChecks.getStats(user._id, function(err, statsArr) {
								if (err) {
									errMsg= 'Fail searching statistics';
									return callback({message: errMsg, err: err});
								}else {
									var userCheckIn = {
										name: user.name,
										checkBtn: 1,
										timeIn: (checkBtn > -1)? new Date(Date.now()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") : null,
										timeOut: null,
										useIp: user.ip,
										dateIn: toDateInt(new Date(Date.now())),
										dateOut: null,
										possibleOutHour: new Date(Date.now() + (9*60*60*1000)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")
									};
									db.close();

									return callback(null, {user: userCheckIn, stats: statsArr});
								}
							});
						});
					}
				});
			});
		},
		checkOut: function(userInfo, callback) {
			mdbClient.connect(config.UrlMongo, function(err, db) {
				if (err) {
					return callback({message: errMsg, err: err}, null);
				} 
				var teamUsers = require('./users')(db);
				var teamChecks = require('./checks')(db);

				teamUsers.getUser(userInfo, function(err, user) {
					if (err) {
						errMsg = 'You are not a team user.';
						return callback({message: errMsg, err: err}, null);
					}else {
						teamChecks.updateCheck(user, function(err, check) {
							if (err) return callback(err, null);
							
							teamChecks.getStats(user._id, function(err, statsArr) {
								if (err) {
									errMsg= 'Fail searching statistics';
									return callback({message: errMsg, err: err});
								}else {
									var userCheckOut = {
										checkBtn: 2,
										timeOut: new Date(Date.now()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"),
										dateOut: toDateInt(new Date(Date.now())),
									};
									db.close();
									
									return callback(null, {user: userCheckOut, stats: statsArr});
								}
							});
						});
					}
				});
			});
		}
	};
};
