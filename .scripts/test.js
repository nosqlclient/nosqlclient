#!/usr/bin/env node
var path = require('path'),
    extend = require('util')._extend,
    exec = require('child_process').exec;

// var chimpScript = path.resolve(__dirname, 'start.js');

// runTests();

// function runTests() {
//     runChimp(function () {
//         console.log('Yay!');
//     });
// }

// function runChimp(callback) {
//     startProcess({
//         name: 'Chimp',
//         options: {
//             env: extend({CI: 1}, process.env)
//         },
//         command: chimpScript
//     }, callback);
// }

// function startProcess(opts, callback) {

//     var proc = exec(
//         opts.command,
//         opts.options
//     );
//     proc.stdout.pipe(process.stdout);
//     proc.stderr.pipe(process.stderr);
//     proc.on('close', function (code) {
//         if (code > 0) {
//             console.log(opts.name, 'exited with code ' + code);
//             process.exit(code);
//         } else {
//             callback();
//         }
//     });
// }
