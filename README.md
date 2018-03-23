# i18nline
### Keep your translations in line

[![Greenkeeper badge](https://badges.greenkeeper.io/Download/i18nline.svg)](https://greenkeeper.io/)

[![npm](https://img.shields.io/npm/v/i18nline.svg)](https://npmjs.com/package/i18nline)
[![license](https://img.shields.io/npm/l/i18nline.svg)](https://github.com/download/i18nline/LICENSE)
[![travis](https://img.shields.io/travis/Download/i18nline.svg)](https://travis-ci.org/Download/i18nline)
[![greenkeeper](https://img.shields.io/david/Download/i18nline.svg)](https://greenkeeper.io/)
![mind BLOWN](https://img.shields.io/badge/mind-BLOWN-ff69b4.svg)


```
  ██╗   ███╗   ██╗██╗     ██╗███╗   ██╗███████╗
  ██║   ████╗  ██║██║     ██║████╗  ██║██╔════╝
  ██║18 ██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗
  ██║   ██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝
  ██║   ██║ ╚████║███████╗██║██║ ╚████║███████╗
  ╚═╝   ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
         KEEP YOUR TRANSLATIONS IN LINE
```

No .js/yml translation files. Easy inline defaults. Optional keys. Easy
pluralization. Wrappers for HTML-free translations.

I18nline extends [i18n-js](https://github.com/fnando/i18n-js), so you can
add it to an already-internationalized app that uses it.

## TL;DR

i18nline lets you do stuff like this:

```javascript
I18n.t("Ohai %{user}, my default translation is right here in the code. \
  Inferred keys, oh my!", {user: user.name});
```

and this:

```javascript
I18n.t("*Translators* won't see any markup!",
  {wrappers: ['<a href="/translators">$1</em>']});
```

Best of all, you don't need to maintain translation files anymore;
i18nline will do it for you.

## What is this?

This project is a fork of Jon Jensen's 
[i18nline-js](https://github.com/jenseng/i18nline-js)
that applies some long open PR, adds some logging 
(powered by [ulog](https://npmjs.com/package/ulog)),
a help screen for the CLI and some auto-config. 

## Installation

```sh
npm install --save-dev i18nline
```

i18nline has a dependency on i18n-js, so it will be installed automatically. i18nline adds some
extensions to the i18n-js runtime. If you require i18n-js via i18nline, these will be added 
automatically for you:

```js
var I18n = require('i18nline/lib/i18n');
// Ready to rock!
```

Alternatively, you can add i18n to your app any way you like and apply the extensions manually:

```js
var I18n = // get it from somewhere... script tag or whatever
// add the runtime extensions manually
require('i18nline/lib/extensions/i18n_js')(I18n);
```

Every file that needs to translate stuff needs to get access to the `I18n` object somehow. 
You can either add a require call to every such file, or use `I18n` from the global sope. 
The choice is yours.


## Features

### No more .js/.yml translation files

Instead of maintaining .js/.yml files and doing stuff like this:

```javascript
I18n.t('account_page_title');
```

Forget the translation file and just do:

```javascript
I18n.t('account_page_title', "My Account");
```

Regular I18n options follow the (optional) default translation, so you can do
the usual stuff (placeholders, etc.).

#### Okay, but don't the translators need them?

Sure, but *you* don't need to write them. Just run:

```bash
i18nline export
```

This extracts all default translations from your codebase and outputs them 
to `i18n/en.json`

### It's okay to lose your keys

Why waste time coming up with keys that are less descriptive than the default
translation? i18nline makes keys optional, so you can just do this:

```javascript
I18n.t("My Account")
```

i18nline will create a unique key based on the translation (e.g.
`'my_account'`), so you don't have to. See `i18nline.inferred_key_format` for
more information.

This can actually be a **good thing**, because when the `en` changes, the key
changes, which means you know you need to get it retranslated (instead of
letting a now-inaccurate translation hang out indefinitely). Whether you want
to show "[ missing translation ]" or the `en` value in the meantime is up to
you.

### Wrappers

Suppose you have something like this in your JavaScript:

```javascript
var string = 'You can <a href="/new">lead</a> a new discussion or \
  <a href="/search">join</a> an existing one.';
```

You might say "No, I'd use handlebars". Bear with me here, we're trying to
make this easy for you *and* the translators :). For I18n, you might try
something like this:

```javascript
var string = I18n.t('You can %{lead} a new discussion or %{join} an \
  existing one.', {
    lead: '<a href="/new">' + I18n.t('lead') + '</a>',
    join: '<a href="/search"> + 'I18n.t('join') + '</a>')
  });
```

This is not great, because:

1. There are three strings to translate.
2. When translating the verbs, the translator has no context for where it's
   being used... Is "lead" a verb or a noun?
3. Translators have their hands somewhat tied as far as what is inside the
   links and what is not.

So you might try this instead:

```javascript
var string = I18n.t('You can <a href="%{leadUrl}">lead</a> a new \
  discussion or <a href="%{joinUrl}">join</a> an existing one.', {
    leadUrl: "/new",
    joinUrl: "/search"
  });
```

This isn't much better, because now you have HTML in your translations. If you
want to add a class to the link, you have to go update all the translations.
A translator could accidentally break your page (or worse, cross-site script
it).

So what do you do?

i18nline lets you specify wrappers, so you can keep HTML out the translations,
while still just having a single string needing translation:

```javascript
var string = I18n.t('You can *lead* a new discussion or **join** an \
  existing one.', {
    wrappers: [
      '<a href="/new">$1</a>',
      '<a href="/search>$1</a>'
    ]
  });
```

Default delimiters are increasing numbers of asterisks, but you can specify
any string as a delimiter by using a object rather than an array.

#### HTML Safety

i18nline ensures translations, interpolated values, and wrappers all play
nicely (and safely) when it comes to HTML escaping. Wrappers are assumed
to be HTML-safe, so everything else that is unsafe will get
automatically escaped. If you are using i18n.js, you can hint that an
interpolation value is already HTML-safe via `%h{...}`, e.g.

```javascript
I18n.t("If you type %{input} you get %h{raw_input}", {input: "<input>", raw_input: "<input>"});
=> "If you type &lt;input&gt; you get <input>"
```

If any interpolated value or wrapper is HTML-safe, everything else will be HTML-
escaped.

### Inline Pluralization Support

Pluralization can be tricky, but i18n.js gives you some flexibility.
i18nline brings this inline with a default translation object, e.g.

```javascript
I18n.t({one: "There is one light!", other: "There are %{count} lights!"},
  {count: picard.visibleLights.length});
```

Note that the `count` interpolation value needs to be explicitly set when doing
pluralization.

If you just want to pluralize a single word, there's a shortcut:

```javascript
I18n.t("person", {count: users.length});
```

This is equivalent to:

```javascript
I18n.t({one: "1 person", other: "%{count} people"},
  {count: users.length});
```

## Configuration

In your `package.json`, create an object named `"i18n"` and 
specify your project's global configuration settings there.

*package.json*
```json
{
  "name": "my-module",
  "version": "1.0.0",
  
  "i18n": {
    "settings": "go here"
  }
}
```

> If i18nline detects that your project is using 
[pkgcfg](https://npmjs.com/package/pkgcfg), it will load 
`package.json` using it, enabling all dynamic goodness. 

Or, if you prefer, you can create a `.i18nrc` options file in the root
of your project. 

You can also pass some configuration options directly to the CLI.

If multiple sources of configuration are present, they will be 
applied in this order, with the last option specified overwriting
the previous settings:

* Defaults
* package.json
* .i18nrc file
* CLI arguments

For most projects, no configuration should be needed. The default 
configuration should work without changes, unless:

* You have source files in a directory that is in the default `ignoreDirectories`, 
  or in the root of your project (not recommended).
* You have source files that don't match the default `patterns`
* You need the output to go some place other than the default `outputFile`
* You have i18nline(r) `plugins` that you want to configure

The typical configuration you'd want for a regular project would look 
something like this:

```json
{
  "outputFile": "my/translations/en.json"
}
```

### Options 

#### basePath
String. Defaults to `"."`. The base path (relative to the current directory).
`directories`, `ignoreDirectories` and `outputFile` are interpreted as being
relative to `basePath`.

#### directories
Array of directories, or a String containing a comma separated 
list of directories. Defaults to `undefined`. 
Only files in these directories will be processed.  

> If no directories are specified, the i18nline CLI will try to 
auto-configure this setting with all directories in `basePath` 
that are not excluded by `ignoreDirectories`. This mostly works
great, but if you have source files in the root of your project,
they won't be found this way. Set `directories` to `"."` to force
the processing to start at the root (not recommended as it may)
be very slow. 

#### ignoreDirectories
Array of directories, or a String containing a comma separated 
list of directories. Defaults to `['node_modules', 'bower_components', '.git', 'dist']`. 
These directories will not be processed.  

#### patterns
Array of pattern strings, or a String containing a (comma separated 
list of) pattern(s). Defaults to `["**/*.js", "**/*.jsx"]`. Only 
files matching these patterns will be processed.  

> Note that for your convenience, the defaults include .jsx files

#### ignorePatterns
Array of pattern strings, or a String containing a (comma separated 
list of) pattern(s). Defaults to `[]`. Files matching these patterns
will be ignored, even if they match `patterns`. 

#### outputFile 
String. Defaults to `'i18n/en.json'`. 
Used when exporting the translations. 

#### inferredKeyFormat
String. Defaults to `"underscored_crc32"`. 
When no key was specified for a translation, `i18nline` will infer one
from the default translation using the format specified here. Available
formats are: `"underscored"` and `"underscored_crc32"`, where the second
form uses a checksum over the whole message to ensure that changes in the
message beyond the `underscoredKeyLength` limit will still result in the
key changing. 

> If `inferredKeyFormat` is set to an unknown format, the unaltered default
translation string is used as the key (not recommended).

#### underscoredKeyLength
Number. Defaults to `50`. The maximum length the inferred `underscored` 
key derived of a message will be. If the message is longer than this
limit, changes in the message will only have an effect on the inferred
key if `inferredKeyFormat` is set to `underscored_crc32`. In that 
case the checksum is appended to the underscored key (separated by an
underscore), making the total max key length `underscoredKeyLength + 9`.


## Command Line Utility

### i18nline check

Ensures that there are no problems with your translate calls (e.g. missing
interpolation values, reusing a key for a different translation, etc.). **Go
add this to your Jenkins/Travis tasks.**

### i18nline export

Does an `i18nline check`, and then extracts all default translations from your
codebase, merges them with any other translation files, and outputs them to
`locales/generated/translations.json` (or `.js`).

### i18nline help 

Prints this message:

```

  ██╗   ███╗   ██╗██╗     ██╗███╗   ██╗███████╗
  ██║   ████╗  ██║██║     ██║████╗  ██║██╔════╝
  ██║18 ██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗
  ██║   ██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝
  ██║   ██║ ╚████║███████╗██║██║ ╚████║███████╗
  ╚═╝   ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
         KEEP YOUR TRANSLATIONS IN LINE

Usage
-----
i18nline command [options]

Commands
--------
check     Performs a dry-run with all checks, but does not write any files
export    Performs a check, then writes the default translation file
help      Prints this help screen

Options
--------
You can set/override all of i18nline's configuration options on the command line.
SEE: https://github.com/download/i18nline#configuration
In addition these extra options are available in the CLI:
-o             Alias for --outputFile (SEE config docs)
--only         Only process a single file/directory/pattern
--silent       Don't log any messages
-s             Alias for --silent

Examples
--------
$ i18nline check --only=src/some-file.js
> Only check the given file for errors

$ i18nline export --directory=src --patterns=**/*.js,**/*.jsx
> Export all translations in `src` directory from .js and .jsx files
> to default output file i18n/en.json

$ i18nline export -o=translations/en.json
> Export all translations in any directory but the ignored ones, from
> .js and .jsx files to the given output file translations/en.json

See what's happening
---------------------
i18nline uses ulog for it's logging, when available. To use it:
$ npm install --save-dev ulog
$ LOG=debug   (or log, info, warn, error)
Now, i18nline will log any messages at or above the set level.
```

#### .i18nignore and more

By default, the check and export tasks will look for inline translations
in any .js files. You can tell it to always skip certain
files/directories/patterns by creating a .i18nignore file. The syntax is the
same as [.gitignore](http://www.kernel.org/pub/software/scm/git/docs/gitignore.html),
though it supports
[a few extra things](https://github.com/jenseng/globby#compatibility-notes).

If you only want to check a particular file/directory/pattern, you can set the
`--only` option when you run the command, e.g.

```bash
i18nline check --only=/app/**/user*
```

## Compatibility

i18nline is compatible with i18n.js, i18nliner-js, i18nliner (ruby) etc so you can 
add it to an established (and already internationalized) app. Your existing
translation calls, keys and translation files will still just work without modification.

If you want to maximize the portability of your code across the I18n ecosystem, you
should avoid including hard dependencies to any particular library in every file. One way
to easily achieve that is to set `I18n` as a global. Another simple way is to make your 
own `i18n.js` file that just requires `'i18nline/i18n'`and sets it on `module.exports`. then
you let all your modules require this file. If you ever want to change 'providers',
you only need to change this file. 

## Related Projects

* [i18nliner (ruby)](https://github.com/jenseng/i18nliner)
* [i18nliner-js](https://github.com/jenseng/i18nliner-js)
* [i18nliner-handlebars](https://github.com/fivetanley/i18nliner-handlebars)
* [react-i18nliner](https://github.com/jenseng/react-i18nliner)
* [preact-i18nline](https://github.com/download/preact-i18nline)

## License

Copyright (c) 2016 Stijn de Witt & Jon Jensen,
released under the MIT license
