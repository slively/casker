import {Task, TaskIO} from './casker';
import * as glob from 'glob';
import {stat} from 'fs';
import {CacheData, CacheItems, cacheGet, cachePut, compareCacheData} from './cache';
import {join} from 'path';

const flattenCacheItemArrays = (arr: CacheItems[]): CacheItems => arr.reduce((a, b) => a.concat(b), []);
const statFilesAndGetMTime = (files: string[]): Promise<number[]> =>
	Promise.all(
		files.map(file =>
			new Promise((resolve, reject) => {
				stat(file, (err, stats) =>
					err != null ? reject(err) : resolve(stats.mtime.getTime())
				)
			})
		)
	);

const getGlobFilesModifiedMs = (cwd: string, input: string): Promise<number[]> =>
	new Promise(((resolve, reject) =>
			glob(
				join(cwd, input),
				{stat: true},
				(err: Error, matches: string[]) => {
					if (err != null) {
						return reject(err);
					}

					statFilesAndGetMTime(matches).then(resolve, reject);
				}
			)
	));

const resolveIOCacheItem = (cwd: string) =>
	(input: TaskIO): Promise<CacheItems> => typeof input === 'string' ? getGlobFilesModifiedMs(cwd, input) : input(cwd);

const resolveIOCacheItems = (ios: TaskIO[], cwd: string) =>
	Promise.all(ios.map(resolveIOCacheItem(cwd))).then(flattenCacheItemArrays);

const resolveTaskIOs = (task: Task): Promise<CacheData> =>
	Promise.all([
		resolveIOCacheItems(task.inputs, task.cwd),
		resolveIOCacheItems(task.outputs, task.cwd)
	])
		.then(([inputs, outputs]) => ({inputs, outputs}));

const taskHasIOs = (task: Task) => task.inputs.length || task.outputs.length;

/**
 * Check if a task is up to date by retrieving the previous input values and comparing them to the latest input values.
 * Once the latest values are calculated they are stored for the next up to date check.
 *
 * @param {Task} task
 * @return {Promise<boolean>}
 */
export const checkUpToDate = (task: Task): Promise<boolean> =>
	(taskHasIOs(task))
		? Promise.all([cacheGet(task), resolveTaskIOs(task)])
			.then(([prevData, currentData]) => compareCacheData(prevData, currentData))
		: Promise.resolve(false);

export const saveInputsAndOuputs = (task: Task): Promise<void> =>
	(taskHasIOs(task))
		? resolveTaskIOs(task)
			.then(cacheData => cachePut(task, cacheData))
			.then(() => undefined)
		: Promise.resolve();
