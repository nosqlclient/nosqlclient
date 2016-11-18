/**
 * Created by Sercan on 16.11.2016.
 */
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';

import './query_wizard.html';

let step = 1, selectedOption, fieldName, txtValue, regexOptions;
const redirectText = "I'm redirecting you with your query";

const step2 = function () {
    let txt = $('#inputQueryWizardResponse');
    let cmb = $('#cmbQueryWizardResponses');
    let txtDiv = $('#divQueryWizardTxt');
    let cmbDiv = $('#divQueryWizardCombo');
    let sendButton = $('#btnQueryWizardRespond');

    if (selectedOption === "1" || selectedOption === "-1") {
        cmb.prop('disabled', true).trigger("chosen:updated");
        sendButton.prop('disabled', true);
        //TODO redirect
        return redirectText
    }

    const setTxtField = function () {
        txtDiv.css('display', '');
        cmbDiv.css('display', 'none');
        txt.val('');
    };

    if (selectedOption === "2" || selectedOption === "-2") {
        setTxtField();
        return "type your regex without starting and ending slash (/) e.g. acme.*corp";
    }
    if (selectedOption === "3") {
        setTxtField();
        return "equals what ?";
    }
    if (selectedOption === "-3") {
        setTxtField();
        return "not equals what ?"
    }
    if (selectedOption === "4" || selectedOption === "-4") {
        setTxtField();
        return "can you share your array, e.g. [3,5,6,8] or for string values [\"myString\",\"myAnotherString\"]";
    }
    if (selectedOption === "5" || selectedOption === "-5") {
        setTxtField();
        return "then you should be looking for a number or date to be " + (selectedOption === "5" ? "greater" : "less") + " or equal than, what is it (example date: date(\"2017-01-01T13:00:00Z\")) ?";
    }
    if (selectedOption === "6" || selectedOption === "-6") {
        setTxtField();
        return "then you should be looking for a number or date to be " + (selectedOption === "6" ? "greater" : "less") + " or equal than, what is it (example date: date(\"2017-01-01T13:00:00Z\")) ?";
    }
};

const step3 = function () {
    let cmb = $('#cmbQueryWizardResponses');
    let txtDiv = $('#divQueryWizardTxt');
    let cmbDiv = $('#divQueryWizardCombo');
    let sendButton = $('#btnQueryWizardRespond');

    if (selectedOption === "2" || selectedOption === "-2") {
        //TODO destroy chosen and create again
        cmb.empty();
        cmb.prop("multiple", "true");
        cmb.append($("<option></option>")
            .attr("value", "i")
            .text("Case insensitive (i)"));
        cmb.append($("<option></option>")
            .attr("value", "m")
            .text("Multiline (m)"));
        cmb.append($("<option></option>")
            .attr("value", "x")
            .text("Extended (x)"));
        cmb.append($("<option></option>")
            .attr("value", "s")
            .text("Allow the dot character to match all characters including newline (s)"));
        cmb.trigger("chosen:updated");

        txtDiv.css('display', 'none');
        cmbDiv.css('display', '');
        return "Cool, you can select one or more options to use with your regex, or just leave it empty and press Send";
    }

    cmb.prop('disabled', true).trigger("chosen:updated");
    sendButton.prop('disabled', true);
    //TODO redirect
    return redirectText
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
    'click #btnResetChat' (){
        let txt = $('#inputQueryWizardResponse');
        let cmb = $('#cmbQueryWizardResponses');
        let txtDiv = $('#divQueryWizardTxt');
        let cmbDiv = $('#divQueryWizardCombo');
        let chatDiv = $('.query-wizard .content');

        chatDiv.empty();
        chatDiv.append($('<div class="left"> <div class="author-name"> Mongoclient </div> <div class="chat-message active"> Hello, let\'s start with giving a field name to me. </div></div> ' +
            '<div class="right"> <div class="author-name"> Me</div> <div class="chat-message"> Hmm...</div> </div>'));

        step = 1;
        selectedOption = null;
        fieldName = null;
        txtValue = null;
        regexOptions = null;

        txtDiv.css('display', '');
        txt.val('');


        cmbDiv.css('display', 'none');
        cmb.prop("multiple", false);
        cmb.empty();
        cmb.append($('<option></option> <optgroup id="optGroupPositives" label="Positives"> <option value="1">have the field</option> <option value="2">the field matches regex</option> ' +
            '<option value="3">the field equals something</option> <option value="4">the field equals one of values of an array</option> <option value="5">the field is greater or equal than something</option> ' +
            '<option value="6">the field is greater than something</option> </optgroup> <optgroup id="optGroupNegatives" label="Negatives"> <option value="-1">have not the field</option> ' +
            '<option value="-2">the field not matches regex</option> <option value="-3">the field not equals something</option> <option value="-4">the field not equals one of values of an array</option> ' +
            '<option value="-5">the field is less or equal than something</option> <option value="-6">the field is less than something</option> </optgroup>'));
        cmb.trigger("chosen:updated");
    },

    'click #btnQueryWizardRespond' (){
        let txt = $('#inputQueryWizardResponse');
        let txtDiv = $('#divQueryWizardTxt');
        let cmbDiv = $('#divQueryWizardCombo');
        let cmb = $('#cmbQueryWizardResponses');
        let chatDiv = $('.query-wizard .content');
        let sendButton = $('#btnQueryWizardRespond');

        switch (step) {
            case 1:
                if (!txt.val()) {
                    return;
                }
                chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + txt.val() + '</div></div>'));
                chatDiv.append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">So, you want to retrieve documents that...</div></div>'));
                txtDiv.css('display', 'none');
                cmbDiv.css('display', '');
                cmb.chosen({
                    allow_single_deselect: true,
                    skip_no_results: true
                });
                step++;
                fieldName = txt.val().trim();
                break;
            case 2:
                if (!cmb.val()) {
                    return;
                }
                selectedOption = cmb.val();
                let stepText = step2();
                chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">I want to retrieve documents that ' +
                    $('#cmbQueryWizardResponses_chosen .result-selected').html() + '</div></div>'));
                chatDiv.append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">Okay, ' + stepText + '</div></div>'));
                step++;
                break;
            case 3:
                if (!txt.val()) {
                    return;
                }

                txtValue = txt.val();
                stepText = step3();
                chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + txt.val() + '</div></div>'));
                chatDiv.append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">' + stepText + '</div></div>'));

                break;
            case 4:
                console.log(cmb.val());
                cmb.prop('disabled', true).trigger("chosen:updated");
                sendButton.prop('disabled', true);

                chatDiv.append($('<div class="left"><div class="author-name">Mongoclient </div> <div class="chat-message active">' + redirectText + '</div></div>'));

                //TODO redirect
                break;
        }

        $('.query-wizard .content').slimScroll({scrollBy: '400px'});
    }
});