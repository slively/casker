import {createExampleProjectTaskRunner, serial, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('simple');

describe('simple', () => {

	it('should run task a', () =>
		runTask('a')
			.then(verifyLogs(serial('weeeeeee!')))
	);

	it('should run task b', () =>
		runTask('b')
			.then(verifyLogs(serial('weeeeeee!', 'woooooo!')))
	);

	it('should run task e', () =>
		runTask('e')
			.then(verifyLogs(
				serial('woooooo!'),
				serial('weeeeeee!', 'weeeeeee!', 'weeeeeee!')
			))
	);

});
