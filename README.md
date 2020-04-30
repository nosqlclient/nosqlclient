## Nosqlclient (Formerly Mongoclient), MongoDB Management Tool

Cross-platform and self hosted, easy to use, MongoDB 4.0+ support and more features!

> Currently only DOCKER builds are supported, desktop distributions will be removed in the next version.
  

[![Build Status](https://travis-ci.org/nosqlclient/nosqlclient.svg?branch=master)](https://travis-ci.org/nosqlclient/nosqlclient)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6a75fc4e1d3f480f811b5339202400b5)](https://www.codacy.com/app/ozdemirsercan27/mongoclient?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mongoclient/mongoclient&amp;utm_campaign=Badge_Grade)
[![Code Coverage](https://api.codacy.com/project/badge/Coverage/6a75fc4e1d3f480f811b5339202400b5)](https://www.codacy.com/app/ozdemirsercan27/mongoclient?utm_source=github.com&utm_medium=referral&utm_content=mongoclient/mongoclient&utm_campaign=Badge_Coverage)
[![GitHub release](https://img.shields.io/github/release/nosqlclient/nosqlclient.svg)](https://github.com/nosqlclient/nosqlclient)
[![Docker Pulls](https://img.shields.io/docker/pulls/mongoclient/mongoclient.svg)](https://hub.docker.com/r/mongoclient/mongoclient/)
[![AGPLv3 License](https://img.shields.io/github/license/nosqlclient/nosqlclient.svg)](https://github.com/nosqlclient/nosqlclient/blob/master/LICENSE)

![Nosqlclient](https://www.nosqlclient.com/img/logo/mongoclient_logo_black_half_size.png)

## Chat
[Join us on Slack](https://communityinviter.com/apps/nosqlclient/nosqlclient), feel free to request to join our private `#development` channel if you're planning to contribute. 

## Demo
[Try Demo Application](https://www.nosqlclient.com/demo/)

## Documentation
All documentation can be found in https://www.nosqlclient.com/docs

## Docker

```docker pull mongoclient/mongoclient```

To install latest stable release:

```docker pull mongoclient/mongoclient:4.0.0```

Then you can run it as a daemon:

```docker run -d -p 3000:3000 mongoclient/mongoclient```

To set an external mongodb which is required for meteor to work, you can set ```MONGO_URL``` environment variable. Otherwise nosqlclient will install mongodb to container and use it.

To persist your connections and settings simply bind ```/data/db``` directory to your local machine as below.

```docker run -d -p 3000:3000 -v <your_path>:/data/db mongoclient/mongoclient```


## History
Please check [history](https://github.com/nosqlclient/nosqlclient/blob/master/HISTORY.MD) file for version information.


## License
Nosqlclient is licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License) for prior version 2.0.0, but for 2.0.0 and higher versions are licensed under [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html).

### We use JetBrains products to develop Nosqlclient !
[![www.jetbrains.com](https://github.com/nosqlclient/nosqlclient/blob/master/public/jetbrains.svg)](http://www.jetbrains.com)
