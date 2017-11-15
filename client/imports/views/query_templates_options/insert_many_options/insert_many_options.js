/**
 * Created by sercan on 09.12.2016.
 */
import { Template } from 'meteor/templating';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import './insert_many_options.html';

Template.serializeFunctions.onRendered(() => {
  $('#divSerializeFunctions').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

export const getOptions = function () {
  const result = {};

  if ($.inArray('BYPASS_DOCUMENT_VALIDATION', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    result[Enums.INSERT_MANY_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
  }

  if ($.inArray('SERIALIZE_FUNCTIONS', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    result[Enums.INSERT_MANY_OPTIONS.SERIALIZE_FUNCTIONS] = $('#divSerializeFunctions').iCheck('update')[0].checked;
  }

  return result;
};
