//dependencies
const express = require('express');
const body = require('body-parser');
const cors = require('cors');
const subscribe = require('./core/service');
var fs = require('fs');

//routes
var home = require('./routes/home.js');
var fetch = require('./routes/fetch.js');

//core files
var caching = require('./core/caching');
//Initialization
const app = new express();
const port = process.env.PORT || 3000;

//Middlewares
app.use(body.json({
    limit: '50mb'
}));

app.use(body.urlencoded({
    extended: true
}));

app.use(function(res,req,next){
    req.connection.setTimeout(600000);
    res.connection.setTimeout(600000);
    next();
});

app.use(cors());

app.use((req,res,next)=>{
    console.log('here');
    fs.exists('temp', (exists)=>{
        if(!exists){
            fs.mkdir('temp');
        }
    });
    fs.exists('temp/zip', (exists)=>{
        if(!exists){
            fs.mkdir('temp/zip');
        }
    })
    next();
});

//routes
app.use('/data', fetch);

//Universal Route
app.get('/', (req,res)=>{
    res.status(404);
})

subscribe();
//create server

module.exports = app;
