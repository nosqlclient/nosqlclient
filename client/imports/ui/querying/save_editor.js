/* global _ */
import { Notification, ExtendedJSON, SessionManager, ErrorHandler } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import { QueryRender } from '/client/imports/ui';

const Editor = function () {};

Editor.prototype = {
  getChangedObjects(findData, activeEditorValue, deletedObjectIds, updateObjects, addedObjects) {
    findData.forEach((oldObj) => {
      const currentObj = _.find(activeEditorValue, item => _.isEqual(item._id, oldObj._id));

      if (!currentObj) deletedObjectIds.push(oldObj._id);
      else if (!_.isEqual(oldObj, currentObj)) {
        updateObjects.push(currentObj);
      }
    });

    activeEditorValue.forEach((currentObj) => {
      const foundObj = _.find(findData, oldObj => _.isEqual(currentObj._id, oldObj._id));
      if (!foundObj) addedObjects.push(currentObj);
    });
  },

  checkAllElementsAreObject(...arr) {
    let result = true;

    arr.forEach((ar) => {
      ar.forEach((obj) => {
        if (obj === null || typeof obj !== 'object') result = false;
      });
    });

    return result;
  },

  saveFindEditor() {
    const activeTab = $('#resultTabs').find('li.active').find('a').attr('href');
    const findData = $(activeTab).data('findData');
    if (!findData) {
      Notification.error('no-result-found-to-save');
      return;
    }
    const deletedObjectIds = [];
    const updateObjects = [];
    const addedObjects = [];

    const activeEditorValue = ExtendedJSON.convertAndCheckJSON(QueryRender.getActiveEditorValue());
    if (activeEditorValue.ERROR) {
      Notification.error('syntax-error-result', null, { error: activeEditorValue.ERROR });
      return;
    }

    this.getChangedObjects(findData, activeEditorValue, deletedObjectIds, updateObjects, addedObjects);
    if (deletedObjectIds.length === 0 && updateObjects.length === 0 && addedObjects.length === 0) {
      Notification.warning('objects-identical');
      return;
    }

    if (!this.checkAllElementsAreObject(updateObjects, addedObjects)) {
      Notification.warning('documents-should-be-objects');
      return;
    }

    const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);

    Notification.modal({
      title: 'are-you-sure',
      text: 'save-editor-info',
      textTranslateOptions: { deleted: deletedObjectIds.length, updated: updateObjects.length, inserted: addedObjects.length, selectedCollection },
      type: 'info',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnSaveFind');
          Communicator.call({
            methodName: 'saveFindResult',
            args: { selectedCollection, updateObjects, deletedObjectIds, addedObjects },
            callback: (err, res) => {
              if (err || (res && res.error)) ErrorHandler.showMeteorFuncError(err, res);
              else {
                Notification.success('saved-successfully');
                $(activeTab).data('findData', activeEditorValue);
              }
            }
          });
        }
      }
    });
  },

  saveEditor() {
    const doc = ExtendedJSON.convertAndCheckJSON(QueryRender.getActiveEditorValue());
    if (doc.ERROR) {
      Notification.error('syntax-error-editor', null, { error: doc.ERROR });
      return;
    }

    Notification.modal({
      title: 'are-you-sure',
      text: 'save-single-doc-editor-info',
      type: 'info',
      showCancelButton: true,
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnSaveFindOne');

          const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
          if (doc._id) {
            Communicator.call({
              methodName: 'updateOne',
              args: { selectedCollection, selector: { _id: doc._id }, setObject: doc },
              callback: (err, result) => {
                if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
                else Notification.success('saved-successfully');
              }
            });
          } else Notification.error('_id-required');
        }
      }
    });
  },

  deleteDocument() {
    const doc = ExtendedJSON.convertAndCheckJSON(QueryRender.getActiveEditorValue());
    if (doc.ERROR) {
      Notification.error('syntax-error-editor', null, { error: doc.ERROR });
      return;
    }

    Notification.modal({
      title: 'are-you-sure',
      text: 'delete-single-doc-editor-info',
      type: 'info',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnDelFindOne');

          const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
          if (doc._id) {
            Communicator.call({
              methodName: 'delete',
              args: { selectedCollection, selector: { _id: doc._id } },
              callback: (err, result) => {
                if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
                else {
                  Notification.success('deleted-successfully');
                  const tabToRemove = $('#resultTabs').find('li.active');
                  tabToRemove.remove();
                  $(tabToRemove.find('a').attr('href')).remove();

                  $('#divBrowseCollectionFooter').hide();
                }
              }
            });
          } else Notification.error('_id-required');
        }
      }
    });
  }
};

export default new Editor();
