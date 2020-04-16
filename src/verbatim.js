'use strict';

const Verbatim = function(text)
{
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
