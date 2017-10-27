import {createExampleProjectTaskRunner, parallel, serial, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('multi-project');

describe('simple', () => {

	it('should run task allSeries', () =>
		runTask('allSeries')
			.then(verifyLogs(serial('project a task', 'project b task')))
	);

	it('should run task allParallel', () =>
		runTask('allParallel')
			.then(verifyLogs(parallel('project a task', 'project b task')))
	);

});
