var mongoose = require('mongoose');
var TeamUsers  = mongoose.model('TeamUsers');
var TeamChecks = mongoose.model('TeamCheck');

var sha1 = require('sha1');
var deasync = require('deasync');
var cp = require('child_process');
var exec = deasync(cp.exec);

exports.getStats=function(id_user, callback, context,res){
    var toFind={};
    toFind.user_id=id_user;
    TeamChecks.find(toFind,function(err, checks) {
        if(err){
            callback.call(context,false,null,res);
        } 
        else{
            callback.call(context,true,checks,res);
        }
    });
};



/**
 * Set time_out hour
 * @param  {[type]}   teamUser [description]
 * @param  {Function} callback [description]
 * @param  {[type]}   context  [description]
 * @param  {[type]}   res      [description]
 * @return {[type]}            [description]
 */
exports.updateCheck=function(teamUser,callback, context, res){
    var fecha=new Date(Date.now());
    var date_key=fecha.getDay()+'/'+fecha.getMonth()+'/'+fecha.getFullYear();
    console.log('user', teamUser);
    var toFind={};
    toFind.user_id=teamUser._id;
    toFind.date_in=date_key;
    TeamChecks.find(toFind,function(err, check) {
        console.log(check);
        if(err){
            callback.call(context,false,null,res);
        } 
        else{
            TeamChecks.findById(check[0]._id, function(err, check) {
                check.time_out=Date.now();
                check.save(function(err) {
                    if(err){
                        callback.call(context, false, null,res);  
                    }
                    else{
                         var fechaOut=new Date(Date.now());
                        callback.call(context, true, fecha.getDay()+'/'+fecha.getMonth()+'/'+fecha.getFullYear(),res);
                    } 
                    
                });
            });
            /**/
        }
    });
};

/**
 * set intro check to user
 * @param {TeamUser}   teamUser 
 * @param {onSetCheck} callback 
 * @param {jsContext}   context  
 * @param {http}   res      http response
 */
exports.setCheck=function(teamUser, callback, context, res){
    var fecha=new Date(Date.now());
    console.log(fecha);
    var mix=fecha.getDate()+'/'+(fecha.getMonth()+1)+'/'+fecha.getFullYear();
    var hourInFormated = new Date(Date.now()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    console.log(mix);
    var check= new TeamChecks({
        user_id: teamUser._id,
        time_in: Date.now(),
        time_out: null,
        hour_in: hourInFormated,
        hour_out: null,
        ip_from: teamUser.ip,
        date_in: mix
    });
    check.save(function(err, data) {
        if(err){
            callback.call(context,false,data,res);
        } 
        else{
            callback.call(context,true,data,res);
        }
    });
};


/**
 * Method that get user from an email
 * @param  {strint}   mail     
 * @param  {onGetUser} callback 
 * @param  {js context}   context  
 * @param  {http}   httpRes  
 * @return {teamUser}    returns an exist user
 */
exports.getUser=function(data, callback, context,httpRes){
    TeamUsers.find({email:data.mail,passwd:sha1(data.pwd)},function(err, teamUser) {
        if(err){
            callback.call(context,false,teamUser,httpRes);
        } 
        else{
            callback.call(context,true,teamUser[0],httpRes);
        }
    });
}





