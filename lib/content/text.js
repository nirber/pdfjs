var PDFString = require('../objects/string')
  , utils = require('../utils')

module.exports = function(string, opts) {
  var text = new Text(this.doc, opts)
  if (typeof string === 'function') {
    string.call(text, text.textFn)
  } else {
    text.text(string)
  }

  this.children.push(text)

  return text.textFn
}

var Text = module.exports.Text = function(doc, opts) {
  this.doc = doc
  this.opts = opts || {}
  this.children = []
  this.textFn = this.text.bind(this)
  this.textFn.br = this.text.br.bind(this)
  this.textFn.pageNumber = this.text.pageNumber.bind(this)
  this.textFn.opts = this.opts
}

Text.prototype.text = function text(str, opts) {
  if (!str) return this.textFn
  opts = utils.extend(opts || {}, this.opts)
  var font = (opts.font ? this.doc.registerFont(opts.font) : this.doc.defaultFont).fromOpts(opts)
  if (typeof str === 'function') {
    this.children.push(new Word(str, font, opts))
  } else {
    var words = str.toString().replace(/\t/g, ' ').replace(/\r\n/g, '\n').split(/ +|^|$/mg)
    // if (words[0].match(/\.\!\?\,/) && this.children.length)
    //   this.children[this.children.length - 1].content += words.shift()
    words.forEach(function(word) {
      if (!word.length) return
      font.use(word)
      this.children.push(new Word(word, font, opts))
    }, this)
  }
  return this.textFn
}

Text.prototype.text.br = function() {
  this.children.push(new Word('\n', this.opts.font ? this.doc.registerFont(opts.font) : this.doc.defaultFont.regular, {
    size: this.opts.size
  }))
  return this.textFn
}

Text.prototype.text.pageNumber = function() {
  this.text(function() {
    if (!this.pages && !this.doc) return
    return (this.pages || this.doc.pages).count
  })
  return this.textFn
}

Text.prototype.end = function(width, context) {
  var self       = this
    , page       = this.doc.cursor
    , spaceLeft  = width
    , finishedAt = this.children.length - 1
    , line       = []
    , self       = this
    , lastFont, lastSize

  function renderLine(line, textWidth, isLastLine) {
    var lineHeight = Math.max.apply(Math, line.map(function(word) {
      return word.height
    }))

    // only a line break
    if (line.length === 1 && line[0].word === '\n') {
      page.cursor.y -= lineHeight * (self.opts.lineSpacing || 1)
      return
    }

    // page break
    if (round(page.spaceLeft) < round(lineHeight)) {
      var left = page.cursor.x
      page = self.doc.pagebreak()
      page.cursor.x = left
      lastFont = undefined
    }

    page.cursor.y -= lineHeight

    var spaceLeft = width - textWidth
      , left = page.cursor.x
      , wordCount = line.length
      , toPrint = ''

    // begin text
    page.contents.writeLine('BT')

    // alignement
    switch (self.opts.align) {
      case 'right':
        left += spaceLeft
        break
      case 'center':
        left += width / 2 - (width - spaceLeft) / 2
        break
      case 'justify':
        if (isLastLine && 100 * spaceLeft / width > 20) break
        var wordSpacing = spaceLeft / (wordCount - 1)
        // set word spacing
        page.contents.writeLine(wordSpacing + ' Tw')
    }

    // position the text in user space
    page.contents.writeLine(left + ' ' + page.cursor.y + ' Td')

    line.forEach(function(word, i) {
      if (word.word === '\n') return
      var str = (i > 0 && !word.isStartingWithPunctuation ? ' ' : '') + word.font.encode(word.word)
        , size = word.opts.size || 10
      if (lastFont !== word.font || lastSize !== size) {
        if (toPrint.length) {
          page.contents.writeLine((new PDFString(toPrint)).toHexString() + ' Tj')
          toPrint = ''
        }
        page.contents.writeLine([word.font.id, size, 'Tf'].join(' '))
        lastFont = word.font
        lastSize = size
        page.useFont(word.font)
      }
      toPrint += str
    })
    if (toPrint.length) {
      page.contents.writeLine((new PDFString(toPrint)).toHexString() + ' Tj')
      toPrint = ''
    }

    page.contents.writeLine('ET')

    page.cursor.y -= lineHeight * ((self.opts.lineSpacing || 1) - 1)
  }

  this.children.forEach(function(word, i) {
    word.context = context || (self.doc.doc || self.doc)
    var wordWidth = word.width, wordSpacing = !line.length || word.isStartingWithPunctuation ? 0 : word.spacing

    if (word.word === '\n' || (line.length > 0 && spaceLeft - (wordWidth + wordSpacing) < 0)) {
      wordSpacing = 0
      if (word.word === '\n') line.push(word)
      renderLine(line, width - spaceLeft, word.word === '\n')
      spaceLeft = width
      line = new Line
      if (word.word === '\n') return
    }

    spaceLeft -= wordWidth + wordSpacing
    line.push(word)
  })

  if (line.length) {
    renderLine(line, width - spaceLeft, true)
  }
}

Object.defineProperties(Text.prototype, {
  maxWidth: {
    enumerable: true,
    get: function() {
      return this.children.map(function(word, i) {
        return word.width + (i === 0 ? word.spacing : 0)
      }).reduce(function(lhs, rhs) {
        return lhs + rhs
      }, 0)
    }
  },
  minHeight: {
    enumerable: true,
    get: function() {
      return Math.max.apply(Math, this.children.map(function(word) {
        return word.height
      }))
    }
  }
})

var Word = function(word, font, opts) {
  this._word = word
  this.font = font
  this.opts = opts || {}
  this.context = {}
  Object.defineProperty(this, 'word', {
    enumerable: true,
    get: function() {
      return this.toString()
    }
  })
}

Object.defineProperties(Word.prototype, {
  width: {
    enumerable: true,
    get: function() {
      return this.font.font.stringWidth(this.word, this.opts.size || 10)
    }
  },
  height: {
    enumerable: true,
    get: function() {
      return this.font.font.lineHeight(this.opts.size || 10, true)
    }
  },
  spacing: {
    enumerable: true,
    get: function() {
      return this.font.font.stringWidth(' ', this.opts.size || 10)
    }
  },
  isStartingWithPunctuation: {
    enumerable: true,
    get: function() {
      if (!this.word[0]) return false
      return this.word[0].match(/\.|\!|\?|,/) !== null
    }
  }
})

Word.prototype.toString = function() {
  if (typeof this._word === 'function') {
    var res = (this._word.call(this.context) || '').toString()
    this.font.use(res)
    return res
  }

  return this._word
}

var Line = function() {
  var line = []
  Object.defineProperty(line, 'lineHeight', {
    enumerable: true,
    get: function() {
      return Math.max.apply(Math, this.map(function(word) {
        return word.height
      }))
    }
  })
  return line
}

function round(num) {
  return Math.round(num * 100) / 100
}