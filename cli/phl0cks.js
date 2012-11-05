var colors = require('colors');
var fwk = require('fwk');
var util = require('util');

var phl0cks = module.exports;

phl0cks.VERSION = '0.3.4';
phl0cks.LOGGING = true;

phl0cks.intro = function() {
  phl0cks.log.info('Welcome to Phl0cks'); 
  phl0cks.log.info('v'.grey + phl0cks.VERSION.grey);
  phl0cks.log.info('');
};

phl0cks.run = function() {
  phl0cks.exec(process.argv.splice(2), function(err) {
    if(err) {
      phl0cks.LOGGING = true;
      phl0cks.error(err);
    }
    else {
      phl0cks.log.info('\nPhl0cks'.grey + ' OK'.green.bold);
    }
    process.exit(err ? 1 : 0);
  });
};


phl0cks.commands = {
  'signup': require('../lib/commands/signup.js').signup,
  'verify': require('../lib/commands/verify.js').verify,
  'login': require('../lib/commands/login.js').login,
  'logout': require('../lib/commands/logout.js').logout,
  'boilerplate': require('../lib/commands/boilerplate.js').boilerplate,
  'simulate': require('../lib/commands/simulate.js').simulate,
  'play': require('../lib/commands/play.js').play,
  'challenge': require('../lib/commands/challenge.js').challenge
};


phl0cks.exec = function(commands, cb_) {
  try {
    var options = {};
    for(var i = 0; i < commands.length; i ++) {
      if(commands[i].substr(0,2) === '--') {
        var opt = commands.splice(i, 1)[0];
        options[opt.split('=')[0].substr(2)] = opt.split('=', 2)[1] || true;
      }
    }

    var cmd = commands[0];
    var args = commands.splice(1);

    switch(cmd) {
      case 'signup':
      case 'verify':
      case 'login':
      case 'logout':
      case 'play':
      case 'challenge': 
      {
        phl0cks.intro();
        phl0cks.commands[cmd]({ 
          log: phl0cks.log, 
          options: options, 
          version: phl0cks.VERSION 
        }).execute(args, cb_);
        break;
      }
      case 'boilerplate':
      case 'simulate':
      {
        phl0cks.LOGGING = false;
        phl0cks.commands[cmd]({ 
          log: phl0cks.log, 
          options: options,
          version: phl0cks.VERSION 
        }).execute(args, cb_);
        break;
      }
      case 'help':
      {
        phl0cks.intro();
        if(args.length > 0) {
          phl0cks.commands[args[0]]({ 
            log: phl0cks.log, 
            options: options,
            version: phl0cks.VERSION 
          }).help(args.splice(1), cb_);
        }
        else {
          phl0cks.welcome(cb_);
        }
        break;
      }
      default:
        phl0cks.intro();
        phl0cks.welcome(cb_);
        return cb_();
    }
  }
  catch(err) {
    return cb_(err);
  }
};


phl0cks.log = {
  info: function(str) {
    if(!phl0cks.LOGGING) return;
    str.split('\n').forEach(function (line) {
      console.log('info'.green + ':    ' + line);
    });
  },
  help: function(str) {
    if(!phl0cks.LOGGING) return;
    str.split('\n').forEach(function (line) {
      console.log('help'.cyan + ':    ' + line);
    });
  },
  warn: function(str) {
    if(!phl0cks.LOGGING) return;
    str.split('\n').forEach(function (line) {
      console.log('warn'.yellow + ':    ' + line);
    });
  },
  err: function(str) {
    if(!phl0cks.LOGGING) return;
    str.split('\n').forEach(function (line) {
      console.log(' err'.red + ':    ' + line);
    });
  }
};
     

phl0cks.error = function(err) {
  phl0cks.log.err('');
  phl0cks.log.err('ERROR: ' + err.message.red);
  phl0cks.log.err(err.stack.substr(err.stack.indexOf('\n') + 1));
};


phl0cks.welcome = function(cb_) {
  phl0cks.log.help('Phl0cks Commands:'.underline.cyan.bold);
  phl0cks.log.help('');
  phl0cks.log.help('To sign up for Phl0cks'.cyan);
  phl0cks.log.help('  phl0cks signup');
  phl0cks.log.help('  phl0cks verify <code>');
  phl0cks.log.help('');
  phl0cks.log.help('To log into or out of Phl0cks'.cyan);
  phl0cks.log.help('  phl0cks login');
  phl0cks.log.help('  phl0cks logout');
  phl0cks.log.help('');
  phl0cks.log.help('To dump a pre-built phl0ck template'.cyan);
  phl0cks.log.help('  phl0cks boilerplate [<type>]');
  phl0cks.log.help('');
  phl0cks.log.help('To simulate a combat locally'.cyan);
  phl0cks.log.help('  phl0cks simulate <size> <phl0ck1> ... [<phl0ckN>]');
  phl0cks.log.help('');
  phl0cks.log.help('To play a simulated combat in the browser'.cyan);
  phl0cks.log.help('  phl0cks play');
  phl0cks.log.help('');
  phl0cks.log.help('To manage challenges (require login)'.cyan);
  phl0cks.log.help('  phl0cks challenge new <size> <phl0ck> <user|email> ... [<user|email>]');
  phl0cks.log.help('  phl0cks challenge list [<id>]');
  phl0cks.log.help('  phl0cks challenge accept <id> <code>');
  phl0cks.log.help('  phl0cks challenge submit <id> <phl0ck>');
  phl0cks.log.help('');
  phl0cks.log.help('To get help'.cyan);
  phl0cks.log.help('  phl0cks help [<command>]');
  cb_();
};
