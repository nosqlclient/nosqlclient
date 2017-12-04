import { Template } from 'meteor/templating';
import { Connection } from '/client/imports/ui';
import { Notification } from '/client/imports/modules';
import $ from 'jquery';
import './connections.html';

const setCurrentInputType = function (event, type) {
  $(event.currentTarget).parent('span').siblings('input').attr('type', type);
};

Template.sslTemplate.onRendered(() => {
  Connection.initializeSSLTemplate();
});

Template.connections.onRendered(() => {
  Connection.initializeConnectionTemplate();
});

Template.connections.helpers({
  authenticationMethod(...methods) {
    return methods.indexOf(Connection.selectedAuthType.get()) !== -1;
  },
});

Template.connections.events({
  'mousedown .showpass': function (event) {
    setCurrentInputType(event, 'text');
  },
  'mouseup .showpass': function (event) {
    setCurrentInputType(event, 'password');
  },
  'mouseout .showpass': function (event) {
    setCurrentInputType(event, 'password');
  },

  'click #btnProceedConnecting': function () {
    Connection.proceedConnecting({
      isRefresh: false,
      connection: $('#promptUsernamePasswordModal').data('connection'),
      username: $('#inputPromptedUsername').val(),
      password: $('#inputPromptedPassword').val()
    });
  },

  'change #inputUrl': function () {
    Connection.setupFormForUri();
  },

  'click #anchorConnectionSsl': function () {
    if (!$('#anchorConnectionSsl').attr('data-toggle')) Notification.warning('ssl-set-via-x509');
  },

  'change #cmbSshAuthType': function () {
    const authType = $('#cmbSshAuthType').val();
    const certificateForm = $('#formSshCertificateAuth');
    const passwordForm = $('#formSshPasswordAuth');
    if (authType === 'Certificate') {
      certificateForm.show();
      passwordForm.hide();
    } else if (authType === 'Password') {
      certificateForm.hide();
      passwordForm.show();
    } else {
      certificateForm.hide();
      passwordForm.hide();
    }
  },

  'change #cmbAuthenticationType': function () {
    const authType = $('#cmbAuthenticationType').val();
    const sslTab = $('#anchorConnectionSsl');
    Connection.selectedAuthType.set(authType);
    if (authType === 'mongodb_x509') sslTab.removeAttr('data-toggle');
    else sslTab.attr('data-toggle', 'tab');
  },

  'click .addHost': function () {
    Connection.addServerField();
  },

  'click .deleteHost': function (event) {
    if ($('.divHostField:visible').length === 1) {
      Notification.warning('host-required');
      return;
    }
    $(event.currentTarget).parents('.divHostField').remove();
  },

  'click #btnCreateNewConnection': function () {
    Connection.prepareModal('add_connection');
  },

  'click .editor_remove': function (event) {
    event.preventDefault();
    Connection.removeConnection();
  },

  'click .editor_edit': function () {
    Connection.prepareModal('edit_connection', 'edit');
  },

  'click .editor_duplicate': function () {
    Connection.prepareModal('clone_connection', 'clone');
  },

  'click #btnSaveConnection': function (event) {
    event.preventDefault();
    Connection.saveConnection();
  },
});
