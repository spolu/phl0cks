
/**
 * @path POST /signup
 */
exports.post_signup = function(req, res, next) {
  var username = req.param('username');
  var password = req.param('password');
  var email = req.param('email');

  var email_r = /^[a-zA-Z0-9\._\-\+]+@[a-z0-9\._\-]{2,}\.[a-z]{2,4}$/;
  if(!email_r.exec(email)) {
    return res.error(new Error('Invalid email ' + email_r.toString()));
  }
  var username_r = /^[a-zA-Z0-9\-_\.]{3,32}$/;
  if(!username_r.exec(username)) {
    return res.error(new Error('Invalid username ' + username_r.toString()));
  }
  var password_r = /^.{4,}$/;
  if(!password_r.exec(password)) {
    return res.error(new Error('Invalid password ' + password_r.toString()));
  }

  var c = req.store.mongo.collection('users');
  c.findOne({ username: username }, function(err, usr) {
    if(err) {
      return res.error(err);
    }
    else if(usr) {
      return res.error(new Error('Username already exists: ' + username));
    }
    else {
      var now = new Date();

      var hash = req.store.access.hmac(password);
      var auth = req.store.access.hmac(username + '-' + now.getTime());
      var verify = req.store.access.hmac(email + '-' + Math.random()).substr(0, 6);

      var usr = {
        username: username,
        created_at: now,
        hash: hash,
        email: email,
        auth: auth,
        verified: false,
        verify: verify
      };

      c.insert(usr, function(err) {
        if(err) {
          return res.error(err);
        }
        else {
          // send email
          req.store.mailer.push(username, 'verify', { code: verify });
          // send reply
          req.user = usr;
          res.data({
            username: username,
            created_at: now.getTime(),
            auth: auth,
          });
        }
      });
    }
  });
};

/**
 * @path POST /login
 */
exports.post_login = function(req, res, next) {
  var username = req.param('username');
  var password = req.param('password');

  var username_r = /^[a-zA-Z0-9\-_\.]{3,32}$/;
  if(!username_r.exec(username)) {
    return res.error(new Error('Invalid username ' + username_r.toString()));
  }
  var password_r = /^.{4,}$/;
  if(!password_r.exec(password)) {
    return res.error(new Error('Invalid password ' + password_r.toString()));
  }

  var c = req.store.mongo.collection('users');
  c.findOne({ username: username }, function(err, usr) {
    if(err) {
      return res.error(err);
    }
    else if(!usr) {
      return res.error(new Error('Username unknown: ' + username));
    }
    else {
      var hash = req.store.access.hmac(password);
      if(hash === usr.hash) {
        req.user = usr;
        res.data({
          auth: usr.auth,
        });
      }
      else {
        return res.error(new Error('Wrong password'));
      }
    }
  });
};


/**
 * @path GET /ping
 */
exports.get_ping = function(req, res, next) {
  return res.ok();
};

/**
 * @path GET /logout
 * Logs out all clients by changing the auth key
 */
exports.get_logout = function(req, res, next) {
  var now = new Date();
  var username = req.user.username;
  var auth = req.store.access.hmac(username + '-' + now.getTime());

  var c = req.store.mongo.collection('users');
  c.update({ username: username }, 
           { $set: { auth: auth } }, 
           { multi: false },
           function(err) {
             if(err) {
               return res.error(err);
             }
             else {
               delete req.user;
               return res.ok();
             }
           });
};

/**
 * @path GET /verify
 */
exports.get_verify = function(req, res, next) {
  var code = req.param('code');

  if(req.user.verify === code) {
    var c = req.store.mongo.collection('users');
    c.update({ username: req.user.username }, 
             { $set: { verified: true } }, 
             { multi: false },
             function(err) {
               if(err) {
                 return res.error(err);
               }
               else {
                 req.user.verified = true;
                 return res.ok();
               }
             });
  }
  else {
    return res.error(new Error('Verification failed'));
  }
};

