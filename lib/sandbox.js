var util = require('util');
var fwk = require('fwk');
var vm = require('vm');
var fs = require('fs');
var path = require('path');

var args = process.argv;
if(args.length < 3) {
  process.send({ 
    type: 'error',
    message: 'Phl0ck filename not specified'
  });
  process.exit(1);
}

var module = { exports: {} };

var ctx = vm.createContext({ 
  exports: module.exports,
  module: module,
  require: function(m) {
    switch(m) {
      case 'util':
        return require(m);
      default:
        return {}
    }
  }
});


/****************************************************
 *              SCRIPT CREATION                     *
 ****************************************************/
try {
  vm.runInContext(fs.readFileSync(path.resolve(args[2])), ctx);
}
catch(err) {
  process.send({
    type: 'error',
    message: err.message
  });
  process.exit(1);
}



/****************************************************
 *              MESSAGE HANDLING                    *
 ****************************************************/
process.on('message', function(m) {
  try {
    switch(m.type) {
      case 'init': {
        var code = 'exports.init(';
        code += JSON.stringify(m.size) + ',';
        code += JSON.stringify(m.spec) + ');';

        vm.runInContext(code, ctx);
        break;
      }
      case 'control': {
        var code = '__result_control_ = exports.control(';
        code += JSON.stringify(m.step) + ',';
        code += JSON.stringify(m.t) + ',';
        code += JSON.stringify(m.ship) + ',';
        code += JSON.stringify(m.ships) + ',';
        code += JSON.stringify(m.missiles) + ');';

        vm.runInContext(code, ctx);
        var c = ctx.__result_control_;
        process.send({
          type: 'control',
          control: c,
          id: m.id
        });
        break;
      }
      case 'kill': {
        process.exit(0);
        break;
      };
      default:
        // nothing to do
    }
  }
  catch(err) {
    process.send({
      type: 'error',
      message: err.message
    });
    process.exit(1);
  }
});


