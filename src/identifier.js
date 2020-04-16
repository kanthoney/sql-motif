'use strict';

const Identifier = function(name)
{
  if(!new.target) {
    return new Identifier(name);
  }
  this.name = name;
};

module.exports = Identifier;
