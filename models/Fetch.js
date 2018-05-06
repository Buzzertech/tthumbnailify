var url = require('url');
var util = require('../lib/util')
var _ = require('lodash');
var imageOptions = ["maxresdefault", "default", "hqdefault", "mqdefault", "sddefault", "all"];
var acceptedOption = ["youtube.com", "youtu.be", "www.youtube.com", "m.youtube.com"]
module.exports.getSingle = (tubeurl,params)=>{
    return new Promise((resolve,reject)=>{
        let custom = url.parse(tubeurl,true);
        if(custom.href && _.includes(imageOptions,params)){
            if(_.includes(acceptedOption, custom.hostname)){
                let query = custom.query;            
                if(query.v){
                    validateAndUpload(resolve,reject,query.v, params);
                }else if(custom.path){;
                    validateAndUpload(resolve,reject,custom.path.replace('/',''), params);
                }
            }else{
                reject({code: 404, response: 'Invalid host'});
            }
            
        }else{
            reject({code: 404, response: 'Not found'});
        }
        
    })
}

var validateAndUpload = (resolve,reject, url,params)=>{
    util.createThumbLink(url, params).then((val)=>{
        util.getThumb(val,url,params).then(val=>{
            resolve({code: 200, response: val});
        }).catch(err=>{
            reject({code: 500, response: err});
            console.error(err);
        })
    }).catch((err)=>{
        resolve({code: 409, response: err});
        console.log(err);
    })
}
module.exports.getBulk = (urlArray,params)=>{
    console.log('bulk');
}

