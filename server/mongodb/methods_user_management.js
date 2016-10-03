/**
 * Created by RSercan on 10.1.2016.
 */
var cheerio = require('cheerio');

Meteor.methods({
    'getAllActions': function () {
        var action = Actions.findOne();
        if (action && action.actionList) {
            return action.actionList;
        }

        LOGGER.info('[crawl]', 'getAllActions');

        var url = "https://docs.mongodb.org/manual/reference/privilege-actions";
        $ = load(url);
        fixHrefs(url, $);

        var result = [];

        $("dl[class='authaction']").children('dt').each(function () {
            result.push($(this).attr('id').replace('authr.', ''));
        });

        Meteor.call('saveActions', {actionList: result});
        return result;
    },

    'getActionInfo': function (action) {
        LOGGER.info('[crawl]', 'getAction', action);

        var url = "https://docs.mongodb.org/manual/reference/privilege-actions";
        $ = load(url);
        fixHrefs(url, $);

        return $("dt[id='authr." + action + "']").parent('dl[class=authaction]').children('dd').html();
    },

    'getRoleInfo': function (roleName) {
        LOGGER.info('[crawl]', 'getRoleInfo', roleName);

        var url = "https://docs.mongodb.org/manual/reference/built-in-roles";

        $ = load(url + "/#" + roleName);
        var result = 'It looks like a user-defined role';

        $('.authrole').each(function () {
            if ($(this).children('dt').attr('id') == roleName) {
                fixHrefs(url, $);
                result = $(this).children('dd').html();
            }
        });

        return result;
    },

    'getResourceInfo': function (resource) {
        LOGGER.info('[crawl]', 'getResourceInfo', resource);

        var url = "https://docs.mongodb.org/manual/reference/resource-document";
        $ = load(url);

        fixHrefs(url, $);

        if (resource == 'cluster') {
            return $('div[id=cluster-resource]').html();
        }

        if (resource == 'anyResource') {
            return $('div[id=anyresource]').html();
        }

        if (resource == 'db+collection') {
            return $('div[id=specify-a-collection-of-a-database-as-resource]').html();
        }

        if (resource == 'db') {
            return $('div[id=specify-a-database-as-resource]').html();
        }

        if (resource == 'collection') {
            return $('div[id=specify-collections-across-databases-as-resource]').html();
        }

        if (resource == 'non-system') {
            return $('div[id=specify-all-non-system-collections-in-all-databases]').html();
        }

        return "Couldn't find corresponding resource document in docs.mongodb.org";
    }

});

var fixHrefs = function (url, $) {
    var hrefs = $('a[href]');

    // fix all hrefs
    hrefs.attr('href', function (i, href) {
        var tmpUrl = url;
        while (href.indexOf('..') != -1) {
            href = href.substring(3);
            tmpUrl = tmpUrl.substring(0, tmpUrl.lastIndexOf('/'));
        }
        return tmpUrl + '/' + href;
    });

    hrefs.each(function () {
        $(this).attr('data-clipboard-text', $(this).attr('href'));
        $(this).replaceWith($(this).not('.headerlink'));
    });
};

var load = function (url) {
    var content = Meteor.http.get(url).content;
    return cheerio.load(content);
};