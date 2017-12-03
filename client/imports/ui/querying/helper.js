const QueryingHelper = function () {

};

QueryingHelper.prototype = {
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
