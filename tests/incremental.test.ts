import {createExampleProjectTaskRunner, getExampleProjectDirectory, series, upToDate, verifyLogs} from './utils';
import {promisify} from 'util';
import {unlink} from 'fs';
import {join} from 'path';

const runTask = createExampleProjectTaskRunner('incremental');

describe('incremental', () => {

	afterAll(() => promisify(unlink)(join(getExampleProjectDirectory('incremental'), 'bar.txt')));

	it('should run task copyWithInput', () =>
		runTask('copyWithInput')
			.then(verifyLogs(series('file copied!')))
			.then(() => runTask('copyWithInput'))
			.then(verifyLogs(upToDate('copyWithInput')))
	);

});
