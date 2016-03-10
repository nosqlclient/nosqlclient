Template.topNavbar.rendered = function () {

    var selector = $('#tblConnection');
    selector.addClass('table-striped table-bordered table-hover');
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
            Session.set(Template.strSessionConnection, table.row(this).data()._id);
            $('#btnConnect').prop('disabled', false);
        }
    });

    // FIXED TOP NAVBAR OPTION
    // Uncomment this if you want to have fixed top navbar
    // $('body').addClass('fixed-nav');
    // $(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');

};


Template.topNavbar.helpers({
    reactiveDataFunction: function () {
        return function () {
            return Connections.find().fetch(); // or .map()
        };
    },
    optionsObject: {
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
    }
});


Template.topNavbar.events({
    'click #btnRefreshCollections': function (e) {
        e.preventDefault();

        Template.topNavbar.connect(true);
    },

    'click #btnCreateNewConnection': function () {
        $('#inputConnectionName').val('');
        $('#inputHost').val('');
        $('#inputPort').val('27017');
        $('#inputDatabaseName').val('');
        $('#inputUser').val('');
        $('#inputPassword').val('');
    },

    'click #btnConnectionList': function () {
        if (!Session.get(Template.strSessionConnection)) {
            $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');
            $('#btnConnect').prop('disabled', true);
        }
    },

    'click .editor_remove': function (e) {
        e.preventDefault();
        // set rows not selected
        $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');
        // disable connect button
        $('#btnConnect').prop('disabled', true);
        // remove connection
        Meteor.call('removeConnection', Session.get(Template.strSessionConnection));
        // clear session
        Template.clearSessions();

    },

    'click .editor_edit': function (e) {
        e.preventDefault();
        $('#connectionEditModal').modal('show');

    },

    // Toggle left navigation
    'click #navbar-minimalize': function (event) {

        event.preventDefault();

        var body = $('body');
        var sideMenu = $('#side-menu');
        // Toggle special class
        body.toggleClass("mini-navbar");

        // Enable smoothly hide/show menu
        if (!body.hasClass('mini-navbar') || body.hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            sideMenu.hide();
            // For smoothly turn on menu
            setTimeout(function () {
                sideMenu.fadeIn(400);
            }, 200);
        } else if (body.hasClass('fixed-sidebar')) {
            sideMenu.hide();
            setTimeout(
                function () {
                    sideMenu.fadeIn(400);
                }, 100);
        } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            sideMenu.removeAttr('style');
        }
    },

    'click #btnSaveConnection': function (e) {
        e.preventDefault();
        var connection = {
            name: $('#inputConnectionName').val(),
            host: $('#inputHost').val(),
            port: $('#inputPort').val(),
            databaseName: $('#inputDatabaseName').val(),
            user: $('#inputUser').val(),
            password: $('#inputPassword').val()
        };

        if (!Template.topNavbar.checkConnection(connection)) {
            return;
        }
        Meteor.call('saveConnection', connection, function (err) {
            if (err) {
                toastr.error(err.message);
            }
            else {
                $('#connectionCreateModal').modal('hide');
            }
        });
    },

    'click #btnEditConnection': function (e) {
        e.preventDefault();
        var connection = {
            name: $('#inputEditConnectionName').val(),
            host: $('#inputEditHost').val(),
            port: $('#inputEditPort').val(),
            databaseName: $('#inputEditDatabaseName').val(),
            user: $('#inputEditUser').val(),
            password: $('#inputEditPassword').val(),
            _id: Session.get(Template.strSessionConnection)
        };

        if (!Template.topNavbar.checkConnection(connection)) {
            return;
        }
        Meteor.call('updateConnection', connection);
        $('#connectionEditModal').modal('hide');
    },

    'click #btnConnect': function () {
        // loading button
        var laddaButton = $('#btnConnect').ladda();
        laddaButton.ladda('start');

        Template.topNavbar.connect(false);
    },

    'click #btnDisconnect': function (e) {
        e.preventDefault();
        Template.clearSessions();

        swal({
            title: "Disconnected!",
            text: "Successfuly disconnected",
            type: "success"
        });

        Router.go('databaseStats');
    }
});


Template.topNavbar.checkConnection = function (connection) {
    if (!connection.name) {
        toastr.error("Connection name can't be empty");
        return false;
    }
    if (!connection.host) {
        toastr.error("Host can't be empty");
        return false;
    }
    if (!connection.port) {
        toastr.error("Port can't be empty");
        return false;
    }
    if (!connection.databaseName) {
        toastr.error("Database name can't be empty");
        return false;
    }

    return true;
};

Template.topNavbar.connect = function (isRefresh) {
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    Meteor.call('connect', connection, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }

            toastr.error("Couldn't connect: " + errorMessage);
            Ladda.stopAll();
            return;
        }

        Ladda.stopAll();

        Session.set(Template.strSessionCollectionNames, result.result);
        if (!isRefresh) {
            $('#connectionModal').modal('hide');
            swal({
                title: "Connected!",
                text: "Successfuly connected to " + connection.name,
                type: "success"
            });
        }
        else {
            toastr.success("Successfuly refreshed collections");
        }
    });
}