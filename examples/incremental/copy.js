#!/usr/bin/env node
require('fs').copyFileSync(process.argv[2], process.argv[3]);
console.log('file copied!');
