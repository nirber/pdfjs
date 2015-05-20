'use strict'

var opentype = require('opentype.js')
var utils    = require('../../pdf/utils')
var uuid     = require('node-uuid')
var Subset   = require('./subset')

var Font = module.exports = function(src) {
  this.uuid = uuid.v4()
  this.font = opentype.parse(utils.toArrayBuffer(src))
}

Font.prototype.subset = function() {
  return new Subset(this.font)
}

Font.prototype.stringWidth = function(string, size) {
  var scale  = size / this.font.unitsPerEm
  var glyphs = this.font.stringToGlyphs(string)
  var width  = 0

  for (var i = 0, len = glyphs.length; i < len; ++i) {
    var left  = glyphs[i]
    var right = glyphs[i + 1]

    width += left.advanceWidth

    if (right) {
      width += this.font.getKerningValue(left, right)
    }
  }

  return width * scale
}

Font.prototype.lineHeight = function(size, includeGap) {
  if (includeGap == null) includeGap = false

  var gap = includeGap ? this.font.tables.os2.sTypoLineGap : 0
  var ascent = this.font.tables.os2.sTypoAscender
  var descent = this.font.tables.os2.sTypoDescender

  return (ascent + gap - descent) * size / this.font.unitsPerEm
}

Font.prototype.lineDescent = function(size) {
  return this.font.tables.os2.sTypoDescender / 1000 * size
}
