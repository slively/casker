import {Task} from './casker';
import {join} from 'path';
import {readFile} from 'fs';
import {config} from './config';
const {outputFile} = require('node-fs-extra');

const getCacheLocation = (task: Task) => join(task.cwd, '.casker', config.version, `${task.name}.json`);
const serialize = (cacheData: CacheData): string => JSON.stringify(cacheData);
const deSerialize = (cacheData: string): CacheData => JSON.parse(cacheData);

export type CacheItems = (string | number)[];

export interface CacheData {
	inputs: CacheItems;
	outputs: CacheItems;
}

export const cachePut = (task: Task, cacheData: CacheData): Promise<CacheData> =>
	new Promise((resolve, reject) => {
		outputFile(
			getCacheLocation(task),
			serialize(cacheData),
			(err?: NodeJS.ErrnoException) => err ? reject(err) : resolve(cacheData)
		);
	});

export const cacheGet = (task: Task): Promise<CacheData> =>
	new Promise((resolve, reject) => {
		readFile(
			getCacheLocation(task),
			(err: NodeJS.ErrnoException, data: Buffer) => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve({inputs: [], outputs: []});
					}

					return reject(err);
				}

				resolve(deSerialize(data.toString()));
			}
		);
	});

const compareCacheItems = (prev: CacheItems, current: CacheItems) => {
	if (prev.length !== current.length) {
		return false;
	}

	for (let i = 0; i < prev.length; i++) {
		if (prev[i] !== current[i]) {
			return false;
		}
	}

	return true;
};

/**
 * Compare previous and current cache data, returns true if they are the equivalent, and false otherwise.
 *
 * @param {CacheData} prevData
 * @param {CacheData} currentData
 * @return {boolean} equivalent
 */
export const compareCacheData = (prevData: CacheData, currentData: CacheData): boolean =>
	compareCacheItems(prevData.inputs, currentData.inputs)
