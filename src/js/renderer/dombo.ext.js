module.exports = function (dombo) {
  dombo.fn.el = function () {
    return this.reduce((_, node) => node, true);
  };

  dombo.fn.text = function (str) {
    return this.reduce((_, node) => {
      node.textContent = str;
    }, true);
  };

  dombo.fn.toggleClass = function (name, state) {
    return this.forEach(function (node) {
      node = dombo(node)
      if (state === true) return node.addClass(name)
      if (state === false) return node.removeClass(name)
      if (node.hasClass(name)) return node.removeClass(name)
      return node.addClass(name)
    });
  }
};
