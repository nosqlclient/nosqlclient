import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import {Settings} from "/lib/imports/collections/settings";
import "./database_stats.html";

require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);

require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);
require('bootstrap-filestyle');

/**
 * Created by RSercan on 26.12.2015.
 */
/*global moment*/
let interval = null;
let memoryChart = null, connectionsChart = null, networkChart = null, opCountersChart = null, queuedReadWriteChart = null, activeReadWriteChart = null;
let previousTopData = {};

const lineOptions = {
    series: {
        lines: {
            show: true,
            lineWidth: 3,
            fill: true,
            fillColor: {
                colors: [{
                    opacity: 0.0
                }, {
                    opacity: 0.0
                }]
            }
        },
        points: {
            show: true
        }
    },
    xaxis: {
        show: true,
        tickFormatter: function (val) {
            return moment(val).format('HH:mm:ss');
        }
    },
    colors: ["#1ab394", "#ff0f0f"],
    grid: {
        color: "#999999",
        hoverable: true,
        clickable: true,
        tickColor: "#D4D4D4",
        borderWidth: 0
    },
    legend: {
        position: "ne"
    },
    tooltip: true,
    tooltipOpts: {
        content: "%y"
    }
};

const fetchStats = function () {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        let settings = Settings.findOne();
        Meteor.call("dbStats", function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't execute dbStats");
                Session.set(Helper.strSessionDBStats, undefined);
            }
            else {
                convertInformationsToCorrectUnit(result.result, settings);
                Session.set(Helper.strSessionDBStats, result.result);
            }
        });
    }
};

const poopulateActiveReadWriteData = function (result, data) {
    if (result.globalLock && result.globalLock.activeClients) {
        const readers = [], writers = [];

        const time = new Date().getTime();

        readers.push([time, result.globalLock.activeClients.readers]);
        writers.push([time, result.globalLock.activeClients.writers]);


        data.push({data: readers, label: "Readers"});
        data.push({data: writers, label: "Writers"});

        return result.globalLock.activeClients.total;
    }
};

const fetchStatus = function () {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        let settings = Settings.findOne();
        if (settings) {
            Meteor.call("serverStatus", function (err, result) {
                if (err || result.error) {
                    const errorMessage = result.error ? result.error.message : err.message;
                    $('#errorMessage').text("Successfully connected but, couldn't fetch server status: " + errorMessage);
                    Session.set(Helper.strSessionServerStatus, undefined);
                }
                else {
                    Session.set(Helper.strSessionServerStatus, result.result);
                    const memoryData = [], connectionsData = [], networkData = [], opCountersData = [], queuedReadWriteData = [], activeReadWriteData = [];
                    const memoryText = populateMemoryData(result.result, memoryData, settings);
                    const availableConnections = populateConnectionData(result.result, connectionsData);
                    const totalRequests = populateNetworkData(result.result, networkData, settings);
                    populateOPCountersData(result.result, opCountersData);
                    const totalQueuedReadWrite = poopulateQueuedReadWriteData(result.result, queuedReadWriteData);
                    const totalActiveReadWrite = poopulateActiveReadWriteData(result.result, activeReadWriteData);

                    initMemoryChart(memoryData, memoryText);
                    initConnectionsChart(connectionsData, availableConnections);
                    initNetworkChart(networkData, totalRequests);
                    initOperationCountersChart(opCountersData);
                    initQueuedReadWriteChart(queuedReadWriteData, totalQueuedReadWrite);
                    initActiveReadWriteChart(activeReadWriteData, totalActiveReadWrite);
                }
            });

            Meteor.call("top", function (err, result) {
                if (result && result.result && result.result.totals) {
                    const collectionReadWriteData = populateTopReadWriteData(result.result.totals);
                    initCollectionsReadWriteTable(collectionReadWriteData);
                    previousTopData = result.result.totals;
                }
            });
        }
    }
};

const initCollectionsReadWriteTable = function (collectionReadWriteData) {
    const table = $('#tblCollectionsReadWrite');
    if ($.fn.dataTable.isDataTable('#tblCollectionsReadWrite')) {
        table.DataTable().destroy();
    }

    table.DataTable({
        responsive: true,
        stateSave: true,
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        data: collectionReadWriteData,
        columns: [
            {data: "collection"},
            {data: "read"},
            {data: "write"}
        ]
    });
};

const poopulateQueuedReadWriteData = function (result, data) {
    if (result.globalLock && result.globalLock.currentQueue) {
        const readers = [], writers = [];

        const time = new Date().getTime();

        readers.push([time, result.globalLock.currentQueue.readers]);
        writers.push([time, result.globalLock.currentQueue.writers]);


        data.push({data: readers, label: "Readers"});
        data.push({data: writers, label: "Writers"});

        return result.globalLock.currentQueue.total;
    }
};

const populateTopReadWriteData = function (data) {
    let result = [];

    for (let collectionName in data) {
        if (collectionName === 'note') {
            continue;
        }
        if (data.hasOwnProperty(collectionName)) {
            let readTime = data[collectionName].readLock.time;
            let readCount = data[collectionName].readLock.count;
            let writeTime = data[collectionName].writeLock.time;
            let writeCount = data[collectionName].writeLock.count;

            let previousReadTime, previousReadCount, previousWriteTime, previousWriteCount;
            if (previousTopData[collectionName]) {
                previousReadTime = previousTopData[collectionName].readLock.time;
                previousReadCount = previousTopData[collectionName].readLock.count;
                previousWriteTime = previousTopData[collectionName].writeLock.time;
                previousWriteCount = previousTopData[collectionName].writeLock.count;
            } else {
                previousReadTime = readTime;
                previousReadCount = readCount;
                previousWriteTime = writeTime;
                previousWriteCount = writeCount;
            }

            let calculatedReadTime = Number((readTime - previousReadTime) / (readCount - previousReadCount)).toFixed(2);
            let calculatedWriteTime = Number((writeTime - previousWriteTime) / (writeCount - previousWriteCount)).toFixed(2);

            result.push({
                collection: collectionName,
                read: isNaN(calculatedReadTime) ? 0 : calculatedReadTime,
                write: isNaN(calculatedWriteTime) ? 0 : calculatedWriteTime
            });
        }
    }

    return result;
};

const populateOPCountersData = function (result, data) {
    if (result.opcounters) {
        const counts = [
            [0, result.opcounters.insert],
            [1, result.opcounters.query],
            [2, result.opcounters.update],
            [3, result.opcounters.delete],
            [4, result.opcounters.getmore]
        ];

        data.push({label: "Counts", data: counts, color: "#1ab394"});
    }
};

const populateConnectionData = function (result, data) {
    if (result.connections) {
        const currentData = [];
        const totalCreatedData = [];


        const time = new Date().getTime();

        currentData.push([time, Math.round(result.connections.current * 100) / 100]);
        totalCreatedData.push([time, Math.round(result.connections.totalCreated * 100) / 100]);


        data.push({data: currentData, label: "Active"});
        data.push({data: totalCreatedData, label: "Total Created"});

        return result.connections.available;
    }
};

const populateNetworkData = function (result, data, settings) {
    if (result.network) {
        let bytesInData = [];
        let bytesOutData = [];

        let scale = 1;
        let text = "MB";
        switch (settings.scale) {
            case "KiloBytes":
                scale = 1024;
                text = "KB";
                break;
            case "MegaBytes":
                scale = 1024 * 1024;
                text = "MB";
                break;
            default:
                scale = 1;
                text = "Bytes";
                break;
        }


        const time = new Date().getTime();

        bytesInData.push([time, Math.round((result.network.bytesIn / scale) * 100) / 100]);
        bytesOutData.push([time, Math.round((result.network.bytesOut / scale) * 100) / 100]);

        data.push({data: bytesInData, label: "Incoming " + text});
        data.push({data: bytesOutData, label: "Outgoing " + text});

        return result.network.numRequests;
    }
};

const populateMemoryData = function (result, data, settings) {
    if (result.mem) {
        let scale = 1;
        let text = "MB";
        switch (settings.scale) {
            case "KiloBytes":
                scale = 1024;
                text = "KB";
                break;
            case "Bytes":
                scale = 1024 * 1024;
                text = "Bytes";
                break;
            default:
                scale = 1;
                text = "MB";
                break;
        }

        let virtualMemData = [];
        let mappedMemData = [];
        let residentMemData = [];


        const time = new Date().getTime();

        virtualMemData.push([time, Math.round((result.mem.virtual * scale) * 100) / 100]);
        mappedMemData.push([time, Math.round((result.mem.mapped * scale) * 100) / 100]);
        residentMemData.push([time, Math.round((result.mem.resident * scale) * 100) / 100]);


        data.push({data: virtualMemData, label: "Virtual"});
        data.push({data: mappedMemData, label: "Mapped"});
        data.push({data: residentMemData, label: "Current"});

        return text;
    }
};

const convertInformationsToCorrectUnit = function (stats, settings) {
    let scale = 1024;
    let text = "Bytes";
    switch (settings.scale) {
        case "MegaBytes":
            scale = 1024 * 1024;
            text = "MBs";
            break;
        case "KiloBytes":
            scale = 1024;
            text = "KBs";
            break;
        default:
            scale = 1;
            text = "Bytes";
            break;
    }
    stats.dataSize = isNaN(Number(stats.dataSize / scale).toFixed(2)) ? "0 " + text : Number(stats.dataSize / scale).toFixed(2) + " " + text;
    stats.storageSize = isNaN(Number(stats.storageSize / scale).toFixed(2)) ? "0 " + text : Number(stats.storageSize / scale).toFixed(2) + " " + text;
    stats.indexSize = isNaN(Number(stats.indexSize / scale).toFixed(2)) ? "0 " + text : Number(stats.indexSize / scale).toFixed(2) + " " + text;
    stats.fileSize = isNaN(Number(stats.fileSize / scale).toFixed(2)) ? "0 " + text : Number(stats.fileSize / scale).toFixed(2) + " " + text;
};


const initOperationCountersChart = function (data) {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        const divChart = $('#divOperationCountersChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }
        if (divChart.find('.flot-base').length <= 0) {
            const customOptions = jQuery.extend(true, {}, lineOptions);
            customOptions.colors = [];
            customOptions.bars = {
                align: "center",
                barWidth: 0.5
            };
            customOptions.series = {
                bars: {
                    show: true
                },
                points: {
                    show: true
                }
            };
            customOptions.xaxis = {
                show: true,
                ticks: [[0, "Insert"], [1, "Query"], [2, "Update"], [3, "Delete"], [4, "Getmore"]]
            };
            try {
                opCountersChart = $.plot(divChart, data, customOptions);
            }
            catch (e) {
                opCountersChart = null;
            }
        }
        else {
            opCountersChart.setData(data);
            opCountersChart.setupGrid();
            opCountersChart.draw();
        }
    }
};

const initQueuedReadWriteChart = function (data, totalQueuedReadWrite) {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        if (totalQueuedReadWrite) {
            $('#spanTotalQueuedRW').html(', Total: ' + totalQueuedReadWrite);
        }

        const divChart = $('#divQueuedReadWrite');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported for current mongodb version');
            return;
        }

        if (divChart.find('.flot-base').length <= 0) {
            const customLineOptions = jQuery.extend(true, {}, lineOptions);
            try {
                queuedReadWriteChart = $.plot(divChart, data, customLineOptions);
            }
            catch (e) {
                queuedReadWriteChart = null;
            }
        }
        else {
            const existingData = queuedReadWriteChart.getData();
            if (existingData[0].data.length == 15) {
                existingData[0].data = existingData[0].data.slice(1, 15);

                if (existingData.length >= 2 && existingData[1].data) {
                    existingData[1].data = existingData[1].data.slice(1, 15);
                }

                if (existingData.length >= 3 && existingData[2].data) {
                    existingData[2].data = existingData[2].data.slice(1, 15);
                }
            }

            existingData[0].data.push.apply(existingData[0].data, data[0].data);

            if (existingData.length >= 2 && existingData[1].data && data[1].data) {
                existingData[1].data.push.apply(existingData[1].data, data[1].data);
            }
            if (existingData.length >= 3 && existingData[2].data && data[2].data) {
                existingData[2].data.push.apply(existingData[2].data, data[2].data);
            }

            queuedReadWriteChart.setData(existingData);
            queuedReadWriteChart.setupGrid();
            queuedReadWriteChart.draw();
        }
    }
};

const initActiveReadWriteChart = function (data, totalActiveReadWrite) {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        if (totalActiveReadWrite) {
            $('#spanTotalActiveRW').html(', Total: ' + totalActiveReadWrite);
        }

        const divChart = $('#divActiveReadWrite');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported for current mongodb version');
            return;
        }

        if (divChart.find('.flot-base').length <= 0) {
            const customLineOptions = jQuery.extend(true, {}, lineOptions);

            try {
                activeReadWriteChart = $.plot(divChart, data, customLineOptions);
            }
            catch (e) {
                activeReadWriteChart = null;
            }
        }
        else {
            const existingData = activeReadWriteChart.getData();
            if (existingData[0].data.length == 15) {
                existingData[0].data = existingData[0].data.slice(1, 15);

                if (existingData.length >= 2 && existingData[1].data) {
                    existingData[1].data = existingData[1].data.slice(1, 15);
                }

                if (existingData.length >= 3 && existingData[2].data) {
                    existingData[2].data = existingData[2].data.slice(1, 15);
                }
            }

            existingData[0].data.push.apply(existingData[0].data, data[0].data);

            if (existingData.length >= 2 && existingData[1].data && data[1].data) {
                existingData[1].data.push.apply(existingData[1].data, data[1].data);
            }
            if (existingData.length >= 3 && existingData[2].data && data[2].data) {
                existingData[2].data.push.apply(existingData[2].data, data[2].data);
            }

            activeReadWriteChart.setData(existingData);
            activeReadWriteChart.setupGrid();
            activeReadWriteChart.draw();
        }
    }
};

const initNetworkChart = function (data, totalRequests) {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        if (totalRequests) {
            $('#spanTotalRequests').html(', Total Requests: ' + totalRequests);
        }

        const divChart = $('#divNetworkChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }

        if (divChart.find('.flot-base').length <= 0) {
            const customLineOptions = jQuery.extend(true, {}, lineOptions);
            try {
                networkChart = $.plot(divChart, data, customLineOptions);
            }
            catch (e) {
                networkChart = null;
            }
        }
        else {
            const existingData = networkChart.getData();
            if (existingData[0].data.length == 15) {
                existingData[0].data = existingData[0].data.slice(1, 15);

                if (existingData.length >= 2 && existingData[1].data) {
                    existingData[1].data = existingData[1].data.slice(1, 15);
                }

                if (existingData.length >= 3 && existingData[2].data) {
                    existingData[2].data = existingData[2].data.slice(1, 15);
                }
            }

            existingData[0].data.push.apply(existingData[0].data, data[0].data);

            if (existingData.length >= 2 && existingData[1].data && data[1].data) {
                existingData[1].data.push.apply(existingData[1].data, data[1].data);
            }
            if (existingData.length >= 3 && existingData[2].data && data[2].data) {
                existingData[2].data.push.apply(existingData[2].data, data[2].data);
            }

            networkChart.setData(existingData);
            networkChart.setupGrid();
            networkChart.draw();
        }
    }
};

const initConnectionsChart = function (data, availableConnections) {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        const divChart = $('#divConnectionsChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }

        $('#spanAvailableConnections').html(', Available: ' + availableConnections);

        if (divChart.find('.flot-base').length <= 0) {
            try {
                connectionsChart = $.plot(divChart, data, lineOptions);
            }
            catch (e) {
                connectionsChart = null;
            }
        }
        else {
            const existingData = connectionsChart.getData();
            if (existingData[0].data.length == 10) {
                existingData[0].data = existingData[0].data.slice(1, 10);

                if (existingData.length >= 2 && existingData[1].data) {
                    existingData[1].data = existingData[1].data.slice(1, 10);
                }
            }

            existingData[0].data.push.apply(existingData[0].data, data[0].data);

            if (existingData.length >= 2 && existingData[1].data && data[1].data) {
                existingData[1].data.push.apply(existingData[1].data, data[1].data);
            }


            connectionsChart.setData(existingData);
            connectionsChart.setupGrid();
            connectionsChart.draw();
        }
    }
};

const initMemoryChart = function (data, text) {
    if (Session.get(Helper.strSessionCollectionNames) != undefined) {
        const divChart = $('#divHeapMemoryChart');
        if (data == undefined || data.length == 0) {
            divChart.html('This feature is not supported on this platform (OS)');
            return;
        }

        if (divChart.find('.flot-base').length <= 0) {
            const customLineOptions = jQuery.extend(true, {}, lineOptions);
            customLineOptions.colors.push("#273be2");
            customLineOptions.yaxis = {
                tickFormatter(val) {
                    return val + " " + text;
                }
            };
            try {
                memoryChart = $.plot(divChart, data, customLineOptions);
            }
            catch (e) {
                memoryChart = null;
            }
        }
        else {
            const existingData = memoryChart.getData();
            if (existingData[0].data.length == 15) {
                existingData[0].data = existingData[0].data.slice(1, 15);

                if (existingData.length >= 2 && existingData[1].data) {
                    existingData[1].data = existingData[1].data.slice(1, 15);
                }

                if (existingData.length >= 3 && existingData[2].data) {
                    existingData[2].data = existingData[2].data.slice(1, 15);
                }
            }

            existingData[0].data.push.apply(existingData[0].data, data[0].data);

            if (existingData.length >= 2 && existingData[1].data && data[1].data) {
                existingData[1].data.push.apply(existingData[1].data, data[1].data);
            }
            if (existingData.length >= 3 && existingData[2].data && data[2].data) {
                existingData[2].data.push.apply(existingData[2].data, data[2].data);
            }


            memoryChart.setData(existingData);
            memoryChart.setupGrid();
            memoryChart.draw();
        }
    }
};

Template.databaseStats.onRendered(function () {
    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    $('#divCollectionsReadWrite').slimScroll({
        height: '200px',
        railOpacity: 0.9
    });

    this.autorun(() => {
        if (settings.ready() && connections.ready()) {
            const fetchedSettings = Settings.findOne();
            if (fetchedSettings.showDBStats && !interval) {
                interval = Meteor.setInterval(function () {
                    fetchStats();
                    fetchStatus();
                }, fetchedSettings.dbStatsScheduler ? fetchedSettings.dbStatsScheduler : 3000);
            }
        }
    });
});

Template.databaseStats.onDestroyed(function () {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
});

Template.databaseStats.helpers({
    getServerStatus  () {
        if (Settings.findOne().showDBStats) {
            if (Session.get(Helper.strSessionServerStatus) == undefined) {
                fetchStatus();
            }

            return Session.get(Helper.strSessionServerStatus);
        }
    },

    getDBStats  () {
        if (Settings.findOne().showDBStats) {
            if (Session.get(Helper.strSessionDBStats) == undefined) {
                fetchStats();
            }

            return Session.get(Helper.strSessionDBStats);
        }
    }
});