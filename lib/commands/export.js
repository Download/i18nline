import fs from "fs";
import mkdirp from "mkdirp";
import Check from "./check";
import I18nline from '../../lib/i18nline';

function Export(options) {
  Check.call(this, options);
}

Export.prototype = Object.create(Check.prototype);
Export.prototype.constructor = Export;

Export.prototype.run = function() {
  this.log.log(this.log.name + ': export', this.options)
  var success = Check.prototype.run.call(this);
  var locale = 'en';
  var translations = {};
  translations[locale] = this.translations.translations;
  this.outputFile = I18nline.config.basePath + '/' + (this.options.outputFile || "config/locales/generated/" + locale + ".json");
  mkdirp.sync(this.outputFile.replace(/\/[^\/]+$/, ''));
  if (success) {
    fs.writeFileSync(this.outputFile, JSON.stringify(translations));
    this.log.info("Wrote default translations to " + this.outputFile + "\n");
  }
  return success;
};

export default Export;
