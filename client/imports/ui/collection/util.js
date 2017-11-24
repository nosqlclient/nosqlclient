import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { SessionManager, ErrorHandler, Notification, Enums, Querying } from '/client/imports/modules';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { CollectionAdd, CollectionValidationRules, CollectionRename, CollectionFilter, CollectionConversion, Connection } from '/client/imports/ui';
import $ from 'jquery';

const CollectionUtil = function () {

};

CollectionUtil.prototype = {
  dropDatabase() {
    Notification.modal({
      title: 'Are you sure?',
      text: 'You will not be able to recover this database!',
      type: 'warning',
      showCancelButton: true,
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'dropDB',
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't drop database");
              else {
                SessionManager.clear();
                Notification.success('Successfuly dropped database');
              }
            }
          });
        }
      }
    });
  },

  renderCollectionNames() {
    Communicator.call({
      methodName: 'connect',
      args: { connectionId: SessionManager.get(SessionManager.strSessionConnection)._id },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't connect");
        else {
          result.result.sort((a, b) => {
            if (a.name < b.name) { return -1; } else if (a.name > b.name) { return 1; }
            return 0;
          });

          // re-set collection names
          SessionManager.set(SessionManager.strSessionCollectionNames, result.result);
          // set all session values undefined except connection
          SessionManager.set(SessionManager.strSessionSelectedQuery, undefined);
          SessionManager.set(SessionManager.strSessionSelectedOptions, undefined);
          SessionManager.set(SessionManager.strSessionSelectedCollection, undefined);
          FlowRouter.go('/databaseStats');
        }
      }
    });
  },

  dropAllCollections() {
    Notification.modal({
      title: 'Are you sure?',
      text: 'All collections except system, will be dropped, are you sure ?',
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'dropAllCollections',
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't drop all collections");
              else {
                this.renderCollectionNames();
                Notification.success('Successfully dropped all collections/views except system');
              }
            }
          });
        }
      }
    });
  },

  dropCollection(selectedCollection) {
    Notification.modal({
      title: 'Are you sure?',
      text: `${selectedCollection} collection will be dropped, are you sure ?`,
      type: 'warning',
      confirmButtonText: 'Yes, drop it!',
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'delete',
            args: { selectedCollection },
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't drop collection");
              else {
                this.renderCollectionNames();
                Notification.success(`Successfuly dropped collection: ${selectedCollection}`);
              }
            }
          });
        }
      }
    });
  },

  cloneCollection(selectedCollection) {
    Notification.modal({
      title: 'Collection Name',
      text: 'Please type collection name',
      type: 'input',
      closeOnConfirm: false,
      confirmButtonColor: '#DD6B55',
      inputPlaceholder: 'Collection Name',
      inputValue: selectedCollection,
      callback: (inputValue) => {
        if (!inputValue) {
          Notification.showModalInputError('You need to write something!');
          return false;
        }

        Notification.modal({ title: 'Creating...', message: `Please wait while ${inputValue} is being created, collections will be refreshed automatically !`, type: 'info' });

        Communicator.call({
          methodName: 'aggregate',
          args: { selectedCollection, pipeline: [{ $match: {} }, { $out: inputValue }] },
          callback: (err, result) => {
            if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't clone ");
            else {
              Connection.connect(true, `Successfully cloned collection ${selectedCollection} as ${inputValue}`);
              Notification.closeModal();
            }
          }
        });
      }
    });
  },

  showMongoBinaryInfo() {
    if (!localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.MONGO_BINARY_INFO)) {
      Notification.modal({
        title: 'Mongo Tools',
        text: 'Nosqlclient uses mongo binaries and tools for dump/restore, schema analyzer, and shell you can set the directory of binaries from <b>Settings</b>',
        type: 'info',
        confirmButtonText: "Cool, don't show again!",
        callback: (isConfirm) => {
          if (isConfirm) localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.MONGO_BINARY_INFO, 'true');
        }
      });
    }
  },

  clearCollection(selectedCollection) {
    const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
    Notification.modal({
      title: 'Are you sure?',
      text: `${collectionName} collection's all data will be wiped, are you sure ?`,
      type: 'warning',
      confirmButtonText: 'Yes, clear it!',
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'delete',
            args: { selectedCollection },
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't clear collection");
              else Notification.success(`Successfuly cleared collection: ${selectedCollection}`);
            }
          });
        }
      }
    });
  },

  handleNavigationAndSessions() {
    $('#listCollectionNames').find('li').each((index, li) => {
      $(li).removeClass('active');
    });

    $('#listSystemCollections').find('li').each((index, li) => {
      $(li).removeClass('active');
    });

    SessionManager.set(SessionManager.strSessionSelectedCollection, null);
    SessionManager.set(SessionManager.strSessionSelectedQuery, null);
    SessionManager.set(SessionManager.strSessionSelectedOptions, null);

    $('#cmbQueries').val('').trigger('chosen:updated');
    $('#cmbAdminQueries').val('').trigger('chosen:updated');
  },

  prepareContextMenuItems(addCollectionModal, convertToCappedModal, renameModal, validationRulesModal, filterModal) {
    return {
      manage_collection: {
        name: 'Manage',
        icon: 'fa-pencil',
        items: {
          view_collection: {
            name: 'Show Collection/View',
            icon: 'fa-book',
            callback() {
              if ($(this) && $(this).context && $(this).context.innerText) {
                const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                addCollectionModal.data('is-view', collectionName);
                addCollectionModal.modal({
                  backdrop: 'static',
                  keyboard: false,
                });
              }
            },
          },

          convert_to_capped: {
            icon: 'fa-level-down',
            name: 'Convert to Capped',
            callback() {
              const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
              convertToCappedModal.data('collection', collectionName);
              convertToCappedModal.modal('show');
            },
          },

          rename_collection: {
            icon: 'fa-pencil-square-o',
            name: 'Rename',
            callback() {
              const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
              renameModal.data('collection', collectionName);
              renameModal.modal('show');
            },
          },

          clone_collection: {
            icon: 'fa-clone',
            name: 'Clone',
            callback() {
              const selectedCollection = $(this).context.innerText.substring(1).split(' ')[0];
              CollectionUtil.cloneCollection(selectedCollection);
            }
          },

          validation_rules: {
            icon: 'fa-check-circle',
            name: 'Edit Validation Rules',
            callback() {
              const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
              validationRulesModal.data('collection', collectionName);
              validationRulesModal.modal('show');
            },
          },

          clear_collection: {
            name: 'Clear Collection',
            icon: 'fa-remove',
            callback() {
              if ($(this) && $(this).context && $(this).context.innerText) {
                const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                CollectionUtil.clearCollection(collectionName);
              } else Notification.warning('No collection selected !');
            }
          }
        }
      },

      add_collection: {
        name: 'Add Collection/View',
        icon: 'fa-plus',
        callback() {
          addCollectionModal.data('is-view', '');
          addCollectionModal.modal({
            backdrop: 'static',
            keyboard: false,
          });
        },
      },
      filter_collections: {
        name: 'Filter Collections',
        icon: 'fa-filter',
        callback() {
          filterModal.modal('show');
        },
      },
      clear_filter: {
        name: 'Clear Filter',
        icon: 'fa-minus-circle',
        callback() {
          CollectionFilter.excludedCollectionsByFilter.set([]);
          CollectionFilter.filterRegex.set('');
        },
      },
      refresh_collections: {
        name: 'Refresh Collections',
        icon: 'fa-refresh',
        callback() {
          Connection.connect(true);
        },
      },
      drop_collection: {
        name: 'Drop Collection',
        icon: 'fa-trash',
        callback() {
          if ($(this) && $(this).context && $(this).context.innerText) {
            const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
            CollectionUtil.dropCollection(collectionName);
          } else Notification.warning('No collection selected !');
        },
      },
      drop_collections: {
        name: 'Drop All Collections',
        icon: 'fa-ban',
        callback() {
          CollectionUtil.dropAllCollections();
        },
      },
    };
  },

  getCollectionInformation() {
    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);

    Meteor.setTimeout(() => {
      const btnExecuteQuery = document.querySelector('#btnExecuteQuery');
      if (!settings || !btnExecuteQuery) return;

      Notification.start('#btnExecuteQuery');
      const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);

      // get distinct field keys for auto complete on every collection change.
      Querying.getDistinctKeysForAutoComplete(selectedCollection);

      Communicator.call({
        methodName: 'stats',
        args: { selectedCollection },
        callback: (err, result) => {
          if (err || result.error) {
            $('#divCollectionInfo').html(`<div class="row"><div class="col-lg-7"><b>Couldn't fetch stats:</b></div><div class="col-lg-5">${ErrorHandler.getErrorMessage(err, result)}</div></div>`);
          } else this.populateCollectionInfo(result.result, settings);
          Notification.stop();
        }
      });
    }, 150);
  },

  populateCollectionInfo(statsResult, settings) {
    let scale = 1;
    let text = 'Bytes';

    switch (settings.scale) {
      case 'MegaBytes':
        scale = 1024 * 1024;
        text = 'MB';
        break;
      case 'KiloBytes':
        scale = 1024;
        text = 'KB';
        break;
      default:
        scale = 1;
        text = 'Bytes';
        break;
    }
    // we are manually doing the scale to prevent showing 0 MB for sizes 0.7, 0.8, 0.9 etc. MBs as mongodb does.
    let resultString = `<div class="row"><div class="col-lg-7"><b>Count:</b></div><div class="col-lg-5">${statsResult.count}</div></div>`;
    resultString += `<div class="row"><div class="col-lg-7"><b>Index Count:</b></div><div class="col-lg-5">${statsResult.nindexes}</div></div>`;

    const size = Number.isNaN(Number(statsResult.size / scale)) ? '0.00' : Number(statsResult.size / scale).toFixed(2);
    resultString += `<div class="row"><div class="col-lg-7"><b>Size:</b></div><div class="col-lg-5">${size} ${text}</div></div>`;

    const totalIndexSize = Number.isNaN(Number(statsResult.totalIndexSize / scale)) ? '0.00' : Number(statsResult.totalIndexSize / scale).toFixed(2);
    resultString += `<div class="row"><div class="col-lg-7"><b>Total Index Size:</b></div><div class="col-lg-5">${totalIndexSize} ${text}</div></div>`;

    const avgObjSize = Number.isNaN(Number(statsResult.avgObjSize / scale)) ? '0.00' : Number(statsResult.avgObjSize / scale).toFixed(2);
    resultString += `<div class="row"><div class="col-lg-7"><b>Average Object Size:</b></div><div class="col-lg-5">${avgObjSize} ${text}</div></div>`;
    resultString += `<div class="row"><div class="col-lg-7"><b>Is Capped:</b></div><div class="col-lg-5">${statsResult.capped}</div></div>`;

    $('#divCollectionInfo').html(resultString);
  },

  prepareContextMenuModals() {
    const filterModal = $('#collectionFilterModal');
    filterModal.on('shown.bs.modal', () => {
      CollectionUtil.initializeFilterTable();
    });

    const addCollectionModal = $('#collectionAddModal');
    addCollectionModal.on('shown.bs.modal', () => {
      CollectionAdd.resetForm();
      if (addCollectionModal.data('is-view')) CollectionAdd.initializeForm(addCollectionModal.data('is-view'));
    });

    const convertToCappedModal = $('#convertToCappedModal');
    convertToCappedModal.on('shown.bs.modal', () => {
      CollectionConversion.resetForm();
    });

    const renameModal = $('#renameCollectionModal');
    renameModal.on('shown.bs.modal', () => {
      CollectionRename.resetForm();
    });

    const validationRulesModal = $('#validationRulesModal');
    validationRulesModal.on('shown.bs.modal', () => {
      CollectionValidationRules.resetForm();
    });

    return { filterModal, addCollectionModal, convertToCappedModal, renameModal, validationRulesModal };
  }
};

export default new CollectionUtil();
