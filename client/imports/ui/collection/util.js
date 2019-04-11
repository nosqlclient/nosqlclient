import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { SessionManager, ErrorHandler, Notification, Enums, Querying } from '/client/imports/modules';
import { CollectionAdd, CollectionValidationRules, CollectionRename, CollectionFilter, CollectionConversion, Connection, ViewPipelineUpdater } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import $ from 'jquery';

const CollectionUtil = function () {
};

const specifyActiveClass = function (selector, name) {
  selector.find('li').each((index, li) => {
    const liObject = $(li);
    if (liObject[0].textContent.trim() === name) liObject.addClass('active');
    else liObject.removeClass('active');
  });
};

const getCollectionNameFromContextMenu = function (clickedItem) {
  if (clickedItem && clickedItem.context && clickedItem.context.innerText) return clickedItem.context.innerText.trim().split(' ')[0];
};

const deactivateListItems = function (selector) {
  selector.find('li').each((index, li) => {
    $(li).removeClass('active');
  });
};

CollectionUtil.prototype = {
  setSessionForNavigation(name) {
    specifyActiveClass($('#listCollectionNames'), name);
    specifyActiveClass($('#listSystemCollections'), name);

    SessionManager.set(SessionManager.strSessionSelectedCollection, name);
  },

  dropDatabase() {
    Notification.modal({
      title: 'are-you-sure',
      text: 'recover-not-possible',
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'dropDB',
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
              else {
                SessionManager.clear();
                Notification.success('database-dropped-successfully');
              }
            }
          });
        }
      }
    });
  },

  dropAllCollections() {
    Notification.modal({
      title: 'are-you-sure',
      text: 'all-collections-will-be-dropped',
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'dropAllCollections',
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
              else {
                Connection.connect(false);
                Notification.success('dropped-all-collections-successfully');
              }
            }
          });
        }
      }
    });
  },

  dropCollection(selectedCollection) {
    if (!selectedCollection) return;

    Notification.modal({
      title: 'are-you-sure',
      text: 'collection-will-be-dropped',
      textTranslateOptions: { selectedCollection },
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'dropCollection',
            args: { selectedCollection },
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
              else {
                Connection.connect(false);
                Notification.success('collection-dropped-successfully', null, { selectedCollection });
              }
            }
          });
        }
      }
    });
  },

  cloneCollection(selectedCollection) {
    if (!selectedCollection) return;

    Notification.modal({
      title: 'collection_name',
      text: 'collection_name',
      type: 'input',
      closeOnConfirm: false,
      inputPlaceholder: 'collection_name',
      inputValue: selectedCollection,
      callback: (inputValue) => {
        if (!inputValue) {
          Notification.showModalInputError('name-required');
          return false;
        }

        Notification.modal({ title: 'creating', text: 'please-wait', type: 'info' });

        Communicator.call({
          methodName: 'aggregate',
          args: { selectedCollection, pipeline: [{ $match: {} }, { $out: inputValue }] },
          callback: (err, result) => {
            if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
            else {
              Connection.connect(true, 'collection-cloned-successfully', { selectedCollection, name: inputValue });
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
        title: 'mongo-tools',
        text: 'mongo-tools-info',
        type: 'info',
        confirmButtonText: 'dont_show_again',
        callback: (isConfirm) => {
          if (isConfirm) localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.MONGO_BINARY_INFO, 'true');
        }
      });
    }
  },

  clearCollection(selectedCollection) {
    Notification.modal({
      title: 'are-you-sure',
      text: 'collection-will-be-wiped',
      textTranslateOptions: { selectedCollection },
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Communicator.call({
            methodName: 'delete',
            args: { selectedCollection },
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
              else Notification.success('collection-cleared-successfully', null, { selectedCollection });
            }
          });
        }
      }
    });
  },

  handleNavigationAndSessions() {
    deactivateListItems($('#listCollectionNames'));
    deactivateListItems($('#listSystemCollections'));

    SessionManager.set(SessionManager.strSessionSelectedCollection, null);
    SessionManager.set(SessionManager.strSessionSelectedQuery, null);
    SessionManager.set(SessionManager.strSessionSelectedOptions, null);

    $('#cmbQueries').val('').trigger('chosen:updated');
    $('#cmbAdminQueries').val('').trigger('chosen:updated');
  },

  prepareContextMenuItems({ addCollectionModal, convertToCappedModal, renameModal, validationRulesModal, filterModal, updateViewPipeline }) {
    const self = this;
    return {
      manage_collection: {
        name: Helper.translate({ key: 'manage' }),
        icon: 'fa-pencil',
        items: {
          view_collection: {
            name: Helper.translate({ key: 'show_coll_view_info' }),
            icon: 'fa-book',
            callback() {
              const collectionName = getCollectionNameFromContextMenu($(this));
              if (collectionName) {
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
            name: Helper.translate({ key: 'convert_to_capped' }),
            callback() {
              const collectionName = getCollectionNameFromContextMenu($(this));
              convertToCappedModal.data('collection', collectionName);
              convertToCappedModal.modal('show');
            },
          },

          rename_collection: {
            icon: 'fa-pencil-square-o',
            name: Helper.translate({ key: 'rename' }),
            callback() {
              const collectionName = getCollectionNameFromContextMenu($(this));
              renameModal.data('collection', collectionName);
              renameModal.modal('show');
            },
          },

          clone_collection: {
            icon: 'fa-clone',
            name: Helper.translate({ key: 'clone' }),
            callback() {
              const collectionName = getCollectionNameFromContextMenu($(this));
              self.cloneCollection(collectionName);
            }
          },

          validation_rules: {
            icon: 'fa-check-circle',
            name: Helper.translate({ key: 'edit_validation_rules' }),
            callback() {
              const collectionName = getCollectionNameFromContextMenu($(this));
              validationRulesModal.data('collection', collectionName);
              validationRulesModal.modal('show');
            },
          },

          clear_collection: {
            name: Helper.translate({ key: 'clear_collection' }),
            icon: 'fa-remove',
            callback() {
              const collectionName = getCollectionNameFromContextMenu($(this));
              if (collectionName) self.clearCollection(collectionName);
              else Notification.warning('select_collection');
            }
          }
        }
      },
      update_view_pipeline: {
        name: Helper.translate({ key: 'update_view_pipeline' }),
        icon: 'fa-angle-double-up',
        callback() {
          const collectionName = getCollectionNameFromContextMenu($(this));
          if (collectionName) {
            updateViewPipeline.data('viewName', collectionName);
            updateViewPipeline.modal('show');
          }
        },
      },
      add_collection: {
        name: Helper.translate({ key: 'add_coll_view' }),
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
        name: Helper.translate({ key: 'filter' }),
        icon: 'fa-filter',
        callback() {
          filterModal.modal('show');
        },
      },
      clear_filter: {
        name: Helper.translate({ key: 'clear_filter' }),
        icon: 'fa-minus-circle',
        callback() {
          CollectionFilter.excludedCollectionsByFilter.set([]);
          CollectionFilter.filterRegex.set('');
        },
      },
      refresh_collections: {
        name: Helper.translate({ key: 'refresh_collections' }),
        icon: 'fa-refresh',
        callback() {
          Connection.connect(true);
        },
      },
      drop_collection: {
        name: Helper.translate({ key: 'drop_collection' }),
        icon: 'fa-trash',
        callback() {
          const collectionName = getCollectionNameFromContextMenu($(this));
          if (collectionName) self.dropCollection(collectionName);
          else Notification.warning('select_collection');
        },
      },
      drop_collections: {
        name: Helper.translate({ key: 'drop_all_collections' }),
        icon: 'fa-ban',
        callback() {
          self.dropAllCollections();
        },
      },
    };
  },

  getCollectionInformation() {
    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);

    setTimeout(() => {
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
            const errorMessage = Helper.translate({ key: 'fetch_stats_error' });
            $('#divCollectionInfo').html(`<div class="row"><div class="col-lg-7"><b>${errorMessage}</b></div><div class="col-lg-5">${ErrorHandler.getErrorMessage(err, result)}</div></div>`);
          } else this.populateCollectionInfo(result.result, settings);
          Notification.stop();
        }
      });
    }, 150);
  },

  populateCollectionInfo(statsResult, settings) {
    const { scale, text } = Helper.getScaleAndText(settings.scale);

    // we are manually doing the scale to prevent showing 0 MB for sizes 0.7, 0.8, 0.9 etc. MBs as mongodb does.
    let resultString = `<div class="row"><div class="col-lg-7"><b>${Helper.translate({ key: 'count' })}:</b></div><div class="col-lg-5">${statsResult.count}</div></div>`;
    resultString += `<div class="row"><div class="col-lg-7"><b>${Helper.translate({ key: 'index_count' })}:</b></div><div class="col-lg-5">${statsResult.nindexes}</div></div>`;

    const size = Number.isNaN(Number(statsResult.size / scale)) ? '0.00' : Number(statsResult.size / scale).toFixed(2);
    resultString += `<div class="row"><div class="col-lg-7"><b>${Helper.translate({ key: 'size' })}:</b></div><div class="col-lg-5">${size} ${text}</div></div>`;

    const totalIndexSize = Number.isNaN(Number(statsResult.totalIndexSize / scale)) ? '0.00' : Number(statsResult.totalIndexSize / scale).toFixed(2);
    resultString += `<div class="row"><div class="col-lg-7"><b>${Helper.translate({ key: 'total_index_size' })}:</b></div><div class="col-lg-5">${totalIndexSize} ${text}</div></div>`;

    const avgObjSize = Number.isNaN(Number(statsResult.avgObjSize / scale)) ? '0.00' : Number(statsResult.avgObjSize / scale).toFixed(2);
    resultString += `<div class="row"><div class="col-lg-7"><b>${Helper.translate({ key: 'avg_obj_size' })}:</b></div><div class="col-lg-5">${avgObjSize} ${text}</div></div>`;
    resultString += `<div class="row"><div class="col-lg-7"><b>${Helper.translate({ key: 'is_capped' })}:</b></div><div class="col-lg-5">${statsResult.capped}</div></div>`;

    $('#divCollectionInfo').html(resultString);
  },

  prepareContextMenuModals() {
    const filterModal = $('#collectionFilterModal');
    filterModal.on('shown.bs.modal', () => {
      CollectionFilter.initializeFilterTable();
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

    const updateViewPipeline = $('#updateViewPipelineModal');
    updateViewPipeline.on('shown.bs.modal', () => {
      ViewPipelineUpdater.resetForm();
      ViewPipelineUpdater.initialize();
    });

    return { filterModal, addCollectionModal, convertToCappedModal, renameModal, validationRulesModal, updateViewPipeline };
  },

  getCollectionNames(isSystem) {
    const collectionNames = SessionManager.get(SessionManager.strSessionCollectionNames);
    if (collectionNames) {
      const result = [];
      collectionNames.forEach((collectionName) => {
        if (CollectionFilter.filterRegex.get() && !collectionName.name.match(new RegExp(CollectionFilter.filterRegex.get(), 'i'))) return;
        if ($.inArray(collectionName.name, CollectionFilter.excludedCollectionsByFilter.get()) !== -1) return;

        if (isSystem && collectionName.name.startsWith('system')) result.push(collectionName);
        else if (!isSystem && !collectionName.name.startsWith('system')) result.push(collectionName);
      });

      return result;
    }

    return collectionNames;
  }
};

export default new CollectionUtil();
