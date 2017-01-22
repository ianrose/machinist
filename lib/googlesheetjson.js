var GoogleSheetJSON = require('googlesheets-reader')
var fs = require('fs')
var config = require('../config.json')

var options = {
  key: config.googleSheetJson.key,
  worksheet: config.googleSheetJson.worksheet,
  output: config.googleSheetJson.output
}

GoogleSheetJSON({key: options.key}, function (err, spreadsheet) {
  if (err) {
    console.log('Google Sheet to JSON ' + err)
    return
  }
  spreadsheet.worksheets[options.worksheet].rows({}, function (err, sheetRows) {
    if (err) {
      console.log('Google Sheet to JSON' + err)
      return
    }
    fs.writeFile(options.output, JSON.stringify(sheetRows, null, '\t'))
    console.log('Google Sheet Success: ' + options.key + ' written to ' + options.output)
  })
})
