/**
 * Created by RSercan on 24.1.2016.
 */
TabularTables = {};
Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Connections = new Tabular.Table({
    name: 'ConnectionList',
    collection: Connections,
    stateSave: true,
    columns: [
        {
            title: '_id',
            data: '_id',
            className: 'center',
            sClass: "hide_column"
        },
        {
            title: 'Connection Name',
            data: 'name',
            className: 'center'
        },
        {
            title: 'Hostname',
            data: 'host',
            className: 'center'
        },
        {
            title: 'Port',
            data: 'port',
            className: 'center'
        },
        {
            title: 'Database Name',
            data: 'databaseName',
            className: 'center'
        },
        {
            title: 'Edit',
            data: null,
            className: 'center',
            bSortable: false,
            defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>'
        },
        {
            title: 'Delete',
            data: null,
            className: 'center',
            bSortable: false,
            defaultContent: '<a href="" title="Delete" class="editor_remove"><i class="fa fa-remove text-navy"></i></a>'
        }
    ]
});

TabularTables.Dumps = new Tabular.Table({
    name: 'DumpList',
    collection: Dumps,
    stateSave: true,
    columns: [
        {
            title: '_id',
            data: '_id',
            className: 'center',
            sClass: "hide_column"
        },
        {
            title: 'Connection name',
            data: 'connectionName',
            width: '20%',
            className: 'center'
        },
        {
            title: 'Date',
            data: 'date',
            width: '15%',
            render: function (cellData) {
                return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
            },
            className: 'center'
        },
        {
            title: 'File Path',
            data: 'filePath',
            width: '30%',
            className: 'center'
        },
        {
            title: 'Size',
            data: 'sizeInBytes',
            width: '10%',
            render: function (cellData) {
                var scale = 1;
                var text = "Bytes";

                var settings = Settings.findOne();
                switch (settings.scale) {
                    case "MegaBytes":
                        scale = 1024 * 1024;
                        text = "MBs";
                        break;
                    case "KiloBytes":
                        scale = 1024;
                        text = "KBs";
                        break;
                    default:
                        scale = 1;
                        text = "Bytes";
                        break;
                }

                var result = isNaN(Number(cellData / scale).toFixed(2)) ? "0.00" : Number(cellData / scale).toFixed(2);
                return result + " " + text;
            },
            className: 'center'
        },
        {
            title: 'Import Status',
            data: 'status',
            width: '15%',
            className: 'center'
        },
        {
            title: 'Import',
            data: null,
            className: 'center',
            width: '10%',
            bSortable: false,
            defaultContent: '<a href="" title="Import" class="editor_import"><i class="fa fa-database text-navy"></i></a>'
        }
    ]
});