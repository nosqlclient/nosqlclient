import { Template } from 'meteor/templating';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { CollectionUtil } from '/client/imports/ui';
import './page_heading.html';

Template.pageHeading.helpers({
  // Route for Home link in breadcrumbs
  home: 'databaseStats',

  getCollectionInformation() {
    if (!SessionManager.get(SessionManager.strSessionSelectedCollection)) {
      $('#divCollectionInfo').html('');
      return;
    }

    CollectionUtil.getCollectionInformation();
  },
});
