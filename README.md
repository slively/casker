# builder

A task runner modeled after npm scripts

## Features

- Simple script execution just like npm 'scripts'
  - Will look for globally installed modules and in the local node_modules/.bin  
- Create task dependencies
- Run tasks in series or parallel
- Multi-Project support
- Typescript support
- API for verifying if task should run
  - Comes wih file/directory change detection 
