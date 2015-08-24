module.exports = function(db) {
	'use strict';
	var teamUsers = db.collection("teamusers");
	return {
		/**
		 * Gets team user information
		 * @param  {Object}   userInfo login user info
		 * @param  {Function} callback err, user doc
		 * @return {Function}            callback
		 */
		getUser: function(userInfo, callback) {
			var sha1 = require('sha1');
			teamUsers.findOne({email:userInfo.mail, passwd:sha1(userInfo.pwd)})
			.then(function(user) {
				if (user) {
					return callback(null, user);
				}else {
					return callback("User not found.", null);
				}
			});
		}
	};
};
