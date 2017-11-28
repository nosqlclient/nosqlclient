import { Meteor } from 'meteor/meteor';
import { Database, Logger } from '/server/imports/modules';

const cheerio = require('cheerio');

const MongoDBUser = function () {};

const fixHrefs = function fixHrefs(url, loadedUrl) {
  const hrefs = loadedUrl('a[href]');

  // fix all hrefs
  hrefs.attr('href', (i, href) => {
    let tmpUrl = url;
    while (href.indexOf('..') !== -1) {
      href = href.substring(3);
      tmpUrl = tmpUrl.substring(0, tmpUrl.lastIndexOf('/'));
    }
    return `${tmpUrl}/${href}`;
  });

  hrefs.each(function fixOne() {
    loadedUrl(this).attr('data-clipboard-text', loadedUrl(this).attr('href'));
    loadedUrl(this).replaceWith(loadedUrl(this).not('.headerlink'));
  });
};

const load = url => cheerio.load(Meteor.http.get(url).content);

MongoDBUser.prototype = {
  getAllActions() {
    const action = Database.readOne({ type: Database.types.Actions, query: {} });
    if (action && action.actionList && action.actionList.length > 0) return action.actionList;

    Logger.info({ message: 'crawl-get-all-actions' });

    const url = 'https://docs.mongodb.org/manual/reference/privilege-actions';
    const loadedUrl = load(url);
    fixHrefs(url, loadedUrl);

    const result = [];

    loadedUrl("dl[class='authaction']").children('dt').each(function dt() {
      result.push(loadedUrl(this).attr('id').replace('authr.', ''));
    });

    Database.remove({ type: Database.types.Actions, selector: {} });
    Database.insert({ type: Database.types.Actions, document: { actionList: result } });
    return result;
  },

  getActionInfo({ action }) {
    Logger.info({ message: 'crawl-get-action', metadataToLog: { action } });

    const url = 'https://docs.mongodb.org/manual/reference/privilege-actions';
    const loadedUrl = load(url);
    fixHrefs(url, loadedUrl);

    return loadedUrl(`dt[id='${action}']`).parent('dl[class=authaction]').children('dd').html();
  },

  getRoleInfo({ roleName }) {
    Logger.info({ message: 'crawl-get-role-info', metadataToLog: { roleName } });

    const url = 'https://docs.mongodb.org/manual/reference/built-in-roles';

    const loadedUrl = load(`${url}/#${roleName}`);
    let result = 'It looks like a user-defined role';

    loadedUrl('.authrole').each(function authRole() {
      if (loadedUrl(this).children('dt').attr('id') === roleName) {
        fixHrefs(url, loadedUrl);
        result = loadedUrl(this).children('dd').html();
      }
    });

    return result;
  },

  getResourceInfo({ resource }) {
    Logger.info({ message: 'crawl-get-resource-info', metadataToLog: { resource } });

    const url = 'https://docs.mongodb.org/manual/reference/resource-document';
    const loadedUrl = load(url);

    fixHrefs(url, loadedUrl);

    switch (resource) {
      case 'cluster':
        return loadedUrl('div[id=cluster-resource]').html();

      case 'anyResource':
        return loadedUrl('div[id=anyresource]').html();

      case 'db+collection':
        return loadedUrl('div[id=specify-a-collection-of-a-database-as-resource]').html();

      case 'db':
        return loadedUrl('div[id=specify-a-database-as-resource]').html();

      case 'collection':
        return loadedUrl('div[id=specify-collections-across-databases-as-resource]').html();

      case 'non-system':
        return loadedUrl('div[id=specify-all-non-system-collections-in-all-databases]').html();

      default:
        return "Couldn't find corresponding resource document in docs.mongodb.org";
    }
  }
};

export default new MongoDBUser();
