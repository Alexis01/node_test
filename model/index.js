var mdbClient = require('mongodb').MongoClient;

module.exports = function ring() {
	'use strict';
	var URI = 'mongodb://192.168.45.130/ehours';
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
			return null;
		}
	}

	return {
		checkIn: function(userInfo, callback) {
			mdbClient.connect(URI, function(err, db) {
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
						// Searches last date and compared with the current
						teamChecks.getCheck(user, function(err, lastCheck) {
							var now = toDateInt(new Date(Date.now()));
							var lck = toDateInt(lastCheck);
							var checkBtn;
							if (lck < now)
								checkBtn = 0; 
							else
								checkBtn = 1;
							// if (lck < now) {
							var dataArray = [];
							user.ip = userInfo.ip;
							user.checkBtn = checkBtn;
							dataArray.push(user);

							teamChecks.setCheck(user, function(err, check) {
								if (err) return callback(err, null);

								dataArray.push(check);
								teamChecks.getStats(dataArray[0]._id, function(err, statsArr) {
									if (err) {
										errMsg= 'Fail searching statistics';
										return callback({message: errMsg, err: err});
									}else {
										var date = new Date( Date.now());
										var stringDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
										var userCheckIn = {
											name: dataArray[0].name,
											timeIn: new Date(dataArray[1].time_in).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"),
											useIp: dataArray[1].ip_from,
											dateIn: stringDate,
											possibleOutHour: new Date(Date.now() + (9*60*60*1000)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")
										};
										db.close();
										return callback(null, {user: userCheckIn, stats: statsArr});
									}
								});
							});
							// else {
							// 	db.close();
							// 	errMsg = 'You can not enter two times at the same day';
							// 	return callback({message: errMsg, err: err}, null);
							// }
						});
					}
				});
			});
		},
		checkOut: function(userInfo, callback) {
			mdbClient.connect(URI, function(err, db) {
				if (err) {
					return callback({message: errMsg, err: err}, null);
				}
				var teamUsers = require('./users')(db);
				var teamChecks = require('./checks')(db);

				var rawDate = Date.now();
				var date = new Date(rawDate);
				var	stringDate = date.getDay() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
				teamChecks.updateCheck(userInfo, rawDate, function(err) {
					if (err) return callback(err, null);
					return callback(null, stringDate);
				});
			});
		}
	};
};
