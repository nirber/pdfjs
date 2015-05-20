'use strict'

var PDFObject     = require('./object')
var PDFArray      = require('./array')
var PDFStream     = require('./stream')
var PDFDictionary = require('./dictionary')
var PDFString     = require('./string')
var PDFName       = require('./name')

var utils = require('../utils')

var PDFFont = module.exports = function(id, font) {
  this.alias = new PDFName('F' + id)

  this.font = font.font
  this.subset = font.subset()
  this.subset.use(' ')

  var head = this.font.tables.head

  var flags = 0, familyClass = (this.font.tables.os2.sFamilyClass || 0) >> 8
  var isSerif = !!~[1, 2, 3, 4, 5, 6, 7].indexOf(familyClass)
  var isFixedPitch = this.font.tables.post.isFixedPitch
  var italicAngle = this.font.tables.post.italicAngle
  if (isFixedPitch)                  flags |= 1 << 0
  if (isSerif)                       flags |= 1 << 1
  if (familyClass === 10)            flags |= 1 << 3
  if (italicAngle !== 0)             flags |= 1 << 6
  /* assume not being symbolic */    flags |= 1 << 5

  // font descriptor
  this.descriptor = new PDFObject('FontDescriptor')
  this.descriptor.prop('FontName', this.subset.name)
  this.descriptor.prop('Flags', flags)
  this.descriptor.prop('FontBBox', new PDFArray([
    head.xMin, head.yMin, head.xMax, head.yMax
  ]))
  this.descriptor.prop('ItalicAngle', italicAngle)
  this.descriptor.prop('Ascent', this.font.tables.os2.sTypoAscender)
  this.descriptor.prop('Descent', this.font.tables.os2.sTypoDescender)
  this.descriptor.prop('CapHeight', this.font.tables.os2.sTypoLineGap)
  this.descriptor.prop('StemV', 0)

  this.descendant = new PDFObject('Font')
  this.descendant.prop('Type', 'CIDFont')
  this.descendant.prop('Subtype', 'CIDFontType0')
  this.descendant.prop('BaseFont', this.font.familyName)
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
  this.prop('BaseFont', this.font.familyName)
  this.prop('Encoding', 'Identity-H')
  this.prop('DescendantFonts', new PDFArray([
    this.descendant.toReference()
  ]))
}

utils.inherits(PDFFont, PDFObject)

PDFFont.prototype.encode = function(str) {
  this.subset.use(str)
  return this.subset.encode(str)
}

PDFFont.prototype.embed = function(doc) {
  var scaleFactor = 1000.0 / this.subset.font.unitsPerEm

  // widths array
  var metrics = [], codeMap = this.subset.cmap()
  for (var code in codeMap) {
    if (code < 32) continue
    var width = Math.round(this.subset.glyphs[code].advanceWidth * scaleFactor)
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
    if (code < 32) continue
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
  file.object.prop('Subtype', 'CIDFontType0C')
  file.object.prop('Length', hex.length + 1)
  file.object.prop('Length1', data.byteLength)
  file.object.prop('Filter', 'ASCIIHexDecode')
  file.content = hex + '>\n'

  this.descriptor.prop('FontFile3', file.toReference())

  doc.addObject(this)
  doc.addObject(this.descriptor)
  doc.addObject(this.descendant)
}
