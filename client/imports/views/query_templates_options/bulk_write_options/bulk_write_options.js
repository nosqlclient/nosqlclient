/**
 * Created by sercan on 09.12.2016.
 */
import { Template } from 'meteor/templating';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import './bulk_write_options.html';

Template.ordered.onRendered(() => {
  $('#divOrdered').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

export const getBulkWriteOptions = function () {
  const result = {};

  if ($.inArray('BYPASS_DOCUMENT_VALIDATION', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    result[Enums.BULK_WRITE_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
  }

  if ($.inArray('ORDERED', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    result[Enums.BULK_WRITE_OPTIONS.ORDERED] = $('#divOrdered').iCheck('update')[0].checked;
  }

  return result;
};
