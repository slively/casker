import {Task, TaskInput, TaskOutput} from './casker';
import * as glob from 'glob';
import {stat} from 'fs';
import {CacheData, CacheItems, cacheGet, cachePut, compareCacheData} from './cache';

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

const getGlobFilesModifiedMs = (cwd: string, io: string): Promise<number[]> =>
	new Promise(((resolve, reject) =>
			glob(
				io,
				{stat: true, cwd},
				(err: Error, matches: string[]) => {
					if (err != null) {
						return reject(err);
					}

					statFilesAndGetMTime(matches).then(resolve, reject);
				}
			)
	));

const resolveInputOrOutput =
	(cwd: string) =>
		(io: TaskInput | TaskOutput): Promise<CacheItems> =>
			typeof io === 'string' ? getGlobFilesModifiedMs(cwd, io) : io();

const resolveInputsOrOutputs = (task: Task, ios: TaskInput[] | TaskOutput[]) =>
	Promise.all(ios.map(resolveInputOrOutput(task.cwd))).then(flattenCacheItemArrays);

const resolveInputsAndOutputs = (task: Task): Promise<CacheData> =>
	Promise.all([
		resolveInputsOrOutputs(task, task.inputs),
		resolveInputsOrOutputs(task, task.outputs)
	])
		.then(([inputs, outputs]) => ({inputs, outputs}));

/**
 * Check if a task is up to date by retrieving the previous input/output values and comparing them to the latest input/output values.
 * Once the latest values are calculated they are re-stored for the up to date check.
 *
 * @param {Task} task
 * @return {Promise<boolean>}
 */
export const checkUpToDate = (task: Task): Promise<boolean> =>
	Promise.all([
		cacheGet(task),
		resolveInputsAndOutputs(task)
	])
		.then(([prevData, currentData]) =>
			cachePut(task, currentData)
				.then(() => compareCacheData(prevData, currentData))
		);
