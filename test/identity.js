"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var types = tslib_1.__importStar(require("ast-types"));
var recast = tslib_1.__importStar(require("../main"));
var nodeMajorVersion = parseInt(process.versions.node, 10);
function testFile(path, options) {
    if (options === void 0) { options = {}; }
    fs_1.default.readFile(path, "utf-8", function (err, source) {
        assert_1.default.equal(err, null);
        assert_1.default.strictEqual(typeof source, "string");
        var ast = recast.parse(source, options);
        types.astNodesAreEquivalent.assert(ast.original, ast);
        var code = recast.print(ast).code;
        assert_1.default.strictEqual(source, code);
    });
}
function addTest(name) {
    it(name, function () {
        var filename = path_1.default.join(__dirname, "..", name);
        if (path_1.default.extname(filename) === ".ts") {
            // Babel 7 no longer supports Node 4 and 5.
            if (nodeMajorVersion >= 6) {
                testFile(filename, { parser: require("../parsers/typescript") });
            }
        }
        else {
            testFile(filename);
        }
    });
}
describe("identity", function () {
    // Add more tests here as need be.
    addTest("test/data/regexp-props.js");
    addTest("test/data/empty.js");
    addTest("test/data/backbone.js");
    addTest("test/lines.ts");
    addTest("lib/lines.ts");
    addTest("lib/printer.ts");
});
