// var archiver = require('archiver');
// var fs = require('fs');
// var url = require('url');
// var pathutil = require('path');
// var request = require('request');
// var util = require('../lib/util')

// var archive, output,path, zipname;
// module.exports.initArchiver = function () {
//     return new Promise((resolve, reject) => {
//         if (!fs.existsSync('temp/zip')) {
//             fs.mkdirSync('temp/zip');
//         }
//         zipname = `${util.generateUid()}.zip`;
//         path = `temp/zip/${zipname}`;

//         output = fs.createWriteStream(path);
//         archive = archiver('zip', {
//             zlib: {
//                 level: 9
//             } // Sets the compression level.
//         });
//         archive.pipe(output);
//         resolve();
//     });

// };

// module.exports.setupListener = function(){
//     archive.on('error', (error)=>{
//         throw error;
//     });
//     output.on('close', function() {
//         console.log(archive.pointer() + ' total bytes');
//         console.log('archiver has been finalized and the output file descriptor has closed.');
//       });
// };
// module.exports.appendToArchive = function(file, fileaddress) {
//     return new Promise((resolve,reject)=>{
//         /*var path = `temp/images/${Math.random().toString(36).substr(2,8)}.jpg`;
//         fs.closeSync(fs.openSync(path, 'w'));*/
//         var fname = url.parse(fileaddress,true);
//         var filename = pathutil.basename(fname.pathname);
//         if(archive.append(request.get(file), {
//             name: filename
//         })){
//             resolve();
//         }else{
//             reject();
//         }


//     })
// };

// module.exports.finalizeArchive = function(){
//     archive.finalize();
//     return new Promise((resolve,reject)=>{
//         util.uploadZip(path).then(val=>{
//             console.log('hereee', val);
//             resolve({path:val});
//         }).catch(reject)
//     })

// }

var cloudinary = require('cloudinary');
var config = require('../lib/config');
cloudinary.config(config.cloudinary);

var publicIds;
module.exports.initIds = () => {
    publicIds = [];  
    return new Promise((resolve,reject)=>{
        resolve();
    })
};

module.exports.addToArr = (publicId) => {
    return new Promise((resolve,reject)=>{
        publicIds.push(publicId);    
        resolve();
    })
};

module.exports.getArr = () => {
    return publicIds;
};

module.exports.removeFromArr = (publicId) => {
    publicIds.pop(publicId);
};

var generateExpiryTime = ()=>{
    var ts = new Date();
    ts.setHours(ts.getHours()+24);
    return ts;
};
module.exports.initZip = () => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.create_zip({
            public_ids: publicIds,
        })
        .then((val)=>{
            resolve(val.secure_url);
        })
        .catch(err=>{
            console.log('Error:', err);
            reject(err);
        })
    })
};