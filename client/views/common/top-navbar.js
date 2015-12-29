Template.topNavbar.rendered = function () {

    $('#DataTables_Table_0').addClass('table-striped table-bordered table-hover');

    $('#DataTables_Table_0 tbody').on('click', 'tr', function () {
        var table = $('#DataTables_Table_0').DataTable();

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        if (table.row(this).data()) {
            Session.set(strSessionConnection, table.row(this).data()._id);
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
                defaultContent: '<a href="" class="editor_edit">Edit</a>'
            },
            {
                title: 'Delete',
                data: null,
                className: 'center',
                defaultContent: '<a href="" class="editor_remove">Delete</a>'
            }
        ]
    }
});

Template.topNavbar.events({
    'click #btnConnectionList': function (e) {
        if (!Session.get(strSessionConnection)) {
            $('#DataTables_Table_0').DataTable().$('tr.selected').removeClass('selected');
            $('#btnConnect').prop('disabled', true);
        }
    },

    'click .editor_remove': function (e) {
        e.preventDefault();
        // set rows not selected
        $('#DataTables_Table_0').DataTable().$('tr.selected').removeClass('selected');
        // disable connect button
        $('#btnConnect').prop('disabled', true);
        // remove connection
        Meteor.call('removeConnection', Session.get(strSessionConnection));
        // clear session
        clearSessions();

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

        if (!checkConnection(connection)) {
            return;
        }
        Meteor.call('saveConnection', connection);
        $('#connectionCreateModal').modal('hide');
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
            _id: Session.get(strSessionConnection)
        };

        if (!checkConnection(connection)) {
            return;
        }
        Meteor.call('updateConnection', connection);
        $('#connectionEditModal').modal('hide');
    },

    'click #btnConnect': function (e) {
        // loading button
        var l = $('#btnConnect').ladda();
        l.ladda('start');

        var connection = Connections.findOne({_id: Session.get(strSessionConnection)});
        Meteor.call('connect', connection, function (err, result) {
            if (result.error) {
                toastr.error("Couldn't connect: " + result.error.message);
                l.ladda('stop');
                return;
            }

            l.ladda('stop');

            Session.set(strSessionCollectionNames, result.result);
            $('#connectionModal').modal('hide');

            swal({
                title: "Connected!",
                text: "Successfuly connected to " + connection.name,
                type: "success"
            });
        });
    },

    'click #btnDisconnect': function (e) {
        e.preventDefault();
        clearSessions();

        swal({
            title: "Disconnected!",
            text: "Successfuly disconnected",
            type: "success"
        });
    }
});


checkConnection = function (connection) {
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
}