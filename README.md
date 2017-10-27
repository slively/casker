# builder

A task runner modeled after npm scripts, but with a task dependency graph and easy parallel/serial execution.

## Features

- Simple script execution just like npm 'scripts'
  - Will look for globally installed modules and in the local node_modules/.bin  
- Create task dependencies
- Run tasks in series or parallel
- Multi-Project support
- Typescript support
- API for verifying if a task should run
  - Comes wih file/directory change detection 
