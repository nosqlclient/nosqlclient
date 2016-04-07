Template.navigation.events({
    'click #btnAddCollection': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnRefreshCollections2': function (e) {
        e.preventDefault();
        Template.topNavbar.connect(true);
    },

    'click #btnDropCollection': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnDropAllCollections': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    },

    'click #btnDropDatabase': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
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