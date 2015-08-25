'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//TeamUsers
module.exports = new Schema({
  email: { type: String,required:true },
  name: { type: String,required:true },
  passwd: { type: String,required:true }
}).index({ email:1, name:1 }, { unique: true });