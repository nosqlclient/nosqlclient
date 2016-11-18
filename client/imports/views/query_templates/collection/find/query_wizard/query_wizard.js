/**
 * Created by Sercan on 16.11.2016.
 */
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';

import './query_wizard.html';

let step = 1;

Template.queryWizard.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    step = 1;
    $('.query-wizard .content').slimScroll();
});


Template.queryWizard.events({
    'click #btnQueryWizardRespond' (){
        let txt = $('#inputQueryWizardResponse');
        let cmb = $('#cmbQueryWizardResponses');

        if (!txt.val()) {
            return;
        }

        $('.query-wizard .content').append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + txt.val() + '</div></div>'));

        switch (step) {
            case 1:
                $('.query-wizard .content').append($('<div class="left"><div class="author-name">Me </div> <div class="chat-message active">Great, now could you please select what to do with field ' + txt.val() + ' ?</div></div>'));
                txt.css('display', 'none');
                cmb.css('display', 'block');
                cmb.chosen();
                step++;
                break;
            case 2:

                break;
            case 3:

        }


    }
});