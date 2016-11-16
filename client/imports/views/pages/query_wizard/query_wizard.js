/**
 * Created by Sercan on 16.11.2016.
 */
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';

import './query_wizard.html';

Template.queryWizard.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

});