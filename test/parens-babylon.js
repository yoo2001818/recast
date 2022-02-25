"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var babylon = tslib_1.__importStar(require("@babel/parser"));
var parser_1 = require("../lib/parser");
var printer_1 = require("../lib/printer");
var types = tslib_1.__importStar(require("ast-types"));
var printer = new printer_1.Printer();
var n = types.namedTypes;
function parseExpression(expr) {
    var ast = babylon.parseExpression(expr);
    return n.ExpressionStatement.check(ast) ? ast.expression : ast;
}
var parse = function (expr) {
    return parser_1.parse(expr, {
        parser: babylon,
    });
};
function check(expr) {
    var ast = parse(expr);
    var reprinted = printer.print(ast).code;
    assert_1.default.strictEqual(reprinted, expr);
    var expressionAst = parseExpression(expr);
    var generic = printer.printGenerically(expressionAst).code;
    types.astNodesAreEquivalent.assert(expressionAst, parseExpression(generic));
}
describe("babylon parens", function () {
    it("AwaitExpression", function () {
        check("async () => ({...(await obj)})");
        check("(async function* () { yield await foo })");
    });
    it("YieldExpression", function () {
        check("(function* () { return {...(yield obj)}})");
    });
    it("decorative parens", function () {
        var ast = parse("1");
        var expr = ast.program.body[0].expression;
        expr.extra.parenthesized = true;
        assert_1.default.strictEqual(printer.print(ast).code, "(1)");
    });
    it("decorative parens which are also necessary", function () {
        var ast = parse("(1).foo");
        var expr = ast.program.body[0].expression;
        expr.object.extra.parenthesized = false;
        assert_1.default.strictEqual(printer.print(ast).code, "(1).foo");
    });
});
