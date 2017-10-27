import {casker, Task} from '../../../dist/casker';

const {task} = casker({namespace: 'project-b', cwd: __dirname});

export const someTask: Task = task('someTask', 'ts-node ./task');
