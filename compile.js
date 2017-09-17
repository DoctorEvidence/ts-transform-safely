"use strict";
exports.__esModule = true;
var ts = require("typescript");
var glob_1 = require("glob");
var src_1 = require("./src");
var CJS_CONFIG = {
    experimentalDecorators: true,
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noEmitOnError: false,
    noUnusedLocals: true,
    noUnusedParameters: true,
    stripInternal: true,
    target: ts.ScriptTarget.ES2015
};
function compile(input, options) {
    if (options === void 0) { options = CJS_CONFIG; }
    var files = glob_1.sync(input);
    var compilerHost = ts.createCompilerHost(options);
    var program = ts.createProgram(files, options, compilerHost);
    var msgs = {};
    var emitResult = program.emit(undefined, undefined, undefined, undefined, {
        before: [
            src_1.transform({
                generateScopedName: '[name]__[local]___[hash:base64:5]'
            })
        ]
    });
    var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    allDiagnostics.forEach(function (diagnostic) {
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
    });
    return msgs;
}
exports["default"] = compile;
