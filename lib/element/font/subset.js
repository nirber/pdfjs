var opentype = require('opentype.js')

var Subset = module.exports = function(font) {
  this.name   = 'PDFJS+' + font.familyName
  this.font   = font
  this.glyphs = {
    '0':  this.font.charToGlyph(String.fromCharCode(0)), // notDef glyph
    '32': this.font.charToGlyph(String.fromCharCode(32)), // space
  }
  this.subset  = { '0': 0, '32': 32 }
  this.mapping = { '0': 0, '32': 32 }
  this.pos     = 33
}

Subset.prototype.use = function(chars) {
  for (var i = 0, len = chars.length; i < len; ++i) {
    var code = chars.charCodeAt(i)
    if (code in this.mapping || code < 33) {
      continue
    }

    var glyph = this.font.charToGlyph(chars[i])

    this.subset[this.pos] = code
    this.mapping[code]    = this.pos
    this.glyphs[this.pos] = glyph

    this.pos++
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
  return this.subset
}

Subset.prototype.save = function() {
  var glyphs = []
  for (var pos in this.glyphs) {
    glyphs.push(this.glyphs[pos])
  }
  var font = new opentype.Font({
    familyName: this.name,
    styleName:  this.font.styleName,
    unitsPerEm: this.font.unitsPerEm,
    glyphs:     glyphs
  })
  return font.toBuffer()
}
