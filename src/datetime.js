'use strict';

const DateTime = function(value)
{
  if(!new.target) {
    return new DateTime(value);
  }
  this.value = value;
  return this;
}

module.exports = DateTime;
