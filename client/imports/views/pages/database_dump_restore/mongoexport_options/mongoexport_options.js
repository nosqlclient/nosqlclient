import {$} from "meteor/jquery";
import "./mongoexport_options.html";
import Helper from "/client/imports/helper";
import {Template} from "meteor/templating";

const toastr = require('toastr');

export const getMongoexportOptions = function () {
    let result = [];

    const args = $('#cmbMongoexportArgs').val();
    if (!args) return result;
    for (let arg of args) {
        const argElement = $("#mongoexport" + arg);
        result.push(arg);

        if (arg === '--query') {
            let query = Helper.getCodeMirrorValue($('#mongoexport--query'));
            query = Helper.convertAndCheckJSON(query);
            if (query["ERROR"]) {
                toastr.error("Syntax error on query: " + query["ERROR"]);
                return null;
            }
            result.push(JSON.stringify(query));
        }
        else if (arg === '--sort') {
            let sort = Helper.getCodeMirrorValue($('#mongoexport--sort'));
            sort = Helper.convertAndCheckJSON(sort);
            if (sort["ERROR"]) {
                toastr.error("Syntax error on query: " + sort["ERROR"]);
                return null;
            }
            result.push(JSON.stringify(sort));
        }
        else if (argElement.length !== 0) result.push(argElement.val());
    }

    return result;
};

Template.sortTemplate.onRendered(function () {
    Helper.initializeCodeMirror($('#mongoexport--sort'), 'txtSort', false, 100, true);

});