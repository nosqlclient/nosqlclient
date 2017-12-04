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

const addData = function (index, existingData, data) {
  if (existingData.length >= (index + 1) && existingData[index].data && data[index].data) existingData[index].data.push(...data[index].data);
};

const mergeChartData = function (existingData, data, dataCountToKeep) {
  if (existingData[0].data.length >= dataCountToKeep) {
    existingData[0].data = existingData[0].data.slice(1, dataCountToKeep);

    if (existingData.length >= 2 && existingData[1].data) existingData[1].data = existingData[1].data.slice(1, dataCountToKeep);
    if (existingData.length >= 3 && existingData[2].data) existingData[2].data = existingData[2].data.slice(1, dataCountToKeep);
  }

  existingData[0].data.push(...data[0].data);
  addData(1, existingData, data);
  addData(2, existingData, data);

  return existingData;
};

const getCorrectScales = function (settings, forMemory) {
  if (forMemory) return Helper.getScaleAndText(settings.scale, true);
  return Helper.getScaleAndText(settings.scale);
};

const initChart = function ({ chartVariable, spanSelector, divSelector, data, total, translateKey = 'total', lineOptions, merge = true }) {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) return;

  if (total) spanSelector.html(`, ${Helper.translate({ key: translateKey })}: ${total}`);

  if (!data || data.length === 0) {
    divSelector.html(Helper.translate({ key: 'feature_not_supported_mongodb_version' }));
    return;
  }

  if (divSelector.find('.flot-base').length <= 0) {
    try {
      chartVariable = $.plot(divSelector, data, lineOptions);
    } catch (e) {
      chartVariable = null;
    }
  } else {
    const mergedData = merge ? mergeChartData(chartVariable.getData(), data, this.dataCountToKeep) : data;

    chartVariable.setData(mergedData);
    chartVariable.setupGrid();
    chartVariable.draw();
  }

  return chartVariable;
};

const proceedGettingReadWriteDataFromGlobalLock = function (result, data, lockField) {
  if (result.globalLock && result.globalLock[lockField]) {
    const readers = [];
    const writers = [];
    const time = new Date().getTime();

    readers.push([time, result.globalLock[lockField].readers]);
    writers.push([time, result.globalLock[lockField].writers]);

    data.push({ data: readers, label: Helper.translate({ key: 'readers' }) });
    data.push({ data: writers, label: Helper.translate({ key: 'writers' }) });

    return result.globalLock[lockField].total;
  }
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
      this.interval = setInterval(() => {
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
    return proceedGettingReadWriteDataFromGlobalLock(result, data, 'activeClients');
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
    return proceedGettingReadWriteDataFromGlobalLock(result, data, 'currentQueue');
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

    this.opCountersChart = initChart.call(this, {
      chartVariable: this.opCountersChart,
      divSelector: $('#divOperationCountersChart'),
      data,
      merge: false,
      lineOptions: customOptions,
    });
  },

  initQueuedReadWriteChart(data, totalQueuedReadWrite) {
    this.queuedReadWriteChart = initChart.call(this, {
      chartVariable: this.queuedReadWriteChart,
      spanSelector: $('#spanTotalQueuedRW'),
      divSelector: $('#divQueuedReadWrite'),
      data,
      total: totalQueuedReadWrite,
      lineOptions: jQuery.extend(true, {}, this.lineOptions),
    });
  },

  initActiveReadWriteChart(data, totalActiveReadWrite) {
    this.activeReadWriteChart = initChart.call(this, {
      chartVariable: this.activeReadWriteChart,
      spanSelector: $('#spanTotalActiveRW'),
      divSelector: $('#divActiveReadWrite'),
      data,
      lineOptions: jQuery.extend(true, {}, this.lineOptions),
      total: totalActiveReadWrite
    });
  },

  initNetworkChart(data, totalRequests) {
    this.networkChart = initChart.call(this, {
      chartVariable: this.networkChart,
      spanSelector: $('#spanTotalRequests'),
      divSelector: $('#divNetworkChart'),
      data,
      total: totalRequests,
      lineOptions: jQuery.extend(true, {}, this.lineOptions),
      translateKey: 'total_requests'
    });
  },

  initConnectionsChart(data, availableConnections) {
    this.connectionsChart = initChart.call(this, {
      chartVariable: this.connectionsChart,
      spanSelector: $('#spanAvailableConnections'),
      divSelector: $('#divConnectionsChart'),
      data,
      total: availableConnections,
      lineOptions: this.lineOptions,
      translateKey: 'available'
    });
  },

  initMemoryChart(data, text) {
    const customLineOptions = jQuery.extend(true, {}, this.lineOptions);
    customLineOptions.colors.push('#273be2');
    customLineOptions.yaxis = {
      tickFormatter(val) {
        return `${val} ${text}`;
      },
    };

    this.memoryChart = initChart.call(this, {
      chartVariable: this.memoryChart,
      divSelector: $('#divHeapMemoryChart'),
      data,
      lineOptions: customLineOptions
    });
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
