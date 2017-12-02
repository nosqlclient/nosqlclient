import { TAPi18n } from 'meteor/tap:i18n';

const Helper = function () {
};

Helper.prototype = {
  sortObjectByKey(obj) {
    const keys = [];
    const sortedObject = {};

    Object.keys(obj).forEach(key => keys.push(key));

    keys.sort();
    jQuery.each(keys, (i, key) => {
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
  }
};

const helper = new Helper();
export default helper;
