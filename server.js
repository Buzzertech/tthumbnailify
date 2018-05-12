

//dependencies
const express = require('express');
const body = require('body-parser');
const cors = require('cors');

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

app.use('/data', fetch);

//Universal Route
app.get('/', (req,res)=>{
    res.status(404);
})

//create server

module.exports = app;
