import {logger} from './logger';

export type TasksMap = Map<string, Task | Tasks>;
export const registeredTasks: TasksMap = new Map<string, Task | Tasks>();

export type CreateTaskOptions = {
	env?: object;
	isLongRunning?: boolean;
	description?: string;
	dependsOn?: Task | Tasks;
	onExit?: Task | Tasks;
}

export class Task {
	constructor(readonly name: string,
							readonly cmd: string,
							readonly cwd: string,
							readonly env: object = {},
							readonly isLongRunning: boolean = false,
							readonly description: string = '',
							readonly dependsOn?: Task | Tasks,
							readonly onExit?: Task | Tasks) {
	}
}

export class Tasks {
	constructor(readonly name: string,
							readonly description: string = '',
							readonly tasks: Task[] = [],
							readonly isParallel = true) {
	}
}

export class TaskBuilder {
	constructor(private namespace: string = '', private cwd: string = process.cwd()) {
	}

	tasksParallel = (name: string, ...tasks: Task[]): Tasks => this.tasks(name, tasks, true);
	tasksSeries = (name: string, ...tasks: Task[]): Tasks => this.tasks(name, tasks, false);

	task = (name: string, cmd: string, options: CreateTaskOptions = {}): Task => {
		const {env, isLongRunning, description, dependsOn, onExit} = options;
		const t = new Task(`${this.namespace.length ? `${this.namespace}:` : ''}${name}`, cmd, this.cwd, env, isLongRunning, description, dependsOn, onExit);

		this.registerTask(t);

		return t;
	};

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

		return t;
	}
}

export interface BuilderOptions {
	namespace?: string;
	cwd?: string;
}

export const casker = (options: BuilderOptions = {}): TaskBuilder => {
	const {namespace , cwd} = options;

	return new TaskBuilder(namespace, cwd)
};
