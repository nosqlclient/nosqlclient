import { Enums, Notification, SessionManager, UIComponents, ExtendedJSON } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import $ from 'jquery';

const Options = function () {
};

const getBooleanOption = function (result, option, optionEnumValue, input) {
  if ($.inArray(option, SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1) result[optionEnumValue] = input.iCheck('update')[0].checked;
};

const getIntegerOption = function (result, option, optionEnumValue, input) {
  if ($.inArray(option, SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1) {
    const maxTimeMsVal = input.val();
    if (maxTimeMsVal) result[optionEnumValue] = parseInt(maxTimeMsVal, 10);
  }
};

const getStringOption = function (result, option, optionEnumValue, input) {
  if ($.inArray(option, SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1) {
    const name = input.val();
    if (name) result[optionEnumValue] = name;
  }
};

Options.prototype = {
  getOptions(queryEnum) {
    switch (queryEnum) {
      case Enums.ADD_USER_OPTIONS:
        return this.getAddUserOptions();
      case Enums.AGGREGATE_OPTIONS:
        return this.getAggregateOptions();
      case Enums.BULK_WRITE_OPTIONS:
        return this.getBulkWriteOptions();
      case Enums.COUNT_OPTIONS:
        return this.getCountOptions();
      case Enums.CREATE_INDEX_OPTIONS:
        return this.getCreateIndexOptions();
      case Enums.CURSOR_OPTIONS:
        return this.getCursorOptions();
      case Enums.FINDONE_MODIFY_OPTIONS:
        return this.getFindOneAndModifyOptions();
      case Enums.GEO_HAYSTACK_SEARCH_OPTIONS:
        return this.getGeoHaystackOptions();
      case Enums.GEO_NEAR_OPTIONS:
        return this.getGeoNearOptions();
      case Enums.INSERT_MANY_OPTIONS:
        return this.getInsertManyOptions();
      case Enums.MAP_REDUCE_OPTIONS:
        return this.getMapReduceOptions();
      case Enums.COMMAND_OPTIONS:
        return this.getCommandOptions();
      case Enums.DISTINCT_OPTIONS:
        return this.getDistinctOptions();
      case Enums.RENAME_OPTIONS:
        return this.getRenameOptions();
      case Enums.STATS_OPTIONS:
        return this.getStatsOptions();
      case Enums.UPDATE_OPTIONS:
        return this.getUpdateOptions();

      default:
        return {};
    }
  },

  getAddUserOptions() {
    const result = {};
    this.checkAndAddOption('CUSTOM_DATA', $('#divCustomData'), result, Enums.ADD_USER_OPTIONS);
    this.checkAndAddOption('ROLES', $('#divRoles'), result, Enums.ADD_USER_OPTIONS);

    if (!result.roles || Object.keys(result.roles).length === 0) Notification.info('no-role-user-deprecated');

    return result;
  },

  getAggregateOptions() {
    const result = {};
    this.checkAndAddOption('COLLATION', $('#divCollation'), result, Enums.AGGREGATE_OPTIONS);

    getBooleanOption(result, 'BYPASS_DOCUMENT_VALIDATION', Enums.AGGREGATE_OPTIONS.BYPASS_DOCUMENT_VALIDATION, $('#divBypassDocumentValidation'));
    getBooleanOption(result, 'ALLOW_DISK_USE', Enums.AGGREGATE_OPTIONS.ALLOW_DISK_USE, $('#divAllowDiskUse'));
    getBooleanOption(result, 'EXPLAIN', Enums.AGGREGATE_OPTIONS.EXPLAIN, $('#divExecuteExplain'));
    getIntegerOption(result, 'MAX_TIME_MS', Enums.AGGREGATE_OPTIONS.MAX_TIME_MS, $('#inputMaxTimeMs'));

    return result;
  },

  getBulkWriteOptions() {
    const result = {};

    getBooleanOption(result, 'BYPASS_DOCUMENT_VALIDATION', Enums.BULK_WRITE_OPTIONS.BYPASS_DOCUMENT_VALIDATION, $('#divBypassDocumentValidation'));
    getBooleanOption(result, 'ORDERED', Enums.AGGREGATE_OPTIONS.ORDERED, $('#divOrdered'));

    return result;
  },

  getCountOptions() {
    const result = {};

    getIntegerOption(result, 'MAX_TIME_MS', Enums.COUNT_OPTIONS.MAX_TIME_MS, $('#inputMaxTimeMs'));
    getIntegerOption(result, 'SKIP', Enums.COUNT_OPTIONS.SKIP, $('#inputSkip'));
    getIntegerOption(result, 'LIMIT', Enums.COUNT_OPTIONS.LIMIT, $('#inputLimit'));

    return result;
  },

  getCreateIndexOptions() {
    const result = {};
    this.checkAndAddOption('MAX', $('#divMax'), result, Enums.CREATE_INDEX_OPTIONS);
    this.checkAndAddOption('MIN', $('#divMin'), result, Enums.CREATE_INDEX_OPTIONS);
    this.checkAndAddOption('COLLATION', $('#divCollation'), result, Enums.CREATE_INDEX_OPTIONS);

    getBooleanOption(result, 'UNIQUE', Enums.CREATE_INDEX_OPTIONS.UNIQUE, $('#divUnique'));
    getBooleanOption(result, 'DROP_DUPS', Enums.CREATE_INDEX_OPTIONS.DROP_DUPS, $('#divDropDups'));
    getIntegerOption(result, 'EXPIRE_AFTER_SECONDS', Enums.CREATE_INDEX_OPTIONS.EXPIRE_AFTER_SECONDS, $('#inputExpireAfterSeconds'));
    getBooleanOption(result, 'SPARSE', Enums.CREATE_INDEX_OPTIONS.SPARSE, $('#divSparse'));
    getBooleanOption(result, 'BACKGROUND', Enums.CREATE_INDEX_OPTIONS.BACKGROUND, $('#divBackground'));
    getStringOption(result, 'NAME', Enums.CREATE_INDEX_OPTIONS.NAME, $('#inputIndexName'));

    return result;
  },

  getCursorOptions() {
    const result = {};

    this.checkAndAddOption('PROJECT', $('#divProject'), result, Enums.CURSOR_OPTIONS);
    this.checkAndAddOption('MAX', $('#divMax'), result, Enums.CURSOR_OPTIONS);
    this.checkAndAddOption('MIN', $('#divMin'), result, Enums.CURSOR_OPTIONS);
    this.checkAndAddOption('SORT', $('#divSort'), result, Enums.CURSOR_OPTIONS);

    getIntegerOption(result, 'MAX_TIME_MS', Enums.CURSOR_OPTIONS.MAX_TIME_MS, $('#inputMaxTimeMs'));
    getIntegerOption(result, 'SKIP', Enums.CURSOR_OPTIONS.SKIP, $('#inputSkip'));
    getIntegerOption(result, 'LIMIT', Enums.CURSOR_OPTIONS.LIMIT, $('#inputLimit'));

    return result;
  },

  getFindOneAndModifyOptions() {
    const result = {};
    this.checkAndAddOption('PROJECTION', $('#divProject'), result, Enums.FINDONE_MODIFY_OPTIONS);
    this.checkAndAddOption('SORT', $('#divSort'), result, Enums.FINDONE_MODIFY_OPTIONS);

    getBooleanOption(result, 'RETURN_ORIGINAL', Enums.FINDONE_MODIFY_OPTIONS.RETURN_ORIGINAL, $('#divReturnOriginal'));
    getBooleanOption(result, 'UPSERT', Enums.FINDONE_MODIFY_OPTIONS.UPSERT, $('#divUpsert'));
    getIntegerOption(result, 'MAX_TIME_MS', Enums.FINDONE_MODIFY_OPTIONS.MAX_TIME_MS, $('#inputMaxTimeMs'));

    return result;
  },

  getGeoHaystackOptions() {
    const result = {};
    this.checkAndAddOption('SEARCH', $('#divSearch'), result, Enums.GEO_HAYSTACK_SEARCH_OPTIONS);

    getIntegerOption(result, 'MAX_DISTANCE', Enums.GEO_HAYSTACK_SEARCH_OPTIONS.MAX_TIME_MS, $('#inputMaxDistance'));
    getIntegerOption(result, 'LIMIT', Enums.GEO_HAYSTACK_SEARCH_OPTIONS.LIMIT, $('#inputLimit'));

    return result;
  },

  getGeoNearOptions() {
    const result = {};
    this.checkCodeMirrorSelectorForOption('QUERY', result, Enums.GEO_NEAR_OPTIONS);

    getIntegerOption(result, 'MAX_DISTANCE', Enums.GEO_NEAR_OPTIONS.MAX_DISTANCE, $('#inputMaxDistance'));
    getIntegerOption(result, 'MIN_DISTANCE', Enums.GEO_NEAR_OPTIONS.MIN_DISTANCE, $('#inputMinDistance'));
    getIntegerOption(result, 'MAX_NUMBER', Enums.GEO_NEAR_OPTIONS.MAX_NUMBER, $('#inputMaxNumber'));
    getIntegerOption(result, 'DISTANCE_MULTIPLIER', Enums.GEO_NEAR_OPTIONS.DISTANCE_MULTIPLIER, $('#inputDistanceMultiplier'));
    getBooleanOption(result, 'SPHERICAL', Enums.GEO_NEAR_OPTIONS.SPHERICAL, $('#divSpherical'));
    getBooleanOption(result, 'UNIQUE_DOCS', Enums.GEO_NEAR_OPTIONS.UNIQUE_DOCS, $('#divUniqueDocs'));
    getBooleanOption(result, 'INCLUDE_LOCS', Enums.GEO_NEAR_OPTIONS.INCLUDE_LOCS, $('#divIncludeLocs'));

    return result;
  },

  getInsertManyOptions() {
    const result = {};

    getBooleanOption(result, 'BYPASS_DOCUMENT_VALIDATION', Enums.INSERT_MANY_OPTIONS.BYPASS_DOCUMENT_VALIDATION, $('#divBypassDocumentValidation'));
    getBooleanOption(result, 'SERIALIZE_FUNCTIONS', Enums.INSERT_MANY_OPTIONS.SERIALIZE_FUNCTIONS, $('#divSerializeFunctions'));

    return result;
  },

  getMapReduceOptions() {
    const result = {};
    this.checkAndAddOption('OUT', $('#divOut'), result, Enums.MAP_REDUCE_OPTIONS);
    this.checkCodeMirrorSelectorForOption('QUERY', result, Enums.MAP_REDUCE_OPTIONS);
    this.checkAndAddOption('SORT', $('#divSort'), result, Enums.MAP_REDUCE_OPTIONS);
    this.checkAndAddOption('SCOPE', $('#divScope'), result, Enums.MAP_REDUCE_OPTIONS);

    if ($.inArray('FINALIZE', SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1) {
      const finalize = UIComponents.Editor.getCodeMirrorValue($('#divFinalize'));
      if (!finalize.parseFunction()) {
        result.ERROR = Helper.translate({ key: 'syntax-error-finalize-function' });
        return;
      }
    }

    getIntegerOption(result, 'LIMIT', Enums.MAP_REDUCE_OPTIONS.LIMIT, $('#inputLimit'));
    getBooleanOption(result, 'VERBOSE', Enums.MAP_REDUCE_OPTIONS.VERBOSE, $('#divVerbose'));
    getBooleanOption(result, 'KEEP_TEMP', Enums.MAP_REDUCE_OPTIONS.KEEP_TEMP, $('#divKeepTemp'));
    getBooleanOption(result, 'JS_MODE', Enums.MAP_REDUCE_OPTIONS.JS_MODE, $('#divJsMode'));
    getBooleanOption(result, 'BYPASS_DOCUMENT_VALIDATION', Enums.MAP_REDUCE_OPTIONS.BYPASS_DOCUMENT_VALIDATION, $('#divBypassDocumentValidation'));

    return result;
  },

  getCommandOptions() {
    const result = {};
    getIntegerOption(result, 'MAX_TIME_MS', Enums.COMMAND_OPTIONS.MAX_TIME_MS, $('#inputMaxTimeMs'));

    return result;
  },

  getDistinctOptions() {
    const result = {};
    getIntegerOption(result, 'MAX_TIME_MS', Enums.DISTINCT_OPTIONS.MAX_TIME_MS, $('#inputMaxTimeMs'));

    return result;
  },

  getRenameOptions() {
    const result = {};
    getBooleanOption(result, 'DROP_TARGET', Enums.RENAME_OPTIONS.DROP_TARGET, $('#divDropTarget'));

    return result;
  },

  getStatsOptions() {
    const result = {};
    getIntegerOption(result, 'SCALE', Enums.STATS_OPTIONS.SCALE, $('#inputScale'));

    return result;
  },

  getUpdateOptions() {
    const result = {};
    getBooleanOption(result, 'UPSERT', Enums.UPDATE_OPTIONS.UPSERT, $('#divUpsert'));

    return result;
  },

  checkOption(val, result, optionEnum, option) {
    if (val === '') result[optionEnum[option]] = {};
    else {
      val = ExtendedJSON.convertAndCheckJSON(val);
      if (val.ERROR) result.ERROR = Helper.translate({ key: `syntax-error-${optionEnum[option]}`, options: { error: val.ERROR } });
      else result[optionEnum[option]] = val;
    }
  },

  checkCodeMirrorSelectorForOption(option, result, optionEnum) {
    if ($.inArray(option, SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1) {
      this.checkOption(UIComponents.Editor.getCodeMirrorValue($('#divSelector')), result, optionEnum, option);
    }
  },

  checkAndAddOption(option, divSelector, result, optionEnum) {
    if ($.inArray(option, SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1) {
      this.checkOption(UIComponents.Editor.getCodeMirrorValue(divSelector), result, optionEnum, option);
    }
  }
};

export default new Options();
