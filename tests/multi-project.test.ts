import {createExampleProjectTaskRunner, parallel, series, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('multi-project');

describe('multi-project', () => {

	it('should run task allSeries', () =>
		runTask('allSeries')
			.then(verifyLogs(series('project a task', 'project b task')))
	);

	it('should run task allParallel', () =>
		runTask('allParallel')
			.then(verifyLogs(parallel('project a task', 'project b task')))
	);

	it('should run task project-a someTask', () =>
		runTask('project-a:someTask')
			.then(verifyLogs(series('project a task')))
	);

	it('should run task project-a bothTasks', () =>
		runTask('project-a:bothTasks')
			.then(verifyLogs(series('project a task', 'project a another task')))
	);

	it('should run task project-a bothTasksParallel', () =>
		runTask('project-a:bothTasksParallel')
			.then(verifyLogs(parallel('project a task', 'project a another task')))
	);


	it('should run task project-b someTask', () =>
		runTask('project-b:someTask')
			.then(verifyLogs(series('project b task')))
	);

});
