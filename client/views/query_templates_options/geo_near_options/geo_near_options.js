/**
 * Created by RSercan on 3.1.2016.
 */
Template.spherical.onRendered(function () {
    $('#divSpherical').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.uniqueDocs.onRendered(function () {
    $('#divUniqueDocs').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.includeLocs.onRendered(function () {
    $('#divIncludeLocs').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.geoNearOptions.getOptions = function () {
    var result = {};
    Template.checkAceEditorOption("QUERY", "aceSelector", result, GEO_NEAR_OPTIONS);

    if ($.inArray("MAX_DISTANCE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var maxDistanceValue = $('#inputMaxDistance').val();
        if (maxDistanceValue) {
            result[GEO_NEAR_OPTIONS.MAX_DISTANCE] = parseInt(maxDistanceValue);
        }
    }

    if ($.inArray("MIN_DISTANCE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var minDistanceValue = $('#inputMinDistance').val();
        if (minDistanceValue) {
            result[GEO_NEAR_OPTIONS.MIN_DISTANCE] = parseInt(minDistanceValue);
        }
    }

    if ($.inArray("MAX_NUMBER", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var num = $('#inputMaxNumber').val();
        if (num) {
            result[GEO_NEAR_OPTIONS.MAX_NUMBER] = parseInt(num);
        }
    }

    if ($.inArray("DISTANCE_MULTIPLIER", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var distMultiplier = $('#inputDistanceMultiplier').val();
        if (distMultiplier) {
            result[GEO_NEAR_OPTIONS.DISTANCE_MULTIPLIER] = parseInt(distMultiplier);
        }
    }

    if ($.inArray("SPHERICAL", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var spherical = $('#divSpherical').iCheck('update')[0].checked;
        if (spherical) {
            result[GEO_NEAR_OPTIONS.SPHERICAL] = spherical;
        }
    }

    if ($.inArray("UNIQUE_DOCS", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var uniqueDocs = $('#divUniqueDocs').iCheck('update')[0].checked;
        if (uniqueDocs) {
            result[GEO_NEAR_OPTIONS.UNIQUE_DOCS] = uniqueDocs;
        }
    }

    if ($.inArray("INCLUDE_LOCS", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var includeLocs = $('#divIncludeLocs').iCheck('update')[0].checked;
        if (includeLocs) {
            result[GEO_NEAR_OPTIONS.INCLUDE_LOCS] = includeLocs;
        }
    }

    return result;
};