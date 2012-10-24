var fwk = require('fwk');
var config = fwk.baseConfig();

config['PHL0CKS_VERSION'] = '0.3.0';
config['PHL0CKS_MIN_VERSION'] = '0.3.0';

config['PHL0CKS_SECRET'] = 'dummy-env';

config['PHL0CKS_SMTP_HOST'] = 'smtp.sendgrid.net';
config['PHL0CKS_SMTP_PORT'] = 587;
config['PHL0CKS_SMTP_USER'] = 'dummy-env';
config['PHL0CKS_SMTP_PASS'] = 'dummy-env';

config['PHL0CKS_MONGO_HOST'] = 'localhost';
config['PHL0CKS_MONGO_PORT'] = '27017';
config['PHL0CKS_MONGO_DB'] = 'phl0cks';
config['PHL0CKS_MONGO_RECONNECT'] = true;

config['PHL0CKS_HTTP_PORT'] = 3000;
config['PHL0CKS_HTTPS_PORT'] = 3001;

exports.config = config;

