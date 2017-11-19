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
};

const helper = new Helper();
export default helper;

// TODO
(function () {
  Array.prototype.remove = function () {
    let what;
    const a = arguments;
    let L = a.length,
      ax;
    while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };

  String.prototype.parseFunction = function () {
    const funcReg = /function *\(([^()]*)\)[ \n\t]*\{(.*)}/gmi;
    const match = funcReg.exec(this.replace(/\n/g, ' '));
    if (match) {
      return new Function(match[1].split(','), match[2]);
    }

    return null;
  };
}());
