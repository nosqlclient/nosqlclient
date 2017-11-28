import { SessionManager, ErrorHandler, UIComponents, Enums, Notification } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import moment from 'moment';

const packageJson = require('/package.json');

const DBStats = function () {
  this.interval = null;
  this.memoryChart = null;
  this.connectionsChart = null;
  this.networkChart = null;
  this.opCountersChart = null;
  this.queuedReadWriteChart = null;
  this.activeReadWriteChart = null;
  this.dataCountToKeep = 15;
  this.previousTopData = {};
  this.lineOptions = {
    series: {
      lines: {
        show: true,
        lineWidth: 3,
        fill: true,
        fillColor: {
          colors: [{
            opacity: 0.0,
          }, {
            opacity: 0.0,
          }],
        },
      },
      points: {
        show: true,
      },
    },
    xaxis: {
      show: true,
      tickFormatter(val) {
        return moment(val).format('HH:mm:ss');
      },
    },
    colors: ['#1ab394', '#ff0f0f'],
    grid: {
      color: '#999999',
      hoverable: true,
      clickable: true,
      tickColor: '#D4D4D4',
      borderWidth: 0,
    },
    legend: {
      position: 'ne',
    },
    tooltip: true,
    tooltipOpts: {
      content: '%y',
    },
    zoom: {
      interactive: true,
    },
    pan: {
      interactive: true,
    },
  };
};

const mergeChartData = function (existingData, data, dataCountToKeep) {
  if (existingData[0].data.length >= dataCountToKeep) {
    existingData[0].data = existingData[0].data.slice(1, dataCountToKeep);

    if (existingData.length >= 2 && existingData[1].data) existingData[1].data = existingData[1].data.slice(1, dataCountToKeep);
    if (existingData.length >= 3 && existingData[2].data) existingData[2].data = existingData[2].data.slice(1, dataCountToKeep);
  }

  existingData[0].data.push(...data[0].data);
  if (existingData.length >= 2 && existingData[1].data && data[1].data) existingData[1].data.push(...data[1].data);
  if (existingData.length >= 3 && existingData[2].data && data[2].data) existingData[2].data.push(...data[2].data);

  return existingData;
};

const getCorrectScales = function (settings, forMemory) {
  let scale = 1;
  let text = 'MB';
  if (forMemory) {
    switch (settings.scale) {
      case 'KiloBytes':
        scale = 1024;
        text = 'KB';
        break;
      case 'Bytes':
        scale = 1024 * 1024;
        text = 'Bytes';
        break;
      default:
        scale = 1;
        text = 'MB';
        break;
    }
  } else {
    switch (settings.scale) {
      case 'MegaBytes':
        scale = 1024 * 1024;
        text = 'MB';
        break;
      case 'KiloBytes':
        scale = 1024;
        text = 'KB';
        break;
      default:
        scale = 1;
        text = 'Bytes';
        break;
    }
  }
  return { scale, text };
};

DBStats.prototype = {
  clear() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },

  init() {
    const fetchedSettings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
    if (fetchedSettings.showDBStats && !this.interval) {
      this.dataCountToKeep = (fetchedSettings.maxLiveChartDataPoints && fetchedSettings.maxLiveChartDataPoints > 0) ? fetchedSettings.maxLiveChartDataPoints : 15;
      this.interval = Meteor.setInterval(() => {
        this.fetchStats();
        this.fetchStatus();
      }, fetchedSettings.dbStatsScheduler ? fetchedSettings.dbStatsScheduler : 3000);
    }
  },

  subscribe() {
    Notification.start('#btnSubscribe');

    Communicator.call({
      methodName: 'handleSubscriber',
      args: { email: $('#txtEmailToSubscribe').val() },
      callback: (err) => {
        if (err) ErrorHandler.showMeteorFuncError(err);
        else Notification.success('thanks-for-subscription');
      }
    });
  },

  fetchStats() {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
      Communicator.call({
        methodName: 'dbStats',
        callback: (err, result) => {
          if (err || result.error) {
            ErrorHandler.showMeteorFuncError(err, result);
            SessionManager.set(SessionManager.strSessionDBStats, null);
          } else {
            this.convertInformationsToCorrectUnit(result.result, settings);
            SessionManager.set(SessionManager.strSessionDBStats, result.result);
          }
        }
      });
    }
  },

  poopulateActiveReadWriteData(result, data) {
    if (result.globalLock && result.globalLock.activeClients) {
      const readers = [];
      const writers = [];
      const time = new Date().getTime();

      readers.push([time, result.globalLock.activeClients.readers]);
      writers.push([time, result.globalLock.activeClients.writers]);

      data.push({ data: readers, label: Helper.translate({ key: 'readers' }) });
      data.push({ data: writers, label: Helper.translate({ key: 'writers' }) });

      return result.globalLock.activeClients.total;
    }
  },

  fetchStatus() {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
      if (settings) {
        Communicator.call({
          methodName: 'serverStatus',
          callback: (err, result) => {
            if (err || result.error) {
              const errorMessage = result.error ? result.error.message : err.message;
              $('#errorMessage').text(Helper.translate({ key: 'db_stats_error', options: { error: errorMessage } }));
              SessionManager.set(SessionManager.strSessionServerStatus, null);
            } else {
              SessionManager.set(SessionManager.strSessionServerStatus, result.result);
              const memoryData = []; const connectionsData = []; const networkData = []; const opCountersData = []; const queuedReadWriteData = []; const activeReadWriteData = [];
              const memoryText = this.populateMemoryData(result.result, memoryData, settings);
              const availableConnections = this.populateConnectionData(result.result, connectionsData);
              const totalRequests = this.populateNetworkData(result.result, networkData, settings);
              this.populateOPCountersData(result.result, opCountersData);
              const totalQueuedReadWrite = this.poopulateQueuedReadWriteData(result.result, queuedReadWriteData);
              const totalActiveReadWrite = this.poopulateActiveReadWriteData(result.result, activeReadWriteData);

              this.initMemoryChart(memoryData, memoryText);
              this.initConnectionsChart(connectionsData, availableConnections);
              this.initNetworkChart(networkData, totalRequests);
              this.initOperationCountersChart(opCountersData);
              this.initQueuedReadWriteChart(queuedReadWriteData, totalQueuedReadWrite);
              this.initActiveReadWriteChart(activeReadWriteData, totalActiveReadWrite);
            }
          }
        });

        Communicator.call({
          methodName: 'top',
          callback: (err, result) => {
            if (result && result.result && result.result.totals) {
              const collectionReadWriteData = this.populateTopReadWriteData(result.result.totals);
              this.initCollectionsReadWriteTable(collectionReadWriteData);
              this.previousTopData = result.result.totals;
            }
          }
        });
      }
    }
  },

  initCollectionsReadWriteTable(collectionReadWriteData) {
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblCollectionsReadWrite',
      columns: [
        { data: 'collection' },
        { data: 'read' },
        { data: 'write' },
      ],
      lengthMenu: [[5, 10, 25, -1], [5, 10, 25, 'All']],
      data: collectionReadWriteData
    });
  },

  poopulateQueuedReadWriteData(result, data) {
    if (result.globalLock && result.globalLock.currentQueue) {
      const readers = []; const writers = [];
      const time = new Date().getTime();

      readers.push([time, result.globalLock.currentQueue.readers]);
      writers.push([time, result.globalLock.currentQueue.writers]);

      data.push({ data: readers, label: Helper.translate({ key: 'readers' }) });
      data.push({ data: writers, label: Helper.translate({ key: 'writers' }) });

      return result.globalLock.currentQueue.total;
    }
  },

  populateTopReadWriteData(data) {
    const result = [];

    Object.keys(data).forEach((collectionName) => {
      if (collectionName !== 'note') {
        const readTime = data[collectionName].readLock.time;
        const readCount = data[collectionName].readLock.count;
        const writeTime = data[collectionName].writeLock.time;
        const writeCount = data[collectionName].writeLock.count;

        let previousReadTime; let previousReadCount; let previousWriteTime; let previousWriteCount;
        if (this.previousTopData[collectionName]) {
          previousReadTime = this.previousTopData[collectionName].readLock.time;
          previousReadCount = this.previousTopData[collectionName].readLock.count;
          previousWriteTime = this.previousTopData[collectionName].writeLock.time;
          previousWriteCount = this.previousTopData[collectionName].writeLock.count;
        } else {
          previousReadTime = readTime;
          previousReadCount = readCount;
          previousWriteTime = writeTime;
          previousWriteCount = writeCount;
        }

        const calculatedReadTime = Number((readTime - previousReadTime) / (readCount - previousReadCount));
        const calculatedWriteTime = Number((writeTime - previousWriteTime) / (writeCount - previousWriteCount));

        result.push({
          collection: collectionName,
          read: Number.isNaN(calculatedReadTime) ? 0 : calculatedReadTime.toFixed(2),
          write: Number.isNaN(calculatedWriteTime) ? 0 : calculatedWriteTime.toFixed(2),
        });
      }
    });

    return result;
  },

  populateOPCountersData(result, data) {
    if (result.opcounters) {
      const counts = [
        [0, result.opcounters.insert],
        [1, result.opcounters.query],
        [2, result.opcounters.update],
        [3, result.opcounters.delete],
        [4, result.opcounters.getmore],
      ];

      data.push({ label: Helper.translate({ key: 'counts' }), data: counts, color: '#1ab394' });
    }
  },

  populateConnectionData(result, data) {
    if (result.connections) {
      const currentData = []; const totalCreatedData = [];
      const time = new Date().getTime();

      currentData.push([time, Math.round(result.connections.current * 100) / 100]);
      totalCreatedData.push([time, Math.round(result.connections.totalCreated * 100) / 100]);

      data.push({ data: currentData, label: Helper.translate({ key: 'active' }) });
      data.push({ data: totalCreatedData, label: Helper.translate({ key: 'total_created' }) });

      return result.connections.available;
    }
  },

  populateNetworkData(result, data, settings) {
    if (result.network) {
      const bytesInData = []; const bytesOutData = [];
      const time = new Date().getTime();

      const { scale, text } = getCorrectScales(settings);

      bytesInData.push([time, Math.round((result.network.bytesIn / scale) * 100) / 100]);
      bytesOutData.push([time, Math.round((result.network.bytesOut / scale) * 100) / 100]);

      data.push({ data: bytesInData, label: Helper.translate({ key: 'incoming', options: { data: text } }) });
      data.push({ data: bytesOutData, label: Helper.translate({ key: 'outgoing', options: { data: text } }) });

      return result.network.numRequests;
    }
  },

  populateMemoryData(result, data, settings) {
    if (result.mem) {
      const { scale, text } = getCorrectScales(settings, true);

      const virtualMemData = []; const mappedMemData = []; const residentMemData = [];
      const time = new Date().getTime();

      virtualMemData.push([time, Math.round((result.mem.virtual * scale) * 100) / 100]);
      mappedMemData.push([time, Math.round((result.mem.mapped * scale) * 100) / 100]);
      residentMemData.push([time, Math.round((result.mem.resident * scale) * 100) / 100]);


      data.push({ data: virtualMemData, label: Helper.translate({ key: 'virtual' }) });
      data.push({ data: mappedMemData, label: Helper.translate({ key: 'mapped' }) });
      data.push({ data: residentMemData, label: Helper.translate({ key: 'current' }) });

      return text;
    }
  },

  convertInformationsToCorrectUnit(stats, settings) {
    const { scale, text } = getCorrectScales(settings);

    stats.dataSize = Number.isNaN(Number(stats.dataSize / scale)) ? `0 ${text}` : `${Number(stats.dataSize / scale).toFixed(2)} ${text}`;
    stats.storageSize = Number.isNaN(Number(stats.storageSize / scale)) ? `0 ${text}` : `${Number(stats.storageSize / scale).toFixed(2)} ${text}`;
    stats.indexSize = Number.isNaN(Number(stats.indexSize / scale)) ? `0 ${text}` : `${Number(stats.indexSize / scale).toFixed(2)} ${text}`;
    stats.fileSize = Number.isNaN(Number(stats.fileSize / scale)) ? `0 ${text}` : `${Number(stats.fileSize / scale).toFixed(2)} ${text}`;
  },

  initOperationCountersChart(data) {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      const divChart = $('#divOperationCountersChart');
      if (!data || data.length === 0) {
        divChart.html(Helper.translate({ key: 'not-supported-os' }));
        return;
      }
      if (divChart.find('.flot-base').length <= 0) {
        const customOptions = jQuery.extend(true, {}, this.lineOptions);
        customOptions.colors = [];
        customOptions.bars = {
          align: 'center',
          barWidth: 0.5,
        };
        customOptions.series = {
          bars: {
            show: true,
          },
          points: {
            show: true,
          },
        };
        customOptions.xaxis = {
          show: true,
          ticks: [[0, 'Insert'], [1, 'Query'], [2, 'Update'], [3, 'Delete'], [4, 'Getmore']],
        };
        try {
          this.opCountersChart = $.plot(divChart, data, customOptions);
        } catch (e) {
          this.opCountersChart = null;
        }
      } else {
        this.opCountersChart.setData(data);
        this.opCountersChart.setupGrid();
        this.opCountersChart.draw();
      }
    }
  },

  initQueuedReadWriteChart(data, totalQueuedReadWrite) {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      if (totalQueuedReadWrite) {
        $('#spanTotalQueuedRW').html(`, ${Helper.translate({ key: 'total' })}: ${totalQueuedReadWrite}`);
      }

      const divChart = $('#divQueuedReadWrite');
      if (!data || data.length === 0) {
        divChart.html(Helper.translate({ key: 'feature_not_supported_mongodb_version' }));
        return;
      }

      if (divChart.find('.flot-base').length <= 0) {
        const customLineOptions = jQuery.extend(true, {}, this.lineOptions);
        try {
          this.queuedReadWriteChart = $.plot(divChart, data, customLineOptions);
        } catch (e) {
          this.queuedReadWriteChart = null;
        }
      } else {
        const mergedData = mergeChartData(this.queuedReadWriteChart.getData(), data, this.dataCountToKeep);

        this.queuedReadWriteChart.setData(mergedData);
        this.queuedReadWriteChart.setupGrid();
        this.queuedReadWriteChart.draw();
      }
    }
  },

  initActiveReadWriteChart(data, totalActiveReadWrite) {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      if (totalActiveReadWrite) {
        $('#spanTotalActiveRW').html(`, ${Helper.translate({ key: 'total' })}: ${totalActiveReadWrite}`);
      }

      const divChart = $('#divActiveReadWrite');
      if (!data || data.length === 0) {
        divChart.html(Helper.translate({ key: 'feature_not_supported_mongodb_version' }));
        return;
      }

      if (divChart.find('.flot-base').length <= 0) {
        const customLineOptions = jQuery.extend(true, {}, this.lineOptions);

        try {
          this.activeReadWriteChart = $.plot(divChart, data, customLineOptions);
        } catch (e) {
          this.activeReadWriteChart = null;
        }
      } else {
        const mergedData = mergeChartData(this.activeReadWriteChart.getData(), data, this.dataCountToKeep);

        this.activeReadWriteChart.setData(mergedData);
        this.activeReadWriteChart.setupGrid();
        this.activeReadWriteChart.draw();
      }
    }
  },

  initNetworkChart(data, totalRequests) {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      if (totalRequests) $('#spanTotalRequests').html(`, ${Helper.translate({ key: 'total_requests' })}: ${totalRequests}`);

      const divChart = $('#divNetworkChart');
      if (!data || data.length === 0) {
        divChart.html(Helper.translate({ key: 'feature_not_supported_mongodb_version' }));
        return;
      }

      if (divChart.find('.flot-base').length <= 0) {
        const customLineOptions = jQuery.extend(true, {}, this.lineOptions);
        try {
          this.networkChart = $.plot(divChart, data, customLineOptions);
        } catch (e) {
          this.networkChart = null;
        }
      } else {
        const mergedData = mergeChartData(this.networkChart.getData(), data, this.dataCountToKeep);

        this.networkChart.setData(mergedData);
        this.networkChart.setupGrid();
        this.networkChart.draw();
      }
    }
  },

  initConnectionsChart(data, availableConnections) {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      const divChart = $('#divConnectionsChart');
      if (!data || data.length === 0) {
        divChart.html(Helper.translate({ key: 'feature_not_supported_mongodb_version' }));
        return;
      }

      $('#spanAvailableConnections').html(`, ${Helper.translate({ key: 'available' })}: ${availableConnections}`);

      if (divChart.find('.flot-base').length <= 0) {
        try {
          this.connectionsChart = $.plot(divChart, data, this.lineOptions);
        } catch (e) {
          this.connectionsChart = null;
        }
      } else {
        const mergedData = mergeChartData(this.connectionsChart.getData(), data, this.dataCountToKeep);

        this.connectionsChart.setData(mergedData);
        this.connectionsChart.setupGrid();
        this.connectionsChart.draw();
      }
    }
  },

  initMemoryChart(data, text) {
    if (SessionManager.get(SessionManager.strSessionCollectionNames)) {
      const divChart = $('#divHeapMemoryChart');
      if (!data || data.length === 0) {
        divChart.html(Helper.translate({ key: 'feature_not_supported_mongodb_version' }));
        return;
      }

      if (divChart.find('.flot-base').length <= 0) {
        const customLineOptions = jQuery.extend(true, {}, this.lineOptions);
        customLineOptions.colors.push('#273be2');
        customLineOptions.yaxis = {
          tickFormatter(val) {
            return `${val} ${text}`;
          },
        };
        try {
          this.memoryChart = $.plot(divChart, data, customLineOptions);
        } catch (e) {
          this.memoryChart = null;
        }
      } else {
        const mergedData = mergeChartData(this.memoryChart.getData(), data, this.dataCountToKeep);

        this.memoryChart.setData(mergedData);
        this.memoryChart.setupGrid();
        this.memoryChart.draw();
      }
    }
  },

  showWhatisNew() {
    const modal = $('#whatsNewModal');
    modal.on('shown.bs.modal', () => {
      $('#whatsNewHeader').html(`${Helper.translate({ key: 'what_is_new', options: { version: packageJson.version } })}`);
      $('#wizard').steps({
        enableFinishButton: false,
        enableCancelButton: false,
      });
    });

    if (!localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.WHAT_IS_NEW) && !SessionManager.get(SessionManager.strSessionCollectionNames)) modal.modal('show');
  }
};

export default new DBStats();
