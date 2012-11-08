var fs = require('fs');
var path = require('path');
var fwk = require('fwk');
var config = fwk.baseConfig();

var PACKAGE_JSON = JSON.parse(
  fs.readFileSync(path.join( __dirname, '..', 'package.json' ))
);

config['PHL0CKS_VERSION'] = PACKAGE_JSON.version;
config['PHL0CKS_MIN_VERSION'] = PACKAGE_JSON.min_version;

config['PHL0CKS_DATA_PATH'] = 'dummy-env';

config['PHL0CKS_SECRET'] = 'dummy-env';

config['PHL0CKS_SMTP_HOST'] = 'smtp.sendgrid.net';
config['PHL0CKS_SMTP_PORT'] = 587;
config['PHL0CKS_SMTP_USER'] = 'dummy-env';
config['PHL0CKS_SMTP_PASS'] = 'dummy-env';

config['PHL0CKS_MONGO_HOST'] = 'localhost';
config['PHL0CKS_MONGO_PORT'] = '27017';
config['PHL0CKS_MONGO_DB'] = 'phl0cks';
config['PHL0CKS_MONGO_RECONNECT'] = true;

config['PHL0CKS_HTTPS_PORT'] = 3210;

exports.config = config;

