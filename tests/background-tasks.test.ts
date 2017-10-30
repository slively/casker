import {createExampleProjectTaskRunner, series, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('background-tasks');

describe('background-tasks', () => {

	it('should run task d', () =>
		runTask('d')
			.then(verifyLogs(
				series('task d', 'task c', 'task b', 'task a')
			))
	);

	it('should run task dFailure', () =>
		runTask('dFailure')
			.then(verifyLogs(
				series('task c', 'task b', 'task a')
			))
	);
});
