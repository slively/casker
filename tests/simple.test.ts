import {createExampleProjectTaskRunner, parallel, serial, verifyLogs} from './utils';

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

	it('should run task c', () =>
		runTask('c')
			.then(verifyLogs(
				serial('weeeeeee!', 'weeeeeee!', 'weeeeeee!'),
				serial('woooooo!')
			))
	);

	it('should run task d', () =>
		runTask('d')
			.then(verifyLogs(
				parallel('weeeeeee!', 'weeeeeee!', 'weeeeeee!'),
				serial('woooooo!')
			))
	);

	it('should run task e', () =>
		runTask('e')
			.then(verifyLogs(
				serial('woooooo!'),
				serial('weeeeeee!', 'weeeeeee!', 'weeeeeee!')
			))
	);

	it('should run task f', () =>
		runTask('f')
			.then(verifyLogs(
				serial('woooooo!'),
				parallel('weeeeeee!', 'weeeeeee!', 'weeeeeee!')
			))
	);
});
