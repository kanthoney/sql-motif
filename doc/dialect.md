# dialects

The `Dialect` class is a base class whic produces a generic version of SQL which can be subclassed to produce different dialects.

## Construction

The constructor takes an options argument, which is an object with the following members:

* `quotes`. A string containing the quote characters used. Can contain a left and right quote character if different. Defaults to `'`.

* `idQuotes`. A string containing quote characters for quoting identifiers. Can contain left and right quote characters, e.g. `'[]'`. Defaults to `"`.

* `escapeChars`. A string of the characters that need to be escaped. Defaults to the backslash character `\` plus the `quotes` and `idQuotes` characters.

* `likeChars`. A string with special characters for `like`. Defaults to `'%_'`.

## Overridable methods

* `libraryEscape(s)` Provides a default escape function. Can be replaced with one that uses the escape function from a library. The default function escapes the dialect's escape characters
with a backslash, unless the backslash is followed by a `like` special character.
