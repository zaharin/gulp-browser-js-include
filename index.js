var
    path   = require('path')
    , fs     = require('fs')
    , through = require('through2')
    , PluginError = require('gulp-util').PluginError
    ;

const
    PLUGIN_NAME = 'gulp-browser-js-include';

var DIRECTIVE_REGEXP = /[\/]{2,}=[ ]*(?:require|include)[ ]+(\S*).*/g;

function getFileContent(file) {
    if (!fs.existsSync(file) )
        throw new PluginError(PLUGIN_NAME, 'File not found: ' + file);

    return fs.readFileSync(file, { encoding: 'utf8' });
}

function Plugin() {
    this.files = [];
}

Plugin.prototype.execute = function (file, content) {
    this.files = [];
    return this._processingContent(file, content);
};

Plugin.prototype._processingContent = function (file, content) {
    var self = this;

    if (this.files.indexOf(file) > -1) return '';
    this.files.push(file);

    return content.replace(DIRECTIVE_REGEXP, function (match, fileInclude) {
        var fullFileInclude = path.normalize(path.dirname(file) + path.sep + fileInclude);
        return self._processingContent(fullFileInclude, getFileContent(fullFileInclude));
    });
};

function gulpBrowserJsInclude() {
    return through.obj(function(file, enc, cb) {
        var plugin
            , content
            ;

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return cb(null, file);
        }

        if (file.isBuffer()) {
            try {
                plugin = new Plugin();
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