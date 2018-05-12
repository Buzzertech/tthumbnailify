var url = require('url');
var util = require('../lib/util')
var _ = require('lodash');
var fs = require('fs');
var request = require('request');
var zip = require('../lib/zipIt');

var imageOptions = ["maxresdefault", "default", "hqdefault", "mqdefault", "sddefault", "all"];
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
    }).catch((err) => {
        resolve({
            code: 200,
            response: err
        });
    })
}

var validateAndZip = (url, params) => {
    return new Promise((resolve, reject) => {
        var _val;
        util.createThumbLink(url, params).then((val) => {
            _val = val;
            return util.getThumbTemp(val, url, params);
        }).catch((val) => {
            _val = val;
            return Promise.resolve(val);
        }).then(file => {
            console.log('here', file);
            zip.appendToArchive(file, _val).then(resolve()).catch(reject());
        }).catch(err => {
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
            zip.initArchiver().then(() => {
                zip.setupListener();
                return Promise.all(urlArray.map((item) => {
                    return new Promise((resolve, reject) => {
                        let custom = url.parse(item, true);
                        let query = custom.query;
                        if (query.v) {
                            validateAndZip(query.v, params).then(() => {
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
            }).then(() => {
                var path = zip.finalizeArchive();
                resolve({
                    code: 200,
                    response: path
                });
            }).catch((err) => {
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