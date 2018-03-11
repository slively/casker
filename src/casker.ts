import {logger} from './logger';

export type TasksMap = Map<string, Task | Tasks>;
export const registeredTasks: TasksMap = new Map<string, Task | Tasks>();

export type TaskIO = string | ((cwd: string) => Promise<string[] | number[]>);

export type CreateTaskOptions = {
	env?: object;
	runInBackground?: boolean;
	description?: string;
	dependsOn?: Task | Tasks;
	onExit?: Task | Tasks;
	inputs?: TaskIO[];
	outputs?: TaskIO[];
	streamLogs?: boolean;
}

export class Task {
	constructor(readonly name: string,
							readonly cmd: string,
							readonly cwd: string,
							readonly env: object = {},
							readonly runInBackground: boolean = false,
							readonly description: string = '',
							readonly inputs: TaskIO[] = [],
							readonly outputs: TaskIO[] = [],
							readonly dependsOn?: Task | Tasks,
							readonly onExit?: Task | Tasks,
							readonly streamLogs: boolean = false) {
	}
}

export class Tasks {
	constructor(readonly name: string,
							readonly tasks: (Task | Tasks)[] = [],
							readonly isParallel: boolean = true) {
		this.description = `Execute tasks ${tasks.map(t => t.name).join(', ')} in ${isParallel ? 'parallel' : 'series'}`;
	}

	readonly description: string;
}

export class TaskBuilder {
	constructor(private namespace: string = '', private cwd: string = process.cwd()) {
	}

	tasksParallel = (name: string, ...tasks: (Task | Tasks)[]): Tasks => this.tasks(this.createTaskName(name), tasks, true);
	tasksSeries = (name: string, ...tasks: (Task | Tasks)[]): Tasks => this.tasks(this.createTaskName(name), tasks, false);

	task = (name: string, cmd: string, options: CreateTaskOptions = {}): Task => {
		const {env, runInBackground, description, dependsOn, onExit, inputs, outputs, streamLogs} = options;
		const t = new Task(this.createTaskName(name), cmd, this.cwd, env, runInBackground, description, inputs, outputs, dependsOn, onExit, streamLogs);

		this.registerTask(t);

		return t;
	};

	private createTaskName(name: string) {
		return `${this.namespace.length ? `${this.namespace}:` : ''}${name}`;
	}

	private tasks(name: string, tasks: (Task | Tasks)[], isParallel: boolean): Tasks {
		const t = new Tasks(name, tasks, isParallel);

		this.registerTask(t);

		return t;
	}

	// TODO: check for cycles
	private registerTask(t: Task | Tasks) {
		if (registeredTasks.get(t.name)) {
			logger.error(new Error(`Task already exists with name '${t.name}'.`));
			process.exit(1);
		}

		registeredTasks.set(t.name, t);
	}
}

export interface BuilderOptions {
	namespace?: string;
	cwd?: string;
}

export const casker = (options: BuilderOptions = {}): TaskBuilder => {
	const {namespace, cwd} = options;

	return new TaskBuilder(namespace, cwd)
};
