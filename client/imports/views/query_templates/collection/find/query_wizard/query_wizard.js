/**
 * Created by Sercan on 16.11.2016.
 */
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import QueryWizardChat from '/client/imports/query_wizard_chat';

import './query_wizard.html';

let queryWizard;
Template.queryWizard.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    queryWizard = new QueryWizardChat($('#cmbQueryWizardResponses'));
});

let warnedAlready = false;

Template.queryWizard.events({
    'click #btnQueryWizardRespond' (){
        let cmb = $('#cmbQueryWizardResponses');
        if (!cmb.val()) {
            if (!warnedAlready) {
                $('.query-wizard .content').append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">Please select an option, so that I can help you !</div></div>'));
                warnedAlready = true;
                return;
            }
            return;
        }


        $('.query-wizard .content').append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + cmb.val() + '</div></div>'));
        cmb.prop('disabled', true).trigger("chosen:updated");
        $('#btnQueryWizardRespond').prop('disabled', true);
        warnedAlready = false;
    }
});