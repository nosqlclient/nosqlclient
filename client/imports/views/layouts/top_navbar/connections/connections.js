import { Template } from 'meteor/templating';
import { Connection } from '/client/imports/ui';
import { Notification, SessionManager } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import $ from 'jquery';
import './connections.html';

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
    $(event.currentTarget).parent('span').siblings('input').attr('type', 'text');
  },
  'mouseup .showpass': function (event) {
    $(event.currentTarget).parent('span').siblings('input').attr('type', 'password');
  },
  'mouseout .showpass': function (event) {
    $(event.currentTarget).parent('span').siblings('input').attr('type', 'password');
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
    $('#addEditConnectionModalTitle').text(Helper.translate({ key: 'add_connection' }));
    const modal = $('#addEditConnectionModal');
    modal.data('edit', null);
    modal.data('clone', null);
    modal.modal('show');
  },

  'click .editor_remove': function (event) {
    event.preventDefault();
    Connection.removeConnection();
  },

  'click .editor_edit': function () {
    $('#addEditConnectionModalTitle').text(Helper.translate({ key: 'edit_connection' }));
    const modal = $('#addEditConnectionModal');
    modal.data('edit', SessionManager.get(SessionManager.strSessionConnection)._id);
    modal.data('clone', '');
    modal.modal('show');
  },

  'click .editor_duplicate': function () {
    $('#addEditConnectionModalTitle').text(Helper.translate({ key: 'clone_connection' }));
    const modal = $('#addEditConnectionModal');
    modal.data('clone', SessionManager.get(SessionManager.strSessionConnection)._id);
    modal.data('edit', '');
    modal.modal('show');
  },

  'click #btnSaveConnection': function (event) {
    event.preventDefault();
    Connection.saveConnection();
  },
});
