"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var path_1 = tslib_1.__importDefault(require("path"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var recast = tslib_1.__importStar(require("../main"));
var types = tslib_1.__importStar(require("ast-types"));
var os_1 = require("os");
var parser = tslib_1.__importStar(require("../parsers/typescript"));
var printer_1 = require("../lib/printer");
var n = types.namedTypes;
var printer = new printer_1.Printer();
// Babel 7 no longer supports Node 4 or 5.
var nodeMajorVersion = parseInt(process.versions.node, 10);
(nodeMajorVersion >= 6 ? describe : xdescribe)("TypeScript", function () {
    it("basic printing", function () {
        function check(lines) {
            var code = lines.join(os_1.EOL);
            var ast = recast.parse(code, { parser: parser });
            var output = recast.prettyPrint(ast, { tabWidth: 2 }).code;
            assert_1.default.strictEqual(code, output);
        }
        check([
            'let color: string = "blue";',
            "let isDone: boolean = false;",
            "let decimal: number = 6;",
            "let hex: number = 0xf00d;",
            "let binary: number = 0b1010;",
            "let octal: number = 0o744;",
            "let list: number[] = [1, 2, 3];",
            "let list2: Array<number> = list;",
            "let matrix: number[][];",
            "let x: [string, number];",
            "let f: <E>(e: E) => void;",
            'let sn: string | null = "isNull";',
        ]);
        check([
            "type A = number;",
            "type B = string;",
            "type C = never;",
            "type D = any;",
            "type E = [string, number];",
            "type F = void;",
            "type G = undefined;",
            "type H = bigint;",
            "type I = intrinsic;",
            "",
            "type J = {",
            "  a: string,",
            "  b?: number",
            "};",
        ]);
        check(["type c = T & U & V;"]);
        check(["let list: Array<number> = [1, 2, 3];"]);
        check(["let n = a!.c();"]);
        check(["a!.c();"]);
        check(['type A = "cat" | "dog" | "bird";']);
        check([
            "type A<T, U> = {",
            '  u: "cat",',
            "  x: number,",
            "  y: T,",
            "  z: U",
            "};",
        ]);
        check([
            "type F = <T, U>(",
            "  a: string,",
            "  b: {",
            "    y: T,",
            "    z: U",
            "  }",
            ") => void;",
        ]);
        check([
            "type Readonly<T> = {",
            "  readonly [P in keyof T]: T[P];",
            "};",
            "",
            "type Pick<T, K extends keyof T> = {",
            "  [P in K]: T[P];",
            "};",
        ]);
        check([
            "let strLength1: string = (<string> someValue).length;",
            "let strLength2: string = <string> someValue;",
            "let square = <Square> {};",
            "let strLength3: number = (someValue as string).length;",
            "let strLength4: number = someValue as string;",
        ]);
        check([
            "(<string> someValue).length;",
            "<string> someValue;",
            "<Square> {};",
            "(someValue as string).length;",
            "someValue as string;",
        ]);
        check(["let counter = <Counter> function(start: number) {};"]);
        check(["<Counter> function(start: number) {};"]);
        check(["if ((<F> p).s) {", "  (<F> p).s();", "}"]);
        check([
            "function i(p): p is F {}",
            "function i(p): p is string | number {}",
        ]);
        check(["function f<T, U>(a: T, b: U): void {", "  let c: number;", "}"]);
        check([
            "function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {",
            "  console.log(o);",
            "}",
        ]);
        check([
            "let myAdd: <T, U>(x: T, y?: number) => U = function(x: number, y?: number): number {};",
            "function bb(f: string, ...r: string[]): void {}",
            "function f(this: void) {}",
            "function l<T extends L>(arg: T): T {}",
            "function l<T extends A.B.C>(arg: T): T {}",
            "function l<T extends keyof U>(obj: T) {}",
            "",
            "function create<T>(",
            "  c: {",
            "    new<U>(a: U): T",
            "  }",
            "): void {}",
        ]);
        check(["const a = b as U as V;"]);
        check(["b as U as V;"]);
        check(["const highlight = (n => false) as (a: number) => boolean;"]);
        check(["(n => false) as (a: number) => boolean;"]);
        check([
            "const highlight = (function(n) {",
            "  return false;",
            "}) as (a: number) => boolean;",
        ]);
        check([
            "(function(n) {",
            "  return false;",
            "}) as (a: number) => boolean;",
        ]);
        check([
            "enum Color {",
            "  Red,",
            "  Green,",
            "  Blue",
            "}",
            "",
            "enum Color {",
            "  Red = 1,",
            "  Green = 2,",
            "  Blue = 3",
            "}",
            "",
            "enum Color {",
            "  Red = 1,",
            "  Green",
            "}",
            "",
            "enum Color {",
            '  Red = "RED",',
            '  Green = "GREEN",',
            '  Blue = "BLUE"',
            "}",
            "",
            "enum Color {",
            "  Red = init(),",
            '  Green = "GREEN"',
            "}",
            "",
            "enum E {",
            "  A = 1,",
            "  B,",
            "  C",
            "}",
            "",
            "enum F {",
            "  A = 1 << 1,",
            "  B = C | D.G,",
            '  E = "1".length',
            "}",
            "",
            "const enum G {",
            "  A = 1",
            "}",
            "",
            "declare enum H {",
            "  A = 1",
            "}",
        ]);
        check([
            "class C<T> extends B {",
            "  f(a: T) {",
            "    c(a as D);",
            "  }",
            "}",
        ]);
        check([
            "interface LabelledContainer<T> {",
            "  label: string;",
            "  content: T;",
            "  option?: boolean;",
            "  readonly x: number;",
            "  [index: number]: string;",
            "  [propName: string]: any;",
            "  readonly [index: number]: string;",
            "  (source: string, subString: string): boolean;",
            "  (start: number): string;",
            "  reset(): void;",
            "  a(c: (this: void, e: E) => void): void;",
            "}",
        ]);
        check([
            "interface Square<T, U> extends Shape<T, U>, Visible<T, U> {",
            "  sideLength: number;",
            "}",
        ]);
        check([
            "class Button extends Control<T, U> implements SelectableControl<T, U>, ClickableControl<U> {",
            "  select() {}",
            "}",
        ]);
        check([
            "class Animal {",
            '  static className: string = "Animal";',
            "",
            "  constructor(theName: string) {",
            "    this.name = theName;",
            "  }",
            "",
            "  private name: string;",
            "  public fur: boolean;",
            "  protected sound: string;",
            "  private getName() {}",
            "  public talk() {}",
            "  protected getSound() {}",
            "  static createAnimal() {}",
            "}",
        ]);
        check(["export interface S {", "  i(s: string): boolean;", "}"]);
        check([
            "namespace Validation {",
            "  export interface S {",
            "    i(j: string): boolean;",
            "  }",
            "}",
        ]);
        check(["export interface S {", "  i(j: string): boolean;", "}"]);
        check(["declare namespace D3 {", "  export const f: number = 2;", "}"]);
        check(["declare function foo<K, V>(arg: T = getDefault()): R"]);
        check([
            "class Animal {",
            "  public static async *[name]<T>(arg: U): V;",
            "}",
        ]);
        check(["function myFunction(", "  {", "    param1", "  }: Params", ") {}"]);
        check([
            'const unqualified: import("package") = 1;',
            'const qualified: import("package").ns = 2;',
            'const veryQualified: import("package").ns.foo.bar = 3;',
            'const qualifiedWithParams: import("package").ns.foo<T, U> = 4;',
            'const justParameterized: import("package")<T> = 5;',
        ]);
        check(["const a = function<T>(a: T): void {};"]);
        check(["new A<number>();"]);
        check(["createPlugin<number>();"]);
        check(["type Class<T> = new (...args: any) => T;"]);
        check(["type T1 = [...Array<any>];", "type T2 = [...any[]];"]);
        check([
            "type Color = [r: number, g: number, b: number, a?: number];",
            "type Red = Color.r;",
            "type Green = Color.g;",
            "type Blue = Color.b;",
            "type Alpha = Color.a;",
        ]);
    });
    it("parens", function () {
        function parseExpression(expr) {
            var ast = parser.parse(expr).program;
            n.Program.assert(ast);
            ast = ast.body[0];
            return n.ExpressionStatement.check(ast) ? ast.expression : ast;
        }
        var parse = function (expr) { return recast.parse(expr, { parser: parser }); };
        function check(expr) {
            var ast = parse(expr);
            var reprinted = recast.print(ast).code;
            assert_1.default.strictEqual(reprinted, expr);
            var expressionAst = parseExpression(expr);
            var generic = printer.printGenerically(expressionAst).code;
            types.astNodesAreEquivalent.assert(expressionAst, parseExpression(generic));
        }
        check("(() => {}) as void");
        check("(function () {} as void)");
    });
});
testReprinting("data/babel-parser/test/fixtures/typescript/**/input.js", "Reprinting @babel/parser TypeScript test fixtures");
testReprinting("data/graphql-tools-src/**/*.ts", "Reprinting GraphQL-Tools TypeScript files");
function testReprinting(pattern, description) {
    // Babel no longer supports Node 4 or 5.
    if (nodeMajorVersion < 6) {
        return;
    }
    describe(description, function () {
        require("glob")
            .sync(pattern, {
            cwd: __dirname,
        })
            .filter(function (file) {
            return !(
            // Skip the following files, because they have problems that are not due
            // to any problems in Recast. TODO Revisit this list periodically.
            (file.indexOf("/tsx/") >= 0 ||
                file.endsWith("stitching/errors.ts") ||
                file.endsWith("decorators/type-arguments-invalid/input.js") ||
                // Throws an error with a slightly different message than expected:
                file.endsWith("types/tuple-rest-invalid/input.js") || // @babel/parser can't handle naked arrow function expression statements:
                file.endsWith("/optional-parameter/input.js")));
        })
            .forEach(function (file) {
            return it(file, function () {
                var absPath = path_1.default.join(__dirname, file);
                var source = fs_1.default.readFileSync(absPath, "utf8");
                var ast = tryToParseFile(source, absPath);
                if (ast === null) {
                    return;
                }
                this.timeout(20000);
                assert_1.default.strictEqual(recast.print(ast).code, source);
                var reprintedCode = recast.prettyPrint(ast).code;
                var reparsedAST = recast.parse(reprintedCode, { parser: parser });
                types.astNodesAreEquivalent(ast, reparsedAST);
            });
        });
    });
}
function tryToParseFile(source, absPath) {
    try {
        return recast.parse(source, { parser: parser });
    }
    catch (e1) {
        var options = void 0;
        try {
            options = JSON.parse(fs_1.default
                .readFileSync(path_1.default.join(path_1.default.dirname(absPath), "options.json"))
                .toString());
        }
        catch (e2) {
            if (e2.code !== "ENOENT") {
                console.error(e2);
            }
            throw e1;
        }
        if (options.throws === e1.message) {
            return null;
        }
        throw e1;
    }
}
