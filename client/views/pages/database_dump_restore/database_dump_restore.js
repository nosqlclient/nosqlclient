/**
 * Created by RSercan on 17.1.2016.
 */
Template.databaseDumpRestore.onRendered(function () {
    if (!Session.get(Template.strSessionConnection)) {
        Router.go('databaseStats');
        return;
    }
});

Template.databaseDumpRestore.events({
    'click #btnTakeDump': function (e) {
        e.preventDefault();
        var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        var settings = Settings.findOne();

        var laddaButton = $('#btnTakeDump').ladda();
        laddaButton.ladda('start');

        toastr.success('Started dump process you can NOT do anything till the process finishes.');

        Meteor.call('takeDump', connection, settings.dumpPath, function (err, result) {
            console.log(err);
            console.log(result);

            Ladda.stopAll();
        });
    },

    'click .editor_download': function (e) {
        e.preventDefault();

    },

    'click .editor_import': function (e) {
        e.preventDefault();
        $('#connectionEditModal').modal('show');
    }
});

Template.databaseDumpRestore.helpers({
    'getDumps': function () {
        return function () {
            return Dumps.find().fetch(); // or .map()
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
                title: 'Size',
                data: 'sizeInBytes',
                className: 'center'
            },
            {
                title: 'Import',
                data: null,
                className: 'center',
                bSortable: false,
                defaultContent: '<a href="" title="Import" class="editor_import"><i class="fa fa-database text-navy"></i></a>'
            },
            {
                title: 'Download',
                data: null,
                className: 'center',
                bSortable: false,
                defaultContent: '<a href="" title="Download" class="editor_download"><i class="fa fa-download text-navy"></i></a>'
            }
        ]
    }
});