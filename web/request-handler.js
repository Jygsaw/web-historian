var path = require('path');
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');
var url = require('url');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  console.log("HELLO: " + req.method);
  console.log("URL: ", req.url);

  var statusCode = null;
  var data = null;

  var handlerFuncs = {};
  handlerFuncs.GET = function() {
    console.log("=== GET request ===");
    statusCode = 200;
    if (req.url === '/') {
      data = archive.paths.siteAssets + '/index.html';
    } else if (req.url.match(/www/)) {
      data = archive.paths.archivedSites + req.url;
    } else {
      data = archive.paths.siteAssets + req.url;
    }
  };
  handlerFuncs.POST = function() {
    console.log("=== POST request ===");
    http.collectData(req, function(data) {
      var url = data.split("=")[1];
      console.log("URL: ", url);
      archive.addUrlToList(url);
    });
    statusCode = 302;
  };

  if (handlerFuncs[req.method]) {
    handlerFuncs[req.method]();
  } else {
    statusCode = 500;
  }

  // res.writeHead(statusCode, http.headers);
  http.serveAssets(res, data, statusCode);
};
