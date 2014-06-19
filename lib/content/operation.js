module.exports = function(op) {
  var operation = new Operation(this, op)
  this.children.push(operation)

  return this
}

var Operation = function(doc, op) {
  this.doc = doc
  this.op = op
}

Operation.prototype.render = function(width) {
  this.doc.cursor.contents.writeLine(this.op)
}