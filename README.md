## Mongoclient, MongoDB Management Tool
Cross-platform, easy to use, MongoDB 3.4+ support and more features!

[![Build Status](https://travis-ci.org/mongoclient/mongoclient.svg?branch=master)](https://travis-ci.org/mongoclient/mongoclient)
[![Code Climate](https://codeclimate.com/github/mongoclient/mongoclient/badges/gpa.svg)](https://codeclimate.com/github/mongoclient/mongoclient)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6a75fc4e1d3f480f811b5339202400b5)](https://www.codacy.com/app/ozdemirsercan27/mongoclient?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mongoclient/mongoclient&amp;utm_campaign=Badge_Grade)
[![GitHub release](https://img.shields.io/github/release/mongoclient/mongoclient.svg)](https://github.com/mongoclient/mongoclient)
[![Github All Releases](https://img.shields.io/github/downloads/mongoclient/mongoclient/total.svg)](https://github.com/mongoclient/mongoclient)
[![Docker Pulls](https://img.shields.io/docker/pulls/mongoclient/mongoclient.svg)](https://hub.docker.com/r/mongoclient/mongoclient/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/mongoclient/mongoclient/blob/master/LICENSE)

<img src="https://www.mongoclient.com/img/logo/mongoclient_logo_black.png">

## Demo
[Try Demo Application](https://www.mongoclient.com:5000)

## Documentation
All documentation can be found in https://www.mongoclient.com/docs

## Docker

```docker pull mongoclient/mongoclient```

To install latest stable release:

```docker pull mongoclient/mongoclient:1.5.0```

Then you can run it as a daemon:

```docker run -d -p 3000:3000 mongoclient/mongoclient```

To set an external mongodb which is required for meteor to work, you can set ```MONGO_URL``` environment variable. Otherwise mongoclient will install mongodb to container and use it.

To persist your connections and settings simply bind ```/data/db``` directory to your local machine as below.

```docker run -d -p 3000:3000 -v <your_path>:/data/db mongoclient/mongoclient```


## Distributions

* [Linux x64](https://github.com/mongoclient/mongoclient/releases/download/1.5.0/linux-portable-x64.zip)
* [Windows x64](https://github.com/mongoclient/mongoclient/releases/download/1.5.0/windows-portable-x64.zip)
* [OSx](https://github.com/mongoclient/mongoclient/releases/download/1.5.0/osx-portable.zip)
* [Web Application](https://github.com/mongoclient/mongoclient/wiki#31-compile-from-source-browser-edition)


## History
Please check [history](https://github.com/mongoclient/mongoclient/blob/master/HISTORY.MD) file for version information.


## License
Mongoclient is licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License) for prior version 2.0.0, but for 2.0.0 and higher versions are licensed under [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html).
