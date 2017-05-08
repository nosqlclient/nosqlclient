/**
 * Created by RSercan on 10.1.2016.
 */
import {Meteor} from "meteor/meteor";
import {Actions} from "/lib/imports/collections/actions";
import LOGGER from "../internal/logger";

const cheerio = require('cheerio');

const fixHrefs = function (url, loadedUrl) {
    let hrefs = loadedUrl('a[href]');

    // fix all hrefs
    hrefs.attr('href', function (i, href) {
        let tmpUrl = url;
        while (href.indexOf('..') != -1) {
            href = href.substring(3);
            tmpUrl = tmpUrl.substring(0, tmpUrl.lastIndexOf('/'));
        }
        return tmpUrl + '/' + href;
    });

    hrefs.each(function () {
        loadedUrl(this).attr('data-clipboard-text', loadedUrl(this).attr('href'));
        loadedUrl(this).replaceWith(loadedUrl(this).not('.headerlink'));
    });
};

const load = function (url) {
    return cheerio.load(Meteor.http.get(url).content);
};

Meteor.methods({
    getAllActions() {
        let action = Actions.findOne();
        if (action && action.actionList) {
            return action.actionList;
        }

        LOGGER.info('[crawl]', 'getAllActions');

        let url = "https://docs.mongodb.org/manual/reference/privilege-actions";
        let loadedUrl = load(url);
        fixHrefs(url, loadedUrl);

        let result = [];

        loadedUrl("dl[class='authaction']").children('dt').each(function () {
            result.push(loadedUrl(this).attr('id').replace('authr.', ''));
        });

        Meteor.call('saveActions', {actionList: result});
        return result;
    },

    getActionInfo(action) {
        LOGGER.info('[crawl]', 'getAction', action);

        let url = "https://docs.mongodb.org/manual/reference/privilege-actions";
        let loadedUrl = load(url);
        fixHrefs(url, loadedUrl);

        return loadedUrl("dt[id='" + action + "']").parent('dl[class=authaction]').children('dd').html();
    },

    getRoleInfo(roleName) {
        LOGGER.info('[crawl]', 'getRoleInfo', roleName);

        let url = "https://docs.mongodb.org/manual/reference/built-in-roles";

        let loadedUrl = load(url + "/#" + roleName);
        let result = 'It looks like a user-defined role';

        loadedUrl('.authrole').each(function () {
            if (loadedUrl(this).children('dt').attr('id') == roleName) {
                fixHrefs(url, loadedUrl);
                result = loadedUrl(this).children('dd').html();
            }
        });

        return result;
    },

    getResourceInfo(resource) {
        LOGGER.info('[crawl]', 'getResourceInfo', resource);

        let url = "https://docs.mongodb.org/manual/reference/resource-document";
        let loadedUrl = load(url);

        fixHrefs(url, loadedUrl);

        if (resource == 'cluster') {
            return loadedUrl('div[id=cluster-resource]').html();
        }

        if (resource == 'anyResource') {
            return loadedUrl('div[id=anyresource]').html();
        }

        if (resource == 'db+collection') {
            return loadedUrl('div[id=specify-a-collection-of-a-database-as-resource]').html();
        }

        if (resource == 'db') {
            return loadedUrl('div[id=specify-a-database-as-resource]').html();
        }

        if (resource == 'collection') {
            return loadedUrl('div[id=specify-collections-across-databases-as-resource]').html();
        }

        if (resource == 'non-system') {
            return loadedUrl('div[id=specify-all-non-system-collections-in-all-databases]').html();
        }

        return "Couldn't find corresponding resource document in docs.mongodb.org";
    }

});