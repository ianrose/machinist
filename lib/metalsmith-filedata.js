var minimatch = require('minimatch')

module.exports = function (options) {
  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata()
    var targetFiles = Object.keys(files).filter(minimatch.filter(options.pattern, { matchBase: true }))
    targetFiles.forEach(function (file) {
      var fileContents = files[file].contents.toString()
      metadata[options.key] = fileContents
    })

    done()
  }
}
