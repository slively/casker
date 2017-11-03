import {casker} from '../../dist/casker';

const {task} = casker();
const inputFile = './foo.txt';

task(
	'copyWithInput', `node ./copy ${inputFile} ./bar.txt`,
	{inputs: [inputFile]}
);
