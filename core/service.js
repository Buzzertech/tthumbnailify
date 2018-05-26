var redis = require('redis');
var redisNotifier = require('redis-notifier');
var eventNotifier = new redisNotifier(redis);
var config = require('../lib/config');
var cloudinary = require('cloudinary');
var _ = require('lodash');
var client = redis.createClient();

 module.exports.subscribe = function(){
   eventNotifier.on('message', function(pattern, channelPattern, emittedKey){
       var channel = this.parseMessageChannel(channelPattern);
       console.log('here');
       console.log('key:',channel.key)
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

module.exports.invalidateExplicitly = function(){
    client.hgetall(config.notification.key,(err,keys)=>{
        if(err) throw err;

        _.forEach(keys, (key,value)=>{
            client.hexists(value, "public_id", (err,reply)=>{
                if(err) throw err;
                console.log(reply);
                if(!reply){
                    console.log(value);
                    cloudinary.uploader.destroy(value).then(()=>{
                        client.hdel(config.notification.key, value);
                    });
                }
            })
        })
    })
}