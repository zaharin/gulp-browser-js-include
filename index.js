var
    path   = require('path')
    , fs     = require('fs')
    , through = require('through2')
    , PluginError = require('gulp-util').PluginError
    ;

const
    PLUGIN_NAME = 'gulp-browser-js-include';

var DIRECTIVE_REGEXP = /[\/]{2,}=[ \t]*(?:require|include)[ \t]+(\S*).*/g;

function getFileContent(file) {
    if (!fs.existsSync(file) )
        throw new PluginError(PLUGIN_NAME, 'File not found: ' + file);

    return fs.readFileSync(file, { encoding: 'utf8' });
}

function Plugin(options) {
    this.files = [];

    this.mainFile = '';
    this.currFile = '';
}

Plugin.prototype.execute = function (file, content) {
    this.files = [];

    this.mainFile = file;
    this.currFile = file;

    return this._processingContent(file, content);
};

Plugin.prototype._processingContent = function (file, content) {
    if (this.files.indexOf(file) > -1) return '';

    var self = this;
    this.files.push(file);
    this.currFile = file;

    if (typeof content === 'undefined') {
        content = getFileContent(file);
    }

    return content.replace(DIRECTIVE_REGEXP, function (match, fileInclude) {
        var fullFileInclude = path.normalize(path.dirname(file) + path.sep + fileInclude);
        return self._processingContent(fullFileInclude);
    });
};

function gulpBrowserJsInclude() {
    var plugin = new Plugin();

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