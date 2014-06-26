var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

exports.serveAssets = function(res, asset, statusCode) {
  if(asset) {
    fs.readFile(asset, 'utf8', function(err, data) {
      if (err) {
        console.log("err: " + err);
        // fs.readFile(asset, './public/loading.html', function(err, data) {
        //   if (err) {
        //     throw err;
        //   }
        //   res.end(data);
        // });
        exports.sendResponse(res, null, 404);
      } else {
        exports.sendResponse(res, data, statusCode);
      }
    });
  } else {
    exports.sendResponse(res, null, 302);
  }
};

// As you progress, keep thinking about what helper functions you can put here!

exports.sendResponse = function(res, data, statusCode) {
  statusCode = statusCode || 200;
  res.writeHead(statusCode, this.headers);
  res.end(data);
};


exports.collectData = function(request, callback) {
  var data = '';
  request.on('data', function(chunk) {
    data += chunk;
  });
  request.on('end', function() {
    callback(data);
  });
};
