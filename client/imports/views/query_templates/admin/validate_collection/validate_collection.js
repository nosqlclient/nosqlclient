import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { UIComponents } from '/client/imports/modules';
import './validate_collection.html';

Template.validateCollection.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divOptions'), txtAreaId: 'txtOptions' });
  Querying.setVisibilityOfRunOnAdminCheckbox(false);
});

Template.validateCollection.executeQuery = Querying.Admin.executeValidateCollectionQuery.bind(Querying.Admin);
