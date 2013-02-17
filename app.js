var express = require('express')
  . manifest = require('./package.json')
  , passport = require('passport')
  , oauth2 = require('./oauth2')
  , routes = require('./routes')
  , api = require('./routes/api');

var host= process.env.HOST || "0.0.0.0";
var app = module.exports = express();
var server = require('http').createServer(app);

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(stylus.middleware({
    src: __dirname + '/views',
    dest: __dirname + '/public',
    compile: function (str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib())
        .import('nib');
    }
  }));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({secret: process.env.SESSION_SECRET || 'custard giraffe'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function() {
  mongoose.connect('mongodb://'+host+'/'+manifest.name+'-dev');
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://'+host+'/'+manifest.name);
  app.use(express.errorHandler());
});


require('./auth');
require('./auth.oauth2');


app.get('/', routes.index);

app.get('/auth/authorise', oauth2.authorisation);
app.post('/auth/authorise/cb', oauth2.decision);
app.post('/oauth/token', oauth2.token);
