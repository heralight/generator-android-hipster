'use strict';
var path = require('path'),
    fs = require('fs'),
    html = require("html-wiring"),
    shelljs = require('shelljs'),
    engine = require('ejs').render;


module.exports = {
    rewrite: rewrite,
    rewriteReplace: rewriteReplace,
    rewriteReplaceMultiple: rewriteReplaceMultiple,
    rewriteFile: rewriteFile,
    rewriteFileMultiple: rewriteFileMultiple,
    replaceContent: replaceContent,
    classify: classify,
    rewriteJSONFile: rewriteJSONFile,
    copyWebResource: copyWebResource
};

function rewriteReplaceMultiple(args) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    args.haystack = fs.readFileSync(fullPath, 'utf8');
    var body = rewriteReplaceFileMultiple(args);

    fs.writeFileSync(fullPath, body);

}

function rewriteReplace(args) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    args.haystack = fs.readFileSync(fullPath, 'utf8');
    var body = rewriteReplaceFile(args);

    fs.writeFileSync(fullPath, body);
}
function rewriteFile(args) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    args.haystack = fs.readFileSync(fullPath, 'utf8');
    var body = rewrite(args);

    fs.writeFileSync(fullPath, body);
}

function rewriteFileMultiple(args) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    args.haystack = fs.readFileSync(fullPath, 'utf8');
    var body = rewriteMultiple(args);

    fs.writeFileSync(fullPath, body);
}


function replaceContent(args) {
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);

    var re = args.regex ? new RegExp(args.pattern, 'g') : args.pattern;

    var body = fs.readFileSync(fullPath, 'utf8');
    body = body.replace(re, args.content);
    fs.writeFileSync(fullPath, body);
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function rewriteReplaceFile(args) {

    // check if splicable is already in the body text
    var re = new RegExp(args.splicable.map(function (line) {
        return '\s*' + escapeRegExp(line);
    }).join('\n'));


    if (re.test(args.haystack)) {
        return args.haystack;
    }

    var lines = args.haystack.split('\n');

    var otherwiseLineIndex = -1;
    lines.forEach(function (line, i) {
        if (line.indexOf(args.needle) !== -1) {
            otherwiseLineIndex = i;
        }
    });

    var spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }

    var spaceStr = '';
    while ((spaces -= 1) >= 0) {
        spaceStr += ' ';
    }

    lines[otherwiseLineIndex] = args.splicable.map(function (line) {
        return spaceStr + line;
    }).join('\n');

    return lines.join('\n');
}

function rewriteReplaceFileMultiple(args) {

    var lines = args.haystack.split('\n');
    for (var i = 0; i < args.dependencies.length; i++) {
        var otherwiseLineIndex = -1;
        var needle = args.dependencies[i].scope + ' "' + args.dependencies[i].group + ':' + args.dependencies[i].name + ':';
        lines.forEach(function (line, i) {
            if (line.indexOf(needle) !== -1) {
                otherwiseLineIndex = i;
            }
        });

        var isNew = false;
        if (lines[otherwiseLineIndex] == undefined) {
            // dont have the dependency, added now...
            var needle = args.needle || 'android-hipster-needle-gradle-dependency';
            lines.forEach(function (line, i) {
                if (line.indexOf(needle) !== -1) {
                    otherwiseLineIndex = i;
                    isNew = true;
                }
            });

        }

        var spaces = 0;
        while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
            spaces += 1;
        }

        var spaceStr = '';
        while ((spaces -= 1) >= 0) {
            spaceStr += ' ';
        }

        var dep = args.dependencies[i].scope + ' "' + args.dependencies[i].group + ':' + args.dependencies[i].name + ':' + args.dependencies[i].version + '"';
        console.log('updated:', dep);

        if (isNew) {
            lines.splice(otherwiseLineIndex, 0, spaceStr + args.dependencies[i].scope + ' "' + args.dependencies[i].group + ':' + args.dependencies[i].name + ':' + args.dependencies[i].version + '"').join('\n');
        } else {
            lines[otherwiseLineIndex] = spaceStr + (dep);
        }

    }


    return lines.join('\n');
}

function rewriteMultiple(args) {

    var lines = args.haystack.split('\n');
    for (var i = 0; i < args.dependencies.length; i++) {

        var needle = args.needle || 'android-hipster-needle-gradle-dependency';
        var otherwiseLineIndex = -1;
        lines.forEach(function (line, i) {
            if (line.indexOf(needle) !== -1) {
                otherwiseLineIndex = i;
            }
        });

        var spaces = 0;
        while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
            spaces += 1;
        }

        var spaceStr = '';
        while ((spaces -= 1) >= 0) {
            spaceStr += ' ';
        }

        var dep = args.dependencies[i].scope + ' "' + args.dependencies[i].group + ':' + args.dependencies[i].name + ':' + args.dependencies[i].version + '"';
        console.log('added:', dep);

        lines.splice(otherwiseLineIndex, 0, spaceStr + args.dependencies[i].scope + ' "' + args.dependencies[i].group + ':' + args.dependencies[i].name + ':' + args.dependencies[i].version + '"').join('\n');
    }


    return lines.join('\n');
}


function rewrite(args) {
    // check if splicable is already in the body text
    var re = new RegExp(args.splicable.map(function (line) {
        return '\s*' + escapeRegExp(line);
    }).join('\n'));


    if (re.test(args.haystack)) {
        return args.haystack;
    }

    var lines = args.haystack.split('\n');

    var otherwiseLineIndex = -1;
    lines.forEach(function (line, i) {
        if (line.indexOf(args.needle) !== -1) {
            otherwiseLineIndex = i;
        }
    });

    var spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }

    var spaceStr = '';
    while ((spaces -= 1) >= 0) {
        spaceStr += ' ';
    }

    lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
        return spaceStr + line;
    }).join('\n'));

    return lines.join('\n');
}


// _.classify uses _.titleize which lowercase the string,
// so if the user chooses a proper ClassName it will not rename properly
function classify(string) {
    string = string.replace(/[\W_](\w)/g, function (match) {
        return ' ' + match[1].toUpperCase();
    }).replace(/\s/g, '');
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function rewriteJSONFile(filePath, rewriteFile) {
    var jsonObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    rewriteFile(jsonObj);
    fs.writeFileSync(filePath, JSON.stringify(jsonObj, null, 4));
}

function copyWebResource(source, dest, regex, type, _this, _opt, template) {

    _opt = _opt !== undefined ? _opt : {};
    if (_this.enableTranslation) {
        // uses template method instead of copy if template boolean is set as true
        template ? _this.template(source, dest, _this, _opt) : _this.copy(source, dest);
    } else {
        var body = stripContent(source, regex, _this, _opt);
        switch (type) {
            case 'html' :
                body = replacePlaceholders(body, _this);
                break;
            case 'js' :
                body = replaceTitle(body, _this, template);
                break;
        }
        _this.write(dest, body);
    }
}

function stripContent(source, regex, _this, _opt) {
    var re = new RegExp(regex, 'g');

    var body = html.readFileAsString(path.join(_this.sourceRoot(), source));
    //temp hack to fix error thrown by ejs during entity creation, this needs a permanent fix when we add more .ejs files
    _opt.filename = path.join(_this.sourceRoot(), "src/main/webapp/app/ng_validators.ejs");
    body = engine(body, _this, _opt);
    body = body.replace(re, '');

    return body;
}

function replaceTitle(body, _this, template) {
    var re = /pageTitle[\s]*:[\s]*[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"]/g;
    var match;

    while (match = re.exec(body)) {
        // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
        var key = match[1], target = key;
        var jsonData = geti18nJson(key, _this);
        var keyValue = jsonData !== undefined ? deepFind(jsonData, key) : undefined;

        body = body.replace(target, keyValue !== undefined ? keyValue : _this.baseName);
    }

    return body;
}

function replacePlaceholders(body, _this) {
    var re = /placeholder=[\'|\"]([\{]{2}[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"][\s][\|][\s](translate)[\}]{2})[\'|\"]/g;
    var match;

    while (match = re.exec(body)) {
        // match is now the next match, in array form and our key is at index 2, index 1 is replace target.
        var key = match[2], target = match[1];
        var jsonData = geti18nJson(key, _this);
        var keyValue = jsonData !== undefined ? deepFind(jsonData, key, true) : undefined; // dirty fix to get placeholder as it is not in proper json format, name has a dot in it. Assuming that all placeholders are in similar format

        body = body.replace(target, keyValue !== undefined ? keyValue : '');
    }

    return body;
}

function geti18nJson(key, _this, template) {

    var i18nDirectory = 'src/main/webapp/i18n/en/',
        name = key.split('.')[0].replace('-', '.'),
        filename = i18nDirectory + name + '.json',
        keyValue, render = template;

    if (!shelljs.test('-f', path.join(_this.sourceRoot(), filename))) {
        filename = i18nDirectory + '_' + name + '.json';
        render = true;
    }
    try {
        var file = html.readFileAsString(path.join(_this.sourceRoot(), filename));
        file = render ? engine(file, _this, {}) : file;
        file = JSON.parse(file);
        return file;
    } catch (err) {
        console.log('error' + err);
        // 'Error reading translation file!'
        return undefined;
    }
}

function deepFind(obj, path, placeholder) {
    var paths = path.split('.'), current = obj, i;
    if (placeholder) {// dirty fix for placeholders, the json files needs to be corrected
        paths[paths.length - 2] = paths[paths.length - 2] + '.' + paths[paths.length - 1];
        paths.pop();
    }
    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] == undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}
