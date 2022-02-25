"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path_1 = tslib_1.__importDefault(require("path"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var recast = tslib_1.__importStar(require("../main"));
var source = fs_1.default.readFileSync(path_1.default.join(__dirname, "data", "backbone.js"), "utf8");
var start = +new Date();
var ast = recast.parse(source);
var types = Object.create(null);
var parseTime = +new Date() - start;
console.log("parse", parseTime, "ms");
recast.visit(ast, {
    visitNode: function (path) {
        types[path.value.type] = true;
        this.traverse(path);
    },
});
var visitTime = +new Date() - start - parseTime;
console.log("visit", visitTime, "ms");
recast.prettyPrint(ast).code;
var printTime = +new Date() - start - visitTime - parseTime;
console.log("print", printTime, "ms");
console.log("total", +new Date() - start, "ms");
