/**
 * Created by RSercan on 10.1.2016.
 */
Meteor.methods({
    'getRoleInfo': function (roleName) {
        LOGGER.info('[crawl]', roleName);

        var cheerio = Meteor.npmRequire('cheerio');
        var content = Meteor.http.get("https://docs.mongodb.org/manual/reference/built-in-roles/#" + roleName).content;
        $ = cheerio.load(content);
        var result = 'It looks like a user-defined role';

        $('.authrole').each(function (i, elem) {
            if ($(this).children('dt').attr('id') == roleName) {
                var hrefs = $('a[href]');

                // fix all hrefs
                hrefs.attr('href', function (i, href) {
                    if (href.indexOf('..') != -1) {
                        href = href.substring(3);
                    }
                    return 'https://docs.mongodb.org/manual/reference/' + href;
                });

                hrefs.each(function (i, elem) {
                    $(this).attr('data-clipboard-text', $(this).attr('href'));
                });

                result = $(this).children('dd').html();
            }
        });

        return result;
    }

});