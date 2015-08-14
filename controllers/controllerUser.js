var mongoose = require('mongoose');
var UserCtrl= require('../model/modelUsers');
var ViscaUsers  = mongoose.model('TeamUsers');
var sha1 = require('sha1');


/**
 * It method logout a current user team
 * @param  {http} req 	
 * @param  {http} res 
 * @return it delegates into childrens     
 *  */
exports.out = function(req, res){

		res.render('logout', { name: req.body.name });

};

onGetTeamUserLogOut=function(status, data, res){
	if(status){
		res.returnDataArray=Array();
		res.returnDataArray.push(data);
		UserCtrl.updateCheck(data,onUpdateCheck,this,res);
	}else{
		res.status(400).send("Error inserting your current check, contact with me :-)");
	}
};
onUpdateCheck=function(status, data, res){
	console.log('eeee', data);
	res.status(200).send(data);
};

/**
 * It method log a current user team
 * @param  {http} req 	
 * @param  {http} res 
 * @return it delegates into childrens     
 *  
 *  */
exports.enter=function(req, res){
	if(req.body.mail===undefined || req.body.pwd===undefined){
		res.status(400).send("Uncompleted Params");
	}else{
		var requestData={};
		requestData.mail=req.body.mail;
		requestData.ip=req.connection.remoteAddress;
		requestData.pwd=req.body.pwd;
		res.requestData=requestData;
		UserCtrl.getUser(res.requestData,onGetTeamUser, this, res);
	}

	
};
/**
 * Metodo que una vez consultado el usuario lo usaº
 * @param  {boolea} status response status
 * @param  {response} data   [description]
 * @param  {http} res    
 * @return {null}        it delegates into the childrens
 */
onGetTeamUser=function(status, data, res){
	if(status){
		data.ip=res.requestData.ip;
		res.returnDataArray=Array();
		res.returnDataArray.push(data);
		UserCtrl.setCheck(data,onSetCheck,this,res);
	}else{
		res.status(400).send("Error inserting your current check, contact with me :-)");
	}
};
/**
 * Method that return to the user his response
 * @param  {boolean} status 
 * @param  {response} data   
 * @param  {http} res    
 * @return {http}        http response
 */
onSetCheck=function(status, data, res){
	if(status){
		res.returnDataArray.push(data);
		UserCtrl.getStats(res.returnDataArray[0]._id,onGetStats,this,res);
	}else{
		res.status(400).send("You cannot enter two times at the same day");
	}
	
};

onGetStats=function(status, data, res){
	if(status){
		var objRet={};
		var milisecondsHour = (9*60*60*1000);
		var currentDate = new Date( Date.now() );
		var currentDateFormated = currentDate.getDate() + '/' + ( currentDate.getMonth() + 1 ) + '/' + currentDate.getFullYear();
		objRet.name=res.returnDataArray[0].name;
		objRet.timeIn= new Date(res.returnDataArray[1].time_in).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		objRet.userIp=res.returnDataArray[1].ip_from;
		objRet.dateIn = currentDateFormated;
		objRet.possibleOutHour = new Date( Date.now() + milisecondsHour ).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		// console.log('res.returnDataArray', res.returnDataArray);
		// console.log('objRet',objRet);
		// console.log('stats',data);
		// res.returnDataArray[1] + 9h:15 ---> hora posible salida
		res.status(200).render('user_detail', {user: objRet, stats:data});
	}else{
		res.status(400).send("Fail searching statistics");
	}
};
