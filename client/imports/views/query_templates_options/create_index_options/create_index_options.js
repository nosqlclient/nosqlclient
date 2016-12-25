import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';
import {$} from 'meteor/jquery';

import '/client/imports/views/query_templates_options/min/min';
import '/client/imports/views/query_templates_options/max/max';
import '/client/imports/views/query_templates_options/collation/collation';
import './create_index_options.html';


/**
 * Created by RSercan on 2.1.2016.
 */

Template.dropDups.onRendered(function () {
    $('#divDropDups').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.unique.onRendered(function () {
    $('#divUnique').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.sparse.onRendered(function () {
    $('#divSparse').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.background.onRendered(function () {
    $('#divBackground').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

export const getOptions = function () {
    const result = {};
    Helper.checkAndAddOption("MAX", $('#divMax'), result, Enums.CREATE_INDEX_OPTIONS);
    Helper.checkAndAddOption("MIN", $('#divMin'), result, Enums.CREATE_INDEX_OPTIONS);
    Helper.checkAndAddOption("COLLATION", $('#divCollation'), result, Enums.CREATE_INDEX_OPTIONS);

    if ($.inArray("UNIQUE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const uniqueVal = $('#divUnique').iCheck('update')[0].checked;
        if (uniqueVal) {
            result[Enums.CREATE_INDEX_OPTIONS.UNIQUE] = uniqueVal;
        }
    }

    if ($.inArray("DROP_DUPS", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const dropDups = $('#divDropDups').iCheck('update')[0].checked;
        if (dropDups) {
            result[Enums.CREATE_INDEX_OPTIONS.DROP_DUPS] = dropDups;
        }
    }

    if ($.inArray("EXPIRE_AFTER_SECONDS", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const expire = $('#inputExpireAfterSeconds').val();
        if (expire) {
            result[Enums.CREATE_INDEX_OPTIONS.EXPIRE_AFTER_SECONDS] = parseInt(expire);
        }
    }

    if ($.inArray("SPARSE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const sparseVal = $('#divSparse').iCheck('update')[0].checked;
        if (sparseVal) {
            result[Enums.CREATE_INDEX_OPTIONS.SPARSE] = sparseVal;
        }
    }

    if ($.inArray("BACKGROUND", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const backgroundVal = $('#divBackground').iCheck('update')[0].checked;
        if (backgroundVal) {
            result[Enums.CREATE_INDEX_OPTIONS.BACKGROUND] = backgroundVal;
        }
    }

    if ($.inArray("NAME", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const name = $('#inputIndexName').val();
        if (name) {
            result[Enums.CREATE_INDEX_OPTIONS.NAME] = name;
        }
    }

    return result;
};