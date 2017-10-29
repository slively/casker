import {createExampleProjectTaskRunner, parallel, serial, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('dependency-graph');

describe('dependency-graph', () => {
	beforeAll(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000);

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

	it('should run task eSeriesAndParallelDependencies', () =>
		runTask('eSeriesAndParallelDependencies')
			.then(verifyLogs(
				serial('task a', 'task b', 'task c', 'task d', 'task e'),
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				serial('task e')
			))
	);

	it('should run task eParallelAndSeriesDependencies', () =>
		runTask('eParallelAndSeriesDependencies')
			.then(verifyLogs(
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				serial('task e'),
				serial('task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task eSeriesAndSeriesDependencies', () =>
		runTask('eSeriesAndSeriesDependencies')
			.then(verifyLogs(
				serial('task a', 'task b', 'task c', 'task d', 'task e'),
				serial('task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task eParallelAndParallelDependencies', () =>
		runTask('eParallelAndParallelDependencies')
			.then(verifyLogs(
				parallel('task a', 'task b', 'task c', 'task d', 'task e', 'task a', 'task b', 'task c', 'task d', 'task e')
			))
	);
});
