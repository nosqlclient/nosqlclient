var app = require('app');
var browser = require('browser-window');
var electrify = require('electrify')(__dirname);
var Menu = require("menu");

var window = null;

app.on('ready', function () {

    // electrify start
    electrify.start(function (meteor_root_url) {

        // creates a new electron window
        window = new browser({
            width: 1200, height: 900,
            'node-integration': false // node integration must to be off
        });

        // open up meteor root url
        window.loadURL(meteor_root_url);

        /* UNCOMMENT FOR MAC PACKAGE
        var template = [{
            label: "Application",
            submenu: [
                {
                    label: "Quit", accelerator: "Command+Q", click: function () {
                    app.quit();
                }
                }
            ]
        }, {
            label: "Edit",
            submenu: [
                {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
                {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
                {type: "separator"},
                {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
                {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
                {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
            ]
        }
        ];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));*/
    });
});


app.on('window-all-closed', function () {
    app.quit();
});


app.on('will-quit', function terminate_and_quit(event) {

    // if electrify is up, cancel exiting with `preventDefault`,
    // so we can terminate electrify gracefully without leaving child
    // processes hanging in background
    if (electrify.isup() && event) {

        // holds electron termination
        event.preventDefault();

        // gracefully stops electrify
        electrify.stop(function () {

            // and then finally quit app
            app.quit();
        });
    }
});

// 
// =============================================================================
// 
// the methods bellow can be called seamlessly from your Meteor's
// client and server code, using:
// 
//    Electrify.call('methodname', [..args..], callback);
// 
// ATENTION:
//    From meteor, you can only call these methods after electrify is fully
//    started, use the Electrify.startup() convenience method for this
// 
// 
// Electrify.startup(function(){
//   Electrify.call(...);
// });
// 
// =============================================================================
// 
// electrify.methods({
//   'method.name': function(name, done) {
//     // do things... and call done(err, arg1, ..., argN)
//     done(null);
//   }
// });
// 
