var util = require('util');
var path = require('path');
var crypto = require('crypto');
var fwk = require('fwk');
var exec = require('child_process').exec;

/**
 * @path PUT /challenge
 */
exports.put_challenge = function(req, res, next) {
  // req.body 
  // {
  //   players: ['x1nt0', 'stan@teleportd.com', 'gabhubert'],
  //   size: 5,
  //   phl0ck: #base64
  // }
  if(!req.body) {
    return res.error(new Error('No body specified'));
  }
  var players = req.body.players;
  var size = req.body.size;
  var phl0ck = req.body.phl0ck;

  var usernames = [];
  var emails = [];

  if(!Array.isArray(players) || players.length <= 0) {
    return res.error(new Error('No challengers specified'));
  }
  var email_r = /^[a-zA-Z0-9\._\-\+]+@[a-z0-9\._\-]{2,}\.[a-z]{2,4}$/;
  var username_r = /^[a-zA-Z0-9\-_\.]{3,32}$/;
  players.forEach(function(p) {
    if(email_r.exec(p)) {
      emails.push(p);
    }
    else if(username_r.exec(p)) {
      usernames.push(p);
    }
    else {
      return res.error(new Error('Invalid player <user|email>: ' + p));
    }
  });

  if(typeof size !== 'number' || !(size > 0 && size < 20)) {
    return res.error(new Error('Invalid phl0ck size: ' + size));
  } 

  if(typeof phl0ck !== 'string' || phl0ck.length <= 0) {
    return res.error(new Error('Error transmitting phl0ck code'));
  }


  var ch = req.store.mongo.collection('challenges');
  var cu = req.store.mongo.collection('users');

  // check all usernames 
  cu.find({ username: { $in: usernames } }).toArray(function(err, users) {
    if(err) 
      return res.error(err);
    else {
      // translate users to email
      users.forEach(function(u) {
        fwk.remove(usernames, u.username);
        emails.push(u.email);
      });

      if(usernames.length > 0) {
        return res.error(new Error('Unknown username(s): ' + usernames.join(',')));
      }
      process();
    }
  });

  // processes the new challenge creation after
  // validation and username/email management
  function process() {
    // challenges: {
    //   id: '0nB',
    //   size: 5,
    //   users: [ { username: '', phl0ck: '2h29487c7d55e7f6(sha)', attempts: 23, wins: 4 }, ... ]
    //   guests: [ { email: 'stan@teleportd.com', code: '9f7e' }, ... ]
    //   winner: 'username'
    // }

    // create challenger
    req.store.access.phl0ck_store(req.user.username, phl0ck, function(err, sha, path) {
      if(err)
        return res.error(err);
      else {
        req.store.access.next_counter('challenge', function(err, cnt) {
          if(err)
            return res.error(err);
          else {
            var challenge = {
              id: fwk.b64encode(cnt),
              size: size,
              users: [],
              guests: []
            };
            challenge.users.push({ 
              username: req.user.username,
              phl0ck: sha,
              attempts: 0,
              win: 0
            });
            emails.forEach(function(em) {
              var hash = crypto.createHash('sha256');
              hash.update(em + '-' + challenge.id);
              var code = hash.digest('hex').substr(0,6);
              // TODO: send email
              challenge.guests.push({
                email: em,
                code: code
              });
            });

            // finally insert new challenge
            ch.insert(challenge, function(err) {
              if(err)
                return res.error(err);
              else {
                return res.data(challenge);
              }
            });
          }
        });
      }
    });
  };
};


/**
 * @path GET /challenge/list
 */
exports.get_challenge_list = function(req, res, next) {
  var ch = req.store.mongo.collection('challenges');
  ch.find({ 'users.username': req.user.username }).toArray(function(err, challenges) {
    if(err)
      return res.error(err);
    else {
      var list = [];
      challenges.forEach(function(c) {
        var status = 'ready';
        if(c.guest.length > 0)
          status = 'pending';
        c.users.forEach(function(u) {
          if(!u.phl0ck && status !== 'waiting')
            status = 'pending';
          if(!u.phl0ck && u.username === req.user.username) {
            status = 'waiting';
          }
        });
        list.push({
          id: c.id,
          size: c.size,
          winner: c.winner,
          status: status
        });
      });
      return res.data(list);
    }
  });
};


/**
 * @path GET /challenge/:id
 */
exports.get_challenge = function(req, res, next) {
  var ch = req.store.mongo.collection('challenges');
  ch.find({ id: req.param('id') }).findOne(function(err, c) {
    if(err)
      return res.error(err);
    else {
      var status = 'ready';
      if(c.guest.length > 0)
        status = 'pending';
      c.users.forEach(function(u) {
        if(!u.phl0ck && status !== 'waiting')
          status = 'pending';
        if(!u.phl0ck && u.username === req.user.username) {
          status = 'waiting';
        }
      });
      c.status = status;
      return res.data(c);
    }
  });
};

/**
 * @path DELETE /challenge/:id
 */
exports.del_challenge = function(req, res, next) {
  var ch = req.store.mongo.collection('challenges');
  ch.find({ id: req.param('id') }).findOne(function(err, c) {
    if(err)
      return res.error(err);
    else {
      var can = false;
      c.users.forEach(function(u) {
        if(u.username === req.user.username)
          can = true;
      });
      if(!can)
        return res.error(new Error('Not authorized'));
      else {
        ch.remove({ id: req.param('id') }, function(err) {
          if(err)
            return res.error(err);
          else {
            return res.ok();
          }
        });
      }
    }
  });
};

/**
 * @path POST /challenge/:id/add
 */
exports.post_challenge_add = function(req, res, next) {
  // req.body 
  // {
  //   code: 'a23sd2'
  // }
  if(!req.body) {
    return res.error(new Error('No body specified'));
  }
  var code = req.body.code;

  var code_r = /^[a-fA-F0-9]{6}$/;
  if(!code_r.exec(code)) {
    return res.error(new Error('Invalid code ' + code_r.toString()));
  }

  var ch = req.store.mongo.collection('challenges');
  ch.find({ id: req.param('id') }).findOne(function(err, c) {
    if(err)
      return res.error(err);
    else {
      var guest = null;
      c.guests.forEeach(function(g) {
        if(g.code === code)
          guest = g;
      });
      if(!guest) {
        return res.error(new Error('Cannot add, code not found: ' + code));
      }
      else {
        ch.update({ id: req.param('id') },
                  { $pull: { guests : { code : code } },
                    $push: { users: { username: req.user.name,
                                      attempts: 0,
                                      wins: 0 } } },
                  { multi: false },
                  function(err) {
                    if(err)
                      return res.error(err);
                    else {
                      return res.ok();
                    }
                  });
      }
    }
  });
};


/**
 * @path POST /challenge/:id/fight
 */
exports.post_challenge_fight = function(req, res, next) {
  // req.body
  // {
  //   phl0ck: b64
  // }
  if(!req.body) {
    return res.error(new Error('No body specified'));
  }
  var phl0ck = req.body.phl0ck;

  if(typeof phl0ck !== 'string' || phl0ck.length <= 0) {
    return res.error(new Error('Error transmitting phl0ck code'));
  }

  var ch = req.store.mongo.collection('challenges');
  ch.find({ id: req.param('id') }).findOne(function(err, c) {
    if(err)
      return res.error(err);
    else {
      // check conditions to process: not winner
      if(u.username === c.winner) {
        return res.error('Cannot fight as winner of the challenge');
      }
      else {
        process(c);
      }
    }
  });

  // set the phl0ck for the given player and eventually
  // call combat() to simulate the combat if possible
  function process(c) {
    req.store.access.phl0ck_store(req.user.username, phl0ck, function(err, sha, path) {
      if(err)
        return res.error(err);
      else {
        var combat = c.guests.length > 0 ? false : true;
        var first = false;
        c.users.forEach(function(u) {
          if(u.username === req.user.username) {
            if(!u.phl0ck)
              first = true;
            u.phl0ck = sha;
          }
          else if(!u.phl0ck) {
            combat = false;
          }
        });
        ch.update({ id: req.param('id') }, c, { multi: false }, function(err) {
          if(err) 
            return res.error(err);
          else {
            if(combat) {
              combat(c, first);
            }
            else {
              res.data({ status: 'pending' });
            }
          }
        });
      }
    });
  };

  // simulate the combat and update the challenge according
  // to the result of the simulation
  function combat(c, first) {
    req.store.access.next_counter('combat', function(err, cnt) {
      if(err)
        return res.error(err);
      else {
        var id = fwk.b64encode(cnt);
        var p = path.resolve(my.cfg['PHL0CKS_DATA_PATH'] + '/combat/' + id);
        var cmd = 'phl0cks simulate ' + c.size;
        c.users.forEach(function(u) {
          cmd += ' ' + u.username + ':';
          cmd += path.resolve(my.cfg['PHL0CKS_DATA_PATH'] + '/phl0ck/' + u.phl0ck);
        });
        cmd += ' --short --out=' + p;
        exec(cmd, function(err, stdout, stderr) {
          if(err)
            return res.error(err);
          else {
            try {
              var result = JSON.parse(stdout);
              // update challenge
              c.users.forEach(function(u) {
                if(first || u.username === req.user.username)
                  u.attempts++;
                if(u.username === result.winner)
                  u.wins++;
              });
              if(result.winner) {
                c.winner = result.winner;
              }
              // TODO: send emails (if first or winner changed)
              // store the updated challenge object
              ch.update({ id: req.param('id') }, c, { multi: false }, function(err) {
                if(err) 
                  return res.error(err);
                else {
                  res.data({ 
                    combat: id,
                    winner: result.winner,
                    draw: result.draw
                  });
                }
              });
            }
            catch(err) {
              return res.error(err);
            }
          }
        });
      }
    });
  };
};
