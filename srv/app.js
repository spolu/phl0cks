#!/usr/bin/env node

/**
 * Module dependencies.
 */
var util = require('util');
var fwk = require('fwk');
var express = require('express');
var http = require('http');
var https = require('https');
var handlebars = require('handlebars');
var fs = require('fs');
var redis = require('redis');
var mongodb = require('mongodb');
var cookie = require('cookie');

var app = express();

// cfg
var cfg = fwk.populateConfig(require("./config.js").config);

// MongoDB      
var mongo = new mongodb.Db(cfg['NG_MONGO_DB'], 
                           new mongodb.Server(cfg['NG_MONGO_HOST'], 
                                              parseInt(cfg['NG_MONGO_PORT'], 10), 
                                              { 'auto_reconnect': cfg['NG_MONGO_RECONNECT'] }),
                           { native_parser: false,
                             safe: true });

// Configuration
app.configure(function(){
  app.set('view engine', 'html');
  app.set('views', __dirname + '/../views');
  app.engine('html', require('consolidate').handlebars);
  app.use(express.static(__dirname + '/../public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(access.accessVerifier);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  cfg['NG_IG_REDIRECT_URL'] = cfg['NG_IG_REDIRECT_URL_DEV'];
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Parials

handlebars.registerPartial('header', fs.readFileSync(__dirname + '/../views/header.html', 'utf8'));
handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/../views/footer.html', 'utf8'));


// Routes

// MAIN

app.get( '/',                                 require('../routes/main.js').get_index);
app.get( '/ping',                             require('../routes/main.js').get_ping);


// ADMIN

app.post('/signup',                           require('../routes/admin.js').post_signup);
app.get( '/login',                            require('../routes/admin.js').get_login);
app.get( '/logout',                           require('../routes/admin.js').get_logout);


// CHALLENGES

app.get( '/complete',                         require('./routes/admin.js').get_complete);
app.post('/complete',                         require('./routes/admin.js').post_complete);
app.get( '/signout',                          require('./routes/admin.js').get_signout);
app.get( '/users',                            require('./routes/admin.js').get_users);


// DB AUTHENTICATION & START

(function() {  
  var shutdown = function(code) {
    console.log('Exiting');
    process.exit(code);
  };

  var auth = function(cb) {
    mongo.open(function(err, db_p) {
      if(err) console.log('ERROR [mongo]: ' + err);
      else {
        console.log('mongo: ok');
        cb();
      }
    });
  };

  console.log('Starting...');
  auth(function() {
    var http_srv = http.createServer(app).listen(parseInt(cfg['NG_HTTP_PORT'], 10));
    console.log('HTTP Server started on port: ' + cfg['NG_HTTP_PORT']);
  });
})();


