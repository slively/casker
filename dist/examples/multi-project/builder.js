"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var builder_1 = require("../../builder");
var builder_2 = require("./project-a/builder");
var builder_3 = require("./project-b/builder");
var _a = builder_1.builder({ cwd: __dirname }), tasksParallel = _a.tasksParallel, tasksSeries = _a.tasksSeries;
tasksParallel('allParallel', builder_2.someTask, builder_3.someTask);
tasksSeries('allSeries', builder_2.someTask, builder_3.someTask);
//# sourceMappingURL=builder.js.map