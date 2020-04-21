'use strict';

const DB = require('./sqlite/db');
const dialects = require('../src/dialects');
require('./db')('sqlite', dialects.sqlite, new DB);
