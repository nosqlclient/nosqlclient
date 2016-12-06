import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {renderCollectionNames} from '../navigation';

import './add_collection.html';

var toastr = require('toastr');
var Ladda = require('ladda');

/**
 * Created by RSercan on 20.2.2016.
 */
Template.addCollection.onRendered(function () {
    initICheck('divIsCapped', false);
});

Template.addCollection.events({
    'click #btnCreateCollection'(e) {
        e.preventDefault();

        var isCapped = $('#divIsCapped').iCheck('update')[0].checked;
        var collectionName = $('#inputCollectionName').val();
        var size = $('#inputCollectionSize').val();
        var maxDocs = $('#inputMaxDocSize').val();

        if (!collectionName) {
            toastr.error('Collection name is required !');
            return;
        }

        var options = {
            size: size,
            capped: isCapped,
            max: maxDocs
        };


        var laddaButton = Ladda.create(document.querySelector('#btnCreateCollection'));
        laddaButton.start();

        Meteor.call('createCollection', collectionName, options, function (err) {
            if (err) {
                toastr.error("Couldn't create collection: " + err.message);

                Ladda.stopAll();
                return;
            }

            renderCollectionNames();
            $('#collectionAddModal').modal('hide');
            toastr.success('Successfuly created collection: ' + collectionName);

            Ladda.stopAll();
        });
    }
});

const initICheck = function (id, checked) {
    var selector = $('#' + id);
    selector.iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    if (checked) {
        selector.iCheck('check');
    } else {
        selector.iCheck('uncheck');
    }
};