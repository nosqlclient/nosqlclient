import { Meteor } from 'meteor/meteor';
import { Enums, Notification, ExtendedJSON, UIComponents, SessionManager } from '/client/imports/modules';
import { QueryRender, QueryingOptions, CollectionUtil } from '/client/imports/ui';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';

const Querying = function () {};

const initOptions = function (combobox, enumValue, showRunOnAdmin, ...excludedOptions) {
  if (!combobox) return;
  $.each(Helper.sortObjectByKey(enumValue), (key, value) => {
    if (excludedOptions.indexOf(value) === -1) {
      combobox.append($('<option></option>')
        .attr('value', key)
        .text(value));
    }
  });

  combobox.chosen();
  QueryRender.setOptionsComboboxChangeEvent(combobox);

  this.setVisibilityOfRunOnAdminCheckbox(showRunOnAdmin);
};

const proceedQueryExecution = function ({ methodName, args = {}, isAdmin = true, queryParams = {}, saveHistory, successCallback }) {
  if (!isAdmin) {
    Object.assign(args, { selectedCollection: SessionManager.get(SessionManager.strSessionSelectedCollection) });
    Notification.start('#btnExecuteQuery');
  } else Notification.start('#btnExecuteAdminQuery');
  Communicator.call({
    methodName,
    args,
    callback: (err, result) => {
      if (!successCallback) QueryRender.renderAfterQueryExecution(err, result, isAdmin, methodName, queryParams, saveHistory);
      else successCallback();
    }
  });
};

const renderCodeMirror = function (divSelector, value) {
  setTimeout(() => {
    UIComponents.Editor.setCodeMirrorValue(divSelector, JSON.stringify(value, null, 1));
  }, 100);
};

const renderFunction = function (divSelector, val) {
  setTimeout(() => {
    const str = JSON.stringify(val, null, 1).replace(/\\n/g, '\n');
    UIComponents.Editor.setCodeMirrorValue(divSelector, str.substring(1, str.length - 1));
  }, 100);
};

const renderInput = function (inputField, val) {
  setTimeout(() => {
    inputField.val(val);
  }, 100);
};

const renderBoolean = function (divSelector, val) {
  setTimeout(() => {
    divSelector.iCheck(val ? 'check' : 'uncheck');
  }, 100);
};

const checkExistance = function (variable, message) {
  if (!variable) {
    Notification.error(message);
    return false;
  }

  return true;
};

const checkStringInput = function (variable, name) {
  return checkExistance(variable, `${name}-required`);
};

const checkErrorField = function (obj, fieldName) {
  if (obj.ERROR) {
    if (!fieldName) Notification.error(obj.ERROR);
    else Notification.error(`syntax-error-${fieldName}`, null, { error: obj.ERROR });
    return false;
  }

  return true;
};

const checkFunction = function (obj, fieldName) {
  return checkExistance(obj, `syntax-error-${fieldName}-function`);
};

const getFromHistoryOrEditorString = function (historyParams, divSelector, historyField = 'selector') {
  let result;
  if (historyParams) result = JSON.stringify(historyParams[historyField]);
  else result = UIComponents.Editor.getCodeMirrorValue(divSelector);

  return result;
};

const getFromHistoryOrEditor = function (historyParams, divSelector, historyField = 'selector') {
  return ExtendedJSON.convertAndCheckJSON(getFromHistoryOrEditorString(historyParams, divSelector, historyField));
};

const getFromHistoryOrEditorAsFunction = function (historyParams, divSelector, historyField) {
  return Helper.convertStrToFunction(getFromHistoryOrEditorString(historyParams, divSelector, historyField));
};

const fieldsCallback = function (option, inverted, options) {
  const divProject = $('#divProject');
  switch (option) {
    case inverted.collation:
      UIComponents.Editor.setCodeMirrorValue($('#divCollation'), JSON.stringify(options.collation, null, 1));
      break;
    case inverted.bypassDocumentValidation:
      $('#divBypassDocumentValidation').iCheck(options.bypassDocumentValidation ? 'check' : 'uncheck');
      break;
    case inverted.maxTimeMS:
      $('#inputMaxTimeMs').val(options.maxTimeMS);
      break;
    case inverted.allowDiskUse:
      $('#divAllowDiskUse').iCheck(options.allowDiskUse ? 'check' : 'uncheck');
      break;
    case inverted.explain:
      $('#divExecuteExplain').iCheck(options.explain ? 'check' : 'uncheck');
      break;
    case inverted.upsert:
      $('#divUpsert').iCheck(options.upsert ? 'check' : 'uncheck');
      break;
    case inverted.ordered:
      $('#inputOrdered').val(options.ordered);
      break;
    case inverted.limit:
      $('#inputLimit').val(options.limit);
      break;
    case inverted.skip:
      $('#inputSkip').val(options.skip);
      break;
    case inverted.max:
      UIComponents.Editor.setCodeMirrorValue($('#divMax'), JSON.stringify(options.max, null, 1));
      break;
    case inverted.min:
      UIComponents.Editor.setCodeMirrorValue($('#divMin'), JSON.stringify(options.min, null, 1));
      break;
    case inverted.unique:
      $('#divUnique').iCheck(options.unique ? 'check' : 'uncheck');
      break;
    case inverted.dropDups:
      $('#divDropDups').iCheck(options.dropDups ? 'check' : 'uncheck');
      break;
    case inverted.sparse:
      $('#divSparse').iCheck(options.sparse ? 'check' : 'uncheck');
      break;
    case inverted.background:
      $('#divBackground').iCheck(options.background ? 'check' : 'uncheck');
      break;
    case inverted.name:
      $('#inputIndexName').val(options.name);
      break;
    case inverted.expireAfterSeconds:
      $('#inputExpireAfterSeconds').val(options.expireAfterSeconds);
      break;
    case inverted.project:
      UIComponents.Editor.setCodeMirrorValue(divProject, JSON.stringify(options.project, null, 1));
      break;
    case inverted.sort:
      UIComponents.Editor.setCodeMirrorValue($('#divSort'), JSON.stringify(options.sort, null, 1));
      break;
    case inverted.projection:
      UIComponents.Editor.setCodeMirrorValue(divProject, JSON.stringify(options.projection, null, 1));
      break;
    case inverted.returnOriginal:
      $('#divReturnOriginal').iCheck(options.returnOriginal ? 'check' : 'uncheck');
      break;
    case inverted.search:
      UIComponents.Editor.setCodeMirrorValue($('#divSearch'), JSON.stringify(options.search, null, 1));
      break;
    case inverted.maxDistance:
      $('#inputMaxDistance').val(options.maxDistance);
      break;
    case inverted.query:
      UIComponents.Editor.setCodeMirrorValue($('#divSelector'), JSON.stringify(options.query, null, 1));
      break;
    case inverted.minDistance:
      $('#inputMinDistance').val(options.minDistance);
      break;
    case inverted.num:
      $('#inputMaxNumber').val(options.num);
      break;
    case inverted.distanceMultiplier:
      $('#inputDistanceMultiplier').val(options.distanceMultiplier);
      break;
    case inverted.spherical:
      $('#divSpherical').iCheck(options.spherical ? 'check' : 'uncheck');
      break;
    case inverted.uniqueDocs:
      $('#divUniqueDocs').iCheck(options.uniqueDocs ? 'check' : 'uncheck');
      break;
    case inverted.includeLocs:
      $('#inputIncludeLocs').iCheck(options.includeLocs ? 'check' : 'uncheck');
      break;
    case inverted.serializeFunctions:
      $('#divSerializeFunctions').iCheck(options.serializeFunctions ? 'check' : 'uncheck');
      break;
    case inverted.out:
      UIComponents.Editor.setCodeMirrorValue($('#divOut'), JSON.stringify(options.out, null, 1));
      break;
    case inverted.scope:
      UIComponents.Editor.setCodeMirrorValue($('#divScope'), JSON.stringify(options.scope, null, 1));
      break;
    case inverted.finalize:
      UIComponents.Editor.setCodeMirrorValue($('#divFinalize'), JSON.stringify(options.finalize, null, 1));
      break;
    case inverted.verbose:
      $('#divVerbose').iCheck(options.verbose ? 'check' : 'uncheck');
      break;
    case inverted.keeptemp:
      $('#divKeepTemp').iCheck(options.keeptemp ? 'check' : 'uncheck');
      break;
    case inverted.scale:
      $('#inputScale').val(options.scale);
      break;

    default: break;
  }
};

const renderOptionsArray = function ({ options, optionEnum, optionCombo }) {
  if (!options) return;

  const optionsArray = [];
  const inverted = (_.invert(optionEnum));

  Object.keys(options).forEach((property) => {
    if (inverted[property]) optionsArray.push((_.invert(optionEnum))[property]);
  });

  setTimeout(() => {
    optionCombo.val(optionsArray).trigger('chosen:updated');
    SessionManager.set(SessionManager.strSessionSelectedOptions, optionsArray);
  }, 100);

  setTimeout(() => {
    for (let i = 0; i < optionsArray.length; i += 1) fieldsCallback(optionsArray[i], inverted, options);
  }, 200);
};

const proceedUpdateQueryExecution = function (historyParams, query) {
  const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.UPDATE_OPTIONS);
  const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
  let setObject = getFromHistoryOrEditor(historyParams, $('#divSet'), 'setObject');

  if (!setObject.$set) setObject = { $set: setObject };

  if (!checkErrorField(selector, 'selector')) return;
  if (!checkErrorField(options)) return;
  if (!checkErrorField(setObject, 'set')) return;

  proceedQueryExecution({
    methodName: query,
    args: { selector, setObject, options },
    isAdmin: false,
    queryParams: { selector, setObject, options },
    saveHistory: (!historyParams)
  });
};

const renderUpdateQuery = function (query, cmb) {
  if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
  if (query.queryParams.setObject) renderCodeMirror($('#divSet'), query.queryParams.setObject);

  renderOptionsArray({
    options: query.queryParams.options,
    optionEnum: Enums.UPDATE_OPTIONS,
    optionCombo: $(`#${cmb}`)
  });
};

const proceedGeoQueryExecution = function (historyParams, query, optionsEnum) {
  let xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
  if (xAxis) xAxis = parseInt(xAxis, 10);

  let yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
  if (yAxis) yAxis = parseInt(yAxis, 10);

  const options = historyParams ? historyParams.options : QueryingOptions.getOptions(optionsEnum);
  if (options.ERROR) {
    Notification.error(options.ERROR);
    return;
  }

  proceedQueryExecution({
    methodName: query,
    args: { xAxis, yAxis, options },
    isAdmin: false,
    queryParams: { xAxis, yAxis, options },
    saveHistory: (!historyParams)
  });
};

const renderGeoQuery = function (query, optionEnum, optionCombo) {
  if (query.queryParams.xAxis && query.queryParams.yAxis) {
    setTimeout(() => {
      $('#inputXAxis').val(query.queryParams.xAxis);
      $('#inputYAxis').val(query.queryParams.yAxis);
    }, 100);
  }
  renderOptionsArray({
    options: query.queryParams.options,
    optionEnum,
    optionCombo
  });
};

Querying.prototype = {
  initOptions(optionEnum, showRunOnAdmin, ...excludedOptions) {
    switch (optionEnum) {
      case Enums.ADD_USER_OPTIONS:
        initOptions.call(this, $('#cmbAddUserOptions'), Enums.ADD_USER_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.COMMAND_OPTIONS:
        initOptions.call(this, $('#cmbCommandOptions'), Enums.COMMAND_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.PROFILING_LEVELS:
        initOptions.call(this, $('#cmbLevel'), Enums.PROFILING_LEVELS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.AGGREGATE_OPTIONS:
        initOptions.call(this, $('#cmbAggregateOptions'), Enums.AGGREGATE_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.BULK_WRITE_OPTIONS:
        initOptions.call(this, $('#cmbBulkWriteOptions'), Enums.BULK_WRITE_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.COUNT_OPTIONS:
        initOptions.call(this, $('#cmbCountOptions'), Enums.COUNT_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.DISTINCT_OPTIONS:
        initOptions.call(this, $('#cmbDistinctOptions'), Enums.COMMAND_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.CREATE_INDEX_OPTIONS:
        initOptions.call(this, $('#cmbCreateIndexOptions'), Enums.CREATE_INDEX_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.CURSOR_OPTIONS:
        initOptions.call(this, $('#cmbFindCursorOptions'), Enums.CURSOR_OPTIONS, showRunOnAdmin, ...excludedOptions);
        initOptions.call(this, $('#cmbFindOneCursorOptions'), Enums.CURSOR_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.GEO_HAYSTACK_SEARCH_OPTIONS:
        initOptions.call(this, $('#cmbGeoHaystackSearchOptions'), Enums.GEO_HAYSTACK_SEARCH_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.GEO_NEAR_OPTIONS:
        initOptions.call(this, $('#cmbGeoNearOptions'), Enums.GEO_NEAR_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.INSERT_MANY_OPTIONS:
        initOptions.call(this, $('#cmbInsertManyOptions'), Enums.INSERT_MANY_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.MAP_REDUCE_OPTIONS:
        initOptions.call(this, $('#cmbMapReduceOptions'), Enums.MAP_REDUCE_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.RENAME_OPTIONS:
        initOptions.call(this, $('#cmbRenameOptions'), Enums.RENAME_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.STATS_OPTIONS:
        initOptions.call(this, $('#cmbStatsOptions'), Enums.STATS_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.UPDATE_OPTIONS:
        initOptions.call(this, $('#cmbUpdateManyOptions'), Enums.UPDATE_OPTIONS, showRunOnAdmin, ...excludedOptions);
        initOptions.call(this, $('#cmbUpdateOneOptions'), Enums.UPDATE_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      case Enums.FINDONE_MODIFY_OPTIONS:
        initOptions.call(this, $('#cmbFindOneModifyOptions'), Enums.UPDATE_OPTIONS, showRunOnAdmin, ...excludedOptions);
        break;
      default: break;
    }
  },

  setVisibilityOfRunOnAdminCheckbox(show) {
    if (show) $('#aRunOnAdminDB').show();
    else $('#aRunOnAdminDB').hide();
  },

  Admin: {
    executeAddUserQuery() {
      const options = QueryingOptions.getOptions(Enums.ADD_USER_OPTIONS);
      const username = $('#inputAddUserUsername').val();
      const password = $('#inputAddUserPassword').val();

      if (!checkStringInput(username, 'username')) return;
      if (!checkStringInput(password, 'password')) return;
      if (!checkErrorField(options)) return;

      const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;
      proceedQueryExecution({
        methodName: 'addUser',
        args: { username, password, runOnAdminDB, options }
      });
    },

    executeBuildInfoQuery() {
      proceedQueryExecution({
        methodName: 'buildInfo'
      });
    },

    executeCommandQuery() {
      const command = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#divCommand')));
      const options = QueryingOptions.getOptions(Enums.COMMAND_OPTIONS);

      if (!checkErrorField(command, 'command')) return;

      const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

      proceedQueryExecution({
        methodName: 'command',
        args: { command, runOnAdminDB, options }
      });
    },

    executeListDatabasesQuery() {
      proceedQueryExecution({
        methodName: 'listDatabases'
      });
    },

    executePingQuery() {
      proceedQueryExecution({
        methodName: 'ping'
      });
    },

    executeProfilingInfoQuery() {
      proceedQueryExecution({
        methodName: 'profilingInfo'
      });
    },

    executeRemoveUserQuery() {
      const username = $('#inputAddUserUsername').val();

      if (!checkStringInput(username, 'username')) return;

      const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;
      proceedQueryExecution({
        methodName: 'removeUser',
        args: { username, runOnAdminDB }
      });
    },

    executeReplSetGetStatusQuery() {
      proceedQueryExecution({
        methodName: 'replSetGetStatus'
      });
    },

    executeServerInfoQuery() {
      proceedQueryExecution({
        methodName: 'serverInfo'
      });
    },

    executeServerStatusQuery() {
      proceedQueryExecution({
        methodName: 'serverStatus'
      });
    },

    executeSetProfilingLevelQuery() {
      proceedQueryExecution({
        methodName: 'setProfilingLevel',
        args: { level: $('#cmbLevel').find('option:selected').text() }
      });
    },

    executeValidateCollectionQuery() {
      const collectionName = $('#inputValidateCollection').val();
      const options = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#divOptions')));

      if (!checkStringInput(collectionName, 'collection_name')) return;
      if (!checkErrorField(options, 'options')) return;

      proceedQueryExecution({
        methodName: 'validateCollection',
        args: { collectionName, options }
      });
    }
  },

  Collection: {
    Aggregate: {
      execute(historyParams) {
        const pipeline = getFromHistoryOrEditor(historyParams, $('#divPipeline'), 'pipeline');
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.AGGREGATE_OPTIONS);

        if (!checkErrorField(pipeline, 'pipeline')) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution({
          methodName: 'aggregate',
          args: { pipeline, options },
          isAdmin: false,
          queryParams: { pipeline, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams && query.queryParams.pipeline) renderCodeMirror($('#divPipeline'), query.queryParams.pipeline);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.AGGREGATE_OPTIONS,
          optionCombo: $('#cmbAggregateOptions')
        });
      }
    },

    BulkWrite: {
      execute(historyParams) {
        const operations = getFromHistoryOrEditor(historyParams, $('#divBulkWrite'));
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.BULK_WRITE_OPTIONS);

        if (!checkErrorField(operations, 'operations')) return;

        proceedQueryExecution({
          methodName: 'bulkWrite',
          args: { operations, options },
          isAdmin: false,
          queryParams: { selector: operations, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams && query.queryParams.selector) renderCodeMirror($('#divBulkWrite'), query.queryParams.selector);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.BULK_WRITE_OPTIONS,
          optionCombo: $('#cmbBulkWriteOptions')
        });
      }
    },

    Count: {
      execute(historyParams) {
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.COUNT_OPTIONS);

        if (!checkErrorField(selector, 'selector')) return;

        proceedQueryExecution({
          methodName: 'count',
          args: { selector, options },
          isAdmin: false,
          queryParams: { selector, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams && query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.COUNT_OPTIONS,
          optionCombo: $('#cmbCountOptions')
        });
      }
    },

    CreateIndex: {
      execute(historyParams) {
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.CREATE_INDEX_OPTIONS);
        const fields = getFromHistoryOrEditor(historyParams, $('#divFields'), 'fields');

        if (!checkErrorField(fields, 'fields')) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution({
          methodName: 'createIndex',
          args: { fields, options },
          isAdmin: false,
          queryParams: { fields, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.fields) renderCodeMirror($('#divFields'), query.queryParams.fields);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.CREATE_INDEX_OPTIONS,
          optionCombo: $('#cmbCreateIndexOptions')
        });
      }
    },

    Delete: {
      execute(historyParams) {
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector, 'selector')) return;

        proceedQueryExecution({
          methodName: 'delete',
          args: { selector },
          isAdmin: false,
          queryParams: { selector },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
      }
    },

    Distinct: {
      execute(historyParams) {
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        const fieldName = historyParams ? historyParams.fieldName : $('#inputField').val();
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.DISTINCT_OPTIONS);

        if (!checkErrorField(selector, 'selector')) return;

        proceedQueryExecution({
          methodName: 'distinct',
          args: { selector, fieldName, options },
          isAdmin: false,
          queryParams: { selector, fieldName, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.fieldName) renderInput($('#inputField'), query.queryParams.fieldName);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.DISTINCT_OPTIONS,
          optionCombo: $('#cmbDistinctOptions')
        });
      }
    },

    DropIndex: {
      execute(historyParams) {
        const indexName = historyParams ? historyParams.indexName : $('#inputIndexName').val();

        proceedQueryExecution({
          methodName: 'dropIndex',
          args: { indexName },
          isAdmin: false,
          queryParams: { indexName },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.indexName) renderInput($('#inputIndexName'), query.queryParams.indexName);
      }
    },

    Find: {
      proceedFindQuery(selector, cursorOptions, saveHistory, exportFormat) {
        if (exportFormat) {
          const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
          window.open(`export?format=${exportFormat}&
    selectedCollection=${selectedCollection}&selector=${JSON.stringify(selector)}&cursorOptions=${JSON.stringify(cursorOptions)}&sessionId=${Meteor.default_connection._lastSessionId}`);

          Notification.stop();
        } else {
          const executeExplain = $('#inputExecuteExplain').iCheck('update')[0].checked;
          proceedQueryExecution({
            methodName: 'find',
            args: { selector, cursorOptions, executeExplain },
            isAdmin: false,
            queryParams: { selector, cursorOptions, executeExplain },
            saveHistory
          });
        }
      },
      checkAverageSize(count, avgObjSize, maxAllowedFetchSize) {
        const totalBytes = (count * avgObjSize) / (1024 * 1024);
        const totalMegabytes = Math.round(totalBytes * 100) / 100;

        if (totalMegabytes > maxAllowedFetchSize) {
          Notification.error('exceeds-max-size', null, { maxAllowedFetchSize, totalMegabytes });
          return false;
        }

        return true;
      },
      execute(historyParams, exportFormat) {
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const maxAllowedFetchSize = Math.round(ReactivityProvider.findOne(ReactivityProvider.types.Settings).maxAllowedFetchSize * 100) / 100;
        const cursorOptions = historyParams ? historyParams.cursorOptions : QueryingOptions.getOptions(Enums.CURSOR_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector, 'selector')) return;
        if (!checkErrorField(cursorOptions)) return;

        // max allowed fetch size  != 0 and there's no project option, check for size
        if (maxAllowedFetchSize && maxAllowedFetchSize !== 0 && !(Enums.CURSOR_OPTIONS.PROJECT in cursorOptions)) {
          // get stats to calculate fetched documents size from avgObjSize (stats could be changed, therefore we can't get it from html )
          Communicator.call({
            methodName: 'stats',
            args: { selectedCollection },
            callback: (statsError, statsResult) => {
              if (statsError || statsResult.error || !(statsResult.result.avgObjSize)) this.proceedFindQuery(selector, cursorOptions, (!historyParams), exportFormat);
              else if (Enums.CURSOR_OPTIONS.LIMIT in cursorOptions) {
                const count = cursorOptions.limit;
                if (this.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                  this.proceedFindQuery(selector, cursorOptions, (!historyParams), exportFormat);
                }
              } else {
                Communicator.call({
                  methodName: 'count',
                  args: { selectedCollection, selector },
                  callback: (err, result) => {
                    if (err || result.error) this.proceedFindQuery(selector, cursorOptions, (!historyParams), exportFormat);
                    else {
                      const count = result.result;
                      if (this.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                        this.proceedFindQuery(selector, cursorOptions, (!historyParams), exportFormat);
                      }
                    }
                  }
                });
              }
            }
          });
        } else this.proceedFindQuery(selector, cursorOptions, (!historyParams), exportFormat);
      },

      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        renderBoolean($('#divExecuteExplain'), query.queryParams.executeExplain);

        renderOptionsArray({
          options: query.queryParams.cursorOptions,
          optionEnum: Enums.CURSOR_OPTIONS,
          optionCombo: $('#cmbFindCursorOptions')
        });
      }
    },

    FindOne: {
      execute(historyParams) {
        const cursorOptions = historyParams ? historyParams.cursorOptions : QueryingOptions.getOptions(Enums.CURSOR_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector, 'selector')) return;
        if (!checkErrorField(cursorOptions)) return;

        proceedQueryExecution({
          methodName: 'findOne',
          args: { selector, cursorOptions },
          isAdmin: false,
          queryParams: { selector, cursorOptions },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);

        renderOptionsArray({
          options: query.queryParams.cursorOptions,
          optionEnum: Enums.CURSOR_OPTIONS,
          optionCombo: $('#cmbFindOneCursorOptions')
        });
      }
    },

    FindOneAndDelete: {
      execute(historyParams) {
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.FINDONE_MODIFY_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector, 'selector')) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution({
          methodName: 'findOneAndDelete',
          args: { selector, options },
          isAdmin: false,
          queryParams: { selector, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.FINDONE_MODIFY_OPTIONS,
          optionCombo: $('#cmbFindOneModifyOptions')
        });
      }
    },

    FindOneAndReplace: {
      execute(historyParams) {
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.FINDONE_MODIFY_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        const replaceObject = getFromHistoryOrEditor(historyParams, $('#divReplacement'), 'replaceObject');

        if (!checkErrorField(selector, 'selector')) return;
        if (!checkErrorField(replaceObject, 'replacement')) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution({
          methodName: 'findOneAndReplace',
          args: { selector, replaceObject, options },
          isAdmin: false,
          queryParams: { selector, replaceObject, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.replaceObject) renderCodeMirror($('#divReplacement'), query.queryParams.replaceObject);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.FINDONE_MODIFY_OPTIONS,
          optionCombo: $('#cmbFindOneModifyOptions')
        });
      }
    },

    FindOneAndUpdate: {
      execute(historyParams) {
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.FINDONE_MODIFY_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        let setObject = getFromHistoryOrEditor(historyParams, $('#divSet'), 'setObject');

        if (!checkErrorField(selector, 'selector')) return;
        if (!checkErrorField(setObject, 'set')) return;
        if (!setObject.$set) setObject = { $set: setObject };

        if (options.ERROR) {
          Notification.error(options.ERROR);
          return;
        }

        proceedQueryExecution({
          methodName: 'findOneAndUpdate',
          args: { selector, setObject, options },
          isAdmin: false,
          queryParams: { selector, setObject, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.setObject) renderCodeMirror($('#divSet'), query.queryParams.setObject);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.FINDONE_MODIFY_OPTIONS,
          optionCombo: $('#cmbFindOneModifyOptions')
        });
      }
    },

    GeoHayStackSearch: {
      execute(historyParams) {
        proceedGeoQueryExecution(historyParams, 'geoHaystackSearch', Enums.GEO_HAYSTACK_SEARCH_OPTIONS);
      },
      render(query) {
        renderGeoQuery(query, Enums.GEO_HAYSTACK_SEARCH_OPTIONS, $('#cmbGeoHaystackSearchOptions'));
      }
    },

    GeoNear: {
      execute(historyParams) {
        proceedGeoQueryExecution(historyParams, 'geoNear', Enums.GEO_NEAR_OPTIONS);
      },
      render(query) {
        renderGeoQuery(query, Enums.GEO_NEAR_OPTIONS, $('#cmbGeoNearOptions'));
      }
    },

    Group: {
      execute(historyParams) {
        let keys = historyParams ? JSON.stringify(historyParams.keys) : UIComponents.Editor.getCodeMirrorValue($('#divKeys'));
        const condition = getFromHistoryOrEditor(historyParams, $('#divCondition'), 'condition');
        const initial = getFromHistoryOrEditor(historyParams, $('#divInitial'), 'initial');
        const reduce = getFromHistoryOrEditorAsFunction(historyParams, $('#divReduce'), 'reduce');
        const finalize = getFromHistoryOrEditorAsFunction(historyParams, $('#divFinalize'), 'finalize');
        const command = $('#inputCommand').iCheck('update')[0].checked;

        if (keys.startsWith('function')) {
          keys = Helper.convertStrToFunction(keys);
          if (!keys) {
            Notification.error('syntax-error-keys-function');
            return;
          }
        } else {
          keys = ExtendedJSON.convertAndCheckJSON(keys);
          if (keys.ERROR) {
            Notification.error('syntax-error-keys', null, { error: keys.ERROR });
            return;
          }
        }

        if (!checkErrorField(condition, 'condition')) return;
        if (!checkErrorField(initial, 'initial')) return;
        if (!checkFunction(reduce, 'reduce')) return;
        if (!checkFunction(finalize, 'finalize')) return;

        proceedQueryExecution({
          methodName: 'group',
          args: { keys, condition, initial, reduce, finalize, command },
          isAdmin: false,
          queryParams: { keys, condition, initial, reduce, finalize, command },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.keys) {
          setTimeout(() => {
            const divKeys = $('#divKeys');
            if (query.queryParams.keys.startsWith('function')) UIComponents.Editor.setCodeMirrorValue(divKeys, query.queryParams.keys);
            else {
              const str = JSON.stringify(query.queryParams.keys, null, 1).replace(/\\n/g, '\n');
              UIComponents.Editor.setCodeMirrorValue(divKeys, str.substring(1, str.length - 1));
            }
          }, 100);
        }

        if (query.queryParams.condition) renderCodeMirror($('#divCondition'), query.queryParams.condition);
        if (query.queryParams.initial) renderCodeMirror($('#divInitial'), query.queryParams.initial);
        if (query.queryParams.reduce) renderFunction($('#divReduce'), query.queryParams.reduce);
        if (query.queryParams.finalize) renderFunction($('#divFinalize'), query.queryParams.finalize);
        if (query.queryParams.command) renderBoolean($('#divCommand'), query.queryParams.options.command);
      }
    },

    IndexInformation: {
      execute(historyParams) {
        const fullVal = historyParams ? historyParams.full : $('#divFullInformation').iCheck('update')[0].checked;

        proceedQueryExecution({
          methodName: 'indexInformation',
          args: { isFull: fullVal },
          isAdmin: false,
          queryParams: { full: fullVal },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        setTimeout(() => {
          $('#divFullInformation').iCheck(query.queryParams.full ? 'check' : 'uncheck');
        }, 100);
      }
    },

    InsertMany: {
      execute(historyParams) {
        const docs = getFromHistoryOrEditor(historyParams, $('#divDocs'), 'docs');
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.INSERT_MANY_OPTIONS);

        if (!checkErrorField(docs, 'docs')) return;

        proceedQueryExecution({
          methodName: 'insertMany',
          args: { docs, options },
          isAdmin: false,
          queryParams: { docs, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.docs) renderCodeMirror($('#divDocs'), query.queryParams.docs);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.INSERT_MANY_OPTIONS,
          optionCombo: $('#cmbInsertManyOptions')
        });
      }
    },

    IsCapped: {
      execute() {
        proceedQueryExecution({
          methodName: 'isCapped',
          isAdmin: false
        });
      }
    },

    MapReduce: {
      execute(historyParams) {
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.MAP_REDUCE_OPTIONS);
        const map = getFromHistoryOrEditorAsFunction(historyParams, $('#divMap'), 'map');
        const reduce = getFromHistoryOrEditorAsFunction(historyParams, $('#divReduce'), 'reduce');

        if (!checkFunction(reduce, 'reduce')) return;
        if (!checkFunction(map, 'map')) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution({
          methodName: 'mapReduce',
          args: { map, reduce, options },
          isAdmin: false,
          queryParams: { map, reduce, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        if (query.queryParams.map) renderFunction($('#divMap'), query.queryParams.map);
        if (query.queryParams.reduce) renderFunction($('#divReduce'), query.queryParams.reduce);

        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.MAP_REDUCE_OPTIONS,
          optionCombo: $('#cmbMapReduceOptions')
        });
      }
    },

    Options: {
      execute(historyParams) {
        proceedQueryExecution({
          methodName: 'options',
          isAdmin: false,
          saveHistory: (!historyParams)
        });
      }
    },

    ReIndex: {
      execute(historyParams) {
        proceedQueryExecution({
          methodName: 'reIndex',
          isAdmin: false,
          saveHistory: (!historyParams)
        });
      }
    },

    Rename: {
      execute() {
        const options = QueryingOptions.getOptions(Enums.RENAME_OPTIONS);
        const newName = $('#inputNewName').val();

        if (newName) {
          proceedQueryExecution({
            methodName: 'rename',
            args: { newName, options },
            successCallback: () => {
              Notification.success('saved-successfully');
              CollectionUtil.renderCollectionNames();
            },
            isAdmin: false
          });
        } else Notification.error('name-required');
      }
    },

    Stats: {
      execute(historyParams) {
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.STATS_OPTIONS);

        proceedQueryExecution({
          methodName: 'stats',
          args: { options },
          isAdmin: false,
          queryParams: { options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        renderOptionsArray({
          options: query.queryParams.options,
          optionEnum: Enums.STATS_OPTIONS,
          optionCombo: $('#cmbStatsOptions')
        });
      }
    },

    UpdateMany: {
      execute(historyParams) {
        proceedUpdateQueryExecution(historyParams, 'updateMany');
      },
      render(query) {
        renderUpdateQuery(query, 'cmbUpdateManyOptions');
      }
    },

    UpdateOne: {
      execute(historyParams) {
        proceedUpdateQueryExecution(historyParams, 'updateOne');
      },
      render(query) {
        renderUpdateQuery(query, 'cmbUpdateOneOptions');
      }
    }
  }
};

export default new Querying();
