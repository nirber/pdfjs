!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.pdfjs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var BaseElement = module.exports = function(Node) {
  this.Node = Node
}

BaseElement.prototype.createNode = function(x, y, width) {
  var node = new this.Node(this)
  return node
}

},{}],2:[function(require,module,exports){
'use strict'

var BoxStyle = require('../style/box')

var Box = module.exports = function(style, opts) {
  Box.super_.call(this, require('../pdf/nodes/box'))

  this.style = new BoxStyle(style, opts)
}

require('../pdf/utils').inherits(Box, require('./container'))

},{"../pdf/nodes/box":20,"../pdf/utils":54,"../style/box":56,"./container":4}],3:[function(require,module,exports){
'use strict'

var TableStyle = require('../style/table')

var Cell = module.exports = function(str, style) {
  Cell.super_.call(this, require('../pdf/nodes/cell'))

  this.style = new TableStyle(style)

  if (str) {
    this.text(str, this.style)
  }
}

require('../pdf/utils').inherits(Cell, require('./container'))

var Table = require('./table')
Cell.prototype.table = function(opts) {
  var table = new Table(this.style.merge(TableStyle.reset), opts)
  this.children.push(table)
  return table
}

},{"../pdf/nodes/cell":21,"../pdf/utils":54,"../style/table":60,"./container":4,"./table":12}],4:[function(require,module,exports){
'use strict'

var ContainerStyle = require('../style/container')

var Container = module.exports = function(Node) {
  Container.super_.call(this, Node)

  this.children = []
}

require('../pdf/utils').inherits(Container, require('./base'))

var Text = require('./text')
Container.prototype.text = function(text, opts) {
  if (typeof text === 'object') {
    opts = text
    text = undefined
  }

  var child = new Text(text, this.style.merge(opts))
  this.children.push(child)
  return child
}

var Box = require('./box')
Container.prototype.box = function(opts) {
  var box = new Box(this.style.merge(ContainerStyle.paddingReset), opts)
  this.children.push(box)
  return box
}

var Table = require('./table')
Container.prototype.table = function(opts) {
  var table = new Table(this.style.merge(ContainerStyle.paddingReset), opts)
  this.children.push(table)
  return table
}

var Image = require('./image')
Container.prototype.image = function(img, opts) {
  var image = new Image(img, opts)
  this.children.push(image)
  return image
}

},{"../pdf/utils":54,"../style/container":57,"./base":1,"./box":2,"./image":7,"./table":12,"./text":13}],5:[function(require,module,exports){
'use strict'

var DocumentStyle = require('../style/document')
var PDF = require('../pdf')

var Document = module.exports = function(opts) {
  Document.super_.call(this, require('../pdf/nodes/document'))

  opts        = opts || {}
  opts.width  = opts.width  || 595.296
  opts.height = opts.height || 841.896

  this.style   = new DocumentStyle(opts)
  this._header = null
  this._footer = null
}

require('../pdf/utils').inherits(Document, require('./container'))

var Box = require('./box')

Document.prototype.header = function(opts) {
  if (this._header) {
    return this._header
  }

  if (opts && !opts.width) {
    opts.width = '100%'
  }

  this._header = new Box(this.style.merge(DocumentStyle.super_.paddingReset), opts)
  return this._header
}

Document.prototype.footer = function(opts) {
  if (this._footer) {
    return this._footer
  }

  if (opts && !opts.width) {
    opts.width = '100%'
  }

  this._footer = new Box(this.style.merge(DocumentStyle.super_.paddingReset), opts)
  return this._footer
}

Document.prototype.render = function() {
  return new PDF(this.createNode(this))
}

},{"../pdf":18,"../pdf/nodes/document":22,"../pdf/utils":54,"../style/document":58,"./box":2,"./container":4}],6:[function(require,module,exports){
'use strict'

var TTFFont = require('ttfjs')
var utils   = require('../../pdf/utils')
var uuid    = require('node-uuid')

var Font = module.exports = function(src) {
  this.uuid = uuid.v4()
  this.ttf  = new TTFFont(utils.toArrayBuffer(src))
}

Font.prototype.subset = function() {
  return this.ttf.subset()
}

Font.prototype.stringWidth = function(string, size) {
  return this.ttf.stringWidth(string, size)
}

Font.prototype.lineHeight = function(size, includeGap) {
  return this.ttf.lineHeight(size, includeGap)
}

Font.prototype.lineDescent = function(size) {
  return this.ttf.lineDescent(size)
}

},{"../../pdf/utils":54,"node-uuid":87,"ttfjs":100}],7:[function(require,module,exports){
'use strict'

var ImageStyle = require('../style/image')

var Image = module.exports = function(img, style, opts) {
  this.uuid = img.uuid
  this.img  = img

  Image.super_.call(this, require('../pdf/nodes/image'))

  this.style = new ImageStyle(style, opts)
}

require('../pdf/utils').inherits(Image, require('./base'))

},{"../pdf/nodes/image":23,"../pdf/utils":54,"../style/image":59,"./base":1}],8:[function(require,module,exports){
'use strict'

var LineBreak = module.exports = function(style) {
  LineBreak.super_.call(this, require('../pdf/nodes/linebreak'))

  this.style = style
}

require('../pdf/utils').inherits(LineBreak, require('./base'))

Object.defineProperties(LineBreak.prototype, {
  width: {
    enumerable: true,
    get: function() {
      return 0
    }
  },

  height: {
    enumerable: true,
    get: function() {
      var height = this.style.font.lineHeight(this.style.fontSize, true) * this.style.lineHeight

      return height
    }
  },

  spacing: {
    enumerable: true,
    get: function() {
      return 0
    }
  }
})

},{"../pdf/nodes/linebreak":24,"../pdf/utils":54,"./base":1}],9:[function(require,module,exports){
'use strict'

var Word = require('./word')

var PageCount = module.exports = function(style) {
  Word.call(this, '0', style)
  Word.super_.call(this, require('../pdf/nodes/page-count'))
}

require('../pdf/utils').inherits(PageCount, Word)

},{"../pdf/nodes/page-count":25,"../pdf/utils":54,"./word":14}],10:[function(require,module,exports){
'use strict'

var Word = require('./word')

var PageNumber = module.exports = function(style) {
  Word.call(this, '0', style)
  Word.super_.call(this, require('../pdf/nodes/page-number'))
}

require('../pdf/utils').inherits(PageNumber, Word)

},{"../pdf/nodes/page-number":26,"../pdf/utils":54,"./word":14}],11:[function(require,module,exports){
'use strict'

var TableStyle = require('../style/table')

var Row = module.exports = function(style) {
  Row.super_.call(this, require('../pdf/nodes/row'))

  this.style    = new TableStyle(style)
  this.children = []
}

require('../pdf/utils').inherits(Row, require('./base'))

var Cell = require('./cell')
Row.prototype.td = function(text, opts) {
  if (typeof text === 'object') {
    opts = text
    text = undefined
  }

  var td = new Cell(text, this.style.merge(opts))
  this.children.push(td)
  return td
}

},{"../pdf/nodes/row":28,"../pdf/utils":54,"../style/table":60,"./base":1,"./cell":3}],12:[function(require,module,exports){
'use strict'

var TableStyle = require('../style/table')

var Table = module.exports = function(style, opts) {
  Table.super_.call(this, require('../pdf/nodes/table'))

  this.style    = new TableStyle(style, opts)
  this.children = []

  this.beforeBreakChildren = []
}

require('../pdf/utils').inherits(Table, require('./base'))

var Row = require('./row')
Table.prototype.tr = function(opts) {
  var tr = new Row(this.style.merge(opts))
  this.children.push(tr)
  return tr
}

Table.prototype.beforeBreak = function(opts) {
  var tr = new Row(this.style.merge(opts))
  this.beforeBreakChildren.push(tr)
  return tr
}

},{"../pdf/nodes/table":30,"../pdf/utils":54,"../style/table":60,"./base":1,"./row":11}],13:[function(require,module,exports){
'use strict'

var TextStyle = require('../style/text')

var Text = module.exports = function(text, style, opts) {
  Text.super_.call(this, require('../pdf/nodes/text'))

  this.style    = new TextStyle(style, opts)
  this.children = []

  if (text) {
    this.add(text)
  }
}

require('../pdf/utils').inherits(Text, require('./base'))

var LineBreaker = require('linebreak')
var Word        = require('./word')
var LineBreak   = require('./linebreak')
var PageNumber  = require('./page-number')
var PageCount   = require('./page-count')

Text.prototype.add = function(str, opts, append) {
  var style     = this.style.merge(opts)
  var lastChild = this.children[this.children.length - 1]
  var appendTo  = append && lastChild.children ? lastChild : this

  str = String(str)

  var breaker = new LineBreaker(str)
  var last = 0, bk

  while ((bk = breaker.nextBreak())) {
    // get the string between the last break and this one
    var word = str.slice(last, bk.position)
    last = bk.position

    var linebreaks = 0
    while (!bk.required && word.match(/(\r\n|\n|\r)$/)) {
      word = word.replace(/(\r\n|\n|\r)$/, '')
      linebreaks++
    }

    // remove trailing whitespaces if white-space style is set to normal
    if (style.whiteSpace === 'normal') {
      word = word.replace(/^\s+/, '').replace(/\s+$/, '')
    }

    // remove newline characters
    if (bk.required) {
      word = word.replace(/(\r\n|\n|\r)/, '')
    }

    if (word.length) {
      appendTo.children.push(new Word(word, style))
    }

    appendTo = this

    // add linebreak
    if (bk.required) {
      this.children.push(new LineBreak(style))
    }

    // add trailing line breaks
    for (var i = 0; i < linebreaks; ++i) {
      this.children.push(new LineBreak(style))
    }
  }

  return this
}

Text.prototype.line = function(str, opts) {
  return this.add(str + '\n', opts)
}

Text.prototype.append = function(str, opts) {
  return this.add(str, opts, true)
}

Text.prototype.br = function() {
  this.children.push(new LineBreak(this.style))
  return this
}

Text.prototype.pageNumber = function(opts) {
  this.children.push(new PageNumber(this.style.merge(opts)))
  return this
}

Text.prototype.pageCount = function(opts) {
  this.children.push(new PageCount(this.style.merge(opts)))
  return this
}

},{"../pdf/nodes/text":31,"../pdf/utils":54,"../style/text":61,"./base":1,"./linebreak":8,"./page-count":9,"./page-number":10,"./word":14,"linebreak":85}],14:[function(require,module,exports){
'use strict'

var Word = module.exports = function(word, style) {
  Word.super_.call(this, require('../pdf/nodes/word'))

  if (!style.font) {
    throw new TypeError('Text must have a font set or inherited')
  }

  this.word     = word
  this.style    = style
  this.children = [this]
}

require('../pdf/utils').inherits(Word, require('./base'))

Object.defineProperties(Word.prototype, {
  width: {
    enumerable: true,
    get: function() {
      var width = this.children.map(function(word) {
        return this.style.font.stringWidth(word.word, word.style.fontSize)
      }, this).reduce(function(lhs, rhs) {
        return lhs + rhs
      }, 0)

      return width
    }
  },

  height: {
    enumerable: true,
    get: function() {
      var height = Math.max.apply(Math, this.children.map(function(word) {
        return word.style.font.lineHeight(word.style.fontSize, true) * word.style.lineHeight
      }, this))

      return height
    }
  },

  spacing: {
    enumerable: true,
    get: function() {
      var last = this.children[this.children.length - 1]
      var spacing = last.style.font.stringWidth(' ', last.style.fontSize)

      return spacing
    }
  }
})

Word.prototype.toString = function() {
  return this.children.map(function(word) {
    return word.word
  }, this).reduce(function(lhs, rhs) {
    return lhs + rhs
  }, '')
}

},{"../pdf/nodes/word":32,"../pdf/utils":54,"./base":1}],15:[function(require,module,exports){
'use strict'

var utils = require('./pdf/utils')
var uuid  = require('node-uuid')

module.exports = function(src) {
  this.uuid = uuid.v4()
  this.src  = utils.toArrayBuffer(src)

  this.type = parseType(this.src)

  switch (this.type) {
    case 'jpeg':
      this.info = parseJpegInfo(this.src)
      this.width = this.info.width
      this.height = this.info.height

      switch (this.info.colorSpace) {
      case 3:
        this.colorSpace = 'DeviceRGB'
        break
      case 1:
        this.colorSpace = 'DeviceGRAY'
        break
      default:
        break
      }
      break
    case 'pdf':
      this.info = parsePDFInfo(this.src)
      break
  }
}

function parseType(buffer) {
  var pdf = String.fromCharCode.apply(null, new Uint8Array(buffer, 0, 5))
  if (pdf === '%PDF-') {
    return 'pdf'
  }

  var view = new DataView(buffer)
  if (view.getUint8(0) === 0xff || view.getUint8(1) === 0xd8) {
    return 'jpeg'
  }

  throw new TypeError('Unsupported image type')
}

function parseJpegInfo(buffer) {
  var view = new DataView(buffer)
  if (view.getUint8(0) !== 0xff || view.getUint8(1) !== 0xd8) {
    throw new Error('Invalid JPEG image.')
  }

  var blockLength = view.getUint8(4) * 256 + view.getUint8(5)
  var i = 4, len = view.byteLength

  while ( i < len ) {
    i += blockLength

    if (view.getUint8(i) !== 0xff) {
      throw new Error('Could not read JPEG the image size')
    }

    if (
      view.getUint8(i + 1) === 0xc0 || //(SOF) Huffman  - Baseline DCT
      view.getUint8(i + 1) === 0xc1 || //(SOF) Huffman  - Extended sequential DCT
      view.getUint8(i + 1) === 0xc2 || // Progressive DCT (SOF2)
      view.getUint8(i + 1) === 0xc3 || // Spatial (sequential) lossless (SOF3)
      view.getUint8(i + 1) === 0xc4 || // Differential sequential DCT (SOF5)
      view.getUint8(i + 1) === 0xc5 || // Differential progressive DCT (SOF6)
      view.getUint8(i + 1) === 0xc6 || // Differential spatial (SOF7)
      view.getUint8(i + 1) === 0xc7
    ) {
      return {
        height: view.getUint8(i + 5) * 256 + view.getUint8(i + 6),
        width: view.getUint8(i + 7) * 256 + view.getUint8(i + 8),
        colorSpace: view.getUint8(i + 9)
      }
    } else {
      i += 2
      blockLength = view.getUint8(i) * 256 + view.getUint8(i + 1)
    }
  }
}

var Parser = require('./pdf/parser/document')

function parsePDFInfo(buffer) {
  var parser = new Parser(buffer)
  parser.parse()

  var catalog  = parser.trailer.get('Root').object.properties
  var pages    = catalog.get('Pages').object.properties
  var first    = pages.get('Kids')[0].object.properties
  var mediaBox = first.get('MediaBox') || pages.get('MediaBox')

  return {
    page:     first,
    width:    mediaBox[2],
    height:   mediaBox[3]
  }
}

},{"./pdf/parser/document":52,"./pdf/utils":54,"node-uuid":87}],16:[function(require,module,exports){
'use strict'

var Document = exports.Document = require('./element/document')
exports.createDocument = function(style) {
  return new Document(style)
}

var TTFFont = exports.TTFFont = require('./element/font/ttf')
exports.createTTFFont = function(src) {
  return new TTFFont(src)
}


var Image = exports.Image = require('./image')
exports.createImage = function(src) {
  return new Image(src)
}

exports.Parser = require('./pdf/parser/document')

var isClient = typeof window !== 'undefined' && !!window.document
// trick browserify
var fs = (require)('fs')
exports.load = function(path, callback) {
  if (isClient) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', path, true)
    xhr.responseType = 'arraybuffer'

    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain; charset=x-user-defined')
    } else {
      xhr.setRequestHeader('Accept-Charset', 'x-user-defined')
    }

    xhr.onload = function() {
      if (xhr.status === 200) {
        callback(null, xhr.response)
      } else {
        callback(new Error(xhr.statusText), null)
      }
    }

    xhr.send(null)
  } else {
    fs.readFile(path, callback)
  }
}

},{"./element/document":5,"./element/font/ttf":6,"./image":15,"./pdf/parser/document":52,"fs":63}],17:[function(require,module,exports){
'use strict'

var Page = function(header, footer) {
  this.header = header
  this.footer = footer

  this.top = this.bottom = 0
}

Page.prototype.setup = function(cursor) {
  var style = cursor.style
  var top = this.top = cursor.y = style.height - style.paddingTop

  cursor.y -= cursor.offset || 0
  var y = cursor.y

  var x = cursor.x
  cursor.x = style.paddingLeft

  if (this.header) {
    this.header.compute(cursor)
    this.top -= this.header.height
  }

  this.bottom = style.paddingBottom
  if (this.footer) {
    cursor.y = y
    cursor.x = style.paddingLeft

    this.footer.compute(cursor)
    this.bottom += this.footer.height

    var offset = top - this.bottom
    this.footer.shift(offset)
  }

  cursor.x = x
}

var CursorFactory = module.exports = function(doc) {
  this.doc         = doc
  this.style       = doc.style
  this.header      = doc.doc._header
  this.footer      = doc.doc._footer

  this.innerWidth  = this.style.width - this.style.paddingLeft - this.style.paddingRight

  this.currentPage = 1
  this.pages       = []
  this.pageBreaks  = []
  this.addPage()

  this.nextPageBreakId  = 1
  this.validBreaks = Object.create(null)
  this.visitedBreaks = Object.create(null)
  this.highestVisitedBreak = 0

  this.force = true

  this.x = this.style.paddingLeft
  this.y = this.top

  this.offset = 0
  this.afterBreakOffset = 0
}

Object.defineProperties(CursorFactory.prototype, {
  top: {
    enumerable: true,
    get: function() {
      return this.pages[this.currentPage - 1].top
    }
  },
  bottom: {
    enumerable: true,
    get: function() { return this.pages[this.currentPage - 1].bottom }
  }
})

CursorFactory.prototype.create = function(w) {
  if (!w) {
    w = this.innerWidth
  }

  var self = this

  return {
    get style() {
      return self.style
    },
    get width() {
      return w
    },
    get x() {
      return self.x
    },
    set x(val) {
      self.x = val
    },
    get y() {
      return self.y
    },
    set y(val) {
      self.y = val
    },
    get bottom() {
      return self.bottom
    },
    get pageHeight() {
      return self.top - self.bottom
    },
    get force() {
      return self.force
    },
    set force(val) {
      self.force = val
    },
    get currentPage() {
      return self.currentPage
    },
    get pageCount() {
      return self.pages.length
    },
    get offset() {
      return self.offset
    },
    set offset(val) {
      self.offset = val
    },
    setPage: function(page) {
      if (page < 1) {
        return 1
      }
      return self.currentPage = page
    },
    mustBreak: function(node) {
      if (node.allowBreak) {
        return false
      }

      var mustBreak = node.y - node.height < self.bottom - self.offset
      if (!mustBreak) {
        return false
      }

      if (node.height > this.pageHeight) {
        return false
      }

      return true
    },
    create: function(narrow) {
      return self.create(narrow || w)
    },
    reset: this.reset.bind(this),
    pageBreak: this.pageBreak.bind(this),
    applyBreak: this.applyBreak.bind(this),
    beforeContent: function(node) {
      self.afterBreakOffset += node.afterBreakHeight || 0
      var cursor = node.beforeContent(this)

      return cursor
    },
    afterContent: function(node) {
      node.afterContent(this)
    }
  }
}

CursorFactory.prototype.reset = function() {
  this.force  = false
  this.y      = this.top
  this.offset = 0

  this.currentPage = 1
  this.visitedBreaks = Object.create(null)
  this.highestVisitedBreak = 0
}

CursorFactory.prototype.addPage = function() {
  var page = new Page(
    this.header && this.header.createNode(),
    this.footer && this.footer.createNode()
  )

  this.pages.push(page)

  page.setup(this.create())

  this.doc.headers[this.currentPage] = page.header
  this.doc.footers[this.currentPage] = page.footer
}

CursorFactory.prototype.applyBreak = function(pageBreak) {
  this.offset += pageBreak.offset

  if (++this.currentPage > this.pages.length) {
    this.addPage()
  }
}

CursorFactory.prototype.pageBreak = function(pageBreak, parent) {
  if (!pageBreak) {
    var offset = this.top - (this.y + this.offset)
    this.offset += offset

    if (this.currentPage in this.pageBreaks && this.visitedBreaks[this.pageBreaks[this.currentPage].id] === true) {
      pageBreak = this.pageBreaks[this.currentPage]
    } else {
      if (this.afterBreakOffset) {
        offset -= this.afterBreakOffset
        this.afterBreakOffset = 0
      }

      pageBreak = new parent.PageBreakType(this.nextPageBreakId++, offset)
      pageBreak.page = this.currentPage
      this.pageBreaks[this.currentPage] = pageBreak
      this.validBreaks[pageBreak.id] = true
    }

    if (++this.currentPage > this.pages.length) {
      this.addPage()
    }
  } else {
    var isValid = this.validBreaks[pageBreak.id] === true
    var isVisited = this.visitedBreaks[pageBreak.id] === true
    var possibleInvalid = this.highestVisitedBreak > pageBreak.id
    if (!isValid || (!isVisited && possibleInvalid)) {
      this.validBreaks = this.visitedBreaks
      delete this.pageBreaks[this.currentPage]
      return null
    }

    this.visitedBreaks[pageBreak.id] = true
    this.highestVisitedBreak = Math.max(this.highestVisitedBreak, pageBreak.id)

    // this.bottom = this.style.paddingBottom
  }

  return pageBreak
}

},{}],18:[function(require,module,exports){
'use strict'

var PDFObject  = require('./object/object')
var PDFXObject = require('./object/xobject')
var Pages      = require('./object/pages')
var Page       = require('./object/page')
var uuid       = require('node-uuid')
var debug      = require('debug')('pdfjs')

var version = require('../../package.json').version

var PDF = module.exports = function PDF(doc) {
  this.doc = doc

  this.version = 1.3

  this.info = {
    id:           uuid.v4(),
    producer:     'pdfjs v' + version + ' (github.com/rkusa/pdfjs)',
    creationDate: null
  }

  this.offset = 0
}

PDF.prototype.addObject = function(object) {
  this.objects.push(object)
}

PDF.prototype.createObject = function(type) {
  var object = new PDFObject()
  if (type) object.addProperty('Type', type)
  this.addObject(object)
  return object
}

PDF.prototype.createXObject = function(subtype) {
  var xobject = new PDFXObject()
  if (subtype) xobject.addProperty('Subtype', subtype)
  this.addObject(xobject)
  return xobject
}

// PDF.prototype.createImage = function(data) {
//   var image = new Image('Im' + (this.images.length + 1), data)
//   this.images.push(image)
//   this.addObject(image.xobject)
//   return image
// }

PDF.prototype.createPage = function() {
  var pages = this.pages.pages
  var index = pages.indexOf(this.currentPage)

  if (index + 1 < pages.length) {
    return this.currentPage = pages[index + 1]
  } else {
    var page = this.currentPage = new Page(this.pages)

    this.pages.add(page)

    return page
  }
}

PDF.prototype.Tm = function(a, b, c, d, e, f) {
  this.write(a, b, c, d, e, f + this.offset, 'Tm')
}

PDF.prototype.Tj = function(str) {
  this.write(str, 'Tj')
}

PDF.prototype.Td = function(x, y) {
  this.write(x, y, 'Td')
}

PDF.prototype.Tf = function(font, size) {
  this.write(font, size, 'Tf')
}

PDF.prototype.rg = function(r, g, b) {
  this.write(r, g, b, 'rg')
}

PDF.prototype.RG = function(r, g, b) {
  this.write(r, g, b, 'RG')
}

PDF.prototype.BT = function() {
  this.write('BT')
}

PDF.prototype.ET = function() {
  this.write('ET')
}

PDF.prototype.re = function(x, y, width, height) {
  this.write(x, y + this.offset, width, height, 're')
}

PDF.prototype.rectangle = function(x, y, width, height) {
  y += this.offset

  var top = this.doc.style.height - this.doc.style.paddingTop

  if (y < this.doc.style.paddingBottom) {
    var delta = this.doc.style.paddingBottom - y
    y = this.doc.style.paddingBottom
    height -= delta
  } else if (y + height > top) {
    height -= (y + height) - top
  }

  if (height > this.doc.style.innerHeight) {
    height = this.doc.style.innerHeight
  }

  this.re(x, y - this.offset, width, height, 're')
}

PDF.prototype.f = function() {
  this.write('f')
}

PDF.prototype.w = function(lineWidth) {
  this.write(lineWidth, 'w')
}

PDF.prototype.S = function() {
  var path = Array.prototype.slice.call(arguments)
  for (var i = 0, len = path.length; i < len; ++i) {
    // every second (1, because we start at 0)
    if (i % 3 === 1) {
      path[i] += this.offset
    }
  }

  this.write.apply(this, path.concat('S'))
}

PDF.prototype.line = function(x1, y1, x2, y2) {
  y1 += this.offset
  y2 += this.offset

  var top = this.doc.style.height - this.doc.style.paddingTop
  var bottom = this.doc.style.paddingBottom
  var left = this.doc.style.paddingLeft
  var right = this.doc.style.width - this.doc.style.paddingRight

  if ((y1 > top && y2 > top) || (y1 < bottom && y2 < bottom) || (x1 < left && x2 < left) || (x1 > right && x2 > right)) {
    return
  }

  // top
  var topIntersection = intersect(x1, y1, x2, y2, left, top, right, top)
  if (topIntersection) {
    if (y1 > top) {
      x1 = topIntersection[0]
      y1 = topIntersection[1]
    } else if(y2 > top) {
      x2 = topIntersection[0]
      y2 = topIntersection[1]
    }
  }

  // // left
  var leftIntersection = intersect(x1, y1, x2, y2, left, top, left, bottom)
  if (leftIntersection) {
    if (x1 < left) {
      x1 = leftIntersection[0]
      y1 = leftIntersection[1]
    } else if (x2 < left) {
      x2 = leftIntersection[0]
      y2 = leftIntersection[1]
    }
  }

  // right
  var rightIntersection = intersect(x1, y1, x2, y2, right, top, right, bottom)
  if (rightIntersection) {
    if (x1 > right) {
      x1 = rightIntersection[0]
      y1 = rightIntersection[1]
    } else if (x2 > right) {
      x2 = rightIntersection[0]
      y2 = rightIntersection[1]
    }
  }

  // bottom
  var bottomIntersection = intersect(x1, y1, x2, y2, left, bottom, right, bottom)
  if (bottomIntersection) {
    if (y1 < bottom) {
      x1 = bottomIntersection[0]
      y1 = bottomIntersection[1]
    } else if (y2 < bottom) {
      x2 = bottomIntersection[0]
      y2 = bottomIntersection[1]
    }
  }

  this.S(x1, y1 - this.offset, 'm', x2, y2 - this.offset, 'l')
}

// save graphics state
PDF.prototype.q = function() {
  this.write('q')
}

PDF.prototype.cm = function(a, b, c, d, e, f) {
  this.write(a, b, c, d, e, f + this.offset, 'cm')
}

// paint image
PDF.prototype.Do = function(name) {
  this.write(name, 'Do')
}

// restore graphics state
PDF.prototype.Q = function() {
  this.write('Q')
}

function toFixed(num, precision) {
  return (+(Math.floor(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision)
}

PDF.prototype.write = function() {
  var line = Array.prototype.slice.call(arguments).map(function(arg) {
    return typeof arg === 'number' ? toFixed(arg, this.doc.style.precision) : arg
  }, this).join(' ')
  this.currentPage.contents.writeLine(line)
}

var CursorFactory = require('./cursor')

PDF.prototype._compute = function() {
  var cursorFactory = new CursorFactory(this.doc)
  var cursor = cursorFactory.create()

  this.doc.compute(cursor)
  cursor.reset()

  var iteration = 0
  var threshold = this.doc.style.threshold

  while (!this.doc.arrange(cursor)) {
    debug('------- Computation Iteration %d -------', iteration)
    cursor.reset()
    this.doc.compute(cursor)
    cursor.reset()

    if (++iteration >= threshold) {
      throw new Error('Endless rendering?')
    }
  }
}

PDF.prototype._build = function(ast, parent) {
  if (hasFunction(ast, 'begin')) {
    ast.begin(this, parent)
  }

  if (hasFunction(ast, 'render')) {
    ast.render(this, parent)
  }

  if (hasChildren(ast)) {
    if (ast.direction === 'leftRight') {
      var rowPage = this.currentPage
      var rowOffset = this.offset
      var endOffset = this.offset
    }

    ast.children.forEach(function(child) {
      this._build(child, { parent: parent, node: ast })

      if (ast.direction === 'leftRight') {
        endOffset = Math.max(endOffset, this.offset)
        this.currentPage = rowPage
        this.offset = rowOffset
      }
    }, this)

    if (ast.direction === 'leftRight') {
      this.currentPage = this.pages.pages[this.pages.pages.length - 1]
      this.offset = endOffset
    }
  }

  if (hasFunction(ast, 'end')) {
    ast.end(this, parent)
  }
}

var PDFXref       = require('./object/xref')
var PDFTrailer    = require('./object/trailer')

PDF.prototype.build = function() {
  this.objects = []

  // node to object mapping
  this.mapping = Object.create(null)

  // list of all fonts in this document
  this.fonts   = []

  // list of all images in this document
  this.images  = []

  // the catalog and pages tree
  this.pages = new Pages(this.doc.style.width, this.doc.style.height)
  this.createPage()

  this.catalog = this.createObject('Catalog')
  this.catalog.prop('Pages', this.pages.toReference())

  this._compute()
  this._build(this.doc, null)

  this.pages.embed(this)

  // this.pagebreak()
  // this.render(this.cursor)
  this.fonts.forEach(function(font) {
    font.embed(this)
  }, this)
  this.images.forEach(function(image) {
    image.embed(this)
  }, this)

  this.objects.forEach(function(obj, i) {
    obj.id = i + 1
  })

  var buf  = ''

  // header
  buf += '%PDF-' + this.version.toString() + '\n'

  // The PDF format mandates that we add at least 4 commented binary characters
  // (ASCII value >= 128), so that generic tools have a chance to detect
  // that it's a binary file
  buf += '%\xFF\xFF\xFF\xFF\n\n'

  // body
  var xref = new PDFXref
  this.objects.forEach(function(object) {
    xref.add(object.id, buf.length, object)
    buf += object.toString() + '\n\n'
  })

  // to support random access to individual objects, a PDF file
  // contains a cross-reference table that can be used to locate
  // and directly access pages and other important objects within the file
  var startxref = buf.length
  buf += xref.toString()

  // trailer
  var trailer = new PDFTrailer(this.objects.length + 1, this.catalog, this.info)
  buf += trailer.toString() + '\n'

  // startxref
  buf += 'startxref\n'
  buf += startxref + '\n'
  buf += '%%EOF'

  return buf
}

PDF.prototype.toString = function() {
  return this.build()
}

var base64 = require('base-64')
PDF.prototype.toDataURL = function() {
  return 'data:application/pdf;base64,' + base64.encode(this.build())
}


function hasFunction(obj, name) {
  return typeof obj[name] === 'function'
}

function hasChildren(obj) {
  return obj.children && Array.isArray(obj.children)
}

function intersect(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
  var s1x = p1x - p0x
  var s1y = p1y - p0y
  var s2x = p3x - p2x
  var s2y = p3y - p2y

  var s = (-s1y * (p0x - p2x) + s1x * (p0y - p2y)) / (-s2x * s1y + s1x * s2y)
  var t = ( s2x * (p0y - p2y) - s2y * (p0x - p2x)) / (-s2x * s1y + s1x * s2y)

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    // Collision detected
    var intX = p0x + (t * s1x)
    var intY = p0y + (t * s1y)
    return [intX, intY]
  }

  return null // No collision
}

},{"../../package.json":109,"./cursor":17,"./object/object":42,"./object/page":43,"./object/pages":44,"./object/trailer":48,"./object/xobject":50,"./object/xref":51,"base-64":62,"debug":68,"node-uuid":87}],19:[function(require,module,exports){
'use strict'

var debug = require('debug')('pdfjs:break')

var BaseNode = module.exports = function() {
  this.type = 'BaseNode'
  this.allowBreak = false
  this.PageBreakType = require('./pagebreak')
  this.direction = 'topDown'
  this.page = 0
  this.computed = false
  this.arranged = false
}

BaseNode.prototype.mustUpdate = function(/* cursor */) {
  return false
}

BaseNode.prototype.beforeContent = function(cursor) {
  return cursor
}

BaseNode.prototype.afterContent = function(cursor) {
  return cursor
}

BaseNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.width  = 0
  this.height = 0
}

BaseNode.prototype.compute = function(cursor) {
  cursor.setPage(this.page)

  var must = this.mustUpdate(cursor) || !this.computed || cursor.force

  if (must) {
    this._compute(cursor)
    this.computed = true
    this.arranged = false
    cursor.force = true
  }

  cursor = this.beforeContent(cursor)

  if ('children' in this) {
    this.children.forEach(function(child) {
      child.compute(cursor)
    })
  }

  this.afterContent(cursor)
}

BaseNode.prototype.shift = function(offset) {
  this.y -= offset

  if (this.children) {
    this.children.forEach(function(child) {
      child.shift(offset)
    })
  }
}

BaseNode.prototype.arrange = function(cursor) {
  var must = !this.arranged || cursor.force


  this.page = cursor.currentPage

  if (must) {
    this.arranged = true
    cursor.force = true
  }

  cursor = cursor.beforeContent(this)

  if ('children' in this) {

    if (this.direction === 'leftRight') {
      var rowPage = cursor.currentPage
      var endPage = cursor.currentPage
      var rowOffset = cursor.offset
      var endOffset = cursor.offset
      var rowY = cursor.y
      var endY = cursor.y
    }

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i]

      if (child.type === 'PageBreakNode') {
        if (cursor.pageBreak(child, this) === null) {
          debug('INVALIDATE %d', child.id)
          this.children.splice(i, 1)
          --i
        } else {
          debug('VALID break %d', child.id)
          if (child.height && cursor.y - child.height < cursor.bottom - cursor.offset) {
            debug('FORCE BREAK %s (%d height)', child.type, child.height)

            child.arranged = false
            child.computed = false

            if (i === 0) {
              child.children.length = 0
            } else {
              this.children[i - 1].arranged = false
              this.children[i - 1].computed = false

              this.children.splice(i, 1)
              this.children.splice(i - 1, 0, child)
            }

            return false
          }

          cursor.applyBreak(child)
        }

        continue
      }

      if (cursor.mustBreak(child)) {
        debug('BREAK %s at Page %d', child.type, cursor.currentPage)

        child.arranged = false

        // page break
        this.children.splice(i, 0, cursor.pageBreak(null, this))
        child.page = cursor.currentPage

        return false
      }

      if (!child.arrange(cursor)) {
        return false
      }

      if (this.direction === 'leftRight') {
        endPage = Math.max(endPage, cursor.currentPage)
        endOffset = Math.max(endOffset, cursor.offset)
        endY = Math.min(endY, cursor.y)
        cursor.setPage(rowPage)
        cursor.offset = rowOffset
        cursor.y = rowY
      }
    }

    if (this.direction === 'leftRight') {
      cursor.setPage(endPage)
      cursor.offset = endOffset
      cursor.y = endY
    }
  }

  cursor.afterContent(this)

  return true
}

},{"./pagebreak":27,"debug":68}],20:[function(require,module,exports){
'use strict'

var utils = require('../utils')

var BoxNode = module.exports = function(box) {
  BoxNode.super_.call(this)

  this.type = 'BoxNode'

  this.box       = box
  this.style     = box.style
  this.children  = this.box.children.map(function(child) {
    return child.createNode()
  })
}

utils.inherits(BoxNode, require('./base'))

Object.defineProperties(BoxNode.prototype, {
  height: {
    enumerable: true,
    configurable: true,
    get: function() {
      return this.children.map(function(child) { return child.height })
                          .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
             + this.style.borderTopWidth + this.style.paddingTop + this.style.paddingBottom + this.style.borderBottomWidth
    }
  },
  beforeBreakHeight: {
    enumerable: true,
    configurable: true,
    get: function() {
      return this.style.paddingBottom + this.style.borderBottomWidth
    }
  }
})

BoxNode.prototype.beforeContent = function(cursor) {
  var top = this.style.borderTopWidth + this.style.paddingTop
  if (top > 0) {
    cursor.y -= top
  }

  var left = this.style.borderLeftWidth + this.style.paddingLeft
  if (left > 0) {
    cursor.x += left
  }

  return cursor.create(this.width)
}

BoxNode.prototype.afterContent = function(cursor) {
  var bottom = this.style.borderBottomWidth + this.style.paddingBottom
  if (bottom > 0) {
    cursor.y -= bottom
  }

  var left = this.style.borderLeftWidth + this.style.paddingLeft
  if (left > 0) {
    cursor.x -= left
  }

  return cursor
}

BoxNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.width = utils.resolveWidth(this.style.width, cursor.width)
             - this.style.paddingLeft - this.style.borderLeftWidth
             - this.style.paddingRight - this.style.borderRightWidth
}

BoxNode.prototype.begin = function(doc, parent) {
  var height = this.height
  var width  = this.style.borderLeftWidth + this.style.paddingLeft + this.width + this.style.paddingRight + this.style.borderRightWidth
  var left   = this.x + (this.style.borderLeftWidth / 2)
  var top    = this.y - (this.style.borderTopWidth / 2)
  var right  = this.x + width - (this.style.borderRightWidth / 2)
  var bottom = this.y - height + (this.style.borderBottomWidth / 2)

  // backogrund color
  if (this.style.backgroundColor !== null) {
    drawBackground(doc, left - (this.style.borderLeftWidth / 2),
                        bottom - (this.style.borderBottomWidth / 2),
                        width, height,
                        this.style.backgroundColor)
  }

  // border top
  if (this.style.borderTopWidth > 0) {
    drawLine(doc, this.style.borderTopWidth,
                  [left - (this.style.borderLeftWidth / 2), top],
                  [right + (this.style.borderRightWidth / 2), top],
                  this.style.borderTopColor)
  }


  // border right
  if (this.style.borderRightWidth > 0) {
    drawLine(doc, this.style.borderRightWidth,
                  [right, top + (this.style.borderTopWidth / 2)],
                  [right, bottom - (this.style.borderBottomWidth / 2)],
                  this.style.borderRightColor)
  }

  // border bottom
  if (this.style.borderBottomWidth > 0) {
    drawLine(doc, this.style.borderBottomWidth,
                  [right + (this.style.borderRightWidth / 2), bottom],
                  [left - (this.style.borderLeftWidth / 2), bottom],
                  this.style.borderBottomColor)
  }

  // border left
  if (this.style.borderLeftWidth > 0) {
    drawLine(doc, this.style.borderLeftWidth,
                  [left, bottom - (this.style.borderBottomWidth / 2)],
                  [left, top + (this.style.borderTopWidth / 2)],
                  this.style.borderLeftColor)
  }
}

function drawLine(doc, lineWidth, from, to, color) {
  doc.RG.apply(doc, utils.colorToRgb(color || 0x000000))
  doc.w(lineWidth)
  doc.line(from[0], from[1], to[0], to[1])
}

function drawBackground(doc, x, y, width, height, color) {
  doc.rg.apply(doc, utils.colorToRgb(color || 0x000000))
  doc.rectangle(x, y, width, height)
  doc.f()
}

},{"../utils":54,"./base":19}],21:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var BoxNode = require('./box')

var CellNode = module.exports = function(cell) {
  CellNode.super_.call(this, cell)

  this.type = 'CellNode'

  this.cell = cell
}

utils.inherits(CellNode, BoxNode)

Object.defineProperties(CellNode.prototype, {
  minHeight: {
    enumerable: true,
    get: function() {
      return this.children.map(function(child) { return child.height })
                          .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
    }
  },
  height: {
    enumerable: true,
    value: 0,
    writable: true
  }
})

CellNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

CellNode.prototype.beforeContent = function(cursor) {
  cursor.x = this.x
  cursor.y = this.y

  return BoxNode.prototype.beforeContent.call(this, cursor)
}

CellNode.prototype._compute = function(cursor) {
  // this.x = cursor.x
  // this.y = cursor.y

  // this.width = resolveWidth(this.style.width, cursor.width)
  //            - this.style.paddingLeft - this.style.borderLeftWidth
  //            - this.style.paddingRight - this.style.borderRightWidth
}

},{"../utils":54,"./box":20}],22:[function(require,module,exports){
'use strict'

var DocumentNode = module.exports = function(doc) {
  DocumentNode.super_.call(this)

  this.type = 'DocumentNode'
  this.allowBreak = true

  this.doc      = doc
  this.style    = doc.style

  this.children = this.doc.children.map(function(child) {
    return child.createNode(this)
  }, this)

  this.headers  = []
  this.footers  = []
}

require('../utils').inherits(DocumentNode, require('./base'))

DocumentNode.prototype.begin = function(doc, parent) {
  var currentPage = doc.pages.kids.length
  var header = this.headers[currentPage]
  if (header) {
    doc._build(header, { parent: parent, node: this })
  }
}

DocumentNode.prototype.end = function(doc, parent) {
  var currentPage = doc.pages.kids.length
  var footer = this.footers[currentPage]
  if (footer) {
    doc._build(footer, { parent: parent, node: this })
  }
}

},{"../utils":54,"./base":19}],23:[function(require,module,exports){
'use strict'

var PDFImage = require('../object/image')
var PDFFormXObject = require('../object/formxobject')

var ImageNode = module.exports = function(image) {
  ImageNode.super_.call(this)

  this.type = 'ImageNode'

  this.image  = image
  this.style  = image.style
  this.type   = this.image.img.type
  this.info   = this.image.img.info
}

require('../utils').inherits(ImageNode, require('./base'))

ImageNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.renderWidth = this.info.width
  this.renderHeight = this.info.height

  switch (this.type) {
    case 'jpeg':
      switch (this.info.colorSpace) {
      case 3:
        this.colorSpace = 'DeviceRGB'
        break
      case 1:
        this.colorSpace = 'DeviceGRAY'
        break
      default:
        break
      }
      break
    case 'pdf':
      break
  }

  if (this.style.width && this.style.height) {
    this.renderWidth  = this.style.width
    this.renderHeight = this.style.height
  } else if(this.style.width) {
    this.renderWidth  = this.style.width
    this.renderHeight = this.info.height * (this.style.width / this.info.width)
  } else if (this.style.height) {
    this.renderHeight = this.style.height
    this.renderWidth  = this.info.width * (this.style.height / this.info.height)
  } else {
    this.renderWidth  = Math.min(this.info.width, cursor.width)
    this.renderHeight = this.info.height * (this.renderWidth / this.info.width)

    if (this.renderHeight > cursor.pageHeight) {
      this.renderHeight = cursor.pageHeight
      this.renderWidth  = this.info.width * (this.renderHeight / this.info.height)
    }
  }

  switch (this.style.align) {
    case 'right':
      this.x += cursor.width - this.renderWidth
      break
    case 'center':
      this.x += (cursor.width - this.renderWidth) / 2
      break
    case 'left':
    default:
      break
  }

  if (this.style.wrap) {
    this.width  = this.renderWidth
    this.height = this.renderHeight
  } else {
    this.width  = 0
    this.height = 0
  }
}

ImageNode.prototype.beforeContent = function(cursor) {
  if (this.style.wrap) {
    cursor.y -= this.renderHeight
  }

  return cursor
}

ImageNode.prototype.render = function(doc) {
  var image = doc.mapping[this.image.uuid]
  if (!image) {
    switch (this.type) {
      case 'jpeg':
        image = new PDFImage(doc.images.length + 1, this)
        break
      case 'pdf':
        image = new PDFFormXObject(doc.images.length + 1, this)
        break
    }
    doc.mapping[this.image.uuid] = image
    doc.images.push(image)
  }

  if (!doc.currentPage.xobjects.has(image.alias)) {
    doc.currentPage.xobjects.add(image.alias, image.toReference())
  }

  var x = this.x
  var y = this.y - this.renderHeight


  if (this.style.wrap === false) {
    x = this.style.x !== null ? this.style.x : x
    y = this.style.y !== null ? (this.style.y - doc.offset) : y
  }

  var width, height
  switch (this.type) {
    case 'pdf':
      width  = this.renderWidth / this.info.width
      height = this.renderHeight / this.info.height
      break
    case 'jpeg':
    default:
      width  = this.renderWidth
      height = this.renderHeight
      break
  }

  doc.q()
  doc.cm(width, 0, 0, height, x, y)
  doc.Do(image.alias)
  doc.Q()
}

},{"../object/formxobject":37,"../object/image":38,"../utils":54,"./base":19}],24:[function(require,module,exports){
'use strict'

var LineBreakNode = module.exports = function(linebreak) {
  LineBreakNode.super_.call(this)

  this.type = 'LineBreakNode'
  this.allowBreak = true

  this.linebreak = linebreak
  this.children  = []
  this.isEmptyLine = false
}

require('../utils').inherits(LineBreakNode, require('./base'))

LineBreakNode.prototype.beforeContent = function(cursor) {
  if (this.isEmptyLine) {
    cursor.y -= this.height
  }

  return cursor
}

LineBreakNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.width  = 0
  this.height = this.linebreak.height
}

},{"../utils":54,"./base":19}],25:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var Word      = require('../../element/word')
var WordNode  = require('./word')

var PageCount = module.exports = function(pageCount) {
  PageCount.super_.call(this, pageCount)

  this.type = 'PageCount'

  this.number = 0
}

utils.inherits(PageCount, WordNode)

PageCount.prototype.mustUpdate = function(cursor) {
  if (this.number !== cursor.pageCount) {
    this.number = cursor.pageCount
    var width  = this.word.width
    var height = this.word.height
    this.word = new Word(String(cursor.pageCount), this.style)
    return this.word.width !== width || this.word.height !== height
  }

  return false
}

},{"../../element/word":14,"../utils":54,"./word":32}],26:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var Word      = require('../../element/word')
var WordNode  = require('./word')

var PageNumber = module.exports = function(pageNumber) {
  PageNumber.super_.call(this, pageNumber)

  this.type = 'PageNumber'

  this.number = 0
}

utils.inherits(PageNumber, WordNode)

PageNumber.prototype.mustUpdate = function(cursor) {
  if (this.number !== cursor.currentPage) {
    this.number = cursor.currentPage
    var width  = this.word.width
    var height = this.word.height
    this.word = new Word(String(cursor.currentPage), this.style)
    return this.word.width !== width || this.word.height !== height
  }

  return false
}

},{"../../element/word":14,"../utils":54,"./word":32}],27:[function(require,module,exports){
'use strict'

var PageBreakNode = module.exports = function(id, offset) {
  PageBreakNode.super_.call(this)

  this.type     = 'PageBreakNode'
  this.id       = id
  this.offset   = offset

  this.begun  = []
  this.broken = []
  this.ended  = []
}

require('../utils').inherits(PageBreakNode, require('./base'))

PageBreakNode.prototype.end = function(doc, parent) {
  var parents = [], p = parent
  while (p) {
    parents.unshift(p)
    p = p.parent
  }

  parents.forEach(function(p) {
    if (hasFunction(p.node, 'end') && this.ended.indexOf(p.node) === -1) {
      p.node.end(doc, p.parent)

      this.ended.push(p.node)
    }
  }, this)

  doc.createPage()

  var offset = doc.offset + this.offset
  doc.offset = 0

  parents.forEach(function(p) {
    if (hasFunction(p.node, 'afterBreak') && this.broken.indexOf(p.node) === -1) {
      p.node.afterBreak(doc, p.parent)

      this.broken.push(p.node)
    }
  }, this)

  doc.offset = offset

  parents.forEach(function(p) {
    if (hasFunction(p.node, 'begin') && this.begun.indexOf(p.node) === -1) {
      p.node.begin(doc, p.parent)

      this.begun.push(p.node)
    }
  }, this)

  this.rendered = true
}

function hasFunction(obj, name) {
  return typeof obj[name] === 'function'
}

},{"../utils":54,"./base":19}],28:[function(require,module,exports){
'use strict'

var RowNode = module.exports = function(row) {
  RowNode.super_.call(this)

  this.type = 'RowNode'
  this.allowBreak = false
  this.direction = 'leftRight'

  this.row      = row
  this.style    = row.style
  this.children = this.row.children.map(function(child) {
    return child.createNode()
  })
  this.isFirst  = false

  this.refs = []
  for (var i = 0; i < this.children.length; ++i) {
    var child = this.children[i]
    this.refs.push(child)

    if (child.style.colspan > 1) {
      for (var j = 1; j < child.style.colspan; ++j) {
        this.refs.push(child)
      }
    }
  }
}

require('../utils').inherits(RowNode, require('./base'))

Object.defineProperties(RowNode.prototype, {
  height: {
    enumerable: true,
    get: function() {
      return Math.max.apply(Math, this.children.map(function(child) {
        var height = child.minHeight
                   + child.style.paddingTop + child.style.paddingBottom
                   + child.style.borderTopWidth + child.style.borderBottomWidth

        return height
      }, this))
    }
  }
})

RowNode.prototype.clone = function() {
  var clone = new RowNode(this.row)
  clone.width = this.width
  clone.widths = this.widths
  return clone
}

RowNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

RowNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  var offset = 0, index = 0
  this.children.forEach(function(child, i) {
    // set width
    child.width = (this.widths[index++] || 0)
               - child.style.borderLeftWidth - child.style.paddingLeft
               - child.style.paddingRight - child.style.borderRightWidth

    if (child.style.colspan > 1) {
      for (var j = 1; j < child.style.colspan; ++j) {
        child.width += this.widths[index++] || 0
      }
    }

    child.y = cursor.y
    child.x = cursor.x + offset
    offset += child.width
            + child.style.paddingLeft + child.style.paddingRight
            + child.style.borderRightWidth + child.style.borderLeftWidth
  }, this)
}

RowNode.prototype.afterContent = function(cursor) {
  var height = this.height

  this.children.forEach(function(child) {
    child.height = height
  })

  cursor.x = this.x
  cursor.y = this.y - this.height

  return cursor
}

var BoxNode = require('./box')

RowNode.prototype.begin = function(doc, parent) {
  this.children.forEach(function(child) {
    BoxNode.prototype.begin.call(child, doc, parent)
  })
}

},{"../utils":54,"./base":19,"./box":20}],29:[function(require,module,exports){
'use strict'

var TablePageBreakNode = module.exports = function(id, offset) {
  TablePageBreakNode.super_.call(this, id, offset)

  this.type = 'PageBreakNode'
  this.children = []
}

require('../utils').inherits(TablePageBreakNode, require('./pagebreak'))

Object.defineProperties(TablePageBreakNode.prototype, {
  height: {
    enumerable: true,
    get: function() {
      return this.children.map(function(child) { return child.height })
                          .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
    }
  }
})

TablePageBreakNode.with = function(children) {
  return function(id, offset) {
    var node = new TablePageBreakNode(id, offset)
    node.children = children.map(function(child) {
      return child.clone()
    })

    return node
  }
}

TablePageBreakNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y
}

TablePageBreakNode.prototype.beforeContent = function(cursor) {
  this.yBefore = cursor.y
  return cursor
}

TablePageBreakNode.prototype.afterContent = function(cursor) {
  cursor.y = this.yBefore
}

},{"../utils":54,"./pagebreak":27}],30:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var TablePageBreakNode = require('./table-pagebreak')

var TableNode = module.exports = function(table) {
  TableNode.super_.call(this)

  this.type = 'TableNode'
  this.allowBreak = true

  this.table    = table
  this.style    = table.style
  this.children = this.table.children.map(function(child) {
    return child.createNode()
  })

  if (this.children.length) {
    this.children[0].isFirst = true
  }

  this.beforeBreakChildren = table.beforeBreakChildren.map(function(child) {
    return child.createNode()
  })
  this.PageBreakType = TablePageBreakNode.with(this.beforeBreakChildren)
}

utils.inherits(TableNode, require('./base'))

Object.defineProperties(TableNode.prototype, {
  height: {
    enumerable: true,
    get: function() {
      return this.children.map(function(child) { return child.height })
                          .reduce(function(lhs, rhs) { return lhs + rhs }, 0)
    }
  },
  afterBreakHeight: {
    enumerable: true,
    get: function() {
      var height = 0
      for (var i = 0; i < this.style.headerRows; ++i) {
        var row = this.children[i]
        if (!row) {
          break
        }

        height += row.height
      }
      return height
    }
  }
})

TableNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

TableNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  this.y = cursor.y

  this.width = utils.resolveWidth(this.style.width, cursor.width)

  switch (this.style.tableLayout) {
    case 'fixed':
      this.widths = this.style.widths.map(function(width) {
        return utils.resolveWidth(width, this.width)
      }, this)

      break
    default:
      throw new Error('Table layout `' + this.style.tableLayout + '` not implemented')
  }

  this.children.forEach(function(row, j) {
    row.width = this.width
    row.widths = this.widths

    // unify border
    var index = 0
    row.children.forEach(function(cell, i) {
      if (j > 0) {
        var onTop = this.children[j - 1].refs[index++]
        if (!onTop) {
          return
        }

        var horizontalWidth, horizontalColor

        if (cell.style.borderTopWidth > onTop.style.borderBottomWidth) {
          horizontalWidth = cell.style.borderTopWidth / 2
          horizontalColor = cell.style.borderTopColor
        } else {
          horizontalWidth = onTop.style.borderBottomWidth / 2
          horizontalColor = onTop.style.borderBottomColor
        }

        onTop.style = onTop.style.merge({
          borderBottomWidth: horizontalWidth,
          borderBottomColor: horizontalColor
        })

        cell.style = cell.style.merge({
          borderTopWidth: horizontalWidth,
          borderTopColor: horizontalColor
        })

        if (cell.style.colspan > 1) {
          for (var k = 1; k < cell.style.colspan; ++k) {
            var next = this.children[j - 1].children[index++]
            if (!next) {
              break
            }
            next.style = next.style.merge({
              borderBottomWidth: horizontalWidth,
              borderBottomColor: horizontalColor
            })
          }
        }
      }

      if (i > 0) {
        var onLeft = row.children[i - 1]
        var verticalWidth, verticalColor

        if (cell.style.borderLeftWidth > onLeft.style.borderRightWidth) {
          verticalWidth = cell.style.borderLeftWidth / 2
          verticalColor = cell.style.borderLeftColor
        } else {
          verticalWidth = onLeft.style.borderRightWidth / 2
          verticalColor = onLeft.style.borderRightColor
        }

        onLeft.style = onLeft.style.merge({
          borderRightWidth: verticalWidth,
          borderRightColor: verticalColor
        })

        cell.style = cell.style.merge({
          borderLeftWidth: verticalWidth,
          borderLeftColor: verticalColor
        })
      }
    }, this)
  }, this)

  this.beforeBreakChildren.forEach(function(row, j) {
    row.width = this.width
    row.widths = this.widths
  }, this)
}

TableNode.prototype.afterBreak = function(doc, parent) {
  for (var i = 0; i < this.style.headerRows; ++i) {
    var row = this.children[i]
    if (!row) {
      break
    }

    doc._build(row, { parent: parent, node: this })
  }
}

},{"../utils":54,"./base":19,"./table-pagebreak":29}],31:[function(require,module,exports){
'use strict'

var TextNode = module.exports = function(text) {
  TextNode.super_.call(this)

  this.type = 'TextNode'
  this.allowBreak = true

  this.text     = text
  this.style    = this.currentStyle = text.style
  this.children = this.text.children.map(function(child) {
    return child.createNode()
  })
}

require('../utils').inherits(TextNode, require('./base'))

TextNode.prototype.mustUpdate = function(cursor) {
  for (var i = 0, len = this.children.length; i < len; ++i) {
    if (this.children[i].mustUpdate(cursor)) {
      return true
    }
  }

  return false
}

TextNode.prototype.afterContent = function(cursor) {
  if (this.children.length) {
    cursor.y += this.descent
  }

  return cursor
}

TextNode.prototype._compute = function(cursor) {
  this.x = cursor.x
  var y = this.y = cursor.y
  this.width  = cursor.width
  this.height = 0
  this.descent = 0

  var line  = []
  var spaceLeft = cursor.width
  var isLastLine = false

  var self = this
  var renderLine = function() {
    if (!line.length) {
      return
    }

    if (isLastLine) {
      self.descent = 0
    }

    var left = cursor.x

    var height = Math.max.apply(Math, line.map(function(word) {
      return word.word.height
    }))

    var emptySpace = cursor.width - line.map(function(word, i) {
      return word.word.width + (i > 0 ? word.word.spacing : 0)
    }).reduce(function(lhs, rhs) {
      return lhs + rhs
    }, 0)

    var count = line.length
    var spacing = 0

    // alignement
    switch (self.text.style.textAlign) {
      case 'right':
        left += emptySpace
        break
      case 'center':
        left += cursor.width / 2 - (cursor.width - emptySpace) / 2
        break
      case 'justify':
        if (isLastLine && emptySpace / cursor.width > .2) {
          break
        }
        spacing = emptySpace / (count - 1)
        break
    }

    line[0].isFirst = true
    line[line.length - 1].isLast = true

    line.forEach(function(word, i) {
      var width = word.word.width + word.word.spacing + spacing

      word.setBoundingBox(left, cursor.y, width, height)
      left = left
      left += width

      self.descent = Math.min(self.descent, word.style.font.lineDescent(word.style.fontSize))
    }, this)

    self.height += height
    y -= height

    line.length = 0
    spaceLeft = cursor.width
    isLastLine = false
  }

  this.children.forEach(function(word, i) {
    if (word.type === 'PageBreakNode') {
      return
    } else if (word.type === 'LineBreakNode') {
      isLastLine = true

      if (line.length) {
        renderLine()
      } else {
        word.isEmptyLine = true
        self.height += word.linebreak.height
        y -= word.linebreak.height
      }
      return
    }

    // reset isFirst and isLast for possible rearrangment
    word.isFirst = false
    word.isLast = false

    var wordWidth = word.word.width
    if (i > 0) wordWidth += word.word.spacing

    if (line.length > 0 && (spaceLeft - wordWidth) < 0) {
      renderLine()
    }

    spaceLeft -= wordWidth
    line.push(word)
  }, this)

  isLastLine = true
  renderLine()

  this.height -= this.descent // substract, because descent is negative
}

var WordNode = require('./word')

TextNode.prototype.begin = function(doc, parent) {
  doc.BT()
  WordNode.prototype.buildStyle.call(this, doc, parent)
}

TextNode.prototype.end = function(doc) {
  doc.ET()
}

},{"../utils":54,"./base":19,"./word":32}],32:[function(require,module,exports){
'use strict'

var WordNode = module.exports = function(word) {
  WordNode.super_.call(this)

  this.type = 'WordNode'

  this.word    = word
  this.style   = word.style
  this.isFirst = false
  this.isLast  = false
}

require('../utils').inherits(WordNode, require('./base'))

WordNode.prototype.beforeContent = function(cursor) {
  if (this.isLast) {
    cursor.y -= this.height
  }

  return cursor
}

WordNode.prototype._compute = function(cursor) {
  this.y = cursor.y
}

WordNode.prototype.setBoundingBox = function(x, y, width, height) {
  this.x = x
  this.y = y

  this.width  = width
  this.height = height
}

var PDFString = require('../object/string')
var TTFFont   = require('../object/font/ttf')
var utils     = require('../utils')

WordNode.prototype.buildStyle = function(doc, parent) {
  var font = doc.mapping[this.style.font.uuid]
  if (!font) {
    font = new TTFFont(doc.fonts.length + 1, this.style.font)
    doc.mapping[this.style.font.uuid] = font
    doc.fonts.push(font)
  }

  if (!doc.currentPage.fonts.has(font.alias)) {
    doc.currentPage.fonts.add(font.alias, font.toReference())
  }

  if (parent.node.style !== this.style || parent.node.currentStyle !== this.style) {
    doc.Tf(font.alias, this.style.fontSize)
    doc.rg.apply(doc, utils.colorToRgb(this.style.color))
    parent.node.currentStyle = this.style
  }
}

WordNode.prototype.render = function(doc, parent) {
  this.buildStyle(doc, parent)

  var font = doc.mapping[this.style.font.uuid]

  if (this.isFirst) {
    doc.Tm(1, 0, 0, 1, this.x, this.y - this.height)
  }

  var str = font.encode(this.word.toString())
  doc.Tj((new PDFString(str)).toHexString())

  if (!this.isLast) {
    doc.Td(this.width, 0)
  }
}

},{"../object/font/ttf":36,"../object/string":47,"../utils":54,"./base":19}],33:[function(require,module,exports){
var PDFArray = module.exports = function(array) {
  if (!array) array = []

  array.toString = function() {
    return '[' +
            this.map(function(item) {
              return String(item)
            }).join(' ') +
           ']'
  }

  return array
}

var PDFValue = require('./value')

PDFArray.parse = function(xref, lexer, trial) {
  if (lexer.getString(1) !== '[') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid array')
  }

  lexer.shift(1)
  lexer.skipWhitespace(null, true)

  var values = []

  while (lexer.getString(1) !== ']') {
    values.push(PDFValue.parse(xref, lexer))
    lexer.skipWhitespace(null, true)
  }

  lexer.shift(1)

  return new PDFArray(values)
}

},{"./value":49}],34:[function(require,module,exports){
exports.parse = function(xref, lexer, trial) {
  var isTrue = lexer.getString(4) === 'true'
  var isFalse = !isTrue && lexer.getString(5) === 'false'

  if (!isTrue && !isFalse) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid boolean')
  }

  if (isTrue) {
    lexer.shift(4)
  } else {
    lexer.shift(5)
  }

  return isTrue
}

},{}],35:[function(require,module,exports){
var PDFName = require('./name')

var PDFDictionary = module.exports = function(dictionary) {
  this.dictionary = {}
  if (dictionary) {
    for (var key in dictionary) {
      this.add(key, dictionary[key])
    }
  }
}

PDFDictionary.prototype.add = PDFDictionary.prototype.set = function(key, val) {
  key = new PDFName(key)
  if (typeof val === 'string') val = new PDFName(val)
  this.dictionary[key] = val
}

PDFDictionary.prototype.has = function(key) {
  return String(new PDFName(key)) in this.dictionary
}

PDFDictionary.prototype.get = function(key) {
  return this.dictionary[new PDFName(key)]
}

PDFDictionary.prototype.toString = function() {
  var self = this
  return '<<\n' +
           Object.keys(this.dictionary).map(function(key) {
             var value = self.dictionary[key] && self.dictionary[key].toString() || 'null'
             return key.toString() + ' ' + value
           }).join('\n').replace(/^/gm, '\t') + '\n' +
         '>>'
}

Object.defineProperty(PDFDictionary.prototype, 'length', {
  get: function() {
    return Object.keys(this.dictionary).length
  },
  enumerable: true
})

var PDFValue = require('./value')

PDFDictionary.parse = function(xref, lexer, trial) {
  if (lexer.getString(2) !== '<<') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid dictionary')
  }

  lexer.shift(2)
  lexer.skipWhitespace(null, true)

  var dictionary = new PDFDictionary

  while (lexer.getString(2) !== '>>') {
    var key = PDFName.parse(xref, lexer)
    lexer.skipWhitespace(null, true)

    var value = PDFValue.parse(xref, lexer)
    dictionary.set(key, value)

    lexer.skipWhitespace(null, true)
  }

  lexer.shift(2)

  return dictionary
}

},{"./name":39,"./value":49}],36:[function(require,module,exports){
'use strict'

var PDFObject     = require('../object')
var PDFArray      = require('../array')
var PDFStream     = require('../stream')
var PDFDictionary = require('../dictionary')
var PDFString     = require('../string')
var PDFName       = require('../name')

var utils = require('../../utils')

var TTFFont = module.exports = function(id, font) {
  this.alias = new PDFName('F' + id)

  this.font = font
  this.subset = this.font.subset()
  this.subset.use(' ')

  // font descriptor
  this.descriptor = new PDFObject('FontDescriptor')
  this.descriptor.prop('FontName', this.font.ttf.fontName)
  this.descriptor.prop('Flags', this.font.ttf.flags)
  this.descriptor.prop('FontBBox', new PDFArray(this.font.ttf.bbox))
  this.descriptor.prop('ItalicAngle', this.font.ttf.italicAngle)
  this.descriptor.prop('Ascent', this.font.ttf.ascent)
  this.descriptor.prop('Descent', this.font.ttf.descent)
  this.descriptor.prop('CapHeight', this.font.ttf.capHeight)
  this.descriptor.prop('StemV', this.font.ttf.stemV)

  this.descendant = new PDFObject('Font')
  this.descendant.prop('Subtype', 'CIDFontType2')
  this.descendant.prop('BaseFont', this.font.ttf.fontName)
  this.descendant.prop('DW', 1000)
  this.descendant.prop('CIDToGIDMap', 'Identity')
  this.descendant.prop('CIDSystemInfo', new PDFDictionary({
    'Ordering':   new PDFString('Identity'),
    'Registry':   new PDFString('Adobe'),
    'Supplement': 0
  }))
  this.descendant.prop('FontDescriptor', this.descriptor.toReference())

  PDFObject.call(this, 'Font')
  this.prop('Subtype', 'Type0')
  this.prop('BaseFont', this.font.ttf.fontName)
  this.prop('Encoding', 'Identity-H')
  this.prop('DescendantFonts', new PDFArray([
    this.descendant.toReference()
  ]))
}

utils.inherits(TTFFont, PDFObject)

TTFFont.prototype.encode = function(str) {
  this.subset.use(str)
  return this.subset.encode(str)
}

TTFFont.prototype.embed = function(doc) {
  this.subset.embed()

  // widths array
  var metrics = [], codeMap = this.subset.cmap()
  for (var code in codeMap) {
    if (code < 32) continue
    var gid = codeMap[code]
    var width = Math.round(this.font.ttf.tables.hmtx.metrics[gid] * this.font.ttf.scaleFactor)
    metrics.push(code - 31)
    metrics.push(new PDFArray([width]))
  }

  this.descendant.prop('W', new PDFArray(metrics))

  // unicode map
  var cmap = new PDFStream(doc.createObject())
  cmap.writeLine('/CIDInit /ProcSet findresource begin')
  cmap.writeLine('12 dict begin')
  cmap.writeLine('begincmap')
  cmap.writeLine('/CIDSystemInfo <<')
  cmap.writeLine('  /Registry (Adobe)')
  cmap.writeLine('  /Ordering (Identity)')
  cmap.writeLine('  /Supplement 0')
  cmap.writeLine('>> def')
  cmap.writeLine('/CMapName /Identity-H')
  cmap.writeLine('/CMapType 2 def')
  cmap.writeLine('1 begincodespacerange')
  cmap.writeLine('<0000><ffff>')
  cmap.writeLine('endcodespacerange')

  var mapping = this.subset.subset, lines = []
  for (code in mapping) {
    if (lines.length >= 100) {
      cmap.writeLine(lines.length + ' beginbfchar')
      for (var i = 0; i < lines.length; ++i) {
        cmap.writeLine(lines[i])
      }
      cmap.writeLine('endbfchar')
      lines = []
    }

    lines.push(
      '<' + ('0000' + (+code - 31).toString(16)).slice(-4) + '>' + // cid
      '<' + ('0000' + mapping[code].toString(16)).slice(-4) + '>'  // gid
    )
  }

  if (lines.length) {
    cmap.writeLine(lines.length + ' beginbfchar')
    lines.forEach(function(line) {
      cmap.writeLine(line)
    })
    cmap.writeLine('endbfchar')
  }

  cmap.writeLine('endcmap')
  cmap.writeLine('CMapName currentdict /CMap defineresource pop')
  cmap.writeLine('end')
  cmap.writeLine('end')

  this.prop('ToUnicode', cmap.toReference())

  // font file
  var data = this.subset.save()
  var hex = utils.asHex(data)

  var file = new PDFStream(doc.createObject())
  file.object.prop('Length', hex.length + 1)
  file.object.prop('Length1', data.byteLength)
  file.object.prop('Filter', 'ASCIIHexDecode')
  file.content = hex + '>\n'

  this.descriptor.prop('FontFile2', file.toReference())

  doc.addObject(this)
  doc.addObject(this.descriptor)
  doc.addObject(this.descendant)
}

},{"../../utils":54,"../array":33,"../dictionary":35,"../name":39,"../object":42,"../stream":46,"../string":47}],37:[function(require,module,exports){
var PDFObject = require('./object')
var PDFStream = require('./stream')
var PDFArray  = require('./array')
var PDFName   = require('./name')
var utils     = require('../utils')

var PDFFormXObject = module.exports = function(id, img) {
  this.alias = new PDFName('FXO' + id)
  this.img = img

  PDFObject.call(this, id)

  this.resources = img.info.page.get('Resources')

  this.prop('Type', 'XObject')
  this.prop('Subtype', 'Form')
  this.prop('FormType', 1)
  this.prop('BBox', new PDFArray([0, 0, img.info.width, img.info.height]))
  this.prop('Resources', this.resources instanceof PDFObject ? this.resources.toReference() : this.resources)

  var contents = img.info.page.get('Contents').object
  this.content = new PDFStream(this)
  this.content.content = contents.content.content

  if (contents.properties.has('Filter')) {
    this.prop('Filter', contents.properties.get('Filter'))
  }
  this.prop('Length',  contents.properties.get('Length'))
  if (contents.properties.has('Length1')) {
    this.prop('Length1', contents.properties.get('Length1'))
  }

  this.objects = []
  this.addObjectsRecursive(this)
}

utils.inherits(PDFFormXObject, PDFObject)

PDFFormXObject.prototype.embed = function(doc) {
  doc.addObject(this)

  this.objects.forEach(function(obj) {
    doc.addObject(obj)
  })
}

var PDFDictionary = require('../object/dictionary')
var PDFReference  = require('../object/reference')

PDFFormXObject.prototype.addObjectsRecursive = function(value) {
  switch (true) {
    case value instanceof PDFReference:
      if (this.objects.indexOf(value.object) > -1) {
        break
      }
      this.objects.push(value.object)
      this.addObjectsRecursive(value.object)
      break
    case value instanceof PDFObject:
      this.addObjectsRecursive(value.properties)
      this.addObjectsRecursive(value.content)
      break
    case value instanceof PDFDictionary:
      for (var key in value.dictionary) {
        this.addObjectsRecursive(value.dictionary[key])
      }
      break
    case Array.isArray(value):
      value.forEach(function(item) {
        this.addObjectsRecursive(item)
      }, this)
      break
  }
}

},{"../object/dictionary":35,"../object/reference":45,"../utils":54,"./array":33,"./name":39,"./object":42,"./stream":46}],38:[function(require,module,exports){
'use strict'

var PDFXObject    = require('../object/xobject')
var PDFArray      = require('../object/array')
var PDFName       = require('../object/name')
var utils         = require('../utils')

var Image = module.exports = function(id, img) {
  this.alias = new PDFName('I' + id)
  this.img = img

  PDFXObject.call(this)
  this.prop('Subtype', 'Image')
  this.prop('Width',  img.info.width)
  this.prop('Height', img.info.height)
  this.prop('ColorSpace', img.colorSpace)
  this.prop('BitsPerComponent', 8)
}

utils.inherits(Image, PDFXObject)

Image.prototype.embed = function(doc) {
  var src = this.img.image.img.src
  var hex = utils.asHex(src)
  this.prop('Filter', new PDFArray(['/ASCIIHexDecode', '/DCTDecode']))
  this.prop('Length', hex.length + 1)
  this.prop('Length1', src.byteLength)
  this.content.content = hex + '>\n'

  doc.addObject(this)
}

},{"../object/array":33,"../object/name":39,"../object/xobject":50,"../utils":54}],39:[function(require,module,exports){
var PDFName = module.exports = function(name) {
  if (!name) throw new Error('A Name cannot be undefined')

  if (name instanceof PDFName) return name

  // white-space characters are not allowed
  if (name.match(/[\x00]/)) {
    throw new Error('A Name mustn\'t contain the null characters')
  }

  // delimiter characters are not allowed
  if (name.match(/[\(\)<>\[\]\{\}\/\%]/)) {
    throw new Error('A Name mustn\'t contain delimiter characters')
  }

  name = name.toString()
  // Beginning with PDF 1.2, any character except null (character code 0)
  // may be included in a name by writing its 2-digit hexadecimal code,
  // preceded by the number sign character (#)
  // ... it is recommended but not required for characters whose codes
  // are outside the range 33 (!) to 126 (~)
  name = name.replace(/[^\x21-\x7e]/g, function(c) {
    var code = c.charCodeAt(0)
    // replace unicode characters with `_`
    if (code > 0xff) code = 0x5f
    return '#' + code
  })

  this.name = name
}

PDFName.prototype.toString = function() {
  return '/' + this.name
}

PDFName.parse = function(xref, lexer, trial) {
  if (lexer.getString(1) !== '/') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid name')
  }

  lexer.shift(1)

  var name = ''

  var done = false
  var c
  while (!done && (c = lexer._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x28: // (
      case c === 0x29: // )
      case c === 0x3c: // <
      case c === 0x3e: // >
      case c === 0x5b: // [
      case c === 0x5d: // ]
      case c === 0x7b: // {
      case c === 0x7d: // }
      case c === 0x2f: // /
      case c === 0x25: // %
        done = true
        break
      case c === 0x23: // #
        var hex = lexer.readString(2)
        name += String.fromCharCode(parseInt(hex, 16))
        break
      case c >= 0x22 && c <= 0x7e: // inside range of 33 (!) to 126 (~)
        name += String.fromCharCode(c)
        break
      default:
        done = true
        break
    }
  }

  lexer.shift(-1)

  return new PDFName(name)
}

},{}],40:[function(require,module,exports){
exports.parse = function(xref, lexer, trial) {
  var isNull = lexer.getString(4) === 'null'

  if (!isNull) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid null')
  }

  lexer.shift(4)

  return null
}

},{}],41:[function(require,module,exports){
exports.parse = function(xref, lexer, trial) {
  var n = lexer.readNumber(true)

  if (n === undefined) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid number')
  }

  return n
}

},{}],42:[function(require,module,exports){
// > Objects may be labeled so that they can be referred to by other objects.
//   A labeled object is called an indirect object.
// pdfjs just calls them `references`

var PDFReference  = require('./reference')
var PDFDictionary = require('./dictionary')
var PDFStream     = require('./stream')

var PDFObject = module.exports = function(id, rev) {
  this.id         = id || null
  this.rev        = rev || 0
  this.properties = new PDFDictionary()
  this.reference  = new PDFReference(this)
  this.content    = null

  // used to have obj.object API for both indirect and direct objects
  this.object = this
}

PDFObject.prototype.addProperty = PDFObject.prototype.prop = function(key, val) {
  this.properties.add(key, val)
}

PDFObject.prototype.toReference = function() {
  return this.reference
}

PDFObject.prototype.toString = function() {
  return this.id.toString() + ' ' + this.rev + ' obj\n' +
         (this.properties.length ? this.properties.toString() + '\n' : '') +
         (this.content !== null ? this.content.toString() + '\n' : '') +
         'endobj'
}

var PDFValue = require('./value')

PDFObject.parse = function(xref, lexer, trial) {
  var before = lexer.pos

  var id = lexer.readNumber(trial)
  if (id === undefined && !trial) {
    throw new Error('Invalid object')
  }

  lexer.skipSpace(1, trial)
  var generation = lexer.readNumber(trial)
  if (generation === undefined && !trial) {
    throw new Error('Invalid object')
  }

  lexer.skipSpace(1, trial)
  if (lexer.getString(3) !== 'obj') {
    if (trial) {
      lexer.pos = before
      return undefined
    }

    throw new Error('Invalid object')
  }

  lexer.shift(3)

  lexer.skipEOL(1)
  lexer.skipWhitespace(null, true)

  var value = PDFValue.parse(xref, lexer, true)
  if (value === undefined) {
    throw new Error('Empty object')
  }

  lexer.skipWhitespace(null, true)

  var obj = new PDFObject(id, generation)
  if (value instanceof PDFDictionary) {
    obj.properties = value

    if (lexer.getString(6) === 'stream') {
      lexer.shift(6)
      lexer.skipEOL(1)

      var length = obj.properties.get('Length')
      if (length === undefined) {
        throw new Error('Invalid Stream: no length specified')
      }

      if (typeof length === 'object') {
        var pos = lexer.pos
        length = length.object.content
        lexer.pos = pos
      }

      var stream = new PDFStream(obj)
      stream.content = lexer.read(length)
      lexer.skipEOL(1)

      if (lexer.readString(9) !== 'endstream') {
        throw new Error('Invalid stream: `endstream` not found')
      }

      lexer.skipEOL(1)
    }
  } else {
    obj.content = value
  }

  lexer.skipWhitespace(null, true)

  if (lexer.readString(3) !== 'end') {
    throw new Error('Invalid object: `end` not found')
  }

  return obj
}

},{"./dictionary":35,"./reference":45,"./stream":46,"./value":49}],43:[function(require,module,exports){
'use strict'

var PDFObject     = require('./object')
var PDFStream     = require('./stream')
var PDFDictionary = require('./dictionary')
var PDFArray      = require('./array')
var PDFName       = require('./name')

var utils = require('../utils')

var Page = module.exports = function(parent) {
  PDFObject.call(this, 'Page')

  this.contents = new PDFStream(new PDFObject)
  this.fonts    = new PDFDictionary({})
  this.xobjects = new PDFDictionary({})

  this.prop('Parent', parent.toReference())
  this.prop('Contents', this.contents.toReference())
  this.prop('Resources', new PDFDictionary({
    ProcSet: new PDFArray([
      new PDFName('PDF'),
      new PDFName('Text'),
      new PDFName('ImageB'),
      new PDFName('ImageC'),
      new PDFName('ImageI')
    ]),
    Font:    this.fonts,
    XObject: this.xobjects
  }))
}

utils.inherits(Page, PDFObject)

Page.prototype.embed = function(doc) {
  doc.addObject(this)
  doc.addObject(this.contents.object)
}

},{"../utils":54,"./array":33,"./dictionary":35,"./name":39,"./object":42,"./stream":46}],44:[function(require,module,exports){
'use strict'

var PDFObject = require('./object')
var PDFArray  = require('./array')

var Pages = module.exports = function(width, height) {
  PDFObject.call(this, 'Pages')

  this.pages = []
  this.kids  = new PDFArray()

  this.prop('MediaBox', new PDFArray([
    0, 0,
    width,
    height
  ]))
  this.prop('Kids',  this.kids)
  this.prop('Count', this.kids.length)
}

require('../utils').inherits(Pages, PDFObject)


Pages.prototype.add = function(page) {
  this.pages.push(page)
  this.kids.push(page.toReference())
  this.prop('Count', this.kids.length)
}

Pages.prototype.embed = function(doc) {
  doc.addObject(this)
  this.pages.forEach(function(page) {
    page.embed(doc)
  })
}

},{"../utils":54,"./array":33,"./object":42}],45:[function(require,module,exports){
var PDFReference = module.exports = function(object) {
  this._object = object
}

Object.defineProperty(PDFReference.prototype, 'object', {
  enumerable: true,
  get: function() {
    if (!this._object) {
      return undefined
    }

    if (typeof this._object === 'function') {
      this._object = this._object()
    }

    return this._object
  }
})

PDFReference.prototype.toString = function() {
  return this.object.id + ' ' + this.object.rev + ' R'
}

PDFReference.parse = function(xref, lexer, trial) {
  var before = lexer.pos

  var id = lexer.readNumber(trial)
  if (id === undefined && !trial) {
    throw new Error('Invalid indirect')
  }

  lexer.skipSpace(1, trial)
  var generation = lexer.readNumber(trial)
  if (generation === undefined && !trial) {
    throw new Error('Invalid indirect')
  }

  lexer.skipSpace(1, trial)
  if (lexer.getString(1) !== 'R') {
    if (trial) {
      lexer.pos = before
      return undefined
    }

    throw new Error('Invalid indirect')
  }

  lexer.shift(1)

  return new PDFReference(parseObject.bind(null, xref, lexer, id))
}

function parseObject(xref, lexer, id) {
  var obj = xref.get(id)
  if (obj) {
    return obj
  }

  var offset = xref.getOffset(id)
  lexer.pos = offset

  var PDFObject = require('./object')
  return PDFObject.parse(xref, lexer)
}

},{"./object":42}],46:[function(require,module,exports){
// page 60
// Filters: page 65

var utils = require('../utils')

var PDFStream = module.exports = function(object) {
  object.content = this
  this.object    = object
  this.content   = ''
}

PDFStream.prototype.slice = function(begin, end) {
  this.content = this.content.slice(begin, end)
  this.object.prop('Length', this.content.length - 1)
}

PDFStream.prototype.writeLine = function(str) {
  this.content += str + '\n'
  this.object.prop('Length', this.content.length - 1)
}

PDFStream.prototype.toReference = function() {
  return this.object.toReference()
}

PDFStream.prototype.toString = function() {
  var content = this.content
  if (content instanceof Uint8Array) {
    content = utils.uint8ToString(content) + '\n'
  }

  return 'stream\n' + content + 'endstream'
}

},{"../utils":54}],47:[function(require,module,exports){
var PDFString = module.exports = function(str) {
  this.str = str
}

PDFString.prototype.toLiteralString = function() {
  return '(' + this.str.replace(/\\/g, '\\\\')
                       .replace(/\(/g, '\\(')
                       .replace(/\)/g, '\\)') + ')'
}

PDFString.prototype.toHexString = function() {
  var self = this
  return '<' + ((function() {
    var results = []
    for (var i = 0, len = self.str.length; i < len; ++i) {
      var hex = (self.str.charCodeAt(i) - 31).toString(16)
      results.push(('0000' + hex).slice(-4))
    }
    return results
  })()).join('') + '>'
}

PDFString.prototype.toString = function() {
  return this.toLiteralString()
}

PDFString.parse = function(xref, lexer, trial) {
  var literal = PDFString.parseLiteral(lexer, trial)
  var hex = literal === undefined && PDFString.parseHex(lexer, trial)

  if (!literal && !hex) {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid string')
  }

  return literal || hex
}

PDFString.parseLiteral = function(lexer, trial) {
  if (lexer.getString(1) !== '(') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid literal string')
  }

  lexer.shift(1)

  var str = ''

  var done = false
  var open = 0
  var c
  while (!done && (c = lexer._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x28: // (
        open++
        str += String.fromCharCode('(')
        break
      case c === 0x29: // )
        if (open === 0) {
          done = true
        } else {
          open--
          str += String.fromCharCode(')')
        }
        break
      case c === 0x5c: // \
        c = lexer._nextCharCode()
        switch (c) {
          case 0x6e: // \n
            str += '\n'
            break
          case 0x72: // \r
            str += '\r'
            break
          case 0x74: // \t
            str += '\t'
            break
          case 0x62: // \b
            str += '\b'
            break
          case 0x66: // \f
            str += '\f'
            break
          case 0x28: // '('
          case 0x29: // ')'
          case 0x5c: // '\'
            str += String.fromCharCode(c)
            break
          default:
            var hex = lexer.readString(3)
            str += String.fromCharCode(parseInt(hex, 16))
            break
        }
        break
      case 0x0d: // CR
      case 0x0a: // LF
        lexer.skipEOL(1)
        break
      default:
        str += String.fromCharCode(c)
        break
    }
  }

  return new PDFString(str)
}

PDFString.parseHex = function(lexer, trial) {
  if (lexer.getString(1) !== '<') {
    if (trial) {
      return undefined
    }

    throw new Error('Invalid hex string')
  }

  lexer.shift(1)

  var str = ''

  var done = false
  var digits = []
  var addCharacter = function(force) {
    if (digits.length !== 2) {
      if (digits.length === 1 && force) {
        digits.push('0')
      } else {
        return
      }
    }

    str += String.fromCharCode(parseInt(digits.join(''), 16))
    digits.length = 0
  }

  var c
  while (!done && (c = lexer._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x3e: // >
        done = true
        break
      case c >= 0x30 && c <= 0x39: // 0 - 9
      case c >= 0x41 && c <= 0x5a: // A - B
      case c >= 0x61 && c <= 0x7a: // a - b
        digits.push(String.fromCharCode(c))
        addCharacter()
        break
      case lexer.isWhiteSpace(c):
        break
      default:
        lexer._warning('invalid character `' + String.fromCharCode(c) + '` in hex string')
        break
    }
  }

  addCharacter(true)

  return new PDFString(str)
}

},{}],48:[function(require,module,exports){
var PDFDictionary = require('./dictionary')
var PDFArray      = require('./array')
var PDFString     = require('./string')
var utils         = require('../utils')

var PDFTrailer = module.exports = function(size, root, info) {
  PDFDictionary.call(this)

  this.set('Size', size)
  this.set('Root', root && root.toReference())

  var id = (new PDFString(info.id)).toHexString()
  this.set('ID', new PDFArray([id, id]))

  this.set('Info', new PDFDictionary({
    Producer: new PDFString(info.producer),
    CreationDate: new PDFString(utils.formatDate(info.creationDate || new Date))
  }))
}

PDFTrailer.prototype = Object.create(PDFDictionary.prototype, {
  constructor: { value: PDFTrailer }
})

PDFTrailer.prototype.toString = function() {
  return 'trailer\n' + PDFDictionary.prototype.toString.call(this)
}

PDFTrailer.parse = function(xref, lexer) {
  lexer.skipWhitespace(null, true)

  if (lexer.readString(7) !== 'trailer') {
    throw new Error('Invalid trailer: trailer expected but not found')
  }

  lexer.skipWhitespace(null, true)

  var dict = PDFDictionary.parse(xref, lexer)
  return dict
}

},{"../utils":54,"./array":33,"./dictionary":35,"./string":47}],49:[function(require,module,exports){
var Objects = []

exports.parse = function(xref, lexer) {
  // lazy load, cause circular referecnes
  if (!Objects.length) {
    Objects.push.apply(Objects, [
      require('./boolean'),
      require('./null'),
      require('./name'),
      require('./dictionary'), // must be tried before string!
      require('./string'),
      require('./array'),
      require('./reference'), // must be tried before number!
      require('./number')
    ])
  }

  // try
  for (var i = 0; i < Objects.length; ++i) {
    var value = Objects[i].parse(xref, lexer, true)
    if (value !== undefined) {
      return value
    }
  }

  lexer._error('Invalid value')
  return undefined
}

},{"./array":33,"./boolean":34,"./dictionary":35,"./name":39,"./null":40,"./number":41,"./reference":45,"./string":47}],50:[function(require,module,exports){
var PDFObject = require('./object')
var PDFStream = require('./stream')

var PDFXObject = module.exports = function(id, rev) {
  PDFObject.call(this, id, rev)

  this.content = new PDFStream(this)

  this.prop('Type', 'XObject')
  this.prop('Filter', 'ASCIIHexDecode')
}

PDFXObject.prototype = Object.create(PDFObject.prototype, {
  constructor: { value: PDFXObject }
})

},{"./object":42,"./stream":46}],51:[function(require,module,exports){
var PDFXref = module.exports = function() {
  this.objects = []
}

PDFXref.prototype.add = function(id, offset, obj) {
  this.objects[id] = {
    offset: offset,
    obj:    obj
  }
}

PDFXref.prototype.get = function(id) {
  return this.objects[id] && this.objects[id].obj
}

PDFXref.prototype.getOffset = function(id) {
  return this.objects[id] && this.objects[id].offset
}

PDFXref.prototype.toString = function() {
  var xref = 'xref\n'

  var range  = { from: 0, refs: [0] }
  var ranges = [range]

  for (var i = 1; i < this.objects.length; ++i) {
    var obj = this.objects[i]
    if (!obj) {
      if (range) {
        range = null
      }
      continue
    }

    if (!range) {
      range = { from: i, refs: [] }
      ranges.push(range)
    }

    range.refs.push(obj.offset)
  }

  ranges.forEach(function(range) {
    xref += range.from + ' ' + range.refs.length + '\n'

    range.refs.forEach(function(ref, i) {
      if (range.from === 0 && i === 0) {
        xref += '0000000000 65535 f \n'
      } else {
        xref += '0000000000'.substr(ref.toString().length) + ref + ' 00000 n \n'
      }
    })
  })

  return xref
}

PDFXref.parse = function(_, lexer) {
  var xref = new PDFXref

  if (lexer.readString(4) !== 'xref') {
    throw new Error('Invalid xref: xref expected but not found')
  }

  lexer.skipEOL(1)

  var start
  while ((start = lexer.readNumber(true)) !== undefined) {
    lexer.skipSpace(1)
    var count = lexer.readNumber()
    lexer.skipEOL(1)

    for (var i = 0, len = 0 + count; i < len; ++i) {
      var offset = lexer.readNumber()
      lexer.skipSpace(1)
      lexer.readNumber() // generation
      lexer.skipSpace(1)
      var key = lexer.readString(1)
      lexer.skipSpace(null, true)
      lexer.skipEOL(1)

      var id = start + i
      if (id > 0 && key === 'n') {
        xref.add(id, offset, null)
      }
    }
  }

  return xref
}

},{}],52:[function(require,module,exports){
'use strict'

var utils = require('../utils')
var Lexer = require('./lexer')

var PDFXref    = require('../object/xref')
var PDFTrailer = require('../object/trailer')

var Document = module.exports = function(src) {
  this.src = new Uint8Array(utils.toArrayBuffer(src))
}

Document.prototype.parse = function() {
  var index = lastIndexOf(this.src, 'startxref', 128)
  if (index === -1) {
    throw new Error('Invalid PDF: startxref not found')
  }

  index += 'startxref'.length

  // skip whitespaces
  while (Lexer.isWhiteSpace(this.src[++index])) {
  }

  var str = ''
  while (this.src[index] >= 0x30 && this.src[index] <= 0x39) { // between 0 and 9
    str +=  String.fromCharCode(this.src[index++])
  }

  var startXRef = parseInt(str, 10)

  if (isNaN(startXRef)) {
    throw new Error('Invalid PDF: startxref is not a number')
  }

  var lexer = new Lexer(this.src)
  lexer.shift(startXRef)

  this.xref    = PDFXref.parse(null, lexer)
  this.trailer = PDFTrailer.parse(this.xref, lexer)

  var trailer = this.trailer
  while (trailer.has('Prev')) {
    lexer.pos = trailer.get('Prev')
    var xref = PDFXref.parse(null, lexer)

    for (var i = 0; i < xref.objects.length; ++i) {
      var obj = xref.objects[i]
      if (obj && !this.xref.objects[i]) {
        this.xref.objects[i] = obj
      }
    }

    trailer = PDFTrailer.parse(xref, lexer)
  }
}

function lastIndexOf(src, key, step) {
  if (!step) step = 1024
  var pos = src.length, index = -1

  while (index === -1 && pos > 0) {
    pos -= step - key.length
    index = find(src, key, Math.max(pos, 0), step, true)
  }

  return index
}

function find(src, key, pos, limit, backwards) {
  if (pos + limit > src.length) {
    limit = src.length - pos
  }

  var str = String.fromCharCode.apply(null, src.subarray(pos, pos + limit))
  var index = backwards ? str.lastIndexOf(key) : str.indexOf(key)
  if (index > -1) {
    index += pos
  }
  return index
}

},{"../object/trailer":48,"../object/xref":51,"../utils":54,"./lexer":53}],53:[function(require,module,exports){
var Lexer = module.exports = function(buf) {
  this.buf = buf
  this.pos = 0
  this.objects = Object.create(null)
}

Lexer.prototype.read = function(len) {
  var buf = this.buf.subarray(this.pos, this.pos + len)
  this.pos += len
  return buf
}

Lexer.prototype.getString = function(len) {
  return String.fromCharCode.apply(null, this.buf.subarray(this.pos, this.pos + len))
}

Lexer.prototype.readString = function(len) {
  var str = this.getString(len)
  this.pos += len
  return str
}

Lexer.prototype.skipEOL = function(len, trial) {
  var before = this.pos

  var done  = false
  var count = 0
  while (!done && (!len || count < len)) {
    switch (this.buf[this.pos]) {
      case 0x0d: // CR
        if (this.buf[this.pos + 1] === 0x0a) { // CR LF
          this.pos++
        }
        // falls through
      case 0x0a: // LF
        this.pos++
        count++
        break
      default:
        done = true
        break
    }
  }

  if (!count || (len && count < len)) {
    if (!trial) {
      this._error('EOL expected but not found')
    }
    this.pos = before
    return false
  }

  return true
}

Lexer.prototype.skipWhitespace = function(len, trial) {
  var before = this.pos

  var done  = false
  var count = 0
  while (!done && (!len || count < len)) {
    if (Lexer.isWhiteSpace(this.buf[this.pos])) {
      this.pos++
      count++
    } else {
      done = true
    }
  }

  if (!count || (len && count < len)) {
    if (!trial) {
      this._error('Whitespace expected but not found')
    }
    this.pos = before
    return false
  }

  return true
}

Lexer.prototype.skipSpace = function(len, trial) {
  var before = this.pos

  var done  = false
  var count = 0
  while (!done && (!len || count < len)) {
    if (this.buf[this.pos] === 0x20) {
      this.pos++
      count++
    } else {
      done = true
    }
  }

  if (!count || (len && count < len)) {
    if (!trial) {
      this._error('Space expected but not found')
    }
    this.pos = before
    return false
  }

  return true
}

Lexer.prototype.shift = function(offset) {
  this.pos += offset
}

Lexer.prototype._nextCharCode = function() {
  return this.buf[this.pos++]
}

Lexer.prototype._nextChar = function() {
  return String.fromCharCode(this.buf[this.pos++])
}

Lexer.prototype._error = function(err) {
  throw new Error(err)
}

Lexer.prototype._warning = function(warning) {
  console.warn(warning)
}

// e.g. 123 43445 +17 −98 0 34.5 −3.62 +123.6 4. −.002 0.0
Lexer.prototype.readNumber = function(trial) {
  var before = this.pos

  var c = this._nextCharCode()
  var sign = 1
  var isFloat = false
  var str = ''

  switch (true) {
    case c === 0x2b: // '+'
      break
    case c === 0x2d: // '-'
      sign = -1
      break
    case c === 0x2e: // '.'
      isFloat = true
      str = '0.'
      break
    case c < 0x30 || c > 0x39: // not a number
      if (!trial) {
        this._error('Invalid number: ' + String.fromCharCode(c))
      }
      this.pos = before
      return undefined
    default:
      str += String.fromCharCode(c)
      break
  }

  var done = false
  while (!done && (c = this._nextCharCode()) >= 0) {
    switch (true) {
      case c === 0x2e: // '.'
        if (isFloat) {
          done = true
        } else {
          isFloat = true
          str += '.'
        }
        break
      case c >= 0x30 && c <= 0x39: // 0 - 9
        str += String.fromCharCode(c)
        break
      default:
        done = true
        break
    }
  }

  this.pos--

  var nr = isFloat ? parseFloat(str, 10) : parseInt(str, 10)
  return nr * sign
}

Lexer.prototype.readDictionary = function() {

}

Lexer.isWhiteSpace = Lexer.prototype.isWhiteSpace = function(c) {
  return (
    c === 0x00 || // NULL
    c === 0x09 || // TAB
    c === 0x0A || // LF
    c === 0x0C || // FF
    c === 0x0D || // CR
    c === 0x20    // SP
  )
}

},{}],54:[function(require,module,exports){
// exports.extend = function(destination, source) {
//   for (var prop in source) {
//     if (prop in destination) continue
//     destination[prop] = source[prop]
//   }
//   return destination
// }

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false }
  })
}

// exports.round = function(num) {
//   return Math.round(num * 100) / 100
// }

exports.toHex = function(n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

exports.asHex = function(ab) {
  var view = new Uint8Array(ab), hex = ''
  for (var i = 0, len = ab.byteLength; i < len; ++i) {
    hex += exports.toHex(view[i])
  }
  return hex
}

exports.toArrayBuffer = function(buf) {
  // GLOBAL[('Buffer').toString()] is used instead of Buffer to trick browserify
  // to not load a Buffer polyfill just for instance testing. The `toString()` part
  // is used to trick eslint to not throw
  var isArrayBuffer = buf instanceof ArrayBuffer
  var isBuffer = typeof GLOBAL !== 'undefined' && buf instanceof GLOBAL[('Buffer').toString()]
  if (!isArrayBuffer && !isBuffer) {
    throw new TypeError('Data must be provided as either Buffer or Arraybuffer.')
  }

  if (buf instanceof ArrayBuffer) {
    return buf
  }

  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i]
  }
  return ab
}

// source: http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
exports.uint8ToString = function(u8a) {
  var CHUNK_SZ = 0x8000
  var c = []
  for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)))
  }
  return c.join('')
}

exports.formatDate = function(date) {
  var str = 'D:'
          + date.getFullYear()
          + ('00' + (date.getMonth() + 1)).slice(-2)
          + ('00' + date.getDate()).slice(-2)
          + ('00' + date.getHours()).slice(-2)
          + ('00' + date.getMinutes()).slice(-2)
          + ('00' + date.getSeconds()).slice(-2)

  var offset = date.getTimezoneOffset()
  var rel = offset === 0 ? 'Z' : (offset > 0 ? '-' : '+')
  offset = Math.abs(offset)
  var hoursOffset = Math.floor(offset / 60)
  var minutesOffset = offset - hoursOffset * 60

  str += rel
      + ('00' + hoursOffset).slice(-2)   + '\''
      + ('00' + minutesOffset).slice(-2) + '\''

  return str
}

// exports.fixedFloat = function(n) {
//  return parseFloat(n.toFixed(2))
// }

exports.colorToRgb = function(hex) {
  if (typeof hex === 'string') {
    hex = parseInt(hex.replace('#', ''), 16)
  }

  var r = (hex >> 16) / 255
  var g = ((hex >> 8) & 255) / 255
  var b = (hex & 255) / 255

  return [r, g, b]
}

exports.resolveWidth = function(width, maxWidth) {
  if (!width) {
    return maxWidth
  }

  var isRelative = !!~width.toString().indexOf('%')
  width = parseFloat(width)
  if (isRelative) {
    if (width >= 100) return maxWidth
    return (width / 100) * maxWidth
  } else {
    if (width > maxWidth) return maxWidth
    else return width
  }
}

},{}],55:[function(require,module,exports){
'use strict'

var BaseStyle = module.exports = function() {
  var args = Array.prototype.slice.call(arguments)
  if (args.length) {
    args.forEach(function(values) {
      for (var key in values) {
        if (key in this) {
          this[key] = values[key]
        }
      }
    }, this)
  }

  Object.freeze(this)
}

BaseStyle.prototype.merge = function() {
  var changed = false

  var args = Array.prototype.slice.call(arguments)
  if (args.length) {
    args.forEach(function(values) {
      for (var key in values) {
        if (key in this && this[key] !== values[key]) {
          changed = true
          break
        }
      }
    }, this)
  }

  if (changed) {
    var constructor = this.constructor
    var F = function(a) {
      return constructor.apply(this, a)
    }
    F.prototype = constructor.prototype

    return new F([this].concat(args))
  } else {
    return this
  }
}

},{}],56:[function(require,module,exports){
'use strict'

var BoxStyle = module.exports = function() {
  this.backgroundColor = null

  var sides = ['Top', 'Right', 'Bottom', 'Left']

  this.borderWidth = 0
  sides.forEach(function(side) {
    var value = null
    Object.defineProperty(this, 'border' + side + 'Width', {
      enumerable: true,
      get: function() { return Math.max(0, value != null ? value : this.borderWidth || 0) },
      set: function(val) { value = val }
    })
  }, this)

  this.borderColor = 0x000000
  sides.forEach(function(side) {
    var value = null
    Object.defineProperty(this, 'border' + side + 'Color', {
      enumerable: true,
      get: function() { return value != null ? value : this.borderColor || 0x000000 },
      set: function(val) { value = val }
    })
  }, this)

  BoxStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(BoxStyle, require('./container'))

},{"../pdf/utils":54,"./container":57}],57:[function(require,module,exports){
'use strict'

var ContainerStyle = module.exports = function(values) {
  this.padding = 20

  var sides = ['Top', 'Right', 'Bottom', 'Left']
  sides.forEach(function(side) {
    var value = null
    Object.defineProperty(this, 'padding' + side, {
      enumerable: true,
      get: function() { return Math.max(0, value || this.padding || 0) },
      set: function(val) { value = val }
    })
  }, this)

  this.width  = this.minWidth  = this.maxWidth  = null
  this.height = this.minHeight = this.maxHeight = null

  ContainerStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(ContainerStyle, require('./text'))

ContainerStyle.paddingReset = {
  padding: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0
}

Object.defineProperties(ContainerStyle.prototype, {
  innerHeight: {
    enumerable: true,
    get: function() {
      return this.height - this.paddingTop - this.paddingBottom
    },
    set: function() {}
  },
  innerWidth: {
    enumerable: true,
    get: function() {
      return this.width - this.paddingLeft - this.paddingRight
    },
    set: function() {}
  }
})

},{"../pdf/utils":54,"./text":61}],58:[function(require,module,exports){
'use strict'

var DocumentStyle = module.exports = function(values) {
  this.precision = 3
  this.threshold = 64

  DocumentStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(DocumentStyle, require('./container'))

},{"../pdf/utils":54,"./container":57}],59:[function(require,module,exports){
'use strict'

var ImageStyle = module.exports = function() {
  this.width = null
  this.height = null
  this.align = 'left'
  this.x = null
  this.y = null
  this.wrap = true

  ImageStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(ImageStyle, require('./base'))

},{"../pdf/utils":54,"./base":55}],60:[function(require,module,exports){
'use strict'

var TableStyle = module.exports = function() {
  this.tableLayout = 'fixed'
  this.widths = []
  this.colspan = 1
  this.headerRows = 0
  this.backgroundColor = null
  this.borderWidth = 0
  this.borderColor = 0x000000

  var directions = ['Vertical', 'Horizontal']

  directions.forEach(function(direction) {
    var value = null
    Object.defineProperty(this, 'border' + direction + 'Width', {
      enumerable: true,
      get: function() { return Math.max(0, value != null ? value : this.borderWidth || 0) },
      set: function(val) { value = val }
    })
  }, this)

  directions.forEach(function(direction) {
    var value = null
    Object.defineProperty(this, 'border' + direction + 'Color', {
      enumerable: true,
      get: function() { return value != null ? value : this.borderColor || 0x000000 },
      set: function(val) { value = val }
    })
  }, this)

  var sides = ['Top', 'Right', 'Bottom', 'Left']

  sides.forEach(function(side) {
    var value = null
    var direction = side === 'Right' || side === 'Left' ? 'Vertical' : 'Horizontal'
    var directionProperty = 'border' + direction + 'Width'
    Object.defineProperty(this, 'border' + side + 'Width', {
      enumerable: true,
      get: function() { return Math.max(0, value !== null ? value : this[directionProperty] || this.borderWidth || 0) },
      set: function(val) { value = val }
    })
  }, this)

  sides.forEach(function(side) {
    var value = null
    var direction = side === 'Right' || side === 'Left' ? 'Vertical' : 'Horizontal'
    var directionProperty = 'border' + direction + 'Color'
    Object.defineProperty(this, 'border' + side + 'Color', {
      enumerable: true,
      get: function() { return value != null ? value : this[directionProperty] || this.borderColor || 0x000000 },
      set: function(val) { value = val }
    })
  }, this)

  TableStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(TableStyle, require('./container'))

TableStyle.reset = {
  colspan: 1
}

},{"../pdf/utils":54,"./container":57}],61:[function(require,module,exports){
'use strict'

var TextStyle = module.exports = function() {
  this.font       = null
  this.color      = 0x000000
  this.textAlign  = 'left'
  this.fontSize   = 11
  this.lineHeight = 1
  this.whiteSpace = 'normal'

  TextStyle.super_.apply(this, arguments)
}

require('../pdf/utils').inherits(TextStyle, require('./base'))

},{"../pdf/utils":54,"./base":55}],62:[function(require,module,exports){
(function (global){
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],63:[function(require,module,exports){

},{}],64:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  if (length > 0 && length <= Buffer.poolSize)
    buf.parent = rootParent

  return buf
}

function SlowBuffer(subject, encoding, noZero) {
  if (!(this instanceof SlowBuffer))
    return new SlowBuffer(subject, encoding, noZero)

  var buf = new Buffer(subject, encoding, noZero)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0

  if (length < 0 || offset < 0 || offset > this.length)
    throw new RangeError('attempt to write outside buffer bounds');

  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length)
    newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100))
    val += this[offset + i] * mul

  return val
}

Buffer.prototype.readUIntBE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100))
    val += this[offset + --byteLength] * mul;

  return val
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100))
    val += this[offset + i] * mul
  mul *= 0x80

  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100))
    val += this[offset + --i] * mul
  mul *= 0x80

  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100))
    this[offset + i] = (value / mul) >>> 0 & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100))
    this[offset + i] = (value / mul) >>> 0 & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeIntLE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(this,
             value,
             offset,
             byteLength,
             Math.pow(2, 8 * byteLength - 1) - 1,
             -Math.pow(2, 8 * byteLength - 1))
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100))
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(this,
             value,
             offset,
             byteLength,
             Math.pow(2, 8 * byteLength - 1) - 1,
             -Math.pow(2, 8 * byteLength - 1))
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100))
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (target_start >= target.length) target_start = target.length
  if (!target_start) target_start = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || source.length === 0) return 0

  // Fatal error conditions
  if (target_start < 0)
    throw new RangeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes(string, units) {
  var codePoint, length = string.length
  var leadSurrogate = null
  units = units || Infinity
  var bytes = []
  var i = 0

  for (; i<length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {

      // last char was a lead
      if (leadSurrogate) {

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        }

        // valid surrogate pair
        else {
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      }

      // no lead yet
      else {

        // unexpected trail
        if (codePoint > 0xDBFF) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // unpaired lead
        else if (i + 1 === length) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        else {
          leadSurrogate = codePoint
          continue
        }
      }
    }

    // valid bmp char, but last char was a lead
    else if (leadSurrogate) {
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    }
    else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    }
    else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    }
    else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    }
    else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {

    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":65,"ieee754":66,"is-array":67}],65:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],66:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],67:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],68:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = window.localStorage;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":69}],69:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":70}],70:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],71:[function(require,module,exports){
(function (Buffer){
// Generated by CoffeeScript 1.7.1
var UnicodeTrie, pako;

pako = require('pako/lib/inflate');

UnicodeTrie = (function() {
  var DATA_BLOCK_LENGTH, DATA_GRANULARITY, DATA_MASK, INDEX_1_OFFSET, INDEX_2_BLOCK_LENGTH, INDEX_2_BMP_LENGTH, INDEX_2_MASK, INDEX_SHIFT, LSCP_INDEX_2_LENGTH, LSCP_INDEX_2_OFFSET, OMITTED_BMP_INDEX_1_LENGTH, SHIFT_1, SHIFT_1_2, SHIFT_2, UTF8_2B_INDEX_2_LENGTH, UTF8_2B_INDEX_2_OFFSET;

  SHIFT_1 = 6 + 5;

  SHIFT_2 = 5;

  SHIFT_1_2 = SHIFT_1 - SHIFT_2;

  OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> SHIFT_1;

  INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;

  INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;

  INDEX_SHIFT = 2;

  DATA_BLOCK_LENGTH = 1 << SHIFT_2;

  DATA_MASK = DATA_BLOCK_LENGTH - 1;

  LSCP_INDEX_2_OFFSET = 0x10000 >> SHIFT_2;

  LSCP_INDEX_2_LENGTH = 0x400 >> SHIFT_2;

  INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;

  UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;

  UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6;

  INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;

  DATA_GRANULARITY = 1 << INDEX_SHIFT;

  function UnicodeTrie(data) {
    var length;
    if (Buffer.isBuffer(data)) {
      this.highStart = data.readUInt32BE(0);
      this.errorValue = data.readUInt32BE(4);
      length = data.readUInt32BE(8);
      data = data.slice(12);
      data = pako.inflateRaw(data);
      data = pako.inflateRaw(data);
      this.data = new Uint32Array(data.buffer);
    } else {
      this.data = data.data, this.highStart = data.highStart, this.errorValue = data.errorValue;
    }
  }

  UnicodeTrie.prototype.get = function(codePoint) {
    var index;
    if (codePoint < 0 || codePoint > 0x10ffff) {
      return this.errorValue;
    }
    if (codePoint < 0xd800 || (codePoint > 0xdbff && codePoint <= 0xffff)) {
      index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint <= 0xffff) {
      index = (this.data[LSCP_INDEX_2_OFFSET + ((codePoint - 0xd800) >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint < this.highStart) {
      index = this.data[(INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH) + (codePoint >> SHIFT_1)];
      index = this.data[index + ((codePoint >> SHIFT_2) & INDEX_2_MASK)];
      index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    return this.data[this.data.length - DATA_GRANULARITY];
  };

  return UnicodeTrie;

})();

module.exports = UnicodeTrie;

}).call(this,require("buffer").Buffer)
},{"buffer":64,"pako/lib/inflate":72}],72:[function(require,module,exports){
'use strict';


var zlib_inflate = require('./zlib/inflate.js');
var utils = require('./utils/common');
var strings = require('./utils/strings');
var c = require('./zlib/constants');
var msg = require('./zlib/messages');
var zstream = require('./zlib/zstream');
var gzheader = require('./zlib/gzheader');


/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overriden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
var Inflate = function(options) {

  this.options = utils.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  var status  = zlib_inflate.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== c.Z_OK) {
    throw new Error(msg[status]);
  }

  this.header = new gzheader();

  zlib_inflate.inflateGetHeader(this.strm, this.header);
};

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That flush internal pending buffers and call
 * [[Inflate#onEnd]].
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function(data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;
  var next_out_utf8, tail, utf8str;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */

    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && _mode === c.Z_FINISH)) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }
  } while ((strm.avail_in > 0) && status !== c.Z_STREAM_END);

  if (status === c.Z_STREAM_END) {
    _mode = c.Z_FINISH;
  }
  // Finalize on the last chunk.
  if (_mode === c.Z_FINISH) {
    status = zlib_inflate.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === c.Z_OK;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell inflate that input stream complete
 * or error happenned. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function(status) {
  // On success - join
  if (status === c.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 alligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip  = inflate;

},{"./utils/common":73,"./utils/strings":74,"./zlib/constants":76,"./zlib/gzheader":78,"./zlib/inflate.js":80,"./zlib/messages":82,"./zlib/zstream":83}],73:[function(require,module,exports){
'use strict';


var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');


exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof(source) !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (source.hasOwnProperty(p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs+len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for(var i=0; i<len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function(chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i=0, l=chunks.length; i<l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i=0, l=chunks.length; i<l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for(var i=0; i<len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function(chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);
},{}],74:[function(require,module,exports){
// String encode/decode helpers
'use strict';


var utils = require('./common');


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safary
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [0]); } catch(__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch(__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new utils.Buf8(256);
for (var i=0; i<256; i++) {
  _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
}
_utf8len[254]=_utf8len[254]=1; // Invalid sequence start


// convert string to array (typed, when possible)
exports.string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
      c2 = str.charCodeAt(m_pos+1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new utils.Buf8(buf_len);

  // convert
  for (i=0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
      c2 = str.charCodeAt(m_pos+1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // use fallback for big arrays to avoid stack overflow
  if (len < 65537) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for(var i=0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
exports.buf2binstring = function(buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
exports.binstring2buf = function(str) {
  var buf = new utils.Buf8(str.length);
  for(var i=0, len=buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
exports.buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len*2);

  for (out=0, i=0; i<len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len-1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
exports.utf8border = function(buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max-1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Fuckup - very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means vuffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

},{"./common":73}],75:[function(require,module,exports){
'use strict';

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It doesn't worth to make additional optimizationa as in original.
// Small size is preferable.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0
    , s2 = ((adler >>> 16) & 0xffff) |0
    , n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;
},{}],76:[function(require,module,exports){
module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
},{}],77:[function(require,module,exports){
'use strict';

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.


// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for(var n =0; n < 256; n++){
    c = n;
    for(var k =0; k < 8; k++){
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable
    , end = pos + len;

  crc = crc ^ (-1);

  for (var i = pos; i < end; i++ ) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;
},{}],78:[function(require,module,exports){
'use strict';


function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory 
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

module.exports = GZheader;
},{}],79:[function(require,module,exports){
'use strict';

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  var window;                 /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

},{}],80:[function(require,module,exports){
'use strict';


var utils = require('../utils/common');
var adler32 = require('./adler32');
var crc32   = require('./crc32');
var inflate_fast = require('./inffast');
var inflate_table = require('./inftrees');

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function ZSWAP32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, {bits: 9});

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, {bits: 5});

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window,src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window,src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window,src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
    case HEAD:
      if (state.wrap === 0) {
        state.mode = TYPEDO;
        break;
      }
      //=== NEEDBITS(16);
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
        state.check = 0/*crc32(0L, Z_NULL, 0)*/;
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//

        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = FLAGS;
        break;
      }
      state.flags = 0;           /* expect zlib header */
      if (state.head) {
        state.head.done = false;
      }
      if (!(state.wrap & 1) ||   /* check if zlib header allowed */
        (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
        strm.msg = 'incorrect header check';
        state.mode = BAD;
        break;
      }
      if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
      len = (hold & 0x0f)/*BITS(4)*/ + 8;
      if (state.wbits === 0) {
        state.wbits = len;
      }
      else if (len > state.wbits) {
        strm.msg = 'invalid window size';
        state.mode = BAD;
        break;
      }
      state.dmax = 1 << len;
      //Tracev((stderr, "inflate:   zlib header ok\n"));
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = hold & 0x200 ? DICTID : TYPE;
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      break;
    case FLAGS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.flags = hold;
      if ((state.flags & 0xff) !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      if (state.flags & 0xe000) {
        strm.msg = 'unknown header flags set';
        state.mode = BAD;
        break;
      }
      if (state.head) {
        state.head.text = ((hold >> 8) & 1);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = TIME;
      /* falls through */
    case TIME:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.time = hold;
      }
      if (state.flags & 0x0200) {
        //=== CRC4(state.check, hold)
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        hbuf[2] = (hold >>> 16) & 0xff;
        hbuf[3] = (hold >>> 24) & 0xff;
        state.check = crc32(state.check, hbuf, 4, 0);
        //===
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = OS;
      /* falls through */
    case OS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.xflags = (hold & 0xff);
        state.head.os = (hold >> 8);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = EXLEN;
      /* falls through */
    case EXLEN:
      if (state.flags & 0x0400) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length = hold;
        if (state.head) {
          state.head.extra_len = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      else if (state.head) {
        state.head.extra = null/*Z_NULL*/;
      }
      state.mode = EXTRA;
      /* falls through */
    case EXTRA:
      if (state.flags & 0x0400) {
        copy = state.length;
        if (copy > have) { copy = have; }
        if (copy) {
          if (state.head) {
            len = state.head.extra_len - state.length;
            if (!state.head.extra) {
              // Use untyped array for more conveniend processing later
              state.head.extra = new Array(state.head.extra_len);
            }
            utils.arraySet(
              state.head.extra,
              input,
              next,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              copy,
              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
              len
            );
            //zmemcpy(state.head.extra + len, next,
            //        len + copy > state.head.extra_max ?
            //        state.head.extra_max - len : copy);
          }
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          state.length -= copy;
        }
        if (state.length) { break inf_leave; }
      }
      state.length = 0;
      state.mode = NAME;
      /* falls through */
    case NAME:
      if (state.flags & 0x0800) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          // TODO: 2 or 1 bytes?
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.name_max*/)) {
            state.head.name += String.fromCharCode(len);
          }
        } while (len && copy < have);

        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.name = null;
      }
      state.length = 0;
      state.mode = COMMENT;
      /* falls through */
    case COMMENT:
      if (state.flags & 0x1000) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.comm_max*/)) {
            state.head.comment += String.fromCharCode(len);
          }
        } while (len && copy < have);
        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.comment = null;
      }
      state.mode = HCRC;
      /* falls through */
    case HCRC:
      if (state.flags & 0x0200) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.check & 0xffff)) {
          strm.msg = 'header crc mismatch';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      if (state.head) {
        state.head.hcrc = ((state.flags >> 9) & 1);
        state.head.done = true;
      }
      strm.adler = state.check = 0 /*crc32(0L, Z_NULL, 0)*/;
      state.mode = TYPE;
      break;
    case DICTID:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      strm.adler = state.check = ZSWAP32(hold);
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = DICT;
      /* falls through */
    case DICT:
      if (state.havedict === 0) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        return Z_NEED_DICT;
      }
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = TYPE;
      /* falls through */
    case TYPE:
      if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case TYPEDO:
      if (state.last) {
        //--- BYTEBITS() ---//
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        state.mode = CHECK;
        break;
      }
      //=== NEEDBITS(3); */
      while (bits < 3) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.last = (hold & 0x01)/*BITS(1)*/;
      //--- DROPBITS(1) ---//
      hold >>>= 1;
      bits -= 1;
      //---//

      switch ((hold & 0x03)/*BITS(2)*/) {
      case 0:                             /* stored block */
        //Tracev((stderr, "inflate:     stored block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = STORED;
        break;
      case 1:                             /* fixed block */
        fixedtables(state);
        //Tracev((stderr, "inflate:     fixed codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = LEN_;             /* decode codes */
        if (flush === Z_TREES) {
          //--- DROPBITS(2) ---//
          hold >>>= 2;
          bits -= 2;
          //---//
          break inf_leave;
        }
        break;
      case 2:                             /* dynamic block */
        //Tracev((stderr, "inflate:     dynamic codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = TABLE;
        break;
      case 3:
        strm.msg = 'invalid block type';
        state.mode = BAD;
      }
      //--- DROPBITS(2) ---//
      hold >>>= 2;
      bits -= 2;
      //---//
      break;
    case STORED:
      //--- BYTEBITS() ---// /* go to byte boundary */
      hold >>>= bits & 7;
      bits -= bits & 7;
      //---//
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
        strm.msg = 'invalid stored block lengths';
        state.mode = BAD;
        break;
      }
      state.length = hold & 0xffff;
      //Tracev((stderr, "inflate:       stored length %u\n",
      //        state.length));
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = COPY_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case COPY_:
      state.mode = COPY;
      /* falls through */
    case COPY:
      copy = state.length;
      if (copy) {
        if (copy > have) { copy = have; }
        if (copy > left) { copy = left; }
        if (copy === 0) { break inf_leave; }
        //--- zmemcpy(put, next, copy); ---
        utils.arraySet(output, input, next, copy, put);
        //---//
        have -= copy;
        next += copy;
        left -= copy;
        put += copy;
        state.length -= copy;
        break;
      }
      //Tracev((stderr, "inflate:       stored end\n"));
      state.mode = TYPE;
      break;
    case TABLE:
      //=== NEEDBITS(14); */
      while (bits < 14) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
//#ifndef PKZIP_BUG_WORKAROUND
      if (state.nlen > 286 || state.ndist > 30) {
        strm.msg = 'too many length or distance symbols';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracev((stderr, "inflate:       table sizes ok\n"));
      state.have = 0;
      state.mode = LENLENS;
      /* falls through */
    case LENLENS:
      while (state.have < state.ncode) {
        //=== NEEDBITS(3);
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
        //--- DROPBITS(3) ---//
        hold >>>= 3;
        bits -= 3;
        //---//
      }
      while (state.have < 19) {
        state.lens[order[state.have++]] = 0;
      }
      // We have separate tables & no pointers. 2 commented lines below not needed.
      //state.next = state.codes;
      //state.lencode = state.next;
      // Switch to use dynamic table
      state.lencode = state.lendyn;
      state.lenbits = 7;

      opts = {bits: state.lenbits};
      ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
      state.lenbits = opts.bits;

      if (ret) {
        strm.msg = 'invalid code lengths set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, "inflate:       code lengths ok\n"));
      state.have = 0;
      state.mode = CODELENS;
      /* falls through */
    case CODELENS:
      while (state.have < state.nlen + state.ndist) {
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_val < 16) {
          //--- DROPBITS(here.bits) ---//
          hold >>>= here_bits;
          bits -= here_bits;
          //---//
          state.lens[state.have++] = here_val;
        }
        else {
          if (here_val === 16) {
            //=== NEEDBITS(here.bits + 2);
            n = here_bits + 2;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            if (state.have === 0) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            len = state.lens[state.have - 1];
            copy = 3 + (hold & 0x03);//BITS(2);
            //--- DROPBITS(2) ---//
            hold >>>= 2;
            bits -= 2;
            //---//
          }
          else if (here_val === 17) {
            //=== NEEDBITS(here.bits + 3);
            n = here_bits + 3;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 3 + (hold & 0x07);//BITS(3);
            //--- DROPBITS(3) ---//
            hold >>>= 3;
            bits -= 3;
            //---//
          }
          else {
            //=== NEEDBITS(here.bits + 7);
            n = here_bits + 7;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 11 + (hold & 0x7f);//BITS(7);
            //--- DROPBITS(7) ---//
            hold >>>= 7;
            bits -= 7;
            //---//
          }
          if (state.have + copy > state.nlen + state.ndist) {
            strm.msg = 'invalid bit length repeat';
            state.mode = BAD;
            break;
          }
          while (copy--) {
            state.lens[state.have++] = len;
          }
        }
      }

      /* handle error breaks in while */
      if (state.mode === BAD) { break; }

      /* check for end-of-block code (better have one) */
      if (state.lens[256] === 0) {
        strm.msg = 'invalid code -- missing end-of-block';
        state.mode = BAD;
        break;
      }

      /* build code tables -- note: do not change the lenbits or distbits
         values here (9 and 6) without reading the comments in inftrees.h
         concerning the ENOUGH constants, which depend on those values */
      state.lenbits = 9;

      opts = {bits: state.lenbits};
      ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.lenbits = opts.bits;
      // state.lencode = state.next;

      if (ret) {
        strm.msg = 'invalid literal/lengths set';
        state.mode = BAD;
        break;
      }

      state.distbits = 6;
      //state.distcode.copy(state.codes);
      // Switch to use dynamic table
      state.distcode = state.distdyn;
      opts = {bits: state.distbits};
      ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.distbits = opts.bits;
      // state.distcode = state.next;

      if (ret) {
        strm.msg = 'invalid distances set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, 'inflate:       codes ok\n'));
      state.mode = LEN_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case LEN_:
      state.mode = LEN;
      /* falls through */
    case LEN:
      if (have >= 6 && left >= 258) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        inflate_fast(strm, _out);
        //--- LOAD() ---
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        //---

        if (state.mode === TYPE) {
          state.back = -1;
        }
        break;
      }
      state.back = 0;
      for (;;) {
        here = state.lencode[hold & ((1 << state.lenbits) -1)];  /*BITS(state.lenbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if (here_bits <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if (here_op && (here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.lencode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) -1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      state.length = here_val;
      if (here_op === 0) {
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        state.mode = LIT;
        break;
      }
      if (here_op & 32) {
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.back = -1;
        state.mode = TYPE;
        break;
      }
      if (here_op & 64) {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break;
      }
      state.extra = here_op & 15;
      state.mode = LENEXT;
      /* falls through */
    case LENEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length += hold & ((1 << state.extra) -1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
      //Tracevv((stderr, "inflate:         length %u\n", state.length));
      state.was = state.length;
      state.mode = DIST;
      /* falls through */
    case DIST:
      for (;;) {
        here = state.distcode[hold & ((1 << state.distbits) -1)];/*BITS(state.distbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if ((here_bits) <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if ((here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.distcode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) -1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      if (here_op & 64) {
        strm.msg = 'invalid distance code';
        state.mode = BAD;
        break;
      }
      state.offset = here_val;
      state.extra = (here_op) & 15;
      state.mode = DISTEXT;
      /* falls through */
    case DISTEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.offset += hold & ((1 << state.extra) -1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
//#ifdef INFLATE_STRICT
      if (state.offset > state.dmax) {
        strm.msg = 'invalid distance too far back';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
      state.mode = MATCH;
      /* falls through */
    case MATCH:
      if (left === 0) { break inf_leave; }
      copy = _out - left;
      if (state.offset > copy) {         /* copy from window */
        copy = state.offset - copy;
        if (copy > state.whave) {
          if (state.sane) {
            strm.msg = 'invalid distance too far back';
            state.mode = BAD;
            break;
          }
// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
        }
        if (copy > state.wnext) {
          copy -= state.wnext;
          from = state.wsize - copy;
        }
        else {
          from = state.wnext - copy;
        }
        if (copy > state.length) { copy = state.length; }
        from_source = state.window;
      }
      else {                              /* copy from output */
        from_source = output;
        from = put - state.offset;
        copy = state.length;
      }
      if (copy > left) { copy = left; }
      left -= copy;
      state.length -= copy;
      do {
        output[put++] = from_source[from++];
      } while (--copy);
      if (state.length === 0) { state.mode = LEN; }
      break;
    case LIT:
      if (left === 0) { break inf_leave; }
      output[put++] = state.length;
      left--;
      state.mode = LEN;
      break;
    case CHECK:
      if (state.wrap) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          // Use '|' insdead of '+' to make sure that result is signed
          hold |= input[next++] << bits;
          bits += 8;
        }
        //===//
        _out -= left;
        strm.total_out += _out;
        state.total += _out;
        if (_out) {
          strm.adler = state.check =
              /*UPDATE(state.check, put - _out, _out);*/
              (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

        }
        _out = left;
        // NB: crc32 stored as signed 32-bit int, ZSWAP32 returns signed too
        if ((state.flags ? hold : ZSWAP32(hold)) !== state.check) {
          strm.msg = 'incorrect data check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   check matches trailer\n"));
      }
      state.mode = LENGTH;
      /* falls through */
    case LENGTH:
      if (state.wrap && state.flags) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.total & 0xffffffff)) {
          strm.msg = 'incorrect length check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   length matches trailer\n"));
      }
      state.mode = DONE;
      /* falls through */
    case DONE:
      ret = Z_STREAM_END;
      break inf_leave;
    case BAD:
      ret = Z_DATA_ERROR;
      break inf_leave;
    case MEM:
      return Z_MEM_ERROR;
    case SYNC:
      /* falls through */
    default:
      return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}


exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/
},{"../utils/common":73,"./adler32":75,"./crc32":77,"./inffast":79,"./inftrees":81}],81:[function(require,module,exports){
'use strict';


var utils = require('../utils/common');

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS+1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS+1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
      base = extra = work;    /* dummy value--not used */
      end = 19;
  } else if (type === LENS) {
      base = lbase;
      base_index -= 257;
      extra = lext;
      extra_index -= 257;
      end = 256;
  } else {                    /* DISTS */
      base = dbase;
      extra = dext;
      end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  var i=0;
  /* process all codes and make table entries */
  for (;;) {
    i++;
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

},{"../utils/common":73}],82:[function(require,module,exports){
'use strict';

module.exports = {
  '2':    'need dictionary',     /* Z_NEED_DICT       2  */
  '1':    'stream end',          /* Z_STREAM_END      1  */
  '0':    '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};
},{}],83:[function(require,module,exports){
'use strict';


function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;
},{}],84:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var AI, AL, B2, BA, BB, BK, CB, CJ, CL, CM, CP, CR, EX, GL, H2, H3, HL, HY, ID, IN, IS, JL, JT, JV, LF, NL, NS, NU, OP, PO, PR, QU, RI, SA, SG, SP, SY, WJ, XX, ZW;

  exports.OP = OP = 0;

  exports.CL = CL = 1;

  exports.CP = CP = 2;

  exports.QU = QU = 3;

  exports.GL = GL = 4;

  exports.NS = NS = 5;

  exports.EX = EX = 6;

  exports.SY = SY = 7;

  exports.IS = IS = 8;

  exports.PR = PR = 9;

  exports.PO = PO = 10;

  exports.NU = NU = 11;

  exports.AL = AL = 12;

  exports.HL = HL = 13;

  exports.ID = ID = 14;

  exports.IN = IN = 15;

  exports.HY = HY = 16;

  exports.BA = BA = 17;

  exports.BB = BB = 18;

  exports.B2 = B2 = 19;

  exports.ZW = ZW = 20;

  exports.CM = CM = 21;

  exports.WJ = WJ = 22;

  exports.H2 = H2 = 23;

  exports.H3 = H3 = 24;

  exports.JL = JL = 25;

  exports.JV = JV = 26;

  exports.JT = JT = 27;

  exports.RI = RI = 28;

  exports.AI = AI = 29;

  exports.BK = BK = 30;

  exports.CB = CB = 31;

  exports.CJ = CJ = 32;

  exports.CR = CR = 33;

  exports.LF = LF = 34;

  exports.NL = NL = 35;

  exports.SA = SA = 36;

  exports.SG = SG = 37;

  exports.SP = SP = 38;

  exports.XX = XX = 39;

}).call(this);

},{}],85:[function(require,module,exports){
(function (Buffer){
// Generated by CoffeeScript 1.7.1
(function() {
  var AI, AL, BA, BK, CB, CI_BRK, CJ, CP_BRK, CR, DI_BRK, ID, IN_BRK, LF, LineBreaker, NL, NS, PR_BRK, SA, SG, SP, UnicodeTrie, WJ, XX, characterClasses, classTrie, data, fs, pairTable, _ref, _ref1;

  UnicodeTrie = require('unicode-trie');

  

  data = Buffer("AA4IAAAAAAAAAAzw3VZ7PNP7//+ebiriUKKwnRJyieRSxrZzoiS3IypilJ3KbW4rWjM7HURuK9cuNKUyHXeOhbGkTKGR+4ZhMWFbjA27fH7U+f31ezx+v/7+Pf95f96Px/N1eb5ez8f78eGOwO8yBn+iRSQBb4PFc2MpJuMfg73V9I5mfUfHsyfPvqE3NeX3M99whH07I8PY752rV77Lhm37Hl/EP15RCFD7IlqUnXJNetcDzz1t1lH5erf1nFusm8HIk78MNHt/t9/oXNN1Ug6x2EX7j23q4dZNxi/uX0rfnON5KW1H7eAlwoLWCqlgu5xFb/evOw/VdP+mBl00ff2zdqrprRT9K/eRt3TOeSKRIY2Xy0E3hgslGZEFP5bVcMHtN1XFIFLhLd0L5U25dZ1IOUT1MLuS8NNt9Uupd1YaxTMN6/mVKxQ89wSHpKKOr3ctHVNU9aC3/db5LS6gEHmt2xYcd3ffyVb1na/ub+k4TNvgiEywsCynDpRebRdoCUdhwGtY4b8tdYJB/cHzlDSX1LLu9oLvlbb5OJm2aMobVS58SPzemYZQXtVjvODKmmCz4/KowrjQU0o45J/7TqojN6i5fytRUtG6xXuuwn7l0KTd5rPHSM89vul1IQmET1Bx9WHspS4l9YsB67pDLzJ7yF++R1FQl+IORcnNucnao6NJSW0nPHbY263hQMLemc29v+4s1WZMF6SAVtXVbVPT/2e1ujcW5WtDczm147q5v3n3cQ2tdfUbFUzfrIv3v22129N/TfugfyL0A/8g2ID05rc1ZpedPOpa1wklnMLht1uRTmP+yXumPC/eUe0fvJiiJTwInIL9IDE7xuP3hLi9MwEFd3b/2+fFJOXW+6/f7Vp3lYphSWXzN2u5/mhGux8lpv1gaZn1/+3VtQ0MFvrogNd3fBuyN+BpgiVk+mkibIu6f7ypbrjpOwW0UcXb7cEhFe8UsVl43R8l7vtBIvwuYfvL8N9ttXaYw+2oeliHUqWooVH8vf3B+LYXccY3p4kBa17b9+8Uflp3ZqvV96WKhAS4HwwnUmVROETH53i2YdN4SsuRpgmNJsmH70fc5Zh3R2NW3ny/ZX6/qbUvJ4eFd0hv8h9LAB7wyJ42bBvdiQulDZtFdUpHOkcujTaOjEUerZh7iCUB2Py6gS8PxdnpdSLOQ2x4el1tRKdFErJsp48ZK7qDMmIhCKN1FCLMwFEdlH4LgTutwwxh5netg0K3EByldbT4mBEjOyhtFgINWof7Wkx4B6XZgoOn5dEQaFiUExDtDKCn0YhXg8Pgcnvle96TMTVwWiWXB/Pd3Cfmc9IO/iOGh5bH4j03Oofx4qLi063sEUEAVsRaMk06/Hb6T1PdqTxImmmLZMNuvV5mxvVzozevuHwb7R5wNKkgqDX56JUgktq1OfOD53eWxk8G443S0xMg3Fgbwrpv1JHxlUlJST4da08SGI+XEXEUSV7hqSlwpvfFO9nnr+7TCClvUxRrBIgXim5EE9PL/VZ20cW4bPt1W20NqX4v6N/GmNb8b7eyd+m+yOMVyfUkrd7HqSj/73i05mrM0z49MQv4ZUjCoU8CWD8DrbPN5csBx7b1O8z43UjXu5FmTTGnNxIxgGzX8oi85J1NleHz89saD/vK2Sgd4pT+IRx3VetQ4GBRXpbtfMdVEVNbzUIXUBYIbGwsuGNpKw3/KcePasjQgLqbPnQxEA8F/uEfn90C3XYo9/RKOlmcR/ZbjFFWvhf8ma73F3oL3mr5IZK5dXuZgNdWnxtejBk9dPPmBCTCRb+lmMtDyNsjlAZ5hP3+9iDaHuU639G8148MPU7j8wyHsydYtkb1p7+MvxLCJlbQghtz0h7w9gPlsK9HfokB6zjnwwkXG/BF9+zhTjeBmctjmFdOtbMnQMs4yHsfgy/8Qt9Zqm4g8B5NRAmbHR+bXUvz6YjCIU5H081IW9mcvOsqvjTr88xj9JPZhoErmSXRzsj5C+1anE9E+1cHmNexd2Dqvh8v+HFIrsCSKvsMbTKc2CCsxATApTiovViOjAkw0muk/gyDvUDhgVXzIKaMzj9NI1gRnkgF4SSwpqF7DsarN0J3NnYw9G8KEx6stZkp9plsPyJjty7poxX/wTfREmwY8Pexel821jKnVbj4MsGvFdCePCATwpHQAZt5JAi4lLtXHNieWSslLBU+Y0/0M1mt83Dnhj8Cga+wKw82DgeJaX2i4oze6Aw2vl8I72dBIwYSxiPm7zPgd9Af1Yx1HKgK4oVT8SKxMVtIqXeBuEhFSyC0lNOdE8hxcEMtGx9Yri66xVGt1lyySi+60vi18cXYq9RIngjTQpydBzfiJ1+zKyNVh+rKJg22xYKyw8TqxL6w54lsNx8tPa5Gc6WySKTpmrYfJP4EoraIrzRIanVKqa+WUGDHlzlSn3Dq8DGmlN6KMYtpDJ+2+aVoAK1CaOSZ1AGj1EiSDMXHM+ohlmHVOjZUJwOCxHaAgeEU4fiTmkPjIj5IgIXHMuHyRmKk3nIsvZgP/tyHl4iUJQtUeanNMI24u0SCAXuH5I7nDMb4Wb8ENudKZY+X6hf636axgqmyjz1PZBxqa1QDY87RF3eAC/fKx8ruRT3eqfeSMMgjc3iCQB1o9DMr2aZyb4PnPWWXq3KgQeDkLp4XY3pYREie8BGkBD/iT1mxthMazPFXVc4nDjCADBD2Ux58IYBKYp8ZpoeAacldLDqmrOGsDCsfQdvE6ula8NOeMZHUgx2pQBlV73ki3xSvUqkZU8pB/UmGAtYDhYyP7TiMXYWC70cz7bJQ3/tV2RvLoYurxxKnIM2TxP39zhBXHLjSJYNvIxSZLONSx/kBTlWyYk7PWOyI1s8ylznzp/3QAYu4TpGrywPBgXylFbbOsJwiLtb84KtRxJvrf0lNOoUpM11NdriwoF5RDVglNzeq0V2oL8/kRt6JoubA9p7nhQ+1wFNWGwF1GV5+IvLpqruPFmjGMbHVM2M+ozZ2IocgtXkvzOzvfDKJXoxDo+CB+ToIuMmA5bnquXYNdhYKC3zQK8POjsb/8QCvigAJOOiOQ2V9sxuyxrOOyA0Zu2YcAUWWlbi3360xeTbk0rtQXC5PtZyV6aISn83+0bkDTGXPTHtCb5M5gMzZySVHEJGDS/27Bd17OSeKMIOOlZ5onNK83OQhBTP5jimzKRFvkGYvXVk0CizIJh6vphkdsbTrbDqJa5et91Ih8UCxobd06mE8U+Bw6mt0BCuRKzUkfr2xA014ujBbsfXyMWFAQ1nIHJphzxSffQY5dBoTkqvt6kZ7530D0J7rwg0WjHFWpdjXdMf3MPyZaw7AR13eaDF3gekRL6aNW3mdSYQdVZHk2RYvimNBj8Wb4UqR05q7R5vg51NXfU54IICAePFFRvATm6wd+BWvsZXKm/oJ/VBh/dVbnOal9Duz8EBhD2Dk/PWqr0aMJZ0AneKesaItZM6JKlk4Y+m8mQH9uMTSTcpxB8aJ4utaForJ+7lWEvTJWpHoPnJAXNuem821usuV0m3daFEXyFEAhERiFd6tmePUx1L6qayDf5Ho/mpcvmKodNXak+g28GQgUrKdfMKD+XnEF7PY84yoRVWVifatiqozZNI/uZGcocSFZextIzxV/SzgpVNKDI91o1NpQpGKoIgC7G5tr5jPJySuErnzwcg5GsrkffSmPIgMNdCnM2PBXfLOkKmNRjFWlch/c/nH3zMU3aRm3Mq2KMAg+QAnr0RqMhe2LN6s74r54P54IavIZvL//edo6Wdpzie61far0siNb8SLru2jnkLIVTecUI5ylOBAcZlnOLY3yEKzReU+p/EU+epG8MDUc8ziLB930sTJOqcTTUe3hLHJcgx+V21mDb7XtJMOXTKl5NvS6JFj3YZ0s5byONtJh5upTYa4MPJRZXFYAxyhTeXFHiHEWifMQl4qZdkSHFak+5erOfrke2e/vK3iZPMHUFaLkgeBRfRtQzzXoq/iOG7koCYeFFaCQRrHUBoMteBNOvnam+j6xHC/m3k0Oqm+eNP0cOSe5ro0btXghAjKnGyb2S1sPifG+upkLUHmKxHw0Q/LH/5mqRbHVvngmcbiJ6vOC7LjDK7WQ6pdJQJ8IkCuzzVGSxVjlG+bg0zphEUWY5r/IQPFnOSvEQVtgiLbFS+xwz0m0Bvx6IXvxz4l0OyytT02gbzThgcKziyRsqLyJxFU2iqxDA7OOyMroSkx134qxqiRa65NSGj/nEveNW/twJJLZvA4dyf3snPyzkTLoOWO9IbkGAn0HBlDZtUxjxEglSMnMTwit2qXFwMT3D1URkeTHS9YwhJ3XsM/l0DIiHRHXpgHvBpRZv4pNUVJzR8rmWzmG0ZQqxFNpIV4cE+Zd43UoOqZAEDXcPWNH2Qv2YQ2HDLptgcxl4pW6ZfFuVwRqmyojsbG//Rf","base64");

  classTrie = new UnicodeTrie(data);

  _ref = require('./classes'), BK = _ref.BK, CR = _ref.CR, LF = _ref.LF, NL = _ref.NL, CB = _ref.CB, BA = _ref.BA, SP = _ref.SP, WJ = _ref.WJ, SP = _ref.SP, BK = _ref.BK, LF = _ref.LF, NL = _ref.NL, AI = _ref.AI, AL = _ref.AL, SA = _ref.SA, SG = _ref.SG, XX = _ref.XX, CJ = _ref.CJ, ID = _ref.ID, NS = _ref.NS, characterClasses = _ref.characterClasses;

  _ref1 = require('./pairs'), DI_BRK = _ref1.DI_BRK, IN_BRK = _ref1.IN_BRK, CI_BRK = _ref1.CI_BRK, CP_BRK = _ref1.CP_BRK, PR_BRK = _ref1.PR_BRK, pairTable = _ref1.pairTable;

  LineBreaker = (function() {
    var Break, mapClass, mapFirst;

    function LineBreaker(string) {
      this.string = string;
      this.pos = 0;
      this.lastPos = 0;
      this.curClass = null;
      this.nextClass = null;
    }

    LineBreaker.prototype.nextCodePoint = function() {
      var code, next;
      code = this.string.charCodeAt(this.pos++);
      next = this.string.charCodeAt(this.pos);
      if ((0xd800 <= code && code <= 0xdbff) && (0xdc00 <= next && next <= 0xdfff)) {
        this.pos++;
        return ((code - 0xd800) * 0x400) + (next - 0xdc00) + 0x10000;
      }
      return code;
    };

    mapClass = function(c) {
      switch (c) {
        case AI:
          return AL;
        case SA:
        case SG:
        case XX:
          return AL;
        case CJ:
          return NS;
        default:
          return c;
      }
    };

    mapFirst = function(c) {
      switch (c) {
        case LF:
        case NL:
          return BK;
        case CB:
          return BA;
        case SP:
          return WJ;
        default:
          return c;
      }
    };

    LineBreaker.prototype.nextCharClass = function(first) {
      if (first == null) {
        first = false;
      }
      return mapClass(classTrie.get(this.nextCodePoint()));
    };

    Break = (function() {
      function Break(position, required) {
        this.position = position;
        this.required = required != null ? required : false;
      }

      return Break;

    })();

    LineBreaker.prototype.nextBreak = function() {
      var cur, lastClass, shouldBreak;
      if (this.curClass == null) {
        this.curClass = mapFirst(this.nextCharClass());
      }
      while (this.pos < this.string.length) {
        this.lastPos = this.pos;
        lastClass = this.nextClass;
        this.nextClass = this.nextCharClass();
        if (this.curClass === BK || (this.curClass === CR && this.nextClass !== LF)) {
          this.curClass = mapFirst(mapClass(this.nextClass));
          return new Break(this.lastPos, true);
        }
        cur = (function() {
          switch (this.nextClass) {
            case SP:
              return this.curClass;
            case BK:
            case LF:
            case NL:
              return BK;
            case CR:
              return CR;
            case CB:
              return BA;
          }
        }).call(this);
        if (cur != null) {
          this.curClass = cur;
          if (this.nextClass === CB) {
            return new Break(this.lastPos);
          }
          continue;
        }
        shouldBreak = false;
        switch (pairTable[this.curClass][this.nextClass]) {
          case DI_BRK:
            shouldBreak = true;
            break;
          case IN_BRK:
            shouldBreak = lastClass === SP;
            break;
          case CI_BRK:
            shouldBreak = lastClass === SP;
            if (!shouldBreak) {
              continue;
            }
            break;
          case CP_BRK:
            if (lastClass !== SP) {
              continue;
            }
        }
        this.curClass = this.nextClass;
        if (shouldBreak) {
          return new Break(this.lastPos);
        }
      }
      if (this.pos >= this.string.length) {
        if (this.lastPos < this.string.length) {
          this.lastPos = this.string.length;
          return new Break(this.string.length);
        } else {
          return null;
        }
      }
    };

    return LineBreaker;

  })();

  module.exports = LineBreaker;

}).call(this);

}).call(this,require("buffer").Buffer)
},{"./classes":84,"./pairs":86,"buffer":64,"unicode-trie":71}],86:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var CI_BRK, CP_BRK, DI_BRK, IN_BRK, PR_BRK;

  exports.DI_BRK = DI_BRK = 0;

  exports.IN_BRK = IN_BRK = 1;

  exports.CI_BRK = CI_BRK = 2;

  exports.CP_BRK = CP_BRK = 3;

  exports.PR_BRK = PR_BRK = 4;

  exports.pairTable = [[PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, CP_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, DI_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, DI_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, PR_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK], [IN_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, IN_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, DI_BRK], [DI_BRK, PR_BRK, PR_BRK, IN_BRK, IN_BRK, IN_BRK, PR_BRK, PR_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK, IN_BRK, DI_BRK, DI_BRK, PR_BRK, CI_BRK, PR_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, DI_BRK, IN_BRK]];

}).call(this);

},{}],87:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],88:[function(require,module,exports){
var Struct = require('structjs')

var Entry = module.exports = new Struct({
  tag:      Struct.String(4),
  checkSum: Struct.Uint32,
  offset:   Struct.Uint32,
  length:   Struct.Uint32
})

var Directory = module.exports = new Struct({
  scalerType:    Struct.Int32,
  numTables:     Struct.Uint16,
  searchRange:   Struct.Uint16.with({
    $packing: function() {
      return easySearchable(this.numTables) * 16
    }
  }),
  entrySelector: Struct.Uint16.with({
    $packing: function() {
      return Math.log(easySearchable(this.numTables)) / Math.LN2
    }
  }),
  rangeShift:    Struct.Uint16.with({
    $packing: function() {
      var searchRange = easySearchable(this.numTables) * 16
      return this.numTables * 16 - searchRange
    }
  }),
  entries:       Struct.Hash(Entry, 'tag', Struct.Ref('numTables'))
})

function easySearchable(numTables) {
  var result, next = 1
  while ((next = next * 2) <= numTables) {
    result = next
  }
  return result
}

},{"structjs":101}],89:[function(require,module,exports){
var Subset = module.exports = function(font) {
  this.font    = font.clone()
  this.subset  = { '32': 32 }
  this.mapping = { '32': 32 }
  this.pos     = 33
}

Subset.prototype.use = function(chars) {
  for (var i = 0, len = chars.length; i < len; ++i) {
    var code = chars.charCodeAt(i)
    if (code in this.mapping || code < 33) continue
    this.subset[this.pos] = code
    this.mapping[code] = this.pos++
  }
}

Subset.prototype.encode = function(str) {
  var codes = []
  for (var i = 0, len = str.length; i < len; ++i) {
    codes.push(this.mapping[str.charCodeAt(i)])
  }
  return String.fromCharCode.apply(String, codes)
}

Subset.prototype.cmap = function() {
  var mapping = {}
  for (code in this.subset) {
    var value = this.font.codeMap[this.subset[code]]
    if (value !== undefined) mapping[code] = value
  }
  return mapping
}

Subset.prototype.glyphs = function() {
  // collect used glyph ids
  var self = this, ids = [0]
  for (var pos in this.subset) {
    var code = this.subset[pos]
      , val = this.font.codeMap[code]
    if (val !== undefined && !!!~ids.indexOf(val))
      ids.push(val)
  }
  ids.sort()
  
  // collect the actual glyphs
  function collect(ids) {
    var glyphs = {}
    ids.forEach(function(id) {
      var glyph = self.font.tables.glyf.for(id)
      glyphs[id] = glyph
      if (glyph !== null ? glyph.isCompound : false) {
        var compounds = collect(glyph.ids)
        for (id in compounds) {
          glyphs[id] =  compounds[id]
        }
      }
    })
    return glyphs
  }
  
  return collect(ids)
}

Subset.prototype.embed = function() {
  var cmap   = this.font.tables.cmap.embed(this.cmap())
    , glyphs = this.glyphs()
    
  this.font.tables.cmap.subtables = [cmap.subtable]
  
  var old2new = { 0: 0 }
  for (var code in cmap.charMap) {
    var ids = cmap.charMap[code]
    old2new[ids.old] = ids.new
  }
  
  var nextGlyphID = cmap.maxGlyphID
  for (var oldID in glyphs) {
    if (!(oldID in old2new))
      old2new[oldID] = nextGlyphID++
  }
  
  var new2old = {}
  for (var id in old2new) {
    new2old[old2new[id]] = id
  }
  var newIDs = Object.keys(new2old).sort(function(a, b) {
    return a - b
  })
  var oldIDs = newIDs.map(function(id) {
    return new2old[id]
  })
  
  // encode the font tables
  var offsets = this.font.tables.glyf.embed(glyphs, oldIDs, old2new)
  this.font.tables.loca.embed(offsets)
  this.font.tables.hmtx.embed(oldIDs)
  this.font.tables.hhea.embed(oldIDs)
  this.font.tables.maxp.embed(oldIDs)
  this.font.tables.name.embed(cmap.charMap)
}

Subset.prototype.save = function() {
  return this.font.save()
}
},{}],90:[function(require,module,exports){
var Struct = require('structjs')

var Table = new Struct({
  format:        Struct.Uint16
}, { storage: true, offset: Struct.Ref('offset') })

Table.conditional(function() { return this.format === 4 }, {
  length:          Struct.Uint16,
  language:        Struct.Uint16,
  segCount:        Struct.Uint16.with({
    $unpacked: function(value) {
      return value / 2
    },
    $packing: function(value) {
      return value * 2
    }
  }),
  searchRange:     Struct.Uint16,
  entrySelector:   Struct.Uint16,
  rangeShift:      Struct.Uint16,
  endCode:         Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  reservedPad:     Struct.Uint16,
  startCode:       Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idDelta:         Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  idRangeOffset:   Struct.Array(Struct.Uint16, Struct.Ref('segCount')),
  glyphIndexArray: Struct.Array(Struct.Uint16, function() {
    var length = (this.length - (8 + this.segCount * 4) * 2) / 2
    return length
  })
})

Table.prototype.$unpacked = function() {
  if (this.format !== 4) return
  this.codeMap = {}
  for (var i = 0, len = this.segCount; i < len; ++i) {
    var endCode = this.endCode[i], startCode = this.startCode[i]
      , idDelta = this.idDelta[i], idRangeOffset = this.idRangeOffset[i]
    
    for (var code = startCode; code <= endCode; ++code) {
      var id
      if (idRangeOffset === 0) id = code + idDelta
      else {
        var index = idRangeOffset / 2 + (code - startCode) - (this.segCount - i)
        id = this.glyphIndexArray[index] || 0 // because some TTF fonts are broken
        if (id != 0) id += idDelta
      }
      
      this.codeMap[code] = id & 0xFFFF
    }
  }
}

var SubTable = new Struct({
  platformID:         Struct.Uint16,
  platformSpecificID: Struct.Uint16,
  offset:             Struct.Uint32,
  format:             Struct.Uint16.from(Struct.Ref('offset')),
  table:              Table
})

Object.defineProperty(SubTable.prototype, 'isUnicode', {
  enumerable: true,
  get: function() {
           //this.format === 4 &&
    return ((this.platformID === 3 // Windows platform-specific encoding
             && this.platformSpecificID === 1) // http://www.microsoft.com/typography/otspec/name.htm
           || this.platformID === 0) // Unicode platform-specific encoding
  }
})

var Cmap = module.exports = new Struct({
  version:         Struct.Uint16,
  numberSubtables: Struct.Uint16,
  subtables:       Struct.Array(SubTable, Struct.Ref('numberSubtables')),
  tables:          Struct.Storage('subtables.table')
})

Cmap.prototype.embed = function(cmap) {
  var codes = Object.keys(cmap).sort(function(a, b) {
    return a - b
  })
  
  var nextId = 0, map = {}, charMap = {}, last = diff = null, endCodes = [], startCodes = []
  codes.forEach(function(code) {
    var old = cmap[code]
    if (map[old] === undefined) map[old] = ++nextId
    charMap[code] = { old: old, new: map[old] }
    var delta = map[old] - code
    if (last === null || delta !== diff) {
      if (last) endCodes.push(last)
      startCodes.push(code)
      diff = delta
    }
    last = code
  })
  
  if (last) endCodes.push(last)
  endCodes.push(0xFFFF)
  startCodes.push(0xFFFF)
  
  var segCount      = startCodes.length
    , segCountX2    = segCount * 2
    , searchRange   = 2 * Math.pow(Math.log(segCount) / Math.LN2, 2)
    , entrySelector = Math.log(searchRange / 2) / Math.LN2
    , rangeShift    = 2 * segCount - searchRange
  
  var deltas = []
    , rangeOffsets = []
    , glyphIDs = []
  
  for (var i = 0, len = startCodes.length; i < len; ++i) {
    var startCode = startCodes[i]
      , endCode = endCodes[i]
      
    if (startCode === 0xFFFF) {
      deltas.push(0)
      rangeOffsets.push(0)
      break
    }
    
    var startGlyph = charMap[startCode].new
    if (startCode - startGlyph >= 0x8000) {
      deltas.push(0)
      rangeOffsets.push(2 * (glyphIDs.length + segCount - i))
      
      for (var code = startCode; code < endCode; ++startCode) {
        glyphIDs.push(charMap[code].new)
      }
    } else {
      deltas.push(startGlyph - startCode)
      rangeOffsets.push(0)
    }
  }
  
  var subtable = new SubTable({
    platformID: 3,
    platformSpecificID: 1,
    offset: 12,
    table: new Table({
      format: 4,
      length: 16 + segCount * 8 + glyphIDs.length * 2,
      language: 0,
      segCount: segCount,
      searchRange: searchRange,
      entrySelector: entrySelector,
      rangeShift: rangeShift,
      endCode: endCodes,
      reservedPad: 0,
      startCode: startCodes,
      idDelta: deltas,
      idRangeOffset: rangeOffsets,
      glyphIndexArray: glyphIDs
    })
  })
      
  return {
    charMap: charMap,
    subtable: subtable,
    maxGlyphID: nextId + 1
  }
}
},{"structjs":101}],91:[function(require,module,exports){
var Struct = require('structjs')

module.exports = function(loca) {
  return new Glyf(loca)
}

var Glyf = function(loca) {
  this.loca  = loca
  this.cache = {}
}

Glyf.prototype.clone = function() {
  var clone = new Glyf(this.loca)
  clone.cache = this.cache
  return clone
}

Glyf.prototype.embed = function(glyphs, mapping, old2new) {
  var offsets = [], offset = 0
  this.mapping = mapping
  this.glyphs = glyphs
  mapping.forEach(function(id) {
    var glyph = glyphs[id]
    offsets.push(offset)
    if (!glyph) return
    glyph.embed(old2new)
    offset += glyph.lengthFor() * glyph.sizeFor()
  })
  offsets.push(offset)
  return offsets
}

Glyf.prototype.for = function(id) {
  if (id in this.cache) return this.cache[id]
  
  var index  = this.loca.indexOf(id)
    , length = this.loca.lengthOf(id)
    
  if (length === 0) return this.cache[id] = null
  return this.cache[id] = (new Glyph()).unpack(new DataView(this.view.buffer, this.view.byteOffset + index, length))
}

Glyf.prototype.unpack = function(view) {
  this.view = view
  return this
}

Glyf.prototype.pack = function(view, offset) {
  var self = this
  this.mapping.forEach(function(id) {
    var glyph = self.glyphs[id]
    if (!glyph) return
    glyph.pack(view, offset)
    offset += glyph.lengthFor() * glyph.sizeFor()
  })
}

Glyf.prototype.lengthFor = function() {
  return 1
}

Glyf.prototype.sizeFor = function() {
  var size = 0
  for (var id in this.cache) {
    var glyph = this.cache[id]
    if (!glyph) continue
    size += glyph.lengthFor() * glyph.sizeFor()
  }
  return size
}

var ARG_1_AND_2_ARE_WORDS    = 0x0001
  , WE_HAVE_A_SCALE          = 0x0008
  , MORE_COMPONENTS          = 0x0020
  , WE_HAVE_AN_X_AND_Y_SCALE = 0x0040
  , WE_HAVE_A_TWO_BY_TWO     = 0x0080
  , WE_HAVE_INSTRUCTIONS     = 0x0100

// Currently, it is all about being able to create font subsets.
// Therefore, it is not necessary to actually decompose the glyph
// into it's parts. Important are the locations within the provided
// buffer to be able to rewrite the glyph ids for subsets.
var Glyph = function() {
}

Glyph.prototype.unpack = function(view) {
  this.view = view
  this.isCompound = view.getInt16(0) === -1
  
  if (this.isCompound) {
    this.ids = []
    this.offsets = []
    var offset = 10

    // thanks to https://github.com/prawnpdf/ttfunk
    while(true) {
      var flags = this.view.getInt16(offset)
        , id    = this.view.getInt16(offset + 2)
      this.ids.push(id)
      this.offsets.push(offset + 2)
      
      if (!(flags & MORE_COMPONENTS)) break
      
      offset += 4
      
      if (flags & ARG_1_AND_2_ARE_WORDS) offset += 4
      else                               offset += 2
      
      if (flags & WE_HAVE_A_TWO_BY_TWO)          offset += 8
      else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) offset += 4
      else if (flags & WE_HAVE_A_SCALE)          offset += 2
    }
  }
  
  return this
}

Glyph.prototype.pack = function(view, offset) {
  for (var i = 0, len = this.view.byteLength; i < len; ++i) {
    view.setUint8(offset + i, this.view.getUint8(i))
  }
}

Glyph.prototype.lengthFor = function() {
  return 1
}

Glyph.prototype.sizeFor = function() {
  return this.view.byteLength
}

Glyph.prototype.embed = function(mapping) {
  if (!this.isCompound) return
  var self = this
  this.ids.forEach(function(id, i) {
    self.view.setUint16(self.offsets[i], mapping[id])
  })
}
},{"structjs":101}],92:[function(require,module,exports){
var Struct = require('structjs')
module.exports = new Struct({
  version:            Struct.Int32,
  fontRevision:       Struct.Int32,
  checkSumAdjustment: Struct.Uint32,
  magicNumber:        Struct.Uint32,
  flags:              Struct.Uint16,
  unitsPerEm:         Struct.Uint16,
  createdA:           Struct.Int32,
  createdB:           Struct.Int32,
  modifiedA:          Struct.Int32,
  modifiedB:          Struct.Int32,
  xMin:               Struct.Int16,
  yMin:               Struct.Int16,
  xMax:               Struct.Int16,
  yMax:               Struct.Int16,
  macStyle:           Struct.Uint16,
  lowestRecPPEM:      Struct.Uint16,
  fontDirectionHint:  Struct.Int16,
  indexToLocFormat:   Struct.Int16,
  glyphDataFormat:    Struct.Int16
})
},{"structjs":101}],93:[function(require,module,exports){
var Struct = require('structjs')

var Hhea = module.exports = new Struct({
  version:             Struct.Int32,
  ascent:              Struct.Int16,
  descent:             Struct.Int16,
  lineGap:             Struct.Int16,
  advanceWidthMax:     Struct.Uint16,
  minLeftSideBearing:  Struct.Int16,
  minRightSideBearing: Struct.Int16,
  xMaxExtent:          Struct.Int16,
  caretSlopeRise:      Struct.Int16,
  caretSlopeRun:       Struct.Int16,
  caretOffset:         Struct.Int16,
  reserved1:           Struct.Int16,
  reserved2:           Struct.Int16,
  reserved3:           Struct.Int16,
  reserved4:           Struct.Int16,
  metricDataFormat:    Struct.Int16,
  numOfLongHorMetrics: Struct.Uint16
})

Hhea.prototype.embed = function(ids) {
  this.numOfLongHorMetrics = ids.length
}
},{"structjs":101}],94:[function(require,module,exports){
var Struct = require('structjs')

var AdvanceWidth = new Struct({
  advanceWidth:    Struct.Uint16,
  leftSideBearing: Struct.Int16
})

module.exports = function(numOfLongHorMetrics, numGlyphs) {
  var Hmtx = new Struct({
    hMetrics:        Struct.Array(AdvanceWidth, numOfLongHorMetrics),
    leftSideBearing: Struct.Array(Struct.Uint16, numGlyphs - numOfLongHorMetrics)
  })
  
  Hmtx.prototype.$unpacked = function() {
    var metrics = this.metrics = []
    this.hMetrics.forEach(function(e) {
      metrics.push(e.advanceWidth)
    })
    var last = metrics[metrics.length - 1]
    this.leftSideBearing.forEach(function(mapping) {
      metrics.push(last)
    })
  }
  
  Hmtx.prototype.for = function(id) {
    if (id in this.hMetrics) return this.hMetrics[id]
    
    return new AdvanceWidth({
      advanceWidth:    this.hMetrics[this.hMetrics.length - 1].advance,
      leftSideBearing: this.leftSideBearing[id - this.hMetrics.length]
    })
  }
  
  Hmtx.prototype.embed = function(ids) {
    var self = this, metrics = []
    ids.forEach(function(id) {
      metrics.push(self.for(id))
    })
    
    this.hMetrics = metrics
    this.leftSideBearing = []
    
    this._definition.hMetrics._length = ids.length
    this._definition.leftSideBearing._length = 0
  }
  
  return Hmtx
}


},{"structjs":101}],95:[function(require,module,exports){
var Struct = require('structjs')
module.exports = function(indexToLocFormat, numGlyphs) {
  var Loca
  switch (indexToLocFormat) {
    case 0:
      Loca = new Struct({
        offsets: Struct.Array(Struct.Uint16, numGlyphs + 1)
      })
      Loca.prototype.$unpacked = function() {
        for (var i = 0, len = this.offsets.length; i < len; ++i) {
          this.offsets[i] *= 2
        }
      }
      Loca.prototype.$packing = function() {
        for (var i = 0, len = this.offsets.length; i < len; ++i) {
          this.offsets[i] /= 2
        }
      }
      break
    case 1:
      Loca = new Struct({
        offsets: Struct.Array(Struct.Uint32, numGlyphs + 1)
      })
      break
  }
  
  Loca.prototype.indexOf = function(id) {
    return this.offsets[id]
  }

  Loca.prototype.lengthOf = function(id) {
    return this.offsets[id + 1] - this.offsets[id]
  }
  
  Loca.prototype.embed = function(offsets) {
    this._definition.offsets._length = offsets.length
    this.offsets = offsets
  }
  
  return Loca
}
},{"structjs":101}],96:[function(require,module,exports){
var Struct = require('structjs')

var Maxp = module.exports = new Struct({
  version:               Struct.Int32,
  numGlyphs:             Struct.Uint16,
  maxPoints:             Struct.Uint16,
  maxContours:           Struct.Uint16,
  maxComponentPoints:    Struct.Uint16,
  maxComponentContours:  Struct.Uint16,
  maxZones:              Struct.Uint16,
  maxTwilightPoints:     Struct.Uint16,
  maxStorage:            Struct.Uint16,
  maxFunctionDefs:       Struct.Uint16,
  maxInstructionDefs:    Struct.Uint16,
  maxStackElements:      Struct.Uint16,
  maxSizeOfInstructions: Struct.Uint16,
  maxComponentElements:  Struct.Uint16,
  maxComponentDepth:     Struct.Uint16
})

Maxp.prototype.embed = function(ids) {
  this.numGlyphs = ids.length
}
},{"structjs":101}],97:[function(require,module,exports){
var Struct = require('structjs')

var Record = new Struct({
  platformID: Struct.Uint16,
  encodingID: Struct.Uint16,
  languageID: Struct.Uint16,
  nameID:     Struct.Uint16,
  length:     Struct.Uint16.with({
    $unpacked: function(value) {
      return value / 2
    },
    $packing: function(value) {
      return value * 2
    }
  }),
  offset:     Struct.Uint16,
  string:     Struct.String({
    storage: true, size: 2,
    length: Struct.Ref('length'),
    offset: Struct.Ref('offset')
  })
})

var Name = module.exports = new Struct({
  format:       Struct.Uint16,
  count:        Struct.Uint16,
  stringOffset: Struct.Uint16,
  records:      Struct.Array(Record, Struct.Ref('count')),
  names:        Struct.Storage('records.string', Struct.Ref('stringOffset'))
})

Name.prototype.embed = function(charMap) {
  var postscriptName = null
  for (var i = 0; i < this.records.length; ++i) {
    var record = this.records[i]
    if (record.nameID === 6) {
      if (postscriptName === null) postscriptName = record.string
      this.records.splice(i--, 1)
    }
  }
  this.records.push(new Record({
    platformID: 1,
    encodingID: 0,
    languageID: 0,
    nameID: 6,
    length: 0,
    offset: 0,
    string: "MARKUS+" + postscriptName
  }))
  
  // sample text
  // var sample = this.records.filter(function(record) {
  //   return record.nameID === 19
  // })[0]
  // if (!sample) {
  //   sample = new Record({
  //     platformID: 0,
  //     encodingID: 3,
  //     languageID: 0,
  //     nameID: 19,
  //     length: 0,
  //     offset: 0
  //   })
  //   this.records.push(sample)
  // }
  // sample.string = String.fromCharCode.apply(String, Object.keys(charMap))
}
},{"structjs":101}],98:[function(require,module,exports){
var Struct = require('structjs')
module.exports = (new Struct({
  version:             Struct.Uint16,
  xAvgCharWidth:       Struct.Int16,
  usWeightClass:       Struct.Uint16,
  usWidthClass:        Struct.Uint16,
  fsType:              Struct.Uint16,
  ySubscriptXSize:     Struct.Int16,
  ySubscriptYSize:     Struct.Int16,
  ySubscriptXOffset:   Struct.Int16,
  ySubscriptYOffset:   Struct.Int16,
  ySuperscriptXSize:   Struct.Int16,
  ySuperscriptYSize:   Struct.Int16,
  ySuperscriptXOffset: Struct.Int16,
  ySuperscriptYOffset: Struct.Int16,
  yStrikeoutSize:      Struct.Int16,
  yStrikeoutPosition:  Struct.Int16,
  sFamilyClass:        Struct.Int16,
  panose:              Struct.Array(Struct.Uint8, 10),
  ulUnicodeRange1:     Struct.Uint32,
  ulUnicodeRange2:     Struct.Uint32,
  ulUnicodeRange3:     Struct.Uint32,
  ulUnicodeRange4:     Struct.Uint32,
  achVendID:           Struct.Array(Struct.Int8, 4),
  fsSelection:         Struct.Uint16,
  usFirstCharIndex:    Struct.Uint16,
  usLastCharIndex:     Struct.Uint16
}))
.conditional(function() { return this.version > 0 }, {
  sTypoAscender:       Struct.Int16,
  sTypoDescender:      Struct.Int16,
  sTypoLineGap:        Struct.Int16,
  usWinAscent:         Struct.Uint16,
  usWinDescent:        Struct.Uint16,
  ulCodePageRange1:    Struct.Uint32,
  ulCodePageRange2:    Struct.Uint32
})
.conditional(function() { return this.version > 1 }, {
  sxHeight:            Struct.Int16,
  sCapHeight:          Struct.Int16,
  usDefaultChar:       Struct.Uint16,
  usBreakChar:         Struct.Uint16,
  usMaxContext:        Struct.Uint16
})


},{"structjs":101}],99:[function(require,module,exports){
var Struct = require('structjs')

var Post = module.exports = new Struct({
  version:            Struct.Int32,
  italicAngleHi:      Struct.Int16,
  italicAngleLow:     Struct.Int16,
  underlinePosition:  Struct.Int16,
  underlineThickness: Struct.Int16,
  isFixedPitch:       Struct.Uint32,
  minMemType42:       Struct.Uint32,
  maxMemType42:       Struct.Uint32,
  minMemType1:        Struct.Uint32,
  maxMemType1:        Struct.Uint32
})
},{"structjs":101}],100:[function(require,module,exports){
var Directory = require('./directory')
  , Subset = require('./subset')

var TTFFont = module.exports = function(buffer) {
  var self = this
  this.buffer = buffer instanceof TTFFont
                ? buffer.buffer
                : buffer = buffer instanceof ArrayBuffer ? buffer : toArrayBuffer(buffer)

  if (buffer instanceof TTFFont) {
    this.directory = buffer.directory.clone()
  } else {
    this.directory = new Directory()
    this.directory.unpack(new DataView(buffer))
  }

  var scalerType = this.directory.scalerType.toString(16)
  if (scalerType !== '74727565' && scalerType !== '10000') {
    throw new Error('Not a TrueType font')
  }

  this.tables = {}
  function unpackTable(table, args) {
    var name = table.replace(/[^a-z0-9]/ig, '').toLowerCase()
      , entry = self.directory.entries[table]
    if (!entry) return
    if (buffer instanceof TTFFont) {
      self.tables[name] = self.tables[table] = buffer.tables[table].clone()
      return
    }
    var Table = require('./table/' + name)
      , view  = new DataView(buffer, entry.offset, entry.length)
    if (args) Table = Table.apply(undefined, args)
    self.tables[name] = self.tables[table] = (typeof Table === 'function' ? new Table : Table).unpack(view)
  }

  // workaround for browserify
  if (false) {
    require('./table/cmap')
    require('./table/head')
    require('./table/hhea')
    require('./table/maxp')
    require('./table/hmtx')
    require('./table/loca')
    require('./table/glyf')
    require('./table/name')
    require('./table/post')
    require('./table/os2')
  }

  unpackTable('cmap')
  for (var i = 0, len = this.tables.cmap.subtables.length; i < len; ++i) {
    var subtable = this.tables.cmap.subtables[i]
    if (subtable.isUnicode) {
      self.codeMap = subtable.table.codeMap
      break
    }
  }
  if (!this.codeMap) throw new Error('Font does not contain a Unicode Cmap.')

  unpackTable('head')
  unpackTable('hhea')
  unpackTable('maxp')
  unpackTable('hmtx', [this.tables.hhea.numOfLongHorMetrics, this.tables.maxp.numGlyphs])
  unpackTable('loca', [this.tables.head.indexToLocFormat, this.tables.maxp.numGlyphs])
  unpackTable('glyf', [this.tables.loca])
  unpackTable('name')
  unpackTable('post')
  // I don't want to bother with post's versions, therefore skip glyhp names
  // by setting version to 3.0, TODO: bother with it ...
  this.tables.post.version = 196608
  unpackTable('OS/2')

  this.baseFont = this.tables.name.records.filter(function(record) {
    return record.nameID === 6
  })[0].string
  this.fontName = 'TTFJS+' + this.baseFont

  this.scaleFactor = 1000.0 / this.tables.head.unitsPerEm

  this.italicAngle = parseFloat(this.tables.post.italicAngleHi + '.' + this.tables.post.italicAngleLow)
  var os2 = this.tables.os2 || {}
  this.ascent      = Math.round((os2.sTypoAscender  || this.tables.hhea.ascent) * this.scaleFactor)
  this.descent     = Math.round((os2.sTypoDescender || this.tables.hhea.descent) * this.scaleFactor)
  this.lineGap     = Math.round((os2.sTypoLineGap   || this.tables.hhea.lineGap) * this.scaleFactor)
  this.capHeight   = os2.sCapHeight || this.ascent
  this.stemV       = 0
  this.bbox        = [this.tables.head.xMin, this.tables.head.yMin, this.tables.head.xMax, this.tables.head.yMax].map(function(val) {
    return Math.round(val * self.scaleFactor)
  })

  var flags = 0, familyClass = (os2.sFamilyClass || 0) >> 8
    , isSerif = !!~[1, 2, 3, 4, 5, 6, 7].indexOf(familyClass)
  if (this.tables.post.isFixedPitch) flags |= 1 << 0
  if (isSerif)                       flags |= 1 << 1
  if (familyClass === 10)            flags |= 1 << 3
  if (this.italicAngle !== 0)        flags |= 1 << 6
  /* assume not being symbolic */    flags |= 1 << 5
  this.flags = flags

  this.widths = []
  for (var code in this.codeMap) {
    if (code < 32) continue
    var gid = this.codeMap[code]
    this.widths.push(Math.round(this.tables.hmtx.metrics[gid] * this.scaleFactor))
  }
  this.avgCharWidth = this.tables.os2 && (this.tables.os2.xAvgCharWidth * this.scaleFactor) || 0
}

TTFFont.prototype.stringWidth = function(string, size) {
  var width = 0, scale = size / 1000
  for (var i = 0, len = string.length; i < len; ++i) {
    var code = string.charCodeAt(i) - 32 // - 32 because of non AFM font
    width += this.widths[code] || this.avgCharWidth
  }
  return width * scale
}

TTFFont.prototype.lineHeight = function(size, includeGap) {
  if (includeGap == null) includeGap = false
  var gap = includeGap ? this.lineGap : 0
  return (this.ascent + gap - this.descent) / 1000 * size
}

TTFFont.prototype.lineDescent = function(size) {
  return this.descent / 1000 * size
}

TTFFont.prototype.subset = function() {
  return new Subset(this)
}

TTFFont.TABLES = ['cmap', 'glyf', 'loca', 'hmtx', 'hhea', 'maxp', 'post', 'name', 'head', 'OS/2']

TTFFont.prototype.clone = function() {
  var clone = new TTFFont(this)
  clone.tables.glyf.view = this.tables.glyf.view
  return clone
}

TTFFont.prototype.save = function() {
  var self = this, tables = TTFFont.TABLES
  for (var name in this.directory.entries) {
    if (!!!~tables.indexOf(name)) delete this.directory.entries[name]
  }

  // calculate total size
  var size = offset = this.directory.lengthFor(this.directory, true) * this.directory.sizeFor(this.directory, true)

  tables.forEach(function(name) {
    if (!(name in self.directory.entries)) return
    var table = self.tables[name]
    var length = table ? table.lengthFor(table, true) * table.sizeFor(table, true)
                       : self.directory.entries[name].length
    size += length + length % 4
  })

  // prepare head
  this.tables.head.checkSumAdjustment = 0

  var view = new DataView(new ArrayBuffer(size))

  tables.forEach(function(name) {
    if (!(name in self.directory.entries)) return
    var table = self.tables[name], entry = self.directory.entries[name]
    if (!table) {
      var from = new DataView(self.buffer, entry.offset, entry.length)
      for (var i = 0; i < entry.length; ++i) view.setUint8(offset + i, from.getUint8(i))
      entry.offset = offset
    } else {
      table.pack(view, offset)
      entry.offset = offset
      entry.length = table.lengthFor(table, true) * table.sizeFor(table, true)
    }

    // pad up to a length completely divisible by 4
    var padding = entry.length % 4, length = entry.length + padding
    for (var i = entry.offset + entry.length, to = i + padding; i < to; ++i)
      view.setInt8(i, 0)

    // checksum
    var sum = 0
    for (var i = 0; i < length; i += 4)
      sum += view.getInt32(offset + i)
    entry.checkSum = sum

    // update offset for the next table
    offset += length
  })

  this.directory.pack(view, 0)

  // file checksum
  var sum = 0
  for (var i = 0; i < size; i += 4)
    sum += view.getInt32(i)
  this.tables.head.checkSumAdjustment = 0xB1B0AFBA - sum
  this.tables.head.pack(view, this.directory.entries.head.offset)

  return view.buffer
}

TTFFont.Subset = Subset

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return ab;
}
},{"./directory":88,"./subset":89,"./table/cmap":90,"./table/glyf":91,"./table/head":92,"./table/hhea":93,"./table/hmtx":94,"./table/loca":95,"./table/maxp":96,"./table/name":97,"./table/os2":98,"./table/post":99}],101:[function(require,module,exports){
var StructNumber    = require('./types/number')
  , StructString    = require('./types/string')
  , StructHash      = require('./types/hash')
  , StructArray     = require('./types/array')
  , StructReference = require('./types/reference')
  , StructStorage   = require('./types/storage')
  , utils           = require('./utils')

var Struct = module.exports = function(definition, opts) {
  if (!opts) opts = {}
    
  var StructType = function(values) {
    Object.defineProperties(this, {
      _view:       { writable: true, value: null },
      _offset:     { writable: true, value: null },
      _definition: { writable: false, value: definition}
    })
    
    for (var key in values) {
      if (key in definition) this[key] = cloneValue(values[key])
    }
    
    var self = this
    extensions.forEach(function(extension) {
      for (var key in values) {
        if (key in extension.extension) self[key] = cloneValue(values[key])
      }
    })
  }

  Object.defineProperties(StructType, {
    _offset:     { writable: true,  value: null },
    _definition: { writable: false, value: definition }
  })
  StructType.storage = opts.storage
  StructType._offset = opts.offset
  utils.methodsFor(StructType, '_offset',  'offsetFor', 'setOffset')

  var extensions = []
  StructType.conditional = function(condition, extension) {
    extensions.push({ condition: condition, extension: extension })
    return this
  }

  StructType.prototype.unpack = function(view, offset) {
    if (!(view instanceof DataView))
      throw new Error('DataView expected')
  
    if (!offset) offset = 0
    
    this._view = view
  
    var self = this
    function apply(definition) {
      for (var prop in definition) {
        var type = definition[prop]
        definition[prop].prop = prop
        if (type.storage) continue
        self[prop] = type.read(view, offset)
        if (typeof type.$unpacked === 'function')
          self[prop] = type.$unpacked.call(self, self[prop])
        if (self[prop] === undefined) delete self[prop]
        if (!type.external)
          offset += type.lengthFor(self) * type.sizeFor(self)
      }
    }
    apply.parent = this
    apply(definition)

    extensions.forEach(function(extension) {
      if (!extension.condition.call(self)) return
      apply(extension.extension)
    })
  
    if (typeof this.$unpacked === 'function')
      this.$unpacked()
  
    return this
  }

  StructType.prototype.pack = function(view, offset) {
    // console.log('Size: %d, Length: %d', this.sizeFor(this, true), this.lengthFor(this, true))
    if (typeof this.$packing === 'function')
      this.$packing()
      
    if (!view) view = new DataView(new ArrayBuffer(this.lengthFor(this, true) * this.sizeFor(this, true)))
    if (!offset) offset = 0

    var self = this
    function apply(definition) {
      var start = offset
      // write Storages first
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage) continue
        if (type instanceof StructStorage)
          type.write(view, offset, self[prop], offset - start)
        offset += type.lengthFor(self, true) * type.sizeFor(self, true)
      }
      offset = start
      // write everything left other than StructNumber second
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage) continue
        if (!(type instanceof StructNumber) && !(type instanceof StructStorage))
          type.write(view, offset, self[prop])
        offset += type.lengthFor(self, true) * type.sizeFor(self, true)
      }
      // write StructNumber last
      offset = start
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage) continue
        var value = self[prop]
        if (typeof type.$packing === 'function')
          value = type.$packing.call(self, value)
        if (type instanceof StructNumber)
          type.write(view, offset, value)
        offset += type.lengthFor(self, true) * type.sizeFor(self, true)
      }
    }
    apply.parent = this
    apply(definition)

    extensions.forEach(function(extension) {
      if (!extension.condition.call(self)) return
      apply(extension.extension)
    })

    return view.buffer
  }
  
  StructType.read = function read(buffer, offset) {
    var self = new this, parent = read.caller.parent
      , shift = this.storage ? this.offsetFor(parent) : offset
    self.unpack(buffer, shift)
    return self
  }

  StructType.write = function write(buffer, offset, value, relativeOffset) {
    var parent = write.caller.parent
      , shift = this.storage ? offset + this.offsetFor(parent) : offset
    this.setOffset(this.storage ? relativeOffset + this.offsetFor(parent) : offset, parent)
    value.pack(buffer, shift)
  }

  StructType.prototype.lengthFor = StructType.lengthFor = function() {
    return 1
  }

  StructType.prototype.sizeFor = StructType.sizeFor = function(parent, writing) {
    var self = this
    function sizeOf(definition) {
      return Object.keys(definition)
      .filter(function(prop) {
        return !definition[prop].external && !definition[prop].storage
      })
      .map(function(prop) {
        return definition[prop].lengthFor(parent, !!writing) * definition[prop].sizeFor(parent, !!writing)
      })
      .reduce(function(lhs, rhs) {
        return lhs + rhs
      }, 0)
    }
    var size = sizeOf(definition)
    extensions.forEach(function(extension) {
      if (!extension.condition.call(parent)) return
      size += sizeOf(extension.extension)
    })
    return size
  }
  
  StructType.prototype.clone = function() {
    var clone = new StructType(this)
    if (typeof clone.$unpacked === 'function') clone.$unpacked()
    return clone
  }

  return StructType
}

Struct.Int8    = new StructNumber('getInt8',    'setInt8',    1)
Struct.Uint8   = new StructNumber('getUint8',   'setUint8',   1)
Struct.Int16   = new StructNumber('getInt16',   'setInt16',   2)
Struct.Uint16  = new StructNumber('getUint16',  'setUint16',  2)
Struct.Int32   = new StructNumber('getInt32',   'setInt32',   4)
Struct.Uint32  = new StructNumber('getUint32',  'setUint32',  4)
Struct.Float32 = new StructNumber('getFloat32', 'setFloat32', 4)
Struct.Float64 = new StructNumber('getFloat64', 'setFloat64', 8)

Struct.String = function(length) {
  return new StructString(length)
}

Struct.Hash = function(struct, key, length) {
  return new StructHash(struct, key, length)
}

Struct.Array = function(struct, length) {
  return new StructArray(struct, length)
}

Struct.Reference = Struct.Ref = function(prop) {
  return new StructReference(prop)
}

Struct.Storage = function(path, opts) {
  return new StructStorage(path, opts)
}

// Helper

function cloneValue(val) {
  if (val === undefined) {
    return undefined
  } else if (typeof val.clone === 'function') {
    return val.clone()
  } else if (Array.isArray(val)) {
    return [].concat(val)
  } else if (typeof val === 'object') {
    var clone = {}
    for (key in val)
      clone[key] = cloneValue(val[key])
    return clone
  } else {
    return val
  }
}
},{"./types/array":102,"./types/hash":103,"./types/number":104,"./types/reference":105,"./types/storage":106,"./types/string":107,"./utils":108}],102:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')

var StructArray = module.exports = function(struct, length) {
  this.struct = struct
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
}

StructArray.prototype.read = function read(buffer, offset) {
  var arr = [], parent = read.caller.parent
  for (var i = 0, len = this.lengthFor(parent); i < len; ++i) {
    var child
    if (typeof this.struct === 'function') {
      child = new this.struct
      child.unpack(buffer, offset)
      offset += child.lengthFor(parent) * child.sizeFor(parent)
    } else {
      child = this.struct.read(buffer, offset)
      offset += this.struct.lengthFor(parent) * this.struct.sizeFor(parent)
    }
    arr.push(child)
  }
  return arr
}

StructArray.prototype.write = function write(buffer, offset, arr) {
  var parent = write.caller.parent, child
  this.setLength(this.lengthFor(parent, true), parent)
  for (var i = 0, len = this.lengthFor(parent, true); i < len; ++i) {
    if ((child = arr[i]) === undefined) break
    if (typeof this.struct === 'function') {
      child.pack(buffer, offset)
      offset += child.lengthFor(parent) * child.sizeFor(parent)
    } else {
      this.struct.write(buffer, offset, child)
      offset += this.struct.lengthFor(parent) * this.struct.sizeFor(parent)
    }
  }
}

StructArray.prototype.sizeFor = function(parent) {
  return (this.struct.sizeFor ? this.struct.sizeFor(parent) : this.struct.prototype.sizeFor(parent))
       * (this.struct.lengthFor ? this.struct.lengthFor(parent) : this.struct.prototype.lengthFor(parent))
}

StructArray.prototype.lengthFor = function(parent, writing) {
  if (!this._length) return 0
  if (this._length instanceof StructReference) {
    if (writing) return parent[this.prop].length
    return parent[this._length.prop]
  } else if (typeof this._length === 'function') {
    return this._length.call(parent)
  }
  return this._length
}

StructArray.prototype.setLength = function(value, parent) {
  if (this._length instanceof StructReference)
    parent[this._length.prop] = value
  else if (typeof this._length === 'function') {
    return
  } 
  else this._length = value
}
},{"../utils":108,"./reference":105}],103:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')

var StructHash = module.exports = function(struct, key, length) {
  this.struct = struct
  this.key    = key
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
}

StructHash.prototype.read = function read(buffer, offset) {
  var hash = {}, parent = read.caller.parent
  for (var i = 0, len = this.lengthFor(parent); i < len; ++i) {
    var child = new this.struct
    child.unpack(buffer, offset)
    offset += child.lengthFor(parent) * child.sizeFor(parent)
    hash[child[this.key]] = child
  }
  return hash
}

StructHash.prototype.write = function write(buffer, offset, hash) {
  var keys = Object.keys(hash), parent = write.caller.parent, child
  this.setLength(this.lengthFor(parent, true), parent)
  for (var i = 0, len =  this.lengthFor(parent); i < len; ++i) {
    if (!(child = hash[keys[i]])) continue
    child.pack(buffer, offset)
    offset += child.lengthFor(parent) * child.sizeFor(parent)
  }
}

StructHash.prototype.sizeFor = function(parent) {
   return (this.struct.sizeFor ? this.struct.sizeFor(parent) : this.struct.prototype.sizeFor(parent))
        * (this.struct.lengthFor ? this.struct.lengthFor(parent) : this.struct.prototype.lengthFor(parent))
}

StructHash.prototype.lengthFor = function(parent, writing) {
  if (!this._length) return 0
  if (this._length instanceof StructReference) {
    if (writing) return Object.keys(parent[this.prop]).length
    return parent[this._length.prop]
  }
  return this._length
}

StructHash.prototype.setLength = function(value, parent) {
  if (this._length instanceof StructReference)
    parent[this._length.prop] = value
  else this._length = value
}

},{"../utils":108,"./reference":105}],104:[function(require,module,exports){
var utils = require('../utils')

var StructNumber = module.exports = function(read, write, length) {
  this.methods = { read: read, write: write }
  Object.defineProperties(this, {
    _offset: { value: null, writable: true },
    _length: { value: null, writable: true }
  })
  utils.options.call(this, length)
}

StructNumber.prototype.with = function(opts) {
  if (!opts.length) opts.length = this._length
  return new StructNumber(this.methods.read, this.methods.write, opts)
}

StructNumber.prototype.from = function(offset) {
  return this.with({ external: true, offset: offset })
}

StructNumber.prototype.read = function read(buffer, offset) {
  var parent = read.caller.parent
  return buffer[this.methods.read](this.external ? this.offsetFor(parent) : offset)
}

StructNumber.prototype.write = function write(buffer, offset, value) {
  var parent = write.caller.parent
  buffer[this.methods.write](this.external ? this.offsetFor(parent) : offset, value)
}

StructNumber.prototype.lengthFor = function() {
  return 1
}

StructNumber.prototype.sizeFor = function() {
  return this._length
}

utils.methodsFor(StructNumber.prototype, '_offset', 'offsetFor', 'setOffset')
},{"../utils":108}],105:[function(require,module,exports){
var StructReference = module.exports = function(prop) {
  this.prop = prop
}
},{}],106:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')
  , StructArray     = require('./array')

var StructStorage = module.exports = function(path, opts) {
  this.path = path
  if (opts instanceof StructReference) 
    opts = { offset: opts }
  opts = opts || {}
  Object.defineProperties(this, {
    _offset: { value: opts.offset, writable: true }
  })
}

StructStorage.prototype.read = function read(view, offset) {
  var parent = read.caller.parent
    , shift  = this.offsetFor(parent) || offset
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      target[step] = type.read(view, shift)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
}

StructStorage.prototype.write = function write(view, offset, _, relativeOffset) {
  var parent = write.caller.parent, shift = 0
  this.setOffset(relativeOffset, parent)
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      type.setOffset(shift, target)
      var value = target[step], target = type.prototype ? target[step] : target
      type.write(view, offset, value, relativeOffset)
      shift += type.lengthFor(target, true) * type.sizeFor(target, true)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
}

StructStorage.prototype.lengthFor = function() {
  return 1
}

StructStorage.prototype.sizeFor = function(parent, writing) {
  var size = 0
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      if (type.prototype) target = target[step]
      size += type.lengthFor(target, writing) * type.sizeFor(target, writing)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
  return size
}

utils.methodsFor(StructStorage.prototype, '_offset', 'offsetFor', 'setOffset')
},{"../utils":108,"./array":102,"./reference":105}],107:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')

var StructString = module.exports = function(length) {
  Object.defineProperties(this, {
    _offset: { value: null, writable: true },
    _length: { value: null, writable: true },
    _size:   { value: null, writable: true }
  })
  utils.options.call(this, length)
}

StructString.prototype.read = function read(buffer, offset) {
  var str = [], storage, parent = read.caller.parent
    , shift = this.external
      ? this.offsetFor(parent)
      : (this.storage ? offset + this.offsetFor(parent) : offset)
  for (var i = 0, len = this.lengthFor(parent), step = this.sizeFor() === 2 ? 2 : 1; i < len; ++i) {
    str.push(buffer[this.sizeFor() === 2 ? 'getUint16' : 'getUint8'](shift + i * step, this.littleEndian))
  }
  return String.fromCharCode.apply(null, str)
}

StructString.prototype.write = function write(buffer, offset, value) {
  var str = [], storage, parent = write.caller.parent
    , shift = this.external
      ? this.offsetFor(parent)
      : (this.storage ? offset + this.offsetFor(parent) : offset)
  this.setLength(this.lengthFor(parent, true), parent)
  for (var i = 0, len = this.lengthFor(parent), step = this.sizeFor() === 2 ? 2 : 1; i < len; ++i) {
    var code = value.charCodeAt(i) || 0x00
    buffer[this.sizeFor() === 2 ? 'setUint16' : 'setUint8'](shift + i * step, code, this.littleEndian)
  }
}

StructString.prototype.sizeFor = function() {
  return this._size || 1
}

StructString.prototype.lengthFor = function(parent, writing) {
  if (this._length instanceof StructReference) {
    if (writing) return parent[this.prop].length
    return parent[this._length.prop]
  }
  return this._length || 0
}

StructString.prototype.setLength = function(value, parent) {
  if (this._length instanceof StructReference)
    parent[this._length.prop] = value
  else this._length = value
}

utils.methodsFor(StructString.prototype, '_offset',  'offsetFor', 'setOffset')

},{"../utils":108,"./reference":105}],108:[function(require,module,exports){
var StructReference = require('./types/reference')

exports.methodsFor = function(obj, prop, get, set) {
  obj[get] = function(parent) {
    if (!this[prop]) return 0
    if (this[prop] instanceof StructReference)
      return parent[this[prop].prop]
    else if (typeof this[prop] === 'function')
      return this[prop].call(parent)
    return this[prop]
  }
  if (!set) return
  obj[set] = function(value, parent) {
    if (this[prop] instanceof StructReference)
      parent[this[prop].prop] = value
    else this[prop] = value
  }
}

exports.options = function(opts) {
  if (typeof opts === 'object') {
    this._offset      = opts.offset
    this._length      = opts.length
    this._size        = opts.size
    this.$unpacked    = opts.$unpacked
    this.$packing     = opts.$packing
    this.external     = opts.external === true
    this.storage      = opts.storage
    this.littleEndian = opts.littleEndian === true
  } else {
    this._length  = opts
  }
}
},{"./types/reference":105}],109:[function(require,module,exports){
module.exports={
  "name": "pdfjs",
  "author": {
    "name": "Markus Ast",
    "email": "npm.m@rkusa.st"
  },
  "version": "0.8.0",
  "homepage": "https://github.com/rkusa/pdfjs",
  "description": "A Portable Document Format (PDF) generation library targeting both the server- and client-side.",
  "keywords": [
    "pdf",
    "generator"
  ],
  "license": "MIT",
  "main": "lib/index",
  "scripts": {
    "test": "tap strict test/index.js",
    "bundle": "browserify lib/index.js --standalone pdfjs --detect-globals false > pdfjs.js",
    "prepublish": "npm run bundle && uglifyjs --source-map pdfjs.min.map -o pdfjs.min.js pdfjs.js"
  },
  "dependencies": {
    "base-64": "^0.1.0",
    "debug": "^2.1.1",
    "linebreak": "^0.2.0",
    "node-uuid": "^1.4.1",
    "ttfjs": "rkusa/ttfjs"
  },
  "devDependencies": {
    "brfs": "^1.2.0",
    "browserify": "^8.1.1",
    "glob": "^4.3.5",
    "tap": "^0.5.0",
    "uglify-js": "^2.4.16"
  },
  "bugs": "https://github.com/rkusa/pdfjs/issues",
  "repository": {
    "type": "git",
    "url": "git://github.com/rkusa/pdfjs.git"
  },
  "engines": {
    "node": ">=0.8"
  }
}

},{}]},{},[16])(16)
});