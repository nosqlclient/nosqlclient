/**
 * Created by Sercan on 30.10.2016.
 */

import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';

import './breaking_changes.html';

Template.breakingChanges.onRendered(function () {
    let modal = $('#breakingChangesModal');
    modal.on('shown.bs.modal', function () {
        let div = $('#divQueryExamples');
        Helper.initializeCodeMirror(div, 'txtQueryExamples');
        div.data('editor').setValue(getExamples());
        div.data('editor').setOption("readOnly", true);
    });
});

Template.breakingChanges.events({
    'click #btnNext'(e) {
        $('#page1').hide();
        $('#page2').show();

        $('#btnPrevious').prop('disabled', false);
        $('#btnNext').prop('disabled', true);
    },

    'click #btnPrevious'(e) {
        $('#page2').hide();
        $('#page1').show();

        $('#btnPrevious').prop('disabled', true);
        $('#btnNext').prop('disabled', false);
    },
});

const getExamples = function () {
    let str = "// all extended json types are will be converted to BSON types\n";
    str += "{_id:{$oid:\"507f191e810c19729de860ea\"}}\n";
    str += "{myDate:{$gte:{$date:\"2017-01-01T12:25:05Z\"}}}  // ISO-8601 as mongodb supports it\n";
    str += "{myDate:{$gte:{$date:\"2017-01-01T13:20\"}}}  // all date convertible formats are supported\n";
    str += "{myDate:{$gte:{$date:\"2017-01-01\"}}}\n";
    str += "// also objectID and ISODate querying are supported as how it works in shell\n";
    str += "{_id:ObjectId(\"507f191e810c19729de860ea\")}\n";
    str += "{myDate:{$gte:ISODate(\"2017-01-01\")}}\n";
    str += "// and they're case insensitive, whitespace is ignored\n";
    str += "{_id:   objectID   (\"507f191e810c19729de860ea\")}\n";
    str += "{myDate:{$gte: isoDaTe    (\"2017-01-01\")}}\n";
    str += "// even you can use date instead of ISODate\n";
    str += "{myDate:{$gte: date    (\"2017-01-01\")}}\n";
    str += "{myDate:{$gte:  new date    (\"2017-01-01\")}}\n";

    return str;
};