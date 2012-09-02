Overview
--------

This package is a middleware for [connect](https://github.com/senchalabs/connect)/[express](https://github.com/visionmedia/express/) to remove potentially uploaded files after each request.

The `bodyParser`/`multipart` middleware is great to handle incoming requests and file uploads, but you may be getting files without even knowing it on routes where you don't expect them, thus filling the disk progressively.

This middleware enforces their deletion **after** the response is done.

Usage
-----
```javascript
var connect = require('connect')
  , cleaner = require('connect-fileupload-cleaner')
connect()
  .use(connect.bodyParser())
  .use(cleaner())
  [...]
```