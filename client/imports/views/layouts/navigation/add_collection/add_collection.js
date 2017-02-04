import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {renderCollectionNames} from '../navigation';

import './add_collection.html';

const toastr = require('toastr');
const Ladda = require('ladda');

/**
 * Created by RSercan on 20.2.2016.
 */
Template.addCollection.onRendered(function () {
    initICheck('divIsCapped', false);
});

Template.addCollection.events({
    'click #btnCreateCollection'(e) {
        e.preventDefault();

        const isCapped = $('#divIsCapped').iCheck('update')[0].checked;
        let collectionName = $('#inputCollectionName').val();
        const size = $('#inputCollectionSize').val();
        const maxDocs = $('#inputMaxDocSize').val();

        if (!collectionName) {
            toastr.error('Collection name is required !');
            return;
        }

        Ladda.create(document.querySelector('#btnCreateCollection')).start();

        Meteor.call('createCollection', collectionName,  {
            size: size,
            capped: isCapped,
            max: maxDocs
        }, function (err) {
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
    const selector = $('#' + id);
    selector.iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    if (checked) {
        selector.iCheck('check');
    } else {
        selector.iCheck('uncheck');
    }
};