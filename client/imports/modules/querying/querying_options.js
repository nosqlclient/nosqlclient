import { ExtendedJSON, SessionManager, UIComponents } from '/client/imports/modules';

const QueryOptions = function () {

};

QueryOptions.prototype = {
  checkOption(val, result, optionEnum, option) {
    if (val === '') result[optionEnum[option]] = {};
    else {
      val = ExtendedJSON.convertAndCheckJSON(val);
      if (val.ERROR) {
        result.ERROR = `Syntax Error on ${optionEnum[option]}: ${val.ERROR}`;
      } else {
        result[optionEnum[option]] = val;
      }
    }
  },

  checkCodeMirrorSelectorForOption(option, result, optionEnum) {
    if ($.inArray(option, SessionManager.get(SessionManager.keys.strSessionSelectedOptions)) !== -1) {
      this.checkOption(UIComponents.Editor.getSelectorValue(), result, optionEnum, option);
    }
  },

  checkAndAddOption(option, divSelector, result, optionEnum) {
    if ($.inArray(option, SessionManager.get(SessionManager.keys.strSessionSelectedOptions)) !== -1) {
      this.checkOption(UIComponents.Editor.getCodeMirrorValue(divSelector), result, optionEnum, option);
    }
  },

  setOptionsComboboxChangeEvent(cmb, sessionVar) {
    cmb.on('change', (evt, params) => {
      const array = SessionManager.get(sessionVar || SessionManager.keys.strSessionSelectedOptions);
      if (params.deselected) array.remove(params.deselected);
      else array.push(params.selected);

      SessionManager.set(sessionVar || SessionManager.keys.strSessionSelectedOptions, array);
    });
  }
};

export default new QueryOptions();
