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
  var guests = [];

  if(!Array.isArray(players) || players.length <= 0) {
    return res.error(new Error('No challengers specified'));
  }
  var email_r = /^[a-zA-Z0-9\._\-\+]+@[a-z0-9\._\-]{2,}\.[a-z]{2,4}$/;
  var username_r = /^[a-zA-Z0-9\-_\.]{3,32}$/;
  for(var i = 0; i < players.length; i ++) {
    var p = players[i];
    if(email_r.exec(p)) {
      guests.push({ email: p });
    }
    else if(username_r.exec(p)) {
      if(p === req.user.username) {
        return res.error(new Error('Connot challenge yourself: ' + p));
      }
      usernames.push(p);
    }
    else {
      return res.error(new Error('Invalid player <user|email>: ' + p));
    }
  }

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
        guests.push({ username: u.username, email: u.email });
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
              created_at: new Date(),
              size: size,
              users: [],
              guests: []
            };
            challenge.users.push({ 
              username: req.user.username,
              phl0ck: sha,
              attempts: 0,
              wins: 0
            });
            guests.forEach(function(g) {
              var hash = crypto.createHash('sha256');
              hash.update(g.email + '-' + challenge.id);
              var code = hash.digest('hex').substr(0,6);
              // store code
              challenge.guests.push({
                email: g.email,
                username: g.username,
                code: code
              });
              // send email
              req.store.mailer.push_to_email(g.email, 'challenge_new', { 
                id: challenge.id,
                code: code,
                from: req.user.username,
                size: challenge.size,
                count: guests.length + 1
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
        if(c.guests.length > 0)
          status = 'pending';
        c.users.forEach(function(u) {
          if(!u.phl0ck && status !== 'waiting')
            status = 'pending';
          if(!u.phl0ck && u.username === req.user.username) {
            status = 'waiting';
          }
        });
        var guests = [];
        c.guests.forEach(function(g) {
          if(g.username)
            guests.push(g.username);
          else
            guests.push(g.email);
        })
        list.push({
          id: c.id,
          size: c.size,
          users: c.users,
          guests: guests,
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
  ch.findOne({ id: req.param('id') }, function(err, c) {
    if(err)
      return res.error(err);
    else if(c) {
      var status = 'ready';
      if(c.guests.length > 0)
        status = 'pending';
      c.users.forEach(function(u) {
        if(!u.phl0ck && status !== 'waiting')
          status = 'pending';
        if(!u.phl0ck && u.username === req.user.username) {
          status = 'waiting';
        }
      });
      c.status = status;
      var guests = [];
      c.guests.forEach(function(g) {
        if(g.username)
          guests.push(g.username);
        else
          guests.push(g.email);
      })
      c.guests = guests;
      return res.data(c);
    }
    else {
      return res.error(new Error('Challenge unknown: ' + req.param('id')));
    }
  });
};

/**
 * @path DELETE /challenge/:id
 */
exports.del_challenge = function(req, res, next) {
  var ch = req.store.mongo.collection('challenges');
  ch.findOne({ id: req.param('id') }, function(err, c) {
    if(err)
      return res.error(err);
    else if(c) {
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
            // TODO: Send email
            return res.ok();
          }
        });
      }
    }
    else {
      return res.error(new Error('Challenge not found: ' + req.param('id')));
    }
  });
};

/**
 * @path POST /challenge/:id/accept
 */
exports.post_challenge_accept = function(req, res, next) {
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
  ch.findOne({ id: req.param('id') }, function(err, c) {
    if(err)
      return res.error(err);
    else if(c) {
      for(var i = 0; i < c.users.length; i ++) {
        var u = c.users[i];
        if(u.username === req.user.username) {
          return res.error(new Error('User already accepted challenge: ' + u.username));
        }
      }
      var guest = null;
      c.guests.forEach(function(g) {
        if(g.code === code)
          guest = g;
      });
      if(!guest) {
        return res.error(new Error('Cannot accept, code not found: ' + code));
      }
      else {
        // update collection
        ch.update({ id: req.param('id') },
                  { $pull: { guests : { code : code } },
                    $push: { users: { username: req.user.username,
                                      attempts: 0,
                                      wins: 0 } } },
                  { multi: false },
                  function(err) {
                    if(err)
                      return res.error(err);
                    else {
                      // send email
                      c.users.forEach(function(u) {
                        if(u.username !== req.user.username) {
                          req.store.mailer.push(u.username, 'challenge_accept', { 
                            id: c.id,
                            from: req.user.username
                          });
                        }
                      });
                      return res.ok();
                    }
                  });
      }
    }
    else {
      return res.error(new Error('Challenge not found: ' + req.param('id')));
    }
  });
};


/**
 * @path POST /challenge/:id/submit
 */
exports.post_challenge_submit = function(req, res, next) {
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

  var cc = req.store.mongo.collection('combats');
  var ch = req.store.mongo.collection('challenges');

  ch.findOne({ id: req.param('id') }, function(err, c) {
    if(err)
      return res.error(err);
    else if(c) {
      // check conditions to process: not winner
      if(req.user.username === c.winner) {
        return res.error(new Error('Cannot submit as current winner of the challenge'));
      }
      else {
        process(c);
      }
    }
    else {
      return res.error(new Error('Challenge not found: ' + req.param('id')));
    }
  });

  // set the phl0ck for the given player and eventually
  // call combat() to simulate the combat if possible
  function process(c) {
    req.store.access.phl0ck_store(req.user.username, phl0ck, function(err, sha, path) {
      if(err)
        return res.error(err);
      else {
        var go = c.guests.length > 0 ? false : true;
        var first = false;
        c.users.forEach(function(u) {
          if(u.username === req.user.username) {
            if(!u.phl0ck)
              first = true;
            u.phl0ck = sha;
          }
          else if(!u.phl0ck) {
            go = false;
          }
        });
        ch.update({ id: req.param('id') }, c, { multi: false }, function(err) {
          if(err) 
            return res.error(err);
          else {
            if(go) {
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
        var p = path.resolve(req.store.cfg['PHL0CKS_DATA_PATH'] + '/combat/' + id);
        var cmd = 'phl0cks simulate ' + c.size;
        c.users.forEach(function(u) {
          cmd += ' ' + u.username + ':';
          cmd += path.resolve(req.store.cfg['PHL0CKS_DATA_PATH'] + '/phl0ck/' + 
                              u.username + '/' + u.phl0ck);
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
                if(u.username === result.winner &&
                   (u.username === req.user.username || first))
                  u.wins++;
                // send email
                if(result.winner === req.user.username || first) {
                  req.store.mailer.push(u.username, 'challenge_combat', { 
                    id: c.id,
                    winner: result.winner,
                    haswon: (result.winner === u.username),
                    combat: id
                  });
                }
              });
              if(result.winner &&
                 (result.winner === req.user.username || first)) {
                c.winner = result.winner;
              }
              // store the updated challenge object
              ch.update({ id: req.param('id') }, c, { multi: false }, function(err) {
                if(err) 
                  return res.error(err);
                else {
                  var combat = {
                    created_at: new Date(),
                    id: id,
                    challenge: c.id,
                    winner: result.winner,
                    draw: result.draw
                  }
                  // finally insert new combat
                  cc.insert(combat, function(err) {
                    if(err)
                      return res.error(err);
                    else {
                      res.data({ 
                        status: 'ready',
                        combat: id,
                        winner: result.winner,
                        draw: result.draw
                      });
                    }
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
