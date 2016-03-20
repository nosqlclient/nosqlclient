Template.navigation.events({
    'click #btnAddCollection': function (e) {
        e.preventDefault();
        $('#collectionAddModal').modal('show');
    },

    'click #btnDropCollection': function (e) {
        e.preventDefault();

        var collectionName = this.name;
        swal({
            title: "Are you sure?",
            text: this.name + " collection will be dropped, are you sure ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, drop it!",
            closeOnConfirm: true
        }, function (isConfirm) {
            if (isConfirm) {
                Template.navigation.dropCollection(collectionName);
            }
        });
    },

    'click #btnDropAllCollections': function (e) {
        e.preventDefault();
        swal({
            title: "Are you sure?",
            text: "All collections except system, will be dropped, are you sure ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, drop them!",
            closeOnConfirm: false
        }, function () {
            var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
            Meteor.call('dropAllCollections', connection, function (err, result) {
                if (err) {
                    toastr.error("Couldn't drop collections: " + err.message);
                    return;
                }
                if (result.error) {
                    toastr.error("Couldn't drop collections: " + result.error.message);
                    return;
                }
                Template.clearSessions();
                swal({
                    title: "Dropped!",
                    text: "Successfuly dropped all collections for database " + connection.databaseName,
                    type: "success"
                });
            });
        });
    },

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
            var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
            Meteor.call('dropDB', connection, function (err, result) {
                if (err) {
                    toastr.error("Couldn't drop database: " + err.message);
                    return;
                }
                if (result.error) {
                    toastr.error("Couldn't drop database: " + result.error.message);
                    return;
                }
                Template.clearSessions();
                swal({
                    title: "Dropped!",
                    text: "Successfuly dropped database " + connection.databaseName,
                    type: "success"
                });
            });
        });
    },


    'click .aNavigations': function () {
        Template.navigation.handleNavigationAndSessions();
    },

    'click .navCollection': function (e) {
        if (e.target.id == 'btnDropCollection') {
            return;
        }

        var name = this.name;

        $('#listCollectionNames').find('li').each(function (index, li) {
            var liObject = $(li);
            if (liObject[0].textContent.substr(1).replace('Drop', '').trim() == name) {
                liObject.addClass('active');
            }
            else {
                liObject.removeClass('active');
            }
        });

        $('#listSystemCollections').find('li').each(function (index, li) {
            var liObject = $(li);
            if (liObject[0].textContent.substr(1).replace('Drop', '').trim() == name) {
                liObject.addClass('active');
            } else {
                liObject.removeClass('active');
            }
        });


        Session.set(Template.strSessionSelectedCollection, name);
    }
});

Template.navigation.helpers({
    'initializeMetisMenu': function () {
        Meteor.setTimeout(function () {
            var sideMenu = $('#side-menu');
            sideMenu.removeData("mm");
            sideMenu.metisMenu();
        });
    },

    'getCollectionNames': function () {
        var collectionNames = Session.get(Template.strSessionCollectionNames);
        if (collectionNames != undefined) {
            var result = [];
            collectionNames.forEach(function (collectionName) {
                if (!collectionName.name.startsWith('system')) {
                    result.push(collectionName);
                }
            });

            return result;
        }

        return collectionNames;
    },

    'getSystemCollectionNames': function () {
        var collectionNames = Session.get(Template.strSessionCollectionNames);
        if (collectionNames != undefined) {
            var result = [];
            collectionNames.forEach(function (collectionName) {
                if (collectionName.name.startsWith('system')) {
                    result.push(collectionName);
                }
            });

            return result;
        }

        return collectionNames;
    }
});

Template.navigation.handleNavigationAndSessions = function () {
    $('#listCollectionNames').find('li').each(function (index, li) {
        $(li).removeClass('active');
    });

    $('#listSystemCollections').find('li').each(function (index, li) {
        $(li).removeClass('active');
    });

    Session.set(Template.strSessionSelectedCollection, undefined);
    Session.set(Template.strSessionSelectedQuery, undefined);
    Session.set(Template.strSessionSelectedOptions, undefined);

    $('#cmbQueries').val('').trigger('chosen:updated');
    $('#cmbAdminQueries').val('').trigger('chosen:updated');
};

Template.navigation.dropCollection = function (collectionName) {
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    Meteor.call('dropCollection', connection, collectionName, function (err, result) {
        if (err) {
            toastr.error("Couldn't drop collection: " + err.message);
            return;
        }
        if (result.error) {
            toastr.error("Couldn't drop collection: " + result.error.message);
            return;
        }
        Template.navigation.renderCollectionNames();
        toastr.success('Successfuly dropped collection: ' + collectionName);
    });
};

Template.navigation.renderCollectionNames = function () {
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
            return;
        }

        // re-set collection names
        Session.set(Template.strSessionCollectionNames, result.result);
        // set all session values undefined except connection
        Session.set(Template.strSessionSelectedQuery, undefined);
        Session.set(Template.strSessionSelectedOptions, undefined);
        Session.set(Template.strSessionSelectedCollection, undefined);
        Router.go('databaseStats');
    });
};