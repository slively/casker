import {createExampleProjectTaskRunner, parallel, series, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('dependency-graph');

describe('dependency-graph', () => {
	beforeAll(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000);

	it('should run task eSeriesDependencies', () =>
		runTask('eSeriesDependencies')
			.then(verifyLogs(
				series('task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task eParallelDependencies', () =>
		runTask('eParallelDependencies')
			.then(verifyLogs(
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				series('task e')
			))
	);

	it('should run task eSeriesAndParallelDependencies', () =>
		runTask('eSeriesAndParallelDependencies')
			.then(verifyLogs(
				series('task a', 'task b', 'task c', 'task d', 'task e'),
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				series('task e')
			))
	);

	it('should run task eParallelAndSeriesDependencies', () =>
		runTask('eParallelAndSeriesDependencies')
			.then(verifyLogs(
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				series('task e'),
				series('task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task eSeriesAndSeriesDependencies', () =>
		runTask('eSeriesAndSeriesDependencies')
			.then(verifyLogs(
				series('task a', 'task b', 'task c', 'task d', 'task e'),
				series('task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task eParallelAndParallelDependencies', () =>
		runTask('eParallelAndParallelDependencies')
			.then(verifyLogs(
				parallel('task a', 'task b', 'task c', 'task d', 'task e', 'task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task serialTasksOfTasks', () =>
		runTask('serialTasksOfTasks')
			.then(verifyLogs(
				// eSeriesAndParallelDependencies
				series('task a', 'task b', 'task c', 'task d', 'task e'),
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				series('task e'),
				// eParallelAndSeriesDependencies
				parallel('task a', 'task c'),
				parallel('task b', 'task d'),
				series('task e'),
				series('task a', 'task b', 'task c', 'task d', 'task e'),
				// eSeriesAndSeriesDependencies
				series('task a', 'task b', 'task c', 'task d', 'task e'),
				series('task a', 'task b', 'task c', 'task d', 'task e'),
				// eParallelAndParallelDependencies
				parallel('task a', 'task b', 'task c', 'task d', 'task e', 'task a', 'task b', 'task c', 'task d', 'task e')
			))
	);

	it('should run task parallelTasksOfTasks', () =>
		runTask('parallelTasksOfTasks')
			.then(verifyLogs(
				parallel(
					// eSeriesAndParallelDependencies
					'task a', 'task b', 'task c', 'task d', 'task e',
					'task a', 'task c',
					'task b', 'task d',
					'task e',
					// eParallelAndSeriesDependencies
					'task a', 'task c',
					'task b', 'task d',
					'task e',
					'task a', 'task b', 'task c', 'task d', 'task e',
					// eSeriesAndSeriesDependencies
					'task a', 'task b', 'task c', 'task d', 'task e',
					'task a', 'task b', 'task c', 'task d', 'task e',
					// eParallelAndParallelDependencies
					'task a', 'task b', 'task c', 'task d', 'task e', 'task a', 'task b', 'task c', 'task d', 'task e'
				)
			))
	);
});
