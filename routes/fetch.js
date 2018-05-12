'use strict';

var express = require('express');
var Fetch = require('../models/Fetch');
var app = new express();

var single = (req,res)=>{
    Fetch.getSingle(req.body.url, req.body.params).then(result=>{
        res.status(result.code).send({status: result.code, response: result.response});
    }).catch(err=>{
        res.status(err.code).send({status: err.code, response: err.response});
    });
}

var bulk = (req,res)=>{
    Fetch.getBulk(req.body.url, req.body.params).then(result=>{
        res.status(result.code).send({status: result.code, response: result.response})
    }).catch(err=>{
        res.status(500).send({status: err.code, response: err.response});
    })
}
app.post('/single', single);
app.post('/bulk', bulk)
//app.get('/bulk');

module.exports = app;