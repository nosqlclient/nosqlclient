import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { UIComponents, ExtendedJSON, ErrorHandler, Notification } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import moment from 'moment';
import $ from 'jquery';

const IndexManagement = function () {

};

IndexManagement.prototype = {
  prepareFormForView() {
    this.clearForm();

    const modal = $('#addIndexModal');
    const selectedCollection = modal.data('collection');
    const indexName = modal.data('index');

    if (!selectedCollection || !indexName) {
      this.addField();
      return;
    }

    Communicator.call({
      methodName: 'indexInformation',
      args: { selectedCollection, isFull: true },
      callback: (err, indexInformation) => {
        if (err || indexInformation.error) ErrorHandler.showMeteorFuncError(err, indexInformation);
        else {
          let found = false;
          indexInformation.result.forEach((index) => {
            if (index.name === indexName) {
              found = true;
              this.proceedPreparingFormForView(index);
            }
          });
          if (!found) Notification.error('index-not-found', null, { indexName });
        }
      }
    });
  },

  proceedPreparingFormForView(index) {
    $('#addIndexModalTitle').html(index.name);
    $('#inputName').val(index.name);
    $('#btnSaveIndex').prop('disabled', true);

    if (index.key) {
      Object.keys(index.key).forEach((key) => {
        if (key !== '_fts' && key !== '_ftsx') this.addField(key, `${index.key[key]}`);
      });
    }

    if (index.weights) {
      Object.keys(index.weights).forEach((weight) => {
        this.addFieldWeight(weight, `${index.weights[weight]}`);
        this.addField(weight, 'text');
      });
    }

    if (index.collation) UIComponents.Editor.setCodeMirrorValue($('#divCollationAddIndex'), JSON.stringify(index.collation), $('#txtCollationAddIndex'));
    if (index.partialFilterExpression) UIComponents.Editor.setCodeMirrorValue($('#divPartial'), JSON.stringify(index.partialFilterExpression), $('#txtPartial'));
    $('#input2DMin').val(index.min);
    $('#input2DMax').val(index.max);
    $('#input2DBit').val(index.bits);
    $('#input2DSphereVersion').val(index['2dsphereIndexVersion']);
    $('#inputBucketSize').val(index.bucketSize);
    $('#inputTTL').val(index.expireAfterSeconds);
    $('#inputTextLanguageOverride').val(index.language_override);
    UIComponents.Checkbox.toggleState($('#inputUnique'), index.unique ? 'check' : 'uncheck');
    UIComponents.Checkbox.toggleState($('#inputBackground'), index.background ? 'check' : 'uncheck');
    UIComponents.Checkbox.toggleState($('#inputSparse'), index.sparse ? 'check' : 'uncheck');
    $('#cmbTextIndexVersion').val(index.textIndexVersion).trigger('chosen:updated');
    $('#cmbTextIndexDefaultLanguage').val(index.default_language).trigger('chosen:updated');
  },

  clearForm() {
    $('.nav-tabs a[href="#tab-1-indexes"]').tab('show');
    UIComponents.Editor.setCodeMirrorValue($('#divCollationAddIndex'), '', $('#txtCollationAddIndex'));
    UIComponents.Editor.setCodeMirrorValue($('#divPartial'), '', $('#txtPartial'));

    $('.divField:visible, .divFieldWeight:visible').remove();
    $('#inputName, #input2DBit, #input2DMax, #input2DMin, #input2DSphereVersion, #inputBucketSize, #inputTTL, #inputTextLanguageOverride').val('');
    UIComponents.Checkbox.toggleState($('#inputUnique, #inputBackground, #inputSparse'), 'uncheck');
    $('#addIndexModalTitle').html(Helper.translate({ key: 'add_index' }));
    $('#btnSaveIndex').prop('disabled', false);
    $('#cmbTextIndexVersion, #cmbTextIndexDefaultLanguage').find('option').prop('selected', false).trigger('chosen:updated');
  },

  addField(fieldName, fieldType) {
    const divField = $('.divField:hidden');
    const cloned = divField.clone();

    $('.divField:last').after(cloned);

    cloned.show();
    cloned.find('.cmbIndexTypes').chosen();
    if (fieldName) cloned.find('.txtFieldName').val(fieldName);
    if (fieldType) cloned.find('.cmbIndexTypes').val(fieldType).trigger('chosen:updated');
  },

  addFieldWeight(fieldName, val) {
    const divFieldWeight = $('.divFieldWeight:hidden');
    const cloned = divFieldWeight.clone();

    $('.divFieldWeight:last').after(cloned);

    cloned.show();
    if (fieldName) cloned.find('.txtFieldWeightName').val(fieldName);
    if (val) cloned.find('.txtFieldWeight').val(val);
  },

  prepareFieldWeights() {
    const divFieldWeight = $('.divFieldWeight:visible');
    const divFieldSelector = $('.divField');

    // add weights for TEXT index fields
    Object.keys(divFieldSelector).forEach((key) => {
      const divField = $(divFieldSelector[key]);
      const fieldVal = divField.find('.cmbIndexTypes').val();
      const fieldName = divField.find('.txtFieldName').val();

      if (fieldVal && fieldVal === 'text') {
        let found = false;
        Object.keys(divFieldWeight).forEach((divFieldWeightKey) => {
          const weightField = divFieldWeight[divFieldWeightKey];
          if ($(weightField).find('.txtFieldWeightName').val() === fieldName) found = true;
        });
        if (!found && fieldName) this.addFieldWeight(fieldName);
      }
    });

    // clear missing TEXT index fields from weights
    Object.keys(divFieldWeight).forEach((key) => {
      const div = $(divFieldWeight[key]);
      const weightName = div.find('.txtFieldWeightName').val();

      let found = false;
      Object.keys(divFieldSelector).forEach((divFieldKey) => {
        const divField = $(divFieldSelector[divFieldKey]);
        const fieldName = divField.find('.txtFieldName').val();
        const fieldVal = divField.find('.cmbIndexTypes').val();

        if (weightName === fieldName && fieldVal === 'text') found = true;
      });
      if (!found) div.remove();
    });
  },

  setOptionsForTextIndex(index) {
    index.weights = {};
    const divSelector = $('.divFieldWeight');
    Object.keys(divSelector).forEach((key) => {
      const divFieldWeight = $(divSelector[key]);
      const fieldName = divFieldWeight.find('.txtFieldWeightName').val();
      const fieldVal = divFieldWeight.find('.txtFieldWeight').val();
      if (fieldName && fieldVal) index.weights[fieldName] = parseInt(fieldVal, 10);
    });

    const version = $('#cmbTextIndexVersion').val();
    const defaultLanguage = $('#cmbTextIndexDefaultLanguage').val();
    const languageOverride = $('#inputTextLanguageOverride').val();
    if (version) index.textIndexVersion = parseInt(version, 10);
    if (defaultLanguage) index.default_language = defaultLanguage;
    if (languageOverride) index.language_override = languageOverride;
  },

  setOptionsForTwoDIndex(index) {
    const bit = $('#input2DBit').val();
    const min = $('#input2DMin').val();
    const max = $('#input2DMax').val();
    if (bit) index.bits = parseInt(bit, 10);
    if (min) index.min = parseInt(min, 10);
    if (max) index.max = parseInt(max, 10);
  },

  setOptionsForTwoDSphereIndex(index) {
    const version = $('#input2DSphereVersion').val();
    if (version) index['2dsphereIndexVersion'] = parseInt(version, 10);
  },

  setOptionsForGeohaystackIndex(index) {
    const bucketSize = $('#inputBucketSize').val();
    if (bucketSize) index.bucketSize = parseInt(bucketSize, 10);
  },

  setOtherOptionsForIndex(index, ttl, partialFilterExpression, indexName, collation) {
    if (UIComponents.Checkbox.getState($('#inputUnique'))) index.unique = true;
    if (UIComponents.Checkbox.getState($('#inputBackground'))) index.background = true;
    if (ttl) index.expireAfterSeconds = ttl;
    if (UIComponents.Checkbox.getState($('#inputSparse'))) index.sparse = true;
    if (partialFilterExpression) index.partialFilterExpression = partialFilterExpression;
    if (collation) index.collation = collation;
    if (indexName) index.name = indexName;
  },

  extractIndexOptions() {
    let partialFilterExpression = UIComponents.Editor.getCodeMirrorValue($('#divPartial'));
    if (partialFilterExpression) {
      partialFilterExpression = ExtendedJSON.convertAndCheckJSON(partialFilterExpression);
      if (partialFilterExpression.ERROR) {
        Notification.error('syntax-error-partial-filter-expression', null, { error: partialFilterExpression.ERROR });
        return;
      }
    }

    let collation = UIComponents.Editor.getCodeMirrorValue($('#divCollationAddIndex'));
    if (collation) {
      collation = ExtendedJSON.convertAndCheckJSON(collation);
      if (collation.ERROR) {
        Notification.error('syntax-error-collation', null, { error: collation.ERROR });
        return;
      }
    }

    const ttl = $('#inputTTL').val();
    const indexName = $('#inputName').val();
    const index = { key: {} };
    let textExists = false; let twodExists = false; let twodSphereExists = false; let geoHaystackExists = false;

    const divFieldSelector = $('.divField');
    Object.keys(divFieldSelector).forEach((key) => {
      const divField = $(divFieldSelector[key]);
      const fieldName = divField.find('.txtFieldName').val();
      let fieldVal = divField.find('.cmbIndexTypes').val();
      const descendingVal = (fieldVal === '-1' ? -1 : fieldVal);
      fieldVal = fieldVal === '1' ? 1 : descendingVal;
      if (fieldName && fieldVal) {
        index.key[fieldName] = fieldVal;
        if (fieldVal === 'text') textExists = true;
        if (fieldVal === '2d') twodExists = true;
        if (fieldVal === '2dsphere') twodSphereExists = true;
        if (fieldVal === 'geoHaystack') geoHaystackExists = true;
      }
    });

    if (textExists) this.setOptionsForTextIndex(index);
    if (twodExists) this.setOptionsForTwoDIndex(index);
    if (twodSphereExists) this.setOptionsForTwoDSphereIndex(index);
    if (geoHaystackExists) this.setOptionsForGeohaystackIndex(index);
    this.setOtherOptionsForIndex(index, ttl, partialFilterExpression, indexName, collation);

    return index;
  },

  saveIndex() {
    Notification.start('#btnSaveIndex');
    const selectedCollection = $('#cmbCollectionsIndexManagement').val();
    const command = { createIndexes: selectedCollection, indexes: [] };

    const index = this.extractIndexOptions();
    if (!index) return;

    command.indexes.push(index);

    Communicator.call({
      methodName: 'command',
      args: { command, isFull: true },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          Notification.success('saved-successfully');
          this.initIndexes();
          $('#addIndexModal').modal('hide');
        }
      }
    });
  },

  initIndexes() {
    const selectedCollection = $('#cmbCollectionsIndexManagement').val();
    if (!selectedCollection) {
      return;
    }

    Notification.start('#btnAddIndex');
    Communicator.call({
      methodName: 'indexInformation',
      args: { selectedCollection, isFull: true },
      callback: (err, indexInformation) => {
        if (err || indexInformation.error) ErrorHandler.showMeteorFuncError(err, indexInformation);
        else {
          Communicator.call({
            methodName: 'stats',
            args: { selectedCollection },
            callback: (statsErr, stats) => {
              if (statsErr || stats.error) ErrorHandler.showMeteorFuncError(statsErr, stats);
              else {
                Communicator.call({
                  methodName: 'aggregate',
                  args: { selectedCollection, pipeline: [{ $indexStats: {} }] },
                  callback: (aggregateErr, indexStats) => {
                    const data = this.populateTableData(indexInformation, stats, indexStats);

                    this.initializeIndexesTable(data);
                    Notification.stop();
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  initViewRaw() {
    const modal = $('#viewRawModal');
    const selectedCollection = modal.data('collection');
    const indexName = modal.data('index');

    if (!selectedCollection || !indexName) {
      Notification.error('collection-or-index-name-missing');
      modal.modal('hide');
      return;
    }

    Notification.start('#btnCloseRawViewModal');
    Communicator.call({
      methodName: 'indexInformation',
      args: { selectedCollection, isFull: true },
      callback: (err, indexInformation) => {
        if (err || indexInformation.error) ErrorHandler.showMeteorFuncError(err, indexInformation);
        else {
          let found = false;
          indexInformation.result.forEach((index) => {
            if (index.name === indexName) {
              found = true;
              UIComponents.Editor.setCodeMirrorValue($('#divViewRaw'), JSON.stringify(index, null, 1), $('#txtViewRaw'));
              $('#viewRawTitle').html(index.name);
            }
          });

          if (!found) Notification.error('index-not-found', null, { indexName });
        }

        Notification.stop();
      }
    });
  },

  getCorrectSize(size) {
    if (!size) {
      return '';
    }

    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
    const { scale, text } = Helper.getScaleAndText(settings.scale);
    return Number.isNaN(Number(size / scale).toFixed(2)) ? `0 ${text}` : `${Number(size / scale).toFixed(2)} ${text}`;
  },

  populateTableData(indexInfo, stats, indexStats) {
    const result = [];
    indexInfo.result.forEach((obj) => {
      const index = {
        name: obj.name,
        asc_fields: [],
        desc_fields: [],
        sphere_fields: [],
        geo_haystack_fields: [],
        twod_fields: [],
        hashed: [],
        text: [],
        properties: [],
      };

      if (obj.weights) index.text.push(Object.keys(obj.weights)[0]);
      if (obj.background) index.properties.push('background');
      if (obj.sparse) index.properties.push('sparse');
      if (obj.unique) index.properties.push('unique');
      if (obj.expireAfterSeconds) index.properties.push(`ttl ${obj.expireAfterSeconds}`);
      if (obj.partialFilterExpression) {
        index.properties.push('partial');
        index.partial = obj.partialFilterExpression;
      }

      if (obj.key && Object.prototype.toString.call(obj.key) === '[object Object]') {
        Object.keys(obj.key).forEach((field) => {
          if (field !== '_fts' && field !== '_ftsx') {
            if (obj.key[field] === 1) index.asc_fields.push(field);
            else if (obj.key[field] === -1) index.desc_fields.push(field);
            else if (obj.key[field] === '2dsphere') index.sphere_fields.push(field);
            else if (obj.key[field] === '2d') index.twod_fields.push(field);
            else if (obj.key[field] === 'geoHaystack') index.geo_haystack_fields.push(field);
            else if (obj.key[field] === 'hashed') index.hashed.push(field);
          }
        });
      }

      if (stats.result.indexSizes && stats.result.indexSizes[index.name]) index.size = stats.result.indexSizes[index.name];

      if (indexStats && indexStats.result) {
        indexStats.result.forEach((indexStat) => {
          if (indexStat.name === index.name) {
            index.usage = indexStat.accesses.ops;
            index.usage_since = indexStat.accesses.since.$date;
          }
        });
      }

      result.push(index);
    });

    return result;
  },

  initializeIndexesTable(data) {
    const tblIndexes = $('#tblIndexes');
    const tbody = tblIndexes.find('tbody');
    tbody.html('');

    data.forEach((index) => {
      let row = '<tr><td>';

      // start of fields
      index.asc_fields.forEach((field) => { row += `<button class='btn btn-white btn-xs'>${field}</button>  `; });
      index.desc_fields.forEach((field) => { row += `<button class='btn btn-danger btn-xs'>${field}</button>  `; });
      index.hashed.forEach((field) => { row += `<button class='btn btn-warning btn-xs'>${field}</button>  `; });
      index.sphere_fields.forEach((field) => { row += `<button class='btn btn-info btn-xs'>${field}</button>  `; });
      index.twod_fields.forEach((field) => { row += `<button class='btn btn-primary btn-xs'>${field}</button>  `; });
      index.geo_haystack_fields.forEach((field) => { row += `<button class='btn index-button btn-xs'>${field}</button>  `; });
      index.text.forEach((field) => { row += `<button class='btn btn-success btn-xs'>${field}</button>  `; });

      row += '</td>';

      // start of index name/info
      row += `<td class='issue-info'><a href='#'>${index.name}</a><small>`;
      if (index.usage) row += `Usage count: <b>${index.usage}</b>, since: <b>${moment(index.usage_since).format('MMMM Do YYYY, h:mm:ss a')}</b>`;
      row += '</small></td>';

      // start of size
      row += `<td>${this.getCorrectSize(index.size)}</td>`;

      // start of properties
      row += '<td>';
      index.properties.forEach((property) => { row += `<button class='btn btn-white btn-xs'>${property}</button>  `; });
      row += '</td>';

      row += `<td><a href='' title='Show Details' id='${index.name}' class='editor_view'><i class='fa fa-book text-navy'></i></a>`;
      row += `<td><a href='' title='Show Raw Json' id='${index.name}' class='editor_raw'><i class='fa fa-leaf text-navy'></i></a>`;
      row += `</td><td><a href='' title='Drop' id='${index.name}' class='editor_remove'><i class='fa fa-remove text-navy'></i></a></td></tr>`;
      tbody.append(row);
    });
  },

  remove(indexName) {
    const selectedCollection = $('#cmbCollectionsIndexManagement').val();

    if (indexName && selectedCollection) {
      Notification.modal({
        title: 'are-you-sure',
        text: 'index-will-be-dropped',
        textTranslateOptions: { indexName },
        type: 'info',
        callback: (isConfirm) => {
          if (isConfirm) {
            Notification.start('#btnAddIndex');
            Communicator.call({
              methodName: 'dropIndex',
              args: { selectedCollection, indexName },
              callback: (err, result) => {
                if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
                else {
                  Notification.success('index-dropped-successfully', null, { indexName });
                  this.initIndexes();
                }
              }
            });
          }
        }
      });
    }
  }
};

export default new IndexManagement();
