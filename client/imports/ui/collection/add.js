import { SessionManager, UIComponents, Enums, ExtendedJSON, ErrorHandler, Notification } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { CollectionUtil } from '/client/imports/ui';
import $ from 'jquery';

const CollectionAdd = function () {
};

CollectionAdd.prototype = {
  getFlagValue() {
    const twoSizesIndexes = $('#divTwoSizesIndexes').iCheck('update')[0].checked;
    const noPadding = $('#divNoPadding').iCheck('update')[0].checked;
    if (!twoSizesIndexes && !noPadding) return 0;
    else if (twoSizesIndexes && !noPadding) return 1;
    else if (!twoSizesIndexes && noPadding) return 2;
    else if (twoSizesIndexes && noPadding) return 3;
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
        if (val.ERROR) {
          result.ERROR = `Syntax Error on Index Option Defaults: ${val.ERROR}`;
        } else {
          result[Enums.ADD_COLLECTION_OPTIONS.INDEX_OPTION_DEFAULTS] = val;
        }
      }
    }

    return result;
  },

  initializeOptions() {
    UIComponents.initializeOptionsCombobox($('#cmbAddCollectionViewOptions'), Enums.ADD_COLLECTION_OPTIONS, SessionManager.strSessionSelectedAddCollectionOptions);
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
        Notification.error(`Syntax error on collation: ${options.collation.ERROR}`);
        return;
      }
    }
    if ($('#cmbCollectionOrView').val() === 'view') {
      options.viewOn = $('#cmbCollectionsAddCollection').val();
      if (!options.viewOn) {
        Notification.warning('Please select a collection to create view on !');
        return;
      }

      options.pipeline = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#divViewPipeline')));
      if (options.pipeline.ERROR) {
        Notification.error(`Syntax error on pipeline: ${options.pipeline.ERROR}`);
        return;
      }

      // views cant have storage engine and validator
      return options;
    }

    const storageEnginveVal = UIComponents.Editor.getCodeMirrorValue($('#divStorageEngine'));
    if (storageEnginveVal) {
      options.storageEngine = ExtendedJSON.convertAndCheckJSON(storageEnginveVal);
      if (options.storageEngine.ERROR) {
        Notification.error(`Syntax error on storageEngine: ${options.storageEngine.ERROR}`);
        return;
      }
    }

    options.validationAction = $('#cmbValidationActionAddCollection').val();
    options.validationLevel = $('#cmbValidationLevelAddCollection').val();
    const validatorVal = UIComponents.Editor.getCodeMirrorValue($('#divValidatorAddCollection'));
    if (validatorVal) {
      options.validator = ExtendedJSON.convertAndCheckJSON(validatorVal);
      if (options.validator.ERROR) {
        Notification.error(`Syntax error on validator: ${options.validator.ERROR}`);
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
    const cmb = $('#cmbCollectionsAddCollection');
    cmb.empty();
    cmb.append($('<option></option>'));
    $.each(SessionManager.get(SessionManager.strSessionCollectionNames), (index, value) => {
      cmb.append($('<option></option>')
        .attr('value', value.name)
        .text(value.name));
    });
    cmb.chosen({
      create_option: true,
      allow_single_deselect: true,
      persistent_create_option: true,
      skip_no_results: true,
    }).trigger('chosen:updated');

    UIComponents.Editor.initializeCodeMirror($('#divViewPipeline'), 'txtViewPipeline');
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
      Meteor.setTimeout(() => {
        $('#inputCappedCollectionMaxDocs').val(col.options.max);
        $('#inputCappedCollectionSize').val(col.options.size);
      }, 100);
    }
    if (col.options.flags) {
      optionsToSelect.push('FLAGS');
      SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, optionsToSelect);

      // let view initialize
      Meteor.setTimeout(() => {
        const twoSizesIndexes = $('#inputTwoSizesIndexes');
        const noPadding = $('#inputNoPadding');

        if (col.options.flags === 0) {
          twoSizesIndexes.iCheck('uncheck');
          noPadding.iCheck('uncheck');
        } else if (col.options.flags === 1) {
          twoSizesIndexes.iCheck('check');
          noPadding.iCheck('uncheck');
        } else if (col.options.flags === 2) {
          twoSizesIndexes.iCheck('uncheck');
          noPadding.iCheck('check');
        } else if (col.options.flags === 3) {
          twoSizesIndexes.iCheck('check');
          noPadding.iCheck('check');
        }
      }, 100);
    }
    if (col.options.indexOptionDefaults) {
      SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, optionsToSelect);
      optionsToSelect.push('INDEX_OPTION_DEFAULTS');

      // let view initialize
      Meteor.setTimeout(() => {
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
      modalTitle.text('View Information');
      cmbCollectionOrView.val('view').trigger('chosen:updated');
      $('#cmbCollectionsAddCollection').val(col.options.viewOn).trigger('chosen:updated');
      if (col.options.pipeline) {
        UIComponents.Editor.setCodeMirrorValue($('#divViewPipeline'), JSON.stringify(col.options.pipeline), $('#txtViewPipeline'));
      }
    } else {
      this.prepareFormAsCollection();
      modalTitle.text('Collection Information');
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
    $('#inputCapped, #inputNoPadding, #inputTwoSizesIndexes').iCheck('uncheck');
    $('#cmbCollectionOrView, #cmbCollectionsAddCollection, #cmbAddCollectionViewOptions, #cmbValidationActionAddCollection, #cmbValidationLevelAddCollection')
      .find('option').prop('selected', false).trigger('chosen:updated');
    $('#collectionAddModalTitle').text('Create Collection/View');
    $('#spanColName').text(ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection) }).connectionName);
    $('#btnCreateCollection').prop('disabled', false);

    SessionManager.set(SessionManager.strSessionSelectedAddCollectionOptions, []);
  },

  addCollection() {
    const name = $('#inputCollectionViewName').val();
    if (!name) {
      Notification.warning('Please enter a name !');
      return;
    }

    const options = CollectionAdd.gatherOptions();
    if (!options) return;

    Notification.start('#btnCreateCollection');

    Communicator.call({
      methodName: 'createCollection',
      args: { collectionName: name, options },
      callback: (err, res) => {
        if (err || (res && res.error)) {
          ErrorHandler.showMeteorFuncError(err, res, "Couldn't create");
        } else {
          CollectionUtil.renderCollectionNames();
          $('#collectionAddModal').modal('hide');
          Notification.success(`Successfuly created collection: ${name}`);
        }
      }
    });
  },

  initializeForm(collection) {
    Notification.start('#btnCreateCollection');

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection) });
    Communicator.call({
      methodName: 'listCollectionNames',
      args: { dbName: connection.databaseName },
      callback: (err, result) => {
        if (err || result.error) {
          ErrorHandler.showMeteorFuncError(err, result, "Couldn't fetch data");
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
            Notification.warning("Couldn't find collection in response of getCollectionInfos");
            $('#collectionAddModal').modal('hide');
          }
        }
      }
    });
  }
};

export default new CollectionAdd();
