const myConfig = require('../configs/config_gdocs.json').google
const GoogleDocToJSON = require('googledoc-to-json')
const gDocToJSON = new GoogleDocToJSON(myConfig)
const fs = require('fs')
const config = require('../config.json')

const options = {
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
