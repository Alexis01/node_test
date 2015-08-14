
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
//generamos el esquema para los usarios de la app
var teamCheckSchema = new Schema({
  user_id:    { type: String },
  time_in: {type : Number},
  time_out: {type : Number },
  hour_in: {type : String },
  hour_out: {type : String },
  ip_from: { type: String },
  date_in: {type: String}
});
teamCheckSchema.index({user_id:1, date_in:1},{unique: true});
module.exports = mongoose.model('TeamCheck', teamCheckSchema);