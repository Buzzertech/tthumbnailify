var url = require('url');
var util = require('../lib/util')
var _ = require('lodash');
var fs = require('fs');
var request = require('request');
var zip = require('../lib/zipIt');
var promise = require('bluebird');
var imageOptions = ["maxresdefault", "default", "hqdefault", "mqdefault", "sddefault"];
var acceptedOption = ["youtube.com", "youtu.be", "www.youtube.com", "m.youtube.com"]

var validateAndUpload = (resolve, reject, url, params) => {
    util.createThumbLink(url, params).then((val) => {
        util.getThumb(val, url, params).then(val => {
            resolve({
                code: 200,
                response: val
            });
        }).catch(err => {
            reject({
                code: 500,
                response: err
            });
            console.error(err);
        })
    }).catch((existingVal) => {
        resolve({
            code: 200,
            response: existingVal.url
        });
    })
}

var validateAndZip = (url, params) => {
    return new Promise((resolve, reject) => {
        util.createThumbLink(url, params)
            .then(val => {
                return util.getThumbTemp(val, url, params);
            })
            .catch(val => {
                return Promise.resolve(val);
            })
            .then(response => {
                //zip.appendToArchive(file, _val).then(resolve()).catch(reject());
                zip.addToArr(response.public_id).then(resolve()).catch(reject);
            })
            .catch(err => {
                reject('error');
                console.error(err);
            })
    }).catch((err) => {
        reject(err);
        console.log(err);
    })
}
module.exports.getSingle = (tubeurl, params) => {
    return new Promise((resolve, reject) => {
        let custom = url.parse(tubeurl, true);
        if (custom.href && _.includes(imageOptions, params)) {
            if (_.includes(acceptedOption, custom.hostname)) {
                let query = custom.query;
                if (query.v) {
                    validateAndUpload(resolve, reject, query.v, params);
                } else if (custom.path) {;
                    validateAndUpload(resolve, reject, custom.path.replace('/', ''), params);
                }
            } else {
                reject({
                    code: 404,
                    response: 'Invalid host'
                });
            }
        } else {
            reject({
                code: 404,
                response: 'Not found'
            });
        }

    })
}


module.exports.getBulk = (urlArray, params) => {
    return new Promise((resolve, reject) => {
        if (_.isArray(urlArray) && _.includes(imageOptions, params)) {
            if(urlArray.length === 1){
                return module.exports.getSingle(urlArray[0], params).then(resolve).catch(reject);
            }
            zip.initIds().then(() => {
                    return Promise.all(urlArray.map((item) => {
                        return new Promise((resolve, reject) => {
                            let custom = url.parse(item, true);
                            let query = custom.query;
                            if (query.v) {
                                validateAndZip(query.v, params).then(() => {
                                    console.log('here');
                                    resolve();
                                }).catch(err => {
                                    reject();
                                })
                            } else {
                                validateAndZip(custom.path.replace('/', ''), params).then(() => {
                                    resolve();
                                }).catch(err => {
                                    reject();
                                })
                            }
                        })

                    }))
                })
                .then(() => {
                    console.log('here');

                    return zip.initZip()
                        .then(val => {
                            resolve({
                                code: 200,
                                response: val
                            })
                        })
                        .catch(err => {
                            reject({
                                code: 500,
                                response: err
                            })
                        })
                })
                .catch((err) => {
                    reject({
                        code: 500,
                        response: err
                    });
                })
        } else {
            reject({
                code: 404,
                response: 'Not found'
            });
        }
    })
}