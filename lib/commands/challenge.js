var fwk = require('fwk');
var util = require('util');
var path = require('path');
var fs = require('fs');

/**
 * Challenge Command Object
 *
 * @param { log }
 */
var challenge = function(spec, my) {
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
    var subcmd = args[0];
    args = args.splice(1);

    switch(subcmd) {
      case 'new': {
        if(args.length < 3)
          return cb_(new Error('Arguments missing (<size>, <phl0ck> or <user|email>)'));
        var body = {};
        // size
        body.size = parseInt(args[0], 10);
        args = args.splice(1);
        // phl0ck
        var p = path.resolve(args[0]);
        args = args.splice(1);
        if(!fs.existsSync(p)) 
          return cb_(new Error('File does not exist: ' + p));
        body.phl0ck = fs.readFileSync(p).toString('base64');
        // players
        body.players = args;

        that.request('PUT', '/challenge', body, function(err, res) {
          if(err) return cb_(err);
          else {
            my.log.info('New challenge created with id: ' + res.data.id.cyan.bold);
            my.log.info('');
            my.log.info('An email was sent to all players challenged.');
            my.log.info('You will receive an email as soon as all players have entered their phl0cks');
            my.log.info('Check the status of the challenge with: ' + '`phl0cks challenge list`'.bold);
            return cb_();
          }
        });
        break;
      }
      case 'list': {
        if(args.length === 0) {
          that.request('GET', '/challenge/list', null, function(err, res) {
            if(err) return cb_(err);
            else {
              var data = [];
              res.data.forEach(function(c) {
                var users = '';
                c.users.forEach(function(u) {
                  users += u.username + ','
                });
                users = users.substr(0, users.length - 1);
                data.push({
                  id: c.id,
                  size: c.size,
                  status: c.status,
                  winner: c.winner,
                  pending: c.pending,
                  users: users
                });
              });
              that.print_table(['id', 'size', 'status', 'pending', 'users', 'winner'],
                               data);
              return cb_();
            }
          });
        }
        else {
          that.request('GET', '/challenge/' + args[0], null, function(err, res) {
            if(err) return cb_(err);
            else {
              my.log.info('id: ' + res.data.id.cyan.bold);
              my.log.info('size: ' + res.data.size.toString().cyan);
              my.log.info('status: ' + res.data.status.cyan);
              my.log.info('');
              my.log.info('users: ');
              res.data.users.forEach(function(u) {
                my.log.info(u.username.bold + 
                            ' attempts: ' + u.attempts.toString().yellow + 
                            ' win: ' + u.win.toString().green);
              });
              return cb_();
            }
          });
        }
        break;
      }
      case 'accept': {
        if(args.length < 2)
          return cb_(new Error('Arguments missing (<id> or <code>)'));
        var body = {};
        // id
        var id = args[0];
        args = args.splice(1);
        // code
        body.code = args[0];
        that.request('POST', '/challenge/' + id + '/accept', body, function(err, res) {
          if(err) return cb_(err);
          else {
            my.log.info('Challenge accepted: ' + id.cyan.bold);
            my.log.info('');
            my.log.info('Check the status of the challenge with: ' + '`phl0cks challenge list`'.bold);
            return cb_();
          }
        });
        break;
      }
      case 'submit': {
        break;
      }
      case 'delete': {
        if(args.length < 1)
          return cb_(new Error('Arguments missing (<id>)'));
        // id
        var id = args[0];
        args = args.splice(1);
        // code
        that.request('DELETE', '/challenge/' + id, null, function(err, res) {
          if(err) return cb_(err);
          else {
            my.log.info('Challenge deleted: ' + id.cyan.bold);
            return cb_();
          }
        });
        break;
      }
      default: {
        return cb_(new Error('Unknown challenge subcomand: ' + subcmd));
      }
    }
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Challenge Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Manage Challenges.');
    my.log.help('');
    my.log.help('  The `challenge` command let the user create, retrieve and combat for challenges.');
    my.log.help('  A challenge is sent by one user to another with a phl0ck size and a phl0ck. The');
    my.log.help('  user who receives the challenge can combat that challenge with any one of his');
    my.log.help('  phl0cks until he beats the original phl0ck submitted with the challenge. Until');
    my.log.help('  the challenge is accepted by the challenger, the challenge is displayed as');
    my.log.help('  `pending`.');
    my.log.help('  A user can challenge multiple users at the same time. In that case, the first');
    my.log.help('  combat will wait for all users to accept the challenge and submit a phl0ck for');
    my.log.help('  combat. The current winner of a challenge cannot submit a new phl0ck until it');
    my.log.help('  gets beaten by one of the challengers. Challenges keep track of the number of');
    my.log.help('  `attempts` and `wins` by each of the users involved.');
    my.log.help('');
    my.log.help('phl0cks challenge new <size> <phl0ck> <user|email> ... [<user|email>]');
    my.log.help('phl0cks challenge list [<id>]');
    my.log.help('phl0cks challenge accept <id> <code>');
    my.log.help('phl0cks challenge submit <id> <phl0ck>');
    my.log.help('');
    my.log.help('Arguments:'.yellow);
    my.log.help('  size'.bold + '     size of the phl0cks (number of ships per phl0ck)');
    my.log.help('  phl0ck'.bold + '   path to a phl0ck');
    my.log.help('  user'.bold + '     username of the user to challenge');
    my.log.help('  email'.bold + '    email of the person to challenge (if username unknown)');
    my.log.help('  id'.bold + '       unique id of the challenge');
    my.log.help('  code'.bold + '     personal code to accept challenge (sent by email)');
    my.log.help('');
    my.log.help('Examples:'.yellow);
    my.log.help('  phl0cks challenge new 4 dummy.js spolu');
    my.log.help('  phl0cks challenge new 4 pendulum.js polu.stanislas@gmail.com');
    my.log.help('  phl0cks challenge list');
    my.log.help('  phl0cks challenge list 2ef0');
    my.log.help('  phl0cks challenge accept 2ef0 9f1ef8');
    my.log.help('  phl0cks challenge submit 2ef0 pendulum.js');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.challenge = challenge;
