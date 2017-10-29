#!/usr/bin/env node
import {Task, Tasks, TasksMap} from './casker';
import {ChildProcess, execFile} from 'child_process';
import * as treeKill from 'tree-kill';
import {join, delimiter} from 'path';
import {logger, createTaskLogger} from './logger';

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

type TaskFailure = { name: string };

const runningTasks: Map<ChildProcess, Task> = new Map();
const promiseSeries = (promises: (() => Promise<any>)[]) => promises.reduce((current, next) => current.then(next), Promise.resolve(undefined));

const listTasks = (registeredTasks: TasksMap) => {
	logger.log('Tasks');
	registeredTasks.forEach((v, k) => {
		logger.log(`${k} ${v.description ? '-' + v.description : ''}`)
	});
	logger.log('');
};

const Builder = new Liftoff({
	name: 'casker',
	extensions: require('interpret').jsVariants
});

const logFailureAndExit = (e: TaskFailure) => {
	logger.error(`Task ${e.name} failed`);
	process.exit(1);
};

if (argv.cwd) {
	process.chdir(argv.cwd);
}

Builder.launch(
	{
		cwd: argv.cwd
	},
	(env: any) => {
		const taskName = argv._[0];

		if (!env.configPath) {
			return logger.error('No caskerfile found.');
		}

		if (!env.modulePath) {
			return logger.error('Builder is not installed locally.');
		}

		if (packageJson.version !== env.modulePackage.version) {
			logger.warn(`Global version ${packageJson.version} is different from local version ${env.modulePackage.version}.`);
		}

		require(env.configPath);
		type ModuleTaskType = new () => Task;
		const {registeredTasks, Task: ModuleTask}: { registeredTasks: TasksMap, Task: ModuleTaskType } = require(env.modulePath);

		if (!taskName) {
			return listTasks(registeredTasks);
		}

		const task = registeredTasks.get(taskName);

		if (task === undefined) {
			logger.error(`Could not find task '${taskName}'.`);
			process.exit(1);
			return;
		}

		const runTask = (t: Task): Promise<void> => {
			const taskLogger = createTaskLogger(t.name);

			taskLogger('started');

			return new Promise<void>((resolve, reject) => {
				const start = Date.now();
				const nodeModulesBinPath = join(t.cwd, 'node_modules/.bin');
				const envPath = [t.env[PATH], process.env[PATH], nodeModulesBinPath]
					.filter(p => !!p)
					.join(delimiter);

				const childProcess = execFile(
					sh,
					[shFlag, t.cmd],
					{
						cwd: t.cwd,
						env: {...t.env, ...process.env, [PATH]: envPath}
					},
					(error: Error, stdout: string, stderr: string) => {
						const didFail = !!error;

						taskLogger('output');
						logger.info((stderr.length ? stderr : stdout).trim());
						taskLogger(`finished (${(Date.now() - start) / 1000}s)`);

						if (!t.isLongRunning) {
							didFail ? reject({name: t.name}) : resolve();
						}

						runningTasks.delete(childProcess);
					}
				);

				runningTasks.set(childProcess, t);

				if (t.isLongRunning) {
					setImmediate(() => resolve());
				}
			})
				.then(() => (t.onExit && !t.isLongRunning) ? runTaskOrTasks(t.onExit) : undefined);
		};

		const runTasks = (tasks: Tasks): Promise<void> =>
			tasks.isParallel
				? Promise.all(tasks.tasks.map(runTask)).then(() => undefined)
				: promiseSeries(tasks.tasks.map(t => () => runTask(t)));

		const runTaskOrTasks = (t: Task | Tasks) => t instanceof ModuleTask ? runTask(t) : runTasks(t);

		const runTaskWithDependencies = (t: Task | Tasks): Promise<void> => {
			if (t instanceof ModuleTask) {
				return t.dependsOn == null
					? runTask(t)
					: runTaskWithDependencies(t.dependsOn).then(() => runTask(t));
			}

			return t.isParallel
				? Promise.all(t.tasks.map(t2 => runTaskWithDependencies(t2)))
				: promiseSeries(t.tasks.map(t2 => () => runTaskWithDependencies(t2)))
		};

		const killAllTasks = () => {
			runningTasks.forEach((t: Task, cp: ChildProcess) => {
				treeKill(
					cp.pid,
					undefined,
					() => {
						if (t.onExit !== undefined) {
							runTaskOrTasks(t.onExit)
								.then(killAllTasks, logFailureAndExit);
						}
					}
				);
			});
		};

		process.on('SIGINT', killAllTasks);
		runTaskWithDependencies(task).then(killAllTasks, logFailureAndExit);
	}
);
