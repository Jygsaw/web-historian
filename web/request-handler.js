var path = require('path');
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');
var url = require('url');
// require more modules/folders here!

exports.handleRequest = function (req, res) {

  var statusCode = null;
  var data = null;

  var handlerFuncs = {};
  handlerFuncs.GET = function() {
    statusCode = 200;
    if (req.url === '/') {
      data = archive.paths.siteAssets + '/index.html';
    } else if (req.url.match(/www/)) {
      data = archive.paths.archivedSites + req.url;
    } else {
      data = archive.paths.siteAssets + req.url;
    }
    http.serveAssets(res, data, statusCode);
  };
  handlerFuncs.POST = function() {
    http.collectData(req, function(data) {
      var url = data.split("=")[1];
      archive.addUrlToList(url);

      archive.isUrlArchived(url, function(bool) {
        if (bool) {
          data = archive.paths.archivedSites + '/' + url;
        } else {
          data = archive.paths.siteAssets + '/loading.html';
        }
        http.serveAssets(res, data, statusCode);
      });
    });
    statusCode = 302;
  };

  if (handlerFuncs[req.method]) {
    handlerFuncs[req.method]();
  } else {
    statusCode = 500;
  }

};
