# History
## 2.2.0, 23 Aug 2017
- Added clone collection
- Added zoom in/out to charts
- Added configurable number of points to charts
- Made auto-complete enabled by default
- Made auto-complete shortcut configurable
- Added prompting credentials when they're empty in the connection
- Changed SSH tunnel readyTimeout to 99 secs
- Fixed connections UI
- Fixed shell incorrect command crashes

## 2.1.0, 13 May 2017
- Fixed sidebar minimize button
- Fixed SSH Tunneling
- Added shell histories
- Improved aggregation section, added aggregate histories
- Added configurable mongo binary for shell and schema analyzer
- Fixed messed up sessions for per connection
- Added skins

## 2.0.0, 9 April 2017
- Enterprise edition is finally here
- File management fixed
- Made connection/socket timeout overridable while creating/editing connection
- Responsive datatables
- Fixed an issue with @ char in db names
- Switch database fixed while using URL connection
- Fixed an issue with date queries with space
- Updated internal mongo binaries to 3.4
- Reworked connections section, supporting LDAP, Kerberos etc.
- Resizable main view for left panel
- Made single tab as configurable for result views
- Shell is usable now in SSH tunnels
- Meteor updated to 1.4.2.6
- Added stored functions management
- Added index management
- Added document validation rules
- Improved create collection/view
- Added filtering collection names
- Improved query options for all queries
- Added delete fies to file management
- Made shell command resizable
- Added two new charts (active read/write collection read/write)
- Made chart scheduler time configurable
- Fixed a layout problem with huge collection names
- Added automatic update notification
- Added save button to find query
- Added default limit to find query
- Fixed spawning external mongo binaries for shell, schema analyzer
- Made live chat configurable
- Fixed dump path saving
- More on docs - https://nosqlclient.com/docs/

## 1.5.0, 28 December 2016
- Added mongodb 3.4 support
- Separated scrollbars for navigation and main view
- Added native shell
- Added schema analyzer
- Added clone connection
- Moved to flowrouter instead of ironrouter
- Added a simple query wizard
- User management add user fixed
- Filled default database name to test in connection tab

## 1.4.0, 6 November 2016
- Added JSON data import support to dump/restore section
- Added keeping query form for each result tab
- Improved findOne edit document
- Added exporting query result as CSV,JSON
- Added context menu to close all tabs, close others
- Added chat again
- Changed querying BSON types with a way better method (extended JSON)
- Fixed docker image crashes
- Moved to ES6 in general
- Added import/export mongoclient data
- Updated to nodejs driver 2.2
- Changed all selectors with codemirror, instead of aceeditor
- Fixed auto complete
- Updated to MeteorJS 1.4+
- Added about section
- Added breaking changes section
- Added allowing manually entrance of switch database name


## 1.3.0, 30 August 2016
- Removed live chat
- Added impure JSON support
- Fixed null values in array conversion
- Added switch database
- Added delete button on findOne
- Fixed docker image crash
- Updated to MeteorJS 1.3+, which is huge
- Fixed JSONEditor UI issues
- Added basic authentication to mongoclient

## 1.2.2, 5 June 2016
- Added x509 authentication
- Added findOne update document
- Fixed certificate issues for connections
- Fixed ssh connection from OSX
- Added legacy slaveOk for connections
- Fixed file management download

## 1.2.1, 23 May 2016
- Added file management selector
- Fixed find options, wasn't working at first collection selection

## 1.2.0, 19 May 2016
- Added docker image
- Added aggregate section
- Added connection pooling
- Added SSH tunnel connections
- Changed default query to find
- Removed connected popup
- Changed selectors as resizable
- Disabled top search box
- Added live chat
- Changed settings icon
- Added file management metadata update
- Fixed easy edit bugs
- Fixed URI connection encoding issues
- Fixed insertMany
- Fixed file deletion
- Sorted collection names at navigation panel

## 1.1.0, 1 May 2016
- Added user management section
- Fixed modal windows as responsive
- Added URI connection
- Added authentication database for connection
- Added read from secondary for replica sets. 
- Extended admin queries
- Fixed validate collection query error
- Added persistent selector for current session
- Removed external links 
- Fixed object id conversions
- Fixed metis menu on connect/disconnect
- Added checkboxes for BSON conversions of object ids and iso dates

## 1.0.0, 10 March 2016

- Added electron distributions
- Added refresh collections button
- Added feddback from inside of mongoclient
- Added query history
- Added easy edit
- Added Auto completion
- Added drop, create collection with a single click
- Added basic file management
- Added dump/restore section
- Added firefox support  
