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
    });

});

Template.databaseDumpRestore.events({
    'click #btnTakeDump': function (e) {
        e.preventDefault();
        var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        var settings = Settings.findOne();

        var laddaButton = $('#btnTakeDump').ladda();
        laddaButton.ladda('start');

        Meteor.call('takeDump', connection, settings.dumpPath, function (err) {
            if (err) {
                toastr.error("Couldn't take dump, " + err.message);
            }
            else {
                toastr.success('A background process to take a dump has started, whenever it finishes you can see the dump on this page');
            }

            Ladda.stopAll();
        });
    },

    'click .editor_import': function (e) {
        e.preventDefault();
        var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        var table = $('#tblDumps').DataTable();

        if (table.row(this).data()) {
            swal({
                title: "Are you sure?",
                text: "All collections will be dropped, and restored !",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, do it!",
                closeOnConfirm: true
            }, function () {
                var laddaButton = $('#btnTakeDump').ladda();
                laddaButton.ladda('start');

                var dumpInfo = table.row(this).data();
                dumpInfo.status = DUMP_STATUS.IN_PROGRESS;
                Meteor.call('updateDump', dumpInfo); // this is a simple update to notify user on UI
                Meteor.call('restoreDump', connection, dumpInfo, function (err) {
                    if (err) {
                        toastr.error("Couldn't restore dump, " + err.message);
                    }
                    else {
                        toastr.success('A background process to restore the dump(' + dumpInfo.filePath + ') has started, whenever it finishes you can see the result on this page');
                    }

                    Ladda.stopAll();
                });
            });
        }
    }
});
