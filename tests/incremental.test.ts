import {createExampleProjectTaskRunner, upToDate, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('incremental');

describe('incremental', () => {

	it('should run task copyWithInput', () =>
		runTask('copyWithInput')
			.then(verifyLogs(upToDate('copyWithInput')))
	);
});
