import {createExampleProjectTaskRunner, parallel, series, verifyLogs} from './utils';

const runTask = createExampleProjectTaskRunner('simple');

describe('simple', () => {

	it('should run task a', () =>
		runTask('a')
			.then(verifyLogs(series('weeeeeee!')))
	);

	it('should run task b', () =>
		runTask('b')
			.then(verifyLogs(series('weeeeeee!', 'woooooo!')))
	);

	it('should run task c', () =>
		runTask('c')
			.then(verifyLogs(
				series('weeeeeee!', 'weeeeeee!', 'weeeeeee!'),
				series('woooooo!')
			))
	);

	it('should run task d', () =>
		runTask('d')
			.then(verifyLogs(
				parallel('weeeeeee!', 'weeeeeee!', 'weeeeeee!'),
				series('woooooo!')
			))
	);

	it('should run task e', () =>
		runTask('e')
			.then(verifyLogs(
				series('woooooo!'),
				series('weeeeeee!', 'weeeeeee!', 'weeeeeee!')
			))
	);

	it('should run task f', () =>
		runTask('f')
			.then(verifyLogs(
				series('woooooo!'),
				parallel('weeeeeee!', 'weeeeeee!', 'weeeeeee!')
			))
	);
});
