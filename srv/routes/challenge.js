var util = require('util');
var path = require('path');
var crypto = require('crypto');
var fwk = require('fwk');

/**
 * @path PUT /challenge
 */
exports.put_challenge = function(req, res, next) {
  // req.body 
  // {
  //   users: ['x1nt0', 'stan@teleportd.com', 'gabhubert'],
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
      if(users.length !== usernames) {
        users.forEach(function(u) {
          fwk.remove(usernames, u);
        });
        return res.error(new Error('Unknown username(s): ' + usernames.join(',')));
      }
      else {
        // translate email to user if possible
        cu.find({ email: { $in: emails } }).toArray(function(err, users) {
          if(err)
            return res.error(err);
          else {
            users.forEach(function(u) {
              fwk.remove(emails, u.email);
              usernames.push(u.username);
            });
            process();
          }
        });
      }
    }
  });

  // processes the new challenge creation after
  // validation and username/email management
  var process() {
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
            usernames.forEach(function(u) {
              challenge.users.push({ 
                username: u, 
                attempts: 0, 
                win: 0 
              });
            });
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
                res.error(err);
              else {
                res.data(challenge);
              }
            });
          }
        });
      }
    });
  };
};


