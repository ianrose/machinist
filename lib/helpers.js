module.exports = {
  capitalizeFirst: function (str) {
    if (str && typeof str === "string") {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  },
  jsonTest: function (context) {
    return JSON.parse(context);
  }
};