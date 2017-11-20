const Handlebars = require('handlebars')

// Helper Documentation: https://git.io/v6hSQ
require('handlebars-helpers')({
  handlebars: Handlebars
})

const typogr = require('typogr')

module.exports = {
  typogrFormat: function (value) {
    return typogr(value).chain().initQuotes().smartypants().caps().value()
  }
}
