var colors = require('colors');
var util = require('util');

var phl0cks = module.exports;

phl0cks.VERSION = '0.1.0';

phl0cks.run = function() {
  phl0cks.log.info('Welcome to ' + 'Phl0cks'.underline + 
                  ' v'.grey + phl0cks.VERSION.grey);
  phl0cks.log.info('');

  phl0cks.exec(process.argv.splice(2), function(err) {
    if(err) {
      phl0cks.error(err);
    }
    else {
      phl0cks.log.info('\nPhl0cks'.grey + ' OK'.green.bold);
    }
    process.exit(err ? 1 : 0);
  });
};


phl0cks.commands = {
  'signup': require('./commands/signup.js').signup,
  'login': require('./commands/login.js').login,
  'logout': require('./commands/logout.js').logout,
  'simulate': require('./commands/simulate.js').simulate,
  'challenge': require('./commands/challenge.js').challenge
};


phl0cks.exec = function(commands, cb_) {
  try {
    var cmd = commands[0];
    var args = commands.splice(1);

    switch(cmd) {
      case 'signup':
      case 'login':
      case 'logout':
      case 'simulate':
      case 'challenge': 
      {
        phl0cks.commands[cmd]({ log: phl0cks.log })
          .execute(args, cb_);
        break;
      }
      case 'help':
      {
        if(args.length > 0) {
          phl0cks.commands[args[0]]({ log: phl0cks.log })
            .help(args.splice(1), cb_);
        }
        else {
          phl0cks.welcome(cb_);
        }
        break;
      }
      default:
        phl0cks.welcome(cb_);
        cb_();
        break;
    }
  }
  catch(err) {
    cb_(err);
  }
};


phl0cks.log = {
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
     

phl0cks.error = function(err) {
  phl0cks.log.err('ERROR: ' + err.message.red);
  phl0cks.log.err(err.stack.substr(err.stack.indexOf('\n') + 1));
};


phl0cks.welcome = function(cb_) {
  phl0cks.log.help('Phl0cks Commands:'.underline.cyan.bold);
  phl0cks.log.help('');
  phl0cks.log.help('To sign up for phl0cks'.cyan);
  phl0cks.log.help('  phl0cks signup');
  phl0cks.log.help('');
  phl0cks.log.help('To log into or out of phl0cks'.cyan);
  phl0cks.log.help('  phl0cks login');
  phl0cks.log.help('  phl0cks logout');
  phl0cks.log.help('');
  phl0cks.log.help('To simulate a combat locally'.cyan);
  phl0cks.log.help('  phl0cks simulate [<ships>] [<path1>] [<path2>] ...');
  phl0cks.log.help('');
  phl0cks.log.help('To manage challenges'.cyan);
  phl0cks.log.help('  phl0cks challenge new [<user>] [<path>]');
  phl0cks.log.help('  phl0cks challenge list');
  phl0cks.log.help('  phl0cks challenge accept [<index>] [<path>]');
  phl0cks.log.help('');
  phl0cks.log.help('To get help'.cyan);
  phl0cks.log.help('  phl0cks help [<command>]');
  cb_();
};


