import {Task, TaskInput} from './casker';
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

const resolveInput =
	(cwd: string) =>
		(input: TaskInput): Promise<CacheItems> =>
			typeof input === 'string' ? getGlobFilesModifiedMs(cwd, input) : input();

const resolveInputs = (task: Task): Promise<CacheData> =>
	Promise.all(task.inputs.map(resolveInput(task.cwd)))
		.then(flattenCacheItemArrays)
		.then(inputs => ({inputs}));

/**
 * Check if a task is up to date by retrieving the previous input values and comparing them to the latest input values.
 * Once the latest values are calculated they are stored for the next up to date check.
 *
 * @param {Task} task
 * @return {Promise<boolean>}
 */
export const checkUpToDate = (task: Task): Promise<boolean> =>
	(task.inputs.length)
		? Promise.all([cacheGet(task), resolveInputs(task)])
			.then(([prevData, currentData]) =>
				cachePut(task, currentData)
					.then(() => compareCacheData(prevData, currentData))
			)
		: Promise.resolve(false);
