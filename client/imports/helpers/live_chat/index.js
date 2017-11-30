const LiveChat = function () {
};

LiveChat.prototype = {
  prepare(d, n) {
    const s = document.createElement('script');
    const a = document.getElementsByTagName('script');
    const p = a[a.length - 1];
    s.type = 'text/javascript';
    s.async = true;
    s.src = `${document.location.protocol === 'https:' ? 'https:' : 'http:'}//cdn.nudgespot.com/nudgespot.js`;
    p.parentNode.insertBefore(s, p.nextSibling);
    window.nudgespot = n;
    n.init = function (t) {
      function f(n, m) {
        const a = m.split('.');
        a.length === 2 && (n = n[a[0]], m = a[1]);
        n[m] = function () {
          n.push([m].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }

      n._version = 0.1;
      n._globals = [t];
      n.people = n.people || [];
      n.params = n.params || [];
      const m = 'track register unregister identify set_config people.delete people.create people.update people.create_property people.tag people.remove_Tag'.split(' ');
      for (let i = 0; i < m.length; i += 1)f(n, m[i]);
    };
  }
};

export default new LiveChat();
