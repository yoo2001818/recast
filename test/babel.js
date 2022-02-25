"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var recast = tslib_1.__importStar(require("../main"));
var n = recast.types.namedTypes;
var b = recast.types.builders;
var os_1 = require("os");
var nodeMajorVersion = parseInt(process.versions.node, 10);
describe("Babel", function () {
    // Babel no longer supports Node 4 or 5.
    if (nodeMajorVersion < 6) {
        return;
    }
    var babelTransform = require("@babel/core").transform;
    var babelPresetEnv = require("@babel/preset-env");
    var parseOptions = {
        parser: require("../parsers/babel"),
    };
    it("basic printing", function () {
        function check(lines) {
            var code = lines.join(os_1.EOL);
            var ast = recast.parse(code, parseOptions);
            var output = recast.prettyPrint(ast, {
                tabWidth: 2,
                wrapColumn: 60,
            }).code;
            assert_1.default.strictEqual(output, code);
        }
        check([
            '"use strict";',
            '"use strict";',
            "function a() {",
            '  "use strict";',
            "}",
        ]);
        check(["function a() {", '  "use strict";', "  b;", "}"]);
        check(["() => {", '  "use strict";', "};"]);
        check(["() => {", '  "use strict";', "  b;", "};"]);
        check(["var a = function a() {", '  "use strict";', "};"]);
        check(["var a = function a() {", '  "use strict";', "  b;", "};"]);
        check([
            "null;",
            '"asdf";',
            "/a/;",
            "false;",
            "1;",
            "const find2 = <X>() => {};", // typeParameters
        ]);
        check([
            "class A<T> {",
            "  a;",
            "  a = 1;",
            "  [a] = 1;",
            "}",
        ]);
        check([
            "function f<T>(x: empty): T {",
            "  return x;",
            "}",
        ]);
        check([
            "var a: {| numVal: number |};",
            "const bar1 = (x: number): string => {};",
            "declare module.exports: { foo: string }",
            "type Maybe<T> = _Maybe<T, *>;",
            // 'declare class B { foo: () => number }', // interesting failure ref https://github.com/babel/babel/pull/3663
            "declare function foo(): number;",
            "var A: (a: B) => void;",
        ]);
        check([
            "async function* a() {",
            "  for await (let x of y) {",
            "    x;",
            "  }",
            "}",
        ]);
        check([
            "class C2<+T, -U> {",
            "  +p: T = e;",
            "}",
        ]);
        check(["type T = { -p: T };", "type U = { +[k: K]: V };"]);
        check([
            "class A {",
            "  static async *z(a, b): number {",
            "    b;",
            "  }",
            "",
            "  static get y(): number {",
            "    return 1;",
            "  }",
            "",
            "  static set x(a): void {",
            "    return 1;",
            "  }",
            "",
            "  static async *[d](a, b): number {",
            "    return 1;",
            "  }",
            "}",
        ]);
        check([
            "({",
            "  async *a() {",
            "    b;",
            "  },",
            "",
            "  get a() {",
            "    return 1;",
            "  },",
            "",
            "  set a(b) {",
            "    return 1;",
            "  },",
            "",
            "  async *[d](c) {",
            "    return 1;",
            "  },",
            "",
            "  a: 3,",
            "  [a]: 3,",
            "  1: 3,",
            '  "1": 3,',
            "  1() {},",
            '  "1"() {}',
            "});",
        ]);
        check([
            "console.log(",
            "  100m,",
            "  9223372036854775807m,",
            "  0.m,",
            "  3.1415926535897932m,",
            "  100.000m,",
            "  123456.789m",
            ");"
        ]);
        // V8IntrinsicIdentifier
        check([
            "%DebugPrint('hello');",
            "%DebugPrint(%StringParseInt('42', 10));",
        ]);
    });
    it("babel 6: should not wrap IIFE when reusing nodes", function () {
        var code = ["(function(...c) {", "  c();", "})();"].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        var output = recast.print(ast, { tabWidth: 2 }).code;
        assert_1.default.strictEqual(output, code);
    });
    it("should not disappear when surrounding code changes", function () {
        var code = [
            'import foo from "foo";',
            'import React from "react";',
            "",
            "@component",
            '@callExpression({foo: "bar"})',
            "class DebugPanel extends React.Component {",
            "  render() {",
            "    return (",
            "      <div> test </div>",
            "    );",
            "  }",
            "}",
            "",
            "export default DebugPanel;",
        ].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        assert_1.default.strictEqual(recast.print(ast).code, code);
        var root = new recast.types.NodePath(ast);
        var reactImportPath = root.get("program", "body", 1);
        n.ImportDeclaration.assert(reactImportPath.value);
        // Remove the second import statement.
        reactImportPath.prune();
        var reprinted = recast.print(ast).code;
        assert_1.default.ok(reprinted.match(/@component/));
        assert_1.default.ok(reprinted.match(/@callExpression/));
        assert_1.default.strictEqual(reprinted, code
            .split(os_1.EOL)
            .filter(function (line) { return !line.match(/^import React from/); })
            .join(os_1.EOL));
    });
    it("should not disappear when an import is added and `export` is used inline", function () {
        var code = [
            'import foo from "foo";',
            'import React from "react";',
            "",
            "@component",
            '@callExpression({foo: "bar"})',
            "@callExpressionMultiLine({",
            '  foo: "bar",',
            "})",
            "export class DebugPanel extends React.Component {",
            "  render() {",
            "    return (",
            "      <div> test </div>",
            "    );",
            "  }",
            "}",
        ].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        assert_1.default.strictEqual(recast.print(ast).code, code);
        var root = new recast.types.NodePath(ast);
        var body = root.get("program", "body");
        // add a new import statement
        body.unshift(b.importDeclaration([b.importDefaultSpecifier(b.identifier("x"))], b.literal("x")));
        var reprinted = recast.print(ast).code;
        assert_1.default.ok(reprinted.match(/@component/));
        assert_1.default.ok(reprinted.match(/@callExpression/));
        assert_1.default.strictEqual(reprinted, ['import x from "x";'].concat(code.split(os_1.EOL)).join(os_1.EOL));
    });
    it("should not disappear when an import is added and `export default` is used inline", function () {
        var code = [
            'import foo from "foo";',
            'import React from "react";',
            "",
            "@component",
            '@callExpression({foo: "bar"})',
            "@callExpressionMultiLine({",
            '  foo: "bar",',
            "})",
            "export default class DebugPanel extends React.Component {",
            "  render() {",
            "    return (",
            "      <div> test </div>",
            "    );",
            "  }",
            "}",
        ].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        assert_1.default.strictEqual(recast.print(ast).code, code);
        var root = new recast.types.NodePath(ast);
        var body = root.get("program", "body");
        // add a new import statement
        body.unshift(b.importDeclaration([b.importDefaultSpecifier(b.identifier("x"))], b.literal("x")));
        var reprinted = recast.print(ast).code;
        assert_1.default.ok(reprinted.match(/@component/));
        assert_1.default.ok(reprinted.match(/@callExpression/));
        assert_1.default.strictEqual(reprinted, ['import x from "x";'].concat(code.split(os_1.EOL)).join(os_1.EOL));
    });
    it("should not print delimiters with type annotations", function () {
        var code = ["type X = {", "  a: number,", "  b: number,", "};"].join("\n");
        var ast = recast.parse(code, parseOptions);
        var root = new recast.types.NodePath(ast);
        root.get("program", "body", 0, "right", "properties", 0).prune();
        assert_1.default.strictEqual(recast.print(ast).code, "type X = { b: number };");
    });
    function parseExpression(code) {
        return recast.parse(code, parseOptions).program.body[0].expression;
    }
    it("should parenthesize ** operator arguments when lower precedence", function () {
        var ast = recast.parse("a ** b;", parseOptions);
        ast.program.body[0].expression.left = parseExpression("x + y");
        ast.program.body[0].expression.right = parseExpression("x || y");
        assert_1.default.strictEqual(recast.print(ast).code, "(x + y) ** (x || y);");
    });
    it("should parenthesize ** operator arguments as needed when same precedence", function () {
        var ast = recast.parse("a ** b;", parseOptions);
        ast.program.body[0].expression.left = parseExpression("x * y");
        ast.program.body[0].expression.right = parseExpression("x / y");
        assert_1.default.strictEqual(recast.print(ast).code, "(x * y) ** (x / y);");
    });
    it("should be able to replace top-level statements with leading empty lines", function () {
        var code = ["", "if (test) {", "  console.log(test);", "}"].join("\n");
        var ast = recast.parse(code, parseOptions);
        var replacement = b.expressionStatement(b.callExpression(b.identifier("fn"), [
            b.identifier("test"),
            b.literal(true),
        ]));
        ast.program.body[0] = replacement;
        assert_1.default.strictEqual(recast.print(ast).code, "\nfn(test, true);");
        recast.types.visit(ast, {
            visitIfStatement: function (path) {
                path.replace(replacement);
                return false;
            },
        });
        assert_1.default.strictEqual(recast.print(ast).code, "\nfn(test, true);");
    });
    it("should parse and print dynamic import(...)", function () {
        var code = 'wait(import("oyez"));';
        var ast = recast.parse(code, parseOptions);
        assert_1.default.strictEqual(recast.prettyPrint(ast).code, code);
    });
    it("tolerates circular references", function () {
        var code = "function foo(bar = true) {}";
        recast.parse(code, {
            parser: {
                parse: function (source) {
                    return babelTransform(source, {
                        code: false,
                        ast: true,
                        sourceMap: false,
                        presets: [babelPresetEnv],
                    }).ast;
                },
            },
        });
    });
    it("prints numbers in bases other than 10 without converting them", function () {
        var code = [
            "let base10 = 6;",
            "let hex = 0xf00d;",
            "let binary = 0b1010;",
            "let octal = 0o744;",
            "let decimal = 123.456m;",
        ].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        var output = recast.print(ast, { tabWidth: 2 }).code;
        assert_1.default.strictEqual(output, code);
    });
    it("prints the export-default-from syntax", function () {
        var code = [
            'export { default as foo, bar } from "foo";',
            'export { default as veryLongIdentifier1, veryLongIdentifier2, veryLongIdentifier3, veryLongIdentifier4, veryLongIdentifier5 } from "long-identifiers";',
        ].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        var replacement1 = b.exportDefaultSpecifier(b.identifier("foo"));
        var replacement2 = b.exportDefaultSpecifier(b.identifier("veryLongIdentifier1"));
        ast.program.body[0].specifiers[0] = replacement1;
        ast.program.body[1].specifiers[0] = replacement2;
        assert_1.default.strictEqual(recast.print(ast).code, [
            'export foo, { bar } from "foo";',
            "export veryLongIdentifier1, {",
            "  veryLongIdentifier2,",
            "  veryLongIdentifier3,",
            "  veryLongIdentifier4,",
            "  veryLongIdentifier5,",
            '} from "long-identifiers";',
        ].join(os_1.EOL));
    });
    // https://github.com/codemod-js/codemod/issues/157
    it("avoids extra semicolons on mutated blocks containing a 'use strict' directive", function () {
        var code = [
            "(function () {",
            '  "use strict";',
            "  hello;",
            "})();",
        ].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        // delete "hello;"
        ast.program.body[0].expression.callee.body.body.splice(0);
        assert_1.default.strictEqual(recast.print(ast).code, ["(function () {", '  "use strict";', "})();"].join(os_1.EOL));
    });
    it("should print typescript class elements modifiers", function () {
        var code = ["class A {", "  x;", "}"].join(os_1.EOL);
        var ast = recast.parse(code, parseOptions);
        ast.program.body[0].body.body[0].readonly = true;
        ast.program.body[0].body.body[0].declare = true;
        ast.program.body[0].body.body[0].accessibility = "public";
        assert_1.default.strictEqual(recast.print(ast).code, ["class A {", "  declare public readonly x;", "}"].join(os_1.EOL));
    });
});
