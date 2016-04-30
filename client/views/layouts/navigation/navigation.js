Template.navigation.events({
    'click #btnAddCollection': function (e) {
        e.preventDefault();
        $('#collectionAddModal').modal('show');
    },

    'click #btnRefreshCollections2': function (e) {
        e.preventDefault();
        Template.topNavbar.connect(true);
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
            Meteor.call('dropAllCollections', Session.get(Template.strSessionConnection), function (err, result) {
                if (err || result.error) {
                    Template.showMeteorFuncError(err, result, "Couldn't drop all collections");
                }
                else {
                    Template.clearSessions();
                    swal({
                        title: "Dropped!",
                        text: "Successfuly dropped all collections database ",
                        type: "success"
                    });
                }
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
            Meteor.call('dropDB', Session.get(Template.strSessionConnection), function (err, result) {
                if (err || result.error) {
                    Template.showMeteorFuncError(err, result, "Couldn't drop database");
                }
                else {
                    Template.clearSessions();
                    swal({
                        title: "Dropped!",
                        text: "Successfuly dropped database ",
                        type: "success"
                    });
                }
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
    Meteor.call('dropCollection', Session.get(Template.strSessionConnection), collectionName, function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't drop collection");
        }
        else {
            Template.navigation.renderCollectionNames();
            toastr.success('Successfuly dropped collection: ' + collectionName);
        }
    });
};

Template.navigation.renderCollectionNames = function () {
    Meteor.call('connect', Session.get(Template.strSessionConnection), function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't connect");
        }
        else {
            // re-set collection names
            Session.set(Template.strSessionCollectionNames, result.result);
            // set all session values undefined except connection
            Session.set(Template.strSessionSelectedQuery, undefined);
            Session.set(Template.strSessionSelectedOptions, undefined);
            Session.set(Template.strSessionSelectedCollection, undefined);
            Router.go('databaseStats');
        }
    });
};