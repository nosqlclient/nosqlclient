import { $ } from 'meteor/jquery';
import './mongodump_options.html';
import Helper from '/client/imports/helper';

const toastr = require('toastr');

export const getMongodumpArgs = function () {
  const result = [];

  const args = $('#cmbMongodumpArgs').val();
  if (!args) return result;
  for (const arg of args) {
    const argElement = $(`#mongodump${arg}`);
    result.push(arg);

    if (arg === '--query') {
      let query = Helper.getCodeMirrorValue($('#mongodump--query'));
      query = Helper.convertAndCheckJSON(query);
      if (query.ERROR) {
        toastr.error(`Syntax error on query: ${query.ERROR}`);
        return null;
      }
      result.push(JSON.stringify(query));
    } else if (argElement.length !== 0) result.push(argElement.val());
  }

  return result;
};
