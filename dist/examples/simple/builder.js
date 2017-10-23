"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var builder_1 = require("../../builder");
var _a = builder_1.builder({ cwd: __dirname }), task = _a.task, tasksParallel = _a.tasksParallel, tasksSeries = _a.tasksSeries;
var loop = task('loop', 'ts-node ./loop', { isLongRunning: true, description: 'runs loop' });
var a = task('a', 'ts-node taskA', { description: 'runs taskA', dependency: loop });
var aX3Series = tasksSeries('ax3-series', a, a, a);
var aX3Parallel = tasksParallel('ax3-parallel', a, a, a);
task('b', 'taskB', { dependency: a, description: 'run taskB (depends on taskA)' });
task('c', 'taskB', { dependency: aX3Series, description: 'runs taskB after taskA 3 times in order' });
task('d', 'taskB', { dependency: aX3Parallel, description: 'runs taskB after taskA 3 times in parallel' });
task('e', 'taskB', {
    onExit: aX3Series,
    description: 'runs taskB then taskA 3 times in order after exiting'
});
task('f', 'taskB', {
    onExit: aX3Parallel,
    description: 'runs taskB then taskA 3 times in parallel after exiting'
});
//# sourceMappingURL=builder.js.map