/**
 * Created by Sercan on 16.11.2016.
 */
import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';

import './query_wizard.html';

require('typed.js');

let step = 1, selectedOption, fieldName, txtValue, regexOptions;
const redirectText = "I'm redirecting you with your query, just press Execute";

const reset = function () {
    let txt = $('#inputQueryWizardResponse');
    let cmb = $('#cmbQueryWizardResponses');
    let txtDiv = $('#divQueryWizardTxt');
    let cmbDiv = $('#divQueryWizardCombo');
    let chatDiv = $('.query-wizard .content');
    let sendButton = $('#btnQueryWizardRespond');
    let sendButton2 = $('#btnQueryWizardRespond2');

    txt.prop('disabled', false);
    cmb.prop('disabled', false);
    sendButton.prop('disabled', false);
    sendButton2.prop('disabled', false);

    chatDiv.empty();
    chatDiv.append($('<div class="left"> <div class="author-name"> Nosqlclient </div> <div class="chat-message active"> Hello, let\'s start with giving a field name to me. </div></div> ' +
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
    cmb.attr('data-placeholder', "I want to retrieve documents that...");
    cmb.empty();
    cmb.append($('<option></option> <optgroup id="optGroupPositives" label="Positives"> <option value="1">have the field</option> <option value="2">the field matches regex</option> ' +
        '<option value="3">the field equals something</option> <option value="4">the field equals one of values of an array</option> <option value="5">the field is greater or equal than something</option> ' +
        '<option value="6">the field is greater than something</option> </optgroup> <optgroup id="optGroupNegatives" label="Negatives"> <option value="-1">have not the field</option> ' +
        '<option value="-2">the field not matches regex</option> <option value="-3">the field not equals something</option> <option value="-4">the field not equals one of values of an array</option> ' +
        '<option value="-5">the field is less or equal than something</option> <option value="-6">the field is less than something</option> </optgroup>'));
    cmb.chosen('destroy');
};

const redirect = function () {
    let query;
    if (selectedOption === "1") {
        query = '{ ' + fieldName + ':{ $exists: true }}';
    }
    else if (selectedOption === "2") {
        regexOptions = regexOptions ? regexOptions.join('') : "";
        query = '{ ' + fieldName + ':{ $regex:"' + txtValue + '",$options:"' + regexOptions + '" }}';
    } else if (selectedOption === "3") {
        query = '{ ' + fieldName + ':' + txtValue + ' }';
    } else if (selectedOption === "4") {
        query = '{ ' + fieldName + ':{ $in: ' + txtValue + ' }}';
    } else if (selectedOption === "5") {
        query = '{ ' + fieldName + ':{ $gte: ' + txtValue + ' }}';
    } else if (selectedOption === "6") {
        query = '{ ' + fieldName + ':{ $gt: ' + txtValue + ' }}';
    } else if (selectedOption === "-1") {
        query = '{ ' + fieldName + ':{ $exists: false }}';
    } else if (selectedOption === "-2") {
        regexOptions = regexOptions ? regexOptions.join('') : "";
        query = '{ ' + fieldName + ':{ $not: {$regex:"' + txtValue + '",$options:"' + regexOptions + '" }}}';
    } else if (selectedOption === "-3") {
        query = '{ ' + fieldName + ':{ $ne: ' + txtValue + ' }}';
    } else if (selectedOption === "-4") {
        query = '{ ' + fieldName + ':{ $not: { $in: ' + txtValue + ' }}}';
    } else if (selectedOption === "-5") {
        query = '{ ' + fieldName + ':{ $lte: ' + txtValue + ' }}';
    } else if (selectedOption === "-6") {
        query = '{ ' + fieldName + ':{ $lt: ' + txtValue + ' }}';
    }

    Helper.setCodeMirrorValue($('#divSelector'), query);
    Meteor.setTimeout(function () {
        $('#queryWizardModal').modal('hide');
        reset();
    }, 3350);
};

const respond = function () {
    let txt = $('#inputQueryWizardResponse');
    let txtDiv = $('#divQueryWizardTxt');
    let cmbDiv = $('#divQueryWizardCombo');
    let cmb = $('#cmbQueryWizardResponses');
    let chatDiv = $('.query-wizard .content');
    let sendButton = $('#btnQueryWizardRespond');
    let sendButton2 = $('#btnQueryWizardRespond2');

    switch (step) {
        case 1: {
            if (!txt.val()) {
                return;
            }
            chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + txt.val() + '</div></div>'));
            chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
            chatDiv.find('.left').last().find('.chat-message').typed({
                strings: ["So, you want to retrieve documents that..."],
                typeSpeed: -15
            });
            txtDiv.css('display', 'none');
            cmbDiv.css('display', '');
            cmb.chosen({
                allow_single_deselect: true,
                skip_no_results: true
            });
            step++;
            fieldName = txt.val().trim();
            break;
        }
        case 2: {
            if (!cmb.val()) {
                return;
            }
            selectedOption = cmb.val();
            let text = $('#cmbQueryWizardResponses_chosen').find('.result-selected').html();
            let stepText = step2();
            chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">I want to retrieve documents that ' +
                text + '</div></div>'));
            chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
            chatDiv.find('.left').last().find('.chat-message').typed({
                strings: ['Okay, ' + stepText],
                typeSpeed: -15
            });

            step++;
            break;
        }
        case 3: {
            if (!txt.val()) {
                return;
            }

            txtValue = txt.val();
            if (selectedOption === "4" || selectedOption === "-4") {
                let convertedValue = Helper.convertAndCheckJSON(txtValue);
                if (convertedValue["ERROR"] || Object.prototype.toString.call(convertedValue) !== '[object Array]') {
                    chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
                    chatDiv.find('.left').last().find('.chat-message').typed({
                        strings: ["Please provide a valid array, e.g. [3,5,6,7] or [\"myValue\",\"mySecondValue\"]"],
                        typeSpeed: -15
                    });
                    break;
                }
            }

            let stepText = step3();
            chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + txt.val() + '</div></div>'));
            chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
            chatDiv.find('.left').last().find('.chat-message').typed({
                strings: [stepText],
                typeSpeed: -15
            });

            step++;
            break;
        }
        case 4: {
            cmb.prop('disabled', true).trigger("chosen:updated");
            txt.prop('disabled', true);
            sendButton.prop('disabled', true);
            sendButton2.prop('disabled', true);

            regexOptions = cmb.val();
            chatDiv.append($('<div class="right"><div class="author-name">Me </div> <div class="chat-message">' + (regexOptions ? regexOptions : "No options") + '</div></div>'));
            chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
            chatDiv.find('.left').last().find('.chat-message').typed({
                strings: [redirectText],
                typeSpeed: -15
            });

            redirect();
            break;
        }
    }

    chatDiv.slimScroll({scrollBy: '400px'});
};

const step2 = function () {
    let txt = $('#inputQueryWizardResponse');
    let cmb = $('#cmbQueryWizardResponses');
    let txtDiv = $('#divQueryWizardTxt');
    let cmbDiv = $('#divQueryWizardCombo');
    let sendButton = $('#btnQueryWizardRespond');
    let sendButton2 = $('#btnQueryWizardRespond2');

    if (selectedOption === "1" || selectedOption === "-1") {
        txt.prop('disabled', true);
        cmb.prop('disabled', true).trigger("chosen:updated");
        sendButton.prop('disabled', true);
        sendButton2.prop('disabled', true);

        redirect();
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
        return "equals what ? Don't forget to provide correct type, e.g. for number 3, for string \"3\", for boolean true/false etc..";
    }
    if (selectedOption === "-3") {
        setTxtField();
        return "not equals what ? Don't forget to provide correct type, e.g. for number 3, for string \"3\", for boolean true/false etc..";
    }
    if (selectedOption === "4" || selectedOption === "-4") {
        setTxtField();
        return "can you share your array, e.g. [3,5,6,8] or for string values [\"myString\",\"myAnotherString\"]";
    }
    if (selectedOption === "5" || selectedOption === "-5") {
        setTxtField();
        return "then you should be looking for a number or date to be " + (selectedOption === "5" ? "greater" : "less") + " or equal than, what is it? (e.g. date(\"2017-01-01T13:00:00Z\")  or 100)";
    }
    if (selectedOption === "6" || selectedOption === "-6") {
        setTxtField();
        return "then you should be looking for a number or date to be " + (selectedOption === "6" ? "greater" : "less") + " or equal than, what is it? (e.g. date(\"2017-01-01T13:00:00Z\") or 100)";
    }
};

const step3 = function () {
    let txt = $('#inputQueryWizardResponse');
    let cmb = $('#cmbQueryWizardResponses');
    let txtDiv = $('#divQueryWizardTxt');
    let cmbDiv = $('#divQueryWizardCombo');
    let sendButton = $('#btnQueryWizardRespond');
    let sendButton2 = $('#btnQueryWizardRespond2');

    if (selectedOption === "2" || selectedOption === "-2") {
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
            .text("Dot (s)"));
        cmb.attr('data-placeholder', " ");
        cmb.chosen('destroy');
        cmb.chosen();

        txtDiv.css('display', 'none');
        cmbDiv.css('display', '');
        return "Cool, you can select one or more options to use with your regex, or just leave it empty and press Send";
    }

    txt.prop('disabled', true);
    cmb.prop('disabled', true).trigger("chosen:updated");
    sendButton.prop('disabled', true);
    sendButton2.prop('disabled', true);

    redirect();
    return redirectText
};

Template.queryWizard.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        FlowRouter.go('/databaseStats');
        return;
    }

    step = 1;
    $('.query-wizard .content').slimScroll({
        start: 'bottom'
    });
});


Template.queryWizard.events({
    'click #btnResetChat' (){
        reset();
    },

    'click #btnQueryWizardRespond' (){
        respond();
    },

    'click #btnQueryWizardRespond2'(){
        respond();
    }
});