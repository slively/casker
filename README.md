# Casker

A task runner modeled after npm scripts, but with a task dependency graph and easy parallel/serial execution.

```
// instal locally in project, then global cli will use local version
npm install -g casker
npm install casker
```

### caskerfile.ts (or caskerfile.js)
```javascript
import {casker} from 'casker';

const {task} = casker();

const install = task('install', 'npm install', { description: 'Install dependencies' });
const lint = task('lint', 'jshint', {dependsOn: install, description: 'Run jshint' });
task('test', 'jest', {dependsOn: lint, description: 'Run tests' });
```

### Run a task
```
casker test

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

### List tasks by running without any arguments
```
casker

Tasks
install - Install dependencies
lint - Run jshint
test - Run tests
```

See [examples](examples) for more.

The [task api](src/casker.ts) is fairly simple and is written in Typescript.

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