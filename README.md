# i18nline
### Keep your translations in line

[![npm](https://img.shields.io/npm/v/ulog.svg)](https://npmjs.com/package/ulog)
[![license](https://img.shields.io/npm/l/ulog.svg)](https://creativecommons.org/licenses/by/4.0/)
[![travis](https://img.shields.io/travis/Download/ulog.svg)](https://travis-ci.org/Download/ulog)
[![greenkeeper](https://img.shields.io/david/Download/ulog.svg)](https://greenkeeper.io/)
![mind BLOWN](https://img.shields.io/badge/mind-BLOWN-ff69b4.svg)


```
  ██╗    ███╗   ██╗██╗     ██╗███╗   ██╗███████╗
  ██║    ████╗  ██║██║     ██║████╗  ██║██╔════╝
  ██║ 18 ██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗
  ██║    ██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝
  ██║    ██║ ╚████║███████╗██║██║ ╚████║███████╗
  ╚═╝    ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
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

This project is a fork of Jon Jensen's [i18nline-js](https://github.com/jenseng/i18nline-js) 
that applies some long open PR, adds some logging (powered by [ulog](https://npmjs.com/package/ulog)),
a help screen for the CLI and some auto-config. I'm hoping any changes I make in this fork will 
eventually be merged back into the main project but for now I need these changes.

## Installation

To install the command-line tools (for extracting/managing
translations), use npm (see below).

Depending on how you manage JavaScript dependencies in your app, you have
several options for installing/including the runtime extensions:

### regular old script

Download the [runtime extensions](https://github.com/download/i18nline/blob/master/build/i18n_js_extension.js)
and include them on the page after i18n.js (via `<script>`, asset pipeline, etc).

### npm

```sh
npm install -S i18n-js i18nline
```

```javascript
var I18n = require('i18n-js');
// add the runtime extensions
require('i18nline/dist/lib/extensions/i18n_js')['default'](I18n);
```

### amd

Download the [runtime extensions](https://github.com/download/i18nline/blob/master/build/i18n_js_extension.js)
and use the requirejs shim config to add them (and i18n.js) to your app, e.g.

```javascript
requirejs.config({
  shims: {
    'i18n': 'I18n',
    'i18n_js_extension': {
      deps: 'i18n',
      exports: 'I18n'
    }
  }
})
```

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
to `config/locales/generated/en.json`

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

## Command Line Utility

### i18nline check

Ensures that there are no problems with your translate calls (e.g. missing
interpolation values, reusing a key for a different translation, etc.). **Go
add this to your Jenkins/Travis tasks.**

### i18nline export

Does an `i18nline check`, and then extracts all default translations from your
codebase, merges them with any other translation files, and outputs them to
`locales/generated/translations.json` (or `.js`).

### i18nline diff

Does an `i18nline export` and creates a diff from a previous one (path or git
commit hash). This is useful if you only want to see what has changed since a
previous release of your app.

### i18nline import

Imports a translated .json/.js file. Ensures that all placeholders and
wrappers are present.

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

i18nline is backwards compatible with i18n.js, so you can add it to an
established (and already internationalized) app. Your existing
translation calls, keys and translation files will still just work without modification.

## Related Projects

* [i18nline (ruby)](https://github.com/jenseng/i18nline)
* [i18nline-js](https://github.com/jenseng/i18nline-js)
* [i18nline-handlebars](https://github.com/fivetanley/i18nline-handlebars)
* [react-i18nline](https://github.com/jenseng/react-i18nline)
* [preact-i18nline](https://github.com/download/preact-i18nline)

## License

Copyright (c) 2016 Stijn de Witt && Jon Jensen, 
released under the MIT license
