var fwk = require('fwk');
var crypto = require('crypto');

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
  var accessVerifier;       /* verify(req, res, cb); */
  var hmac;                 /* hmac(data); */

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

  fwk.method(that, 'accessVerifier', accessVerifier, _super);
  fwk.method(that, 'hmac', hmac, _super);

  return that;
};

exports.access = access;
