# History

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
