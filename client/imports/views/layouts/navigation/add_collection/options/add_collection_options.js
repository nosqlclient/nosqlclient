import {Template} from "meteor/templating";
import {Session} from "meteor/session";
import Enums from "/lib/imports/enums";
import Helper from "/client/imports/helper";
import "./add_collection_options.html";
import $ from "jquery";

export const getOptions = function () {
    const result = {};

    if ($.inArray("CAPPED", Session.get(Helper.strSessionSelectedAddCollectionOptions)) != -1) {
        result[Enums.ADD_COLLECTION_OPTIONS.CAPPED] = true;
        const maxDocs = $('#inputCappedCollectionMaxDocs').val();
        const size = $('#inputCappedCollectionSize').val();
        if (maxDocs) {
            result.max = parseInt(maxDocs);
        }
        if (size) {
            result.size = parseInt(size);
        }
    }

    if ($.inArray("FLAGS", Session.get(Helper.strSessionSelectedAddCollectionOptions)) != -1) {
        result[Enums.ADD_COLLECTION_OPTIONS.FLAGS] = getFlagValue();
    }

    if ($.inArray("INDEX_OPTION_DEFAULTS", Session.get(Helper.strSessionSelectedAddCollectionOptions)) != -1) {
        let val = Helper.getCodeMirrorValue($('#divIndexOptionDefaults'));
        if (val == "") result[Enums.ADD_COLLECTION_OPTIONS.INDEX_OPTION_DEFAULTS] = {};
        else {
            val = Helper.convertAndCheckJSON(val);
            if (val['ERROR']) {
                result["ERROR"] = "Syntax Error on Index Option Defaults: " + val['ERROR'];
            } else {
                result[Enums.ADD_COLLECTION_OPTIONS.INDEX_OPTION_DEFAULTS] = val;
            }
        }
    }

    return result;
};

const getFlagValue = function () {
    const twoSizesIndexes = $('#divTwoSizesIndexes').iCheck('update')[0].checked;
    const noPadding = $('#divNoPadding').iCheck('update')[0].checked;
    if (!twoSizesIndexes && !noPadding) {
        return 0;
    } else if (twoSizesIndexes && !noPadding) {
        return 1;
    } else if (!twoSizesIndexes && noPadding) {
        return 2;
    } else if (twoSizesIndexes && noPadding) {
        return 3;
    }

};

const initICheck = function (selector) {
    selector.iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
};

Template.addCollectionOptions.helpers({
    isAddCollectionOptionSelected (opt){
        return $.inArray(opt, Session.get(Helper.strSessionSelectedAddCollectionOptions)) !== -1;
    }
});

Template.indexOptionDefaults.onRendered(function () {
    Helper.initializeCodeMirror($('#divIndexOptionDefaults'), 'txtIndexOptionDefaults');
});

Template.flags.onRendered(function () {
    initICheck($('#divNoPadding, #divTwoSizesIndexes'));
    $('#inputNoPadding').iCheck('uncheck');
    $('#inputTwoSizesIndexes').iCheck('uncheck');
});

