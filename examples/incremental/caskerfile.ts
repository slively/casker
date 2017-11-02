import {casker} from '../../dist/casker';

const {task} = casker();
const inputFile = './foo.txt';
const outputFilePath = (taskName: string) => `${taskName}_bar.txt`;

task(
	'copyWithInput', `node ./copy ${inputFile} ${outputFilePath('copyWithInput')}`,
	{inputs: [inputFile]}
);

const copyWithOutputOutputFilePath = outputFilePath('copyWithOutput');
task(
	'copyWithOutput', `node ./copy ${inputFile} ${copyWithOutputOutputFilePath}`,
	{outputs: [copyWithOutputOutputFilePath]}
);

const copyWithInputAndOutputOutputFilePath = outputFilePath('copyWithInputAndOutput');
task(
	'copyWithInputAndOutput', `node ./copy ${inputFile} ${copyWithInputAndOutputOutputFilePath}`,
	{inputs: [inputFile], outputs: [copyWithInputAndOutputOutputFilePath]}
);
