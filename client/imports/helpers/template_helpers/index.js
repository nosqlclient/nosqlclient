import { Template } from 'meteor/templating';
import { ReactivityProvider } from '/client/imports/facades';
import { SessionManager } from '/client/imports/modules';
import { $ } from 'meteor/jquery';

Template.registerHelper('getConfiguredAutoCompletionKey', () => ReactivityProvider.findOne(ReactivityProvider.types.Settings).autoCompleteShortcut || 'Ctrl-Space');

Template.registerHelper('isOptionSelected', (option, sessionVar) => {
  if (!sessionVar || Object.prototype.toString.call(sessionVar) !== '[object String]') return $.inArray(option, SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1;

  return $.inArray(option, SessionManager.get(sessionVar)) !== -1;
});

Template.registerHelper('getConnection', () => {
  if (SessionManager.get(SessionManager.strSessionConnection)) {
    return ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection) });
  }
});

Template.registerHelper('getSelectedCollection', () => SessionManager.get(SessionManager.strSessionSelectedCollection));

Template.registerHelper('isConnected', () => (!!SessionManager.get(SessionManager.strSessionCollectionNames)));
