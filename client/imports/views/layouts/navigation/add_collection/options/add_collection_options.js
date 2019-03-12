import { Template } from 'meteor/templating';
import { UIComponents, SessionManager } from '/client/imports/modules';
import $ from 'jquery';
import './add_collection_options.html';

Template.addCollectionOptions.helpers({
  isAddCollectionOptionSelected(opt) {
    return $.inArray(opt, SessionManager.get(SessionManager.strSessionSelectedAddCollectionOptions)) !== -1;
  }
});

Template.indexOptionDefaults.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divIndexOptionDefaults'), txtAreaId: 'txtIndexOptionDefaults' });
});

Template.flags.onRendered(() => {
  UIComponents.Checkbox.init($('#inputNoPadding, #inputTwoSizesIndexes'), 'uncheck');
});
