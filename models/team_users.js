
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
//generamos el esquema para los usarios de la app
var teamUsersSchema = new Schema({
  email:    { type: String,required:true },
  name:    { type: String,required:true },
  passwd:    { type: String,required:true }
});
teamUsersSchema.index({email:1, name:1},{unique: true});
module.exports = mongoose.model('TeamUsers', teamUsersSchema);
//{   "array": [     1,     2,     3   ],   "boolean": true,   "null": null,   "number": 123,   "object": {     "a": "b",     "c": "d",     "e": "f"   },   "string": "Hello World" }
////db.eHours.insert({email:'a@a.es', name:'a', passwd:'0cc175b9c0f1b6a831c399e269772661'})