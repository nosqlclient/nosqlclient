import { Template } from 'meteor/templating';
import { CollectionRename } from '/client/imports/ui';
import './rename_collection.html';

Template.renameCollection.events({
  'click #btnRenameCollection': function () {
    CollectionRename.rename();
  }
});
