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
    var bcrypt = require("bcrypt");

    // configuration =================

    const saltRounds = 10;

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

    verifyUser = function (user, callb) {

      Admin.findOne({name: user.name}, function (err, adm) {
        bcrypt.compare(user.password,adm.password, function (err, res) {
          if (err) {
            console.log(err);
            callb(false)
          } else {
            callb(res)
          }
        })
      })
    }

    function sendErrorResponse (res) {
      res.status(400);
      res.send("verifycation failed")
    }

    function rot13(str) {
      var input     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      var output    = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
      var index     = x => input.indexOf(x);
      var translate = x => index(x) > -1 ? output[index(x)] : x;
      return str.split('').map(translate).join('');
    }

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
      var user = req.body.user;
      user.password = rot13(user.password);
      verifyUser(user, function (legit) {
        if (legit) {
          Sword.create(req.body.sword, function(err, result) {
            if (err) {
              res.send(err);
            } else {
              res.send(result);
            }
          })
        } else {
          sendErrorResponse(res);
        }
      })

    });

    app.get("/api/sword/:sword_id", function (req,res) {
      Sword.findOne({_id : req.params.sword_id}, function (err, sword) {
        if (err) {

          res.send(err);
        } else {
          res.json(sword);
        }
      })
    });

    app.put ("/api/sword/:sword_id", function (req,res) {
      var user = req.body.user;
      user.password = rot13(user.password);
      verifyUser(user, function (legit) {
        if (legit) {
          Sword.update({_id: req.params.sword_id}, req.body.sword, function (err, result) {
            if (err) {
              res.send(err);
            } else {
              res.json(result);
            }
          })
        } else {
          sendErrorResponse(res)
        }
      })

    });

    app.delete("/api/sword/:sword_id", function (req, res) {
      var user = req.query;
      user.password = rot13(user.password)
      verifyUser(user, function (legit) {
        if (legit) {
          Sword.remove({
               _id : req.params.sword_id
           }, function(err, sword) {
               if (err) {
                   res.send(err);
                } else {
                  res.json(sword);
                }
        });
        } else {
          sendErrorResponse(res);
        }
      })
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
  user = req.body.user;
  user.password = rot13(user.password);
  verifyUser(user, function(legit) {
    if (legit) {
      Metal.create({name: req.body.name}, function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
      })
    } else {
      sendErrorResponse(res)
    }
  })
  })

  app.delete('/api/metal/:metal_id', function (req, res) {
    user = req.query;
    user.password = rot13(user.password)
    verifyUser(user, function (legit) {
      if (legit) {
        Metal.remove({_id: req.params.metal_id}, function (err, metal) {
          if (err) {
            res.send(err);
          } else {
            res.json(metal);
          }
        })
      } else {
        sendErrorResponse(res);
      }
    })
  })

  app.post("/api/admin/login", function (req, res) {
    var user = req.body;
    verifyUser(user, function (r) {
        if (r) {
          p = rot13(user.password)
          res.send({succes: r, password: p});
        } else {
          res.send({succes: r, password: "trolled"})
        }
    })

  })

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
