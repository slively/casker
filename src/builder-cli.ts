#!/usr/bin/env node
import {Task, Tasks, TasksMap} from './builder';
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
		logger.log(`${k}: ${v.description}`)
	});
	logger.log('');
};

const Builder = new Liftoff({
	name: 'builder',
	extensions: require('interpret').jsVariants
});

const logFailureAndExit = (e: TaskFailure) => {
	logger.error(`Task ${e.name} failed`);
	process.exit(1);
};

Builder.launch({
	cwd: argv.cwd
}, (env: any) => {
	const taskName = argv._[0];

	if (!env.configPath) {
		return logger.error('No builderfile found.');
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

	const runTask = (task: Task): Promise<void> => {
		const taskLogger = createTaskLogger(task.name);

		taskLogger('started');

		return new Promise<void>((resolve, reject) => {
			const start = Date.now();
			const nodeModulesBinPath = join(task.cwd, 'node_modules/.bin');
			const envPath = [task.env[PATH], process.env[PATH], nodeModulesBinPath]
				.filter(p => !!p)
				.join(delimiter);

			const childProcess = execFile(
				sh,
				[shFlag, task.cmd],
				{
					cwd: task.cwd,
					env: {...task.env, ...process.env, [PATH]: envPath}
				},
				(error: Error, stdout: string, stderr: string) => {
					const didFail = !!error;

					taskLogger('output');
					logger.info((stderr.length ? stderr : stdout).trim());
					taskLogger(`finished (${(Date.now() - start) / 1000}s)`);

					if (!task.isLongRunning) {
						didFail ? reject({name: task.name}) : resolve();
					}

					runningTasks.delete(childProcess);
				});

			runningTasks.set(childProcess, task);

			if (task.isLongRunning) {
				setImmediate(() => resolve());
			}
		})
			.then(() => (task.onExit && !task.isLongRunning) ? runTaskOrTasks(task.onExit) : undefined);
	};

	const runTasks = (tasks: Tasks): Promise<void> =>
		tasks.isParallel
			? Promise.all(tasks.tasks.map(runTask)).then(() => undefined)
			: promiseSeries(tasks.tasks.map(task => () => runTask(task)));

	const runTaskOrTasks = (t: Task | Tasks) => t instanceof ModuleTask ? runTask(t) : runTasks(t);

	const killAllTasks = () => {
		runningTasks.forEach((task: Task, cp: ChildProcess) => {
			treeKill(
				cp.pid,
				undefined,
				() => {
					if (task.onExit !== undefined) {
						runTaskOrTasks(task.onExit)
							.then(killAllTasks, logFailureAndExit);
					}
				}
			);
		});
	};

	const createTaskExecutionStages = (t: Task | Tasks): (() => Promise<void[]>)[] => {
		const stages: (Task | Tasks)[][] = [];
		let currentDepth: (Task | Tasks)[] = [t];

		while (currentDepth.length > 0) {
			stages.unshift(currentDepth);

			currentDepth = currentDepth
				.map((currentDepthTask): (Task | Tasks | undefined)[] =>
					currentDepthTask instanceof ModuleTask
						? [currentDepthTask.dependsOn]
						: currentDepthTask.tasks.map((tasksTask: Task | Tasks) => tasksTask instanceof ModuleTask ? tasksTask.dependsOn : tasksTask)
				)
				.reduce(
					(acc: (Task | Tasks | undefined)[], tasks: (Task | Tasks | undefined)[]) => acc.concat(tasks),
					[]
				)
				.filter((item?: (Task | Tasks)): item is (Task | Tasks) => item !== undefined);
		}

		return stages.map(tasks => (): Promise<void[]> => Promise.all(tasks.map(runTaskOrTasks)));
	};

	process.on('SIGINT', killAllTasks);

	promiseSeries(createTaskExecutionStages(task))
		.then(killAllTasks, logFailureAndExit);
});
