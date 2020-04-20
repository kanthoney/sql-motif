'use strict';

class SafetyError extends Error
{
  constructor(col)
  {
    super(`Safety Error - ${col.sql.fullName} column missing from primary key`);
  }
};

module.exports = SafetyError;
