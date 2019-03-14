import { TAPi18n } from 'meteor/tap:i18n';
import $ from 'jquery';

const Helper = function () {
};

Helper.prototype = {
  sortObjectByKey(obj) {
    const keys = [];
    const sortedObject = {};

    Object.keys(obj).forEach(key => keys.push(key));

    keys.sort();
    $.each(keys, (i, key) => {
      sortedObject[key] = obj[key];
    });

    return sortedObject;
  },

  loadFile(currentVal, input, done, readAsString) {
    const fileInput = input.siblings('.bootstrap-filestyle').children('input');
    if (input[0].files.length === 0 && currentVal && fileInput.val()) done(currentVal);
    else if (input[0].files.length !== 0) {
      const fileReader = new FileReader();
      fileReader.onload = function (file) {
        if (readAsString) done(file.target.result);
        else done(new Uint8Array(file.target.result));
      };

      if (readAsString) fileReader.readAsText(input[0].files[0], 'UTF-8');
      else fileReader.readAsArrayBuffer(input[0].files[0]);
    } else {
      done([]);
    }
  },

  translate({ key, options, language }) {
    return TAPi18n.__(key, options, language);
  },

  populateComboboxData(result, key) {
    const data = {};
    result.forEach((col) => {
      data[col[key]] = col[key];
    });

    return data;
  },

  getScaleAndText(settingsScale, isMBOne) {
    let scale;
    let text;
    switch (settingsScale) {
      case 'MegaBytes':
        scale = isMBOne ? 1 : 1024 * 1024;
        text = 'MB';
        break;
      case 'KiloBytes':
        scale = 1024;
        text = 'KB';
        break;
      default:
        scale = isMBOne ? 1024 * 1024 : 1;
        text = 'Bytes';
        break;
    }

    return { scale, text };
  }
};

const helper = new Helper();
export default helper;
