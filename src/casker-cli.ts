#!/usr/bin/env node
import {registeredTasks, Task, Tasks} from './casker';
import {ChildProcess, spawn} from 'child_process';
import * as treeKill from 'tree-kill';
import {join, delimiter} from 'path';
import {logger, createTaskLogger, Logger} from './logger';
import {checkUpToDate} from './upToDate';

const packageJson: { [key: string]: string } = require('../package.json');
const Liftoff: any = require('liftoff');
const argv: { _: string[], [key: string]: any } = require('minimist')(process.argv.slice(2));

let PATH = 'PATH';
let sh = 'sh';
let shFlag = '-c';

if (process.platform === 'win32') {
	sh = process.env.comspec || 'cmd';
	shFlag = '/d /s /c';
}

// windows calls it's path 'Path' usually, but this is not guaranteed.
if (process.platform === 'win32') {
	PATH = 'Path';
	Object.keys(process.env).forEach(e => {
		if (e.match(/^PATH$/i)) {
			PATH = e
		}
	});
}

const runningTasks: Map<ChildProcess, Task> = new Map();
const promiseSeries = (promises: (() => Promise<any>)[]) => promises.reduce((current, next) => current.then(next), Promise.resolve(undefined));

const listTasks = () => {
	logger.log('Tasks');
	registeredTasks.forEach((v, k) => {
		logger.log(`${k} ${v.description ? '- ' + v.description : ''}`)
	});
	logger.log('');
};

const runTasks = (tasks: Tasks): Promise<void> =>
	tasks.isParallel
		? Promise.all(tasks.tasks.map(runTask)).then(() => undefined)
		: promiseSeries(tasks.tasks.map(t => () => runTaskOrTasks(t)));

const runTaskOrTasks = (t: Task | Tasks) => t instanceof Task ? runTask(t) : runTasks(t);

const runTaskWithDependencies = (t: Task | Tasks): Promise<void> => {
	if (t instanceof Task) {
		return t.dependsOn == null
			? runTask(t)
			: runTaskWithDependencies(t.dependsOn).then(() => runTask(t));
	}

	return t.isParallel
		? Promise.all(t.tasks.map(t2 => runTaskWithDependencies(t2)))
		: promiseSeries(t.tasks.map(t2 => () => runTaskWithDependencies(t2)))
};

const killAllTasks = () => {
	// TODO: deal with killing background processes run onExit? Or should that just be discouraged?
	Promise.all(
		Array.from(runningTasks.entries()).map(([cp, t]: [ChildProcess, Task]) =>
			new Promise(((resolve, reject) => {
					treeKill(
						cp.pid,
						undefined,
						() => {
							if (t.onExit !== undefined) {
								runTaskWithDependencies(t.onExit).then(() => resolve(), (e) => reject(e));
							}
						}
					);
				})
			)
		)
	).then(() => process.exit(), () => process.exit(1));
};

const aggregateLogs = (taskLogger: Logger, childProcess: ChildProcess) => {
	const logs: string[] = [];
	const aggregate = (data: Buffer) => {
		logs.push(data.toString())
	};

	childProcess.stdout.on('data', aggregate);
	childProcess.stderr.on('data', aggregate);
	childProcess.on('close', () => {
		taskLogger('output');
		logger.info(logs.join('\r\n').trim());
	});
};

const streamLogs = (taskLogger: Logger, childProcess: ChildProcess) => {
	const stream = (data: Buffer) => logger.info(data.toString());

	taskLogger('output');
	childProcess.stdout.on('data', stream);
	childProcess.stderr.on('data', stream);
};

const runTask = (t: Task): Promise<void> => {
	const taskLogger = createTaskLogger(t.name);

	return checkUpToDate(t).then(
		(isUpToDate: boolean) => {
			if (isUpToDate) {
				taskLogger('up-to-date');
				return;
			}

			taskLogger('started');

			return new Promise<void>((resolve, reject) => {
				const start = Date.now();
				const nodeModulesBinPath = join(t.cwd, 'node_modules', '.bin');
				const envPath = [t.env[PATH], process.env[PATH], nodeModulesBinPath]
					.filter(p => !!p)
					.join(delimiter);

				const childProcess = spawn(
					sh,
					[shFlag, t.cmd],
					{
						cwd: t.cwd,
						env: {...t.env, ...process.env, [PATH]: envPath}
					});

				t.streamLogs ? streamLogs(taskLogger, childProcess) : aggregateLogs(taskLogger, childProcess);

				const done = (code: number) => {
					const didFail = code > 0;
					taskLogger(`finished (${(Date.now() - start) / 1000}s)`);

					if (!t.runInBackground) {
						didFail ? reject({name: t.name}) : resolve();
					}

					runningTasks.delete(childProcess);
				};

				childProcess.on('close', done);
				childProcess.on('error', (err: Error) => {
					taskLogger(`error: ${err}`);
					done(1);
				});

				runningTasks.set(childProcess, t);

				if (t.runInBackground) {
					setImmediate(() => resolve());
				}
			})
				.then(() => (t.onExit && !t.runInBackground) ? runTaskOrTasks(t.onExit) : undefined);
		},
		(error: Error) => logger.error(`Error checking up-to-date for task ${t.name}: ${error}`)
	);
};

export default function executeTask(taskName: string) {
	if (!taskName) {
		return listTasks();
	}

	const task = registeredTasks.get(taskName);

	if (task === undefined) {
		logger.error(`Could not find task '${taskName}'.`);
		process.exit(1);
		return;
	}

	process.on('SIGINT', killAllTasks);
	runTaskWithDependencies(task).then(killAllTasks, killAllTasks);
};

if (require.main === module) {
	const Builder = new Liftoff({
		name: 'casker',
		configName: 'caskerfile',
		extensions: require('interpret').jsVariants
	});

	if (argv.cwd) {
		process.chdir(argv.cwd);
	}

	Builder.launch(
		{
			cwd: argv.cwd
		},
		(env: any) => {
			if (!env.configPath) {
				return logger.error('No caskerfile found.');
			}

			if (packageJson.version !== env.modulePackage.version) {
				logger.warn(`Global version ${packageJson.version} is different from local version ${env.modulePackage.version}.`);
			}

			const taskName = argv._[0];
			let localExecuteTask = executeTask;

			// we import the casker-cli module so the cli methods are not exposed to the user via the cakser module
			if (env.modulePath) {
				localExecuteTask = require(env.modulePath.replace('casker.js', 'casker-cli.js')).default;
			} else {
				logger.warn('Builder is not installed locally.');
			}

			require(env.configPath);
			localExecuteTask(taskName);
		}
	);
}
