import {casker, Task} from '../../../dist/casker';

const {task, tasksSeries} = casker({namespace: 'project-a', cwd: __dirname});

export const someTask: Task = task('someTask', 'ts-node ./task');
const anotherTask = task('anotherTask', 'ts-node ./anotherTask');
tasksSeries('bothTasks', someTask, anotherTask);
tasksSeries('bothTasksParallel', someTask, anotherTask);
