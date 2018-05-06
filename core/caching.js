const Promise = require('bluebird');
const redis = Promise.promisifyAll(require('redis'));
var client = redis.createClient();

client.on('connect', () => {
    console.log('connected');
})

module.exports.addEntry = (id, type, url) => {
    return new Promise((resolve, reject) => {
        const key = createKey(id,type);
        client.setAsync(key, url).then((res)=>{
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
        client.getAsync(key).then((val)=>{
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