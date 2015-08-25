'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// TeamCheck
module.exports = new Schema({
	user_id: { type: String },
	time_in: { type : Number },
	time_out: { type : Number },
	hour_in: { type : String },
	hour_out: { type : String },
	ip_from: { type: String },
	date_in: { type: String }
}).index({ user_id:1, date_in:1 }, { unique: true });