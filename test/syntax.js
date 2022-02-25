"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var types = tslib_1.__importStar(require("ast-types"));
var parser_1 = require("../lib/parser");
var hasOwn = Object.prototype.hasOwnProperty;
// Babel 7 no longer supports Node 4 or 5.
var nodeMajorVersion = parseInt(process.versions.node, 10);
(nodeMajorVersion >= 6 ? describe : xdescribe)("syntax", function () {
    // Make sure we handle all possible node types in Syntax, and no additional
    // types that are not present in Syntax.
    it("Completeness", function (done) {
        var printer = path_1.default.join(__dirname, "../lib/printer.ts");
        fs_1.default.readFile(printer, "utf-8", function (err, data) {
            assert_1.default.ok(!err);
            var ast = parser_1.parse(data, { parser: require("../parsers/typescript") });
            assert_1.default.ok(ast);
            var typeNames = {};
            types.visit(ast, {
                visitFunctionDeclaration: function (path) {
                    var decl = path.node;
                    if (types.namedTypes.Identifier.check(decl.id) &&
                        decl.id.name === "genericPrintNoParens") {
                        this.traverse(path, {
                            visitSwitchCase: function (path) {
                                var test = path.node.test;
                                if (test &&
                                    test.type === "StringLiteral" &&
                                    typeof test.value === "string") {
                                    var name = test.value;
                                    typeNames[name] = name;
                                }
                                return false;
                            },
                        });
                    }
                    else {
                        this.traverse(path);
                    }
                },
            });
            for (var name in types.namedTypes) {
                if (hasOwn.call(types.namedTypes, name)) {
                    assert_1.default.ok(hasOwn.call(typeNames, name), "unhandled type: " + name);
                    assert_1.default.strictEqual(name, typeNames[name]);
                    delete typeNames[name];
                }
            }
            done();
        });
    });
});
