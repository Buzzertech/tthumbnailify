const Promise = require('bluebird');
const redis = Promise.promisifyAll(require('redis'));
var config = require('../lib/config');

var client = redis.createClient();
client.on('connect', () => {
    console.log('connected');
})

module.exports.addEntry = (id, type, url, public_id) => {
    return new Promise((resolve, reject) => {
        const key = createKey(id,type);
        client.hsetAsync(key, "url", url)
        .then(()=>{return client.hsetAsync(key, "public_id", public_id)})
        .then(()=>{ return client.hsetAsync(config.notification.key, key, public_id)})
        .then(()=>{
            resolve('done');
        }).catch((err)=>{
            console.error(err);
            reject(err);
        })
        client.expire(key, 86400);
    })
}

module.exports.getEntry = (id,type)=>{
    return new Promise((resolve,reject)=>{
        const key = createKey(id,type);
        client.hgetAsync(key, "url").then((val)=>{
            client.expire(key, 86400);
            resolve(val);
        }).catch(err=>{
            console.error(err);
            reject(err);
        })
    })
}

module.exports.checkEntry = (id, type) => {
    return new Promise((resolve,reject)=>{
        const key = createKey(id,type);
        client.existsAsync(key).then((val)=>{
            if(val){
                resolve(true);
            }else{
                resolve(false);
            }
        }).catch((err)=>{
            console.error(err);
            reject(err);
        })
    });

}

var createKey = (id,type)=>{
    return `${id}_${type}`;
}