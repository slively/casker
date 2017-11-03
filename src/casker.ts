import {logger} from './logger';

export type TasksMap = Map<string, Task | Tasks>;
export const registeredTasks: TasksMap = new Map<string, Task | Tasks>();

export type TaskInput = string | (() => Promise<string[] | number[]>);

export type CreateTaskOptions = {
	env?: object;
	runInBackground?: boolean;
	description?: string;
	dependsOn?: Task | Tasks;
	onExit?: Task | Tasks;
	inputs?: TaskInput[];
}

export class Task {
	constructor(readonly name: string,
							readonly cmd: string,
							readonly cwd: string,
							readonly env: object = {},
							readonly runInBackground: boolean = false,
							readonly description: string = '',
							readonly inputs: TaskInput[],
							readonly dependsOn?: Task | Tasks,
							readonly onExit?: Task | Tasks) {
	}
}

export class Tasks {
	constructor(readonly name: string,
							readonly description: string = '',
							readonly tasks: Task[] = [],
							readonly isParallel: boolean = true) {
	}
}

export class TaskBuilder {
	constructor(private namespace: string = '', private cwd: string = process.cwd()) {
	}

	tasksParallel = (name: string, ...tasks: Task[]): Tasks => this.tasks(this.createTaskName(name), tasks, true);
	tasksSeries = (name: string, ...tasks: Task[]): Tasks => this.tasks(this.createTaskName(name), tasks, false);

	task = (name: string, cmd: string, options: CreateTaskOptions = {}): Task => {
		const {env, runInBackground, description, dependsOn, onExit, inputs = []} = options;
		const t = new Task(this.createTaskName(name), cmd, this.cwd, env, runInBackground, description, inputs, dependsOn, onExit);

		this.registerTask(t);

		return t;
	};

	private createTaskName(name: string) {
		return `${this.namespace.length ? `${this.namespace}:` : ''}${name}`;
	}

	private tasks(name: string, tasks: Task[], isParallel: boolean): Tasks {
		const t = new Tasks(name, undefined, tasks, isParallel);

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
