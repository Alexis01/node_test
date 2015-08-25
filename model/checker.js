/* global require */
/* global console */
/* global module */
var mongoose = require('mongoose');

module.exports = function() {
	"use strict";
	var URI = 'mongodb://localhost:27017/ehours';
	// var URI = 'mongodb://192.168.45.130/ehours';
	// CONNECTION POOL
	mongoose.createConnection(URI, { server: { poolSize: 4 }});

	function ModelTeamChecks() {
		var checksSchema = require('./schemas/checks_schema');
		return mongoose.model('TeamCheck');
	}

	return {
		/**
		 * Get user
		 * @param  {Objet}   data     user: mail, passwd
		 * @param  {Function} callback callback
		 * @return {Function}            hit and user find result
		 */
		getUser: function(data, callback) {
			var sha1 = require('sha1');
			var usersSchema = require('./schemas/users_schema');
			var teamUsers = mongoose.model('TeamUsers');
			teamUsers.findOne({ email:data.mail, passwd:sha1(data.pwd) },
				function(err, teamUser) {
					if (err || !teamUser) {
						console.log('checker.getUser.err', err);
						console.log('checker.getUser.teamUser', teamUser);
						return callback(false, teamUser);
					}else {
						return callback(true, teamUser);
					}
			});
		},
		/**
		 * User checkin
		 * @param {Object}   user     user info
		 * @param {Function} callback error, user-info
		 */
		setCheck: function(user, callback) {
			var date = new Date(Date.now());
			var stringDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
			var stringHour = new Date(Date.now()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
			var checks = new ModelTeamChecks({
				user_id: user._id,
		        time_in: Date.now(),
		        time_out: null,
		        hour_in: stringHour,
		        hour_out: null,
		        ip_from: user.ip,
		        date_in: stringDate
			});
			checks.save(function(err, check, done) {
				if (err || !done) {
					return callback(err, check);
				}else {
					return callback(null, check);
				}
			});
		},
		/**
		 * Update when checkout
		 * @param  {Object} user user-info
		 * @param  {Function} callback err, string checkout date
		 */
		updateCheck: function(user, callback) {
			var date = new Date(Date.now());
			var	stringDate = date.getDay() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
			var teamChecks = ModelTeamChecks();
			teamChecks.update({ _id: user._id }, { $set: { time_out: Date.now() }},
				function(err, raw) {
					if (err) {
						return callback(true, stringDate);
					}else {
						return callback(null, stringDate);
					}
			});
		},
		getStats: function(userId, callback) {
			var teamChecks = ModelTeamChecks();
			teamChecks.find({ user_id: userId }, 
				function(err, checks) {
					if (err || !checks.length) {
						console.log('checker.getStats.err', err);
						return callback(true, checks);
					}else {
						return callback(null, checks);
					}
			});
		}
	};
};
