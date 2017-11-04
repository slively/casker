import {exec} from 'child_process';
import * as rimraf from 'rimraf';
import {promisify} from 'util';
import {join} from 'path';
import {config} from '../src/config';

export const getExampleProjectDirectory = (projectName: string) => join('./examples', projectName);

const deleteTaskCache = (projectName: string, taskName: string) =>
	promisify(rimraf)(join(getExampleProjectDirectory(projectName), '.casker', config.version, `${taskName}.json`));

const runTask = (projectName: string, taskName: string) => new Promise<string>(((resolve, reject) =>
		exec(
			`node dist/casker-cli.js ${taskName} --cwd ${getExampleProjectDirectory(projectName)}`,
			(err, stdout, stderr) => err ? reject(err) : resolve(stdout)
		)

));

export const createExampleProjectTaskRunner = (projectName: string) => (taskName: string) =>
	deleteTaskCache(projectName, taskName)
		.then(() => runTask(projectName, taskName));

type LogVerifier = (logs: string, currentIndex: number) => number;
type ComposableLogVerifier = (...args: any[]) => LogVerifier;

const throwError = (log: string, logs: string) => {
	throw new Error(`${logs}\nLog not found in correct place: ${log}`);
};

export const series: ComposableLogVerifier = (...args: string[]) => (logs: string, currentIndex) => {
	return args.reduce(
		(nextIndex, arg) => {
			const index = logs.indexOf(arg, nextIndex);

			if (index === -1) {
				throwError(arg, logs);
			}

			return index;
		},
		-1
	);
};

export const parallel: ComposableLogVerifier = (...args: string[]) => (logs: string, currentIndex) => {
	let nextIndex = -1;
	const foundIndexes: number[] = [];

	for (const arg of args) {
		let index = -1;

		while (foundIndexes.indexOf(index) > -1) {
			index = logs.indexOf(arg, index + 1);

			if (index === -1) {
				throwError(arg, logs);
			}
		}

		if (index > nextIndex) {
			nextIndex = index;
		}

		foundIndexes.push(index)
	}

	return nextIndex;
};

export const upToDate: ComposableLogVerifier = (taskName: string) => (logs: string, currentIndex) => {
	for (let i = currentIndex; i < logs.length; i++) {
		if (logs[i].indexOf(`${taskName} up-to-date`)) {
			return i;
		}
	}

	return -1;
};

export const verifyLogs = (...verifiers: LogVerifier[]) => (logs: string): boolean => {
	let currentIndex = 0;

	for (const verify of verifiers) {
		currentIndex = verify(logs, currentIndex);
	}

	return true;
};
