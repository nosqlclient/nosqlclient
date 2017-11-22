import { Template } from 'meteor/templating';
import { UIComponents, Notification } from '/client/imports/modules';
import { CollectionAdd } from '/client/imports/ui';
import './options/add_collection_options';
import './add_collection.html';

Template.addCollection.onRendered(() => {
  $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
    const target = $(e.target).attr('href');
    if (target === '#tab-2-engine') UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divStorageEngine'), txtAreaId: 'txtStorageEngine' });
    else if (target === '#tab-3-validator') {
      $('#cmbValidationActionAddCollection').chosen({
        allow_single_deselect: true,
      });
      $('#cmbValidationLevelAddCollection').chosen({
        allow_single_deselect: true,
      });
      UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divValidatorAddCollection'), txtAreaId: 'txtValidatorAddCollection' });
    } else if (target === '#tab-4-collation') UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCollationAddCollection'), txtAreaId: 'txtCollationAddCollection' });
  });

  $('#cmbCollectionOrView').chosen();
  CollectionAdd.initializeOptions();
});

Template.addCollection.events({
  'click #anchorStorageEngine': function () {
    if (!$('#anchorStorageEngine').attr('data-toggle')) Notification.warning('Views can not have storage engine !');
  },

  'click #anchorValidator': function () {
    if (!$('#anchorValidator').attr('data-toggle')) Notification.warning('Views can not have validator !');
  },

  'change #cmbCollectionOrView': function () {
    if ($('#cmbCollectionOrView') === 'collection') CollectionAdd.prepareFormAsCollection();
    else CollectionAdd.prepareFormAsView();
  },

  'click #btnCreateCollection': function (event) {
    event.preventDefault();
    CollectionAdd.addCollection();
  },
});
