module.exports = function(db) {
	'use strict';
	var teamChecks = db.collection("teamchecks");
	var errMsg = '';
	return {
		/**
		 * Gets the last check date
		 * @param  {Object}   userInfo login user info
		 * @param  {Function} callback null, lastCheck
		 * @return {Function}            callback
		 */
		getCheck: function(userInfo, callback) {
			teamChecks.find({user_id: userInfo._id}).limit(1).sort({'time_in':-1})
			.toArray(function(err, lastCheck) {
				return callback(null, lastCheck[0].time_in);
			});
		},
		/**
		 * User checkin
		 * @param {Object}   user     user info
		 * @param {Function} callback error, user-info
		 */
		setCheck: function(userInfo, callback) {
			var date = new Date(Date.now());
			var stringDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
			var stringHour = new Date(Date.now()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
			var newCheck = {
				user_id: userInfo._id,
		        time_in: Date.now(),
		        time_out: null,
		        hour_in: stringHour,
		        hour_out: null,
		        ip_from: userInfo.ip,
		        date_in: stringDate
			};
			teamChecks.insertOne(newCheck, {w:1}, function(err, result) {
				if (err) {
					errMsg = 'Error inserting your current check, contact with me :-)';
					return callback({message: errMsg, err: err}, result);
				}else {
					if (result) {
						return callback(null, newCheck);
					}else {
						return callback('Error: insert fail!', null);
					}
				}
			});
		},
		/**
		 * Update when checkout
		 * @param  {Object} user user-info
		 * @param  {Function} callback err, string checkout date
		 */
		updateCheck: function(userInfo, timeStamp, callback) {
			teamChecks.update({  _id: userInfo._id }, { $set: { time_out: timeStamp }})
			.then(function(result) {
				return callback(!result);
			});
		},
		/**
		 * Gets users checks statistics
		 * @param  {String}   userId   document _id
		 * @param  {Function} callback 
		 * @return {Function}            err, checks array
		 */
		getStats: function(userId, callback) {
			teamChecks.find({ user_id: userId }).toArray(function(err, checks) {
					if (err) {
						return callback(err, checks);
					}else {
						return callback(!checks.length, checks);
					}
			});
		}
	};
};
