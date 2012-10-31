// Generated by CoffeeScript 1.4.0
var appPath, balUtil, docpadConfig, fsUtil, getCategoryName, getLabelName, getLinkName, getName, getProjectName, humanize, moment, pathUtil, rootPath, sitePath, strUtil, textData, _,
  __hasProp = {}.hasOwnProperty,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

fsUtil = require('fs');

pathUtil = require('path');

_ = require('underscore');

moment = require('moment');

strUtil = require('underscore.string');

balUtil = require('bal-util');

rootPath = __dirname + '/../..';

appPath = __dirname;

sitePath = rootPath + '/site';

textData = require(appPath + '/text');

getName = function(a, b) {
  var _ref, _ref1;
  if (b === null) {
    return (_ref = textData[b]) != null ? _ref : humanize(b);
  } else {
    return (_ref1 = textData[a][b]) != null ? _ref1 : humanize(b);
  }
};

getProjectName = function(project) {
  return getName('projectNames', project);
};

getCategoryName = function(category) {
  return getName('categoryNames', category);
};

getLinkName = function(link) {
  return getName('linkNames', link);
};

getLabelName = function(label) {
  return getName('labelNames', label);
};

humanize = function(text) {
  if (text == null) {
    text = '';
  }
  return strUtil.humanize(text.replace(/^[\-0-9]+/, '').replace(/\..+/, ''));
};

docpadConfig = {
  rootPath: rootPath,
  outPath: rootPath + '/site/out',
  srcPath: rootPath + '/site/src',
  reloadPaths: [appPath],
  templateData: {
    underscore: _,
    strUtil: strUtil,
    moment: moment,
    text: textData,
    projects: require(appPath + '/projects'),
    trainings: require(appPath + '/trainings'),
    site: {
      url: "http://bevry.me",
      title: "Bevry - Node.js, Backbone.js & JavaScript Consultancy in Sydney, Australia",
      description: "We're a Node.js, Backbone.js and JavaScript consultancy in Sydney Australia with a focus on empowering developers. We've created History.js one of the most popular javascript projects in the world, and DocPad an amazing Node.js Content Management System. We’re also working on setting up several Startup Hostels all over the world, enabling entreprenuers to travel, collaborate, and live their dream lifestyles cheaper than back home.",
      keywords: "bevry, bevryme, balupton, benjamin lupton, docpad, history.js, node, node.js, javascript, coffeescript, startup hostel, query engine, queryengine, backbone.js, cson",
      styles: ['/styles/style.css'],
      scripts: ["/vendor/jquery.js", "/vendor/log.js", "/vendor/jquery.scrollto.js", "/vendor/modernizr.js", "/vendor/history.js", "/vendor/historyjsit.js", "/scripts/script.js"]
    },
    getName: getName,
    getProjectName: getProjectName,
    getCategoryName: getCategoryName,
    getLinkName: getLinkName,
    getLabelName: getLabelName,
    getPreparedTitle: function() {
      if (this.document.pageTitle !== false && this.document.title) {
        return "" + (this.document.pageTitle || this.document.title) + " | " + this.site.title;
      } else if (this.document.pageTitle === false || (this.document.title != null) === false) {
        return this.site.title;
      }
    },
    getPreparedDescription: function() {
      return this.document.description || this.site.description;
    },
    getPreparedKeywords: function() {
      return this.site.keywords.concat(this.document.keywords || []).join(', ');
    },
    readFile: function(relativePath) {
      var path, result;
      path = this.document.fullDirPath + '/' + relativePath;
      result = fsUtil.readFileSync(path);
      if (result instanceof Error) {
        throw result;
      } else {
        return result.toString();
      }
    },
    codeFile: function(relativePath, language) {
      var contents;
      if (language == null) {
        language = pathUtil.extname(relativePath).substr(1);
      }
      contents = this.readFile(relativePath);
      return "<pre><code class=\"" + language + "\">" + contents + "</code></pre>";
    }
  },
  collections: {
    learn: function(database) {
      return database.findAllLive({
        relativeOutDirPath: {
          $startsWith: 'learn'
        },
        body: {
          $ne: ""
        }
      }, [
        {
          projectDirectory: 1,
          categoryDirectory: 1,
          filename: 1
        }
      ]).on('add', function(document) {
        var a, category, categoryDirectory, categoryName, layout, name, pageTitle, project, projectDirectory, projectName, slug, standalone, title, url, urls;
        a = document.attributes;
        layout = 'doc';
        standalone = true;
        projectDirectory = pathUtil.basename(pathUtil.resolve(pathUtil.dirname(a.fullPath) + '/..'));
        project = projectDirectory.replace(/[\-0-9]+/, '');
        projectName = getProjectName(project);
        categoryDirectory = pathUtil.basename(pathUtil.dirname(a.fullPath));
        category = categoryDirectory.replace(/^[\-0-9]+/, '');
        categoryName = getCategoryName(category);
        name = a.basename.replace(/^[\-0-9]+/, '');
        url = "/learn/" + project + "-" + name;
        slug = "/" + project + "/" + name;
        urls = [slug];
        title = "" + (a.title || humanize(name));
        pageTitle = "" + title + " | " + projectName;
        document.set({
          title: title,
          pageTitle: pageTitle,
          layout: layout,
          projectDirectory: projectDirectory,
          project: project,
          projectName: projectName,
          categoryDirectory: categoryDirectory,
          category: category,
          categoryName: categoryName,
          slug: slug,
          url: url,
          urls: urls,
          standalone: standalone
        });
        return document.getMeta().set({
          slug: slug,
          url: url,
          urls: urls
        });
      });
    },
    pages: function(database) {
      return database.findAllLive({
        relativeOutDirPath: 'pages'
      }, [
        {
          filename: 1
        }
      ]);
    },
    posts: function(database) {
      return database.findAllLive({
        relativeOutDirPath: 'posts'
      }, [
        {
          date: -1
        }
      ]).on('add', function(document) {
        return document.set({
          ignored: true,
          write: false,
          author: 'balupton'
        });
      });
    }
  },
  events: {
    docpadReady: function(opts, next) {
      var config, docpad, repoKey, repoValue, repos, tasks;
      docpad = this.docpad;
      config = docpad.getConfig();
      repos = {
        'docpad-documentation': {
          path: pathUtil.join(config.documentsPaths[0], 'learn', 'docs', 'docpad'),
          url: 'git://github.com/bevry/docpad-documentation.git'
        }
      };
      tasks = new balUtil.Group(next);
      for (repoKey in repos) {
        if (!__hasProp.call(repos, repoKey)) continue;
        repoValue = repos[repoKey];
        tasks.push(repoValue, function(complete) {
          return balUtil.initOrPullGitRepo(balUtil.extend({
            remote: 'origin',
            branch: 'master',
            output: true,
            next: function(err) {
              if (err) {
                docpad.warn(err);
              }
              return complete();
            }
          }, this));
        });
      }
      tasks.async();
    },
    writeAfter: function(opts, next) {
      var config, docpad, siteUrl, sitemap, sitemapPath;
      docpad = this.docpad;
      config = docpad.getConfig();
      sitemap = [];
      sitemapPath = config.outPath + '/sitemap.txt';
      siteUrl = config.templateData.site.url;
      docpad.getCollection('html').forEach(function(document) {
        if (document.get('sitemap') !== false && document.get('write') !== false && document.get('ignored') !== true && document.get('body')) {
          return sitemap.push(siteUrl + document.get('url'));
        }
      });
      balUtil.writeFile(sitemapPath, sitemap.sort().join('\n'), next);
    },
    serverExtend: function(opts) {
      var docpad, express, server;
      server = opts.server, express = opts.express;
      docpad = this.docpad;
      server.all('/pushover', function(req, res) {
        if (__indexOf.call(docpad.getEnvironments(), 'development') >= 0) {
          return res.send(200);
        }
        return request({
          url: "https://api.pushover.net/1/messages.json",
          method: "POST",
          form: balUtil.extend({
            token: envConfig.BEVRY_PUSHOVER_TOKEN,
            user: envConfig.BEVRY_PUSHOVER_USER_KEY,
            message: req.query
          }, req.query)
        }, function(_req, _res, body) {
          return res.send(body);
        });
      });
      server.get(/^\/(?:g|gh|github)(?:\/(.*))?$/, function(req, res) {
        var project;
        project = req.params[0] || '';
        return res.redirect(301, "https://github.com/bevry/" + project);
      });
      server.get(/^\/(?:t|twitter|tweet)\/?.*$/, function(req, res) {
        return res.redirect(301, "https://twitter.com/bevryme");
      });
      server.get(/^\/(?:f|facebook)\/?.*$/, function(req, res) {
        return res.redirect(301, "https://www.facebook.com/bevryme");
      });
      if (__indexOf.call(docpad.getEnvironments(), 'development') >= 0) {
        require(appPath + '/routes')({
          docpad: docpad,
          server: server,
          express: express
        });
      }
    }
  }
};

module.exports = docpadConfig;