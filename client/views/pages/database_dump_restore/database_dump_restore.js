/**
 * Created by RSercan on 17.1.2016.
 */
Template.databaseDumpRestore.onRendered(function () {
    if (Session.get(Template.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    var selector = $('#tblDumps');
    selector.addClass('table-bordered table-hover');
    selector.find('tbody').on('click', 'tr', function () {

        var table = selector.DataTable();

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        if (table.row(this).data()) {
            Session.set(Template.strSessionSelectedDump, table.row(this).data());
        }
    });

});

Template.databaseDumpRestore.events({
    'click #btnTakeDump': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click .editor_import': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    }
});


Template.databaseDumpRestore.helpers({
    'getDumps': function () {
        return function () {
            return Dumps.find({}, {sort: {date: -1}}).fetch(); // or .map()
        };
    },

    'dumpsTableOptions': {
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
    }
});
