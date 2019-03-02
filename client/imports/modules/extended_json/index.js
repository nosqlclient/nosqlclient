const fbbkJson = require('fbbk-json');

const ExtendedJSON = function () {
};

const extractMiddleString = function (str) {
  if (!str) {
    return '';
  }

  return str.substring(str.indexOf('"') + 1, str.lastIndexOf('"'));
};

const replaceShellStuff = function (str, regex, extendedJsonVersion) {
  const matches = str.match(regex);
  if (matches) {
    for (let i = 0; i < matches.length; i += 1) {
      str = str.replace(matches[i], `{${extendedJsonVersion}:"${extractMiddleString(matches[i])}"}`);
    }
  }

  return str;
};

const replaceRegex = function (str) {
  const regex = /:\/.*?([^\\]\/.*?(,|}|]))+/gim;

  const matches = str.match(regex);
  if (matches) {
    for (let i = 0; i < matches.length; i += 1) {
      const regexText = `'${matches[i].substring(matches[i].indexOf('/') + 1, matches[i].lastIndexOf('/'))}'`;
      const regexOptions = `'${matches[i].substring(matches[i].lastIndexOf('/') + 1, matches[i].length - 1)}'`;

      if (str.substring(str.indexOf(matches[i]) - 7, str.indexOf(matches[i])).indexOf('$regex') !== -1) {
        if (regexOptions) {
          str = str.replace(matches[i].substring(1, matches[i].length - 1), `${regexText},$options:${regexOptions}`);
        } else {
          str = str.replace(matches[i].substring(1, matches[i].length - 1), regexText);
        }
      } else {
        str = str.replace(matches[i].substring(1, matches[i].length - 1), `{$regex:${regexText},$options:${regexOptions}}`);
      }
    }
  }

  return str;
};

// supporting shell commands for ObjectID and ISODate, https://docs.mongodb.com/manual/reference/mongodb-extended-json/
const convertToExtendedJson = function (str) {
  if (!str || Object.prototype.toString.call(str) !== '[object String]') {
    return;
  }

  // support shell stuff
  // replace objectID variations with $oid
  str = replaceShellStuff(str, /objectid\("[A-Z0-9]*"\)/gmi, '$oid');

  // replace ISODate|date variations with $date
  str = replaceShellStuff(str, /isodate\("[A-Z0-9- :.]*"\)|date\("[A-Z0-9- :.]*"\)|newdate\("[A-Z0-9- :.]*"\)|newisodate\("[A-Z0-9 -:.]*"\)/gmi, '$date');

  // replace regex occurrences
  str = replaceRegex(str);

  return str;
};

ExtendedJSON.prototype = {
  convertAndCheckJSON(json) {
    if (!json) return {};

    const regexToCleanWhiteSpaces = /(\/.*?[^\\]\/|".*?[^\\]"|'.*?[^\\]')|[^\s]/gm;
    if (json.match(regexToCleanWhiteSpaces)) json = json.match(regexToCleanWhiteSpaces).join('');

    let result = {};
    try {
      if (!json.startsWith('{') && !json.startsWith('[')) json = `{${json}`;

      if ((!json.endsWith('}') && !json.endsWith(']'))
        || (json.split('\{').length - 1) > (json.split('\}').length - 1)) {
        json = `${json}}`;
      }

      json = convertToExtendedJson(json);
      result = fbbkJson.parse(json);
    } catch (err) {
      result.ERROR = err.message;
    }

    return result;
  }
};

export default new ExtendedJSON();
