'use strict';

class SafetyError extends Error
{
  constructor()
  {
    super('Safety Error - part of primary key missing');
  }
};

module.exports = SafetyError;
