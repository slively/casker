import {casker, Task} from '../../../dist/casker';

const {task} = casker({namespace: 'project-a', cwd: __dirname});

export const someTask: Task = task('someTask', 'ts-node ./task');
