var redis = require('redis');
var redisNotifier = require('redis-notifier');
var eventNotifier = new redisNotifier(redis);
var config = require('../lib/config');
var cloudinary = require('cloudinary');
var client = redis.createClient();

 module.exports = function(){
   eventNotifier.on('message', function(pattern, channelPattern, emittedKey){
       var channel = this.parseMessageChannel(channelPattern);
       console.log('here');
       if(channel.key === 'expired'){
           client.hget(config.notification.key, emittedKey, (err,value)=>{
                if(err){
                    throw err;
                }

                cloudinary.uploader.destroy(value).then(()=>{
                    client.hdel(config.notification.key, emittedKey);
                });
           });
       }
   })
}