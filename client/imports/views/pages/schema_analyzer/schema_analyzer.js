/**
 * Created by sercan on 02.12.2016.
 */
import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';

import './schema_analyzer.html';

const toastr = require('toastr');
const Ladda = require('ladda');

Template.schemaAnalyzer.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    this.autorun(() => {
        if (connections.ready() && settings.ready()) {
            Helper.initializeCollectionsCombobox();
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

    }

});