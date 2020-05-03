'use strict';

const DateOnly = function(value)
{
  if(!new.target) {
    return new DateOnly(value);
  }
  this.value = value;
  return this;
}

module.exports = DateOnly;
