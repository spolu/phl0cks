var fwk = require('fwk');
var util = require('util');
var express = require('express');
var http = require('http');
var handlebars = require('handlebars');
var fs = require('fs');

/**
 * Play Command Object
 *
 * @param { log }
 */
var play = function(spec, my) {
  my = my || {};
  var _super = {};
  
  var that = require('./base.js').command(spec, my);

  // public
  var execute; /* execute(args, cb_); */
  var help;    /* help(args, cb_); */

  /**
   * Main execution routine 
   * @param args the command args
   * @param cb_(err)
   */
  execute = function(args, cb_) {

    var player = require('../player.js').player({ rs: process.stdin });
    var app = express();

    // Configuration
    app.configure(function(){
      app.set('view engine', 'html');
      app.set('views', __dirname + '../../views');
      app.engine('html', require('consolidate').handlebars);
      app.use(express.static(__dirname + '../../public'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());
    });

    var srv = http.createServer(app);
    var io = require('socket.io').listen(srv, { log: false });

    app.get('/', function(req, res, next) {
      res.render('local',
                 { channel: player.uid() });
    });

    var sockets = [];
    io.of('/' + player.uid())
      .on('connection', function(socket) {
        sockets.push(socket);
        socket.on('disconnect', function() {
          fwk.remove(sockets, socket);
        });
      });

    player.on('step', function(st) {
      sockets.forEach(function(socket) {
        socket.emit(st);
      });
    });

    // let's go
    srv.listen(0, function() {
      my.log.info('Listening on: http://localhost:' + srv.address().port);
      my.log.info('Starting simulation replay in 2s');
      setTimeout(function() {
        process.stdin.resume();
        player.run(function(err) {
          srv.close();
          return cb_(err);
        });
      }, 2000);
    });
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Play Command:'.underline.cyan.bold);
    my.log.help('');
    my.log.help('Play a simulated combat in the browser.');
    my.log.help('');
    my.log.help('  The `play` command receives simulation data from stdin and creates a local HTTP');
    my.log.help('  server to replay the simulation in "real" time. The command outputs the URL of');
    my.log.help('  the replay and also attempts to automatically open a Browser window.');
    my.log.help('');
    my.log.help('phl0cks play');
    my.log.help('');
    my.log.help('Options:'.yellow);
    my.log.help('--port=N'.bold + '    force the port number to use (otherwise provided by OS)');
    my.log.help('--any'.bold + '       accepts connection from any address (otherwise localhost only)');  
    my.log.help('--nobrowser'.bold + ' do not attempt to open a browser window'); 
    my.log.help('');
    my.log.help('Examnples:'.yellow);
    my.log.help('  phl0cks replay < combat.json');
    my.log.help('  phl0cks simulate 2 dummy.js pendulum.js | phl0cks play --port=3000');
    my.log.help('  phl0cks replay --port=80 --any --nobrowser < broadcast.json');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.play = play;
