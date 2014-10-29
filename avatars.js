// #!/usr/bin/env node
var request = require('request');
var twitter = require('twitter');
var twit = new twitter(require(process.env.CONFIG || './config.json'));
var fs = require('then-fs');
var file = process.argv[2];
var directory = process.cwd() + '/avatars/';
var Promise = require('promise');
var noop = function () {};
var rateLimited = false;

if (!file) {
  console.log("Please provide a file with new-line separated twitter handles\n\n  node avatars.js [file with avatars]");
  process.exit(1);
} else {
  fs.mkdir(directory).catch(noop).then(function () {
    return fs.readFile(file, 'utf8');
  }).then(function (data) {
    var promises = data.split('\n').map(function (user) {
      user = user.replace(/@/, '').trim();
      return fs.exists(directory + user + '.jpg').then(function (exists) {
        // if the user exists, then we don't do them again
        return exists ? false : user;
      });
    });

    console.log('Requesting ' + promises.length + ' avatars...');

    Promise.all(promises).then(function (users) {
      users.filter(function (user) {
        return user;
      }).forEach(function (user) {
        twit.get('/users/show.json', {
          screen_name: user
        }, function (data, res) {
          if (res.headers['x-rate-limit-remaining'] == 0 && !rateLimited) {
            rateLimited = true;
            console.log('Requests have been rate limited');
            console.log('Run script again at ' + new Date(res.headers['x-rate-limit-reset'] * 1000).toString());
          }

          if (data && data.profile_image_url) {
            var url = data.profile_image_url.replace(/_normal/, '');
            console.log(url);
            request(url).pipe(fs.createWriteStream(directory + user + '.jpg'));
          }
        });
      });
    }).catch(function (error) {
      console.log(error);
    });
  });
}
