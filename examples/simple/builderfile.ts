import {builder} from '../../dist/builder';

const {task, tasksParallel, tasksSeries} = builder();

const loop = task('loop', 'ts-node ./loop', {isLongRunning: true, description: 'runs loop'});
const a = task('a', 'ts-node taskA', {description: 'runs taskA', dependsOn: loop});
const aX3Series = tasksSeries('ax3-series', a, a, a);
const aX3Parallel = tasksParallel('ax3-parallel', a, a, a);

task('b', 'taskB', {dependsOn: a, description: 'run taskB (depends on taskA)'});
task('c', 'taskB', {dependsOn: aX3Series, description: 'runs taskB after taskA 3 times in order'});
task('d', 'taskB', {dependsOn: aX3Parallel, description: 'runs taskB after taskA 3 times in parallel'});
task('e', 'taskB', {
	onExit: aX3Series,
	description: 'runs taskB then taskA 3 times in order after exiting'
});
task('f', 'taskB', {
	onExit: aX3Parallel,
	description: 'runs taskB then taskA 3 times in parallel after exiting'
});
