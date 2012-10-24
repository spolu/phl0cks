var handle_error = function(err) {
  return res.json({
    ok: false,
    error: err.message
  });
};

/**
 * @path GET /ping
 */
exports.get_ping = function(req, res, next) {
  var auth = req.param('auth');
  var c = req.store.mongo.collection('users');
  c.findOne({ auth: auth }, function(err, usr) {
    if(err) {
      return handle_error(err);
    }
    else if(usr) {
      res.json({
        ok: true,
        min_version: req.store.cfg['PHL0CKS_MIN_VERSION'],
        logged_in: true,
        handle: usr.handle
      });
    }
    else {
      res.json({
        ok: true,
        min_version: req.store.cfg['PHL0CKS_MIN_VERSION'],
        logged_in: false
      });
    }
  });
};

/**
 * @path POST /signup
 */
exports.post_signup = function(req, res, next) {
  var username = req.param('username');
  var password = req.param('password');
  var email = req.param('email');

  var email_r = /^[a-zA-Z0-9\._\-\+]+@[a-z0-9\._\-]{2,}\.[a-z]{2,4}$/;
  if(!email_r.exec(email)) {
    return handle_error(new Error('Invalid email: ' + email));
  }
  if(typeof username !== 'string' || username.length <= 0) {
    return handle_error(new Error('Invalid username: ' + username));
  }
  if(typeof password !== 'string' || password.length < 4) {
    return handle_error('Invalid password (min 4 characters)');
  }

  var c = req.store.mongo.collection('users');
  c.findOne({ username: username }, function(err, usr) {
    if(err) {
      return handle_error(err);
    }
    else if(usr) {
      return handle_error(new Error('Username already exists: ' + username));
    }
    else {
      var hm1 = crypto.createHmac('sha512',
                                  req.store.cfg['PHL0CKS_SECRET']); 
      hm1.update(password);
      var hmac = hm1.digest('hex');

      var hm2 = crypto.createHmac('sha512',
                                  req.store.cfg['PHL0CKS_SECRET']); 
      hm2.update(username + Date.now());
      var auth = hm2.digest('hex');

      var usr = {
        username: username,
        created_at: new Date(),
        hmac: hmac,
        email: email,
        auth: auth,
        verified: false
      };
      c.insert(usr, function(err) {
        if(err) {
          return handle_error(err);
        }
        else {
          res.json({
            ok: true,
            auth: auth
          });
        }
      });
    }
  });
};

/**
 * @path GET /login
 */
exports.get_login = function(req, res, next) {
};

/**
 * @path GET /logout
 */
exports.get_logout = function(req, res, next) {
};
