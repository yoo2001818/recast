"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var parser_1 = require("../lib/parser");
var printer_1 = require("../lib/printer");
var types = tslib_1.__importStar(require("ast-types"));
var nodeMajorVersion = parseInt(process.versions.node, 10);
var _loop_1 = function (title, parser) {
    (nodeMajorVersion >= 6 ? describe : xdescribe)(title, function () {
        var printer = new printer_1.Printer({ tabWidth: 2 });
        var parseOptions = { parser: parser };
        function check(source) {
            var ast1 = parser_1.parse(source, parseOptions);
            var ast2 = parser_1.parse(printer.printGenerically(ast1).code, parseOptions);
            types.astNodesAreEquivalent.assert(ast1, ast2);
        }
        it("should parse and print attribute comments", function () {
            check("<b /* comment */ />");
            check("<b /* multi\nline\ncomment */ />");
        });
        it("should parse and print child comments", function () {
            check("<b>{/* comment */}</b>");
            check("<b>{/* multi\nline\ncomment */}</b>");
        });
        it("should parse and print literal attributes", function () {
            check('<b className="hello" />');
        });
        it("should parse and print expression attributes", function () {
            check("<b className={classes} />");
        });
        it("should parse and print chidren", function () {
            check("<label><input /></label>");
        });
        it("should parse and print literal chidren", function () {
            check("<b>hello world</b>");
        });
        it("should parse and print expression children", function () {
            check("<b>{this.props.user.name}</b>");
        });
        it("should parse and print namespaced elements", function () {
            check("<Foo.Bar />");
        });
        // Esprima does not parse JSX fragments: https://github.com/jquery/esprima/issues/2020
        (/esprima/i.test(title)
            ? xit
            : it)("should parse and print fragments", function () {
            check(["<>", "  <td>Hello</td>", "  <td>world!</td>", "</>"].join("\n"));
        });
    });
};
for (var _i = 0, _a = [
    { title: "Babel JSX Compatibility", parser: require("../parsers/babel") },
    { title: "Esprima JSX Compatibility", parser: require("../parsers/esprima") },
]; _i < _a.length; _i++) {
    var _b = _a[_i], title = _b.title, parser = _b.parser;
    _loop_1(title, parser);
}
