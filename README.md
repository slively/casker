# builder

A task runner modeled after npm scripts, but with a task dependency graph and easy parallel/serial execution.

```
// instal locally in project, then global cli will use local version
npm install -g builder
npm install builder
```

```javascript
import {builder} from 'builder';

const {task} = builder();

const install = task('install', 'npm install', { description: 'Install dependencies' });
const lint = task('lint', 'jshint', {dependsOn: install, description: 'Run jshint' });
task('test', 'jest', {dependsOn: lint, description: 'Run tests' });
```

Tasks are run by name
```
builder test

install started
install output
...
install finished (4.933s)
lint started
lint output
...
lint finished (5.823s)
test started
test output
...
test finished (13.313s)
```

List tasks by running without any arguments
```
builder

Tasks
install - Install dependencies
lint - Run jshint
test - Run tests
```


See [examples](examples) for more.
The [task api](src/builder.ts) is fairly simple and is written in Typescript.

## Features

- Simple script execution just like npm 'scripts'
  - Will look for globally installed modules and in the local node_modules/.bin  
- Create task dependencies
- Run tasks in series or parallel
- Multi-Project support
- Typescript support

## TODO

- Ability to leave tasks running (continuous mode)
- API for verifying if a task should run (up to date checking)
  - Comes wih file/directory change detection 
