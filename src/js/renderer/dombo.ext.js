module.exports = function (dombo) {
  dombo.fn.el = function () {
    return this.reduce((_, node) => node, true);
  };

  dombo.fn.text = function (str) {
    return this.reduce((_, node) => {
      node.textContent = str;
    }, true);
  };
};
