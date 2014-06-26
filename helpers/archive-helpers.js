var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http_request = require('http-request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  'siteAssets' : path.join(__dirname, '../web/public'),
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for jasmine tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback){
  fs.readFile(this.paths.list, 'utf8', function(err, data) {
    if(err) { throw err; }
    var list = parseSiteIndex(data);
    callback(list);
  });
};

exports.isUrlInList = function(url, callback){
  this.readListOfUrls(function(list) {
    var bool = list.hasOwnProperty(url);
    callback(bool);
  });
};

exports.addUrlToList = function(url){
  if (!this.isUrlInList(url)) {
    fs.appendFile(this.paths.list, url + '\n', 'utf8', function(err) {
      if (err) { throw err; }
    });
  }
};

exports.isUrlArchived = function(url, callback){
  fs.readdir(this.paths.archivedSites, function(err, files) {
    if(err) { throw err; }
    var result = _(files).contains(url);
    callback(result);
  });
};

exports.downloadUrls = function(){
  this.readListOfUrls(function(data) {
    for(var url in data) {
      (function(url) {
        exports.isUrlArchived(url, function(bool) {
          if (!bool) {
            archiveSite(url);
          }
        });
      })(url);
    }
  });
};

//
// parse file buffer data into index of site urls
// params:
// - buffer data
// return:
// - object with index = site url
//
var parseSiteIndex = function(data) {
  var result = {};
  _(data.split('\n')).each(function(elem) {
    result[elem] = true;
  });
  delete result[''];
  return result;
};

//
// scrapes html and writes to disk
// params:
// - url
// returns:
// - nothing
//
var archiveSite = function(url) {
  http_request.get(url, function(err, res) {
    if (err) { throw err; }
    var filePath = exports.paths.archivedSites + '/' + url;
    fs.writeFile(filePath, res.buffer.toString('utf8'), function(err) {
      if(err) { throw err; }
    });
  });
};
