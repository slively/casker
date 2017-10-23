import {Task, Tasks, registeredTasks} from './builder';
import {ChildProcess, execFile} from 'child_process';
import * as treeKill from 'tree-kill';
import {join, delimiter} from 'path';
import {logger, createTaskLogger} from './logger';
const Liftoff = require('liftoff');

let PATH = 'PATH';
let sh = 'sh';
let shFlag = '-c';

if (process.platform === 'win32') {
	sh = process.env.comspec || 'cmd';
	shFlag = '/d /s /c';
	//conf.windowsVerbatimArguments = true
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

const runningTasks: Set<ChildProcess> = new Set();
const promiseSeries = (promises: (() => Promise<any>)[]) => promises.reduce((current, next) => current.then(next), Promise.resolve(undefined));

const runTask = (task: Task): Promise<void> => {
	const taskLogger = createTaskLogger(task.name);

	taskLogger('started');

	return new Promise<void>((resolve, reject) => {
		const start = Date.now();
		const nodeModulesBinPath = join(task.cwd, 'node_modules/.bin');
		const envPath = [task.env[PATH], process.env[PATH], nodeModulesBinPath]
			.filter(p => !!p)
			.join(delimiter);
		console.log(envPath);

		const childProcess = execFile(
			sh,
			[shFlag, task.cmd],
			{
				cwd: task.cwd,
				env: {...task.env, ...process.env, [PATH]: envPath }
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

		runningTasks.add(childProcess);

		if (task.isLongRunning) {
			setImmediate(() => resolve());
		}
	})
		.then(() => task.onExit ? runTaskOrTasks(task.onExit) : undefined);
};

const runTasks = (tasks: Tasks): Promise<void> =>
	tasks.isParallel
		? Promise.all(tasks.tasks.map(runTask)).then(() => undefined)
		: promiseSeries(tasks.tasks.map(task => () => runTask(task)));

const runTaskOrTasks = (t: Task | Tasks) => t instanceof Task ? runTask(t) : runTasks(t);

const killAllTasks = () => {
	runningTasks.forEach((cp: ChildProcess) => {
		treeKill(cp.pid);
	});
};

const Builder = new Liftoff({
	name: 'builder',
	extensions: require('interpret').jsVariants
});

const createTaskExecutionStages = (t: Task | Tasks): (() => Promise<void[]>)[] => {
	const stages: (Task | Tasks)[][] = [];
	let currentDepth: (Task | Tasks)[] = [t];

	while (currentDepth.length > 0) {
		stages.unshift(currentDepth);

		currentDepth = currentDepth
			.map((currentDepthTask): (Task | Tasks | undefined)[] =>
				currentDepthTask instanceof Task
					? [currentDepthTask.dependency]
					: currentDepthTask.tasks.map((tasksTask: Task | Tasks) => tasksTask instanceof Task ? tasksTask.dependency : tasksTask)
			)
			.reduce(
				(acc: (Task | Tasks | undefined)[], tasks: (Task | Tasks | undefined)[]) => acc.concat(tasks),
				[]
			)
			.filter((item?: (Task | Tasks)): item is (Task | Tasks) => item !== undefined);
	}

	return stages.map(tasks => (): Promise<void[]> => Promise.all(tasks.map(runTaskOrTasks)));
};

/*
const listTasks = () => {
	logger('Tasks');
	registeredTasks.forEach((v, k) => {
		logger(`${k}: ${v.description}`)
	});
	logger('');
};*/

Builder.launch({}, () => {
	const taskName = process.argv[process.argv.length - 1];

	// TODO: list all tasks with description if no task given
	require(join(process.cwd(), 'builder.ts'));

	// listTasks();

	const task = registeredTasks.get(taskName);

	if (task === undefined) {
		logger.error(`Could not find task '${taskName}'.`);
		process.exit(1);
		return;
	}

	promiseSeries(createTaskExecutionStages(task))
		.then(
			() => {
				killAllTasks();
			},
			(e: TaskFailure) => {
				logger.error(`Task ${e.name} failed`);
				process.exit(1);
			}
		);
});

process.on('SIGINT', killAllTasks);
