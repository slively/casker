import {casker} from '../../dist/casker';

const {task} = casker();

const b = task('b', 'ts-node taskB');
const a = task('a', 'ts-node taskA', {dependsOn: b});
const c = task('c', 'ts-node taskCBackground', {runInBackground: true, onExit: a});
task('d', 'ts-node taskD', {dependsOn: c});
task('dFailure', 'ts-node taskDFailure', {dependsOn: c});
