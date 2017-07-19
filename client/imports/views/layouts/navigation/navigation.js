/*global swal*/
import {Meteor} from "meteor/meteor";
import {ReactiveVar} from "meteor/reactive-var";
import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import {Connections} from "/lib/imports/collections";
import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import {connect} from "/client/imports/views/layouts/top_navbar/connections/connections";
import {initializeForm, resetForm} from "./add_collection/add_collection";
import {resetForm as resetCappedForm} from "./convert_capped_collection/convert_to_capped";
import {resetForm as resetRenameForm} from "./rename_collection/rename_collection";
import {resetForm as resetValidationRulesForm} from "./validation_rules/validation_rules";
import {initializeFilterTable} from "./filter_collection/filter_collection";
import "./navigation.html";
import $ from "jquery";


const toastr = require('toastr');

export let filterRegex = new ReactiveVar(""), excludedCollectionsByFilter = new ReactiveVar([]);
export const setExcludedCollectionsByFilter = function (arr) {
    excludedCollectionsByFilter.set(arr);
};
export const setFilterRegex = function (regex) {
    filterRegex.set(regex);
};

const isFiltered = function () {
    return filterRegex.get() || excludedCollectionsByFilter.get().length !== 0;
};

const dropAllCollections = function () {
    swal({
        title: "Are you sure?",
        text: "All collections except system, will be dropped, are you sure ?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, drop them!",
        closeOnConfirm: true
    }, function (isConfirm) {
        if (isConfirm) {
            Meteor.call('dropAllCollections', Meteor.default_connection._lastSessionId, function (err, result) {
                if (err || result.error) {
                    Helper.showMeteorFuncError(err, result, "Couldn't drop all collections");
                }
                else {
                    renderCollectionNames();
                    toastr.success('Successfully dropped all collections/views except system');
                }
            });
        }
    });
};

const handleNavigationAndSessions = function () {
    $('#listCollectionNames').find('li').each(function (index, li) {
        $(li).removeClass('active');
    });

    $('#listSystemCollections').find('li').each(function (index, li) {
        $(li).removeClass('active');
    });

    Session.set(Helper.strSessionSelectedCollection, undefined);
    Session.set(Helper.strSessionSelectedQuery, undefined);
    Session.set(Helper.strSessionSelectedOptions, undefined);

    $('#cmbQueries').val('').trigger('chosen:updated');
    $('#cmbAdminQueries').val('').trigger('chosen:updated');
};

const clearCollection = function (collectionName) {
    Meteor.call('delete', collectionName, {}, Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't clear collection");
        }
        else {
            toastr.success('Successfuly cleared collection: ' + collectionName);
        }
    });
};

const dropCollection = function (collectionName) {
    Meteor.call('dropCollection', collectionName, Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't drop collection");
        }
        else {
            renderCollectionNames();
            toastr.success('Successfuly dropped collection: ' + collectionName);
        }
    });
};

export const renderCollectionNames = function () {
    Meteor.call('connect', Session.get(Helper.strSessionConnection), Meteor.default_connection._lastSessionId, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't connect");
        }
        else {
            result.result.sort(function (a, b) {
                if (a.name < b.name)
                    return -1;
                else if (a.name > b.name)
                    return 1;
                else
                    return 0;
            });

            // re-set collection names
            Session.set(Helper.strSessionCollectionNames, result.result);
            // set all session values undefined except connection
            Session.set(Helper.strSessionSelectedQuery, undefined);
            Session.set(Helper.strSessionSelectedOptions, undefined);
            Session.set(Helper.strSessionSelectedCollection, undefined);
            FlowRouter.go('/databaseStats');
        }
    });
};

const showMongoBinaryInfo = function () {
    if (!localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.MONGO_BINARY_INFO)) {
        swal({
            title: "Mongo Tools",
            text: "Nosqlclient uses mongo binaries and tools for dump/restore, schema analyzer, and shell you can set the directory of binaries from <b>Settings</b>",
            type: "info",
            html: true,
            confirmButtonColor: "#18A689",
            confirmButtonText: "Cool, don't show again!"
        }, function (isConfirm) {
            if (isConfirm) {
                localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.MONGO_BINARY_INFO, "true");
            }
        });
    }
};

Template.navigation.events({
    'click .anchor-skin' (e){
        const body = $('body');
        const skin = e.currentTarget.id;
        localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.MONGOCLIENT_SKIN, skin);
        body.removeClass('skin-1');
        body.removeClass('skin-2');
        body.removeClass('skin-3');
        if (skin !== 'skin-default') body.addClass(skin);
    },

    'click #anchorShell'(e) {
        e.preventDefault();
        let connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});

        if (connection.ssl && connection.ssl.enable) {
            toastr.info('Unfortunately, this feature is not usable in SSL connections yet');
            return;
        }

        FlowRouter.go('/shell');
        showMongoBinaryInfo();
    },

    'click #anchorSchemaAnalyzer'() {
        showMongoBinaryInfo();
    },

    'click #anchorDatabaseDumpRestore'() {
        showMongoBinaryInfo();
    },

    'click #btnRefreshCollections' (e) {
        e.preventDefault();
        connect(true);
    },

    'click #btnDropAllCollections' (e) {
        e.preventDefault();
        dropAllCollections();
    },

    'click #btnDropDatabase' (e) {
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
            Meteor.call('dropDB', Meteor.default_connection._lastSessionId, function (err, result) {
                if (err || result.error) {
                    Helper.showMeteorFuncError(err, result, "Couldn't drop database");
                }
                else {
                    Helper.clearSessions();
                    swal({
                        title: "Dropped!",
                        text: "Successfuly dropped database ",
                        type: "success"
                    });
                }
            });
        });
    },


    'click .aNavigations' () {
        handleNavigationAndSessions();
    },

    'click .navCollection' (e) {
        if (e.target.id == 'btnDropCollection') {
            return;
        }

        const name = this.name;

        $('#listCollectionNames').find('li').each(function (index, li) {
            const liObject = $(li);
            if (liObject[0].textContent.substr(1).replace('Drop', '').trim() == name) {
                liObject.addClass('active');
            }
            else {
                liObject.removeClass('active');
            }
        });

        $('#listSystemCollections').find('li').each(function (index, li) {
            const liObject = $(li);
            if (liObject[0].textContent.substr(1).replace('Drop', '').trim() == name) {
                liObject.addClass('active');
            } else {
                liObject.removeClass('active');
            }
        });


        Session.set(Helper.strSessionSelectedCollection, name);
    }
});

Template.navigation.onRendered(function () {
    const filterModal = $('#collectionFilterModal');
    filterModal.on('shown.bs.modal', function () {
        initializeFilterTable();
    });

    const addCollectionModal = $('#collectionAddModal');
    addCollectionModal.on('shown.bs.modal', function () {
        resetForm();
        if (addCollectionModal.data('is-view')) {
            initializeForm(addCollectionModal.data('is-view'));
        }
    });

    const convertToCappedModal = $('#convertToCappedModal');
    convertToCappedModal.on('shown.bs.modal', function () {
        resetCappedForm();
    });

    const renameModal = $('#renameCollectionModal');
    renameModal.on('shown.bs.modal', function () {
        resetRenameForm();
    });

    const validationRulesModal = $('#validationRulesModal');
    validationRulesModal.on('shown.bs.modal', function () {
        resetValidationRulesForm();
    });

    $.contextMenu({
        selector: ".navCollection, .navCollectionTop",
        build: function (trigger) {
            let items = {
                manage_collection: {
                    name: "Manage",
                    icon: "fa-pencil",
                    items: {
                        view_collection: {
                            name: "Show Collection/View",
                            icon: "fa-book",
                            callback: function () {
                                if ($(this) && $(this).context && $(this).context.innerText) {
                                    const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                                    addCollectionModal.data('is-view', collectionName);
                                    addCollectionModal.modal({
                                        backdrop: 'static',
                                        keyboard: false
                                    });
                                }
                            }
                        },

                        convert_to_capped: {
                            icon: "fa-level-down",
                            name: "Convert to Capped",
                            callback: function () {
                                const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                                convertToCappedModal.data('collection', collectionName);
                                convertToCappedModal.modal('show');
                            }
                        },

                        rename_collection: {
                            icon: "fa-pencil-square-o",
                            name: "Rename",
                            callback: function () {
                                const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                                renameModal.data('collection', collectionName);
                                renameModal.modal('show');
                            }
                        },

                        clone_collection: {
                            icon: "fa-clone",
                            name: "Clone",
                            callback: function () {
                                const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                                swal({
                                        title: "Collection Name",
                                        text: "Please type collection name",
                                        type: "input",
                                        showCancelButton: true,
                                        closeOnConfirm: false,
                                        confirmButtonColor: "#DD6B55",
                                        inputPlaceholder: "Collection Name",
                                        inputValue: collectionName
                                    },
                                    function (inputValue) {
                                        if (!inputValue) {
                                            swal.showInputError("You need to write something!");
                                            return false;
                                        }

                                        swal("Creating...", "Please wait while " + inputValue + " is being created, collections will be refreshed automatically !", "info");

                                        Meteor.call("aggregate", collectionName, [{$match: {}}, {$out: inputValue}], {}, Meteor.default_connection._lastSessionId, function (err, result) {
                                                if (err || result.error) {
                                                    Helper.showMeteorFuncError(err, result, "Couldn't clone ");
                                                }
                                                else {
                                                    connect(true, "Successfully cloned collection " + collectionName + " as " + inputValue);
                                                    swal.close();
                                                }
                                            }
                                        );
                                    });
                            }
                        },

                        validation_rules: {
                            icon: "fa-check-circle",
                            name: "Edit Validation Rules",
                            callback: function () {
                                const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                                validationRulesModal.data('collection', collectionName);
                                validationRulesModal.modal('show');
                            }
                        },

                        clear_collection: {
                            name: "Clear Collection",
                            icon: "fa-remove",
                            callback: function () {
                                if ($(this) && $(this).context && $(this).context.innerText) {
                                    const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                                    swal({
                                        title: "Are you sure?",
                                        text: collectionName + " collection's all data will be wiped, are you sure ?",
                                        type: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#DD6B55",
                                        confirmButtonText: "Yes, clear it!",
                                        closeOnConfirm: true
                                    }, function (isConfirm) {
                                        if (isConfirm) {
                                            clearCollection(collectionName);
                                        }
                                    });
                                } else {
                                    toastr.warning('No collection selected !');
                                }
                            }
                        }
                    }
                },

                add_collection: {
                    name: "Add Collection/View",
                    icon: "fa-plus",
                    callback: function () {
                        addCollectionModal.data('is-view', '');
                        addCollectionModal.modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                    }
                },
                filter_collections: {
                    name: "Filter Collections",
                    icon: "fa-filter",
                    callback: function () {
                        filterModal.modal('show');
                    }
                },
                clear_filter: {
                    name: "Clear Filter",
                    icon: "fa-minus-circle",
                    callback: function () {
                        setExcludedCollectionsByFilter([]);
                        setFilterRegex("");
                    }
                },
                refresh_collections: {
                    name: "Refresh Collections",
                    icon: "fa-refresh",
                    callback: function () {
                        connect(true);
                    }
                },
                drop_collection: {
                    name: "Drop Collection",
                    icon: "fa-trash",
                    callback: function () {
                        if ($(this) && $(this).context && $(this).context.innerText) {
                            const collectionName = $(this).context.innerText.substring(1).split(' ')[0];
                            swal({
                                title: "Are you sure?",
                                text: collectionName + " collection will be dropped, are you sure ?",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Yes, drop it!",
                                closeOnConfirm: true
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    dropCollection(collectionName);
                                }
                            });
                        } else {
                            toastr.warning('No collection selected !');
                        }
                    }
                },
                drop_collections: {
                    name: "Drop All Collections",
                    icon: "fa-ban",
                    callback: function () {
                        dropAllCollections();
                    }
                }
            };

            if (trigger.hasClass('navCollectionTop')) {
                delete items.manage_collection;
                delete items.sep1;
            }

            if (!isFiltered()) {
                delete items.clear_filter;
            }

            return {
                items: items
            };
        }
    });
});

Template.navigation.helpers({
    equals (a, b){
        return a === b;
    },

    getServerList(){
        let result = '';
        let connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
        for (let server of connection.servers) {
            result += server.host + ':' + server.port + '<br/>';
        }

        return result;
    },

    initializeMetisMenu() {
        Meteor.setTimeout(function () {
            const sideMenu = $('#side-menu');
            sideMenu.removeData("mm");
            sideMenu.metisMenu();
        });
    },

    filtered (){
        return isFiltered();
    },

    getCollectionNames () {
        const collectionNames = Session.get(Helper.strSessionCollectionNames);
        if (collectionNames != undefined) {
            const result = [];
            collectionNames.forEach(function (collectionName) {
                if (filterRegex.get() && !collectionName.name.match(new RegExp(filterRegex.get(), "i"))) {
                    return;
                }
                if ($.inArray(collectionName.name, excludedCollectionsByFilter.get()) !== -1) {
                    return;
                }

                if (!collectionName.name.startsWith('system')) {
                    result.push(collectionName);
                }
            });

            return result;
        }

        return collectionNames;
    },

    getSystemCollectionNames () {
        const collectionNames = Session.get(Helper.strSessionCollectionNames);
        if (collectionNames != undefined) {
            const result = [];
            collectionNames.forEach(function (collectionName) {
                if (filterRegex.get() && !collectionName.name.match(new RegExp(filterRegex.get(), "i"))) {
                    return;
                }
                if ($.inArray(collectionName.name, excludedCollectionsByFilter.get()) !== -1) {
                    return;
                }

                if (collectionName.name.startsWith('system')) {
                    result.push(collectionName);
                }
            });

            return result;
        }

        return collectionNames;
    }
});