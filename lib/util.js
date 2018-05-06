'use strict';
var fs = require('fs');
var config = require('./config')
var request = require('request');
var url = require('url');
var caching = require('../core/caching');
var cloudinary = require('cloudinary');
cloudinary.config(config.cloudinary);

module.exports.createThumbLink = (videoId, type) => {
    return new Promise((resolve, reject) => {
        caching.checkEntry(videoId, type).then((val) => {
            if (val) {
                caching.getEntry(videoId, type).then((val => {
                    console.log(JSON.stringify(val));
                    reject(val);
                })).catch((err) => {
                    console.error(err);
                })

            } else {
                console.log('doesn\'t exists');
                resolve(`https://i1.ytimg.com/vi/${videoId}/${type}.jpg`);
            }

        })
    })
    //return `https://i1.ytimg.com/vi/${videoId}/${type}.jpg`;
}

var generateUid = (t) => {
    return `${Math.random().toString(36).substr(2,8)}_YouTube${t}`;
}

module.exports.getThumb = (thumb, id, type) => {
    return new Promise((resolve, reject) => {
        const uid = generateUid(id);
        //let file = fs.createWriteStream(`${config.tmp}/${uid}.jpg`);
        var file = "";
        //request(thumb).pipe(file);
        cloudinary.uploader.upload(thumb).then((result) => {
            if(result){
                file = result.secure_url;
                caching.addEntry(id, type, file).then((val) => {
                    console.log('added entry', val);
                    resolve(file);
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                })
            }else{
                reject('Error');
            }
            
        }).catch(err=>{
            console.error(err);
            reject(err);
        })

    });
}