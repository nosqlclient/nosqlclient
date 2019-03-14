import { Template } from 'meteor/templating';
import { Backup } from '/client/imports/ui';
import { UIComponents } from '/client/imports/modules';
import './options.html';

Template.readPreferenceTemplate.onRendered(() => {
  UIComponents.Combobox.init({ selector: $(`#${Template.instance().data.id}`), empty: false });
});

Template.databasesTemplate.onRendered(() => {
  Backup.loadDatabases(Template.instance().data.id.split('-')[0]);
});

Template.sortTemplate.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#mongoexport--sort'), txtAreaId: 'txtSort', noResize: true });
});

Template.databasesTemplate.events({
  'change #mongodump--db': function () {
    Backup.loadCollectionsCombo('mongodump');
  },

  'change #mongorestore--db': function () {
    Backup.loadCollectionsCombo('mongorestore');
  },

  'change #mongoexport--db': function () {
    Backup.loadCollectionsCombo('mongoexport');
  },

  'change #mongoimport--db': function () {
    Backup.loadCollectionsCombo('mongoimport');
  },
});

Template.collectionsTemplate.onRendered(() => {
  Backup.loadCollectionsCombo(Template.instance().data.id.split('-')[0]);
});

Template.verboseLevels.onRendered(() => {
  UIComponents.Combobox.init({ selector: $(`#${Template.instance().data.id}`), options: {}, empty: false });
});

Template.queryTemplate.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $(`#${Template.instance().data.id}`), txtAreaId: 'txtQuery', noResize: true });
});
