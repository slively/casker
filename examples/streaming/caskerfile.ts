import {casker} from '../../dist/casker';

const {task} = casker();

const foo = task('foo', 'node ./foo.js');
task('loop', 'node ./loop.js', {description: 'loop.js and stream', streamLogs: true, dependsOn: foo});