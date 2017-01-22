var GoogleSheetJSON = require('googlesheets-reader')
var fs = require('fs')
var config = require('../config.json')

var options = {
  fileId: config.googleSheetJson.fileId,
  worksheet: config.googleSheetJson.worksheet,
  output: config.googleSheetJson.output
}

GoogleSheetJSON({key: options.fileId}, function (err, spreadsheet) {
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
    console.log('Google Sheet Success: ' + options.fileId + ' written to ' + options.output)
  })
})
