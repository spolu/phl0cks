var fwk = require('fwk');
var crypto = require('crypto');
var fs = require('fs');

/**
 * Access checker
 * asynchronous access checker
 *
 * @inherits events.EventEmitter
 *
 * @param spec { app, cfg, mongo }
 */
var access = function(spec, my) {
  my = my || {};
  var _super = {};        

  my.app = spec.app;
  my.cfg = spec.cfg;  
  my.mongo = spec.mongo;

  // public
  var accessVerifier;       /* verify(req, res, next); */
  var hmac;                 /* hmac(data); */
  var next_counter;         /* next_counter(type, cb_); */
  var phl0ck_store;         /* phl0ck_store(b64, cb_); */

  //private
  var check_auth;            /* check_key(req) */

  
  var that = {};  
  
  /**
   * Asynchronous verifier for user access
   * @param req request (http)
   * @param res response (http)
   * @param next(err) whether check ok or not
   */    
  accessVerifier = function(req, res, next) {
    /**
     * We pass mongo & cfg & ... for routes
     */
    req.store = { mongo: my.mongo,
                  access: that,
                  cfg: my.cfg };
    req.user = null;

    /**
     * JSON Helpers functions
     */
    // Errors Responses
    res.error = function(err) {
      var json = {
        ok: false,
        min_version: my.cfg['PHL0CKS_MIN_VERSION'],
        logged_in: false,
        error: err.message
      }
      if(req.user) {
        json.logged_in = true;
        json.verified = user.verified;
      }
      return res.json(json);
    };
    // Json Data Responses
    res.data = function(data) {
      var json = {
        ok: true,
        min_version: my.cfg['PHL0CKS_MIN_VERSION'],
        logged_in: false,
        data: data
      };
      if(req.user) {
        json.logged_in = true;
        json.verified = user.verified;
      }
      return res.json(json);
    };
    // Jon OK Responses
    res.ok = function() {
      var json = {
        ok: true,
        min_version: my.cfg['PHL0CKS_MIN_VERSION'],
        logged_in: false
      };
      if(req.user) {
        json.logged_in = true;
        json.verified = user.verified;
      }
      return res.json(json);
    };


    if(my.cfg['DEBUG']) {
      console.log('EVAL: ' + req.url + ' (' + req.method + ') ' + ig_id);
    }

    /**
     * First check if logged in
     */
     var auth = req.headers['x-phl0cks-auth'] || req.param('auth');
     if(typeof auth === 'string') {
       var c = req.store.mongo.collection('users');
       c.findOne({ auth: auth }, function(err, usr) {
         if(err) {
           return res.error(err);
         }
         else if(usr) {
           req.user = usr;
           return next();
         }
       });
     }

    /**
     * First check for public pathes
     */
    [/^\/$/,
     /^\/login(\?.*){0,1}$/,
     /^\/signup(\?.*){0,1}$/].forEach(function(r) {
       if(r.test(req.url)) {
         return next();
       }
     });


     res.data({}, false);
  };
 

  /**
   * Computes a hmac from the data passed as argument and returns it
   * @param data string the data to be hmac'ed
   */
  hmac = function(data, cfg) {
    var hm = crypto.createHmac('sha512',
                               cfg['PHL0CKS_SECRET']); 
    hm.update(data);
    return hm.digest('hex');
  };

  /**
   * Get the next counter value, update the counter and returns it
   * @param type string counter type
   * @param cb_ function(err, val)
   */
  next_counter = function(type, cb_) {
    var c = my.mongo.collection('counters');

    // counters: {
    //   type: 'challenge',
    //   value: 2930
    // }
    
    c.update({ type: type }, { $inc : { value: 1 } }, function(err) {
      if(err)
        return cb_(err);
      else {
        c.findOne({ type: type }, function(err, cnt) {
          if(err)
            return cb_(err);
          else {
            cb_(null, cnt.value);
          }
        });
      }
    });
  };

  /**
   * Stores a new phl0cks encoded as b64 data into its destination
   * path and returns the sha generated as well as the full path
   * @param username string username of the owner of the phl0ck
   * @param b64 string base64 encoded phl0ck code
   * @param cb_ function(err, sha, p)
   */
  phl0ck_store = function(username, b64, cb_) {
    var buf = new Buffer(b64, 'base64');

    var hash = crypto.createHash('sha256');
    hash.updaet(username);
    hash.update(buf);
    var sha = hash.diget('hex');

    var p = path.resolve(my.cfg['PHL0CKS_DATA_PATH'] + '/phl0ck/' + username + '/' + sha);
    fs.writeFile(p, buf, function(err) {
      if(err)
        return cb_(err);
      else {
        cb_(null, sha, p);
      }
    });
  };


  fwk.method(that, 'accessVerifier', accessVerifier, _super);
  fwk.method(that, 'hmac', hmac, _super);
  fwk.method(that, 'next_counter', next_counter, _super);
  fwk.method(that, 'phl0ck_store', phl0ck_store, _super);

  return that;
};

exports.access = access;

