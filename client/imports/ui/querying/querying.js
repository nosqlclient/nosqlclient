import { Meteor } from 'meteor/meteor';
import { Enums, Notification, ExtendedJSON, UIComponents, SessionManager, ErrorHandler } from '/client/imports/modules';
import { QueryRender, QueryingOptions, CollectionUtil } from '/client/imports/ui';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';

const Querying = function () {};

const initOptions = function (combobox, enumValue, showRunOnAdmin) {
  if (!combobox) return;
  $.each(Helper.sortObjectByKey(enumValue), (key, value) => {
    combobox.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  combobox.chosen();
  QueryRender.setOptionsComboboxChangeEvent(combobox);

  this.setVisibilityOfRunOnAdminCheckbox(showRunOnAdmin);
};

const proceedQueryExecution = function (methodName, args, isAdmin = true, queryParams, saveHistory) {
  Communicator.call({
    methodName,
    args,
    callback: (err, result) => {
      QueryRender.renderAfterQueryExecution(err, result, isAdmin, methodName, queryParams, saveHistory);
    }
  });
};

const renderCodeMirror = function (divSelector, value) {
  Meteor.setTimeout(() => {
    UIComponents.Editor.setCodeMirrorValue(divSelector, JSON.stringify(value, null, 1));
  }, 100);
};

const renderFunction = function (divSelector, val) {
  Meteor.setTimeout(() => {
    const str = JSON.stringify(val, null, 1).replace(/\\n/g, '\n');
    UIComponents.Editor.setCodeMirrorValue(divSelector, str.substring(1, str.length - 1));
  }, 100);
};

const renderInput = function (inputField, val) {
  Meteor.setTimeout(() => {
    inputField.val(val);
  }, 100);
};

const renderBoolean = function (divSelector, val) {
  Meteor.setTimeout(() => {
    divSelector.iCheck(val ? 'check' : 'uncheck');
  }, 100);
};

const checkStringInput = function (variable, name) {
  if (!variable) {
    Notification.error(`${name} can not be empty`);
    return false;
  }

  return true;
};

const checkErrorField = function (obj) {
  if (obj.ERROR) {
    Notification.error(obj.ERROR);
    return false;
  }

  return true;
};

const checkFunction = function (obj, fieldName) {
  if (!obj) {
    Notification.error(`Syntax error on ${fieldName}, not a valid function`);
    return false;
  }

  return true;
};

const getFromHistoryOrEditor = function (historyParams, divSelector, historyField = 'selector') {
  let result;
  if (historyParams) result = ExtendedJSON.convertAndCheckJSON(JSON.stringify(historyParams[historyField]));
  else result = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue(divSelector));

  return result;
};

const getFromHistoryOrEditorAsFunction = function (historyParams, divSelector, historyField) {
  let result;
  if (historyParams) result = JSON.stringify(historyParams[historyField]).parseFunction();
  else result = UIComponents.Editor.getCodeMirrorValue(divSelector).parseFunction();

  return result;
};

const renderOptionsArray = function (options, optionEnum, cmbSelector) {
  const optionsArray = [];
  Object.keys(options).forEach((property) => {
    if ((_.invert(optionEnum))[property]) optionsArray.push((_.invert(optionEnum))[property]);
  });

  Meteor.setTimeout(() => {
    cmbSelector.val(optionsArray).trigger('chosen:updated');
    SessionManager.set(SessionManager.strSessionSelectedOptions, optionsArray);
  }, 100);
  return optionsArray;
};

Querying.prototype = {
  initOptions(optionEnum, showRunOnAdmin) {
    switch (optionEnum) {
      case Enums.ADD_USER_OPTIONS:
        initOptions.call(this, $('#cmbAddUserOptions'), Enums.ADD_USER_OPTIONS, showRunOnAdmin);
        break;
      case Enums.COMMAND_OPTIONS:
        initOptions.call(this, $('#cmbCommandOptions'), Enums.COMMAND_OPTIONS, showRunOnAdmin);
        break;
      case Enums.PROFILING_LEVELS:
        initOptions.call(this, $('#cmbLevel'), Enums.PROFILING_LEVELS, showRunOnAdmin);
        break;
      case Enums.AGGREGATE_OPTIONS:
        initOptions.call(this, $('#cmbAggregateOptions'), Enums.AGGREGATE_OPTIONS, showRunOnAdmin);
        break;
      case Enums.BULK_WRITE_OPTIONS:
        initOptions.call(this, $('#cmbBulkWriteOptions'), Enums.BULK_WRITE_OPTIONS, showRunOnAdmin);
        break;
      case Enums.COUNT_OPTIONS:
        initOptions.call(this, $('#cmbCountOptions'), Enums.COUNT_OPTIONS, showRunOnAdmin);
        break;
      case Enums.DISTINCT_OPTIONS:
        initOptions.call(this, $('#cmbDistinctOptions'), Enums.COMMAND_OPTIONS, showRunOnAdmin);
        break;
      case Enums.CREATE_INDEX_OPTIONS:
        initOptions.call(this, $('#cmbCreateIndexOptions'), Enums.CREATE_INDEX_OPTIONS, showRunOnAdmin);
        break;
      case Enums.CURSOR_OPTIONS:
        initOptions.call(this, $('#cmbFindCursorOptions'), Enums.CURSOR_OPTIONS, showRunOnAdmin);
        initOptions.call(this, $('#cmbFindOneCursorOptions'), Enums.CURSOR_OPTIONS, showRunOnAdmin);
        break;
      case Enums.GEO_HAYSTACK_SEARCH_OPTIONS:
        initOptions.call(this, $('#cmbGeoHaystackSearchOptions'), Enums.GEO_HAYSTACK_SEARCH_OPTIONS, showRunOnAdmin);
        break;
      case Enums.GEO_NEAR_OPTIONS:
        initOptions.call(this, $('#cmbGeoNearOptions'), Enums.GEO_NEAR_OPTIONS, showRunOnAdmin);
        break;
      case Enums.INSERT_MANY_OPTIONS:
        initOptions.call(this, $('#cmbInsertManyOptions'), Enums.INSERT_MANY_OPTIONS, showRunOnAdmin);
        break;
      case Enums.MAP_REDUCE_OPTIONS:
        initOptions.call(this, $('#cmbMapReduceOptions'), Enums.MAP_REDUCE_OPTIONS, showRunOnAdmin);
        break;
      case Enums.RENAME_OPTIONS:
        initOptions.call(this, $('#cmbRenameOptions'), Enums.RENAME_OPTIONS, showRunOnAdmin);
        break;
      case Enums.STATS_OPTIONS:
        initOptions.call(this, $('#cmbStatsOptions'), Enums.STATS_OPTIONS, showRunOnAdmin);
        break;
      case Enums.UPDATE_OPTIONS:
        initOptions.call(this, $('#cmbUpdateManyOptions'), Enums.UPDATE_OPTIONS, showRunOnAdmin);
        initOptions.call(this, $('#cmbUpdateOneOptions'), Enums.UPDATE_OPTIONS, showRunOnAdmin);
        break;
      case Enums.FINDONE_MODIFY_OPTIONS:
        initOptions.call(this, $('#cmbFindOneModifyOptions'), Enums.UPDATE_OPTIONS, showRunOnAdmin);
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
      Notification.start('#btnExecuteAdminQuery');

      const options = QueryingOptions.getOptions(Enums.ADD_USER_OPTIONS);
      const username = $('#inputAddUserUsername').val();
      const password = $('#inputAddUserPassword').val();

      if (!checkStringInput(username, 'username')) return;
      if (!checkStringInput(password, 'password')) return;
      if (!checkErrorField(options)) return;

      const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;
      proceedQueryExecution('addUser', { username, password, runOnAdminDB, options });
    },

    executeBuildInfoQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('buildInfo');
    },

    executeCommandQuery() {
      Notification.start('#btnExecuteAdminQuery');
      const command = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#divCommand')));
      const options = QueryingOptions.getOptions(Enums.COMMAND_OPTIONS);

      if (!checkErrorField(command)) return;

      const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;
      proceedQueryExecution('command', { command, runOnAdminDB, options });
    },

    executeListDatabasesQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('listDatabases');
    },

    executePingQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('ping');
    },

    executeProfilingInfoQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('profilingInfo');
    },

    executeRemoveUserQuery() {
      Notification.start('#btnExecuteAdminQuery');
      const username = $('#inputAddUserUsername').val();

      if (!checkStringInput(username, 'username')) return;

      const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;
      proceedQueryExecution('removeUser', { username, runOnAdminDB });
    },

    executeReplSetGetStatusQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('replSetGetStatus');
    },

    executeServerInfoQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('serverInfo');
    },

    executeServerStatusQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('serverStatus');
    },

    executeSetProfilingLevelQuery() {
      Notification.start('#btnExecuteAdminQuery');
      proceedQueryExecution('setProfilingLevel', { level: $('#cmbLevel').find('option:selected').text() });
    },

    executeValidateCollectionQuery() {
      Notification.start('#btnExecuteAdminQuery');
      const collectionName = $('#inputValidateCollection').val();
      const options = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#divOptions')));

      if (!checkStringInput(collectionName, 'collectionName')) return;
      if (!checkErrorField(options)) return;

      proceedQueryExecution('validateCollection', { collectionName, options });
    }
  },

  Collection: {
    Aggregate: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const pipeline = getFromHistoryOrEditor(historyParams, $('#divPipeline'), 'pipeline');
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.AGGREGATE_OPTIONS);

        if (!checkErrorField(pipeline)) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution('aggregate', { selectedCollection, pipeline, options }, false, { pipeline, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams && query.queryParams.pipeline) renderCodeMirror($('#divPipeline'), query.queryParams.pipeline);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.AGGREGATE_OPTIONS, $('#cmbAggregateOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.AGGREGATE_OPTIONS));
              if (option === inverted.collation) UIComponents.Editor.setCodeMirrorValue($('#divCollation'), JSON.stringify(query.queryParams.options.collation, null, 1));
              if (option === inverted.bypassDocumentValidation) $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
              if (option === inverted.allowDiskUse) $('#divAllowDiskUse').iCheck(query.queryParams.options.allowDiskUse ? 'check' : 'uncheck');
              if (option === inverted.explain) $('#divExecuteExplain').iCheck(query.queryParams.options.explain ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    BulkWrite: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const operations = getFromHistoryOrEditor(historyParams, $('#divBulkWrite'));
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.BULK_WRITE_OPTIONS);

        if (!checkErrorField(operations)) return;

        proceedQueryExecution('bulkWrite', { selectedCollection, operations, options }, false, { selector: operations, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams && query.queryParams.selector) renderCodeMirror($('#divBulkWrite'), query.queryParams.selector);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.BULK_WRITE_OPTIONS, $('#cmbBulkWriteOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.BULK_WRITE_OPTIONS));
              if (option === inverted.ordered) $('#inputOrdered').val(query.queryParams.options.ordered);
              if (option === inverted.bypassDocumentValidation) $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    Count: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.COUNT_OPTIONS);

        if (!checkErrorField(selector)) return;

        proceedQueryExecution('count', { selectedCollection, selector, options }, false, { selector, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams && query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.COUNT_OPTIONS, $('#cmbCountOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.COUNT_OPTIONS));
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
              if (option === inverted.limit) $('#inputLimit').val(query.queryParams.options.limit);
              if (option === inverted.skip) $('#inputSkip').val(query.queryParams.options.skip);
            }
          }, 200);
        }
      }
    },

    CreateIndex: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.CREATE_INDEX_OPTIONS);
        const fields = getFromHistoryOrEditor(historyParams, $('#divFields'), 'fields');

        if (!checkErrorField(fields)) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution('createIndex', { selectedCollection, fields, options }, false, { fields, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.fields) renderCodeMirror($('#divFields'), query.queryParams.fields);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.CREATE_INDEX_OPTIONS, $('#cmbCreateIndexOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.CREATE_INDEX_OPTIONS));
              if (option === inverted.collation) UIComponents.Editor.setCodeMirrorValue($('#divCollation'), JSON.stringify(query.queryParams.options.collation, null, 1));
              if (option === inverted.max) UIComponents.Editor.setCodeMirrorValue($('#divMax'), JSON.stringify(query.queryParams.options.max, null, 1));
              if (option === inverted.min) UIComponents.Editor.setCodeMirrorValue($('#divMin'), JSON.stringify(query.queryParams.options.min, null, 1));
              if (option === inverted.unique) $('#divUnique').iCheck(query.queryParams.options.unique ? 'check' : 'uncheck');
              if (option === inverted.dropDups) $('#divDropDups').iCheck(query.queryParams.options.dropDups ? 'check' : 'uncheck');
              if (option === inverted.sparse) $('#divSparse').iCheck(query.queryParams.options.sparse ? 'check' : 'uncheck');
              if (option === inverted.background) $('#divBackground').iCheck(query.queryParams.options.background ? 'check' : 'uncheck');
              if (option === inverted.name) $('#inputIndexName').val(query.queryParams.options.name);
              if (option === inverted.expireAfterSeconds) $('#inputExpireAfterSeconds').val(query.queryParams.options.expireAfterSeconds);
            }
          }, 200);
        }
      }
    },

    Delete: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector)) return;

        proceedQueryExecution('delete', { selectedCollection, selector }, false, { selector }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
      }
    },

    Distinct: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        const fieldName = historyParams ? historyParams.fieldName : $('#inputField').val();
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.DISTINCT_OPTIONS);

        if (!checkErrorField(selector)) return;

        proceedQueryExecution('distinct', { selectedCollection, selector, fieldName, options }, false, { selector, fieldName, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.fieldName) renderInput($('#inputField'), query.queryParams.fieldName);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.DISTINCT_OPTIONS, $('#cmbDistinctOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.DISTINCT_OPTIONS));
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
            }
          }, 200);
        }
      }
    },

    DropIndex: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const indexName = historyParams ? historyParams.indexName : $('#inputIndexName').val();

        proceedQueryExecution('dropIndex', { selectedCollection, indexName }, false, { indexName }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.indexName) renderInput($('#inputIndexName'), query.queryParams.indexName);
      }
    },

    Find: {
      proceedFindQuery(selectedCollection, selector, cursorOptions, saveHistory, exportFormat) {
        if (exportFormat) {
          window.open(`export?format=${exportFormat}&
    selectedCollection=${selectedCollection}&selector=${JSON.stringify(selector)}&cursorOptions=${JSON.stringify(cursorOptions)}&sessionId=${Meteor.default_connection._lastSessionId}`);

          Notification.stop();
        } else {
          const executeExplain = $('#inputExecuteExplain').iCheck('update')[0].checked;
          proceedQueryExecution('find', { selectedCollection, selector, cursorOptions, executeExplain }, false, { selector, cursorOptions, executeExplain }, saveHistory);
        }
      },
      checkAverageSize(count, avgObjSize, maxAllowedFetchSize) {
        const totalBytes = (count * avgObjSize) / (1024 * 1024);
        const totalMegabytes = Math.round(totalBytes * 100) / 100;

        if (totalMegabytes > maxAllowedFetchSize) {
          Notification.error(`The fetched document size (average): ${totalMegabytes} MB, exceeds maximum allowed size (${maxAllowedFetchSize} MB), please use LIMIT, SKIP options.`);
          return false;
        }

        return true;
      },
      execute(historyParams, exportFormat) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const maxAllowedFetchSize = Math.round(ReactivityProvider.findOne(ReactivityProvider.types.Settings).maxAllowedFetchSize * 100) / 100;
        const cursorOptions = historyParams ? historyParams.cursorOptions : QueryingOptions.getOptions(Enums.CURSOR_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector)) return;
        if (!checkErrorField(cursorOptions)) return;

        // max allowed fetch size  != 0 and there's no project option, check for size
        if (maxAllowedFetchSize && maxAllowedFetchSize !== 0 && !(Enums.CURSOR_OPTIONS.PROJECT in cursorOptions)) {
          // get stats to calculate fetched documents size from avgObjSize (stats could be changed, therefore we can't get it from html )
          Communicator.call({
            methodName: 'stats',
            args: { selectedCollection },
            callback: (statsError, statsResult) => {
              if (statsError || statsResult.error || !(statsResult.result.avgObjSize)) this.proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
              else if (Enums.CURSOR_OPTIONS.LIMIT in cursorOptions) {
                const count = cursorOptions.limit;
                if (this.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                  this.proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
                }
              } else {
                Communicator.call({
                  methodName: 'count',
                  args: { selectedCollection, selector },
                  callback: (err, result) => {
                    if (err || result.error) this.proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
                    else {
                      const count = result.result;
                      if (this.checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                        this.proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
                      }
                    }
                  }
                });
              }
            }
          });
        } else this.proceedFindQuery(selectedCollection, selector, cursorOptions, false, exportFormat);
      },

      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);

        if (query.queryParams.cursorOptions) {
          const optionsArray = renderOptionsArray(query.queryParams.cursorOptions, Enums.CURSOR_OPTIONS, $('#cmbFindCursorOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.CURSOR_OPTIONS));
              if (option === inverted.project) UIComponents.Editor.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.cursorOptions.project, null, 1));
              if (option === inverted.skip) $('#inputSkip').val(query.queryParams.cursorOptions.skip);
              if (option === inverted.sort) UIComponents.Editor.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.cursorOptions.sort, null, 1));
              if (option === inverted.limit) $('#inputLimit').val(query.queryParams.cursorOptions.limit);
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.cursorOptions.maxTimeMS);
              if (option === inverted.max) UIComponents.Editor.setCodeMirrorValue($('#divMax'), JSON.stringify(query.queryParams.cursorOptions.max, null, 1));
              if (option === inverted.min) UIComponents.Editor.setCodeMirrorValue($('#divMin'), JSON.stringify(query.queryParams.cursorOptions.min, null, 1));
            }
          }, 200);
        }

        renderBoolean($('#divExecuteExplain'), query.queryParams.executeExplain);
      }
    },

    FindOne: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const cursorOptions = historyParams ? historyParams.cursorOptions : QueryingOptions.getOptions(Enums.CURSOR_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector)) return;
        if (!checkErrorField(cursorOptions)) return;

        proceedQueryExecution('findOne', { selectedCollection, selector, cursorOptions }, false, { selector, cursorOptions }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);

        if (query.queryParams.cursorOptions) {
          const optionsArray = renderOptionsArray(query.queryParams.cursorOptions, Enums.CURSOR_OPTIONS, $('#cmbFindOneCursorOptions'));
          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.CURSOR_OPTIONS));
              if (option === inverted.project) UIComponents.Editor.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.cursorOptions.project, null, 1));
              if (option === inverted.skip) $('#inputSkip').val(query.queryParams.cursorOptions.skip);
              if (option === inverted.sort) UIComponents.Editor.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.cursorOptions.sort, null, 1));
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.cursorOptions.maxTimeMS);
              if (option === inverted.max) UIComponents.Editor.setCodeMirrorValue($('#divMax'), JSON.stringify(query.queryParams.cursorOptions.max, null, 1));
              if (option === inverted.min) UIComponents.Editor.setCodeMirrorValue($('#divMin'), JSON.stringify(query.queryParams.cursorOptions.min, null, 1));
            }
          }, 200);
        }
      }
    },

    FindOneAndDelete: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.FINDONE_MODIFY_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

        if (!checkErrorField(selector)) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution('findOneAndDelete', { selectedCollection, selector, options }, false, { selector, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.FINDONE_MODIFY_OPTIONS, $('#cmbFindOneModifyOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.FINDONE_MODIFY_OPTIONS));
              if (option === inverted.projection) UIComponents.Editor.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.options.projection, null, 1));
              if (option === inverted.sort) UIComponents.Editor.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.options.sort, null, 1));
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
            }
          }, 200);
        }
      }
    },

    FindOneAndReplace: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.FINDONE_MODIFY_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        const replaceObject = getFromHistoryOrEditor(historyParams, $('#divReplacement'), 'replaceObject');

        if (!checkErrorField(selector)) return;
        if (!checkErrorField(replaceObject)) return;
        if (!checkErrorField(options)) return;

        proceedQueryExecution('findOneAndReplace', { selectedCollection, selector, replaceObject, options }, false, { selector, replaceObject, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.replaceObject) renderCodeMirror($('#divReplacement'), query.queryParams.replaceObject);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.FINDONE_MODIFY_OPTIONS, $('#cmbFindOneModifyOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.FINDONE_MODIFY_OPTIONS));
              if (option === inverted.projection) UIComponents.Editor.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.options.projection, null, 1));
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
              if (option === inverted.sort) UIComponents.Editor.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.options.sort, null, 1));
              if (option === inverted.upsert) $('#divUpsert').iCheck(query.queryParams.options.upsert ? 'check' : 'uncheck');
              if (option === inverted.returnOriginal) $('#divReturnOriginal').iCheck(query.queryParams.options.returnOriginal ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    FindOneAndUpdate: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.FINDONE_MODIFY_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        let setObject = getFromHistoryOrEditor(historyParams, $('#divSet'), 'setObject');

        if (!checkErrorField(selector)) return;
        if (!checkErrorField(setObject)) return;
        if (!setObject.$set) setObject = { $set: setObject };

        if (options.ERROR) {
          Notification.error(options.ERROR);
          return;
        }

        proceedQueryExecution('findOneAndUpdate', { selectedCollection, selector, setObject, options }, false, { selector, setObject, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.setObject) renderCodeMirror($('#divSet'), query.queryParams.setObject);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.FINDONE_MODIFY_OPTIONS, $('#cmbFindOneModifyOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.FINDONE_MODIFY_OPTIONS));
              if (option === inverted.projection) UIComponents.Editor.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.options.projection, null, 1));
              if (option === inverted.sort) UIComponents.Editor.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.options.sort, null, 1));
              if (option === inverted.maxTimeMS) $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
              if (option === inverted.upsert) $('#divUpsert').iCheck(query.queryParams.options.upsert ? 'check' : 'uncheck');
              if (option === inverted.returnOriginal) $('#divReturnOriginal').iCheck(query.queryParams.options.returnOriginal ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    GeoHayStackSearch: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        let xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
        if (xAxis) xAxis = parseInt(xAxis, 10);
        let yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
        if (yAxis) yAxis = parseInt(yAxis, 10);

        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.GEO_HAYSTACK_SEARCH_OPTIONS);

        if (options.ERROR) {
          Notification.error(`Syntax error: ${options.ERROR}`);
          return;
        }

        proceedQueryExecution('geoHaystackSearch', { selectedCollection, xAxis, yAxis, options }, false, { xAxis, yAxis, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.xAxis && query.queryParams.yAxis) {
          Meteor.setTimeout(() => {
            $('#inputXAxis').val(query.queryParams.xAxis);
            $('#inputYAxis').val(query.queryParams.yAxis);
          }, 100);
        }

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.GEO_HAYSTACK_SEARCH_OPTIONS, $('#cmbGeoHaystackSearchOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.GEO_HAYSTACK_SEARCH_OPTIONS));
              if (option === inverted.search) UIComponents.Editor.setCodeMirrorValue($('#divSearch'), JSON.stringify(query.queryParams.options.search, null, 1));
              if (option === inverted.maxDistance) $('#inputMaxDistance').val(query.queryParams.options.maxDistance);
              if (option === inverted.limit) $('#inputLimit').val(query.queryParams.options.limit);
            }
          }, 200);
        }
      }
    },

    GeoNear: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        let xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
        if (xAxis) xAxis = parseInt(xAxis, 10);

        let yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
        if (yAxis) yAxis = parseInt(yAxis, 10);

        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.GEO_NEAR_OPTIONS);
        if (options.ERROR) {
          Notification.error(`Syntax error: ${options.ERROR}`);
          return;
        }

        proceedQueryExecution('geoNear', { selectedCollection, xAxis, yAxis, options }, false, { xAxis, yAxis, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.xAxis && query.queryParams.yAxis) {
          Meteor.setTimeout(() => {
            $('#inputXAxis').val(query.queryParams.xAxis);
            $('#inputYAxis').val(query.queryParams.yAxis);
          }, 100);
        }

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.GEO_NEAR_OPTIONS, $('#cmbGeoNearOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.GEO_NEAR_OPTIONS));
              if (option === inverted.query) UIComponents.Editor.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.options.query, null, 1));
              if (option === inverted.maxDistance) $('#inputMaxDistance').val(query.queryParams.options.maxDistance);
              if (option === inverted.minDistance) $('#inputMinDistance').val(query.queryParams.options.minDistance);
              if (option === inverted.num) $('#inputMaxNumber').val(query.queryParams.options.num);
              if (option === inverted.distanceMultiplier) $('#inputDistanceMultiplier').val(query.queryParams.options.distanceMultiplier);
              if (option === inverted.spherical) $('#divSpherical').iCheck(query.queryParams.options.spherical ? 'check' : 'uncheck');
              if (option === inverted.uniqueDocs) $('#divUniqueDocs').iCheck(query.queryParams.options.uniqueDocs ? 'check' : 'uncheck');
              if (option === inverted.includeLocs) $('#inputIncludeLocs').iCheck(query.queryParams.options.includeLocs ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    Group: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        let keys = historyParams ? JSON.stringify(historyParams.keys) : UIComponents.Editor.getCodeMirrorValue($('#divKeys'));
        const condition = getFromHistoryOrEditor(historyParams, $('#divCondition'), 'condition');
        const initial = getFromHistoryOrEditor(historyParams, $('#divInitial'), 'initial');
        const reduce = getFromHistoryOrEditorAsFunction(historyParams, $('#divReduce'), 'reduce');
        const finalize = getFromHistoryOrEditorAsFunction(historyParams, $('#divFinalize'), 'finalize');
        const command = $('#inputCommand').iCheck('update')[0].checked;

        if (keys.startsWith('function')) {
          if (!keys.parseFunction()) {
            Notification.error('Syntax error on keys, not a valid function, you can provide object or array as well');
            return;
          }
        } else {
          keys = ExtendedJSON.convertAndCheckJSON(keys);
          if (keys.ERROR) {
            Notification.error(`Syntax error on keys: ${keys.ERROR}`);
            return;
          }
        }

        if (!checkErrorField(condition)) return;
        if (!checkErrorField(initial)) return;
        if (!checkFunction(reduce, 'reduce')) return;
        if (!checkFunction(finalize, 'finalize')) return;

        proceedQueryExecution('group', { selectedCollection, keys, condition, initial, reduce, finalize, command }, false, { keys, condition, initial, reduce, finalize, command }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.keys) {
          Meteor.setTimeout(() => {
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
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const fullVal = historyParams ? historyParams.full : $('#divFullInformation').iCheck('update')[0].checked;

        proceedQueryExecution('indexInformation', { selectedCollection, isFull: fullVal }, false, { full: fullVal }, (!historyParams));
      },
      render(query) {
        Meteor.setTimeout(() => {
          $('#divFullInformation').iCheck(query.queryParams.full ? 'check' : 'uncheck');
        }, 100);
      }
    },

    InsertMany: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const docs = getFromHistoryOrEditor(historyParams, $('#divDocs'), 'docs');
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.INSERT_MANY_OPTIONS);

        if (!checkErrorField(docs)) return;

        proceedQueryExecution('insertMany', { selectedCollection, docs, options }, false, { docs, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.docs) renderCodeMirror($('#divDocs'), query.queryParams.docs);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.INSERT_MANY_OPTIONS, $('#cmbInsertManyOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.INSERT_MANY_OPTIONS));
              if (option === inverted.bypassDocumentValidation) $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
              if (option === inverted.serializeFunctions) $('#divSerializeFunctions').iCheck(query.queryParams.options.serializeFunctions ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    IsCapped: {
      execute() {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);

        proceedQueryExecution('isCapped', { selectedCollection }, false, { });
      }
    },

    MapReduce: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.MAP_REDUCE_OPTIONS);
        const map = getFromHistoryOrEditorAsFunction(historyParams, $('#divMap'), 'map');
        const reduce = getFromHistoryOrEditorAsFunction(historyParams, $('#divReduce'), 'reduce');

        if (!checkFunction(reduce, 'reduce')) return;
        if (!checkFunction(map, 'map')) return;
        if (checkErrorField(options)) return;

        proceedQueryExecution('mapReduce', { selectedCollection, map, reduce, options }, false, { map, reduce, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.map) renderFunction($('#divMap'), query.queryParams.map);
        if (query.queryParams.reduce) renderFunction($('#divReduce'), query.queryParams.reduce);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.MAP_REDUCE_OPTIONS, $('#cmbMapReduceOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.MAP_REDUCE_OPTIONS));
              if (option === inverted.out) UIComponents.Editor.setCodeMirrorValue($('#divOut'), JSON.stringify(query.queryParams.options.out, null, 1));
              if (option === inverted.query) UIComponents.Editor.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.options.query, null, 1));
              if (option === inverted.sort) UIComponents.Editor.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.options.sort, null, 1));
              if (option === inverted.scope) UIComponents.Editor.setCodeMirrorValue($('#divScope'), JSON.stringify(query.queryParams.options.scope, null, 1));
              if (option === inverted.finalize) UIComponents.Editor.setCodeMirrorValue($('#divFinalize'), JSON.stringify(query.queryParams.options.finalize, null, 1));
              if (option === inverted.limit) $('#inputLimit').val(query.queryParams.options.limit);
              if (option === inverted.verbose) $('#divVerbose').iCheck(query.queryParams.options.verbose ? 'check' : 'uncheck');
              if (option === inverted.keeptemp) $('#divKeepTemp').iCheck(query.queryParams.options.keeptemp ? 'check' : 'uncheck');
              if (option === inverted.bypassDocumentValidation) $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    Options: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);

        proceedQueryExecution('options', { selectedCollection }, false, { }, (!historyParams));
      }
    },

    ReIndex: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);

        proceedQueryExecution('reIndex', { selectedCollection }, false, { }, (!historyParams));
      }
    },

    Rename: {
      execute() {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = QueryingOptions.getOptions(Enums.RENAME_OPTIONS);
        const newName = $('#inputNewName').val();

        if (newName === selectedCollection) {
          Notification.warning('Can not use same name as target name');
          return;
        }

        if (newName) {
          Communicator.call({
            methodName: 'rename',
            args: { selectedCollection, newName, options },
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't rename");
              else {
                Notification.success(`Successfully renamed to: ${newName}`);
                CollectionUtil.renderCollectionNames();
              }
            }
          });
        } else Notification.error('Please enter new name !');
      }
    },

    Stats: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.STATS_OPTIONS);

        proceedQueryExecution('stats', { selectedCollection, options }, false, { options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.STATS_OPTIONS, $('#cmbStatsOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.STATS_OPTIONS));
              if (option === inverted.scale) $('#inputScale').val(query.queryParams.options.scale);
            }
          }, 200);
        }
      }
    },

    UpdateMany: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.UPDATE_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        let setObject = getFromHistoryOrEditor(historyParams, $('#divSet'), 'setObject');

        if (!checkErrorField(selector)) return;
        if (!checkErrorField(options)) return;
        if (!checkErrorField(setObject)) return;

        if (!setObject.$set) setObject = { $set: setObject };

        proceedQueryExecution('updateMany', { selectedCollection, selector, setObject, options }, false, { selector, setObject, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.setObject) renderCodeMirror($('#divSet'), query.queryParams.setObject);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.UPDATE_OPTIONS, $('#cmbUpdateManyOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.UPDATE_OPTIONS));
              if (option === inverted.upsert) $('#divUpsert').iCheck(query.queryParams.options.upsert ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    },

    UpdateOne: {
      execute(historyParams) {
        Notification.start('#btnExecuteQuery');
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.UPDATE_OPTIONS);
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        let setObject = getFromHistoryOrEditor(historyParams, $('#divSet'), 'setObject');

        if (!checkErrorField(selector)) return;
        if (!checkErrorField(options)) return;
        if (!checkErrorField(setObject)) return;

        if (!setObject.$set) setObject = { $set: setObject };

        proceedQueryExecution('updateOne', { selectedCollection, selector, setObject, options }, false, { selector, setObject, options }, (!historyParams));
      },
      render(query) {
        if (query.queryParams.selector) renderCodeMirror($('#divSelector'), query.queryParams.selector);
        if (query.queryParams.setObject) renderCodeMirror($('#divSet'), query.queryParams.setObject);

        if (query.queryParams.options) {
          const optionsArray = renderOptionsArray(query.queryParams.options, Enums.UPDATE_OPTIONS, $('#cmbUpdateOneOptions'));

          // options load
          Meteor.setTimeout(() => {
            for (let i = 0; i < optionsArray.length; i += 1) {
              const option = optionsArray[i];
              const inverted = (_.invert(Enums.UPDATE_OPTIONS));
              if (option === inverted.upsert) $('#divUpsert').iCheck(query.queryParams.options.upsert ? 'check' : 'uncheck');
            }
          }, 200);
        }
      }
    }
  }
};

export default new Querying();
