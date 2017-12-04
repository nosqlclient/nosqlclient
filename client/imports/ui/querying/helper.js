import Helper from '/client/imports/helpers/helper';

const QueryingHelper = function () {

};

QueryingHelper.prototype = {
  closeAllTabs(resultTabs) {
    resultTabs.find('li').each((idx, li) => {
      const select = $(li);
      $(select.children('a').attr('href')).remove();
      select.remove();
    });
  },

  hideSaveFootersIfNecessary(resultTabs) {
    if (resultTabs.find('li').length === 0 || resultTabs.find('li.active').length === 0) {
      $('#divBrowseCollectionFooter').hide();
      $('#divBrowseCollectionFindFooter').hide();
    }
  },

  initializeTabContextMenu(getActiveTabHeader) {
    const self = this;
    $.contextMenu({
      selector: '#resultTabs li',
      items: {
        close_others: {
          name: Helper.translate({ key: 'close_others' }),
          icon: 'fa-times-circle',
          callback() {
            const tabId = $(this).children('a').attr('href');
            const resultTabs = $('#resultTabs').find('li');
            resultTabs.each((idx, li) => {
              const select = $(li);
              if (select.children('a').attr('href') !== tabId) {
                $(select.children('a').attr('href')).remove();
                select.remove();
              }
            });

            if (getActiveTabHeader) {
              const activeTabHeader = getActiveTabHeader();
              if (activeTabHeader !== 'findOne') $('#divBrowseCollectionFooter').hide();
              if (activeTabHeader !== 'find') $('#divBrowseCollectionFindFooter').hide();
            }
          },
        },
        close_all: {
          name: Helper.translate({ key: 'close_all' }),
          icon: 'fa-times',
          callback() {
            const resultTabs = $('#resultTabs');
            self.closeAllTabs(resultTabs);
            self.hideSaveFootersIfNecessary(resultTabs);
          },
        },
      },
    });
  },

  getRelatedDom(param) {
    let capitalizedParam;
    if (param === 'query') capitalizedParam = 'Selector';
    else if (param === 'projection') capitalizedParam = 'Project';
    else capitalizedParam = param.charAt(0).toUpperCase() + param.slice(1);

    const relatedJqueryDiv = $(`#${`div${capitalizedParam}`}`);
    const relatedJqueryInput = $(`#${`input${capitalizedParam}`}`);

    return { relatedJqueryDiv, relatedJqueryInput };
  }
};

export default new QueryingHelper();
