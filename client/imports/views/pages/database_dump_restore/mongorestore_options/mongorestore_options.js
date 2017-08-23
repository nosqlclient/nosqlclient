import {$} from "meteor/jquery";
import "./mongorestore_options.html";

export const getMongorestoreArgs = function () {
    let result = [];

    const args = $('#cmbMongorestoreArgs').val();
    if (!args) return result;
    for (let arg of args) {
        const argElement = $("#mongorestore" + arg);
        result.push(arg);

        if (argElement.length !== 0) result.push(argElement.val());
    }

    return result;
};