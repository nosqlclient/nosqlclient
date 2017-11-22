import { UIComponents, ExtendedJSON } from '/client/imports/modules';

const QueryWizard = function () {
  this.step = 1;
  this.selectedOption = null;
  this.fieldName = null;
  this.txtValue = null;
  this.regexOptions = null;
  this.redirectText = "I'm redirecting you with your query, just press Execute";
};

QueryWizard.prototype = {
  init() {
    this.step = 1;
    $('.query-wizard .content').slimScroll({
      start: 'bottom',
    });
  },

  reset() {
    const txt = $('#inputQueryWizardResponse');
    const cmb = $('#cmbQueryWizardResponses');
    const txtDiv = $('#divQueryWizardTxt');
    const cmbDiv = $('#divQueryWizardCombo');
    const chatDiv = $('.query-wizard .content');
    const sendButton = $('#btnQueryWizardRespond');
    const sendButton2 = $('#btnQueryWizardRespond2');

    txt.prop('disabled', false);
    cmb.prop('disabled', false);
    sendButton.prop('disabled', false);
    sendButton2.prop('disabled', false);

    chatDiv.empty();
    chatDiv.append($('<div class="left"> <div class="author-name"> Nosqlclient </div> <div class="chat-message active"> Hello, let\'s start with giving a field name to me. </div></div> ' +
      '<div class="right"> <div class="author-name"> Me</div> <div class="chat-message"> Hmm...</div> </div>'));

    this.step = 1; this.selectedOption = null; this.fieldName = null; this.txtValue = null; this.regexOptions = null;

    txtDiv.css('display', '');
    txt.val('');

    cmbDiv.css('display', 'none');
    cmb.prop('multiple', false);
    cmb.attr('data-placeholder', 'I want to retrieve documents that...');
    cmb.empty();
    cmb.append($('<option></option> <optgroup id="optGroupPositives" label="Positives"> <option value="1">have the field</option> <option value="2">the field matches regex</option> ' +
      '<option value="3">the field equals something</option> <option value="4">the field equals one of values of an array</option> ' +
      '<option value="5">the field is greater or equal than something</option> ' +
      '<option value="6">the field is greater than something</option> </optgroup> <optgroup id="optGroupNegatives" label="Negatives"> <option value="-1">have not the field</option> ' +
      '<option value="-2">the field not matches regex</option> <option value="-3">the field not equals something</option> ' +
      '<option value="-4">the field not equals one of values of an array</option> ' +
      '<option value="-5">the field is less or equal than something</option> <option value="-6">the field is less than something</option> </optgroup>'));
    cmb.chosen('destroy');
  },

  redirect() {
    let query;
    if (this.selectedOption === '1') query = `{ ${this.fieldName}:{ $exists: true }}`;
    else if (this.selectedOption === '2') {
      this.regexOptions = this.regexOptions ? this.regexOptions.join('') : '';
      query = `{ ${this.fieldName}:{ $regex:"${this.txtValue}",$options:"${this.regexOptions}" }}`;
    } else if (this.selectedOption === '3') query = `{ ${this.fieldName}:${this.txtValue} }`;
    else if (this.selectedOption === '4') query = `{ ${this.fieldName}:{ $in: ${this.txtValue} }}`;
    else if (this.selectedOption === '5') query = `{ ${this.fieldName}:{ $gte: ${this.txtValue} }}`;
    else if (this.selectedOption === '6') query = `{ ${this.fieldName}:{ $gt: ${this.txtValue} }}`;
    else if (this.selectedOption === '-1') query = `{ ${this.fieldName}:{ $exists: false }}`;
    else if (this.selectedOption === '-2') {
      this.regexOptions = this.regexOptions ? this.regexOptions.join('') : '';
      query = `{ ${this.fieldName}:{ $not: {$regex:"${this.txtValue}",$options:"${this.regexOptions}" }}}`;
    } else if (this.selectedOption === '-3') query = `{ ${this.fieldName}:{ $ne: ${this.txtValue} }}`;
    else if (this.selectedOption === '-4') query = `{ ${this.fieldName}:{ $not: { $in: ${this.txtValue} }}}`;
    else if (this.selectedOption === '-5') query = `{ ${this.fieldName}:{ $lte: ${this.txtValue} }}`;
    else if (this.selectedOption === '-6') query = `{ ${this.fieldName}:{ $lt: ${this.txtValue} }}`;

    UIComponents.Editor.setCodeMirrorValue($('#divSelector'), query);
    Meteor.setTimeout(() => {
      $('#queryWizardModal').modal('hide');
      this.reset();
    }, 3350);
  },

  respond() {
    const txt = $('#inputQueryWizardResponse');
    const txtDiv = $('#divQueryWizardTxt');
    const cmbDiv = $('#divQueryWizardCombo');
    const cmb = $('#cmbQueryWizardResponses');
    const chatDiv = $('.query-wizard .content');
    const sendButton = $('#btnQueryWizardRespond');
    const sendButton2 = $('#btnQueryWizardRespond2');

    switch (this.step) {
      case 1: {
        if (!txt.val()) {
          return;
        }
        chatDiv.append($(`<div class="right"><div class="author-name">Me </div> <div class="chat-message">${txt.val()}</div></div>`));
        chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
        chatDiv.find('.left').last().find('.chat-message').html('So, you want to retrieve documents that...');
        txtDiv.css('display', 'none');
        cmbDiv.css('display', '');
        cmb.chosen({
          allow_single_deselect: true,
          skip_no_results: true,
        });

        this.step += 1;
        this.fieldName = txt.val().trim();
        break;
      }
      case 2: {
        if (!cmb.val()) {
          return;
        }
        this.selectedOption = cmb.val();
        const text = $('#cmbQueryWizardResponses_chosen').find('.result-selected').html();
        const stepText = this.step2();
        chatDiv.append($(`<div class="right"><div class="author-name">Me </div> <div class="chat-message">I want to retrieve documents that ${
          text}</div></div>`));
        chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
        chatDiv.find('.left').last().find('.chat-message').html(`Okay, ${stepText}`);

        this.step += 1;
        break;
      }
      case 3: {
        if (!txt.val()) {
          return;
        }

        this.txtValue = txt.val();
        if (this.selectedOption === '4' || this.selectedOption === '-4') {
          const convertedValue = ExtendedJSON.convertAndCheckJSON(this.txtValue);
          if (convertedValue.ERROR || Object.prototype.toString.call(convertedValue) !== '[object Array]') {
            chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
            chatDiv.find('.left').last().find('.chat-message').html('Please provide a valid array, e.g. [3,5,6,7] or ["myValue","mySecondValue"]');
            break;
          }
        }

        const stepText = this.step3();
        chatDiv.append($(`<div class="right"><div class="author-name">Me </div> <div class="chat-message">${txt.val()}</div></div>`));
        chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
        chatDiv.find('.left').last().find('.chat-message').html(stepText);

        this.step += 1;
        break;
      }
      case 4: {
        cmb.prop('disabled', true).trigger('chosen:updated');
        txt.prop('disabled', true);
        sendButton.prop('disabled', true);
        sendButton2.prop('disabled', true);

        this.regexOptions = cmb.val();
        chatDiv.append($(`<div class="right"><div class="author-name">Me </div> <div class="chat-message">${this.regexOptions || 'No options'}</div></div>`));
        chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
        chatDiv.find('.left').last().find('.chat-message').html(this.redirectText);

        this.redirect();
        break;
      }
      default: break;
    }

    chatDiv.slimScroll({ scrollBy: '400px' });
  },

  step2() {
    const txt = $('#inputQueryWizardResponse');
    const cmb = $('#cmbQueryWizardResponses');
    const txtDiv = $('#divQueryWizardTxt');
    const cmbDiv = $('#divQueryWizardCombo');
    const sendButton = $('#btnQueryWizardRespond');
    const sendButton2 = $('#btnQueryWizardRespond2');

    if (this.selectedOption === '1' || this.selectedOption === '-1') {
      txt.prop('disabled', true);
      cmb.prop('disabled', true).trigger('chosen:updated');
      sendButton.prop('disabled', true);
      sendButton2.prop('disabled', true);

      this.redirect();
      return this.redirectText;
    }

    const setTxtField = function () {
      txtDiv.css('display', '');
      cmbDiv.css('display', 'none');
      txt.val('');
    };

    if (this.selectedOption === '2' || this.selectedOption === '-2') {
      setTxtField();
      return 'type your regex without starting and ending slash (/) e.g. acme.*corp';
    }
    if (this.selectedOption === '3') {
      setTxtField();
      return "equals what ? Don't forget to provide correct type, e.g. for number 3, for string \"3\", for boolean true/false etc..";
    }
    if (this.selectedOption === '-3') {
      setTxtField();
      return "not equals what ? Don't forget to provide correct type, e.g. for number 3, for string \"3\", for boolean true/false etc..";
    }
    if (this.selectedOption === '4' || this.selectedOption === '-4') {
      setTxtField();
      return 'can you share your array, e.g. [3,5,6,8] or for string values ["myString","myAnotherString"]';
    }
    if (this.selectedOption === '5' || this.selectedOption === '-5') {
      setTxtField();
      return `then you should be looking for a number or date to be ${this.selectedOption === '5' ? 'greater' : 'less'} or equal than, what is it? (e.g. date("2017-01-01T13:00:00Z")  or 100)`;
    }
    if (this.selectedOption === '6' || this.selectedOption === '-6') {
      setTxtField();
      return `then you should be looking for a number or date to be ${this.selectedOption === '6' ? 'greater' : 'less'} or equal than, what is it? (e.g. date("2017-01-01T13:00:00Z") or 100)`;
    }
  },

  step3() {
    const txt = $('#inputQueryWizardResponse');
    const cmb = $('#cmbQueryWizardResponses');
    const txtDiv = $('#divQueryWizardTxt');
    const cmbDiv = $('#divQueryWizardCombo');
    const sendButton = $('#btnQueryWizardRespond');
    const sendButton2 = $('#btnQueryWizardRespond2');

    if (this.selectedOption === '2' || this.selectedOption === '-2') {
      cmb.empty();
      cmb.prop('multiple', 'true');
      cmb.append($('<option></option>')
        .attr('value', 'i')
        .text('Case insensitive (i)'));
      cmb.append($('<option></option>')
        .attr('value', 'm')
        .text('Multiline (m)'));
      cmb.append($('<option></option>')
        .attr('value', 'x')
        .text('Extended (x)'));
      cmb.append($('<option></option>')
        .attr('value', 's')
        .text('Dot (s)'));
      cmb.attr('data-placeholder', ' ');
      cmb.chosen('destroy');
      cmb.chosen();

      txtDiv.css('display', 'none');
      cmbDiv.css('display', '');
      return 'Cool, you can select one or more options to use with your regex, or just leave it empty and press Send';
    }

    txt.prop('disabled', true);
    cmb.prop('disabled', true).trigger('chosen:updated');
    sendButton.prop('disabled', true);
    sendButton2.prop('disabled', true);

    this.redirect();
    return this.redirectText;
  }
};

export default new QueryWizard();
