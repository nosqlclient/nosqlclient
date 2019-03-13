import { SessionManager, UIComponents, Enums, ExtendedJSON, ErrorHandler, Notification } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { Connection } from '/client/imports/ui';
import $ from 'jquery';

import Helper from '/client/imports/helpers/helper';

const CollectionAdd = function () {
};

CollectionAdd.prototype = {
  init() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
      const target = $(e.target).attr('href');
      if (target === '#tab-2-engine') UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divStorageEngine'), txtAreaId: 'txtStorageEngine' });
      else if (target === '#tab-3-validator') {
        $('#cmbValidationActionAddCollection').chosen({
          allow_single_deselect: true,
        });
        $('#cmbValidationLevelAddCollection').chosen({
          allow_single_deselect: true,
        });
        UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divValidatorAddCollection'), txtAreaId: 'txtValidatorAddCollection' });
      } else if (target === '#tab-4-collation') UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCollationAddCollection'), txtAreaId: 'txtCollationAddCollection' });
    });

    $('#cmbCollectionOrView').chosen();

    UIComponents.Combobox.initializeOptionsCombobox($('#cmbAddCollectionViewOptions'), Enums.ADD_COLLECTION_OPTIONS, SessionManager.strSessionSelectedAddCollectionOptions);
  },

  getFlagValue() {
    const twoSizesIndexes = UIComponents.Checkbox.getState($('#inputTwoSizesIndexes'));
    const noPadding = UIComponents.Checkbox.getState($('#inputNoPadding'));
    if (!twoSizesIndexes && !noPadding) return 0;
    if (twoSizesIndexes && !noPadding) return 1;
    if (!twoSizesIndexes && noPadding) return 2;
    if (twoSizesIndexes && noPadding) return 3;
  },

  getOptions() {
    const result = {};

    if ($.inArray('CAPPED', SessionManager.get(SessionManager.strSessionSelectedAddCollectionOptions)) !== -1) {
      result[Enums.ADD_COLLECTION_OPTIONS.CAPPED] = true;
      const maxDocs = $('#inputCappedCollectionMaxDocs').val();
      const size = $('#inputCappedCollectionSize').val();
      if (maxDocs) {
        result.max = parseInt(maxDocs, 10);
      }
      if (size) {
        result.size = parseInt(size, 10);
      }
    }

    if ($.inArray('FLAGS', SessionManager.get(SessionManager.strSessionSelectedAddCollectionOptions)) !== -1) {
      result[Enums.ADD_COLLECTION_OPTIONS.FLAGS] = this.getFlagValue();
    }

    if ($.inArray('INDEX_OPTION_DEFAULTS', SessionManager.get(SessionManager.strSessionSelectedAddCollectionOptions)) !== -1) {
      let val = UIComponents.Editor.getCodeMirrorValue($('#divIndexOptionDefaults'));
      if (!val) result[Enums.ADD_COLLECTION_OPTIONS.INDEX_OPTION_DEFAULTS] = {};
      else {
        val = ExtendedJSON.convertAndCheckJSON(val);
        if (val.ERROR) result.ERROR = Helper.translate({ key: 'syntax-error-index-option-defaults', options: { error: val.ERROR } });
        else result[Enums.ADD_COLLECTION_OPTIONS.INDEX_OPTION_DEFAULTS] = val;
      }
    }

    return result;
  },

  gatherOptions() {
    const options = this.getOptions();
    if (options.ERROR) {
      Notification.error(options.ERROR);
      return;
    }
    const collationVal = UIComponents.Editor.getCodeMirrorValue($('#divCollationAddCollection'));
    if (collationVal) {
      options.collation = ExtendedJSON.convertAndCheckJSON(collationVal);
      if (options.collation.ERROR) {
        Notification.error('syntax-error-collation', null, { error: options.collation.ERROR });
        return;
      }
    }
    if ($('#cmbCollectionOrView').val() === 'view') {
      options.viewOn = $('#cmbCollectionsViewOn').val();
      if (!options.viewOn) {
        Notification.warning('select_collection');
        return;
      }

      options.pipeline = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#divViewPipeline')));
      if (options.pipeline.ERROR) {
        Notification.error('syntax-error-pipeline', null, { error: options.pipeline.ERROR });
        return;
      }

      // views cant have storage engine and validator
      return options;
    }

    const storageEnginveVal = UIComponents.Editor.getCodeMirrorValue($('#divStorageEngine'));
    if (storageEnginveVal) {
      options.storageEngine = ExtendedJSON.convertAndCheckJSON(storageEnginveVal);
      if (options.storageEngine.ERROR) {
        Notification.error('syntax-error-storage-engine', null, { error: options.storageEngine.ERROR });
        return;
      }
    }

    options.validationAction = $('#cmbValidationActionAddCollection').val();
    options.validationLevel = $('#cmbValidationLevelAddCollection').val();
    const validatorVal = UIComponents.Editor.getCodeMirrorValue($('#divValidatorAddCollection'));
    if (validatorVal) {
      options.validator = ExtendedJSON.convertAndCheckJSON(validatorVal);
      if (options.validator.ERROR) {
        Notification.error('syntax-error-validator', null, { error: options.validator.ERROR });
        return;
      }
    }

    return options;
  },

  prepareFormAsCollection() {
    $('#divViewCollections').hide();
    $('#divViewPipelineFormGroup').hide();
    $('#anchorStorageEngine').attr('data-toggle', 'tab');
    $('#anchorValidator').attr('data-toggle', 'tab');
    $('#cmbAddCollectionViewOptions').prop('disabled', false).trigger('chosen:updated');
  },

  prepareFormAsView() {
    const cmbOptions = $('#cmbAddCollectionViewOptions');
    $('#anchorValidator').removeAttr('data-toggle');
    $('#anchorStorageEngine').removeAttr('data-toggle');
    $('#divViewCollections').show();
    $('#divViewPipelineFormGroup').show();
    cmbOptions.prop('disabled', true);
    cmbOptions.find('option').prop('selected', false).trigger('chosen:updated');
    SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, []);
    UIComponents.Combobox.initializeCollectionsCombobox($('#cmbCollectionsViewOn'));
    UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divViewPipeline'), txtAreaId: 'txtViewPipeline' });
  },

  setStorageEngineAndValidator(col) {
    if (col.options.storageEngine) {
      UIComponents.Editor.setCodeMirrorValue($('#divStorageEngine'), JSON.stringify(col.options.storageEngine), $('#txtStorageEngine'));
    }
    if (col.options.validator || col.options.validationLevel || col.options.validationAction) {
      if (col.options.validator) {
        UIComponents.Editor.setCodeMirrorValue($('#divValidatorAddCollection'), JSON.stringify(col.options.validator), $('#txtValidatorAddCollection'));
      }
      if (col.options.validationAction) {
        $('#cmbValidationActionAddCollection').val(col.options.validationAction).trigger('chosen:updated');
      }
      if (col.options.validationLevel) {
        $('#cmbValidationLevelAddCollection').val(col.options.validationLevel).trigger('chosen:updated');
      }
    }
  },

  setOptionsForCollection(col) {
    const optionsToSelect = [];
    if (col.options.capped) {
      optionsToSelect.push('CAPPED');
      SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, optionsToSelect);

      // let view initialize
      setTimeout(() => {
        $('#inputCappedCollectionMaxDocs').val(col.options.max);
        $('#inputCappedCollectionSize').val(col.options.size);
      }, 100);
    }
    if (col.options.flags) {
      optionsToSelect.push('FLAGS');
      SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, optionsToSelect);

      // let view initialize
      setTimeout(() => {
        const twoSizesIndexes = $('#inputTwoSizesIndexes');
        const noPadding = $('#inputNoPadding');
        let twoSizesState = 'uncheck';
        let noPaddingState = 'uncheck';

        if (col.options.flags === 1) {
          twoSizesState = 'check';
        } else if (col.options.flags === 2) {
          noPaddingState = 'check';
        } else if (col.options.flags === 3) {
          twoSizesState = 'check';
          noPaddingState = 'check';
        }

        UIComponents.Checkbox.toggleState(twoSizesIndexes, twoSizesState);
        UIComponents.Checkbox.toggleState(noPadding, noPaddingState);
      }, 100);
    }
    if (col.options.indexOptionDefaults) {
      SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, optionsToSelect);
      optionsToSelect.push('INDEX_OPTION_DEFAULTS');

      // let view initialize
      setTimeout(() => {
        UIComponents.Editor.setCodeMirrorValue($('#divIndexOptionDefaults'), JSON.stringify(col.options.indexOptionDefaults), $('#txtIndexOptionDefaults'));
      }, 100);
    }

    $('#cmbAddCollectionViewOptions').val(optionsToSelect).trigger('chosen:updated');
  },

  prepareShowForm(col) {
    const cmbCollectionOrView = $('#cmbCollectionOrView');
    const modalTitle = $('#collectionAddModalTitle');
    $('.nav-tabs a[href="#tab-1-options"]').tab('show');

    if (col.type === 'view') {
      this.prepareFormAsView();
      modalTitle.text(Helper.translate({ key: 'view_info' }));
      cmbCollectionOrView.val('view').trigger('chosen:updated');
      $('#cmbCollectionsViewOn').val(col.options.viewOn).trigger('chosen:updated');
      if (col.options.pipeline) {
        UIComponents.Editor.setCodeMirrorValue($('#divViewPipeline'), JSON.stringify(col.options.pipeline), $('#txtViewPipeline'));
      }
    } else {
      this.prepareFormAsCollection();
      modalTitle.text(Helper.translate({ key: 'collection_info' }));
      cmbCollectionOrView.val('collection').trigger('chosen:updated');
      this.setStorageEngineAndValidator(col);
      this.setOptionsForCollection(col);
    }

    $('#inputCollectionViewName').val(col.name);
    $('#spanColName').text(col.name);
    $('#btnCreateCollection').prop('disabled', true);

    if (col.options.collation) UIComponents.Editor.setCodeMirrorValue($('#divCollationAddCollection'), JSON.stringify(col.options.collation), $('#txtCollationAddCollection'));
  },

  resetForm() {
    this.prepareFormAsCollection();
    $('.nav-tabs a[href="#tab-1-options"]').tab('show');
    UIComponents.Editor.setCodeMirrorValue($('#divValidatorAddCollection'), '', $('#txtValidatorAddCollection'));
    UIComponents.Editor.setCodeMirrorValue($('#divStorageEngine'), '', $('#txtStorageEngine'));
    UIComponents.Editor.setCodeMirrorValue($('#divCollationAddCollection'), '', $('#txtCollationAddCollection'));
    UIComponents.Editor.setCodeMirrorValue($('#divIndexOptionDefaults'), '', $('#txtIndexOptionDefaults'));
    UIComponents.Editor.setCodeMirrorValue($('#divViewPipeline'), '', $('#txtViewPipeline'));

    $('#inputCollectionViewName').val('');
    $('#inputCappedCollectionMaxDocs').val('');
    $('#inputCappedCollectionSize').val('');
    UIComponents.Checkbox.toggleState($('#inputNoPadding, #inputTwoSizesIndexes'), 'uncheck');
    $('#cmbCollectionOrView, #cmbCollectionsViewOn, #cmbAddCollectionViewOptions, #cmbValidationActionAddCollection, #cmbValidationLevelAddCollection')
      .find('option').prop('selected', false).trigger('chosen:updated');
    $('#collectionAddModalTitle').text(Helper.translate({ key: 'create_collection_view' }));
    $('#spanColName').text(ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id }).connectionName);
    $('#btnCreateCollection').prop('disabled', false);

    SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, []);
  },

  addCollection() {
    const name = $('#inputCollectionViewName').val();
    if (!name) {
      Notification.warning('name-required');
      return;
    }

    const options = this.gatherOptions();
    if (!options) return;

    Notification.start('#btnCreateCollection');

    Communicator.call({
      methodName: 'createCollection',
      args: { collectionName: name, options },
      callback: (err, res) => {
        if (err || (res && res.error)) {
          ErrorHandler.showMeteorFuncError(err, res);
        } else {
          Connection.connect();
          $('#collectionAddModal').modal('hide');
          Notification.success('collection-created-successfully', null, { name });
        }
      }
    });
  },

  initializeForm(collection) {
    Notification.start('#btnCreateCollection');

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    Communicator.call({
      methodName: 'listCollectionNames',
      args: { dbName: connection.databaseName },
      callback: (err, result) => {
        if (err || result.error) {
          ErrorHandler.showMeteorFuncError(err, result);
          $('#collectionAddModal').modal('hide');
        } else {
          Notification.stop();
          let found = false;
          if (result.result) {
            result.result.forEach((col) => {
              if (col.name === collection) {
                this.prepareShowForm(col);
                found = true;
              }
            });
          }

          if (!found) {
            Notification.warning('collection-not-found', null, { name: collection });
            $('#collectionAddModal').modal('hide');
          }
        }
      }
    });
  }
};

export default new CollectionAdd();
