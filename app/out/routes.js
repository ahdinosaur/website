// Generated by CoffeeScript 1.4.0
var Backbone, GitHubStrategy, RedisSessionStore, appConfig, balUtil, databaseUserCollection, ensureAuthenticated, envConfig, mongo, mongoConnector, mongoServer, passport, queryEngine, redisSessionStore, urlUtil, _ref;

passport = require('passport');

GitHubStrategy = require('passport-github').Strategy;

mongo = require('mongodb');

urlUtil = require('url');

balUtil = require('bal-util');

_ref = require('docpad'), queryEngine = _ref.queryEngine, Backbone = _ref.Backbone;

envConfig = process.env;

appConfig = {
  site: {
    url: envConfig.BEVRY_SITE_URL,
    salt: envConfig.BEVRY_SALT
  },
  auth: {
    github: {
      clientID: envConfig.BEVRY_GITHUB_CLIENT_ID,
      clientSecret: envConfig.BEVRY_GITHUB_CLIENT_SECRET
    }
  },
  databaseMongo: (function() {
    var auth, data, url, _ref1;
    url = urlUtil.parse(envConfig.BEVRY_MONGODB_URL);
    auth = (_ref1 = url.auth) != null ? _ref1.split(':') : void 0;
    data = {
      name: url.path.substr(1),
      host: url.hostname,
      port: parseInt(url.port, 10),
      username: auth[0],
      password: auth[1],
      serverOptions: {
        auto_reconnect: true
      }
    };
    return data;
  })(),
  databaseRedis: (function() {
    var auth, data, url;
    url = urlUtil.parse(envConfig.BEVRY_REDIS_URL);
    auth = url.auth.split(':');
    data = {
      host: url.hostname,
      port: parseInt(url.port, 10),
      username: auth[0],
      password: auth[1]
    };
    return data;
  })()
};

databaseUserCollection = null;

mongoServer = new mongo.Server(appConfig.databaseMongo.host, appConfig.databaseMongo.port, appConfig.databaseMongo.serverOptions);

mongoConnector = new mongo.Db(appConfig.databaseMongo.name, mongoServer, {
  safe: true
});

mongoConnector.open(function(err, database) {
  if (err) {
    throw err;
  }
  console.log('connected database');
  return database.authenticate(appConfig.databaseMongo.username, appConfig.databaseMongo.password, function(err, result) {
    if (err) {
      throw err;
    }
    console.log('authenticated database');
    return database.collection('users', function(err, collection) {
      console.log('connected collection');
      return databaseUserCollection = collection;
    });
  });
});

RedisSessionStore = null;

redisSessionStore = null;

passport.serializeUser(function(user, next) {
  return next(null, user.username);
});

passport.deserializeUser(function(username, next) {
  return databaseUserCollection.findOne({
    username: username
  }, function(err, item) {
    return next(err, item);
  });
});

ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
};

module.exports = function(opts) {
  var config, docpad, express, server;
  docpad = opts.docpad, server = opts.server, express = opts.express;
  config = docpad.getConfig();
  /*
  	# Redis
  	RedisSessionStore ?= require('connect-redis')(express)
  	redisSessionStore ?= new RedisSessionStore(
  		host: appConfig.databaseRedis.host
  		port: appConfig.databaseRedis.port
  		db: appConfig.databaseRedis.username
  		pass: appConfig.databaseRedis.password
  		no_ready_check: true
  		ttl: 60*60  # hour
  	)
  */

  server.use(express.cookieParser());
  server.use(express.cookieSession({
    secret: appConfig.site.salt,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  }));
  /*
  	server.use express.session({
  		secret: appConfig.site.salt
  		cookie: maxAge: 1000*60*60
  		store: redisSessionStore
  	})
  */

  server.use(passport.initialize());
  server.use(passport.session());
  passport.use(new GitHubStrategy({
    clientID: appConfig.auth.github.clientID,
    clientSecret: appConfig.auth.github.clientSecret,
    callbackURL: appConfig.site.url + '/auth/github/callback',
    scope: ['public_repo', 'repo', 'delete_repo']
  }, function(accessToken, refreshToken, profile, next) {
    var user;
    user = {
      displayName: profile.displayName,
      username: profile.username,
      email: profile._json.email,
      location: profile._json.location,
      profileUrl: profile.profileUrl,
      githubUrl: profile.profileUrl,
      githubToken: accessToken,
      githubApiUrl: profile._json.url,
      avatarId: profile._json.gravatar_id,
      avatarUrl: profile._json.avatar_url,
      bio: profile._json.bio,
      companyName: profile._json.company
    };
    return passport.deserializeUser(user.username, function(err, item) {
      if (err) {
        return next(err);
      }
      if (item) {
        console.log('found user', item);
        return databaseUserCollection.update({
          username: user.username
        }, {
          $set: {
            githubToken: user.githubToken
          }
        }, function(err, item) {
          if (err) {
            return next(err);
          }
          console.log('updated user', item);
          return next(null, user);
        });
      } else {
        console.log('inserting user', user);
        return databaseUserCollection.insert(user, function(err, item) {
          if (err) {
            return next(err);
          }
          console.log('inserted user', item);
          return next(null, user);
        });
      }
    });
  }));
  server.all('/auth/github', function(req, res, next) {
    req.session.originalUrl = req.headers.referer || '/';
    return next();
  }, passport.authenticate('github'));
  server.all('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/500'
  }), function(req, res) {
    return res.redirect(req.session.originalUrl || '/');
  });
  server.all('/logout', function(req, res) {
    req.logout();
    return res.redirect(req.headers.referer || '/');
  });
  return true;
};
