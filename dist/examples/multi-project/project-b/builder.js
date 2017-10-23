"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var builder_1 = require("../../../builder");
var task = builder_1.builder({ namespace: 'project-b', cwd: __dirname }).task;
exports.someTask = task('someTask', 'ts-node ./task');
//# sourceMappingURL=builder.js.map