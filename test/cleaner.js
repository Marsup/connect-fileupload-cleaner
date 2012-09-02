/*global describe: true, after: true, before: true, it: true*/
var mocha     = require('mocha')
  , should    = require('should')
  , connect   = require('connect')
  , http      = require('http')
  , path      = require('path')
  , request   = require('request')
  , fs        = require('fs')
  , glob      = require('glob')
  , cleaner   = require('..')

var app, httpServer, url
  , dummyFile = './test/fixtures/dummy'
  , uploads = path.join(__dirname, 'uploads')

function clean (done) {
  glob('*', { cwd: uploads }, function (err, files) {
    if (err) throw err
    files.forEach(function (file) {
      fs.unlinkSync(path.join(uploads, file))
    })
    done()
  })
}

function postFiles (number, cb) {
  var req = request.post(url)
    , form = req.form()
  while (number--) {
    form.append('testfile' + number, fs.createReadStream(dummyFile))
  }
  app.once('request', cb)
}

function assertFileCount (number, cb) {
  glob('*', { cwd: uploads }, function (err, files) {
    if (err) throw err
    files.should.have.length(number)
    cb()
  })
}

describe('using connect', function () {
  before(clean)

  before(function (done) {
    app = connect()
      .use(connect.multipart({ uploadDir: uploads }))
      .use(cleaner())
      .use(function (req, res) {
        app.once('continue', function() {
          res.end()
        })
        app.emit('request')
      })

    httpServer = http.createServer(app).listen(function () {
      url = 'http://localhost:' + this.address().port
      done()
    })
  })

  after(function (done) { httpServer.close(done) })

  describe('uploading a file', function () {
    it('should receive it', function (done) {
      postFiles(1, function () {
        assertFileCount(1, done)
        app.emit('continue')
      })
    })

    it('should delete it', function (done) {
      assertFileCount(0, done)
    })
  })

  describe('uploading multiple files', function () {
    it('should receive them', function (done) {
      postFiles(5, function (req) {
        assertFileCount(5, done)
        app.emit('continue')
      })
    })

    it('should delete them all', function (done) {
      assertFileCount(0, done)
    })
  })

  describe('uploading a file and simulating an operation', function () {
    it('should be able to process files until the response is done', function (done) {
      postFiles(1, function () {
        setTimeout(function () {
          assertFileCount(1, done)
          app.emit('continue')
        }, 500)
      })
    })

    it('should delete it after', function (done) {
      assertFileCount(0, done)
    })
  })
})