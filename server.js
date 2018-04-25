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
    app.use(bodyParser.json({limit: "500mb"}));                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");

    // routes

    verifyUser = function (user, callb) {

      Admin.findOne({name: user.name}, function (err, adm) {
        if (adm == undefined || adm == null) {
          callb(false);
        } else {
        bcrypt.compare(user.password,adm.password, function (err, res) {
          if (err) {
            console.log(err);
            callb(false)
          } else {
            callb(res)
          }
        })
      }
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

    function isEmptyObject(obj) {
        return !Object.keys(obj).length;
      }

    app.get("/api/sword", function (req, res) {
      var q = req.query;
      console.log(q)
      s = {};
      if (q.name) {
        s.name = {$regex: q.name, $options: "i"};
      }
      if (q.mnL && q.mxL) {
        s.length = {$gte: parseInt(q.mnL), $lte: parseInt(q.mxL)};
      }
      if (q.mnW && q.mxW) {
        s.weight = {$gte : parseInt(q.mnW), $lte: parseInt(q.mxW)};
      }
      var skip = 0;
      if (q.p) {
        skip = parseInt(q.p) * 10;
      }
      console.log(s)

      Sword.find(s, function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
      }).limit(10).skip(skip);




    });

    app.get("/api/allSwords", function (req, res) {
      Sword.find({}, function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
      })
    })

    app.post("/api/sword", function (req,res) {
      var user = req.body.user;
      user.password = rot13(user.password);
      verifyUser(user, function (legit) {
        if (legit) {
          Sword.create(req.body.sword, function(err, result) {
            if (err) {
              res.send(err);
            } else {
              res.json(result);
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

  app.post("/api/uploadImg", function (req, res) {
    console.log(req.body.id)
    Fs.writeFile(__dirname + "/public/IMG/" + req.body.id + ".png",req.body.imgData)
  })

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
