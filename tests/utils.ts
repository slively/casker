import {exec} from 'child_process';

export const createExampleProjectTaskRunner = (projectName: string) => (taskName: string) =>
	new Promise<string>(((resolve, reject) =>
			exec(
				`node dist/builder-cli.js ${taskName} --cwd ./examples/${projectName}`,
				(err, stdout, stderr) => err ? reject(err) : resolve(stdout)
			)
	));

type LogVerifier = (logs: string, currentIndex: number) => number;
type ComposableLogVerifier = (...args: string[]) => LogVerifier;

const logError = (log: string, logs: string) => {
	throw new Error(`${logs}\nLog not found in correct place: ${log}`);
};

export const serial: ComposableLogVerifier = (...args: string[]) => (logs: string, currentIndex = -1) => {
	return args.reduce((nextIndex, arg) => {
		const index = logs.indexOf(arg, nextIndex);

		if (index === -1) {
			logError(arg, logs);
		}

		return index;
	}, currentIndex);
};

export const parallel: ComposableLogVerifier = (...args: string[]) => (logs: string, currentIndex = -1) => {
	let nextIndex = currentIndex;

	for (const arg of args) {
		const index = logs.indexOf(arg);

		if (index === -1) {
			logError(arg, logs);
		} else if (index > nextIndex) {
			nextIndex = index;
		}
	}

	return nextIndex;
};

export const verifyLogs = (...verifiers: LogVerifier[]) => (logs: string): boolean => {
	let currentIndex = -1;

	for (const verify of verifiers) {
		currentIndex = verify(logs, currentIndex);
	}

	return true;
};
