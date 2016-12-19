var myConfig = require('../configs/config_gdocs.json').google
var GoogleDocToJSON = require('googledoc-to-json')
var gDocToJSON = new GoogleDocToJSON(myConfig)
var fs = require('fs')
var config = require('../config.json')

var options = {
  fileId: config.googleDocJson.fileId,
  oAuthTokens: myConfig.oAuthTokens,
  output: config.googleDocJson.output
}

gDocToJSON.getArchieML(options, function (err, aml) {
  if (err) {
    console.log('Google Doc to JSON ' + err)
    return
  }
  fs.writeFile(options.output, JSON.stringify(aml, null, '\t'))
  console.log('Google Doc Success: ' + options.fileId + ' written to ' + options.output)
})
