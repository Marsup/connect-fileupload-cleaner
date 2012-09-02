var fs = require('fs')

function unlink (path) {
  fs.exists(path, function (exists) {
    if (!exists) return

    fs.unlink(path, function (err) {
      if (err) {
        console.error('Failed to delete %s', path, err) // Nothing much we can do other than showing an error.
      }
    })
  })
}

module.exports = function() {
  return function (req, res, next) {
    res.once('finish', function () {
      if (!req.files) return

      Object.keys(req.files).forEach(function (key) {
        var path = req.files[key].path
        process.nextTick(function () {
          unlink(path)
        })
      })
    })
    next()
  }
}