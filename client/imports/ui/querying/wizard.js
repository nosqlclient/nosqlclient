import { UIComponents, ExtendedJSON } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

const QueryWizard = function () {
  this.step = 1;
  this.selectedOption = null;
  this.fieldName = null;
  this.txtValue = null;
  this.regexOptions = null;
  this.redirectText = "I'm redirecting you with your query, just press Execute";
};

const addNosqlclientChatStep = function (chatDiv, stepText) {
  chatDiv.append($('<div class="left"><div class="author-name">Nosqlclient </div> <div class="chat-message active"></div></div>'));
  chatDiv.find('.left').last().find('.chat-message').html(stepText);
};

const createRegexOption = function (value, text) {
  return $('<option></option>').attr('value', value).text(text);
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
    chatDiv.append($(`<div class="left"> <div class="author-name"> Nosqlclient </div> <div class="chat-message active">${Helper.translate({ key: 'wizard_start' })}</div></div> ` +
      '<div class="right"> <div class="author-name"> Me</div> <div class="chat-message"> Hmm...</div> </div>'));

    this.step = 1; this.selectedOption = null; this.fieldName = null; this.txtValue = null; this.regexOptions = null;

    txtDiv.css('display', '');
    txt.val('');

    cmbDiv.css('display', 'none');
    cmb.prop('multiple', false);
    cmb.attr('data-placeholder', Helper.translate({ key: 'wizard_start_user' }));
    cmb.empty();
    cmb.append($(`<option></option> 
      <optgroup id="optGroupPositives" label="Positives">
      <option value="1">${Helper.translate({ key: 'wizard_option_1' })}</option> 
      <option value="2">${Helper.translate({ key: 'wizard_option_2' })}</option> 
      <option value="3">${Helper.translate({ key: 'wizard_option_3' })}</option> 
      <option value="4">${Helper.translate({ key: 'wizard_option_4' })}</option>  
      <option value="5">${Helper.translate({ key: 'wizard_option_5' })}</option>  
      <option value="6">${Helper.translate({ key: 'wizard_option_6' })}</option> 
      </optgroup> 
      <optgroup id="optGroupNegatives" label="Negatives"> 
      <option value="-1">${Helper.translate({ key: 'wizard_option_minus_1' })}</option> 
      <option value="-2">${Helper.translate({ key: 'wizard_option_minus_2' })}</option> 
      <option value="-3">${Helper.translate({ key: 'wizard_option_minus_3' })}</option> 
      <option value="-4">${Helper.translate({ key: 'wizard_option_minus_4' })}</option> 
      <option value="-5">${Helper.translate({ key: 'wizard_option_minus_5' })}</option> 
      <option value="-6">${Helper.translate({ key: 'wizard_option_minus_6' })}</option> 
      </optgroup>`));
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
    setTimeout(() => {
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
        chatDiv.find('.left').last().find('.chat-message').html(Helper.translate({ key: 'wizard_step_1' }));
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
        addNosqlclientChatStep(chatDiv, stepText);

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
            chatDiv.find('.left').last().find('.chat-message').html(Helper.translate({ key: 'wizard_step_3_array_error' }));
            break;
          }
        }

        const stepText = this.step3();
        chatDiv.append($(`<div class="right"><div class="author-name">Me </div> <div class="chat-message">${txt.val()}</div></div>`));
        addNosqlclientChatStep(chatDiv, stepText);

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
      return Helper.translate({ key: 'wizard_step_2_option_2' });
    }
    if (this.selectedOption === '3') {
      setTxtField();
      return Helper.translate({ key: 'wizard_step_2_option_3' });
    }
    if (this.selectedOption === '-3') {
      setTxtField();
      return Helper.translate({ key: 'wizard_step_2_option_minus_3' });
    }
    if (this.selectedOption === '4' || this.selectedOption === '-4') {
      setTxtField();
      return Helper.translate({ key: 'wizard_step_2_option_4' });
    }
    if (this.selectedOption === '5' || this.selectedOption === '-5') {
      setTxtField();
      return Helper.translate({ key: 'wizard_step_2_option_5_6' });
    }
    if (this.selectedOption === '6' || this.selectedOption === '-6') {
      setTxtField();
      return Helper.translate({ key: 'wizard_step_2_option_5_6' });
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
      cmb.append(createRegexOption('i', 'Case insensitive (i)'));
      cmb.append(createRegexOption('x', 'Extended (x)'));
      cmb.append(createRegexOption('m', 'Multiline (m)'));
      cmb.append(createRegexOption('s', 'Dot (s)'));
      cmb.attr('data-placeholder', ' ');
      cmb.chosen('destroy');
      cmb.chosen();

      txtDiv.css('display', 'none');
      cmbDiv.css('display', '');
      return Helper.translate({ key: 'wizard_step_2_option_2_final' });
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
