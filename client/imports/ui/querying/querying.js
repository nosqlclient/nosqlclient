import { Meteor } from 'meteor/meteor';
import { Enums, Notification, ExtendedJSON, UIComponents, SessionManager } from '/client/imports/modules';
import { Connection, QueryRender, QueryingOptions } from '/client/imports/ui';
import { Communicator } from '/client/imports/facades';
import { _ } from 'meteor/underscore';
import Helper from '/client/imports/helpers/helper';
import QueryingHelper from './helper';

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

const getFromHistoryOrEditorString = function (historyParams, divSelector, historyField = 'selector') {
  let result;
  if (historyParams) result = JSON.stringify(historyParams[historyField]);
  else result = UIComponents.Editor.getCodeMirrorValue(divSelector);

  return result;
};

const getFromHistoryOrEditor = function (historyParams, divSelector, historyField = 'selector') {
  return ExtendedJSON.convertAndCheckJSON(getFromHistoryOrEditorString(historyParams, divSelector, historyField));
};

const renderParams = function (queryParams) {
  Object.keys(queryParams).forEach((param) => {
    const { relatedJqueryDiv, relatedJqueryInput } = QueryingHelper.getRelatedDom(param);

    setTimeout(() => {
      if (relatedJqueryDiv.length !== 0) {
        if (relatedJqueryDiv.data('editor')) {
          if (JSON.stringify(queryParams[param]).startsWith('"function')) {
            let str = JSON.stringify(queryParams[param], null, 1).replace(/\\n/g, '\n');
            str = str.substring(1, str.length - 1);
            UIComponents.Editor.setCodeMirrorValue(relatedJqueryDiv, str);
          } else UIComponents.Editor.setCodeMirrorValue(relatedJqueryDiv, JSON.stringify(queryParams[param], null, 1));
        } else if (relatedJqueryDiv.find('input:checkbox').length !== 0) relatedJqueryDiv.iCheck(queryParams[param] ? 'check' : 'uncheck');
      } else if (relatedJqueryInput.length !== 0) relatedJqueryInput.val(queryParams[param]);
    }, 100);
  });
};

const proceedRendering = function ({ options, optionEnum, optionCombo, params }) {
  if (options) {
    const optionsArray = [];
    const inverted = (_.invert(optionEnum));

    Object.keys(options).forEach((property) => {
      if (inverted[property]) optionsArray.push(inverted[property]);
    });

    setTimeout(() => {
      optionCombo.val(optionsArray).trigger('chosen:updated');
      SessionManager.set(SessionManager.strSessionSelectedOptions, optionsArray);
    }, 100);

    setTimeout(() => {
      renderParams(options);
    }, 200);
  }

  if (params) renderParams(params);
};

const proceedUpdateQueryExecution = function (historyParams, query) {
  const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.UPDATE_OPTIONS);
  const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
  const setObject = getFromHistoryOrEditor(historyParams, $('#divSet'), 'set');

  if (!checkErrorField(selector, 'selector')) return;
  if (!checkErrorField(options)) return;
  if (!checkErrorField(setObject, 'set')) return;

  proceedQueryExecution({
    methodName: query,
    args: { selector, setObject, options },
    isAdmin: false,
    queryParams: { selector, set: setObject, options },
    saveHistory: (!historyParams)
  });
};

const getUpdateFinalObject = function (queryStr, cmbOptionsSelector) {
  return {
    execute(historyParams) {
      proceedUpdateQueryExecution(historyParams, queryStr);
    },
    render(query) {
      proceedRendering({
        params: query.queryParams,
        options: query.queryParams.options,
        optionEnum: Enums.UPDATE_OPTIONS,
        optionCombo: cmbOptionsSelector
      });
    }
  };
};

const getFindModifyFinalObject = function (queryStr) {
  return {
    execute(historyParams) {
      const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.FINDONE_MODIFY_OPTIONS);
      const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

      if (!checkErrorField(selector, 'selector')) return;
      if (options.ERROR) {
        Notification.error(options.ERROR);
        return;
      }

      const args = { selector, options };
      const queryParams = { selector, options };

      if (queryStr === 'findOneAndUpdate') {
        const setObject = getFromHistoryOrEditor(historyParams, $('#divSet'), 'set');
        if (!checkErrorField(setObject, 'set')) return;
        args.setObject = setObject;
        queryParams.set = setObject;
      } else if (queryStr === 'findOneAndReplace') {
        const replacement = getFromHistoryOrEditor(historyParams, $('#divReplacement'), 'replacement');
        if (!checkErrorField(replacement, 'replacement')) return;
        args.replacement = replacement;
        queryParams.replacement = replacement;
      }

      proceedQueryExecution({
        methodName: queryStr,
        args,
        isAdmin: false,
        queryParams,
        saveHistory: (!historyParams)
      });
    },
    render(query) {
      proceedRendering({
        params: query.queryParams,
        options: query.queryParams.options,
        optionEnum: Enums.FINDONE_MODIFY_OPTIONS,
        optionCombo: $('#cmbFindOneModifyOptions')
      });
    }
  };
};

const getFindFinalObject = function (queryStr, cmbOptions) {
  return {
    execute(historyParams, exportFormat) {
      const cursorOptions = historyParams ? historyParams.cursorOptions : QueryingOptions.getOptions(Enums.CURSOR_OPTIONS);
      const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));

      if (!checkErrorField(selector, 'selector')) return;
      if (!checkErrorField(cursorOptions)) return;

      if (exportFormat) {
        const selectedCollection = SessionManager.get(SessionManager.strSessionSelectedCollection);
        window.open(`export?format=${exportFormat}&
    selectedCollection=${selectedCollection}&selector=${JSON.stringify(selector)}&cursorOptions=${JSON.stringify(cursorOptions)}&sessionId=${Meteor.default_connection._lastSessionId}`);
        Notification.stop();
      } else {
        const args = { selector, cursorOptions };
        const queryParams = { selector, cursorOptions };
        if (queryStr === 'find') {
          const executeExplain = $('#inputExplain').iCheck('update')[0].checked;
          args.executeExplain = executeExplain;
          queryParams.executeExplain = executeExplain;
        }
        proceedQueryExecution({
          methodName: queryStr,
          args,
          isAdmin: false,
          queryParams,
          saveHistory: (!historyParams)
        });
      }
    },

    render(query) {
      proceedRendering({
        params: query.queryParams,
        options: query.queryParams.cursorOptions,
        optionEnum: Enums.CURSOR_OPTIONS,
        optionCombo: cmbOptions
      });
    }
  };
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
        initOptions.call(this, $('#cmbFindOneModifyOptions'), Enums.FINDONE_MODIFY_OPTIONS, showRunOnAdmin, ...excludedOptions);
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
    SetProfilingLevel: {
      execute(historyParams) {
        const selectedLevelOption = $('#cmbLevel').find('option:selected');
        const level = historyParams ? historyParams.level : selectedLevelOption.text();
        const options = {};
        options[level] = selectedLevelOption.val();

        proceedQueryExecution({
          methodName: 'setProfilingLevel',
          isAdmin: false,
          args: { level },
          queryParams: { options },
          saveHistory: (!historyParams)
        });
      },

      render(query) {
        proceedRendering({
          params: query.queryParams,
          options: query.queryParams.options,
          optionEnum: Enums.PROFILING_LEVELS,
          optionCombo: $('#cmbLevel')
        });
      }
    },

    ProfilingInfo: {
      execute(historyParams) {
        proceedQueryExecution({
          isAdmin: false,
          methodName: 'profilingInfo',
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        proceedRendering({
          params: query.queryParams
        });
      }
    },

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
        proceedRendering({
          params: query.queryParams,
          options: query.queryParams.options,
          optionEnum: Enums.AGGREGATE_OPTIONS,
          optionCombo: $('#cmbAggregateOptions')
        });
      }
    },

    BulkWrite: {
      execute(historyParams) {
        const operations = getFromHistoryOrEditor(historyParams, $('#divBulkWrite'), 'bulkWrite');
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.BULK_WRITE_OPTIONS);

        if (!checkErrorField(operations, 'operations')) return;

        proceedQueryExecution({
          methodName: 'bulkWrite',
          args: { operations, options },
          isAdmin: false,
          queryParams: { bulkWrite: operations, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        proceedRendering({
          params: query.queryParams,
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
        proceedRendering({
          params: query.queryParams,
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
        proceedRendering({
          params: query.queryParams,
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
        renderParams(query.queryParams);
      }
    },

    Distinct: {
      execute(historyParams) {
        const selector = getFromHistoryOrEditor(historyParams, $('#divSelector'));
        const fieldName = historyParams ? historyParams.field : $('#inputField').val();
        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.DISTINCT_OPTIONS);

        if (!checkErrorField(selector, 'selector')) return;

        proceedQueryExecution({
          methodName: 'distinct',
          args: { selector, fieldName, options },
          isAdmin: false,
          queryParams: { selector, field: fieldName, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        proceedRendering({
          params: query.queryParams,
          options: query.queryParams.options,
          optionEnum: Enums.DISTINCT_OPTIONS,
          optionCombo: $('#cmbDistinctOptions')
        });
      }
    },

    DropIndex: {
      execute(historyParams) {
        const indexName = historyParams ? historyParams.name : $('#inputName').val();

        proceedQueryExecution({
          methodName: 'dropIndex',
          args: { indexName },
          isAdmin: false,
          queryParams: { name: indexName },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        renderParams(query.queryParams);
      }
    },

    Find: getFindFinalObject('find', $('#cmbFindCursorOptions')),
    FindOne: getFindFinalObject('findOne', $('#cmbFindOneCursorOptions')),
    FindOneAndDelete: getFindModifyFinalObject('findOneAndDelete'),
    FindOneAndReplace: getFindModifyFinalObject('findOneAndReplace'),
    FindOneAndUpdate: getFindModifyFinalObject('findOneAndUpdate'),

    GeoHayStackSearch: {
      execute(historyParams) {
        let xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
        if (xAxis) xAxis = parseInt(xAxis, 10);

        let yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
        if (yAxis) yAxis = parseInt(yAxis, 10);

        const options = historyParams ? historyParams.options : QueryingOptions.getOptions(Enums.GEO_HAYSTACK_SEARCH_OPTIONS);
        if (options.ERROR) {
          Notification.error(options.ERROR);
          return;
        }

        proceedQueryExecution({
          methodName: 'geoHaystackSearch',
          args: { xAxis, yAxis, options },
          isAdmin: false,
          queryParams: { xAxis, yAxis, options },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        proceedRendering({
          params: query.queryParams,
          options: query.queryParams.options,
          optionEnum: Enums.GEO_HAYSTACK_SEARCH_OPTIONS,
          optionCombo: $('#cmbGeoHaystackSearchOptions')
        });
      }
    },
    Group: {
      execute(historyParams) {
        let keys = getFromHistoryOrEditorString(historyParams, $('#divKeys'), 'keys');
        const condition = getFromHistoryOrEditor(historyParams, $('#divCondition'), 'condition');
        const initial = getFromHistoryOrEditor(historyParams, $('#divInitial'), 'initial');
        const reduce = getFromHistoryOrEditorString(historyParams, $('#divReduce'), 'reduce');
        const finalize = getFromHistoryOrEditorString(historyParams, $('#divFinalize'), 'finalize');
        const command = $('#inputCommand').iCheck('update')[0].checked;

        if (!keys.startsWith('function')) {
          keys = ExtendedJSON.convertAndCheckJSON(keys);
          if (keys.ERROR) {
            Notification.error('syntax-error-keys', null, { error: keys.ERROR });
            return;
          }
        }

        if (!checkErrorField(condition, 'condition')) return;
        if (!checkErrorField(initial, 'initial')) return;

        proceedQueryExecution({
          methodName: 'group',
          args: { keys, condition, initial, reduce, finalize, command },
          isAdmin: false,
          queryParams: { keys, condition, initial, reduce, finalize, command },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        renderParams(query.queryParams);
      }
    },

    IndexInformation: {
      execute(historyParams) {
        const fullVal = historyParams ? historyParams.fullInformation : $('#divFullInformation').iCheck('update')[0].checked;

        proceedQueryExecution({
          methodName: 'indexInformation',
          args: { isFull: fullVal },
          isAdmin: false,
          queryParams: { fullInformation: fullVal },
          saveHistory: (!historyParams)
        });
      },
      render(query) {
        renderParams(query.queryParams);
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
        proceedRendering({
          params: query.queryParams,
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
        const map = getFromHistoryOrEditorString(historyParams, $('#divMap'), 'map');
        const reduce = getFromHistoryOrEditorString(historyParams, $('#divReduce'), 'reduce');

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
        proceedRendering({
          params: query.queryParams,
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
              Connection.connect(false);
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
        proceedRendering({
          options: query.queryParams.options,
          optionEnum: Enums.STATS_OPTIONS,
          optionCombo: $('#cmbStatsOptions')
        });
      }
    },

    UpdateMany: getUpdateFinalObject('updateMany', $('#cmbUpdateManyOptions')),
    UpdateOne: getUpdateFinalObject('updateOne', $('#cmbUpdateOneOptions'))
  }
};

export default new Querying();
