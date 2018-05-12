'use strict';
var fs = require('fs');
var config = require('./config')
var request = require('request');
var url = require('url');
var caching = require('../core/caching');
var cloudinary = require('cloudinary');
var archiver = require('archiver');

cloudinary.config(config.cloudinary);

module.exports.createThumbLink = (videoId, type) => {
    return new Promise((resolve, reject) => {
        caching.checkEntry(videoId, type).then((val) => {
            if (val) {
                caching.getEntry(videoId, type).then((val => {
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

module.exports.generateUid = (t) => {
    if (t) {
        return `${Math.random().toString(36).substr(2,8)}_YouTube${t}`;
    } else {
        return `${Math.random().toString(36).substr(2,8)}_YouTube`;

    }
}

module.exports.getThumb = (thumb, id, type) => {
    return new Promise((resolve, reject) => {
        const uid = module.exports.generateUid(id);
        //let file = fs.createWriteStream(`${config.tmp}/${uid}.jpg`);
        var file = "";
        //request(thumb).pipe(file);
        cloudinary.uploader.upload(thumb, null, {
            async: true
        }).then((result) => {
            if (result) {
                var public_id = result.public_id;
                file = result.secure_url;
                caching.addEntry(id, type, file, public_id).then((val) => {
                    console.log('added entry', val);
                    resolve(file);
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                })
            } else {
                reject('Error');
            }

        }).catch(err => {
            if (err.http_code === 404 && err.message.includes('maxresdefault')) {
                cloudinary.uploader.upload(thumb.replace('maxresdefault', 'hqdefault')).then((result) => {
                    if (result) {
                        var public_id = result.public_id;
                        file = result.secure_url;
                        caching.addEntry(id, type, file, public_id).then((val) => {
                            console.log('added entry', val);
                            resolve(file);
                        }).catch((err) => {
                            console.error(err);
                            reject(err);
                        })
                    } else {
                        reject('Error');
                    }

                }).catch(err => {
                    console.error(err);
                    reject(err);
                })
            } else {
                console.error(err);
                reject(err);
            }
        })

    });
}

module.exports.createZip = () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('temp/zip')) {
            fs.mkdirSync('temp/zip');
        }
        var output = fs.createWriteStream(`temp/zip/${generateUid()}.zip`);
        var archive = archiver('zip', {
            zlib: {
                level: 9
            } // Sets the compression level.
        });
        archive.pipe(output);
        resolve(archive);
    });
}

module.exports.getThumbTemp = (thumb, id, type) => {
    return new Promise((resolve, reject) => {
        const uid = module.exports.generateUid(id);
        //let file = fs.createWriteStream(`${config.tmp}/${uid}.jpg`);
        var file = "";
        //request(thumb).pipe(file);
        cloudinary.uploader.upload(thumb).then((result) => {
            if (result) {
                var public_id = result.public_id;
                file = result.secure_url;
                caching.addEntry(id, type, file, public_id).then((val) => {
                    console.log('added entry', val);
                    resolve(file);
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                })
            } else {
                reject('Error');
            }

        }).catch(err => {
            if (err.http_code === 404 && err.message.includes('maxresdefault')) {
                cloudinary.uploader.upload(thumb.replace('maxresdefault', 'hqdefault')).then((result) => {
                    if (result) {
                        file = result.secure_url;
                        caching.addEntry(id, type, file).then((val) => {
                            console.log('added entry', val);
                            resolve(file);
                        }).catch((err) => {
                            console.error(err);
                            reject(err);
                        })
                    } else {
                        reject('Error');
                    }

                }).catch(err => {
                    console.error(err);
                    reject(err);
                })
            } else {
                console.error(err);
                reject(err);
            }
        })

    });
}