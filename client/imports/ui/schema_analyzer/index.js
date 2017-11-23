import { UIComponents, SessionManager, Notification, ExtendedJSON, ErrorHandler } from '/client/imports/modules';
import { ReactivityProvider, Communicator } from '/client/imports/facades';

const SchemaAnalyzer = function () {

};

SchemaAnalyzer.prototype = {
  ensureFieldsDataForDatatable(data) {
    for (let i = 0; i < data.length; i += 1) {
      if (!data[i].value.types.String) data[i].value.types.String = '';
      if (!data[i].value.types.Number) data[i].value.types.Number = '';
      if (!data[i].value.types.Array) data[i].value.types.Array = '';
      if (!data[i].value.types.null) data[i].value.types.null = '';
      if (!data[i].value.types.Date) data[i].value.types.Date = '';
      if (!data[i].value.types.NumberLong) data[i].value.types.NumberLong = '';
      if (!data[i].value.types.ObjectId) data[i].value.types.ObjectId = '';
      if (!data[i].value.types.Object) data[i].value.types.Object = '';
      if (!data[i].value.types.Boolean) data[i].value.types.Boolean = '';
    }
  },

  populateFieldsTable(data) {
    this.ensureFieldsDataForDatatable(data);
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblFieldsDetails',
      data,
      columns: [
        {
          title: 'Field Name',
          data: '_id.key',
          className: 'center',
        },
        {
          title: 'Total Occurrences',
          data: 'totalOccurrences',
          className: 'center',
        },
        {
          title: 'Percentage Containing',
          data: 'percentContaining',
          className: 'center',
        },
        {
          title: 'String',
          data: 'value.types.String',
          className: 'center',
        },
        {
          title: 'Number',
          data: 'value.types.Number',
          className: 'center',
        },
        {
          title: 'Boolean',
          data: 'value.types.Boolean',
          className: 'center',
        },
        {
          title: 'Array',
          data: 'value.types.Array',
          className: 'center',
        },
        {
          title: 'Null',
          data: 'value.types.null',
          className: 'center',
        },
        {
          title: 'Date',
          data: 'value.types.Date',
          className: 'center',
        },
        {
          title: 'NumberLong',
          data: 'value.types.NumberLong',
          className: 'center',
        },
        {
          title: 'ObjectId',
          data: 'value.types.ObjectId',
          className: 'center',
        },
        {
          title: 'Object',
          data: 'value.types.Object',
          className: 'center',
        },
      ]
    });
  },

  init() {
    UIComponents.initializeCollectionsCombobox();
    const self = this;
    ReactivityProvider.observeChanges(
      ReactivityProvider.types.SchemaAnalyzeResult,
      {
        connectionId: SessionManager.get(SessionManager.strSessionConnection)._id,
        sessionId: Meteor.default_connection._lastSessionId,
      },
      { sort: { date: -1 } },
      {
        added(id, fields) {
          const jsonData = ExtendedJSON.convertAndCheckJSON(fields.message);
          if (jsonData.ERROR) {
            Notification.error(fields.message);
            Communicator.call({ methodName: 'removeSchemaAnalyzeResult' });
            return;
          }

          Notification.start('#btnAnalyzeNow');
          self.populateFieldsTable(jsonData);
          $('#divFieldsDetails').show();
          Notification.stop();
        }
      });
  },

  clear() {
    Communicator.call({ methodName: 'removeSchemaAnalyzeResult' });
  },

  analyze() {
    const collection = $('#cmbCollections').val();
    if (!collection) {
      Notification.info('Please select a collection first !');
      return;
    }
    if (collection.endsWith('.chunks')) {
      Notification.warning('I rather not analyzing a GridFS collection !');
      return;
    }

    Notification.start('#btnAnalyzeNow');

    Communicator.call({
      methodName: 'analyzeSchema',
      args: {
        connectionId: SessionManager.get(SessionManager.strSessionConnection)._id,
        username: SessionManager.get(SessionManager.strSessionPromptedUsername),
        password: SessionManager.get(SessionManager.strSessionPromptedPassword),
        collection
      },
      callback: (err) => {
        if (err) ErrorHandler.showMeteorFuncError(err, null, "Couldn't analyze collection");
      }
    });
  }
};

export default new SchemaAnalyzer();
