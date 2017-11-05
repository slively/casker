import {casker} from '../../dist/casker';

const {task, tasksParallel, tasksSeries} = casker();

const a = task('a', 'ts-node taskA');
const b = task('b', 'ts-node taskB', {dependsOn: a});
const c = task('c', 'ts-node taskC');
const d = task('d', 'ts-node taskD', {dependsOn: c});

const eSeriesDependencies = task('eSeriesDependencies', 'ts-node taskE', {dependsOn: tasksSeries('cdSeries', b, d)});
const eParallelDependencies = task('eParallelDependencies', 'ts-node taskE', {dependsOn: tasksParallel('cdParallel', b, d)});
const eSeriesAndParallelDependencies = tasksSeries('eSeriesAndParallelDependencies', eSeriesDependencies, eParallelDependencies);
const eParallelAndSeriesDependencies = tasksSeries('eParallelAndSeriesDependencies', eParallelDependencies, eSeriesDependencies);
const eSeriesAndSeriesDependencies = tasksSeries('eSeriesAndSeriesDependencies', eSeriesDependencies, eSeriesDependencies);
const eParallelAndParallelDependencies = tasksSeries('eParallelAndParallelDependencies', eParallelDependencies, eParallelDependencies);

tasksParallel(
	'parallelTasksOfTasks',
	eSeriesAndParallelDependencies,
	eParallelAndSeriesDependencies,
	eSeriesAndSeriesDependencies,
	eParallelAndParallelDependencies
);

tasksParallel(
	'serialTasksOfTasks',
	eSeriesAndParallelDependencies,
	eParallelAndSeriesDependencies,
	eSeriesAndSeriesDependencies,
	eParallelAndParallelDependencies
);