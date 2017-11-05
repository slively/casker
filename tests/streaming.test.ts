import {createExampleProjectTasStreamer, verifyLogStream} from './utils';

const streamTask = createExampleProjectTasStreamer('streaming');

describe('streaming', () => {

	it('should run task loop', () =>
		streamTask('loop')
			.then(
				verifyLogStream(['foo', 'loop...', 'loop...', 'loop...', 'loop...', 'loop...'])
			)
	);

});
