var
    path   = require('path')
    , fs     = require('fs')
    , through = require('through2')
    , PluginError = require('gulp-util').PluginError
    ;

const
    PLUGIN_NAME = 'gulp-browser-js-include';

var DIRECTIVE_REGEXP = /[\/]{2,}= *(?:require|include) +(\S*).*/g;

function getFileContent(file) {
    if (!fs.existsSync(file) )
        throw new PluginError(PLUGIN_NAME, 'File not found: ' + file);

    return fs.readFileSync(file, { encoding: 'utf8' });
}

function Plugin(options) {
    this.files = [];

    this.mainFile = '';
    this.currFile = '';

    this.options = {
        searchValue: options && options.searchValue ? options.searchValue : null,
        replaceValue: options && options.replaceValue ? options.replaceValue : null
    };

    if (typeof this.options.replaceValue === 'function') {
        this.options.replaceValue = this.options.replaceValue.bind(this);
    }
}

Plugin.prototype.execute = function (file, content) {
    this.files = [];

    this.mainFile = file;
    this.currFile = file;

    return this._processingContent(file, content);
};

Plugin.prototype._processingContent = function (file, content) {
    var self = this;

    if (this.files.indexOf(file) > -1) return '';
    this.files.push(file);
    this.currFile = file;
    if (this.options.searchValue && this.options.replaceValue) {
        content = content.replace(this.options.searchValue, this.options.replaceValue);
    }

    return content.replace(DIRECTIVE_REGEXP, function (match, fileInclude) {
        var fullFileInclude = path.normalize(path.dirname(file) + path.sep + fileInclude);
        return self._processingContent(fullFileInclude, getFileContent(fullFileInclude));
    });
};

function gulpBrowserJsInclude(options) {
    var plugin = new Plugin(options);

    return through.obj(function(file, enc, cb) {
        var content;

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return cb(null, file);
        }

        if (file.isBuffer()) {
            try {
                content = plugin.execute(path.normalize(file.path), file.contents.toString('utf8'));
                file.contents = new Buffer(content);
            } catch (err) {
                this.emit('error', new PluginError(PLUGIN_NAME, err));
            }
        }

        this.push(file);
        return cb();
    });
}

module.exports = gulpBrowserJsInclude;