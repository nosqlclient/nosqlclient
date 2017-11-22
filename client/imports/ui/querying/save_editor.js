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

  checkAllElementsAreObject(arr, arr2) {
    let result = true;
    arr.forEach((obj) => {
      if (obj === null || typeof obj !== 'object') result = false;
    });

    arr2.forEach((obj) => {
      if (obj === null || typeof obj !== 'object') result = false;
    });

    return result;
  },

  saveFindEditor() {
    const activeTab = $('#resultTabs').find('li.active').find('a').attr('href');
    const findData = $(activeTab).data('findData');
    if (!findData) {
      Notification.error('Could not find query execution result, can not save !');
      return;
    }
    const deletedObjectIds = [];
    const updateObjects = [];
    const addedObjects = [];

    const activeEditorValue = ExtendedJSON.convertAndCheckJSON(QueryRender.getActiveEditorValue());
    if (activeEditorValue.ERROR) {
      Notification.error(`Syntax error, can not save document: ${activeEditorValue.ERROR}`);
      return;
    }

    this.getChangedObjects(findData, activeEditorValue, deletedObjectIds, updateObjects, addedObjects);
    if (deletedObjectIds.length === 0 && updateObjects.length === 0 && addedObjects.length === 0) {
      Notification.warning('Nothing to save, all objects are identical with old result');
      return;
    }

    if (!this.checkAllElementsAreObject(updateObjects, addedObjects)) {
      Notification.warning('All documents should be object, can not save !');
      return;
    }

    Notification.modal({
      title: 'Are you sure ?',
      text: `${deletedObjectIds.length} documents will be deleted, ${updateObjects.length} documents will be updated and 
            ${addedObjects.length} documents will be inserted into <b>${SessionManager.get(SessionManager.strSessionSelectedCollection)}</b>, are you sure ?`,
      type: 'info',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnSaveFind');

          const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);

          Communicator.call({
            methodName: 'saveFindResult',
            args: { selectedCollection, updateObjects, deletedObjectIds, addedObjects },
            callback: (err) => {
              if (err) ErrorHandler.showMeteorFuncError(err, null, "Couldn't proceed saving find result");
              else {
                Notification.success('Successfully saved !');
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
      Notification.error(`Syntax error, can not save document: ${doc.ERROR}`);
      return;
    }

    Notification.modal({
      title: 'Are you sure ?',
      text: 'Document will be updated using _id field of result view, are you sure ?',
      type: 'info',
      showCancelButton: true,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnSaveFindOne');

          const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
          if (doc._id) {
            Communicator.call({
              methodName: 'updateOne',
              args: { selectedCollection, selector: { _id: doc._id }, setObject: doc },
              callback: (err, result) => {
                if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't update document");
                else Notification.success('Successfully updated document');
              }
            });
          } else Notification.error('Could not find _id of document, save failed !');
        }
      }
    });
  },

  deleteDocument() {
    const doc = ExtendedJSON.convertAndCheckJSON(QueryRender.getActiveEditorValue());
    if (doc.ERROR) {
      Notification.error(`Syntax error, can not delete document: ${doc.ERROR}`);
      return;
    }

    Notification.modal({
      title: 'Are you sure ?',
      text: 'Document will be deleted using _id field of result view,  are you sure ?',
      type: 'info',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnDelFindOne');

          const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
          if (doc._id) {
            Communicator.call({
              methodName: 'delete',
              args: { selectedCollection, selector: { _id: doc._id } },
              callback: (err, result) => {
                if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't delete document");
                else {
                  Notification.success('Successfully deleted document');
                  const tabToRemove = $('#resultTabs').find('li.active');
                  tabToRemove.remove();
                  $(tabToRemove.find('a').attr('href')).remove();

                  $('#divBrowseCollectionFooter').hide();
                }
              }
            });
          } else Notification.error('Could not find _id of document, delete failed !');
        }
      }
    });
  }
};

export default new Editor();
