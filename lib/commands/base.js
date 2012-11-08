var fwk = require('fwk');
var util = require('util');
var events = require('events');
var fs = require('fs');
var https = require('https');
var path = require('path');


/**
 * Base Command Object
 *
 * @param { log, options, version }
 */
var command = function(spec, my) {
  my = my || {};
  var _super = {};

  my.log = spec.log;
  my.options = spec.options;
  my.version = spec.version;

  var that = new events.EventEmitter();

  // public
  var execute;       /* execute(args, cb_); */
  var help;          /* help(args, cb_); */
  var ask;           /* ask(question, format, cb); */
  var request;       /* request(method, path, body, cb_);
  var get_store;     /* get_store(field); */
  var set_store;     /* set_store(field, value) */
  var print_table;   /* print_table(fields, data) */
  var check_version; /* check_version(ver); */

  /**
   * Main execution routine to be overwrited by command 
   * implementations
   * @param args the command args
   * @param cb_(err)
   */
  execute = function(args, cb_) {
    return cb_(new Error('Empty command'));
  };

  /**
   * Help function in charge of displaying the help about
   * the command implemented
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    return cb_(new Error('Empty command help'));
  };

  /**
   * Helper to prompt question on the command line
   * @param question String the question to ask
   * @param format RegExp format verifier 
   * @param password Boolean hide password or not
   * @param callback Function (answer)
   */
  ask = function(question, format, password, callback) {
    var stdin = process.stdin, 
        stdout = process.stdout;

    stdin.resume();
    stdin.setEncoding('utf8');

    stdout.write(question);

    var done = function(data) {
      stdin.pause();
      if(format.test(data)) {
        callback(data);
      } 
      else {
        my.log.warn('Should match format: ' + format);
        ask(question, format, password, callback);
      }
    };

    if(password) {
      stdin.setRawMode(true);
      var data = '';
      function hdlr (char) {
        char = char + "";
        switch(char) {
          case "\n": case "\r": case "\u0004": {
            stdin.setRawMode(false);
            stdin.removeListener('data', hdlr);
            stdout.write('\n');
            done(data);
            break;
          }
          case "\u0003": {
            process.exit();
            break;
          }
          default: {
            data += char;
          }
        }
      };
      stdin.on('data', hdlr);
    }
    else {
      stdin.once('data', function(data) {
        data = data.toString().trim();
        done(data);
      });
    }
  };

  /**
   * Performs a remote request to the phl0cks server
   * @param method String the HTTP method
   * @param path String the HTTP path
   * @param body Object the JSON to post
   * @param cb_ Function (err, res)
   */
  request = function(method, path, body, cb_) {
    var options = {
      host: (my.options.local ? 'localhost' : 'phl0cks.net'),
      port: 3210,
      method: method,
      path: path,
      headers: {
        'x-phl0cks-version': my.version 
      }
    };

    var buf = null;
    if((method === 'POST' || method === 'PUT') && body) {
      var buf = new Buffer(JSON.stringify(body));
      var headers = {
        'Content-Type': 'application/json',
        'Content-Length': buf.length,
        'x-phl0cks-version': my.version 
      };
      options.headers = headers;
    }

    var auth = get_store('auth');
    if(auth) {
      options.headers['x-phl0cks-auth'] = auth;
    }

    var req = https.request(options, function(res) {
      res.setEncoding('utf-8');
      var data = '';
      res.on('data', function(chunk) { 
        data += chunk;
      });
      res.on('end', function() {
        try {
          var json = JSON.parse(data);
          check_version(json.cur_version);
          if(json.ok)
            return cb_(null, json);
          else
            return cb_(new Error(json.error));
        }
        catch(err) {
          return cb_(err);
        }
      });
    });

    req.on('error', function(err) {
      return cb_(err);
    });

    if(buf)
      req.write(buf);
    req.end();
  };
  
  /**
   * Retrieves from ~/.phl0cks the value for field. 
   * @param field String the field to retrieve
   */
  get_store = function(field) {
    var p = path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.phl0cks');
    try {
      var store = JSON.parse(fs.readFileSync(p, 'utf8'));
      return store[field];
    } catch(err) {
      return {}[field];
    }
  };

  /**
   * Stores a new value in ~/.phl0cks store for field.
   * @param field String the name of the field
   * @param value String the value to store
   */
  set_store = function(field, value) {
    var p = path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.phl0cks');
    var store = {};
    try {
      store = json.parse(fs.readfilesync(p, 'utf8'));
    } catch(err) {}
    try {
      store[field] = value;
      fs.writeFileSync(p, JSON.stringify(store), 'utf8');
    } catch(err) {}
  };

  /**
   * Prints an array of data by calculating padding
   * @param fields array fields string array
   * @param data array array of objects
   */
  print_table = function(fields, data, username) {
    var lengths = {};
    fields.forEach(function(f) {
      lengths[f] = lengths[f] || 0;
      var len = f.toString().length;
      lengths[f] = (lengths[f] > len ? lengths[f] : len);
    });
    data.forEach(function(obj) {
      fields.forEach(function(f) {
        var len = (obj[f] || '').toString().length;
        lengths[f] = (lengths[f] > len ? lengths[f] : len);
      });
    });
    var hdr = '';
    var lne = '';
    fields.forEach(function(f) {
      var str = f.toString();
      var len = f.toString().length;
      for(var i = len; i < lengths[f]; i++) str += ' ';
      hdr += str + ' ';
      str = '';
      for(var i = 0; i < lengths[f]; i++) str += '-';
      lne += str + ' ';
    });
    my.log.info(hdr);
    my.log.info(lne);
    data.forEach(function(obj) {
      var line = '';
      fields.forEach(function(f) {
        var str = (obj[f] || '').toString();
        var len = (obj[f] || '').toString().length;
        // Custom Colors (command specific)
        if(f === 'status') {
          switch(str) {
            case 'pending': str = str.yellow; break;
            case 'ready': str = str.green; break;
            case 'waiting': str = str.red.bold; break;
          }
        }
        if(f === 'winner') {
          if(str === username)
            str = str.green.bold;
          else
            str = str.red.bold;
        }
        if(f === 'id')
          str = str.cyan.bold;
        if(f === 'username')
          str = str.bold;
        if(f === 'attempts')
          str = str.yellow;
        if(f === 'wins')
          str = str.green;
        // End Custom Colors
        for(var i = len; i < lengths[f]; i++) str += ' ';
        line += str + ' ';
      });
      my.log.info(line);
    });
  };

  /**
   * Checks the version provided and compares it with the current
   * version and prints a message is newer
   * @param v string the string representation of the verison
   */
  check_version = function(v) {
    var cur = my.version.split('.');
    if(!v) return;
    var ver = v.split('.');
    for(var i = 0; i < cur.length; i ++) {
      if(cur[i] < ver[i]) {
        my.log.warn('===========================================================');
        my.log.warn('Please upgrade `phl0cks` to version ' + v + ' by running:');
        my.log.warn('  sudo npm install phl0cks -g'.bold);
        my.log.warn('===========================================================');
        my.log.warn('');
        break;
      }
    }
  }

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);
  fwk.method(that, 'ask', ask, _super);
  fwk.method(that, 'request', request, _super);

  fwk.method(that, 'get_store', get_store, _super);
  fwk.method(that, 'set_store', set_store, _super);

  fwk.method(that, 'print_table', print_table, _super);

  return that;
};

exports.command = command;
