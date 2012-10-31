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
var mongodb = require('mongodb');
var crypto = require('crypto');

var app = express();

// cfg
var cfg = fwk.populateConfig(require("./config.js").config);

// MongoDB      
var mongo = new mongodb.Db(cfg['PHL0CKS_MONGO_DB'], 
                           new mongodb.Server(cfg['PHL0CKS_MONGO_HOST'], 
                                              parseInt(cfg['PHL0CKS_MONGO_PORT'], 10), 
                                              { 'auto_reconnect': cfg['PHL0CKS_MONGO_RECONNECT'] }),
                           { native_parser: false,
                             safe: true });

// Mailer
var mailer = require('./mailer.js').mailer({
  cfg: cfg,
  mongo: mongo
});

// Access
var access = require('./access.js').access({ 
  app: app,
  mailer: mailer,
  cfg: cfg, 
  mongo: mongo
});


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
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Parials

//handlebars.registerPartial('header', fs.readFileSync(__dirname + '/../views/header.html', 'utf8'));
//handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/../views/footer.html', 'utf8'));


// Routes

// MAIN [TEXT/HTML]

app.get( '/',                                 require('./routes/main.js').get_index);


// ADMIN [JSON]

app.post('/signup',                           require('./routes/admin.js').post_signup);
app.post('/login',                            require('./routes/admin.js').post_login);
app.get( '/ping',                             require('./routes/admin.js').get_ping);
app.get( '/logout',                           require('./routes/admin.js').get_logout);
app.get( '/verify',                           require('./routes/admin.js').get_verify);


// CHALLENGES [JSON]

app.put( '/challenge',                        require('./routes/challenge.js').put_challenge);
app.get( '/challenge/list',                   require('./routes/challenge.js').get_challenge_list);
app.get( '/challenge/:id',                    require('./routes/challenge.js').get_challenge);
app.del( '/challenge/:id',                    require('./routes/challenge.js').del_challenge);
app.post('/challenge/:id/accept',             require('./routes/challenge.js').post_challenge_accept);
app.post('/challenge/:id/submit',             require('./routes/challenge.js').post_challenge_submit);


// PLAYER [HTML]

/*
app.get( '/play/:combat',                     require('./routes/player.js')
*/


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
    var https_options = {
      key: fs.readFileSync('ssl/phl0cks.key'),
      cert: fs.readFileSync('ssl/phl0cks.crt'),
      ca: [ fs.readFileSync('ssl/gandi.pem') ]
    };

    var https_srv = https.createServer(https_options, app).listen(parseInt(cfg['PHL0CKS_HTTPS_PORT'], 10));
    console.log('HTTPS Server started on port: ' + cfg['PHL0CKS_HTTPS_PORT']);
  });
})();
