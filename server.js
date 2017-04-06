var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(express.static('build'));

var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

exports.app = app;
exports.runServer = runServer;

var Item = require('./models/item');

var storage = {
    find: function(callback){
      Item.find(callback);  
    },
    add: function(name, callback){
      Item.create({name : name}, callback)    
    },
    delete: function(id, callback){
      Item.findOneAndRemove({ _id : id}, callback)  
    },
    edit: function(id, name, callback){
      Item.findOneAndUpdate({ _id : id}, {name : name}, callback )    
    }
}

app.get('/items', function(req,res) {
    storage.find(function(err, items){
        if(err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(items);
    });
});

app.post('/items', function(req, res) {
    storage.add(req.body.name, function(err, item){
        if(err){
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(item);
    });
});

app.delete('/items/:id', function(req, res){
    storage.delete(req.params.id, function(err, item){
        if(err){
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(item);
    });
});

app.put('/items/:id', function(req, res){
    storage.edit(req.params.id, req.body.name, function(err, item){
        if(err){
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(item);
    });
});

app.use('*', function(req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});