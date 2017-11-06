# Casker

A task runner modeled after npm scripts, but with a task dependency graph, easy parallel/serial execution, and up to date checking of inputs.

Install locally in project, then global cli will use local version.
```
npm install casker --save-dev && npm install -g casker
```

### original package.json
```json
{
	"scripts": {
		"compile": "tsc",
		"lint": "jshint",
		"test": "jest",
		"build": "npm run compile && npm run lint && npm run test"
	}
}
```

### new caskerfile.ts
```javascript
import {casker} from 'casker';

const {task, tasksParallel, tasksSeries} = casker();
const srcFiles= './src/**/*.*';

const install = task('install', 'npm install', { inputs: ['package.json', 'yarn.lock'], description: 'Install dependencies' });
const lint = task('lint', 'tslint', {dependsOn: install, inputs: [srcFiles, './tslintconfig.json'], description: 'Run linter' });
const test = task('test', 'jest', {dependsOn: install, inputs: [srcFiles, './jest.config.json'], description: 'Run tests' });
const compile = task('compile', 'tsc', {dependsOn: install, inputs: [srcFiles, './tsconfig.json'], description: 'Compile typescript' });

tasksParallel('buildParallel', compile, lint, test);
tasksSeries('buildSeries', compile, lint, test);
```

With a bit more effort we now have tasks that will make sure dependencies are up to date and only re-run when a file actually changes. 
We can also easily parallelize tasks instead of just running them sequentially. As the build grows in complexity the benefits only increase.

### Run a task

```
casker test

install started
install output
...
install finished (4.933s)
test started
test output
...
test finished (13.313s)
```

### List tasks by running without any arguments

```
casker

Tasks
install - Install dependencies
lint - Run jshint
test - Run tests
compile - Compile typescript
buildParallel - Execute tasks compile, lint, test in parallel
buildSeries - Execute tasks compile, lint, test in series
```

## Features

- Simple script execution just like npm 'scripts'
  - Will look for globally installed modules and in the local node_modules/.bin  
- Create task dependencies
- Run tasks in series or parallel
- Multi-Project support
- Typescript support
  - Along with any other js variant thanks to [Liftoff](https://www.npmjs.com/package/liftoff) & [interpret](https://www.npmjs.com/package/interpret)
- Logs are aggregated by task 
  - With option for streaming logs for any task
- Run tasks in the background
  - Will be automatically killed once build is finished
- Up to date checking of inputs

## Examples

*NOTE: The examples include casker from the dist directory whereas a normal project would just import 'casker'.*

See examples of different features and setups [here](examples). 

They are also used for full [functional testing](tests) of features.

## API

Typescript definitions can be found [here](./src/casker.ts#L8).

### task(name, cmd, [options])

#### name

The name of this task used for running from the command line.

#### cmd

The command the task will run, the same as if creating a task with npm scripts.

#### options

##### env
Override environment variables.

##### runInBackground
Casker will start this task process then immediately continue on to the next task 
while allowing this one to run in the background. When all tasks have executed 
tasks run in the background will be killed automatically. Good for starting servers 
to run tests against. 

##### description
Task description that will show up when listing tasks.

##### dependsOn
Sets a dependency for this task that will execute before this task.

##### onExit
Sets a task to run after this task exits regardless of exit code. 
Good for dropping databases after tests.

##### inputs
When the array value is a string it is treated as a glob of files, and the modified timestamp (mtime) 
from [fs.stat](https://nodejs.org/api/fs.html#fs_stat_time_values) to determine if any matching file as changed. 
Otherwise a promise that returns a string or number array can also be defined for custom checking.

##### streamLogs
Normally task output is grouped together for easier reading, but when this is set to true 
the logs will be streamed as they are output from the child process. This is useful for tasks that 
start a dev server for local development or run tests in a watch mode.

### tasksParallel(name, task1, task2, ...)

#### name

The name of this task used for running from the command line.

#### task

Each argument after the name must be a task and will be run in parallel. 
This task will not complete until all tasks complete.

### tasksParallel(name, task1, task2, ...)

#### name

The name of this task used for running from the command line.

#### task

Each argument after the name must be a task and will be run in order. 
This task will not complete until all tasks complete.
