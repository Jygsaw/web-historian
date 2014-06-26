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

exports.readListOfUrls = function(asyncOn, dataProcessor){
  if (asyncOn) {
    fs.readFile(this.paths.list, 'utf8', function(err, data) {
      if(err) {
        throw err;
      } else {
        dataProcessor(parseSiteIndex(data));
      }
    });
  } else {
    var data = fs.readFileSync(this.paths.list, 'utf8');
    dataProcessor(parseSiteIndex(data));
  }
};

exports.isUrlInList = function(url){
  var urlList = null;
  this.readListOfUrls(false, function(data) {
    urlList = data;
  });
  return urlList.hasOwnProperty(url);
};

exports.addUrlToList = function(url){
  if (!this.isUrlInList(url)) {
    fs.appendFile(this.paths.list, url + '\n', 'utf8', function(err) {
      if (err) { throw err; }
    });
  }
};

exports.isUrlArchived = function(url){
  var archiveFiles = fs.readdirSync(this.paths.archivedSites);
  return _(archiveFiles).contains(url);
};

exports.downloadUrls = function(){
  this.readListOfUrls(true, function(data) {
    for(var url in data) {
      if (!exports.isUrlArchived(url)) {
        archiveSite(url);
      }
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
