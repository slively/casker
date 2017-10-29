import {casker} from '../../dist/casker';

const {task, tasksParallel, tasksSeries} = casker();

const a = task('a', 'ts-node taskA');
const b = task('b', 'ts-node taskB', {dependsOn: a});
const c = task('c', 'ts-node taskC');
const d = task('d', 'ts-node taskD', {dependsOn: c});

const eSeriesDependencies = task('eSeriesDependencies', 'ts-node taskE', {dependsOn: tasksSeries('cdSeries', b, d)});
const eParallelDependencies = task('eParallelDependencies', 'ts-node taskE', {dependsOn: tasksParallel('cdParallel', b, d)});
tasksSeries('eSeriesAndParallelDependencies', eSeriesDependencies, eParallelDependencies);
tasksSeries('eParallelAndSeriesDependencies', eParallelDependencies, eSeriesDependencies);
tasksSeries('eSeriesAndSeriesDependencies', eSeriesDependencies, eSeriesDependencies);
tasksSeries('eParallelAndParallelDependencies', eParallelDependencies, eParallelDependencies);
