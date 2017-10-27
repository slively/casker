export declare type TasksMap = Map<string, Task | Tasks>;
export declare const registeredTasks: TasksMap;
export declare type CreateTaskOptions = {
    env?: object;
    isLongRunning?: boolean;
    description?: string;
    dependsOn?: Task | Tasks;
    onExit?: Task | Tasks;
};
export declare class Task {
    readonly name: string;
    readonly cmd: string;
    readonly cwd: string;
    readonly env: object;
    readonly isLongRunning: boolean;
    readonly description: string;
    readonly dependsOn: Task | Tasks | undefined;
    readonly onExit: Task | Tasks | undefined;
    constructor(name: string, cmd: string, cwd: string, env?: object, isLongRunning?: boolean, description?: string, dependsOn?: Task | Tasks | undefined, onExit?: Task | Tasks | undefined);
}
export declare class Tasks {
    readonly name: string;
    readonly description: string;
    readonly tasks: Task[];
    readonly isParallel: boolean;
    constructor(name: string, description?: string, tasks?: Task[], isParallel?: boolean);
}
export declare class TaskBuilder {
    private namespace;
    private cwd;
    constructor(namespace?: string, cwd?: string);
    tasksParallel: (name: string, ...tasks: Task[]) => Tasks;
    tasksSeries: (name: string, ...tasks: Task[]) => Tasks;
    task: (name: string, cmd: string, options?: CreateTaskOptions) => Task;
    private tasks(name, tasks, isParallel);
    private registerTask(t);
}
export interface BuilderOptions {
    namespace?: string;
    cwd?: string;
}
export declare const builder: (options?: BuilderOptions) => TaskBuilder;
