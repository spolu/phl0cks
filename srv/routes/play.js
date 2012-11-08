var util = require('util');
var path = require('path');
var crypto = require('crypto');
var fwk = require('fwk');
var fs = require('fs');


/**
 * @path GET /play/:combat
 */
exports.get_play = function(req, res, next) {
  var id = req.param('combat');
  var p = path.resolve(req.store.cfg['PHL0CKS_DATA_PATH'] + '/combat/' + id);
  fs.exists(p, function(exists) {
    if(!exists) {
      return res.redirect('/404');
    }
    else {
      var rs = fs.createReadStream(p);
      rs.pause();
      console.log('{PLAY} OPEN: ' + p);

      var player = require('../../lib/player.js').player({ rs: rs });

      var started = false;
      var sockets = [];
      req.store.io.of('/' + player.uid()).on('connection', function(socket) {
        if(!started) {
          rs.resume();
          player.run(function(err) {
            if(err) {
              socket.emit('error', err);
            }
          });
          started = true;
        }
        sockets.push(socket);
        socket.on('disconnect', function() {
          fwk.remove(sockets, socket);
        });
      });

      player.on('init', function(init) {
        sockets.forEach(function(socket) {
          socket.emit('init', init);
        });
      });
      player.on('step', function(st) {
        sockets.forEach(function(socket) {
          socket.emit('step', st);
        });
      });
      player.on('end', function(end) {
        sockets.forEach(function(socket) {
          socket.emit('end', end);
        });
      });

      res.render('play',
                 { channel: player.uid() });
    }
  });
};
