# i18nline
### Keep your translations in line

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
that attempts to simplify usage by adding:
* Sensible defaults
* Auto-configuration of plugins
* Improved documentation
* CLI `help` command shows man page for the CLI
* CLI `index` command generates an *index.js* file you can import
* CLI `synch` command synchs all internationalization files
Basically Jon did all the hard work and this project is just adding lots 
of sugar to make it sweeter.

## Project setup
`i18nline` preprocesses your source files, generating new source files and
translation files based on what it finds. To setup a project you need to:
* Install `i18nline` (see next section).
* Create a `script` in *package.json* to run the command-line tool.
* Import `I18n` and use `I18n.t()` to render internationalized text.
* Create an empty file in the `out` folder (by default: `'src/i18n'`) named 
  `'[locale].json'` for each locale you want to support.
* Run `i18nline export` to synch the translation files and index file.
* `import` the index file into your project.
* Call `I18n.changeLocale` to set the locale (which loads the right 
  translation file on demand)
* Call `I18n.on` to react to the `'change'` event (e.g. by re-rendering)
* Get your translators to translate all the messages.

## Installation

```sh
npm install --save i18nline
```

i18nline has a dependency on i18n-js, so it will be installed automatically. 

## Create a `script` to run the command-line tool
`i18nline` comes with a command-line tool. This tool is written in Javascript
and can be executed by Node JS. All you need to do to be able to use it is
expose it via a `script` in your *package.json* (recommended), or install 
`i18nline` globally using the `-g` flag for `npm install`. The recommended
approach is via a `script` in *package.json* because this means you only need
to install `i18nline` as a normal dependency of your project.

Add a script with the command `i18nline export` to *package.json*:

```json
{
  "scripts": {
    "i18n": "i18nline export"
  }
}
```

You can now invoke this command using `npm run`:

```sh
$ npm run i18n
```

Alternatively, you can expose the raw command: 

```json
{
  "scripts": {
    "i18nline": "i18nline"
  }
}
```

Then pass arguments via `npm run`:

```sh
$ npm run i18nline -- export
```

The extra dashes here are used to tell `npm run` that all arguments following 
the dashes should be passed on to the script.

## Import `I18n` and use `I18n.t()` to render internationalized text.

i18nline adds some extensions to the i18n-js runtime. If you require i18n-js 
via i18nline, these will be added automatically for you:

```js
var I18n = require('i18nline');
// Ready to rock!
```

Alternatively, you can add i18n to your app any way you like and apply the 
extensions manually:

```js
var I18n = // get it from somewhere... script tag or whatever
// add the runtime extensions manually
require('i18nline/lib/extensions/i18n_js')(I18n);
```

Every file that needs to translate stuff needs to get access to the `I18n` 
object somehow. You can add a require call to every such file (recommended), 
use `I18n` from the global sope, use some Webpack loader to add the import 
or whatever. The choice is yours.

Once `I18n` is available, you can use its `I18n.t()` function to render
internationalized text:

```js
console.info(I18n.t('This text will be internationalized'));
```

> i18nline will preprocess your source, extracting all calls to `I18n.t`. For this
reason, you should not rename the `I18n` object, or alias the method etc.

## Create an empty file for each locale
Adding support for a locale is as simple as adding an empty file
named `'[locale].json'` to the `out` folder and running `i18nline synch`.
You still need to translate the text of course! 

> If you use Webpack with Hot Module Replacement (HMR) enabled, you can
change the translations while your app is running and the changes will
be picked up automatically. 

## Run `i18nline export` to synch the translation files
Using the script you created before, run `i18nline export`:

```sh
$ npm run i18n
```

This will create/synch a bunch of files in the `out` folder:
* `default.json`: Contains the default translations extracted from the source code
* `en.json`: Contains the messages for the default locale (assuming that is `'en'`)
* `de.json`: Assuming you added an empty file `de.json`, it will be synched by `i18nline`.
* `index.js`: Index file that you can import into your project.

> The files `default.json` and `index.js` are regenerated every time, so don't change
them as your changes will get lost. The translation files for the different locales
are synched in a smart way, so any changes there will be respected.

## `import` the index file into your project.
Since version 2, `i18nline` features an `index` command (which is also run 
as part of the `synch` command) that generates an index file containing the 
Javascript code needed to load the translation files into your project. 

The generated file uses dynamic `import()` statements to allow Webpack and 
other bundlers to perform code splitting, making sure that each translation 
file ends up in a separate Javascript bundle. Also, it adds support for 
Webpacks Hot Module Replacement.

> You need to use a transpiler like [Babel](https://babeljs.io/) in 
combination with a bundler like [Webpack](https://webpack.js.org/) to 
take advantage of the code splitting and hot reloading features that the 
generated index file uses. If your tool chain does not support ES2015+ with 
dynamic `import()`, you cannot use the generated index file and need to load 
the translations yourself somehow. Just make sure you assign the loaded 
translations to `I18n.translations`.

To import the index file, simply `require` or `import` it:

*some file in the root of src/*
```js
var I18n = require(`./i18n`); 
// or
import I18n from './i18n';
```

This will add a method `I18n.import` to the regular `I18n` object, 
with the code in it to load the translations for the given locale. 
If you inspect the contents of `index.js`, you will find that it 
contains a switch statement with similar code to load each file. 
That may seem redundant, but it is needed so that all the `import()` 
statements are statically analyzable, allowing the bundler to 
determine which files to include in the bundles it generates. You 
don't actually need to call the `I18n.import()` method yourself. 
It is called automatically when you use `I18n.changeLocale` 
(see next section).

## Call `I18n.changeLocale` to change the locale
`i18nline` adds a method `changeLocale` to `I18n` that uses the 
method `I18n.import` (found in the generated index file) to load the 
translations for the locale when needed. So call `changeLocale` in 
your code to change the locale and the translation files will be 
loaded automatically when needed.

```js
I18n.changeLocale('de');
```

## Call `I18n.on` to react to the `'change'` event
`i18nline` uses [uevents](https://npmjs.com/package/uevents) to turn `I18n` 
into an event emitter. Whenever the locale or the translations for a 
locale have changed, `i18nline` emits a `'change'` event. You can add a 
listener for this event like so:

```js
I18n.on('change', locale => {
  // the locale changed to the given locale, or the translations for the
  // given locale changed. React accordingly, e.g. by re-rendering
});
```

The docs for the [Node JS Events API](https://nodejs.org/api/events.html) 
explain how to remove listeners and perform other bookkeeping operations 
on event emitters.

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

Sure, but *you* don't need to write them. Just run `i18nline export` 
to extract all default translations from your codebase and output them to 
`src/i18n/default.json` In addition, any translation files already present
in the `out` folder are synched: any keys no longer present in the source
are removed and any new keys are added. Finally this outputs an index file
named `index.js` that you can `import` in your app.

### It's okay to lose your keys

Why waste time coming up with keys that are less descriptive than the 
default translation? i18nline makes keys optional, so you can just do this:

```javascript
I18n.t("My Account")
```

i18nline will create a unique key based on the translation (e.g.
`'my_account'`), so you don't have to. 
See [inferredKeyFormat](#inferredkeyformat) for more information.

This can actually be a **good thing**, because when the `default` 
translation changes, the key changes, which means you know you need 
to get it retranslated (instead of letting a now-inaccurate 
translation hang out indefinitely). 

If you are changing the meaning of the default translation, e.g.
by changing "Enter your username and password to log in" to 
"Enter your e-mail address and password to log in", you should make 
the change in the source code to force a re-translation for all 
languages. If you are just changing the wording of the message, 
e.g. by changing "Enter your username and password to log in" to 
"Enter your username and password to sign in", you can make the
change in the translation file `en.js` instead, so other languages
are not affected. 

> Never change the file `default.json`, it is intended to 
accurately reflect the text that was extracted from the program
source and as such it is always regenerated and not synched.

### Wrappers

Suppose you have something like this in your JavaScript:

```javascript
var string = 'You can <a href="/new">lead</a> a new discussion or \
  <a href="/search">join</a> an existing one.';
```

You might say "No, I'd use handlebars". Bear with me here, we're 
trying to make this easy for you *and* the translators :). 
For I18n, you might try something like this:

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

This isn't much better, because now you have HTML in your translations. 
If you want to add a class to the link, you have to go update all the
translations. A translator could accidentally break your page (or worse, 
cross-site script it).

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

For most projects, no configuration should be needed. 
The default configuration should work without changes, unless:

* You have source files in a directory that is in the default 
  `ignoreDirectories`, or in the root of your project (not recommended)
* You have source files that don't match the default `patterns`
* You need the output to go some place other than the default 
  `out` folder of `'src/i18n/'`
* You have i18nline(r) `plugins` you want to configure that are 
  not recognized by the auto-configuration feature

If you find you need to change the configuration, you can configure 
i18nline through *package.json*, *i18nline.rc* or command line arguments.

If multiple sources of configuration are present, they will be 
applied in this order, with the last option specified overwriting
the previous settings:

* Defaults
* package.json
* .i18nrc file
* CLI arguments

In your *package.json*, create a key named `"i18n"` and 
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

For your convenience, this is the default configuration that will
be used if you supply no custom configuration:

```json
{
  "basePath": ".",
  "ignoreDirectories": ["node_modules", "bower_components", ".git", "dist", "build"],
  "patterns": ["**/*.js", "**/*.jsx"],
  "ignorePatterns": [],
  "out": "src/i18n",
  "inferredKeyFormat": "underscored_crc32",
  "underscoredKeyLength": 50,
  "defaultLocale": "en",
}
```

### Options 

#### basePath
String. Defaults to `"."`. 
The base path (relative to the current directory). `out`, 
`directories`, `ignoreDirectories`, `patterns`, `ignorePatterns` 
and any ignore patterns coming from `.i18nignore` files are 
interpreted as being relative to `basePath`.

#### directories
Array of directories, or a String containing a comma separated 
list of directories. Defaults to `undefined`. 
Only files in these directories will be processed.  

> If no directories are specified, the i18nline CLI will try to 
auto-configure this setting with all directories in `basePath` 
that are not excluded by `ignoreDirectories`. This mostly works
great, but if you have source files in the root of your project,
they won't be found this way. Set `directories` to `"."` to force
the processing to start at the root (not recommended as it may
be very slow).

#### ignoreDirectories
Array of directories, or a String containing a comma separated 
list of directories. Defaults to `['node_modules', 'bower_components', '.git', 'dist']`. 
These directories will not be processed.  

#### patterns
Array of pattern strings, or a String containing a comma separated 
list of pattern(s). Defaults to `["**/*.js", "**/*.jsx"]`. Only 
files matching these patterns will be processed.  

> Note that for your convenience, the defaults include .jsx files

#### ignorePatterns
Array of pattern strings, or a String containing a comma separated 
list of patterns. Defaults to `[]`. Files matching these patterns
will be ignored, even if they match `patterns`. 

#### out
String. Defaults to `'src/i18n'`. 
In case `out` ends with `'.json'`, the `export` command will export 
the default translations to this file and the `synch` command will
just perform an export. Otherwise, `out` is interpreted as a folder 
to be used by the `synch` command to synch the translations and the
file with the default translations will be named `default.json`.

#### outputFile
String. Alias for `out`. **deprecated**.
In previous versions of `i18nline`, `outputFile` was used to 
indicate where to export the default translations. However,
starting with version 2, `i18nline` now supports synching the 
entire translations folder, so `out` is preferred to be set 
to a folder, making the name `outputFile` confusing. As long as
your outputFile is set to some path ending in `'.json'`, your 
old configuration will continue to work for all versions in the 
2.x branch, but may stop working at version 3+. If you relied
on the default, consider adopting the new default filename of
`default.json` i.s.o. `en.json`, or explicitly set `out` to 
`'i18n/en.json'` (the old default, not recommended). 
When you set this option, a deprecation warning is logged.

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
codebase. If `out` ends with `'.json'`, it then outputs just the default 
translations to the configured file. Otherwise it assumes `out` is a folder 
and saves the default translations in this folder in a file named `default.json`.
It then reads all translation files present in the folder (expected to be 
named `'[locale].json'`) and synchs them, removing keys that are no longer 
in use and adding new keys with their value set to the default translation 
for that key. If no translation file for the default locale (normally `'en'`)
is found it generates one. Finally, it generates an index file names `index.js` 
that you can `import` into your project and that takes care of (hot re-)loading 
the individual translations when needed.

Adding support for a new locale can be done by adding an empty file for that 
locale and running `i18nline export` so it will populate the new file with all 
default translations.

### i18nline help 

Prints this message:

```
  ██╗   ███╗   ██╗██╗     ██╗███╗   ██╗███████╗
  ██║   ████╗  ██║██║     ██║████╗  ██║██╔════╝
  ██║18 ██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗
  ██║   ██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝
  ██║   ██║ ╚████║███████╗██║██║ ╚████║███████╗
  ╚═╝   ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
         keep your translations in line

Usage

i18nline <command> [options]

Commands

check       Performs a dry-run with all checks, but does not write any files
export      Performs a check, then exports the default translation file
index       Generates an index file you can import in your program
synch       Synchronizes all generated files with the source code
help        Prints this help screen

Options

You can set/override all of i18nline's configuration options on the command line.
SEE: https://github.com/download/i18nline#configuration
In addition these extra options are available in the CLI:

-o          Alias for --out (SEE config docs)
--only      Only process a single file/directory/pattern
--silent    Don't log any messages
-s          Alias for --silent

Examples

$ i18nline check --only=src/some-file.js
> Only check the given file for errors

$ i18nline export --directory=src --patterns=**/*.js,**/*.jsx
> Export all translations in `src` directory from .js and .jsx files
> to default output file src/i18n/default.json

$ i18nline export -o=translations
> Export all translations in any directory but the ignored ones, from
> .js and .jsx files to the given output file translations/default.json

See what's happening

i18nline uses ulog for it's logging. The default level is info. To change it:
$ LOG=debug   (or trace, log, info, warn, error)
Now, i18nline will log any messages at or above the set level
```

#### .i18nignore and more

By default, the check and export commands will look for inline translations
in any .js files. You can tell it to always skip certain files/directories/patterns 
by creating a .i18nignore file. The syntax is the same as 
[.gitignore](http://www.kernel.org/pub/software/scm/git/docs/gitignore.html),
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

Copyright (c) 2018 Stijn de Witt & Jon Jensen,
released under the MIT license
