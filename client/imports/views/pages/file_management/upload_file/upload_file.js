import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';
import { initFilesInformation } from '../file_management';
import './upload_file.html';

const toastr = require('toastr');
const Ladda = require('ladda');
require('bootstrap-filestyle');
/**
 * Created by RSercan on 13.2.2016.
 */
/* global swal */

Template.uploadFile.onRendered(() => {
  if (Session.get(Helper.strSessionCollectionNames) == undefined) {
    FlowRouter.go('/databaseStats');
  }

  // $(":file").filestyle({icon: false, buttonBefore: true});
});

Template.uploadFile.events({
  'click #btnUpload': function (e) {
    e.preventDefault();
    const blob = $('#inputFile')[0].files[0];
    if (blob) {
      swal({
        title: 'Are you sure ?',
        text: 'Are you sure to continue uploading file ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No',
      }, (isConfirm) => {
        if (isConfirm) {
          const modal = $('#fileInfoModal');
          modal.on('shown.bs.modal', () => {
            Helper.initializeCodeMirror($('#divMetadata'), 'txtMetadata');
          });
          modal.modal('show');
        }
      });
    }
  },
});

export const proceedUploading = function (blob, contentType, metaData, aliases) {
  Ladda.create(document.querySelector('#btnUpload')).start();
  const fileReader = new FileReader();
  fileReader.onload = function (file) {
    Meteor.call('uploadFile', $('#txtBucketName').val(), new Uint8Array(file.target.result), blob.name, contentType, metaData, aliases, Meteor.default_connection._lastSessionId, (err, result) => {
      if (err || result.error) {
        Helper.showMeteorFuncError(err, result, "Couldn't upload file");
      } else {
        toastr.success('Successfuly uploaded file');
        initFilesInformation();
      }

      Ladda.stopAll();
    });
  };
  fileReader.readAsArrayBuffer(blob);
};
