import {readFileSync} from 'fs';
import {join} from 'path';

const version = JSON.parse(readFileSync(join(__dirname, '..', 'package.json')).toString()).version;
export const config = {
	version
};
