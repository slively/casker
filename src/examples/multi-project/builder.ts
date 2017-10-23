import {builder} from '../../builder';
import {someTask as someTaskA} from './project-a/builder';
import {someTask as someTaskB} from './project-b/builder';

const {tasksParallel, tasksSeries} = builder({cwd: __dirname});

tasksParallel('allParallel', someTaskA, someTaskB);
tasksSeries('allSeries', someTaskA, someTaskB);
