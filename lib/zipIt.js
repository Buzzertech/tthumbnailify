var archiver = require('archiver');
var fs = require('fs');
var url = require('url');
var pathutil = require('path');
var request = require('request');
var util = require('../lib/util')

var archive, output,path, zipname;
module.exports.initArchiver = function () {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('temp/zip')) {
            fs.mkdirSync('temp/zip');
        }
        zipname = `${util.generateUid()}.zip`;
        path = `temp/zip/${zipname}`;

        output = fs.createWriteStream(path);
        archive = archiver('zip', {
            zlib: {
                level: 9
            } // Sets the compression level.
        });
        archive.pipe(output);
        resolve();
    });

};

module.exports.setupListener = function(){
    archive.on('error', (error)=>{
        throw error;
    });
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });
};
module.exports.appendToArchive = function(file, fileaddress) {
    return new Promise((resolve,reject)=>{
        /*var path = `temp/images/${Math.random().toString(36).substr(2,8)}.jpg`;
        fs.closeSync(fs.openSync(path, 'w'));*/
        var fname = url.parse(fileaddress,true);
        var filename = pathutil.basename(fname.pathname);
        if(archive.append(request.get(file), {
            name: filename
        })){
            resolve();
        }else{
            reject();
        }

        
    })
};

module.exports.finalizeArchive = function(){
    archive.finalize();
    return {path: path, zipname: zipname};
}
