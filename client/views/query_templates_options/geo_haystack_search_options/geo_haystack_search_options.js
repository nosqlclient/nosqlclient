import {Template} from 'meteor/templating';
import Helper from '/client/helper';
import Enums from '/lib/enums';
import {Session} from 'meteor/session';

/**
 * Created by RSercan on 2.1.2016.
 */
Template.search.onRendered(function () {
    Helper.initializeCodeMirror($('#divSearch'), 'txtSearch');
});

export const getOptions = function () {
    var result = {};
    Helper.checkAndAddOption("SEARCH", $('#divSearch'), result, Enums.GEO_HAYSTACK_SEARCH_OPTIONS);

    if ($.inArray("MAX_DISTANCE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var maxDistanceValue = $('#inputMaxDistance').val();
        if (maxDistanceValue) {
            result[Enums.GEO_HAYSTACK_SEARCH_OPTIONS.MAX_DISTANCE] = parseInt(maxDistanceValue);
        }
    }

    if ($.inArray("LIMIT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var limitVal = $('#inputLimit').val();
        if (limitVal) {
            result[GEO_HAYSTACK_SEARCH_OPTIONS.LIMIT] = parseInt(limitVal);
        }
    }

    return result;
};