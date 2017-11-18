import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import { initIndexes } from '../index_management';
import './add_index.html';

const toastr = require('toastr');
const Ladda = require('ladda');

export const prepareFormForView = function () {
  clearForm();

  const modal = $('#addIndexModal');
  const selectedCollection = modal.data('collection');
  const indexName = modal.data('index');

  if (!selectedCollection || !indexName) {
    addField();
    return;
  }

  Communicator.call({
    methodName: 'indexInformation',
    args: { selectedCollection, isFull: true },
    callback: (err, indexInformation) => {
      if (err || indexInformation.error) {
        Helper.showMeteorFuncError(err, indexInformation, "Couldn't fetch index information");
      } else {
        let found = false;
        for (const index of indexInformation.result) {
          if (index.name === indexName) {
            found = true;
            proceedPreparingFormForView(index);
          }
        }

        if (!found) {
          toastr.error(`Couldn't find index: ${indexName}`);
        }
      }
    }
  });
};

const proceedPreparingFormForView = function (index) {
  $('#addIndexModalTitle').html(index.name);
  $('#inputIndexName').val(index.name);
  $('#btnSaveIndex').prop('disabled', true);

  for (const key in index.key) {
    if (!index.key.hasOwnProperty(key) || key === '_fts' || key === '_ftsx') {
      continue;
    }
    addField(key, `${index.key[key]}`);
  }
  for (const weight in index.weights) {
    if (!index.weights.hasOwnProperty(weight)) {
      continue;
    }

    addFieldWeight(weight, `${index.weights[weight]}`);
    addField(weight, 'text');
  }

  if (index.collation) {
    Helper.setCodeMirrorValue($('#divCollationAddIndex'), JSON.stringify(index.collation), $('#txtCollationAddIndex'));
  }
  if (index.partialFilterExpression) {
    Helper.setCodeMirrorValue($('#divPartial'), JSON.stringify(index.partialFilterExpression), $('#txtPartial'));
  }
  $('#input2DMin').val(index.min);
  $('#input2DMax').val(index.max);
  $('#input2DBit').val(index.bits);
  $('#input2DSphereVersion').val(index['2dsphereIndexVersion']);
  $('#inputBucketSize').val(index.bucketSize);
  $('#inputTTL').val(index.expireAfterSeconds);
  $('#inputTextLanguageOverride').val(index.language_override);
  $('#inputUnique').iCheck(index.unique ? 'check' : 'uncheck');
  $('#inputBackground').iCheck(index.background ? 'check' : 'uncheck');
  $('#inputSparse').iCheck(index.sparse ? 'check' : 'uncheck');
  $('#cmbTextIndexVersion').val(index.textIndexVersion).trigger('chosen:updated');
  $('#cmbTextIndexDefaultLanguage').val(index.default_language).trigger('chosen:updated');
};

const clearForm = function () {
  $('.nav-tabs a[href="#tab-1-indexes"]').tab('show');
  Helper.setCodeMirrorValue($('#divCollationAddIndex'), '', $('#txtCollationAddIndex'));
  Helper.setCodeMirrorValue($('#divPartial'), '', $('#txtPartial'));

  $('.divField:visible').remove();
  $('.divFieldWeight:visible').remove();
  $('#inputIndexName').val('');
  $('#input2DBit').val('');
  $('#input2DMax').val('');
  $('#input2DMin').val('');
  $('#input2DSphereVersion').val('');
  $('#inputBucketSize').val('');
  $('#inputTTL').val('');
  $('#inputTextLanguageOverride').val('');
  $('#inputUnique').iCheck('uncheck');
  $('#inputBackground').iCheck('uncheck');
  $('#inputSparse').iCheck('uncheck');
  $('#addIndexModalTitle').html('Add Index');
  $('#btnSaveIndex').prop('disabled', false);
  $('#cmbTextIndexVersion, #cmbTextIndexDefaultLanguage').find('option').prop('selected', false).trigger('chosen:updated');
};

const addField = function (fieldName, fieldType) {
  const divField = $('.divField:hidden');
  const cloned = divField.clone();

  $('.divField:last').after(cloned);

  cloned.show();
  cloned.find('.cmbIndexTypes').chosen();
  if (fieldName) {
    cloned.find('.txtFieldName').val(fieldName);
  }
  if (fieldType) {
    cloned.find('.cmbIndexTypes').val(fieldType).trigger('chosen:updated');
  }
};

const addFieldWeight = function (fieldName, val) {
  const divFieldWeight = $('.divFieldWeight:hidden');
  const cloned = divFieldWeight.clone();

  $('.divFieldWeight:last').after(cloned);

  cloned.show();
  if (fieldName) {
    cloned.find('.txtFieldWeightName').val(fieldName);
  }
  if (val) {
    cloned.find('.txtFieldWeight').val(val);
  }
};

const prepareFieldWeights = function () {
  const divFieldWeight = $('.divFieldWeight:visible');
  const divFieldSelector = $('.divField');

  // add weights for TEXT index fields
  for (let divField of divFieldSelector) {
    divField = $(divField);
    const fieldVal = divField.find('.cmbIndexTypes').val();
    const fieldName = divField.find('.txtFieldName').val();

    if (fieldVal && fieldVal === 'text') {
      let found = false;
      for (const weightField of divFieldWeight) {
        if ($(weightField).find('.txtFieldWeightName').val() === fieldName) {
          found = true;
        }
      }
      if (!found && fieldName) {
        addFieldWeight(fieldName);
      }
    }
  }

  // clear missing TEXT index fields from weights
  for (let div of divFieldWeight) {
    div = $(div);
    const weightName = div.find('.txtFieldWeightName').val();

    let found = false;
    for (let divField of divFieldSelector) {
      divField = $(divField);
      const fieldName = divField.find('.txtFieldName').val();
      const fieldVal = divField.find('.cmbIndexTypes').val();

      if (weightName === fieldName && fieldVal === 'text') {
        found = true;
      }
    }

    if (!found) {
      div.remove();
    }
  }
};

Template.addIndex.onRendered(() => {
  $('#divSparse, #divUnique, #divBackground').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
  $('#cmbTextIndexVersion, #cmbTextIndexDefaultLanguage').chosen({
    create_option: true,
    allow_single_deselect: true,
    persistent_create_option: true,
    skip_no_results: true,
  });

  $('#accordion').on('show.bs.collapse', () => {
    Meteor.setTimeout(() => {
      const divSelector = $('#divPartial');
      Helper.initializeCodeMirror(divSelector, 'txtPartial');
    }, 150);
  });

  $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
    const target = $(e.target).attr('href');
    if (target === '#tab-4-indexes-collation') {
      Helper.initializeCodeMirror($('#divCollationAddIndex'), 'txtCollationAddIndex');
    } else if (target === '#tab-2-text-options') {
      prepareFieldWeights();
    }
  });
});

const setOptionsForTextIndex = function (index) {
  index.weights = {};
  for (let divFieldWeight of $('.divFieldWeight')) {
    divFieldWeight = $(divFieldWeight);
    const fieldName = divFieldWeight.find('.txtFieldWeightName').val();
    const fieldVal = divFieldWeight.find('.txtFieldWeight').val();
    if (fieldName && fieldVal) {
      index.weights[fieldName] = parseInt(fieldVal);
    }
  }

  const version = $('#cmbTextIndexVersion').val();
  const defaultLanguage = $('#cmbTextIndexDefaultLanguage').val();
  const languageOverride = $('#inputTextLanguageOverride').val();
  if (version) {
    index.textIndexVersion = parseInt(version);
  }
  if (defaultLanguage) {
    index.default_language = defaultLanguage;
  }
  if (languageOverride) {
    index.language_override = languageOverride;
  }
};

const setOptionsForTwoDIndex = function (index) {
  const bit = $('#input2DBit').val();
  const min = $('#input2DMin').val();
  const max = $('#input2DMax').val();
  if (bit) {
    index.bits = parseInt(bit);
  }
  if (min) {
    index.min = parseInt(min);
  }
  if (max) {
    index.max = parseInt(max);
  }
};

const setOptionsForTwoDSphereIndex = function (index) {
  const version = $('#input2DSphereVersion').val();
  if (version) {
    index['2dsphereIndexVersion'] = parseInt(version);
  }
};

const setOptionsForGeohaystackIndex = function (index) {
  const bucketSize = $('#inputBucketSize').val();
  if (bucketSize) {
    index.bucketSize = parseInt(bucketSize);
  }
};

function setOtherOptionsForIndex(index, ttl, partialFilterExpression, indexName, collation) {
  if ($('#divUnique').iCheck('update')[0].checked) {
    index.unique = true;
  }
  if ($('#divBackground').iCheck('update')[0].checked) {
    index.background = true;
  }
  if (ttl) {
    index.expireAfterSeconds = ttl;
  }
  if ($('#divSparse').iCheck('update')[0].checked) {
    index.sparse = true;
  }
  if (partialFilterExpression) {
    index.partialFilterExpression = partialFilterExpression;
  }
  if (collation) {
    index.collation = collation;
  }
  if (indexName) {
    index.name = indexName;
  }
}
Template.addIndex.events({
  'click .addField': function () {
    addField();
  },

  'click .deleteField': function (e) {
    if ($('.divField:visible').length === 1) {
      toastr.warning('At least one field is required !');
      return;
    }
    $(e.currentTarget).parents('.divField').remove();
  },

  'click #btnSaveIndex': function () {
    Ladda.create(document.querySelector('#btnSaveIndex')).start();
    const selectedCollection = $('#cmbCollections').val();
    const command = { createIndexes: selectedCollection, indexes: [] };

    let partialFilterExpression = Helper.getCodeMirrorValue($('#divPartial'));
    if (partialFilterExpression) {
      partialFilterExpression = Helper.convertAndCheckJSON(partialFilterExpression);
      if (partialFilterExpression.ERROR) {
        toastr.error(`Syntax Error on partialFilterExpression: ${partialFilterExpression.ERROR}`);
        return;
      }
    }

    let collation = Helper.getCodeMirrorValue($('#divCollationAddIndex'));
    if (collation) {
      collation = Helper.convertAndCheckJSON(collation);
      if (collation.ERROR) {
        toastr.error(`Syntax Error on collation: ${collation.ERROR}`);
        return;
      }
    }

    const ttl = $('#inputTTL').val();
    const indexName = $('#inputIndexName').val();
    const index = { key: {} };
    let textExists = false,
      twodExists = false,
      twodSphereExists = false,
      geoHaystackExists = false;

    for (let divField of $('.divField')) {
      divField = $(divField);
      const fieldName = divField.find('.txtFieldName').val();
      let fieldVal = divField.find('.cmbIndexTypes').val();
      fieldVal = fieldVal === '1' ? 1 : (fieldVal === '-1' ? -1 : fieldVal);
      if (fieldName && fieldVal) {
        index.key[fieldName] = fieldVal;
        if (fieldVal === 'text') {
          textExists = true;
        }
        if (fieldVal === '2d') {
          twodExists = true;
        }
        if (fieldVal === '2dsphere') {
          twodSphereExists = true;
        }
        if (fieldVal === 'geoHaystack') {
          geoHaystackExists = true;
        }
      }
    }

    if (textExists) {
      setOptionsForTextIndex(index);
    }
    if (twodExists) {
      setOptionsForTwoDIndex(index);
    }
    if (twodSphereExists) {
      setOptionsForTwoDSphereIndex(index);
    }
    if (geoHaystackExists) {
      setOptionsForGeohaystackIndex(index);
    }
    setOtherOptionsForIndex(index, ttl, partialFilterExpression, indexName, collation);

    command.indexes.push(index);

    Communicator.call({
      methodName: 'command',
      args: { command, isFull: true },
      callback: (err, result) => {
        if (err || result.error) {
          Helper.showMeteorFuncError(err, result, "Couldn't create index");
        } else {
          toastr.success('Successfully created index');
          initIndexes();
          $('#addIndexModal').modal('hide');
        }

        Ladda.stopAll();
      }
    });
  }
});
