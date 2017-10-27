import {casker} from '../../dist/casker';
import {someTask as someTaskA} from './project-a/caskerfile';
import {someTask as someTaskB} from './project-b/caskerfile';

const {tasksParallel, tasksSeries} = casker({cwd: __dirname});

tasksParallel('allParallel', someTaskA, someTaskB);
tasksSeries('allSeries', someTaskA, someTaskB);
