/**
 * Created by sercan on 02.12.2016.
 */
import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';
import SchemaAnalyzeResult from '/lib/imports/collections/schema_analyze_result';

import './schema_analyzer.html';

const toastr = require('toastr');
const Ladda = require('ladda');
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

let fieldsBarChart = null;

const drawFieldsChart = function (data) {
    var divChart = $('#divFieldsChart');

    if (divChart.find('.flot-base').length <= 0) {
        var customOptions = jQuery.extend(true, {}, lineOptions);
        customOptions.colors = [];
        customOptions.bars = {
            align: "center",
            barWidth: 0.0001
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
            ticks: popoulateFieldsTicks(data)
        };
        try {
            fieldsBarChart = $.plot(divChart, populateFieldsData(data), customOptions);
        }
        catch (e) {
            fieldsBarChart = null;
        }
    }
    else {
        fieldsBarChart.setData(populateFieldsData(data));
        fieldsBarChart.setupGrid();
        fieldsBarChart.draw();
    }
};

const popoulateFieldsTicks = function (data) {
    let ticks = [];
    for (let i = 0; i < data.length; i++) {
        ticks.push([
            i, data[i]._id.key
        ]);
    }

    return ticks;
};

const populateFieldsData = function (data) {
    let counts = [];
    for (let i = 0; i < data.length; i++) {
        counts.push([
            i, data[i].totalOccurrences
        ]);
    }

    return [{label: "Counts", data: counts, color: "#1ab394"}];
};

Template.schemaAnalyzer.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');
    let schemaAnalyzeResult = this.subscribe('schema_analyze_result');

    this.autorun(() => {
        if (connections.ready() && settings.ready() && schemaAnalyzeResult.ready()) {
            Helper.initializeCollectionsCombobox();

            SchemaAnalyzeResult.find({connectionId: Session.get(Helper.strSessionConnection)}, {sort: {date: -1}}).observeChanges({
                added: function (id, fields) {
                    let jsonData = Helper.convertAndCheckJSON(fields.message);
                    if (jsonData['ERROR']) {
                        toastr.error(jsonData['ERROR']);
                        return;
                    }
                    drawFieldsChart(jsonData);
                }
            });
        }
    });
});

Template.schemaAnalyzer.events({
    'click #btnAnalyzeNow': function () {
        let collection = $('#cmbCollections').val();
        if (!collection) {
            toastr.info('Please select a collection first !');
            return;
        }

        if (collection.endsWith('.chunks')) {
            toastr.warn('I rather not analyzing a GridFS collection !');
            return;
        }

        var l = Ladda.create(document.querySelector('#btnAnalyzeNow'));
        l.start();

        Meteor.call("analyzeSchema", Session.get(Helper.strSessionConnection), collection, (err) => {
            if (err) {
                Helper.showMeteorFuncError(err, null, "Couldn't analyze collection");
            }

            Ladda.stopAll();
        });


    }

});