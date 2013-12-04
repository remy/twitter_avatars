#!/usr/bin/env node
var request = require('request'),
    fs = require('fs'),
    file = process.argv[2],
    directory = process.cwd() + '/avatars/';

if (!file) {
  console.log("Please provide a file with comma separated twitter handles\n\n  node avatars.js [file with avatars]");
  process.exit(1);
} else {
  fs.mkdir(directory, function (err) {
    fs.readFile(file, 'utf8', function (err, data) {
      data.split(',').map(function (user) {
        return user.trim();
      }).forEach(function (user) {
       request('http://twitter.com/api/users/profile_image/' + user + '?size=original').pipe(fs.createWriteStream(directory + user + '.jpg'));
      });
    });
  });
}
