/**
 * Created by Sercan on 16.11.2016.
 */
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';

import './query_wizard.html';

let step = 1;
const redirectText = "I'm redirecting you with your query";

const getTextOfChatValue = function (val) {
    if (val === "1" || val === "-1") {
        return redirectText
    }
    if (val === "2" || val === "-2") {
        return "type your regex without starting and ending slash (/) ";
    }
    if (val === "3") {
        return "equals what ?";
    }
    if (val === "-3") {
        return "not equals what ?"
    }
    if (val === "4" || val === "-4") {
        return "can you share your array, e.g. [3,5,6,8] or for a string value [\"myString\",\"myAnotherString\"]";
    }
    if (val === "5" || val === "-5") {
        return "then you should be looking for a number or date to be " + (val === "5" ? "greater" : "less") + " or equal than, what is it ?";
    }
    if (val === "6" || val === "-6") {
        return "then you should be looking for a number or date to be " + (val === "6" ? "greater" : "less") + " or equal than, what is it ?";
    }
};

const step2 = function (val) {
    let txt = $('#inputQueryWizardResponse');
    let cmb = $('#cmbQueryWizardResponses');
    let txtDiv = $('#divQueryWizardTxt');
    let cmbDiv = $('#divQueryWizardCombo');
    let sendButton = $('#btnQueryWizardRespond');
    let chatDiv = $('.query-wizard .content');

    if (val === "1" || val === "-1") {
        cmb.prop('disabled', true).trigger("chosen:updated");
        sendButton.prop('disabled', true);
        //TODO redirect
    }
    else if (val === "2" || val === "-2") {
        txtDiv.css('display', '');
        cmbDiv.css('display', 'none');
        txt.val('');
        chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">My regex is ' + txt.val() + '</div></div>'));
        chatDiv.append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">Good one, you can select one or more options to use with your regex, or just leave it empty and press Send</div></div>'));
    }

};

Template.queryWizard.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    step = 1;
    $('.query-wizard .content').slimScroll({
        start: 'bottom'
    });
});


Template.queryWizard.events({
    'click #btnQueryWizardRespond' (){
        let txt = $('#inputQueryWizardResponse');
        let txtDiv = $('#divQueryWizardTxt');
        let cmbDiv = $('#divQueryWizardCombo');
        let cmb = $('#cmbQueryWizardResponses');
        let chatDiv = $('.query-wizard .content');

        switch (step) {
            case 1:
                if (!txt.val()) {
                    return;
                }
                chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + txt.val() + '</div></div>'));
                chatDiv.append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">Great, now could you please select what to do with field ' + txt.val() + ' ?</div></div>'));
                txtDiv.css('display', 'none');
                cmbDiv.css('display', '');
                cmb.chosen({
                    allow_single_deselect: true,
                    skip_no_results: true
                });
                step++;
                break;
            case 2:
                if (!cmb.val()) {
                    return;
                }
                chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">I want to retrieve documents that ' + $('#cmbQueryWizardResponses_chosen .result-selected').html() + '</div></div>'));
                chatDiv.append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">Okay, ' + getTextOfChatValue(cmb.val()) + '</div></div>'));
                step2(cmb.val());

                step++;
                break;
            case 3:

                break;
        }

        $('.query-wizard .content').slimScroll({scrollBy: '400px'});
    }
});