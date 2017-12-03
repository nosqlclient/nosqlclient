import { SessionManager, UIComponents, ExtendedJSON } from '/client/imports/modules';
import $ from 'jquery';
import Helper from '/client/imports/helpers/helper';
import QueryingHelper from './helper';

const Options = function () {
};

const fillDivInputs = function (relatedJqueryDiv, key, result, relatedJqueryInput) {
  if (relatedJqueryDiv.data('editor')) {
    let val = UIComponents.Editor.getCodeMirrorValue(relatedJqueryDiv);

    if (!val.startsWith('function')) {
      val = ExtendedJSON.convertAndCheckJSON(val);
      if (val.ERROR) result.ERROR = Helper.translate({ key: `syntax-error-${key}`, options: { error: val.ERROR } });
      else result[key] = val;
    } else result[key] = val;
  } else if (relatedJqueryDiv.find('input:checkbox').length !== 0) result[key] = relatedJqueryInput.iCheck('update')[0].checked;
};

const fillInputs = function (relatedJqueryInput, result, key) {
  const val = relatedJqueryInput.val();
  if (Number.isNaN(parseInt(val, 10))) result[key] = val;
  else result[key] = parseInt(val, 10);
};

Options.prototype = {
  getOptions(optionEnum) {
    const result = {};
    const inverted = (_.invert(optionEnum));
    Object.keys(inverted).forEach((key) => {
      if ($.inArray(inverted[key], SessionManager.get(SessionManager.strSessionSelectedOptions)) !== -1) {
        const { relatedJqueryDiv, relatedJqueryInput } = QueryingHelper.getRelatedDom(key);

        if (relatedJqueryDiv.length !== 0) fillDivInputs(relatedJqueryDiv, key, result, relatedJqueryInput);
        else if (relatedJqueryInput.length !== 0) fillInputs(relatedJqueryInput, result, key);
      }
    });

    return result;
  }
};

export default new Options();
