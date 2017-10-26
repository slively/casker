import {builder} from '../../dist/builder';
import {someTask as someTaskA} from './project-a/builderfile';
import {someTask as someTaskB} from './project-b/builderfile';

const {tasksParallel, tasksSeries} = builder({cwd: __dirname});

tasksParallel('allParallel', someTaskA, someTaskB);
tasksSeries('allSeries', someTaskA, someTaskB);
