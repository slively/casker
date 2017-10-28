import {createExampleProjectTaskRunner, parallel, serial, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('dependency-graph');

describe('dependency-graph', () => {

	it('should run task eSeriesDependencies', () =>
		runTask('eSeriesDependencies')
			.then(verifyLogs(
				serial('task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task eParallelDependencies', () =>
		runTask('eParallelDependencies')
			.then(verifyLogs(
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				serial('task e')
			))
	);
});
