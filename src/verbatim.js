'use strict';
const Column = require('./column');

const Verbatim = function(text)
{
  if(text === null || text === undefined || text instanceof Column) {
    return text;
  }
  if(!new.target) {
    return new Verbatim(text);
  }
  this.text = text;
  return this;
}

Verbatim.prototype.toString = function()
{
  return this.text;
}

module.exports = Verbatim;
