var colors = require('colors');
var util = require('util');

var phl0ck = module.exports;

phl0ck.VERSION = '0.1.0';

phl0ck.run = function() {
  phl0ck.log.info('Welcome on ' + 'phl0ck'.underline + 
                  ' v'.grey + phl0ck.VERSION.grey);
  phl0ck.log.info('');

  phl0ck.exec(process.argv.splice(2), function(err) {
    if(err) {
      phl0ck.error(err);
    }
    else {
      phl0ck.log.info('\nphl0ck'.grey + ' OK'.green.bold);
    }
    process.exit(err ? 1 : 0);
  });
};


phl0ck.exec = function(commands, cb_) {
  try {
    var cmd = commands[0];
    var args = commands.splice(1);

    switch(cmd) {
      case 'signup':
        break;
      case 'login':
        break;
      case 'challenge':
        break;
      case 'train':
        break;
      default:
        phl0ck.help();
        cb_();
        break;
    }
  }
  catch(err) {
    cb_(err);
  }
};


phl0ck.log = {
  info: function(str) {
    str.split('\n').forEach(function (line) {
      console.log('info'.green + ':    ' + line);
    });
  },
  help: function(str) {
    str.split('\n').forEach(function (line) {
      console.log('help'.cyan + ':    ' + line);
    });
  },
  warn: function(str) {
    str.split('\n').forEach(function (line) {
      console.log('warn'.orange + ':    ' + line);
    });
  },
  err: function(str) {
    str.split('\n').forEach(function (line) {
      console.log(' err'.red + ':    ' + line);
    });
  }
};
     

phl0ck.error = function(err) {
  phl0ck.log.err('ERROR: ' + err.message.red);
  phl0ck.log.err(err.stack.substr(err.stack.indexOf('\n') + 1));
};


phl0ck.help = function(err) {
  phl0ck.log.help('Commands:'.underline.cyan.bold);
  phl0ck.log.help('');
  phl0ck.log.help('To sign up for phl0ck'.cyan);
  phl0ck.log.help('  phl0ck signup');
  phl0ck.log.help('');
  phl0ck.log.help('To log into phl0ck'.cyan);
  phl0ck.log.help('  phl0ck login');
  phl0ck.log.help('  phl0ck logout');
  phl0ck.log.help('');
  phl0ck.log.help('To simulate a combat'.cyan);
  phl0ck.log.help('  phl0ck simulate [<ships>] [<path1>] [<path2>] ...');
  phl0ck.log.help('');
  phl0ck.log.help('To manage challenges'.cyan);
  phl0ck.log.help('  phl0ck challenge new [<user>] [<path>]');
  phl0ck.log.help('  phl0ck challenge list');
  phl0ck.log.help('  phl0ck challenge accept [<index>] [<path>]');
};
