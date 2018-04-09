// server.js

    var Sword = require("./app/models/sword");
    var Metal = require("./app/models/metal");
    var Admin = require("./app/models/admin");
    var Fs = require("fs")

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

    // configuration =================

    mongoose.connect("mongodb://localhost:27017/zwaarden");     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");

    // routes

    app.get("/api/sword", function (req, res) {

        var q = {
        //length: {$lt : req.query.mnL , $gt: req.query.mxL},
        //weight: {$lt : req.query.mnW, $gt: req.query.mxW},
        name: req.query.name
        }
      
        if (req.query.name == undefined) {
          q = {};
        }

      Sword.find(q, function (err, swords) {
        if (err) {
          res.send(err);
        } else {

          res.json(swords)
        }
      })

    });


    app.post("/api/sword", function (req,res) {
      Sword.create(req.body, function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      })
    });

    app.get("/api/sword/:sword_id", function (req,res) {
      Sword.findOne({_id : req.params.sword_id}, function (err, sword) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          res.json(sword);
        }
      })
    });

    app.put ("/api/sword/:sword_id", function (req,res) {

          Sword.update({_id: req.params.sword_id}, req.body, function (err, result) {
            if (err) {
              res.send(err);
            } else {
              res.json(result);
            }
          })
    });

    app.delete("/api/sword/:sword_id", function (req, res) {
      Sword.remove({
           _id : req.params.sword_id
       }, function(err, sword) {
           if (err) {
               res.send(err);
            } else {
              res.json(sword);
            }
    });
  });

  app.get("/api/metal", function (req,res) {
    Metal.find({}, function (err, metals) {
      if (err) {
        res.send(err);
      } else {
        res.json(metals);
      }
    });
  });

  app.post("/api/metal", function (req, res) {
    Metal.create(req.body, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    })
  })

  app.post("/api/admin/login", function (req, res) {
    var user = req.body;
    Admin.findOne({name: user.name}, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        //this will have to be hashed and compare hashes, preferably bcrypt
        if (user.password == result.password) {
          res.send({succes: true});
        } else {
          res.send({succes: false});
        }
      }
    })

  })

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
