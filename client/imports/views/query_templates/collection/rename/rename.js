import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { $ } from 'meteor/jquery';

import './rename.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 5.1.2016.
 */
Template.rename.onRendered(() => {
  initializeOptions();
});

Template.dropTarget.onRendered(() => {
  $('#divDropTarget').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

const initializeOptions = function () {
  const cmb = $('#cmbRenameOptions');
  $.each(Helper.sortObjectByKey(Enums.RENAME_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.rename.executeQuery = function () {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  const options = getOptions();
  const newName = $('#inputNewName').val();

  if (newName == selectedCollection) {
    toastr.warning('Can not use same name as target name');
    Ladda.stopAll();
    return;
  }

  if (newName) {
    Communicator.call({
      methodName: 'command',
      args: { selectedCollection, newName, options },
      callback: (err, result) => {
        Helper.renderAfterQueryExecution(err, result, false, 'rename');
        if (!err && !result.error) {
          renderCollectionnames(newName);
        }
      }
    });
  } else {
    toastr.error('Please enter new name !');
    Ladda.stopAll();
  }
};

const renderCollectionnames = function (newName) {
  Communicator.call({
    methodName: 'connect',
    args: { connectionId: Session.get(Helper.strSessionConnection) },
    callback: (err, result) => {
      if (err || result.error) {
        Helper.showMeteorFuncError(err, result, "Couldn't connect");
      } else {
        result.result.sort((a, b) => {
          if (a.name < b.name) { return -1; } else if (a.name > b.name) { return 1; }
          return 0;
        });

        // re-set collection names and selected collection
        Session.set(Helper.strSessionCollectionNames, result.result);
        Session.set(Helper.strSessionSelectedCollection, newName);

        // set all session values undefined except connection and collection
        Session.set(Helper.strSessionSelectedQuery, undefined);
        Session.set(Helper.strSessionSelectedOptions, undefined);
      }
    }
  });
};

const getOptions = function () {
  const result = {};
  if ($.inArray('DROP_TARGET', Session.get(Helper.strSessionSelectedOptions)) !== -1) {
    const dropTarget = $('#divDropTarget').iCheck('update')[0].checked;
    if (dropTarget) {
      result[Enums.RENAME_OPTIONS.DROP_TARGET] = dropTarget;
    }
  }

  return result;
};
