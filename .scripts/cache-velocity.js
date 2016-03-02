#!/usr/bin/env node
var path = require('path'),
   _ = require('lodash'),
   spawn = require('child_process').spawn;

var baseDir = path.resolve(__dirname, '..'),
   srcDir = path.resolve(baseDir, 'src');

cacheVelocityMeteorRelease();

function cacheVelocityMeteorRelease() {
  console.log('Caching Velocity Meteor Release (can take a while the first time)');
  var childProcess = spawn('meteor',
     [
       '--raw-logs',
       '--settings', 'settings.json',
       '--release', 'velocity:METEOR@1.2.1_2'
     ],
     {
       cwd: srcDir,
       env: _.extend({}, process.env, {
         VELOCITY: 0
       })
     }
  );
  childProcess.stdout.setEncoding('utf8');
  childProcess.stderr.setEncoding('utf8');
  childProcess.stdout.on('data', function (line) {
    process.stdout.write(line);
  });
  childProcess.stderr.on('data', function (line) {
    process.stderr.write(line);
  });
  var exitAfterBuild = function exitAfterBuild(line) {
    if (line.indexOf('App running at') !== -1) {
      childProcess.kill('SIGINT');
      console.log('Done caching Velocity');
    } else if (
       line.indexOf('Your application is crashing') !== -1 ||
       line.indexOf('Errors prevented startup') !== -1) {
      childProcess.kill('SIGINT');
      console.error('There were issues whilst trying to cache the Velocity Meteor release');
      throw new Error(line);
    }
  };
  childProcess.stdout.on('data', exitAfterBuild);
  childProcess.stderr.on('data', exitAfterBuild);
}