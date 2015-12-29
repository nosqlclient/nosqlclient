Template.navigation.rendered = function () {
    // Initialize metisMenu
    $('#side-menu').metisMenu();
};

Template.navigation.events({
    'click #btnDropDatabase': function (e) {
        e.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this database!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, drop it!",
            closeOnConfirm: false
        }, function () {
            var connection = Connections.findOne({_id: Session.get(strSessionConnection)});
            Meteor.call('dropDB', connection, function (err, result) {
                if (result.error) {
                    toastr.error("Couldn't drop database: " + result.error.message);
                    return;
                }
                clearSessions();
                swal({
                    title: "Dropped!",
                    text: "Successfuly dropped database " + connection.databaseName,
                    type: "success"
                });
            });
        });
    },

    'click .navCollection': function () {
        var name = this.name;

        $('#listCollectionNames li').each(function (index, li) {
            var liObject = $(li);
            if (liObject[0].innerText.substr(1).trim() == name) {
                liObject.addClass('active');
            } else {
                liObject.removeClass('active');
            }
        });

        $('#side-menu li').each(function (index, li) {
            $(li).removeClass('active');
        });

        Session.set(strSessionSelectedCollection, name);
        $('#divJsonEditor').hide();
        $('#divAceEditor').hide();
    }
});