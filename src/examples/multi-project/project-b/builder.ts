import {builder, Task} from '../../../builder';

const {task} = builder({namespace: 'project-b', cwd: __dirname});

export const someTask: Task = task('someTask', 'ts-node ./task');
