import './common_options.html';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import Helper from '/client/imports/helper';

const Ladda = require('ladda');

const loadDatabases = function (prefix) {
  const cmb = $(`#${prefix}--db`);
  cmb.empty();
  cmb.prepend("<option value=''></option>");

  Ladda.create(document.querySelector('#btnExecuteMongodump')).start();
  Ladda.create(document.querySelector('#btnExecuteMongorestore')).start();
  Ladda.create(document.querySelector('#btnExecuteMongoexport')).start();
  Ladda.create(document.querySelector('#btnExecuteMongoimport')).start();

  Meteor.call('getDatabases', Meteor.default_connection._lastSessionId, (err, result) => {
    if (err || result.error) {
      Helper.showMeteorFuncError(err, result, "Couldn't fetch databases, you can add manually");
    } else {
      for (let i = 0; i < result.result.length; i++) {
        cmb.append($('<option></option>')
          .attr('value', result.result[i].name)
          .text(result.result[i].name));
      }
    }

    cmb.chosen({
      create_option: true,
      allow_single_deselect: true,
      persistent_create_option: true,
      skip_no_results: true,
    });

    Ladda.stopAll();
  });
};

const loadCollectionsCombo = function (prefix) {
  Ladda.create(document.querySelector('#btnExecuteMongodump')).start();
  Ladda.create(document.querySelector('#btnExecuteMongorestore')).start();
  Ladda.create(document.querySelector('#btnExecuteMongoexport')).start();
  Ladda.create(document.querySelector('#btnExecuteMongoimport')).start();

  const cmb = $(`#${prefix}--collection`);
  cmb.empty();
  cmb.prepend("<option value=''></option>");
  const db = $(`#${prefix}--db`).val();
  if (!db) {
    cmb.chosen({
      create_option: true,
      allow_single_deselect: true,
      persistent_create_option: true,
      skip_no_results: true,
    });
    cmb.trigger('chosen:updated');
    Ladda.stopAll();
    return;
  }

  Meteor.call('listCollectionNames', db, Meteor.default_connection._lastSessionId, (err, result) => {
    if (err || result.error) {
      Helper.showMeteorFuncError(err, result, "Couldn't fetch collection names, you can add manually");
    } else {
      for (let i = 0; i < result.result.length; i++) {
        cmb.append($('<option></option>')
          .attr('value', result.result[i].name)
          .text(result.result[i].name));
      }
    }

    cmb.chosen({
      create_option: true,
      allow_single_deselect: true,
      persistent_create_option: true,
      skip_no_results: true,
    });
    cmb.trigger('chosen:updated');
    Ladda.stopAll();
  });
};

Template.readPreferenceTemplate.onRendered(() => {
  $(`#${Template.instance().data.id}`).chosen({
    create_option: true,
    allow_single_deselect: true,
    persistent_create_option: true,
    skip_no_results: true,
  });
});

Template.databasesTemplate.onRendered(() => {
  loadDatabases(Template.instance().data.id.split('-')[0]);
});

Template.databasesTemplate.events({
  'change #mongodump--db': function () {
    loadCollectionsCombo('mongodump');
  },

  'change #mongorestore--db': function () {
    loadCollectionsCombo('mongorestore');
  },

  'change #mongoexport--db': function () {
    loadCollectionsCombo('mongoexport');
  },

  'change #mongoimport--db': function () {
    loadCollectionsCombo('mongoimport');
  },
});

Template.collectionsTemplate.onRendered(() => {
  loadCollectionsCombo(Template.instance().data.id.split('-')[0]);
});

Template.verboseLevels.onRendered(() => {
  $(`#${Template.instance().data.id}`).chosen();
});

Template.queryTemplate.onRendered(() => {
  Helper.initializeCodeMirror($(`#${Template.instance().data.id}`), 'txtQuery', false, 100, true);
});
